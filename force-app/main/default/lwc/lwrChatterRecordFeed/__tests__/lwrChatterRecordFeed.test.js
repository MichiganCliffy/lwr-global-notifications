import { createElement } from '@lwc/engine-dom';
import LwrChatterRecordFeed from 'c/lwrChatterRecordFeed';
import { CurrentPageReference } from 'lightning/navigation';
import { broadcastFeedUpdate } from 'c/lwrChatterUtilities';
import getRecordFeed from "@salesforce/apex/LwrChatterController.getRecordFeed";
import searchRecordFeed from "@salesforce/apex/LwrChatterController.searchRecordFeed";

const mockFeed = require('./data/feed.json');
const mockCurrentPageReference = require('./data/currentPageReference.json')
const mockFeedWithMore = require('./data/feed-with-more.json');
const mockLoadMore = require('./data/load-more.json');

jest.mock(
  "@salesforce/apex/LwrChatterController.getRecordFeed",
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
  "@salesforce/apex/LwrChatterController.searchRecordFeed",
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

describe('c-lwr-chatter-record-feed', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    jest.clearAllMocks();
  });

  it('Test basic scaffolding and load', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-record-feed', {
      is: LwrChatterRecordFeed
    });

    CurrentPageReference.emit(mockCurrentPageReference);
    getRecordFeed.mockResolvedValue(mockFeed);

    // Act
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    expect(element.recordId).toBe('006al000000WfCyAAK');
    expect(getRecordFeed).toHaveBeenCalled();
    expect(getRecordFeed).toHaveBeenCalledWith({
      recordId: '006al000000WfCyAAK',
      pageToken: null,
      pageSize: 10,
      sortOrder: 'CreatedDateDesc'
    });

    const items = element.shadowRoot.querySelectorAll('c-lwr-chatter-feed-item');
    expect(items.length).toBe(8);
  });

  it('Test basic scaffolding with load error', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-record-feed', {
      is: LwrChatterRecordFeed
    });

    getRecordFeed.mockRejectedValue();

    // Act
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    expect(getRecordFeed).toHaveBeenCalled();
  });

  it('Test basic search', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-record-feed', {
      is: LwrChatterRecordFeed
    });

    getRecordFeed.mockResolvedValue(mockFeed);
    searchRecordFeed.mockResolvedValue(mockFeed);

    // Act
    element.recordId = '1234567890';
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    expect(getRecordFeed).toHaveBeenCalled();

    const actions = element.shadowRoot.querySelector('c-lwr-chatter-feed-actions');
    actions.dispatchEvent(new CustomEvent('search', {detail: 'Test'}));

    await flushPromises();

    expect(searchRecordFeed).toHaveBeenCalled();
    expect(searchRecordFeed).toHaveBeenCalledWith({
      recordId: '1234567890',
      searchTerm: 'Test',
      pageToken: null,
      pageSize: 10,
      sortOrder: 'CreatedDateDesc'
    });
  });

  it('Test basic search with error', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-record-feed', {
      is: LwrChatterRecordFeed
    });

    getRecordFeed.mockResolvedValue(mockFeed);
    searchRecordFeed.mockRejectedValue();

    // Act
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    expect(getRecordFeed).toHaveBeenCalled();

    const actions = element.shadowRoot.querySelector('c-lwr-chatter-feed-actions');
    actions.dispatchEvent(new CustomEvent('search', {detail: 'Test'}));

    expect(searchRecordFeed).toHaveBeenCalled();
  });

  it('Test search clearing', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-record-feed', {
      is: LwrChatterRecordFeed
    });

    getRecordFeed.mockResolvedValue(mockFeed);
    searchRecordFeed.mockResolvedValue(mockFeed);

    // Act
    element.recordId = '1234567890';
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    const actions = element.shadowRoot.querySelector('c-lwr-chatter-feed-actions');
    actions.dispatchEvent(new CustomEvent('search', {detail: 'Test'}));

    await flushPromises();

    actions.dispatchEvent(new CustomEvent('search', {detail: ''}));

    expect(getRecordFeed).toHaveBeenCalledTimes(2);
    expect(searchRecordFeed).toHaveBeenCalledTimes(1);

    expect(getRecordFeed).toHaveBeenCalledWith({
      recordId: '1234567890',
      pageToken: null,
      pageSize: 10,
      sortOrder: 'CreatedDateDesc'
    });
  });

  it('Test broadcasted update', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-record-feed', {
      is: LwrChatterRecordFeed
    });

    getRecordFeed.mockResolvedValue(mockFeed);

    // Act
    document.body.appendChild(element);

    await flushPromises();

    broadcastFeedUpdate();

    await flushPromises();

    // Assert
    expect(getRecordFeed).toHaveBeenCalledTimes(2);
  });

  it('Test broadcasted update with search', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-record-feed', {
      is: LwrChatterRecordFeed
    });

    getRecordFeed.mockResolvedValue(mockFeed);
    searchRecordFeed.mockResolvedValue(mockFeed);

    // Act
    document.body.appendChild(element);

    await flushPromises();

    const actions = element.shadowRoot.querySelector('c-lwr-chatter-feed-actions');
    actions.dispatchEvent(new CustomEvent('search', {detail: 'Test'}));

    broadcastFeedUpdate();

    await flushPromises();

    // Assert
    expect(getRecordFeed).toHaveBeenCalledTimes(1);
    expect(searchRecordFeed).toHaveBeenCalledTimes(2);
  });

  it('Test basic sort', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-record-feed', {
      is: LwrChatterRecordFeed
    });

    getRecordFeed.mockResolvedValue(mockFeed);

    // Act
    element.recordId = '1234567890';
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    const actions = element.shadowRoot.querySelector('c-lwr-chatter-feed-actions');
    actions.dispatchEvent(new CustomEvent('sort', {detail: 'Test'}));

    await flushPromises();

    expect(getRecordFeed).toHaveBeenCalledTimes(2);
    expect(getRecordFeed).toHaveBeenCalledWith({
      recordId: '1234567890',
      pageToken: null,
      pageSize: 10,
      sortOrder: 'Test'
    });
  });

  it('Test sort with search', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-record-feed', {
      is: LwrChatterRecordFeed
    });

    getRecordFeed.mockResolvedValue(mockFeed);
    searchRecordFeed.mockResolvedValue(mockFeed);

    // Act
    element.recordId = '1234567890';
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    const actions = element.shadowRoot.querySelector('c-lwr-chatter-feed-actions');
    actions.dispatchEvent(new CustomEvent('search', {detail: 'Test'}));

    await flushPromises();

    actions.dispatchEvent(new CustomEvent('sort', {detail: 'Test'}));

    await flushPromises();
    
    expect(getRecordFeed).toHaveBeenCalledTimes(1);
    expect(searchRecordFeed).toHaveBeenCalledTimes(2);
    expect(searchRecordFeed).toHaveBeenCalledWith({
      recordId: '1234567890',
      searchTerm: 'Test',
      pageToken: null,
      pageSize: 10,
      sortOrder: 'Test'
    });

  });

  it('Test loading feed when feed item is updated', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-record-feed', {
      is: LwrChatterRecordFeed
    });

    getRecordFeed.mockResolvedValue(mockFeed);

    // Act
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    const items = element.shadowRoot.querySelectorAll('c-lwr-chatter-feed-item');
    expect(items.length).not.toBe(0);

    const item = items[0];
    item.dispatchEvent(new CustomEvent('update'));

    expect(getRecordFeed).toHaveBeenCalledTimes(2);
  });

  it('Test searching feed when feed item is updated', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-record-feed', {
      is: LwrChatterRecordFeed
    });

    getRecordFeed.mockResolvedValue(mockFeed);
    searchRecordFeed.mockResolvedValue(mockFeed);

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

    expect(getRecordFeed).toHaveBeenCalledTimes(1);
    expect(searchRecordFeed).toHaveBeenCalledTimes(2);
  });

  it('Test loading more', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-record-feed', {
      is: LwrChatterRecordFeed
    });

    CurrentPageReference.emit(mockCurrentPageReference);
    getRecordFeed.mockResolvedValue(mockFeedWithMore);

    // Act
    document.body.appendChild(element);

    await flushPromises();

    // Assert
    expect(element.recordId).toBe('006al000000WfCyAAK');
    expect(getRecordFeed).toHaveBeenCalled();
    expect(getRecordFeed).toHaveBeenCalledWith({
      recordId: '006al000000WfCyAAK',
      pageToken: null,
      pageSize: 10,
      sortOrder: 'CreatedDateDesc'
    });

    let items = element.shadowRoot.querySelectorAll('c-lwr-chatter-feed-item');
    expect(items.length).toBe(10);

    let loadMoreBtn = element.shadowRoot.querySelector('lightning-button');
    expect(loadMoreBtn).not.toBeNull();

    getRecordFeed.mockResolvedValue(mockLoadMore);

    loadMoreBtn.click();

    await flushPromises();

    expect(getRecordFeed).toHaveBeenCalledTimes(2);
    expect(getRecordFeed).toHaveBeenCalledWith({
      recordId: '006al000000WfCyAAK',
      pageToken: '2025-02-27T17:04:30Z,0D5al00000mfN0HCAU,,2,',
      pageSize: 10,
      sortOrder: 'CreatedDateDesc'
    });

    items = element.shadowRoot.querySelectorAll('c-lwr-chatter-feed-item');
    expect(items.length).toBe(11)

    loadMoreBtn = element.shadowRoot.querySelector('lightning-button');
    expect(loadMoreBtn).toBeNull();
  });
});