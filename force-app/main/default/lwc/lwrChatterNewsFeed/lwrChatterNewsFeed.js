import { LightningElement, api, wire , track} from 'lwc';
import { subscribe, unsubscribe, MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import lwrChatterFeedNotification from '@salesforce/messageChannel/lwrChatterFeedNotification__c';
import { isEmptyString } from 'c/lwrChatterUtilities';
import getNewsFeed from "@salesforce/apex/LwrChatterController.getNewsFeed";
import searchNewsFeed from "@salesforce/apex/LwrChatterController.searchNewsFeed";

export default class LwrChatterNewsFeed extends LightningElement {
  feed = null;
  mapping = null;
  @api chatterPostPage;
  pageToken = null;
  nextPageToken = null;
  pageSize = 10;
  sortOrder = 'CreatedDateDesc';
  searchTerm = null;

  @track items = [];

  get hasMore() {
    return this.nextPageToken != null;
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

  handleUpdate() {
    this.resetLoad();
    this.doLoad();
  }

  loadFeed() {
    let params = {
      pageToken: this.pageToken,
      pageSize: this.pageSize,
      sortOrder: this.sortOrder
    }
    console.debug(`Loading Feed: ${JSON.stringify(params)}`);

    getNewsFeed(params).then(results => {
      this.feed = results.feed;
      this.mapping = results.mapping;
      this.nextPageToken = this.feed.nextPageToken;

      let items = [...this.items, ...this.feed.elements];
      this.items = items;
      console.debug(JSON.stringify(results));
    }).catch(error => {
      console.error(`Chatter News Feed Get Exception: ${JSON.stringify(error)}`);
    })
  }

  searchFeed() {
    let params = {
      searchTerm: this.searchTerm,
      pageToken: this.pageToken,
      pageSize: this.pageSize,
      sortOrder: this.sortOrder
    }
    console.debug(`Searching Feed: ${JSON.stringify(params)}`);

    searchNewsFeed(params).then(results => {
      this.feed = results.feed;
      this.mapping = results.mapping;
      this.nextPageToken = this.feed.nextPageToken;

      let items = [...this.items, ...this.feed.elements];
      this.items = items;
      console.debug(JSON.stringify(results));
    }).catch(error => {
      console.error(`Chatter News Feed Search Exception: ${JSON.stringify(error)}`);
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