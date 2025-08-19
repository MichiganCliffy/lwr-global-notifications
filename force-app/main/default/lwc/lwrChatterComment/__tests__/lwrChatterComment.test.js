import { createElement } from '@lwc/engine-dom';
import LwrChatterComment from 'c/lwrChatterComment';

const mockComment = require('./data/comment.json');

async function flushPromises() {
  return Promise.resolve();
}

describe('c-lwr-chatter-comment', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    jest.clearAllMocks();
  });

  it('Test basic scaffolding', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment', {
      is: LwrChatterComment
    });

    // Act
    element.item = mockComment;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D7al000001PqIzCAK');

    const readView = element.shadowRoot.querySelector('c-lwr-chatter-comment-read');
    expect(readView).not.toBeNull();

    const editView = element.shadowRoot.querySelector('c-lwr-chatter-comment-edit');
    expect(editView).toBeNull();
  });

  it('Test edit view toggle', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment', {
      is: LwrChatterComment
    });

    // Act
    element.item = mockComment;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D7al000001PqIzCAK');

    const readView = element.shadowRoot.querySelector('c-lwr-chatter-comment-read');
    expect(readView).not.toBeNull();

    const editView = element.shadowRoot.querySelector('c-lwr-chatter-comment-edit');
    expect(editView).toBeNull();

    readView.dispatchEvent(new CustomEvent("edit"));

    await flushPromises();

    const editViewCheck = element.shadowRoot.querySelector('c-lwr-chatter-comment-edit');
    expect(editViewCheck).not.toBeNull();

    const readViewCheck = element.shadowRoot.querySelector('c-lwr-chatter-comment-read');
    expect(readViewCheck).toBeNull();

    editViewCheck.dispatchEvent(new CustomEvent("cancel"));

    await flushPromises();

    const editViewFinalCheck = element.shadowRoot.querySelector('c-lwr-chatter-comment-edit');
    expect(editViewFinalCheck).toBeNull();

    const readViewFinalCheck = element.shadowRoot.querySelector('c-lwr-chatter-comment-read');
    expect(readViewFinalCheck).not.toBeNull();
  });

  it('Test passing delete event up the tree', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment', {
      is: LwrChatterComment
    });

    // Act
    element.item = mockComment;

    const handler = jest.fn();
    element.addEventListener('delete', handler);

    document.body.appendChild(element);

    const readView = element.shadowRoot.querySelector('c-lwr-chatter-comment-read');
    expect(readView).not.toBeNull();

    readView.dispatchEvent(new CustomEvent("delete"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Test passing update event up the tree', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment', {
      is: LwrChatterComment
    });

    // Act
    element.item = mockComment;

    const handler = jest.fn();
    element.addEventListener('update', handler);

    document.body.appendChild(element);

    const readView = element.shadowRoot.querySelector('c-lwr-chatter-comment-read');
    expect(readView).not.toBeNull();
    readView.dispatchEvent(new CustomEvent("edit"));

    await flushPromises();

    const editView = element.shadowRoot.querySelector('c-lwr-chatter-comment-edit');
    expect(editView).not.toBeNull();

    editView.dispatchEvent(new CustomEvent("update"));

    await flushPromises();

    expect(handler).toHaveBeenCalledTimes(1);

    const editViewCheck = element.shadowRoot.querySelector('c-lwr-chatter-comment-edit');
    expect(editViewCheck).toBeNull();

    const readViewCheck = element.shadowRoot.querySelector('c-lwr-chatter-comment-read');
    expect(readViewCheck).not.toBeNull();
  });
});