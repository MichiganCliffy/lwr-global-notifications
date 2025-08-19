import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { subscribe, unsubscribe, MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import lwrChatterFeedNotification from '@salesforce/messageChannel/lwrChatterFeedNotification__c';
import { isEmptyString } from 'c/lwrChatterUtilities';
import getRecordFeed from "@salesforce/apex/LwrChatterController.getRecordFeed";
import searchRecordFeed from "@salesforce/apex/LwrChatterController.searchRecordFeed";

export default class LwrChatterRecordFeed extends LightningElement {
  _recordId = null;
  feed = null;
  mapping = null;
  @api chatterPostPage;
  pageToken = null;
  nextPageToken = null;
  pageSize = 10;
  sortOrder = 'CreatedDateDesc';
  searchTerm = null;
  subscription = null;

  @track items = [];

  get hasMore() {
    return this.nextPageToken != null;
  }

  @api
  get recordId() {
    return this._recordId;
  }
  set recordId(value) {
    this._recordId = value;
  }

  @wire(CurrentPageReference)
  getPageReferenceParameters(currentPageReference) {
    if (currentPageReference) {
      this._recordId = currentPageReference.attributes.recordId || this._recordId;
    }
  }

  @wire(MessageContext)
  messageContext;

  connectedCallback() {
    this.loadFeed();

    if (!this.subscription) {
      this.subscription = subscribe(this.messageContext, lwrChatterFeedNotification, (action) => {
        if (action.action === 'RefreshFeed') {
          this.resetLoad();
          this.doLoad();
        }
      }, { scope: APPLICATION_SCOPE });
    }
  }

  disconnectedCallback() {
    if (this.subscription) {
      unsubscribe(this.subscription);
      this.subscription = null;
    }
  }

  handleUpdate(event) {
    event.stopPropagation();

    this.resetLoad();
    this.doLoad();
  }

  loadFeed() {
    let params = {
      recordId: this._recordId,
      pageToken: this.pageToken,
      pageSize: this.pageSize,
      sortOrder: this.sortOrder
    }
    console.debug(`Loading Feed: ${JSON.stringify(params)}`);

    getRecordFeed(params).then(results => {
      this.feed = results.feed;
      this.mapping = results.mapping;
      this.nextPageToken = this.feed.nextPageToken;

      let items = [...this.items, ...this.feed.elements];
      this.items = items;
      console.debug(JSON.stringify(results));
    }).catch(error => {
      console.error(`Chatter Record Feed Get Exception: ${JSON.stringify(error)}`);
    })
  }

  searchFeed() {
    let params = {
      recordId: this._recordId,
      searchTerm: this.searchTerm,
      pageToken: this.pageToken,
      pageSize: this.pageSize,
      sortOrder: this.sortOrder
    }
    console.debug(`Searching Feed: ${JSON.stringify(params)}`);

    searchRecordFeed(params).then(results => {
      this.feed = results.feed;
      this.mapping = results.mapping;
      this.nextPageToken = this.feed.nextPageToken;

      let items = [...this.items, ...this.feed.elements];
      this.items = items;
      console.debug(JSON.stringify(results));
    }).catch(error => {
      console.error(`Chatter Record Feed Search Exception: ${JSON.stringify(error)}`);
    })
  }

  handleSearch(event) {
    this.searchTerm = event.detail;

    this.resetLoad();
    this.doLoad();
  }

  handleSort(event) {
    this.sortOrder = event.detail;

    this.resetLoad();
    this.doLoad();
  }

  handleLoadMore() {
    this.pageToken = this.nextPageToken;
    this.nextPageToken = null;

    this.doLoad();
  }

  resetLoad() {
    this.items = [];
    this.pageToken = null;
  }

  doLoad() {
    if (isEmptyString(this.searchTerm)) {
      this.loadFeed();
    } else {
      this.searchFeed();
    }
  }
}