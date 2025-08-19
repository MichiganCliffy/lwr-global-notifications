import { createElement } from '@lwc/engine-dom';
import LwrChatterFeedActions from 'c/lwrChatterFeedActions';

describe('c-lwr-chatter-feed-actions', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('Test basic scaffolding', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-actions', {
      is: LwrChatterFeedActions
    });

    // Act
    document.body.appendChild(element);

    // Assert
    expect(element.sortOrder).toBe('CreatedDateDesc');

    let combobox = element.shadowRoot.querySelector('lightning-combobox');
    expect(combobox).not.toBe(null);
    expect(combobox.value).toBe('CreatedDateDesc');

    element.sortOrder = 'Test';
    expect(element.sortOrder).toBe('Test');
  });

  it('Test sorting event', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-actions', {
      is: LwrChatterFeedActions
    });

    // Act
    const handler = jest.fn();
    element.addEventListener('sort', handler);

    document.body.appendChild(element);

    // Assert
    let combobox = element.shadowRoot.querySelector('lightning-combobox');
    expect(combobox).not.toBe(null);
    combobox.dispatchEvent(new CustomEvent('change', {
      detail: { value: 'LastModifiedDateDesc' }
    }));

    expect(handler).toHaveBeenCalledTimes(1);

    const event = handler.mock.calls[0][0];
    expect(event).not.toBeNull();
    expect(event.detail).not.toBeNull();
    expect(event.detail).toBe('LastModifiedDateDesc');
  });

  it('Test search event', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-actions', {
      is: LwrChatterFeedActions
    });

    // Act
    const handler = jest.fn();
    element.addEventListener('search', handler);

    document.body.appendChild(element);

    // Assert
    let searchField = element.shadowRoot.querySelector('lightning-input');
    expect(searchField).not.toBe(null);
    searchField.value = 'Test';
    searchField.dispatchEvent(new CustomEvent('commit'));

    expect(handler).toHaveBeenCalledTimes(1);

    const event = handler.mock.calls[0][0];
    expect(event).not.toBeNull();
    expect(event.detail).not.toBeNull();
    expect(event.detail).toBe('Test');
  });
});