import { createElement } from '@lwc/engine-dom';
import LwrChatterFeedItemTitle from 'c/lwrChatterFeedItemTitle';
import { mockGenerate, getGenerateUrlCalledWith } from 'lightning/navigation';

const mockHeader = require('./data/sample-header.json');
const mockHeaderWithBadReference = require('./data/sample-header-bad-reference.json');
const mockMapping = {
  "003al000000XgDRAA0": "Contact",
  "005al000000MFmnAAG": "User"
};

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

describe('c-lwr-chatter-feed-item-title', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    jest.clearAllMocks();
  });

  it('Test scaffolding', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-title', {
      is: LwrChatterFeedItemTitle
    });

    // Act
    element.header = mockHeader;
    element.mapping = mockMapping;
    document.body.appendChild(element);

    // Assert
    expect(element.header).not.toBeNull();
    expect(element.header.text).toBe('Andy Young — bclifford');

    expect(element.items).not.toBeNull();
    expect(element.items.length).toBe(3);

    let links = element.items.filter(item => item.isLink);
    expect(links).not.toBeNull();
    expect(links.length).toBe(2);

    let buttons = element.shadowRoot.querySelectorAll('lightning-button');
    expect(buttons).not.toBe(null);
    expect(buttons.length).toBe(2);
  });

  it('Test link click', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-title', {
      is: LwrChatterFeedItemTitle
    });

    // Act
    element.header = mockHeader;
    element.mapping = mockMapping;
    document.body.appendChild(element);

    // Assert
    let buttons = element.shadowRoot.querySelectorAll('lightning-button');
    expect(buttons).not.toBe(null);
    expect(buttons.length).toBe(2);

    buttons[0].click();

    expect(mockGenerate).toHaveBeenCalledTimes(1);
    let navigation = getGenerateUrlCalledWith();

    expect(navigation).not.toBeNull();
    expect(navigation.pageReference).not.toBeNull();
    let pageReference = navigation.pageReference;

    expect(pageReference.type).toBe('standard__recordPage');
    expect(pageReference.attributes).not.toBeNull();

    let attributes = pageReference.attributes;
    expect(attributes.actionName).toBe('view');
  });

  it('Test link click with a bad reference', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-title', {
      is: LwrChatterFeedItemTitle
    });

    // Act
    element.header = mockHeaderWithBadReference;
    element.mapping = mockMapping;
    document.body.appendChild(element);

    // Assert
    let buttons = element.shadowRoot.querySelectorAll('lightning-button');
    buttons[0].click();

    expect(mockGenerate).toHaveBeenCalledTimes(0);
  });
});