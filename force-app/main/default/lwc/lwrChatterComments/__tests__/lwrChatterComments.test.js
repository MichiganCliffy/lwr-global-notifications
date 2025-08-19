import { createElement } from '@lwc/engine-dom';
import lwrChatterComments from 'c/lwrChatterComments';
import getFeedItemComments from "@salesforce/apex/LwrChatterController.getFeedItemComments";

const mockPostWithComments = require('./data/post-with-comments.json');
const mockPostWithoutComments = require('./data/post-without-comments.json');
const mockPostWithMoreComments = require('./data/post-with-more-comments.json');
const mockLoadMoreComments = require('./data/load-more-comments.json');

jest.mock(
  "@salesforce/apex/LwrChatterController.getFeedItemComments",
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

describe('c-lwr-chatter-comments', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    jest.clearAllMocks();
  });

  it('Test basic scaffolding, no data provided to component', async () => {
    // Arrange
    const element = createElement('c-lwr-chatter-comments', {
      is: lwrChatterComments
    });

    // Act
    document.body.appendChild(element);

    // Assert
    let list = element.shadowRoot.querySelector('ul.comments-list');
    expect(list).toBeNull();
  });

  it('Test basic scaffolding, post without comments provided to component', async () => {
    // Arrange
    const element = createElement('c-lwr-chatter-comments', {
      is: lwrChatterComments
    });

    // Act
    element.item = mockPostWithoutComments;
    document.body.appendChild(element);

    // Assert
    let list = element.shadowRoot.querySelector('ul.comments-list');
    expect(list).toBeNull();
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000qvrrOCAQ');
  });

  it('Test basic scaffolding, post with a minimum number of comments provided to component', async () => {
    // Arrange
    const element = createElement('c-lwr-chatter-comments', {
      is: lwrChatterComments
    });

    // Act
    element.item = mockPostWithComments;
    document.body.appendChild(element);

    // Assert
    let list = element.shadowRoot.querySelector('ul.comments-list');
    expect(list).not.toBeNull();

    let header = element.shadowRoot.querySelector('.comments-heading');
    expect(header).toBeNull();

    let listItems = element.shadowRoot.querySelectorAll('ul.comments-list li');
    expect(listItems.length).toBe(2);
  });

  it('Test forwarding delete event up to parent', async () => {
    // Arrange
    const element = createElement('c-lwr-chatter-comments', {
      is: lwrChatterComments
    });

    const handler = jest.fn();
    element.addEventListener('delete', handler);

    // Act
    element.item = mockPostWithComments;
    document.body.appendChild(element);

    // Assert
    let list = element.shadowRoot.querySelectorAll('c-lwr-chatter-comment');
    expect(list).not.toBeNull();
    expect(list.length).toBe(2);

    let comment = list[0];
    comment.dispatchEvent(new CustomEvent("delete"));
    
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Test forwarding update event up to parent', async () => {
    // Arrange
    const element = createElement('c-lwr-chatter-comments', {
      is: lwrChatterComments
    });

    const handler = jest.fn();
    element.addEventListener('update', handler);

    // Act
    element.item = mockPostWithComments;
    document.body.appendChild(element);

    // Assert
    let list = element.shadowRoot.querySelectorAll('c-lwr-chatter-comment');
    expect(list).not.toBeNull();
    expect(list.length).toBe(2);

    let comment = list[0];
    comment.dispatchEvent(new CustomEvent("update"));
    
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Test forwarding edit toggle event up to parent', async () => {
    // Arrange
    const element = createElement('c-lwr-chatter-comments', {
      is: lwrChatterComments
    });

    const handler = jest.fn();
    element.addEventListener('edittoggle', handler);

    // Act
    element.item = mockPostWithComments;
    document.body.appendChild(element);

    // Assert
    let list = element.shadowRoot.querySelectorAll('c-lwr-chatter-comment');
    expect(list).not.toBeNull();
    expect(list.length).toBe(2);

    let comment = list[0];
    comment.dispatchEvent(new CustomEvent("edittoggle", { detail: { isEditing: true } }));
    
    expect(handler).toHaveBeenCalledTimes(1);

    const event = handler.mock.calls[0][0];
    expect(event).not.toBeNull();
    expect(event.detail).not.toBeNull();
    expect(event.detail.isEditing).toBeTruthy();
  });

  it('Test basic scaffolding, post with more comments provided to component', async () => {
    // Arrange
    const element = createElement('c-lwr-chatter-comments', {
      is: lwrChatterComments
    });

    getFeedItemComments.mockResolvedValue(mockLoadMoreComments);

    // Act
    element.item = mockPostWithMoreComments;
    document.body.appendChild(element);

    // Assert
    let list = element.shadowRoot.querySelector('ul.comments-list');
    expect(list).not.toBeNull();

    let count = element.shadowRoot.querySelector('.comments-heading .slds-text-body_small');
    expect(count).not.toBeNull();
    expect(count.textContent).toBe('3 of 4');

    let loadBtn = element.shadowRoot.querySelector('lightning-button');
    expect(loadBtn).not.toBeNull();
    loadBtn.click();

    await flushPromises();

    expect(getFeedItemComments).toHaveBeenCalledTimes(1);

    let header = element.shadowRoot.querySelector('.comments-heading');
    expect(header).toBeNull();

    let listItems = element.shadowRoot.querySelectorAll('ul.comments-list li');
    expect(listItems.length).toBe(4);
  });

  it('Test load more exception', async () => {
    // Arrange
    const element = createElement('c-lwr-chatter-comments', {
      is: lwrChatterComments
    });

    getFeedItemComments.mockRejectedValue();

    // Act
    element.item = mockPostWithMoreComments;
    document.body.appendChild(element);

    // Assert
    let list = element.shadowRoot.querySelector('ul.comments-list');
    expect(list).not.toBeNull();

    let count = element.shadowRoot.querySelector('.comments-heading .slds-text-body_small');
    expect(count).not.toBeNull();
    expect(count.textContent).toBe('3 of 4');

    let loadBtn = element.shadowRoot.querySelector('lightning-button');
    expect(loadBtn).not.toBeNull();
    loadBtn.click();

    await flushPromises();

    expect(getFeedItemComments).toHaveBeenCalledTimes(1);

    let header = element.shadowRoot.querySelector('.comments-heading');
    expect(header).not.toBeNull();

    let listItems = element.shadowRoot.querySelectorAll('ul.comments-list li');
    expect(listItems.length).toBe(3);
  });
});