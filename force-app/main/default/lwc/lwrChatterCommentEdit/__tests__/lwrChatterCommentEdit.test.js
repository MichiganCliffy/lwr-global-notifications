import { createElement } from '@lwc/engine-dom';
import LwrChatterCommentEdit from 'c/lwrChatterCommentEdit';
import updateComment from "@salesforce/apex/LwrChatterController.updateComment";
import searchUsers from '@salesforce/apex/LwrChatterController.searchUsers'

const mockCommentWithFile = require('./data/comment-with-file.json');
const mockCommentWithoutFile = require('./data/comment-without-file.json');

jest.mock(
  "@salesforce/apex/LwrChatterController.updateComment",
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

async function flushPromises() {
  return Promise.resolve();
}

describe('c-lwr-chatter-comment-edit', () => {
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
    const element = createElement('c-lwr-chatter-comment-edit', {
      is: LwrChatterCommentEdit
    });

    // Act
    element.item = mockCommentWithFile;
    document.body.appendChild(element);

    expect(element.item.id).toBe('0D7al000001RcDVCA0');

    // Assert
    let comment = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(comment).not.toBeNull();
    expect(comment.value).toBe('<p>Uploading a big old comment</p>');

    let files = element.shadowRoot.querySelectorAll('li');
    expect(files.length).toBe(1);
    expect(files[0].textContent).toBe('E2E Roadmap - 2025-Q1.pptx');

    let saveBtn = element.shadowRoot.querySelector('.save-action');
    expect(saveBtn).not.toBeNull();
    expect(saveBtn.disabled).toBeTruthy();
  });

  it('Test cancel', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-edit', {
      is: LwrChatterCommentEdit
    });

    const handler = jest.fn();
    element.addEventListener('cancel', handler);

    // Act
    element.item = mockCommentWithFile;
    document.body.appendChild(element);

    // Assert
    let cancelBtn = element.shadowRoot.querySelector('.cancel-action');
    expect(cancelBtn).not.toBeNull();
    cancelBtn.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Test updating the comment', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-edit', {
      is: LwrChatterCommentEdit
    });

    // Act
    element.item = mockCommentWithFile;
    document.body.appendChild(element);

    // Assert
    let saveBtn = element.shadowRoot.querySelector('.save-action');
    expect(saveBtn).not.toBeNull();
    expect(saveBtn.disabled).toBeTruthy();

    let comment = element.shadowRoot.querySelector('lightning-input-rich-text');
    comment.value = "<p>It has changed now!</p>";
    comment.dispatchEvent(new CustomEvent('change'));
    jest.runAllTimers();
    await flushPromises();

    let saveBtnCheck1 = element.shadowRoot.querySelector('.save-action');
    expect(saveBtnCheck1.disabled).toBeFalsy();

    comment.value = "";
    comment.dispatchEvent(new CustomEvent('change'));
    jest.runAllTimers();
    await flushPromises();

    let saveBtnCheck2 = element.shadowRoot.querySelector('.save-action');
    expect(saveBtnCheck2.disabled).toBeTruthy();

    comment.value = "<p>It has changed now!</p>";
    comment.dispatchEvent(new CustomEvent('change'));
    jest.runAllTimers();
    await flushPromises();

    let saveBtnCheck3 = element.shadowRoot.querySelector('.save-action');
    expect(saveBtnCheck3.disabled).toBeFalsy();

    comment.value = "<p>Uploading a big old comment</p>";
    comment.dispatchEvent(new CustomEvent('change'));
    jest.runAllTimers();
    await flushPromises();

    let saveBtnCheck4 = element.shadowRoot.querySelector('.save-action');
    expect(saveBtnCheck4.disabled).toBeTruthy();
  });

  it('Test passing search term to mention lookup component', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-edit', {
      is: LwrChatterCommentEdit
    });

    // Act
    element.item = mockCommentWithoutFile;
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

  it('Test passing a mention back from the mention lookup component and saving the comment', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-edit', {
      is: LwrChatterCommentEdit
    });

    searchUsers.mockResolvedValue([{Id: '123456789', Name: 'Bill Clifford'}]);
    updateComment.mockResolvedValue({});

    // Act
    element.item = mockCommentWithoutFile;
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

    const submitBtn = element.shadowRoot.querySelector('.save-action');
    submitBtn.click();

    expect(updateComment).toHaveBeenCalledTimes(1);
    expect(updateComment).toHaveBeenCalledWith({
        feedCommentId: '0D7al000001RubqCAC',
        contentDocumentId: null,
        comment: 'This is a {123456789} test message'
      });
  });

  it('Test comment submission failure', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-comment-edit', {
      is: LwrChatterCommentEdit
    });

    updateComment.mockRejectedValue();

    // Act
    element.item = mockCommentWithoutFile;
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

    const submitBtn = element.shadowRoot.querySelector('.save-action');
    submitBtn.click();

    expect(updateComment).toHaveBeenCalledTimes(1);
  });
});