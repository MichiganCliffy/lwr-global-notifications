import { LightningElement, api } from 'lwc';
import likeFeedElement from "@salesforce/apex/LwrChatterController.likeFeedElement";
import unlikeFeedElement from "@salesforce/apex/LwrChatterController.unlikeFeedElement";

export default class LwrChatterFeedItemActions extends LightningElement {
  _item = null;
  hasLiked = false;

  @api
  get item() {
    return this._item;
  }
  set item(value) {
    this._item = value;

    if (this._item) {
      this.hasLiked = this._item?.capabilities?.chatterLikes?.isLikedByCurrentUser;
    }
  }

  get likedLabel() {
    if (this.hasLiked) {
      return 'Liked';
    }

    return 'Like';
  }

  renderedCallback() {
    let likeButton = this.template.querySelector('.like-action');
    if (likeButton) {
      if (this.hasLiked) {
        likeButton.classList.add('slds-is-active');
      } else {
        likeButton.classList.remove('slds-is-active');
      }
    }
  }

  handleLikeClick() {
    if (this.hasLiked) {
      unlikeFeedElement({feedElementId: this._item.id});
      this.hasLiked = false;
    } else {
      likeFeedElement({feedElementId: this._item.id});
      this.hasLiked = true;
    }
  }

  handleCommentClick() {
    this.dispatchEvent(new CustomEvent("comment"));
  }
}