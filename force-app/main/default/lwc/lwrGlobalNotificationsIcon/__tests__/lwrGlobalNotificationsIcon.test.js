import { createElement } from 'lwc';
import LwrGlobalNotificationsIcon from 'c/lwrGlobalNotificationsIcon';

async function flushPromises() {
  return Promise.resolve();
}

jest.mock(
  "@salesforce/label/c.GatewayNotificationsTitle",
  () => {
    return { default: "Notifications" };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/label/c.GatewayNotificationsUnseenCount",
  () => {
    return { default: "{0} Unseen Notifications" };
  },
  { virtual: true }
);

describe('c-lwr-global-notifications-icon', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('Test basic scaffolding', async () => {
        const element = createElement('c-lwr-global-notifications-icon', {
            is: LwrGlobalNotificationsIcon
        });

        element.unseen = 5;
        document.body.appendChild(element);

        let notification = element.shadowRoot.querySelector('.slds-notification-badge');
        expect(notification).not.toBeNull();
        expect(notification.innerHTML).toBe('5');

        let assistiveCopy = element.shadowRoot.querySelector('.slds-assistive-text');
        expect(assistiveCopy).not.toBeNull();
        expect(assistiveCopy.innerHTML).toBe('You have 5 new notifications');
    });

    it('Test click handling', async () => {
      const element = createElement('c-lwr-global-notifications-icon', {
          is: LwrGlobalNotificationsIcon
      });

      element.unseen = 5;

      const handler = jest.fn();
      element.addEventListener('toggle', handler);
        
      document.body.appendChild(element);

      let button = element.shadowRoot.querySelector('button');
      button.click();

      await flushPromises();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('Test setting focus', async () => {
      const element = createElement('c-lwr-global-notifications-icon', {
          is: LwrGlobalNotificationsIcon
      });

      element.unseen = 5;
      document.body.appendChild(element);
      element.focus();

      await flushPromises();

      expect(document.activeElement).toBe(element);
    });
});