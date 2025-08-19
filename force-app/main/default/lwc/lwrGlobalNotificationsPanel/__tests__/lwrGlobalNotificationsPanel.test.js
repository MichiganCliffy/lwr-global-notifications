import { createElement } from 'lwc';
import LwrGlobalNotificationsPanel from 'c/lwrGlobalNotificationsPanel';
import NOTIFICATIONS from './data/notifications.json';
import NOTIFICATION from './data/notification.json';

jest.mock(
  "@salesforce/label/c.CLOSE",
  () => {
    return { default: "Close" };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/label/c.Loading",
  () => {
    return { default: "Loading" };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/label/c.GatewayNotificationsTitle",
  () => {
    return { default: "Notifications" };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/label/c.GatewayNotificationsMarkReadLink",
  () => {
    return { default: "Mark all as read" };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/label/c.GatewayNotificationsEmpty",
  () => {
    return { default: "No notifications" };
  },
  { virtual: true }
);

async function flushPromises() {
  return Promise.resolve();
}

describe('c-lwr-global-notifications-panel', () => {
  afterEach(() => {
      // The jsdom instance is shared across test cases in a single file so reset the DOM
      while (document.body.firstChild) {
          document.body.removeChild(document.body.firstChild);
      }
  });

  it('Test initial scaffolding', async() => {
      const element = createElement('c-lwr-global-notifications-panel', {
          is: LwrGlobalNotificationsPanel
      });

      element.notifications = NOTIFICATIONS;
      document.body.appendChild(element);

      let container = element.shadowRoot.querySelector('.notifications');
      expect(container).toBeNull();
  });

  it('Test loading spinner', async() => {
    const element = createElement('c-lwr-global-notifications-panel', {
      is: LwrGlobalNotificationsPanel
    });

    element.notifications = NOTIFICATIONS;
    document.body.appendChild(element);

    element.loading();

    await flushPromises();

    let container = element.shadowRoot.querySelector('.notifications');
    expect(container).not.toBeNull();

    let title = element.shadowRoot.querySelector('.notifications__header h1');
    expect(title).not.toBeNull();
    expect(title.innerHTML).toBe('Notifications');

    let markUnread = element.shadowRoot.querySelector('a.notifications-markread');
    expect(markUnread).not.toBeNull();
    expect(markUnread.innerHTML).toBe('Mark all as Read');

    let closeBtn = element.shadowRoot.querySelector('.notifications-close');
    expect(closeBtn).not.toBeNull();
    expect(closeBtn.title).toBe('Close');

    let spinner = element.shadowRoot.querySelector('.notifications__list lightning-spinner');
    expect(spinner).not.toBeNull();
    expect(spinner.alternativeText).toBe('Loading');
  });

  it('Test showing data', async() => {
    const element = createElement('c-lwr-global-notifications-panel', {
      is: LwrGlobalNotificationsPanel
    });

    element.notifications = NOTIFICATIONS;
    document.body.appendChild(element);

    element.loaded();

    await flushPromises();

    let container = element.shadowRoot.querySelector('.notifications');
    expect(container).not.toBeNull();

    let list = element.shadowRoot.querySelectorAll('.notifications__list ul li');
    expect(list).not.toBeNull();
    expect(list.length).toBe(10);
  });

  it('Test closing panel', async() => {
    const element = createElement('c-lwr-global-notifications-panel', {
      is: LwrGlobalNotificationsPanel
    });

    element.notifications = NOTIFICATIONS;
    document.body.appendChild(element);

    element.loaded();

    await flushPromises();

    let container = element.shadowRoot.querySelector('.notifications');
    expect(container).not.toBeNull();

    element.close();

    await flushPromises();

    container = element.shadowRoot.querySelector('.notifications');
    expect(container).toBeNull();
  });

  it('Test clicking mark all as read', async() => {
    const element = createElement('c-lwr-global-notifications-panel', {
      is: LwrGlobalNotificationsPanel
    });

    element.notifications = NOTIFICATIONS;

    const handler = jest.fn();
    element.addEventListener('markallread', handler);

    document.body.appendChild(element);

    element.loaded();

    await flushPromises();

    let link = element.shadowRoot.querySelector('a.notifications-markread');
    expect(link).not.toBeNull();
    link.click();

    await flushPromises();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Test clicking close button', async() => {
    const element = createElement('c-lwr-global-notifications-panel', {
      is: LwrGlobalNotificationsPanel
    });

    element.notifications = NOTIFICATIONS;

    const handler = jest.fn();
    element.addEventListener('close', handler);

    document.body.appendChild(element);

    element.loaded();

    await flushPromises();

    let btn = element.shadowRoot.querySelector('.notifications-close');
    expect(btn).not.toBeNull();
    btn.click();

    await flushPromises();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Test no notifications', async() => {
    const element = createElement('c-lwr-global-notifications-panel', {
      is: LwrGlobalNotificationsPanel
    });

    document.body.appendChild(element);

    element.loaded();

    await flushPromises();

    let container = element.shadowRoot.querySelector('.notifications__list');
    expect(container).not.toBeNull();

    let message = element.shadowRoot.querySelector('.notifications__empty');
    expect(message).not.toBeNull();
    expect(message.innerHTML).toBe('You do not have any notifications');
  });

  it('Test escape key', async() => {
    const element = createElement('c-lwr-global-notifications-panel', {
      is: LwrGlobalNotificationsPanel
    });

    element.notifications = NOTIFICATIONS;

    const handler = jest.fn();
    element.addEventListener('close', handler);

    document.body.appendChild(element);

    element.loaded();

    await flushPromises();

    let event = new KeyboardEvent('keydown', {'key': 'Escape'});
    document.dispatchEvent(event);

    await flushPromises();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Test tab keys', async() => {
    const element = createElement('c-lwr-global-notifications-panel', {
      is: LwrGlobalNotificationsPanel
    });

    element.notifications = NOTIFICATIONS;

    document.body.appendChild(element);
    await flushPromises();

    element.loaded();

    await flushPromises();

    let closeBtn = element.shadowRoot.querySelector('.notifications-close');
    expect(closeBtn).not.toBeNull();

    let trap = element.shadowRoot.querySelector('.trap');
    expect(trap).not.toBeNull();
    trap.focus();

    let event = new KeyboardEvent('keydown', {'key': 'Tab', 'shiftKey': false});
    document.dispatchEvent(event);

    event = new KeyboardEvent('keydown', {'key': 'Tab', 'shiftKey': true});
    document.dispatchEvent(event);
  });

  it('Test tab keys when there are no notifications', async() => {
    const element = createElement('c-lwr-global-notifications-panel', {
      is: LwrGlobalNotificationsPanel
    });

    document.body.appendChild(element);
    await flushPromises();

    element.loaded();

    await flushPromises();

    let closeBtn = element.shadowRoot.querySelector('.notifications-close');
    expect(closeBtn).not.toBeNull();

    let trap = element.shadowRoot.querySelector('.trap');
    expect(trap).not.toBeNull();
    trap.focus();

    let event = new KeyboardEvent('keydown', {'key': 'Tab', 'shiftKey': false});
    document.dispatchEvent(event);

    event = new KeyboardEvent('keydown', {'key': 'Tab', 'shiftKey': true});
    document.dispatchEvent(event);

    closeBtn.focus();

    event = new KeyboardEvent('keydown', {'key': 'Tab', 'shiftKey': true});
    document.dispatchEvent(event);

    event = new KeyboardEvent('keydown', {'key': 'Tab', 'shiftKey': false});
    document.dispatchEvent(event);
  });


  it('Test enter key on mark as read link', async() => {
    const element = createElement('c-lwr-global-notifications-panel', {
      is: LwrGlobalNotificationsPanel
    });

    element.notifications = NOTIFICATIONS;

    const handler = jest.fn();
    element.addEventListener('markallread', handler);

    document.body.appendChild(element);
    await flushPromises();

    element.loaded();

    await flushPromises();

    let markReadLink = element.shadowRoot.querySelector('.notifications-markread');
    expect(markReadLink).not.toBeNull();
    markReadLink.focus();

    let event = new KeyboardEvent('keydown', {'key': 'Enter'});
    document.dispatchEvent(event);

    await flushPromises();

    expect(handler).toHaveBeenCalled();
  });

  it('Test scroll event', async() => {
    const element = createElement('c-lwr-global-notifications-panel', {
      is: LwrGlobalNotificationsPanel
    });

    element.notifications = NOTIFICATION;

    const handler = jest.fn();
    element.addEventListener('loadmore', handler);

    document.body.appendChild(element);

    element.loaded();

    await flushPromises();

    let container = element.shadowRoot.querySelector('.notifications__list');
    expect(container).not.toBeNull();
    container.dispatchEvent(new CustomEvent('scroll'));
    
    await flushPromises();

    expect(handler).toHaveBeenCalledTimes(1);
  });
});