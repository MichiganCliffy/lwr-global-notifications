import { LightningElement, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getStatus from "@salesforce/apex/LwrNotificationsController.getStatus";
import getNotifications from "@salesforce/apex/LwrNotificationsController.getNotifications";
import getMoreNotifications from "@salesforce/apex/LwrNotificationsController.getMoreNotifications";
import setNotificationAsRead from "@salesforce/apex/LwrNotificationsController.setNotificationAsRead";
import setNotificationAsSeen from "@salesforce/apex/LwrNotificationsController.setNotificationAsSeen";

const SESSION_KEY = 'notificationsStatus';
const RELOAD = 300; // reload notification status every 5 minutes, or 300 seconds

export default class LwrGlobalNotifications extends NavigationMixin(LightningElement) {
  unseen = 0;
  open = false;

  @api leftAlign = false;
  @api chatterPostPage;

  @track notifications = [];
  notificationsQueue = [];

  connectedCallback() {
    this.loadStatus();
  }

  loadStatus() {
    if (!this.loadStatusFromSession()) {
      this.loadStatusFromApex();
    }
  }

  loadStatusFromSession() {
    let sessionItem = window.sessionStorage.getItem(SESSION_KEY);
    if (sessionItem) {
      let sessionValue = JSON.parse(sessionItem);
      let timestamp = Number(sessionValue.timestamp);
      let elapsed = Date.now() - timestamp;

      console.debug(`Global Notifications: Session timestamp ${timestamp}, elapsed time ${elapsed}`);
      if (Math.floor(elapsed / 1000) < RELOAD) {
        // within time frame, use session value
        console.debug('Global Notifications: Loading status from session');
        this.unseen = sessionValue.data.unseenCount;
        return true;
      }
    }

    return false;
  }

  saveStatusToSession(response) {
    let sessionItem = {
      timestamp: Date.now().toString(),
      data: response
    };

    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionItem));
  }

  loadStatusFromApex() {
    console.debug('Global Notifications: Loading status from apex');
    getStatus().then(response => {
      this.statusSuccess(response);
    }).catch(error => {
      this.statusFailure(error);
    });
  }

  notificationsSuccess(response) {
    if (response.notifications) {
      if (response.notifications.length > 10) {
        this.notificationsQueue = JSON.parse(JSON.stringify(response.notifications));
        this.notifications = this.notificationsQueue.splice(0, 10);
      } else {
        this.notifications = JSON.parse(JSON.stringify(response.notifications));
      }

      let unseen = this.notifications.filter((notification) => notification.seen === false);
      if (unseen.length > 0) {
        let ids = unseen.map((notification) => notification.id);
        this.markAsSeen(ids);
      }
    }

    let panel = this.template.querySelector('c-lwr-global-notifications-panel');
    if (panel) {
      panel.loaded();
    }
  }

  notificationsFailure(error) {
    console.error(`Get Notifications error: ${JSON.stringify(error)}`);
  }

  moreNotificationsSuccess(response) {
    if (response.notifications) {
      this.notificationsQueue.push(...response.notifications);
    }
  }

  moreNotificationsFailure(error) {
    console.error(`Get More Notifications error: ${JSON.stringify(error)}`);
  }

  statusSuccess(response) {
    if (response.success) {
      this.unseen = response.unseenCount;
      this.saveStatusToSession(response);
    } else {
      this.unseen = 0;
      console.error(`Notifications Status error: ${response.error}`);
    }
  }

  statusFailure(error) {
    this.unseen = 0;
    console.error(`Notifications Status error: ${JSON.stringify(error)}`);
  }

  handleToggle() {
    if (!this.open) {
      this.loadNotifications();
    } else {
      let panel = this.template.querySelector('c-lwr-global-notifications-panel');
      if (panel) {
        panel.close();
      }
    }

    this.open = !this.open;
  }

  handleClose() {
    let panel = this.template.querySelector('c-lwr-global-notifications-panel');
    if (panel) {
      panel.close();
    }

    let icon = this.template.querySelector('c-lwr-global-notifications-icon');
    if (icon) {
      icon.focus();
    }

    this.open = false;
  }

  handleNavigation(e) {
    e.preventDefault();

    let ids = [e.detail.notification.id];
    this.markAsRead(ids);

    let pageReference = this.getPageReference(e.detail.notification);
    this[NavigationMixin.GenerateUrl](pageReference).then((url) => {
      window.location.href = url;
    });

    this.handleToggle();
  }

  getPageReference(notification) {
    if (notification.objectApiName === 'FeedItem') {
      // LWR does not support FeedItem so we need to link to a custom page
      return {
        type: 'comm__namedPage',
        attributes: {
          name: this.chatterPostPage
        },
        state: {
          recordId: notification.target
        }
      };
    }
    
    return {
      type: 'standard__recordPage',
      attributes: {
        recordId: notification.target,
        objectApiName: notification.objectApiName,
        actionName: 'view'
      }
    };
  }

  handleMarkAllRead() {
    let notifications = this.notifications.filter((notification) => notification.read === false);
    if (notifications.length > 0) {
      let ids = notifications.map((notification) => notification.id);
      this.markAsRead(ids);
    }
  }

  loadNotifications() {
    let panel = this.template.querySelector('c-lwr-global-notifications-panel');
    if (panel) {
      panel.loading();
    }
    this.dispatchEvent(new CustomEvent("open"));

    this.notifications = [];
    this.notificationsQueue = [];

    getNotifications().then(response => {
      this.notificationsSuccess(response);
    }).catch(error => {
      this.notificationsFailure(error);
    })
  }

  loadMoreNotifications(before) {
    getMoreNotifications({ before: before }).then(response => {
      this.moreNotificationsSuccess(response);
    }).catch(error => {
      this.moreNotificationsFailure(error);
    })
  }

  markAsRead(notifications) {
    // mark an array of notifications as read
    notifications.forEach((item) => {
      setNotificationAsRead({ notificationId : item });
    });

    // reload the status because the unseen count might have changed
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.loadStatus();
    }, 300);
  }

  markAsSeen(notifications) {
    // mark an array of notifications as seen
    notifications.forEach((item) => {
      setNotificationAsSeen({ notificationId : item });
    });

    // reload the status because the unseen count has changed
    window.sessionStorage.removeItem(SESSION_KEY);
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.loadStatus();
    }, 300);
  }

  handleLoadMore() {
    if (this.notificationsQueue.length > 0) {
      let additions = [];
      if (this.notificationsQueue.length > 10) {
        additions.push(...this.notificationsQueue.splice(0, 10))

        if (this.notificationsQueue.length < 20) {
          let lastNotification = this.notificationsQueue[this.notificationsQueue.length - 1];
          this.loadMoreNotifications(lastNotification.lastModified);
        }
      } else {
        additions.push(...this.notificationsQueue)
        this.notificationsQueue = [];
      }

      if (additions.length > 0) {
        let notifications = JSON.parse(JSON.stringify(this.notifications));
        notifications.push(...additions);

        this.notifications = notifications;

        let unseen = additions.filter((notification) => notification.seen === false);
        if (unseen.length > 0) {
          let ids = unseen.map((notification) => notification.id);
          this.markAsSeen(ids);
        }
      }
    }
  }

  @api close() {
    let panel = this.template.querySelector('c-lwr-global-notifications-panel');
    if (panel) {
      panel.close();
    }

    this.open = false;
  }
}