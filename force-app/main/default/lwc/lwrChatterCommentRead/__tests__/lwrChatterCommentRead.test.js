import { createElement } from '@lwc/engine-dom';
import LwrChatterCommentRead from 'c/lwrChatterCommentRead';
import { mockGenerate, getGenerateUrlCalledWith } from 'lightning/navigation';
import { deleteRecord } from "lightning/uiRecordApi";
import likeComment from "@salesforce/apex/LwrChatterController.likeComment";
import unlikeComment from "@salesforce/apex/LwrChatterController.unlikeComment";
import deleteComment from "@salesforce/apex/LwrChatterController.deleteComment";

const mockLikedComment = require('./data/liked-comment.json');
const mockUnlikedComment = require('./data/unliked-comment.json');
const mockCommentWithFile = require('./data/comment-with-file.json');

jest.mock(
  "@salesforce/apex/LwrChatterController.likeComment",
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
  "@salesforce/apex/LwrChatterController.unlikeComment",
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
  "@salesforce/apex/LwrChatterController.deleteComment",
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

describe('c-lwr-chatter-comment-read', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    jest.clearAllMocks();
  });

  it('Test basic scaffolding for unliked comment', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-read', {
      is: LwrChatterCommentRead
    });

    // Act
    element.item = mockUnlikedComment;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D7al000001PqIzCAK');

    const avatar = element.shadowRoot.querySelector('input[type="image"]');
    expect(avatar).not.toBeNull();
    expect(avatar.src).toBe('https://unittest.develop.my.salesforce.com/profilephoto/005/M');
    expect(avatar.title).toBe('bclifford avatar');

    const author = element.shadowRoot.querySelector('lightning-button');
    expect(author).not.toBeNull();
    expect(author.label).toBe('bclifford');
    expect(author.title).toBe('bclifford');

    const commentDate = element.shadowRoot.querySelector('.comment-date');
    expect(commentDate).not.toBeNull();
    expect(commentDate.textContent).toBe('1h ago');

    const likeAction = element.shadowRoot.querySelector('.like-action');
    expect(likeAction).not.toBeNull();
    expect(likeAction.textContent).toBe('Like');
    expect(likeAction.classList.contains('slds-is-active')).toBeFalsy();
  });

  it('Test basic scaffolding for liked comment', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-read', {
      is: LwrChatterCommentRead
    });

    // Act
    element.item = mockLikedComment;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D7al000001PqIzCAK');

    const avatar = element.shadowRoot.querySelector('input[type="image"]');
    expect(avatar).not.toBeNull();
    expect(avatar.src).toBe('https://unittest.develop.my.salesforce.com/profilephoto/005/M');
    expect(avatar.title).toBe('bclifford avatar');

    const author = element.shadowRoot.querySelector('lightning-button');
    expect(author).not.toBeNull();
    expect(author.label).toBe('bclifford');
    expect(author.title).toBe('bclifford');

    const commentDate = element.shadowRoot.querySelector('.comment-date');
    expect(commentDate).not.toBeNull();
    expect(commentDate.textContent).toBe('1h ago');

    const likeAction = element.shadowRoot.querySelector('.like-action');
    expect(likeAction).not.toBeNull();
    expect(likeAction.textContent).toBe('Liked');
    expect(likeAction.classList.contains('slds-is-active')).toBeTruthy();
  });

  it('Test liking and unliking a comment', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-read', {
      is: LwrChatterCommentRead
    });

    // Act
    element.item = mockUnlikedComment;
    document.body.appendChild(element);

    let likeAction = element.shadowRoot.querySelector('.like-action');
    expect(likeAction).not.toBeNull();

    likeAction.click();
    expect(likeComment).toHaveBeenCalledTimes(1);

    likeAction.click();
    expect(unlikeComment).toHaveBeenCalledTimes(1);
  });

  it('Test clicking on author name', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-read', {
      is: LwrChatterCommentRead
    });

    // Act
    element.item = mockUnlikedComment;
    document.body.appendChild(element);

    const author = element.shadowRoot.querySelector('lightning-button');
    expect(author).not.toBeNull();

    author.click();

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

  it('Test deleting a comment', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-read', {
      is: LwrChatterCommentRead
    });

    // Act
    const handler = jest.fn();
    element.addEventListener('delete', handler);

    deleteComment.mockResolvedValue({});

    element.item = mockUnlikedComment;
    document.body.appendChild(element);

    let menu = element.shadowRoot.querySelector('c-lwr-chatter-comment-menu');
    menu.dispatchEvent(new CustomEvent('select', {detail: {value: 'Delete'}}));

    await flushPromises();

    expect(deleteComment).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Test deleting a comment with exception', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-read', {
      is: LwrChatterCommentRead
    });

    // Act
    const handler = jest.fn();
    element.addEventListener('delete', handler);

    deleteComment.mockRejectedValue({});

    element.item = mockUnlikedComment;
    document.body.appendChild(element);

    let menu = element.shadowRoot.querySelector('c-lwr-chatter-comment-menu');
    menu.dispatchEvent(new CustomEvent('select', {detail: {value: 'Delete'}}));

    await flushPromises();

    expect(deleteComment).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(0);
  });

  it('Test deleting a comment with file attachement', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-read', {
      is: LwrChatterCommentRead
    });

    // Act
    const handler = jest.fn();
    element.addEventListener('delete', handler);

    deleteComment.mockResolvedValue({});
    deleteRecord.mockResolvedValue({});

    element.item = mockCommentWithFile;
    document.body.appendChild(element);

    let menu = element.shadowRoot.querySelector('c-lwr-chatter-comment-menu');
    menu.dispatchEvent(new CustomEvent('select', {detail: {value: 'Delete'}}));

    await flushPromises();

    expect(deleteRecord).toHaveBeenCalledTimes(1);
    expect(deleteComment).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Test deleting a comment with file attachement with file delete exception', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-read', {
      is: LwrChatterCommentRead
    });

    // Act
    const handler = jest.fn();
    element.addEventListener('delete', handler);

    deleteComment.mockResolvedValue({});
    deleteRecord.mockRejectedValue({});

    element.item = mockCommentWithFile;
    document.body.appendChild(element);

    let menu = element.shadowRoot.querySelector('c-lwr-chatter-comment-menu');
    menu.dispatchEvent(new CustomEvent('select', {detail: {value: 'Delete'}}));

    await flushPromises();

    expect(deleteRecord).toHaveBeenCalledTimes(1);
    expect(deleteComment).toHaveBeenCalledTimes(0);
    expect(handler).toHaveBeenCalledTimes(0);
  });

  it('Test deleting a comment with file attachement with comment delete exception', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-read', {
      is: LwrChatterCommentRead
    });

    // Act
    const handler = jest.fn();
    element.addEventListener('delete', handler);

    deleteComment.mockRejectedValue({});
    deleteRecord.mockResolvedValue({});

    element.item = mockCommentWithFile;
    document.body.appendChild(element);

    let menu = element.shadowRoot.querySelector('c-lwr-chatter-comment-menu');
    menu.dispatchEvent(new CustomEvent('select', {detail: {value: 'Delete'}}));

    await flushPromises();

    expect(deleteRecord).toHaveBeenCalledTimes(1);
    expect(deleteComment).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(0);
  });

  it('Test editing a comment', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-read', {
      is: LwrChatterCommentRead
    });

    // Act
    const handler = jest.fn();
    element.addEventListener('edit', handler);

    element.item = mockUnlikedComment;
    document.body.appendChild(element);

    let menu = element.shadowRoot.querySelector('c-lwr-chatter-comment-menu');
    menu.dispatchEvent(new CustomEvent('select', {detail: {value: 'Edit'}}));

    // expect(deleteComment).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Test invalid select option', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-read', {
      is: LwrChatterCommentRead
    });

    // Act
    element.item = mockUnlikedComment;
    document.body.appendChild(element);

    let menu = element.shadowRoot.querySelector('c-lwr-chatter-comment-menu');
    menu.dispatchEvent(new CustomEvent('select', {detail: {value: 'Bad Option'}}));

    expect(deleteComment).toHaveBeenCalledTimes(0);
  });
});