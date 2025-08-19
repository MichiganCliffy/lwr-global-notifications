import { LightningElement, api } from 'lwc';

export default class LwrGlobalNotificationsPanel extends LightningElement {
  _notifications = [];
  isVisible = false;
  isLoading = false;
  closeButton;
  markReadLink;
  trap;
  list;
  labels = {
    Title: 'Notifications',
    MarkAsRead: 'Mark all as Read',
    NoNotifications: 'You do not have any notifications',
    Close: 'Close',
    Loading: 'Loading'
  };

  @api
  get notifications() {
    return this._notifications;
  }
  set notifications(value) {
    this._notifications = value;
  }

  @api leftAlign = false;

  get hasUnread() {
    let unreadCount = this.notifications.reduce((count, notification) => {
      return ( notification.read === false ) ? count + 1 : count;
    }, 0);

    return (unreadCount > 0);
  }

  get hasNotifications() {
    return ( this.notifications.length > 0 );
  }

  get cssClasses() {
    let output = 'notifications slds-dropdown slds-dropdown_large ';
    output += (this.leftAlign) ? 'slds-dropdown_left slds-nubbin_top-left' : 'slds-dropdown_right slds-nubbin_top-right';
    return output;
  }

  connectedCallback() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  renderedCallback(){
    this.markReadLink = this.template.querySelector('.notifications-markread');
    this.closeButton = this.template.querySelector('.notifications-close');
    this.trap = this.template.querySelector('.trap');
    this.list = this.template.querySelector('.notifications__list');
  }

  @api loading() {
    this.isVisible = true;
    this.isLoading = true;
  }

  @api loaded() {
    this.isVisible = true;
    this.isLoading = false;
    if (this.closeButton) {
      this.closeButton.focus();
    }
  }

  @api close() {
    this.isVisible = false;
  }

  handleMarkAllAsRead() {
    this.dispatchEvent(new CustomEvent("markallread"));

    let notifications = JSON.parse(JSON.stringify(this.notifications));
    notifications.forEach((notification) => {
      notification.read = true;
    });
    this._notifications = notifications;
  }

  handleClose() {
    this.dispatchEvent(new CustomEvent("close"));
  }

  handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.handleClose();
    } else if (e.key === 'Tab') {
      if (this.hasNotifications) {
        if (e.shiftKey && this.template.activeElement === this.markReadLink && this.trap) {
          e.preventDefault();
          this.trap.focus();
        } else if (!e.shiftKey && this.template.activeElement === this.trap && this.markReadLink) {
          e.preventDefault();
          this.markReadLink.focus();
        }
      } else {
        if (e.shiftKey && this.template.activeElement === this.closeButton && this.trap) {
          e.preventDefault();
          this.trap.focus();
        } else if (!e.shiftKey && this.template.activeElement === this.trap && this.closeButton) {
          e.preventDefault();
          this.closeButton.focus();
        }
      }
    } else if (this.template.activeElement === this.markReadLink && (e.key === ' ' || e.key === 'Enter')){
      this.handleMarkAllAsRead();
    }
  }

  handleScroll() {
    if (this.isTrapVisible()) {
      this.dispatchEvent(new CustomEvent("loadmore"));
    }
  }

  isTrapVisible() {
    let trapTop = this.trap.offsetTop;
    let trapBottom = trapTop + this.trap.clientHeight;

    let containerTop = this.list.scrollTop;
    let containerBottom = containerTop + this.list.clientHeight;

    // The element is fully visible in the container
    return (
      (trapTop >= containerTop && trapBottom <= containerBottom) ||
      // Some part of the element is visible in the container
      (trapTop < containerTop && containerTop < trapBottom) ||
      (trapTop < containerBottom && containerBottom < trapBottom)
    );
  }
}