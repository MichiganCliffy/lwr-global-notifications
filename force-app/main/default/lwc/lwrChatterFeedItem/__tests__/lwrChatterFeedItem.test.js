import { createElement } from '@lwc/engine-dom';
import LwrChatterFeedItem from 'c/lwrChatterFeedItem';
import { mockGenerate, getGenerateUrlCalledWith } from 'lightning/navigation';
import deleteFeedItem from "@salesforce/apex/LwrChatterController.deleteFeedItem";
import feedItemEdit from 'c/lwrChatterFeedItemEdit';
import { deleteRecord } from 'lightning/uiRecordApi';

const mockFeedPost = require('./data/feed-post.json');
const mockFeedPostNoAvatar = require('./data/feed-post-no-avatar.json');
const mockFeedPostNoActor = require('./data/feed-post-no-actor.json');
const mockFeedPostWithFiles = require('./data/feed-post-with-files.json');

jest.mock(
  "@salesforce/apex/LwrChatterController.deleteFeedItem",
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

describe('c-lwr-chatter-feed-item', () => {
  beforeEach(() => {
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
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item', {
      is: LwrChatterFeedItem
    });

    // Act
    element.item = mockFeedPost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    const avatar = element.shadowRoot.querySelector('input[type="image"]');
    expect(avatar).not.toBeNull();
    expect(avatar.src).toBe('https://unittest.develop.my.salesforce.com/profilephoto/005/M');
    expect(avatar.title).toBe('bclifford avatar');

    const postDate = element.shadowRoot.querySelector('lightning-button');
    expect(postDate).not.toBeNull();
    expect(postDate.label).toBe('May 15, 2025 at 2:13 PM');
  });

  it('Test scaffolding, no avatar', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item', {
      is: LwrChatterFeedItem
    });

    // Act
    element.item = mockFeedPostNoAvatar;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    const avatar = element.shadowRoot.querySelector('input[type="image"]');
    expect(avatar).toBeNull();
  });

  it('Test scaffolding, no actor', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item', {
      is: LwrChatterFeedItem
    });

    // Act
    element.item = mockFeedPostNoActor;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    const avatar = element.shadowRoot.querySelector('input[type="image"]');
    expect(avatar).toBeNull();
  });

  it('Test avatar click', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item', {
      is: LwrChatterFeedItem
    });

    // Act
    element.item = mockFeedPost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    const avatar = element.shadowRoot.querySelector('input[type="image"]');
    expect(avatar).not.toBeNull();

    avatar.click();

    expect(mockGenerate).toHaveBeenCalledTimes(1);
    let navigation = getGenerateUrlCalledWith();

    expect(navigation).not.toBeNull();
    expect(navigation.pageReference).not.toBeNull();
    let pageReference = navigation.pageReference;

    expect(pageReference.type).toBe('standard__recordPage');
    expect(pageReference.attributes).not.toBeNull();

    let attributes = pageReference.attributes;
    expect(attributes.actionName).toBe('view');
    expect(attributes.recordId).toBe('005al000000MFmnAAG');
    expect(attributes.objectApiName).toBe('User');
  });

  it('Test date click', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item', {
      is: LwrChatterFeedItem
    });

    // Act
    element.item = mockFeedPost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    const postDate = element.shadowRoot.querySelector('lightning-button');
    expect(postDate).not.toBeNull();

    postDate.click();

    expect(mockGenerate).toHaveBeenCalledTimes(1);
    let navigation = getGenerateUrlCalledWith();

    expect(navigation).not.toBeNull();
    expect(navigation.pageReference).not.toBeNull();
    let pageReference = navigation.pageReference;

    expect(pageReference.type).toBe('comm__namedPage');
    expect(pageReference.attributes).not.toBeNull();
    expect(pageReference.state).not.toBeNull();

    let state = pageReference.state;
    expect(state.recordId).toBe('0D5al00000r2g8tCAA');
  });

  it('Test comment delete', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item', {
      is: LwrChatterFeedItem
    });

    const handler = jest.fn();
    element.addEventListener('update', handler);

    // Act
    element.item = mockFeedPost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    const comments = element.shadowRoot.querySelector('c-lwr-chatter-comments');
    comments.dispatchEvent(new CustomEvent("delete"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Test comment edit toggle', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item', {
      is: LwrChatterFeedItem
    });

    // Act
    element.item = mockFeedPost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    const newCommentForm = element.shadowRoot.querySelector('c-lwr-chatter-comment-new');
    expect(newCommentForm).not.toBeNull();

    const comments = element.shadowRoot.querySelector('c-lwr-chatter-comments');
    comments.dispatchEvent(new CustomEvent("edittoggle", { detail: { isEditing: true } }));

    jest.runAllTimers();
    await flushPromises();

    const newCommentFormCheck = element.shadowRoot.querySelector('c-lwr-chatter-comment-new');
    expect(newCommentFormCheck).toBeNull();

    comments.dispatchEvent(new CustomEvent("edittoggle", { detail: { isEditing: false } }));

    jest.runAllTimers();
    await flushPromises();

    const newCommentFormFinalCheck = element.shadowRoot.querySelector('c-lwr-chatter-comment-new');
    expect(newCommentFormFinalCheck).not.toBeNull();
  });

  it('Test comment update', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item', {
      is: LwrChatterFeedItem
    });

    const handler = jest.fn();
    element.addEventListener('update', handler);

    // Act
    element.item = mockFeedPost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    const newCommentForm = element.shadowRoot.querySelector('c-lwr-chatter-comment-new');
    expect(newCommentForm).not.toBeNull();

    const comments = element.shadowRoot.querySelector('c-lwr-chatter-comments');
    comments.dispatchEvent(new CustomEvent("edittoggle", { detail: { isEditing: true } }));

    jest.runAllTimers();
    await flushPromises();

    const newCommentFormCheck = element.shadowRoot.querySelector('c-lwr-chatter-comment-new');
    expect(newCommentFormCheck).toBeNull();

    comments.dispatchEvent(new CustomEvent("update"));

    jest.runAllTimers();
    await flushPromises();

    const newCommentFormFinalCheck = element.shadowRoot.querySelector('c-lwr-chatter-comment-new');
    expect(newCommentFormFinalCheck).not.toBeNull();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Test new comment', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item', {
      is: LwrChatterFeedItem
    });

    const handler = jest.fn();
    element.addEventListener('update', handler);

    // Act
    element.item = mockFeedPost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    const comment = element.shadowRoot.querySelector('c-lwr-chatter-comment-new');
    comment.dispatchEvent(new CustomEvent("comment"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Test comment toggle', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item', {
      is: LwrChatterFeedItem
    });

    // Act
    element.item = mockFeedPost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    const commentForm = element.shadowRoot.querySelector('c-lwr-chatter-comment-new');
    const spy = jest.spyOn(commentForm, 'toggleForm');

    const comment = element.shadowRoot.querySelector('c-lwr-chatter-feed-item-actions');
    comment.dispatchEvent(new CustomEvent("comment"));

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('Test deleting post', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item', {
      is: LwrChatterFeedItem
    });

    const handler = jest.fn();
    element.addEventListener('update', handler);

    // Act
    element.item = mockFeedPost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    const menu = element.shadowRoot.querySelector('c-lwr-chatter-feed-item-menu');
    menu.dispatchEvent(new CustomEvent("select", {detail: {value: 'Delete'}}));

    jest.runAllTimers();
    await flushPromises();

    expect(deleteFeedItem).toHaveBeenCalledTimes(1);

    jest.runAllTimers();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Test deleting post with files', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item', {
      is: LwrChatterFeedItem
    });

    const handler = jest.fn();
    element.addEventListener('update', handler);

    deleteRecord.mockResolvedValue();

    // Act
    element.item = mockFeedPostWithFiles;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    const menu = element.shadowRoot.querySelector('c-lwr-chatter-feed-item-menu');
    menu.dispatchEvent(new CustomEvent("select", {detail: {value: 'Delete'}}));

    jest.runAllTimers();
    await flushPromises();
    await flushPromises();
    await flushPromises();
    await flushPromises();

    expect(deleteRecord).toHaveBeenCalledTimes(4);
    expect(deleteFeedItem).toHaveBeenCalledTimes(1);

    jest.runAllTimers();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Test file delete expection handling', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item', {
      is: LwrChatterFeedItem
    });

    const handler = jest.fn();
    element.addEventListener('update', handler);

    deleteRecord.mockRejectedValue('ERROR');

    // Act
    element.item = mockFeedPostWithFiles;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    const menu = element.shadowRoot.querySelector('c-lwr-chatter-feed-item-menu');
    menu.dispatchEvent(new CustomEvent("select", {detail: {value: 'Delete'}}));

    jest.runAllTimers();
    await flushPromises();
    await flushPromises();
    await flushPromises();
    await flushPromises();

    expect(deleteRecord).toHaveBeenCalledTimes(4);
    expect(deleteFeedItem).toHaveBeenCalledTimes(0);

    jest.runAllTimers();

    expect(handler).toHaveBeenCalledTimes(0);
  });

  it('Test editing post', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item', {
      is: LwrChatterFeedItem
    });

    const handler = jest.fn();
    element.addEventListener('update', handler);

    feedItemEdit.open = jest.fn().mockResolvedValue(true);

    // Act
    element.item = mockFeedPost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    const menu = element.shadowRoot.querySelector('c-lwr-chatter-feed-item-menu');
    menu.dispatchEvent(new CustomEvent("select", {detail: {value: 'Edit'}}));

    jest.runAllTimers();
    await flushPromises();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Test invalid menu option', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item', {
      is: LwrChatterFeedItem
    });

    const handler = jest.fn();
    element.addEventListener('update', handler);

    // Act
    element.item = mockFeedPost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    const menu = element.shadowRoot.querySelector('c-lwr-chatter-feed-item-menu');
    menu.dispatchEvent(new CustomEvent("select", {detail: {value: 'Yaba daba do'}}));

    jest.runAllTimers();
    await flushPromises();

    expect(deleteFeedItem).toHaveBeenCalledTimes(0);
    expect(handler).toHaveBeenCalledTimes(0);
  });
});