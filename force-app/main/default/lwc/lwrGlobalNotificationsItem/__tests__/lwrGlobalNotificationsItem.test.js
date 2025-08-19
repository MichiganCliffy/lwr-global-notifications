import { createElement } from 'lwc';
import LwrGlobalNotificationsItem from 'c/lwrGlobalNotificationsItem';
import UNREAD_NOTIFICATION from './data/notification-unread.json';
import READ_NOTIFICATION from './data/notification-read.json';

jest.mock(
  "@salesforce/label/c.Unread_Notifications",
  () => {
    return { default: "Unread Notifications" };
  },
  { virtual: true }
);

async function flushPromises() {
  return Promise.resolve();
}

describe('c-lwr-global-notifications-item', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('Test basic scaffolding', async() => {
        const element = createElement('c-lwr-global-notifications-item', {
            is: LwrGlobalNotificationsItem
        });

        element.notification = UNREAD_NOTIFICATION;
        document.body.appendChild(element);

        let avatarContainer = element.shadowRoot.querySelector('.notification-avatar');
        expect(avatarContainer).not.toBeNull();

        let avatar = element.shadowRoot.querySelector('.notification-avatar img');
        expect(avatar).not.toBeNull();
        expect(avatar.src).toBe('http://localhost/images/AnnouncementIcon.svg');

        let title = element.shadowRoot.querySelector('.notification-content__message h2 lightning-formatted-text');
        expect(title).not.toBeNull();
        expect(title.value).toBe('Lead1');

        let message = element.shadowRoot.querySelector('.notification-message');
        expect(message).not.toBeNull();
        expect(message.value).toBe('Priority Notification');

        let time = element.shadowRoot.querySelector('.notification-time');
        expect(time).not.toBeNull();
        expect(time.value).toBe('2025-02-13T21:46:06.613Z');

        let unread = element.shadowRoot.querySelector('.notification-unread');
        expect(unread).not.toBeNull();

        let unreadAssistiveText = element.shadowRoot.querySelector('.notification-unread .slds-assistive-text');
        expect(unreadAssistiveText).not.toBeNull();
        expect(unreadAssistiveText.innerHTML).toBe('Unread Notifications');
    });

    it('Test Click Handler', async() => {
      const element = createElement('c-lwr-global-notifications-item', {
        is: LwrGlobalNotificationsItem
      });

      element.notification = UNREAD_NOTIFICATION;

      const handler = jest.fn();
      element.addEventListener('navigation', handler);
      
      document.body.appendChild(element);

      let link = element.shadowRoot.querySelector('a.notification');
      expect(link).not.toBeNull();

      link.click();

      await flushPromises();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('Test Enter Key', async() => {
      const element = createElement('c-lwr-global-notifications-item', {
        is: LwrGlobalNotificationsItem
      });

      element.notification = UNREAD_NOTIFICATION;

      const handler = jest.fn();
      element.addEventListener('navigation', handler);
      
      document.body.appendChild(element);

      let link = element.shadowRoot.querySelector('a.notification');
      expect(link).not.toBeNull();
      link.focus();

      await flushPromises();

      let event = new KeyboardEvent('keypress', {'key': 'Enter'});
      link.dispatchEvent(event);

      await flushPromises();

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });