import { api, track } from 'lwc';
import LightningModal from 'lightning/modal';
import { debounce, removeHtml, renderMessageSegments, renderMessageMentions, fileUploader, fileDeleter } from 'c/lwrChatterUtilities';
import updatePost from "@salesforce/apex/LwrChatterController.updatePost";
import fileUpload from 'c/lwrChatterFileUpload';

const MAX_ATTACHMENTS = 10;

export default class LwrChatterFeedItemEdit extends LightningModal {
  _item = null;
  saving = false;
  hasChanged = false;
  mentionLookup = null;
  @track files = [];
  comment = '';
  mentions = new Map();
  filesToDelete = new fileDeleter();

  @api
  get item() {
    return this._item;
  }
  set item(value) {
    this._item = value;

    if (this._item) {
      this.comment = renderMessageSegments(this._item.body.messageSegments, true);
      this.mentions = renderMessageMentions(this._item.body.messageSegments);

      if (this._item.capabilities?.files?.items?.length > 0) {
        this.files = this._item.capabilities.files.items.map(file => {
          return {
            id: file.id,
            contentDocumentId: file.id,
            name: file.title
          }
        });
      }
    }
  }

  get saveDisabled() {
    return this.saving || !this.hasChanged;
  }

  get showAttachment() {
    return this.files.length < MAX_ATTACHMENTS;
  }

  get hasAttachments() {
    return this.files.length > 0;
  }

  renderedCallback() {
    this.mentionLookup = this.template.querySelector('c-lwr-chatter-mention-lookup');
  }

  handlePostChange() {
    let postField = this.template.querySelector('lightning-input-rich-text');
    if (postField) {
      if ((removeHtml(postField.value).length === 0) || (postField.value === this.comment)) {
        this.hasChanged = false;
      } else {
        this.hasChanged = true;
      }

      if (this.hasChanged) {
        this.callMentionLookup(postField.value);
      }
    }
  }

  callMentionLookup = debounce((searchTerm) => {
    this.mentionLookup.searchTerm = searchTerm;
  }, 300)

  handleMentionSelect(event) {
    let commentField = this.template.querySelector('lightning-input-rich-text');
    if (commentField) {
      let updatedValue = commentField.value.replace("@" + event.detail.search, event.detail.mention);
      commentField.value = updatedValue;
    }
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

    let file = this.files.find((item) => {
      return item.id === id;
    });
    this.filesToDelete.add(file);

    let files = this.files.filter((item) => {
      return item.id !== id;
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

  handleSave() {
    let postField = this.template.querySelector('lightning-input-rich-text');
    if (postField) {
      this.saving = true;
      this.hasChanged = false;
      let params = {
        feedElementId: this._item.id,
        body: this.mentionLookup.mapMentions(postField.value),
        contentDocumentIds: null
      };

      this.filesToDelete.deleteAll().then(() => {
        let uploader = new fileUploader(this.files);
        uploader.upload().then((results) => {
          params.contentDocumentIds = results.map((item) => {
            return item.contentDocumentId;
          });

          this.savePost(postField, params);
        }).catch((error) => {
          console.error(`Chatter Post Edit Error: ${JSON.stringify(error)}`);
        });
      }).catch((error) => {
        console.error(`Chatter Post Edit Error: ${JSON.stringify(error)}`);
        this.saving = false;
        this.hasChanged = true;
      });
    }
  }

  savePost(postField, params) {
    updatePost(params).then(results => {
      console.debug(`Chatter Post Edit Save Complete: ${JSON.stringify(results)}`);

      postField.value = '';
      this.show = false;
      this.emptyPost = true;

      this.close(true);
    }).catch(error => {
      this.emptyPost = false;
      this.saving = false;
      console.error(`New Chatter Post Error: ${JSON.stringify(error)}`);
    }).finally(() => {
      this.saving = false;
    });
  }
}