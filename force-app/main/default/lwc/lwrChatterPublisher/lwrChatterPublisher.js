import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { broadcastFeedUpdate, debounce, removeHtml, fileUploader } from 'c/lwrChatterUtilities';
import createPost from "@salesforce/apex/LwrChatterController.createPost";
import fileUpload from 'c/lwrChatterFileUpload';

const MAX_ATTACHMENTS = 10;

export default class LwrChatterPublisher extends LightningElement {
  _recordId;
  objectApiName;
  objectName;
  show = false;
  saving = false;
  emptyPost = true;
  mentionLookup = null;
  files = [];

  @api
  get recordId() {
    return this._recordId;
  }
  set recordId(value) {
    this._recordId = value;
  }

  get showAttachment() {
    return this.files.length < MAX_ATTACHMENTS;
  }

  get hasAttachments() {
    return this.files.length > 0;
  }

  get attachmentLimit() {
    return MAX_ATTACHMENTS;
  }

  @wire(CurrentPageReference)
  getPageReferenceParameters(currentPageReference) {
    if (currentPageReference) {
      this._recordId = currentPageReference.attributes.recordId || this._recordId;
      this.objectApiName = currentPageReference.attributes.objectApiName || null;
    }
  }

  @wire(getObjectInfo, { objectApiName: "$objectApiName" })
  objectInfo({ error, data }) {
    if (data) {
      this.objectName = data.label;
    } else if (error) {
      this.objectName = 'Unknown';
      console.error(`Chatter Publisher GetObjectInfo error: ${JSON.stringify(error)}`);
    }
  }

  renderedCallback() {
    this.mentionLookup = this.template.querySelector('c-lwr-chatter-mention-lookup');
  }

  handlePostToggle() {
    this.show = true;

    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      let postField = this.template.querySelector('lightning-input-rich-text');
      if (postField) {
        postField.focus();
      }
    }, 300);
  }

  handlePostChange() {
    let postField = this.template.querySelector('lightning-input-rich-text');
    if (postField) {
      this.emptyPost = removeHtml(postField.value).length === 0;

      if (!this.emptyPost) {
        this.callMentionLookup(postField.value);
      }
    }
  }

  callMentionLookup = debounce((searchTerm) => {
    this.mentionLookup.searchTerm = searchTerm;
  }, 300)

  handleMentionSelect(event) {
    let postField = this.template.querySelector('lightning-input-rich-text');
    if (postField) {
      postField.value = postField.value.replace("@" + event.detail.search, event.detail.mention);
    }
  }

  handlePostSubmit() {
    let postField = this.template.querySelector('lightning-input-rich-text');
    if (postField) {
      this.saving = true;
      this.emptyPost = true;
      let params = {
        subjectId: this._recordId,
        body: this.mentionLookup.mapMentions(postField.value),
        contentDocumentIds: null
      };

      if (this.files.length > 0) {
        let uploader = new fileUploader(this.files);
        uploader.upload().then((results) => {
          params.contentDocumentIds = results.map((item) => {
            return item.contentDocumentId;
          });
          this.savePost(postField, params);
        }).catch((error) => {
          this.saving = false;
          console.error(`New Chatter Post Error: ${JSON.stringify(error)}`);
        });
      } else {
        this.savePost(postField, params);
      }
    }
  }

  savePost(postField, params) {
    createPost(params).then(results => {
      postField.value = '';
      this.show = false;
      this.emptyPost = true;

      const postEvent = new CustomEvent("post", { detail: JSON.parse(JSON.stringify(results)) });
      this.dispatchEvent(postEvent);

      broadcastFeedUpdate();
    }).catch(error => {
      this.emptyPost = false;
      this.saving = false;
      console.error(`New Chatter Post Error: ${JSON.stringify(error)}`);
    }).finally(() => {
      this.saving = false;
    });
  }

  async handleFileAttach() {
    await fileUpload.open({
      size: 'small',
      description: 'attach files to this post',
      multiple: true
    }).then((result) => {
      if (result?.action === 'done') {
        let files = [...this.files, ...result.files];
        this.files = files;

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
          let sections = this.template.querySelectorAll('.slds-publisher-attachments');
          sections.forEach((section) => {
            let toogleWarning = this.files.length > MAX_ATTACHMENTS;
            if (toogleWarning) {
              section.classList.add('overlimit');
            } else {
              section.classList.remove('overlimit');
            }
          });
        }, 100);
      }
    })
  }

  handleFileRemove(event) {
    let id = event.target.dataset.id;
    let files = this.files.filter((file) => {
      return file.id !== id;
    });
    this.files = files;

    let sections = this.template.querySelectorAll('.slds-publisher-attachments');
    sections.forEach((section) => {
      let toogleWarning = this.files.length > MAX_ATTACHMENTS;
      if (!toogleWarning) {
        section.classList.remove('overlimit');
      }
    });
  }
}