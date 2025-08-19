import { LightningElement, api } from "lwc";

export default class LwrGlobalNotificationsIcon extends LightningElement {
  _unseen = 0;
  assistiveId = 'LwrGlobalNotificationsIcon:' + new Date().valueOf();
  labels = {
    AssistiveCopy: 'No new notifications',
    Title: 'Notifications'
  };

  @api
  get unseen() {
    return this._unseen;
  }
  set unseen(value) {
    this._unseen = value;
    this.labels.AssistiveCopy = `You have ${this._unseen} new notifications`;
  }

  get hasUnseen() {
    return ( this._unseen > 0 );
  }

  onClickHandler() {
    this.dispatchEvent(new CustomEvent("toggle"));
  }

  @api focus() {
    let button = this.template.querySelector('button');
    if (button) {
      button.focus();
    }
  }
}