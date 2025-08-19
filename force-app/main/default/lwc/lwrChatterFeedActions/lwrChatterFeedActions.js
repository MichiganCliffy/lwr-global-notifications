import { LightningElement, api } from 'lwc';

export default class LwrChatterFeedActions extends LightningElement {
  sortOptions = [
    { label: 'Latest Posts', value: 'CreatedDateDesc'},
    { label: 'Recent Activity', value: 'LastModifiedDateDesc'}
  ]

  _sortOrder = 'CreatedDateDesc';

  @api
  get sortOrder() {
    return this._sortOrder;
  }
  set sortOrder(value) {
    this._sortOrder = value;
  }

  handleSort(event) {
    let sortEvent = new CustomEvent('sort', {
      detail: event.detail.value
    });

    this.dispatchEvent(sortEvent);
  }

  handleSearch() {
    let searchField = this.template.querySelector('lightning-input');

    let searchEvent = new CustomEvent('search', {
      detail: searchField.value
    });

    this.dispatchEvent(searchEvent);
  }
}