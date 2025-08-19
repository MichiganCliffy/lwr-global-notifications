import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getFeedItem from "@salesforce/apex/LwrChatterController.getFeedItem";

export default class LwrChatterPost extends LightningElement {
  _recordId = null;
  feedItem = null;
  mapping = null;
  @api chatterPostPage;

  @api
  get recordId() {
    return this._recordId;
  }
  set recordId(value) {
    this._recordId = value;
  }

  get hasRecord() {
    return this.feedItem != null;
  }

  @wire(CurrentPageReference)
  getPageReferenceParameters(currentPageReference) {
    if (currentPageReference) {
      this._recordId = currentPageReference.attributes.recordId || this._recordId;
    }
  }

  connectedCallback() {
    if (this._recordId) {
      getFeedItem({feedElementId: this._recordId}).then(results => {
        this.feedItem = results.feedElement;
        this.mapping = results.mapping;
      }).catch(error => {
        console.error(`Chatter Post Exception: ${JSON.stringify(error)}`);
      })
    }
  }

}