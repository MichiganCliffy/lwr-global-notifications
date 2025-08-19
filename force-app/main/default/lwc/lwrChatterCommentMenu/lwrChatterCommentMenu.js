import { LightningElement, api } from 'lwc';

export default class LwrChatterCommentMenu extends LightningElement {
  _item = null;
  _canDelete = false;
  _canEdit = false;

  @api
  get item() {
    return this._item;
  }
  set item(value) {
    this._item = value;
    
    if (this._item) {
      this._canDelete = this._item.isDeleteRestricted === false;

      if (this._item.capabilities) {
        if (this._item.capabilities.edit) {
          this._canEdit = this._item.capabilities.edit.isEditRestricted === false;
        }
      }
    }
  }

  @api
  get canDelete() {
    return this._canDelete;
  }
  
  @api
  get canEdit() {
    return this._canEdit;
  }

  get show() {
    return this.canDelete || this.canEdit;
  }

  handleMenuSelect(event) {
    this.dispatchEvent(new CustomEvent('select', {
      detail: event.detail
    }));
  }
}