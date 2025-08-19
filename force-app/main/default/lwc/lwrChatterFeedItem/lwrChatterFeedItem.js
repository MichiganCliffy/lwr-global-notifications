import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { fileDeleter } from 'c/lwrChatterUtilities';
import deleteFeedItem from "@salesforce/apex/LwrChatterController.deleteFeedItem";
import feedItemEdit from 'c/lwrChatterFeedItemEdit';

export default class LwrChatterFeedItem extends NavigationMixin(LightningElement) {
  _item = null;
  relativeCreatedDate = '';
  author = '';
  avatar = '';
  header = null;
  body = null;
  capabilities = null;
  showNewComment = true;

  @api chatterPostPage;
  @api mapping;
  @api
  get item() {
    return this._item;
  }
  set item(value) {
    this._item = value;

    if (this._item) {
      this.relativeCreatedDate = this._item.relativeCreatedDate;
      this.header = this._item.header;
      this.body = this._item.body;
      this.capabilities = this._item.capabilities;

      if (this._item.actor) {
        this.author = this._item.actor.displayName;
        
        if (this._item.actor.photo) {
          this.avatar = this._item.actor.photo.mediumPhotoUrl;
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

  handleAvatarClick() {
    this[NavigationMixin.GenerateUrl]({
      type: 'standard__recordPage',
      attributes: {
        recordId: this.item.actor.id,
        objectApiName: this.item.actor.type,
        actionName: 'view'
      }
    }).then((url) => {
      window.location.href = url;
    });
  }

  handleDateClick() {
    this[NavigationMixin.GenerateUrl]({
      type: 'comm__namedPage',
      attributes: {
        name: this.chatterPostPage,
      },
      state: {
        recordId: this.item.id
      }
    }).then((url) => {
      window.location.href = url;
    });
  }

  handleCommentToggle() {
    let commentForm = this.template.querySelector('c-lwr-chatter-comment-new');
    if (commentForm) {
      commentForm.toggleForm();
    }
  }

  handleDelete() {
    this.dispatchEvent(new CustomEvent("update"));
  }

  handleComment() {
    this.dispatchEvent(new CustomEvent("update"));
  }

  handleUpdate() {
    this.showNewComment = true;
    this.dispatchEvent(new CustomEvent("update"));
  }
  
  handleEditToggle(e) {
    this.showNewComment = e.detail.isEditing === false;
  }

  handleSelect(event) {
    switch(event.detail.value) {
      case "Delete":
        this.deletePost();
        break;

      case "Edit":
        this.editPost();
        break;

      default:
        console.error(`Chatter Feed Item Select: Unknown option ${event.detail.value}`);
        break;
    }
  }

  deletePost() {
    let deleter = new fileDeleter();
    deleter.files = this._item.capabilities.files?.items?.map(file => {
      return {
        id: file.id,
        contentDocumentId: file.id,
        name: file.title
      }
    });

    deleter.deleteAll().then(() => {
      deleteFeedItem({feedElementId: this._item.id});

      // eslint-disable-next-line @lwc/lwc/no-async-operation
      setTimeout(() => {
        this.dispatchEvent(new CustomEvent("update"));
      }, 500);
    }).catch((error) => {
      console.error(`Chatter Feed Item: Delete Error ${JSON.stringify(error)}`);
    });
  }

  async editPost() {
    await feedItemEdit.open({
      size: 'small',
      description: 'edit this post',
      item: this._item
    }).then((result) => {
      if (result) {
        this.dispatchEvent(new CustomEvent("update"));
      }
    })
  }
}