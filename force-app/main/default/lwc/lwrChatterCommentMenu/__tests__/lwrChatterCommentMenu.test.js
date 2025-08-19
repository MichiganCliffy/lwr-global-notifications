import { createElement } from '@lwc/engine-dom';
import LwrChatterCommentMenu from 'c/lwrChatterCommentMenu';

const mockEditableComment = require('./data/editable-comment.json');
const mockDeletableComment = require('./data/deletable-comment.json');
const mockReadOnlyComment = require('./data/readonly-comment.json');

describe('c-lwr-chatter-comment-menu', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('Test basic scaffolding, no data provided', async () => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-menu', {
      is: LwrChatterCommentMenu
    });

    // Act
    document.body.appendChild(element);

    // Assert
    let menu = element.shadowRoot.querySelector('lightning-button-menu');
    expect(menu).toBeNull();
  });

  it('Test basic scaffolding, read only comment', async () => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-menu', {
      is: LwrChatterCommentMenu
    });

    // Act
    element.item = mockReadOnlyComment;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D7al000001PqIzCAK');

    let menu = element.shadowRoot.querySelector('lightning-button-menu');
    expect(menu).toBeNull();
  });

  it('Test basic scaffolding, delete only comment', async () => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-menu', {
      is: LwrChatterCommentMenu
    });

    // Act
    element.item = mockDeletableComment;
    document.body.appendChild(element);

    // Assert
    expect(element.canDelete).toBe(true);
    expect(element.canEdit).toBe(false);

    let menu = element.shadowRoot.querySelector('lightning-button-menu');
    expect(menu).not.toBeNull();
  });

  it('Test basic scaffolding, editable comment', async () => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-menu', {
      is: LwrChatterCommentMenu
    });

    // Act
    element.item = mockEditableComment;
    document.body.appendChild(element);

    // Assert
    expect(element.canDelete).toBe(true);
    expect(element.canEdit).toBe(true);

    let menu = element.shadowRoot.querySelector('lightning-button-menu');
    expect(menu).not.toBeNull();
  });

  it('Test menu selection event', async () => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-menu', {
      is: LwrChatterCommentMenu
    });

    // Act
    element.item = mockEditableComment;

    const handler = jest.fn();
    element.addEventListener('select', handler);

    document.body.appendChild(element);

    // Assert
    let menu = element.shadowRoot.querySelector('lightning-button-menu');
    expect(menu).not.toBeNull();

    menu.dispatchEvent(new CustomEvent('select', {
      detail: { value: 'Delete' }
    }));

    expect(handler).toHaveBeenCalledTimes(1);
  });
});