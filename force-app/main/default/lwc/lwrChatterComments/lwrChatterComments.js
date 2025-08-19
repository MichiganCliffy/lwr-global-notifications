import { LightningElement, api, track } from 'lwc';
import getFeedItemComments from "@salesforce/apex/LwrChatterController.getFeedItemComments";

export default class LwrChatterComments extends LightningElement {
  _item = null;
  comments = 0;
  @track items = [];
  nextToken = null;

  @api
  get item() {
    return this._item;
  }
  set item(value) {
    this._item = value;

    if (this._item) {
      if (this._item.capabilities) {
        if (this._item.capabilities.comments) {
          this.comments = this._item.capabilities.comments.page.total;
          this.items = this._item.capabilities.comments.page.items;
          this.nextToken = this._item.capabilities.comments.page.nextPageToken;
        }
      }
    }
  }

  get hasComments() {
    return this.comments > 0;
  }

  get count() {
    return this.items.length;
  }

  get hasMore() {
    return this.nextToken != null;
  }

  handleDelete() {
    this.dispatchEvent(new CustomEvent('delete'));
  }

  handleUpdate() {
    this.dispatchEvent(new CustomEvent('update'));
  }

  handleEditToggle(e) {
    this.dispatchEvent(new CustomEvent('edittoggle', { detail: { isEditing: e.detail.isEditing } }));
  }

  handleMoreClick() {
    getFeedItemComments({
      feedElementId: this._item.id,
      pageParam: this.nextToken
    }).then((results) => {
      this.nextToken = results.nextPageToken;
      let comments = [...this.items, ...results.items];
      this.items = comments;
    }).catch((error) => {
      console.error(`Chatter Comments: Error loading more comments - ${JSON.stringify(error)}`);
    });
  }
}