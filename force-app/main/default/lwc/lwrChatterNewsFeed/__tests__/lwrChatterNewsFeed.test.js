import { createElement } from '@lwc/engine-dom';
import LwrChatterNewsFeed from 'c/lwrChatterNewsFeed';
import { broadcastFeedUpdate } from 'c/lwrChatterUtilities';
import getNewsFeed from "@salesforce/apex/LwrChatterController.getNewsFeed";
import searchNewsFeed from "@salesforce/apex/LwrChatterController.searchNewsFeed";

const mockFeed = require('./data/feed.json');
const mockFeedWithMore = require('./data/feed-with-more.json');
const mockLoadMore = require('./data/load-more.json');

jest.mock(
  "@salesforce/apex/LwrChatterController.getNewsFeed",
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
  "@salesforce/apex/LwrChatterController.searchNewsFeed",
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

describe('c-lwr-chatter-news-feed', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    jest.clearAllMocks();
  });

  it('Test basic scaffolding and load', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-news-feed', {
      is: LwrChatterNewsFeed
    });

    getNewsFeed.mockResolvedValue(mockFeed);

    // Act
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    expect(getNewsFeed).toHaveBeenCalled();
    expect(getNewsFeed).toHaveBeenCalledWith({
      pageToken: null,
      pageSize: 10,
      sortOrder: 'CreatedDateDesc'
    });

    const items = element.shadowRoot.querySelectorAll('c-lwr-chatter-feed-item');
    expect(items.length).toBe(17);
  });

  it('Test basic scaffolding with load error', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-news-feed', {
      is: LwrChatterNewsFeed
    });

    getNewsFeed.mockRejectedValue();

    // Act
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    expect(getNewsFeed).toHaveBeenCalled();
  });

  it('Test basic search', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-news-feed', {
      is: LwrChatterNewsFeed
    });

    getNewsFeed.mockResolvedValue(mockFeed);
    searchNewsFeed.mockResolvedValue(mockFeed);

    // Act
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    expect(getNewsFeed).toHaveBeenCalled();

    const actions = element.shadowRoot.querySelector('c-lwr-chatter-feed-actions');
    actions.dispatchEvent(new CustomEvent('search', {detail: 'Test'}));

    await flushPromises();

    expect(searchNewsFeed).toHaveBeenCalled();
    expect(searchNewsFeed).toHaveBeenCalledWith({
      searchTerm: 'Test',
      pageToken: null,
      pageSize: 10,
      sortOrder: 'CreatedDateDesc'
    });
  });

  it('Test basic search with error', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-news-feed', {
      is: LwrChatterNewsFeed
    });

    getNewsFeed.mockResolvedValue(mockFeed);
    searchNewsFeed.mockRejectedValue();

    // Act
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    expect(getNewsFeed).toHaveBeenCalled();

    const actions = element.shadowRoot.querySelector('c-lwr-chatter-feed-actions');
    actions.dispatchEvent(new CustomEvent('search', {detail: 'Test'}));

    expect(searchNewsFeed).toHaveBeenCalled();
  });

  it('Test search clearing', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-news-feed', {
      is: LwrChatterNewsFeed
    });

    getNewsFeed.mockResolvedValue(mockFeed);
    searchNewsFeed.mockResolvedValue(mockFeed);

    // Act
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    const actions = element.shadowRoot.querySelector('c-lwr-chatter-feed-actions');
    actions.dispatchEvent(new CustomEvent('search', {detail: 'Test'}));

    await flushPromises();

    actions.dispatchEvent(new CustomEvent('search', {detail: ''}));

    expect(getNewsFeed).toHaveBeenCalledTimes(2);
    expect(searchNewsFeed).toHaveBeenCalledTimes(1);

    expect(getNewsFeed).toHaveBeenCalledWith({
      pageToken: null,
      pageSize: 10,
      sortOrder: 'CreatedDateDesc'
    });
  });

  it('Test broadcasted update', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-news-feed', {
      is: LwrChatterNewsFeed
    });

    getNewsFeed.mockResolvedValue(mockFeed);

    // Act
    document.body.appendChild(element);

    await flushPromises();

    broadcastFeedUpdate();

    await flushPromises();

    // Assert
    expect(getNewsFeed).toHaveBeenCalledTimes(2);
  });

  it('Test broadcasted update with search', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-news-feed', {
      is: LwrChatterNewsFeed
    });

    getNewsFeed.mockResolvedValue(mockFeed);
    searchNewsFeed.mockResolvedValue(mockFeed);

    // Act
    document.body.appendChild(element);

    await flushPromises();

    const actions = element.shadowRoot.querySelector('c-lwr-chatter-feed-actions');
    actions.dispatchEvent(new CustomEvent('search', {detail: 'Test'}));

    broadcastFeedUpdate();

    await flushPromises();

    // Assert
    expect(getNewsFeed).toHaveBeenCalledTimes(1);
    expect(searchNewsFeed).toHaveBeenCalledTimes(2);
  });

  it('Test basic sort', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-news-feed', {
      is: LwrChatterNewsFeed
    });

    getNewsFeed.mockResolvedValue(mockFeed);

    // Act
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    const actions = element.shadowRoot.querySelector('c-lwr-chatter-feed-actions');
    actions.dispatchEvent(new CustomEvent('sort', {detail: 'Test'}));

    await flushPromises();

    expect(getNewsFeed).toHaveBeenCalledTimes(2);
    expect(getNewsFeed).toHaveBeenCalledWith({
      pageToken: null,
      pageSize: 10,
      sortOrder: 'Test'
    });
  });

  it('Test sort with search', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-news-feed', {
      is: LwrChatterNewsFeed
    });

    getNewsFeed.mockResolvedValue(mockFeed);
    searchNewsFeed.mockResolvedValue(mockFeed);

    // Act
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    const actions = element.shadowRoot.querySelector('c-lwr-chatter-feed-actions');
    actions.dispatchEvent(new CustomEvent('search', {detail: 'Test'}));

    await flushPromises();

    actions.dispatchEvent(new CustomEvent('sort', {detail: 'Test'}));

    await flushPromises();
    
    expect(getNewsFeed).toHaveBeenCalledTimes(1);
    expect(searchNewsFeed).toHaveBeenCalledTimes(2);
    expect(searchNewsFeed).toHaveBeenCalledWith({
      searchTerm: 'Test',
      pageToken: null,
      pageSize: 10,
      sortOrder: 'Test'
    });

  });

  it('Test loading feed when feed item is updated', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-news-feed', {
      is: LwrChatterNewsFeed
    });

    getNewsFeed.mockResolvedValue(mockFeed);

    // Act
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    const items = element.shadowRoot.querySelectorAll('c-lwr-chatter-feed-item');
    expect(items.length).not.toBe(0);

    const item = items[0];
    item.dispatchEvent(new CustomEvent('update'));

    expect(getNewsFeed).toHaveBeenCalledTimes(2);
  });

  it('Test searching feed when feed item is updated', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-news-feed', {
      is: LwrChatterNewsFeed
    });

    getNewsFeed.mockResolvedValue(mockFeed);
    searchNewsFeed.mockResolvedValue(mockFeed);

    // Act
    document.body.appendChild(element);

    await flushPromises();

    const actions = element.shadowRoot.querySelector('c-lwr-chatter-feed-actions');
    actions.dispatchEvent(new CustomEvent('search', {detail: 'Test'}));

    await flushPromises();

    // Assert
    const items = element.shadowRoot.querySelectorAll('c-lwr-chatter-feed-item');
    expect(items.length).not.toBe(0);

    const item = items[0];
    item.dispatchEvent(new CustomEvent('update'));

    expect(getNewsFeed).toHaveBeenCalledTimes(1);
    expect(searchNewsFeed).toHaveBeenCalledTimes(2);
  });

  it('Test loading more posts', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-news-feed', {
      is: LwrChatterNewsFeed
    });

    getNewsFeed.mockResolvedValue(mockFeedWithMore);

    // Act
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    expect(getNewsFeed).toHaveBeenCalled();
    expect(getNewsFeed).toHaveBeenCalledWith({
      pageToken: null,
      pageSize: 10,
      sortOrder: 'CreatedDateDesc'
    });

    let items = element.shadowRoot.querySelectorAll('c-lwr-chatter-feed-item');
    expect(items.length).toBe(10);

    let loadMoreBtn = element.shadowRoot.querySelector('lightning-button');
    expect(loadMoreBtn).not.toBeNull();

    getNewsFeed.mockResolvedValue(mockLoadMore);

    loadMoreBtn.click();

    await flushPromises();

    expect(getNewsFeed).toHaveBeenCalledTimes(2);

    items = element.shadowRoot.querySelectorAll('c-lwr-chatter-feed-item');
    expect(items.length).toBe(13);

    loadMoreBtn = element.shadowRoot.querySelector('lightning-button');
    expect(loadMoreBtn).toBeNull();
  });
});