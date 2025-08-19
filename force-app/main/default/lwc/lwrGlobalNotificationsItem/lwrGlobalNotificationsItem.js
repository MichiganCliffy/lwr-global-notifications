import { LightningElement, api } from 'lwc';

export default class LwrGlobalNotificationsItem extends LightningElement {
  @api notification;

  labels = {
    Unread: 'Unread Notifications'
  };

  get hasTitle() {
    return ( !this.isEmptyString(this.notification.messageTitle) );
  }

  get hasAvatar() {
    return ( !this.isEmptyString(this.notification.image) );
  }

  get hasIcon() {
    return ( !this.isEmptyString(this.notification.icon) );
  }

  get avatar() {
    return this.notification.image;
  }

  get isUnread() {
    return !this.notification.read;
  }

  handleClick(e) {
    e.preventDefault();

    let navigationEvent = new CustomEvent(
      "navigation",
      {
        detail: {
          notification: this.notification
        },
        bubbles: true,
        composed: true
      }
    );

    this.dispatchEvent(navigationEvent);
  }

  handleKeyPress(e) {
    if(e.key === 'Enter'){
      this.handleClick(e);
    }
  }

  isEmptyString(inputString) {
    return (
      ( inputString === undefined ) ||
      ( inputString === null ) ||
      ( typeof inputString === 'string' && inputString.trim() === '' )
    );
  }
}