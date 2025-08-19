import { LightningElement, api } from 'lwc';
import bookmarkOnFeedItem from "@salesforce/apex/LwrChatterController.bookmarkOnFeedItem";
import removeBookmarkOnFeedItem from "@salesforce/apex/LwrChatterController.removeBookmarkOnFeedItem";
import muteFeedItem from "@salesforce/apex/LwrChatterController.muteFeedItem";
import unmuteFeedItem from "@salesforce/apex/LwrChatterController.unmuteFeedItem";

export default class LwrChatterFeedItemMenu extends LightningElement {
  _item = null;
  _canDelete = false;
  _canEdit = false;
  isBookmarked = false;
  isMuted = false;

  @api
  get item() {
    return this._item;
  }
  set item(value) {
    this._item = value;

    if (this._item) {
      this._canDelete = this._item.isDeleteRestricted === false;

      if (this._item.capabilities) {
        if (this._item.capabilities.bookmarks) {
          this.isBookmarked = this._item.capabilities.bookmarks.isBookmarkedByCurrentUser;
        }

        if (this._item.capabilities.edit) {
          this._canEdit = this._item.capabilities.edit.isEditRestricted === false;
        }

        if (this._item.type === 'CreateRecordEvent') {
          this._canEdit = false;
        }

        if (this._item.capabilities.mute) {
          this.isMuted = this._item.capabilities.mute.isMutedByMe;
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

  @api
  get bookmarkLabel() {
    return (this.isBookmarked) ? 'Remove Bookmark' : 'Bookmark';
  }

  @api
  get muteLabel() {
    return (this.isMuted) ? 'Unmute' : 'Mute';
  }

  handleMenuSelect(event) {
    let option = event.detail.value;
    if ((option === 'Edit') || (option === 'Delete')) {
      this.dispatchEvent(new CustomEvent('select', { detail: event.detail }));
    } else {
      switch(option) {
        case 'Bookmark':
          this.handleBookmark();
          break;

        case 'Mute':
          this.handleMute();
          break;

        default:
          console.error(`Chatter Feed Item Menu: Unknown option: ${option}`);
      }
    }
  }

  handleBookmark() {
    let params = {
      feedElementId: this._item.id
    };

    if (this.isBookmarked) {
      removeBookmarkOnFeedItem(params);
      this.isBookmarked = false;
    } else {
      bookmarkOnFeedItem(params);
      this.isBookmarked = true;
    }
  }

  handleMute() {
    let params = {
      feedElementId: this._item.id
    };

    if (this.isMuted) {
      unmuteFeedItem(params);
      this.isMuted = false;
    } else {
      muteFeedItem(params);
      this.isMuted = true;
    }
  }
}