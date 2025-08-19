import { createElement } from '@lwc/engine-dom';
import LwrChatterFeedItemFooter from 'c/lwrChatterFeedItemFooter';

const mockPostWithCommentsAndViews = require('./data/post-with-comments-and-views.json');
const mockPostWithoutCommentsAndViews = require('./data/post-without-comments-and-views.json');
const mockPostWithViewsNoComments = require('./data/post-with-views-no-comments.json');
const mockPostWithCommentsNoViews = require('./data/post-with-comments-no-views.json');

describe('c-lwr-chatter-feed-item-footer', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('Test basic scaffolding, no data provided', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-footer', {
      is: LwrChatterFeedItemFooter
    });

    // Act
    document.body.appendChild(element);

    // Assert
    expect(element.item).toBeNull();
    
    let elements = element.shadowRoot.querySelectorAll('.slds-item');
    expect(elements.length).toBe(0);
  });

  it('Test providing post with comments and views', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-footer', {
      is: LwrChatterFeedItemFooter
    });

    // Act
    element.item = mockPostWithCommentsAndViews;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000mfQSmCAM');
    
    let elements = element.shadowRoot.querySelectorAll('.slds-item');
    expect(elements.length).toBe(2);

    elements.forEach(item => {
      if (item.classList.contains('comments')) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(item.textContent).toBe('2 comments');
      }

      if (item.classList.contains('views')) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(item.textContent).toBe('2 views');
      }
    });
  });

  it('Test providing post without comments and views', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-footer', {
      is: LwrChatterFeedItemFooter
    });

    // Act
    element.item = mockPostWithoutCommentsAndViews;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000qvrrOCAQ');
    
    let elements = element.shadowRoot.querySelectorAll('.slds-item');
    expect(elements.length).toBe(0);
  });

  it('Test providing post with views only', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-footer', {
      is: LwrChatterFeedItemFooter
    });

    // Act
    element.item = mockPostWithViewsNoComments;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000qvwsgCAA');
    
    let elements = element.shadowRoot.querySelectorAll('.slds-item');
    expect(elements.length).toBe(1);
    expect(elements[0].textContent).toBe('2 views');
  });

  it('Test providing post with comments only', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-footer', {
      is: LwrChatterFeedItemFooter
    });

    // Act
    element.item = mockPostWithCommentsNoViews;
    document.body.appendChild(element);

    // Assert
    expect(element.item).not.toBeNull();
    expect(element.item.id).toBe('0D5al00000mfQSmCAM');
    
    let elements = element.shadowRoot.querySelectorAll('.slds-item');
    expect(elements.length).toBe(1);
    expect(elements[0].textContent).toBe('2 comments');
  });
});