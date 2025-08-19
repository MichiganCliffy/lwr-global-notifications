import { LightningElement, api, track } from 'lwc';
import { debounce, removeHtml, renderMessageSegments, renderMessageMentions } from 'c/lwrChatterUtilities';
import updateComment from "@salesforce/apex/LwrChatterController.updateComment";

export default class LwrChatterCommentEdit extends LightningElement {
  _item = null;
  emptyComment = true;
  saving = false;
  mentionLookup = null;
  @track files = [];
  comment = '';
  mentions = new Map();

  @api
  get item() {
    return this._item;
  }
  set item(value) {
    this._item = value;

    if (this._item) {
      this.comment = renderMessageSegments(this._item.body.messageSegments, true);
      this.mentions = renderMessageMentions(this._item.body.messageSegments);

      if (this._item.capabilities?.content?.id) {
        let file = {
          id: this._item.capabilities.content.id,
          name: this._item.capabilities.content.title
        }
        this.files = [file];
      }
    }
  }

  renderedCallback() {
    this.mentionLookup = this.template.querySelector('c-lwr-chatter-mention-lookup');
  }

  handleCancel() {
    this.dispatchEvent(new CustomEvent('cancel'));
  }

  handleCommentChange() {
    let commentField = this.template.querySelector('lightning-input-rich-text');
    if (commentField) {
      if ((commentField.value === this.comment) || (removeHtml(commentField.value).length === 0)) {
        this.emptyComment = true;
      } else {
        this.emptyComment = false;
      }

      if (!this.emptyComment) {
        this.callMentionLookup(commentField.value);
      }
    }
  }

  callMentionLookup = debounce((searchTerm) => {
    this.mentionLookup.searchTerm = searchTerm;
  }, 300)

  async handleUpdate() {
    let commentField = this.template.querySelector('lightning-input-rich-text');
    
    if (commentField) {
      this.saving = true;
      this.emptyComment = true;
      let comment = this.mentionLookup.mapMentions(commentField.value);
      let params = {
        feedCommentId: this._item.id,
        comment: comment,
        contentDocumentId: null
      };

      // Cannot update the content document associated with a comment
      // if (this.files.length) {
      //   params.contentDocumentId = this.files[0].id;
      // }

      this.saveComment(params);
    }
  }

  saveComment(params) {
    updateComment(params).then(results => {
      this.dispatchEvent(new CustomEvent("update", { detail: JSON.parse(JSON.stringify(results)) }));
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
}