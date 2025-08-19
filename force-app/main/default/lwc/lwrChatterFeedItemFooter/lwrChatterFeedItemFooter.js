import { LightningElement, api } from 'lwc';

export default class LwrChatterFeedItemFooter extends LightningElement {
  _item = null;
  views = 0;
  comments = 0;

  @api
  get item() {
    return this._item;
  }
  set item(value) {
    this._item = value;

    if (this._item) {
      if (this._item.capabilities) {
        if (this._item.capabilities.interactions) {
          this.views = this._item.capabilities.interactions.count;
        }

        if (this._item.capabilities.comments) {
          this.comments = this._item.capabilities.comments.page.total;
        }
      }
    }
  }

  get hasViews() {
    return this.views > 0;
  }

  get hasComments() {
    return this.comments > 0;
  }
}