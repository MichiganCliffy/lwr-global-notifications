import { createElement } from 'lwc';
import LwrGlobalNotifications from 'c/lwrGlobalNotifications';
import getStatus from "@salesforce/apex/LwrNotificationsController.getStatus";
import getNotifications from "@salesforce/apex/LwrNotificationsController.getNotifications";
import getMoreNotifications from "@salesforce/apex/LwrNotificationsController.getMoreNotifications";
import setNotificationAsRead from "@salesforce/apex/LwrNotificationsController.setNotificationAsRead";
import setNotificationAsSeen from "@salesforce/apex/LwrNotificationsController.setNotificationAsSeen";

const mockNotifications = require('./data/notifications.json');
const mockStatus = require('./data/status.json');
const mockError = require('./data/error.json');
const mockMoreNotifications = require('./data/more-notifications.json');
const mockNotification = require('./data/notification.json');
const mockFewNotifications = require('./data/few-notifications.json');
const mockFeedNotification = require('./data/feed-notification.json');

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

jest.mock(
  "@salesforce/label/c.SuccessMessage",
  () => {
    return {
      default: "Success"
    };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/label/c.FailureMessage",
  () => {
    return {
      default: "Fail"
    };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/LwrNotificationsController.getStatus",
  () => {
    const {
      createApexTestWireAdapter
    } = require('@salesforce/sfdx-lwc-jest');
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/LwrNotificationsController.getNotifications",
  () => {
    const {
      createApexTestWireAdapter
    } = require('@salesforce/sfdx-lwc-jest');
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/LwrNotificationsController.getMoreNotifications",
  () => {
    const {
      createApexTestWireAdapter
    } = require('@salesforce/sfdx-lwc-jest');
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/LwrNotificationsController.setNotificationAsRead",
  () => {
    const {
      createApexTestWireAdapter
    } = require('@salesforce/sfdx-lwc-jest');
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/LwrNotificationsController.setNotificationAsSeen",
  () => {
    const {
      createApexTestWireAdapter
    } = require('@salesforce/sfdx-lwc-jest');
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

const fakeSessionStorage = (function () {
  let store = {};

  return {
    getItem: function (key) {
      return store[key] || null;
    },

    setItem: function (key, value) {
      store[key] = value;
    },

    removeItem: function (key) {
      delete store[key];
    },

    clear: function () {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: fakeSessionStorage,
});

delete window.location;
window.location = {};

const fakeHref = (function () {
  let location = '';

  return {
    get: function () {
      return location;
    },

    set: function (value) {
      location = value;
    }
  };
})();

Object.defineProperty(window.location, 'href', fakeHref);

async function flushPromises() {
  return Promise.resolve();
}

async function flushPromisesMultiple(times) {
  for (let i = 0; i < times; i++) {
    await flushPromises();
  }
}

describe('c-lwr-experience-cloud-notifications', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    jest.restoreAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('Test basic scaffolding', async() => {
    const element = createElement('c-lwr-global-notifications', {
      is: LwrGlobalNotifications
    });

    getStatus.mockResolvedValue(mockStatus);
    document.body.appendChild(element);

    await flushPromises();

    let icon = element.shadowRoot.querySelector('c-lwr-global-notifications-icon');
    expect(icon).not.toBeNull();
    expect(icon.unseen).toBe(41);

    let panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    expect(panel.notifications.length).toBe(0);
  });

  it('Test basic scaffolding loading from session storage', async() => {
    const element = createElement('c-lwr-global-notifications', {
      is: LwrGlobalNotifications
    });

    let sessionItem = {
      timestamp: Date.now().toString(),
      data: mockStatus
    };

    window.sessionStorage.setItem('notificationsStatus', JSON.stringify(sessionItem));

    getStatus.mockResolvedValue(mockStatus);
    document.body.appendChild(element);

    await flushPromises();

    let icon = element.shadowRoot.querySelector('c-lwr-global-notifications-icon');
    expect(icon).not.toBeNull();
    expect(icon.unseen).toBe(41);

    let panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    expect(panel.notifications.length).toBe(0);

    expect(getStatus).toHaveBeenCalledTimes(0);
  });

  it('Test basic scaffolding with error returned', async() => {
    const element = createElement('c-lwr-global-notifications', {
      is: LwrGlobalNotifications
    });

    getStatus.mockResolvedValue(mockError);
    document.body.appendChild(element);

    await flushPromises();

    let icon = element.shadowRoot.querySelector('c-lwr-global-notifications-icon');
    expect(icon).not.toBeNull();
    expect(icon.unseen).toBe(0);

    let panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    expect(panel.notifications.length).toBe(0);
  });

  it('Test basic scaffolding with exception', async() => {
    const element = createElement('c-lwr-global-notifications', {
      is: LwrGlobalNotifications
    });

    getStatus.mockRejectedValue('ERROR');
    document.body.appendChild(element);

    await flushPromises();

    let icon = element.shadowRoot.querySelector('c-lwr-global-notifications-icon');
    expect(icon).not.toBeNull();
    expect(icon.unseen).toBe(0);

    let panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    expect(panel.notifications.length).toBe(0);
  });

  it('Test opening and loading notifications', async() => {
    const element = createElement('c-lwr-global-notifications', {
      is: LwrGlobalNotifications
    });

    getStatus.mockResolvedValue(mockStatus);
    getNotifications.mockResolvedValue(mockNotifications);
    
    document.body.appendChild(element);

    await flushPromises();

    let icon = element.shadowRoot.querySelector('c-lwr-global-notifications-icon');
    expect(icon).not.toBeNull();

    icon.dispatchEvent(new CustomEvent('toggle'));

    await flushPromisesMultiple(5);
    jest.runAllTimers();

    let panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    expect(panel.notifications.length).toBe(10);

    expect(setNotificationAsSeen).toHaveBeenCalled();
  });

  it('Test opening and loading notifications with only a few', async() => {
    const element = createElement('c-lwr-global-notifications', {
      is: LwrGlobalNotifications
    });

    getStatus.mockResolvedValue(mockStatus);
    getNotifications.mockResolvedValue(mockFewNotifications);
    
    document.body.appendChild(element);

    await flushPromises();

    let icon = element.shadowRoot.querySelector('c-lwr-global-notifications-icon');
    expect(icon).not.toBeNull();

    icon.dispatchEvent(new CustomEvent('toggle'));

    await flushPromisesMultiple(5);
    jest.runAllTimers();

    let panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    expect(panel.notifications.length).toBe(3);

    expect(setNotificationAsSeen).toHaveBeenCalled();
  });

  it('Test opening and loading notifications with error', async() => {
    const element = createElement('c-lwr-global-notifications', {
      is: LwrGlobalNotifications
    });

    getStatus.mockResolvedValue(mockStatus);
    getNotifications.mockRejectedValue(mockError);
    
    document.body.appendChild(element);

    await flushPromises();

    let icon = element.shadowRoot.querySelector('c-lwr-global-notifications-icon');
    expect(icon).not.toBeNull();

    icon.dispatchEvent(new CustomEvent('toggle'));

    await flushPromisesMultiple(5);

    let panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    expect(panel.notifications.length).toBe(0);
  });

  it('Test loading more notifications', async() => {
    const element = createElement('c-lwr-global-notifications', {
      is: LwrGlobalNotifications
    });

    getStatus.mockResolvedValue(mockStatus);
    getNotifications.mockResolvedValue(mockNotifications);
    getMoreNotifications.mockResolvedValue(mockMoreNotifications);
    
    document.body.appendChild(element);

    await flushPromises();

    let icon = element.shadowRoot.querySelector('c-lwr-global-notifications-icon');
    expect(icon).not.toBeNull();

    icon.dispatchEvent(new CustomEvent('toggle'));
    await flushPromisesMultiple(5);

    let panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    expect(panel.notifications.length).toBe(10);

    panel.dispatchEvent(new CustomEvent('loadmore'));
    await flushPromisesMultiple(5);

    panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    expect(panel.notifications.length).toBe(20);

    panel.dispatchEvent(new CustomEvent('loadmore'));
    await flushPromisesMultiple(5);

    panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    expect(panel.notifications.length).toBe(30);

    panel.dispatchEvent(new CustomEvent('loadmore'));
    await flushPromisesMultiple(5);

    panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    expect(panel.notifications.length).toBe(40);

    expect(getMoreNotifications).toHaveBeenCalled();

    panel.dispatchEvent(new CustomEvent('loadmore'));
    await flushPromisesMultiple(5);

    panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    expect(panel.notifications.length).toBe(50);
  });

  it('Test loading more notifications with exception', async() => {
    const element = createElement('c-lwr-global-notifications', {
      is: LwrGlobalNotifications
    });

    getStatus.mockResolvedValue(mockStatus);
    getNotifications.mockResolvedValue(mockNotifications);
    getMoreNotifications.mockRejectedValue('ERROR');
    
    document.body.appendChild(element);

    await flushPromises();

    let icon = element.shadowRoot.querySelector('c-lwr-global-notifications-icon');
    expect(icon).not.toBeNull();

    icon.dispatchEvent(new CustomEvent('toggle'));
    await flushPromisesMultiple(5);

    let panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    expect(panel.notifications.length).toBe(10);

    panel.dispatchEvent(new CustomEvent('loadmore'));
    await flushPromisesMultiple(5);

    panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    expect(panel.notifications.length).toBe(20);

    panel.dispatchEvent(new CustomEvent('loadmore'));
    await flushPromisesMultiple(5);

    panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    expect(panel.notifications.length).toBe(30);

    panel.dispatchEvent(new CustomEvent('loadmore'));
    await flushPromisesMultiple(5);

    panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    expect(panel.notifications.length).toBe(40);

    expect(getMoreNotifications).toHaveBeenCalled();
  });

  it('Test closing panel', async() => {
    const element = createElement('c-lwr-global-notifications', {
      is: LwrGlobalNotifications
    });

    getStatus.mockResolvedValue(mockStatus);
    getNotifications.mockResolvedValue(mockNotifications);

    document.body.appendChild(element);

    await flushPromises();

    let icon = element.shadowRoot.querySelector('c-lwr-global-notifications-icon');
    expect(icon).not.toBeNull();
    const focusSpy = jest.spyOn(icon, 'focus');

    let panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    const closeSpy = jest.spyOn(panel, 'close');

    icon.dispatchEvent(new CustomEvent('toggle'));

    await flushPromisesMultiple(5);

    panel.dispatchEvent(new CustomEvent('close'));

    await flushPromises();

    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(closeSpy).toHaveBeenCalledTimes(1);

    icon.dispatchEvent(new CustomEvent('toggle'));
    await flushPromisesMultiple(5);

    element.close();
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it('Test marking all as read', async() => {
    const element = createElement('c-lwr-global-notifications', {
      is: LwrGlobalNotifications
    });

    getStatus.mockResolvedValue(mockStatus);
    getNotifications.mockResolvedValue(mockNotifications);

    document.body.appendChild(element);

    await flushPromises();

    let icon = element.shadowRoot.querySelector('c-lwr-global-notifications-icon');
    expect(icon).not.toBeNull();

    let panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();

    icon.dispatchEvent(new CustomEvent('toggle'));

    await flushPromisesMultiple(5);

    panel.dispatchEvent(new CustomEvent('markallread'));

    await flushPromises();
    jest.runAllTimers();

    expect(setNotificationAsRead).toHaveBeenCalled();
  });

  it('Test navigation', async() => {
    const element = createElement('c-lwr-global-notifications', {
      is: LwrGlobalNotifications
    });

    getStatus.mockResolvedValue(mockStatus);
    getNotifications.mockResolvedValue(mockNotifications);

    document.body.appendChild(element);

    await flushPromises();

    let icon = element.shadowRoot.querySelector('c-lwr-global-notifications-icon');
    expect(icon).not.toBeNull();

    let panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    const closeSpy = jest.spyOn(panel, 'close');

    icon.dispatchEvent(new CustomEvent('toggle'));

    await flushPromisesMultiple(5);

    let navigationEvent = new CustomEvent("navigation", { detail: { notification: mockNotification } });
    panel.dispatchEvent(navigationEvent);

    expect(setNotificationAsRead).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('Test navigation for FeedItem', async() => {
    const element = createElement('c-lwr-global-notifications', {
      is: LwrGlobalNotifications
    });

    getStatus.mockResolvedValue(mockStatus);
    getNotifications.mockResolvedValue(mockNotifications);

    document.body.appendChild(element);

    await flushPromises();

    let icon = element.shadowRoot.querySelector('c-lwr-global-notifications-icon');
    expect(icon).not.toBeNull();

    let panel = element.shadowRoot.querySelector('c-lwr-global-notifications-panel');
    expect(panel).not.toBeNull();
    const closeSpy = jest.spyOn(panel, 'close');

    icon.dispatchEvent(new CustomEvent('toggle'));

    await flushPromisesMultiple(5);

    let navigationEvent = new CustomEvent("navigation", { detail: { notification: mockFeedNotification } });
    panel.dispatchEvent(navigationEvent);

    expect(setNotificationAsRead).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });
});