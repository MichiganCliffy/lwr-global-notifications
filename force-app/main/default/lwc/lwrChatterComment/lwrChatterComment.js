import { LightningElement, api } from 'lwc';

export default class LwrChatterComment extends LightningElement {
  @api item;
  isEdit = false;

  handleDelete() {
    this.dispatchEvent(new CustomEvent("delete"));
  }

  handleEdit() {
    this.isEdit = true;
    this.dispatchEvent(new CustomEvent('edittoggle', { detail: { isEditing: true } }));
  }

  handleCancel() {
    this.isEdit = false;
    this.dispatchEvent(new CustomEvent('edittoggle', { detail: { isEditing: false } }));
  }

  handleUpdate() {
    this.isEdit = false;
    this.dispatchEvent(new CustomEvent("update"));
  }
}