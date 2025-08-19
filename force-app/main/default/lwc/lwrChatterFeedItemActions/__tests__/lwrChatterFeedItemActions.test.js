import { createElement } from '@lwc/engine-dom';
import LwrChatterFeedItemActions from 'c/lwrChatterFeedItemActions';
import likeFeedElement from "@salesforce/apex/LwrChatterController.likeFeedElement";
import unlikeFeedElement from "@salesforce/apex/LwrChatterController.unlikeFeedElement";

const mockLikedPost = require('./data/item-liked.json');
const mockUnlikedPost = require('./data/item-unliked.json');

jest.mock(
  "@salesforce/apex/LwrChatterController.likeFeedElement",
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
  "@salesforce/apex/LwrChatterController.unlikeFeedElement",
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

describe('c-lwr-chatter-feed-item-actions', () => {
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
    const element = createElement('c-lwr-chatter-feed-item-actions', {
      is: LwrChatterFeedItemActions
    });

    // Act
    document.body.appendChild(element);

    // Assert
    expect(element.item).toBeNull();

    const likeBtn = element.shadowRoot.querySelector('button.like-action');
    expect(likeBtn).not.toBeNull();
    expect(likeBtn.textContent).toBe('Like');
  });

  it('Test basic scaffolding, unliked post', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-actions', {
      is: LwrChatterFeedItemActions
    });

    // Act
    element.item = mockUnlikedPost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    const likeBtn = element.shadowRoot.querySelector('button.like-action');
    expect(likeBtn).not.toBeNull();
    expect(likeBtn.textContent).toBe('Like');
    expect(likeBtn.classList.contains('slds-is-active')).toBeFalsy();
  });

  it('Test basic scaffolding, liked post', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-actions', {
      is: LwrChatterFeedItemActions
    });

    // Act
    element.item = mockLikedPost;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000qvwsgCAA');

    const likeBtn = element.shadowRoot.querySelector('button.like-action');
    expect(likeBtn).not.toBeNull();
    expect(likeBtn.textContent).toBe('Liked');
    expect(likeBtn.classList.contains('slds-is-active')).toBeTruthy();
  });

  it('Test basic scaffolding, comment button click', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-actions', {
      is: LwrChatterFeedItemActions
    });

    // Act
    element.item = mockUnlikedPost;

    const handler = jest.fn();
    element.addEventListener('comment', handler);

    document.body.appendChild(element);

    // Assert
    const commentBtn = element.shadowRoot.querySelector('button.comment-action');
    expect(commentBtn).not.toBeNull();
    commentBtn.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Test basic scaffolding, like click', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-actions', {
      is: LwrChatterFeedItemActions
    });

    // Act
    element.item = mockUnlikedPost;
    document.body.appendChild(element);

    // Assert
    const likeBtn = element.shadowRoot.querySelector('button.like-action');
    expect(likeBtn).not.toBeNull();
    likeBtn.click();

    expect(likeFeedElement).toHaveBeenCalledTimes(1);
    expect(unlikeFeedElement).toHaveBeenCalledTimes(0);
  });

  it('Test basic scaffolding, unlike click', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-actions', {
      is: LwrChatterFeedItemActions
    });

    // Act
    element.item = mockLikedPost;
    document.body.appendChild(element);

    // Assert
    const likeBtn = element.shadowRoot.querySelector('button.like-action');
    expect(likeBtn).not.toBeNull();
    likeBtn.click();

    expect(likeFeedElement).toHaveBeenCalledTimes(0);
    expect(unlikeFeedElement).toHaveBeenCalledTimes(1);
  });
});