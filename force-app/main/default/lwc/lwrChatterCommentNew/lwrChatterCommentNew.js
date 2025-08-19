import { LightningElement, api, track } from 'lwc';
import { debounce, removeHtml, fileUploader } from 'c/lwrChatterUtilities';
import fileUpload from 'c/lwrChatterFileUpload';
import commentOnFeedElement from "@salesforce/apex/LwrChatterController.commentOnFeedElement";

export default class LwrChatterCommentNew extends LightningElement {
  showCommentForm = false;
  emptyComment = true;
  saving = false;
  @api feedItemId;
  mentionLookup = null;
  @track files = [];

  get hasFiles() {
    return this.files.length > 0;
  }

  @api
  toggleForm() {
    this.handleCommentToggle();
  }

  renderedCallback() {
    this.mentionLookup = this.template.querySelector('c-lwr-chatter-mention-lookup');
  }

  handleCommentToggle() {
    this.showCommentForm = true;

    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      let commentField = this.template.querySelector('lightning-input-rich-text');
      if (commentField) {
        commentField.focus();
      }
    }, 300);
  }

  handleCommentChange() {
    let commentField = this.template.querySelector('lightning-input-rich-text');
    if (commentField) {
      this.emptyComment = removeHtml(commentField.value).length === 0;

      if (!this.emptyComment) {
        this.callMentionLookup(commentField.value);
      }
    }
  }

  callMentionLookup = debounce((searchTerm) => {
    this.mentionLookup.searchTerm = searchTerm;
  }, 300)

  async handleCommentSubmit() {
    let commentField = this.template.querySelector('lightning-input-rich-text');
    
    if (commentField) {
      this.saving = true;
      this.emptyComment = true;
      let comment = this.mentionLookup.mapMentions(commentField.value);
      let params = {
        feedElementId: this.feedItemId,
        comment: comment,
        contentDocumentId: null
      };

      if (this.files.length > 0) {
        let uploader = new fileUploader(this.files);
        uploader.upload().then((results) => {
          params.contentDocumentId = results[0].contentDocumentId;
          this.saveComment(commentField, params);
        }).catch((error) => {
          this.saving = false;
          this.emptyComment = false;
          console.error(`New Chatter Comment Error: ${JSON.stringify(error)}`);
        });
      } else {
        this.saveComment(commentField, params);
      }
    }
  }

  saveComment(commentField, params) {
    commentOnFeedElement(params).then(results => {
      commentField.value = '';
      this.showCommentForm = false;

      const commentEvent = new CustomEvent("comment", { detail: JSON.parse(JSON.stringify(results)) });
      this.dispatchEvent(commentEvent);
    }).catch(error => {
      this.emptyComment = false;
      console.error(`New Chatter Comment Error: ${JSON.stringify(error)}`);
    }).finally(() => {
      this.saving = false;
    });
  }

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
      description: 'attach files to this comment',
      multiple: false
    }).then((result) => {
      if (result?.action === 'done') {
        let files = [...this.files,...result.files];
        this.files = files;
      }
    })
  }

  handleFileRemove(event) {
    let id = event.target.dataset.id;
    let files = this.files.filter((file) => {
      return file.id !== id;
    });
    this.files = files;
  }
}