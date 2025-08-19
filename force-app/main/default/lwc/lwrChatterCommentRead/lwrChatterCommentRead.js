import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';
import likeComment from "@salesforce/apex/LwrChatterController.likeComment";
import unlikeComment from "@salesforce/apex/LwrChatterController.unlikeComment";
import deleteComment from "@salesforce/apex/LwrChatterController.deleteComment";

export default class LwrChatterCommentRead extends NavigationMixin(LightningElement) {
  _item = null;
  relativeCreatedDate = '';
  author = '';
  avatar = '';
  hasLiked = false;
  body = null;
  capabilities = null;
  deleting = false;

  @api
  get item() {
    return this._item;
  }
  set item(value) {
    this._item = value;

    if (this._item) {
      this.relativeCreatedDate = this._item.relativeCreatedDate;
      this.body = this._item.body;
      this.capabilities = this._item.capabilities;

      this.hasLiked = this._item.myLike != null;

      if (this._item.user) {
        this.author = this._item.user.displayName;
        
        if (this._item.user.photo) {
          this.avatar = this._item.user.photo.mediumPhotoUrl;
        }
      }
    }
  }

  get hasAvatar() {
    return this.avatar.length > 0;
  }

  get avatarTitle() {
    return `${this.author} avatar`;
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

  handleAuthorClick() {
    this[NavigationMixin.GenerateUrl]({
      type: 'standard__recordPage',
      attributes: {
        recordId: this.item.user.id,
        objectApiName: this.item.user.type,
        actionName: 'view'
      }
    }).then((url) => {
      window.location.href = url;
    });
  }

  handleLikeClick() {
    if (this.hasLiked) {
      unlikeComment({commentId: this._item.id});
      this.hasLiked = false;
    } else {
      likeComment({commentId: this._item.id});
      this.hasLiked = true;
    }
  }

  handleMenuSelect(event) {
    switch(event.detail.value) {
      case "Delete":
        this.deleteComment();
        break;

      case "Edit":
        this.dispatchEvent(new CustomEvent("edit"));
        break;

      default:
        console.error(`Chatter Comment: Unknown option ${event.detail.value}`);
        break;
    }
  }

  deleteComment() {
    this.deleting = true;

    if (this._item.capabilities?.content?.id) {
      // there is a file attached to this comment, let's delete it as well
      deleteRecord(this._item.capabilities.content.id).then(() => {
        deleteComment({feedCommentId: this._item.id}).then(() => {
          this.deleting = false;
          this.dispatchEvent(new CustomEvent("delete"));
        }).catch((error) => {
          console.error(`Chatter Comment Delete Error: ${JSON.stringify(error)}`);
          this.deleting = false;
        });
      }).catch((error) => {
        console.error(`Chatter Comment Delete Error: ${JSON.stringify(error)}`);
        this.deleting = false;
      });
    } else {
      deleteComment({feedCommentId: this._item.id}).then(() => {
        this.deleting = false;
        this.dispatchEvent(new CustomEvent("delete"));
      }).catch((error) => {
        console.error(`Chatter Comment Delete Error: ${JSON.stringify(error)}`);
        this.deleting = false;
      });
    }
  }
}