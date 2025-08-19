import { createElement } from '@lwc/engine-dom';
import LwrChatterFeedItemMenu from 'c/lwrChatterFeedItemMenu';
import bookmarkOnFeedItem from "@salesforce/apex/LwrChatterController.bookmarkOnFeedItem";
import removeBookmarkOnFeedItem from "@salesforce/apex/LwrChatterController.removeBookmarkOnFeedItem";
import muteFeedItem from "@salesforce/apex/LwrChatterController.muteFeedItem";
import unmuteFeedItem from "@salesforce/apex/LwrChatterController.unmuteFeedItem";

const mockBookmarkedPost = require('./data/bookmarked-post.json');
const mockDeletablePost = require('./data/deletable-post.json');
const mockEditablePost = require('./data/editable-post.json');
const mockMutedPost = require('./data/muted-post.json');
const mockReadOnlyPost = require('./data/readonly-post.json');

jest.mock(
  "@salesforce/apex/LwrChatterController.bookmarkOnFeedItem",
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
  "@salesforce/apex/LwrChatterController.removeBookmarkOnFeedItem",
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
  "@salesforce/apex/LwrChatterController.muteFeedItem",
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
  "@salesforce/apex/LwrChatterController.unmuteFeedItem",
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

describe('c-lwr-chatter-feed-item-menu', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    jest.clearAllMocks();
  });

  it('Test basic scaffolding, no data provided', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-menu', {
      is: LwrChatterFeedItemMenu
    });

    // Act
    document.body.appendChild(element);

    // Assert
    expect(element.item).toBeNull();
    expect(element.canDelete).toBeFalsy();
    expect(element.canEdit).toBeFalsy();
    expect(element.bookmarkLabel).toBe('Bookmark');
    expect(element.muteLabel).toBe('Mute');

    // const div = element.shadowRoot.querySelector('div');
  });

  it('Test basic scaffolding, read only post', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-menu', {
      is: LwrChatterFeedItemMenu
    });

    // Act
    element.item = mockReadOnlyPost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');
    expect(element.canDelete).toBeFalsy();
    expect(element.canEdit).toBeFalsy();
  });

  it('Test basic scaffolding, deletable post', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-menu', {
      is: LwrChatterFeedItemMenu
    });

    // Act
    element.item = mockDeletablePost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');
    expect(element.canDelete).toBeTruthy();
    expect(element.canEdit).toBeFalsy();
  });

  it('Test basic scaffolding, editable post', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-menu', {
      is: LwrChatterFeedItemMenu
    });

    // Act
    element.item = mockEditablePost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');
    expect(element.canDelete).toBeTruthy();
    expect(element.canEdit).toBeTruthy();
  });

  it('Test basic scaffolding, bookmarked post', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-menu', {
      is: LwrChatterFeedItemMenu
    });

    // Act
    element.item = mockBookmarkedPost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');
    expect(element.bookmarkLabel).toBe('Remove Bookmark');
  });

  it('Test basic scaffolding, muted post', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-menu', {
      is: LwrChatterFeedItemMenu
    });

    // Act
    element.item = mockMutedPost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');
    expect(element.muteLabel).toBe('Unmute');
  });

  it('Test adding and removing a post bookmark', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-menu', {
      is: LwrChatterFeedItemMenu
    });

    // Act
    element.item = mockEditablePost;
    document.body.appendChild(element);

    // Assert
    let menu = element.shadowRoot.querySelector('lightning-button-menu');
    expect(menu).not.toBeNull();

    menu.dispatchEvent(new CustomEvent('select', {
      detail: { value: 'Bookmark' }
    }));
    expect(bookmarkOnFeedItem).toHaveBeenCalledTimes(1);

    menu.dispatchEvent(new CustomEvent('select', {
      detail: { value: 'Bookmark' }
    }));
    expect(removeBookmarkOnFeedItem).toHaveBeenCalledTimes(1);
  });

  it('Test muting and unmuting a post', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-menu', {
      is: LwrChatterFeedItemMenu
    });

    // Act
    element.item = mockEditablePost;
    document.body.appendChild(element);

    // Assert
    let menu = element.shadowRoot.querySelector('lightning-button-menu');
    expect(menu).not.toBeNull();

    menu.dispatchEvent(new CustomEvent('select', {
      detail: { value: 'Mute' }
    }));
    expect(muteFeedItem).toHaveBeenCalledTimes(1);

    menu.dispatchEvent(new CustomEvent('select', {
      detail: { value: 'Mute' }
    }));
    expect(unmuteFeedItem).toHaveBeenCalledTimes(1);
  });

  it('Test selecting edit option', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-menu', {
      is: LwrChatterFeedItemMenu
    });

    // Act
    element.item = mockEditablePost;

    const handler = jest.fn();
    element.addEventListener('select', handler);

    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    let menu = element.shadowRoot.querySelector('lightning-button-menu');
    expect(menu).not.toBeNull();

    menu.dispatchEvent(new CustomEvent('select', {
      detail: { value: 'Edit' }
    }));
    expect(handler).toHaveBeenCalledTimes(1);

    const event = handler.mock.calls[0][0];
    expect(event).not.toBeNull();
    expect(event.detail).not.toBeNull();
    expect(event.detail.value).not.toBeNull();
    expect(event.detail.value).toBe('Edit');
  });

  it('Test selecting delete option', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-menu', {
      is: LwrChatterFeedItemMenu
    });

    // Act
    element.item = mockEditablePost;

    const handler = jest.fn();
    element.addEventListener('select', handler);

    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    let menu = element.shadowRoot.querySelector('lightning-button-menu');
    expect(menu).not.toBeNull();

    menu.dispatchEvent(new CustomEvent('select', {
      detail: { value: 'Delete' }
    }));
    expect(handler).toHaveBeenCalledTimes(1);

    const event = handler.mock.calls[0][0];
    expect(event).not.toBeNull();
    expect(event.detail).not.toBeNull();
    expect(event.detail.value).not.toBeNull();
    expect(event.detail.value).toBe('Delete');
  });

  it('Test selecting invalid / nonexistant option', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-menu', {
      is: LwrChatterFeedItemMenu
    });

    // Act
    element.item = mockEditablePost;

    const handler = jest.fn();
    element.addEventListener('select', handler);

    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    let menu = element.shadowRoot.querySelector('lightning-button-menu');
    expect(menu).not.toBeNull();

    menu.dispatchEvent(new CustomEvent('select', {
      detail: { value: 'Yaba daba do' }
    }));

    expect(handler).toHaveBeenCalledTimes(0);
    expect(bookmarkOnFeedItem).toHaveBeenCalledTimes(0);
    expect(removeBookmarkOnFeedItem).toHaveBeenCalledTimes(0);
    expect(muteFeedItem).toHaveBeenCalledTimes(0);
    expect(unmuteFeedItem).toHaveBeenCalledTimes(0);
  });
});