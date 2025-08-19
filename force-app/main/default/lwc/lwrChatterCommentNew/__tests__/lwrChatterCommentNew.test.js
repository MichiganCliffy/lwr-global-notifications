import { createElement } from '@lwc/engine-dom';
import LwrChatterCommentNew from 'c/lwrChatterCommentNew';
import lwrChatterFileUpload from 'c/lwrChatterFileUpload';
import commentOnFeedElement from "@salesforce/apex/LwrChatterController.commentOnFeedElement";
import searchUsers from '@salesforce/apex/LwrChatterController.searchUsers'
import { createRecord } from "lightning/uiRecordApi";
import getContentDocumentId from "@salesforce/apex/LwrFilesController.getContentDocumentId";

const mockModelWithFile = require('./data/modal-with-file.json');

jest.mock(
  "@salesforce/apex/LwrChatterController.commentOnFeedElement",
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
  "@salesforce/apex/LwrChatterController.searchUsers",
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
  "@salesforce/apex/LwrFilesController.getContentDocumentId",
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

describe('c-lwr-chatter-comment-new', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('Test basic scaffolding', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-new', {
      is: LwrChatterCommentNew
    });

    // Act
    document.body.appendChild(element);

    // Assert
    let toggle = element.shadowRoot.querySelector('.toggle');
    expect(toggle).not.toBeNull();

    let comment = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(comment).toBeNull();
  });

  it('Test toggling forms', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-new', {
      is: LwrChatterCommentNew
    });

    // Act
    element.toggleForm();
    document.body.appendChild(element);

    // Assert
    let toggle = element.shadowRoot.querySelector('.toggle');
    expect(toggle).toBeNull();

    let comment = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(comment).not.toBeNull();
  });

  it('Test passing search term to mention lookup component', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-new', {
      is: LwrChatterCommentNew
    });

    // Act
    element.toggleForm();
    document.body.appendChild(element);

    const mentionLookup = element.shadowRoot.querySelector('c-lwr-chatter-mention-lookup');
    expect(mentionLookup).not.toBeNull();

    let comment = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(comment).not.toBeNull();
    comment.value = "123456";
    comment.dispatchEvent(new CustomEvent('change'));
    jest.runAllTimers();

    expect(mentionLookup.searchTerm).toBe('123456');
  });

  it('Test passing a mention back from the mention lookup component and submitting the comment', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-new', {
      is: LwrChatterCommentNew
    });

    searchUsers.mockResolvedValue([{Id: '123456789', Name: 'Bill Clifford'}]);
    commentOnFeedElement.mockResolvedValue({});

    // Act
    element.feedItemId = 'ABCDEFG';
    element.toggleForm();
    document.body.appendChild(element);

    let comment = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(comment).not.toBeNull();
    comment.value = "This is a @bclifford test message";
    comment.dispatchEvent(new CustomEvent('change'));
    jest.runAllTimers();
    await flushPromises();

    const mentionLookup = element.shadowRoot.querySelector('c-lwr-chatter-mention-lookup');
    expect(mentionLookup).not.toBeNull();

    mentionLookup.mentionMap.set('[Bill Clifford]', '123456789');
    mentionLookup.dispatchEvent(new CustomEvent('select', {
      detail: {
        id: '123456789',
        search: 'bclifford',
        name: 'Bill Clifford',
        mention: '[Bill Clifford]'
      }
    }));

    let commentValidation = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(commentValidation.value).toBe('This is a [Bill Clifford] test message');

    const submitBtn = element.shadowRoot.querySelector('lightning-button');
    submitBtn.click();

    expect(commentOnFeedElement).toHaveBeenCalledTimes(1);
    expect(commentOnFeedElement).toHaveBeenCalledWith({
        feedElementId: 'ABCDEFG',
        contentDocumentId: null,
        comment: 'This is a {123456789} test message'
      });
  });

  it('Test comment submission failure', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-new', {
      is: LwrChatterCommentNew
    });

    commentOnFeedElement.mockRejectedValue();

    // Act
    element.feedItemId = 'ABCDEFG';
    element.toggleForm();
    document.body.appendChild(element);

    let comment = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(comment).not.toBeNull();
    comment.value = "This is a @bclifford test message";

    const mentionLookup = element.shadowRoot.querySelector('c-lwr-chatter-mention-lookup');
    expect(mentionLookup).not.toBeNull();

    mentionLookup.mentionMap.set('[Bill Clifford]', '123456789');
    mentionLookup.dispatchEvent(new CustomEvent('select', {
      detail: {
        id: '123456789',
        search: 'bclifford',
        name: 'Bill Clifford',
        mention: '[Bill Clifford]'
      }
    }));

    let commentValidation = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(commentValidation.value).toBe('This is a [Bill Clifford] test message');

    const submitBtn = element.shadowRoot.querySelector('lightning-button');
    submitBtn.click();

    expect(commentOnFeedElement).toHaveBeenCalledTimes(1);
  });

  it('Test opening and closing attachment modal', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-new', {
      is: LwrChatterCommentNew
    });

    // Act
    element.toggleForm();
    document.body.appendChild(element);

    // Assert
    let toggle = element.shadowRoot.querySelector('lightning-button-icon.add-attachment');
    expect(toggle).not.toBeNull();

    lwrChatterFileUpload.open = jest.fn().mockResolvedValue(mockModelWithFile);
    toggle.click();

    await flushPromises();

    expect(lwrChatterFileUpload.open).toHaveBeenCalledTimes(1);
    expect(lwrChatterFileUpload.open).toHaveBeenCalledWith({
      size: 'small',
      description: 'attach files to this comment',
      multiple: false
    });

    toggle = element.shadowRoot.querySelector('lightning-button-icon.add-attachment');
    expect(toggle).toBeNull();

    let files = element.shadowRoot.querySelectorAll('.comment-controls li');
    expect(files.length).toBe(1);

    let removeBtns = element.shadowRoot.querySelectorAll('lightning-button-icon.remove-attachment');
    expect(removeBtns.length).toBe(1);

    let removeBtn = removeBtns[0];
    removeBtn.click();

    await flushPromises();

    toggle = element.shadowRoot.querySelector('lightning-button-icon.add-attachment');
    expect(toggle).not.toBeNull();

    files = element.shadowRoot.querySelectorAll('.comment-controls li');
    expect(files.length).toBe(0);
  });

  it('Test saving comment with files', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-new', {
      is: LwrChatterCommentNew
    });

    commentOnFeedElement.mockResolvedValue({});
    createRecord.mockResolvedValue({contentVersion: '1'});
    getContentDocumentId.mockResolvedValue({ContentDocumentId: '2'});

    // Act
    element.feedItemId = 'ABCDEFG';
    element.toggleForm();
    document.body.appendChild(element);

    let comment = element.shadowRoot.querySelector('lightning-input-rich-text');
    comment.value = "This is a test message";

    // Assert
    let toggle = element.shadowRoot.querySelector('lightning-button-icon.add-attachment');
    expect(toggle).not.toBeNull();

    lwrChatterFileUpload.open = jest.fn().mockResolvedValue(mockModelWithFile);
    toggle.click();

    await flushPromises();

    const submitBtn = element.shadowRoot.querySelector('lightning-button');
    submitBtn.click();

    await flushPromises();
    await flushPromises();
    await flushPromises();

    expect(commentOnFeedElement).toHaveBeenCalledTimes(1);
  });

  it('Test exception uploading files', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-new', {
      is: LwrChatterCommentNew
    });

    commentOnFeedElement.mockResolvedValue({});
    createRecord.mockRejectedValue('ERROR');

    // Act
    element.feedItemId = 'ABCDEFG';
    element.toggleForm();
    document.body.appendChild(element);

    let comment = element.shadowRoot.querySelector('lightning-input-rich-text');
    comment.value = "This is a test message";

    // Assert
    let toggle = element.shadowRoot.querySelector('lightning-button-icon.add-attachment');
    expect(toggle).not.toBeNull();

    lwrChatterFileUpload.open = jest.fn().mockResolvedValue(mockModelWithFile);
    toggle.click();

    await flushPromises();

    const submitBtn = element.shadowRoot.querySelector('lightning-button');
    submitBtn.click();

    await flushPromises();
    await flushPromises();
    await flushPromises();

    expect(commentOnFeedElement).toHaveBeenCalledTimes(0);
  });
});