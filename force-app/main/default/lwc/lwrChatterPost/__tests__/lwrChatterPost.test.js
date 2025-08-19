import { createElement } from '@lwc/engine-dom';
import LwrChatterPost from 'c/lwrChatterPost';
import { CurrentPageReference } from 'lightning/navigation';
import getFeedItem from "@salesforce/apex/LwrChatterController.getFeedItem";

const mockCurrentPageReference = require('./data/currentPageReference.json')
const mockFeedItem = require('./data/feed-post.json')

jest.mock(
  "@salesforce/apex/LwrChatterController.getFeedItem",
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

async function flushPromises() {
  return Promise.resolve();
}

describe('c-lwr-chatter-post', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    jest.clearAllMocks();
  });

  it('Test basic scaffolding', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-post', {
      is: LwrChatterPost
    });

    CurrentPageReference.emit(mockCurrentPageReference);
    getFeedItem.mockResolvedValue(mockFeedItem);

    // Act
    document.body.appendChild(element);
    await flushPromises();

    // Assert
    expect(element.recordId).toBe('0D5al00000r2g8tCAA');

    const post = element.shadowRoot.querySelector('c-lwr-chatter-feed-item');
    expect(post).not.toBeNull();
    expect(post.item.id).toBe(mockFeedItem.feedElement.id);
  });

  it('Test basic getters and setters', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-post', {
      is: LwrChatterPost
    });

    // Act
    element.recordId = 'ABCDEFG';

    // Assert
    expect(element.recordId).toBe('ABCDEFG');
  });

  it('Test apex exception handling', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-post', {
      is: LwrChatterPost
    });

    CurrentPageReference.emit(mockCurrentPageReference);
    getFeedItem.mockRejectedValue();

    // Act
    document.body.appendChild(element);
    await flushPromises();

    // Assert
    expect(element.recordId).toBe('0D5al00000r2g8tCAA');

    const post = element.shadowRoot.querySelector('c-lwr-chatter-feed-item');
    expect(post).toBeNull();
  });

  it('Test CurrentPageReference exception handling', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-post', {
      is: LwrChatterPost
    });

    CurrentPageReference.emit(null);

    // Act
    document.body.appendChild(element);
    await flushPromises();

    // Assert
    expect(element.recordId).toBeNull();

    const post = element.shadowRoot.querySelector('c-lwr-chatter-feed-item');
    expect(post).toBeNull();
  });
});