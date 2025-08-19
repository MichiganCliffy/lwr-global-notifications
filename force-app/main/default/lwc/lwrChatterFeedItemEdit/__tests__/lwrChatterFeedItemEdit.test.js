import { createElement } from '@lwc/engine-dom';
import LwrChatterFeedItemEdit from 'c/lwrChatterFeedItemEdit';
import updatePost from "@salesforce/apex/LwrChatterController.updatePost";
import lwrChatterFileUpload from 'c/lwrChatterFileUpload';
import searchUsers from '@salesforce/apex/LwrChatterController.searchUsers'
import { createRecord, deleteRecord } from "lightning/uiRecordApi";
import getContentDocumentId from "@salesforce/apex/LwrFilesController.getContentDocumentId";

const mockFeedPost = require('./data/feed-post.json');
const mockModelWithFiles = require('./data/modal-with-some-files.json');
const mockModelWithToManyFiles = require('./data/modal-with-to-many-files.json');

jest.mock(
  "@salesforce/apex/LwrChatterController.updatePost",
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

describe('c-lwr-chatter-feed-item-edit', () => {
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
    const element = createElement('c-lwr-chatter-feed-item-edit', {
      is: LwrChatterFeedItemEdit
    });

    // Act
    element.item = mockFeedPost;
    document.body.appendChild(element);
    expect(element.item.id).toBe('0D5al00000r2g8tCAA');

    // Assert
    const comment = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(comment.value).toBe('<p>[a_young] did you get this?</p>');

    const files = element.shadowRoot.querySelectorAll('li');
    expect(files.length).toBe(4);

    const saveBtn = element.shadowRoot.querySelector('lightning-button');
    expect(saveBtn.disabled).toBeTruthy();
  });

  it('Test passing search term to mention lookup component', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-edit', {
      is: LwrChatterFeedItemEdit
    });

    searchUsers.mockResolvedValue([{Id: '123456789', Name: 'a_young'}]);

    // Act
    element.item = mockFeedPost;
    document.body.appendChild(element);

    const mentionLookup = element.shadowRoot.querySelector('c-lwr-chatter-mention-lookup');
    expect(mentionLookup).not.toBeNull();

    let comment = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(comment).not.toBeNull();
    comment.value = "123456";
    comment.dispatchEvent(new CustomEvent('change'));

    await flushPromises();
    jest.runAllTimers();

    expect(mentionLookup.searchTerm).toBe('123456');

    await flushPromises();
    jest.runAllTimers();

    const saveBtnCheck1 = element.shadowRoot.querySelector('lightning-button');
    expect(saveBtnCheck1.disabled).toBeFalsy();

    comment.value = "<p>[a_young] did you get this?</p>";
    comment.dispatchEvent(new CustomEvent('change'));

    await flushPromises();
    jest.runAllTimers();

    const saveBtnCheck2 = element.shadowRoot.querySelector('lightning-button');
    expect(saveBtnCheck2.disabled).toBeTruthy();
  });

  it('Test passing a mention back from the mention lookup component and updating the post', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-edit', {
      is: LwrChatterFeedItemEdit
    });

    searchUsers.mockResolvedValue([{Id: '123456789', Name: 'a_young'}]);
    updatePost.mockResolvedValue({});

    // Act
    element.item = mockFeedPost;
    document.body.appendChild(element);

    let comment = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(comment).not.toBeNull();
    comment.value = "This is a @bclifford test message";
    comment.dispatchEvent(new CustomEvent('change'));

    jest.runAllTimers();
    await flushPromises();

    const mentionLookup = element.shadowRoot.querySelector('c-lwr-chatter-mention-lookup');
    expect(mentionLookup).not.toBeNull();

    mentionLookup.mentionMap.set('[a_young]', '123456789');
    mentionLookup.dispatchEvent(new CustomEvent('select', {
      detail: {
        id: '123456789',
        search: 'bclifford',
        name: 'a_young',
        mention: '[a_young]'
      }
    }));

    let commentValidation = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(commentValidation.value).toBe('This is a [a_young] test message');

    const submitBtn = element.shadowRoot.querySelector('lightning-button');
    submitBtn.click();

    jest.runAllTimers();
    await flushPromises();

    expect(updatePost).toHaveBeenCalledTimes(1);
    expect(updatePost).toHaveBeenCalledWith({
        feedElementId: '0D5al00000r2g8tCAA',
        body: 'This is a {123456789} test message',
        contentDocumentIds: [
          "069al00000HNf2IAAT",
          "069al00000HNO7yAAH",
          "069al00000HNpsrAAD",
          "069al00000HNcMEAA1",
        ]
      });
  });

  it('Test catching exception updating the post', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-edit', {
      is: LwrChatterFeedItemEdit
    });

    searchUsers.mockResolvedValue([{Id: '123456789', Name: 'Bill Clifford'}]);
    updatePost.mockRejectedValue('ERROR');

    // Act
    element.item = mockFeedPost;
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

    jest.runAllTimers();
    await flushPromises();

    expect(updatePost).toHaveBeenCalledTimes(1);
    expect(updatePost).toHaveBeenCalledWith({
        feedElementId: '0D5al00000r2g8tCAA',
        body: 'This is a {123456789} test message',
        contentDocumentIds: [
          "069al00000HNf2IAAT",
          "069al00000HNO7yAAH",
          "069al00000HNpsrAAD",
          "069al00000HNcMEAA1",
        ]
      });
  });

  it('Test updating post with adding and removing files', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-edit', {
      is: LwrChatterFeedItemEdit
    });

    searchUsers.mockResolvedValue([{Id: '123456789', Name: 'Bill Clifford'}]);
    updatePost.mockResolvedValue();
    lwrChatterFileUpload.open = jest.fn().mockResolvedValue(mockModelWithFiles);
    createRecord.mockResolvedValue({contentVersion: '1'});
    getContentDocumentId.mockResolvedValue({ContentDocumentId: '2'});

    // Act
    element.item = mockFeedPost;
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

    const files = element.shadowRoot.querySelectorAll('li lightning-button-icon');
    expect(files.length).toBe(4);
    files[0].click();

    jest.runAllTimers();
    await flushPromises();

    let addAttachmentBtn = element.shadowRoot.querySelector('lightning-button-icon.add-attachment');
    expect(addAttachmentBtn).not.toBeNull();
    addAttachmentBtn.click();

    await flushPromises();
    jest.runAllTimers();

    const submitBtn = element.shadowRoot.querySelector('lightning-button');
    submitBtn.click();

    jest.runAllTimers();
    await flushPromises();
    await flushPromises();
    await flushPromises();
 
    expect(updatePost).toHaveBeenCalledTimes(1);
    expect(updatePost).toHaveBeenCalledWith({
        feedElementId: '0D5al00000r2g8tCAA',
        body: 'This is a {123456789} test message',
        contentDocumentIds: [
          "069al00000HNO7yAAH",
          "069al00000HNpsrAAD",
          "069al00000HNcMEAA1",
          "2"
        ]
      });
  });

  it('Test updating post with to many files', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-edit', {
      is: LwrChatterFeedItemEdit
    });

    searchUsers.mockResolvedValue([{Id: '123456789', Name: 'Bill Clifford'}]);
    updatePost.mockResolvedValue();
    lwrChatterFileUpload.open = jest.fn().mockResolvedValue(mockModelWithToManyFiles);
    createRecord.mockResolvedValue({contentVersion: '1'});
    getContentDocumentId.mockResolvedValue({ContentDocumentId: '2'});

    // Act
    element.item = mockFeedPost;
    document.body.appendChild(element);

    let comment = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(comment).not.toBeNull();

    let addAttachmentBtn = element.shadowRoot.querySelector('lightning-button-icon.add-attachment');
    expect(addAttachmentBtn).not.toBeNull();
    addAttachmentBtn.click();

    await flushPromises();
    jest.runAllTimers();

    let checker = element.shadowRoot.querySelectorAll('.slds-publisher-attachments.overlimit');
    expect(checker.length).not.toBe(0);
  });

  it('Test file upload error', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-edit', {
      is: LwrChatterFeedItemEdit
    });

    searchUsers.mockResolvedValue([{Id: '123456789', Name: 'Bill Clifford'}]);
    updatePost.mockResolvedValue();
    lwrChatterFileUpload.open = jest.fn().mockResolvedValue(mockModelWithFiles);
    createRecord.mockRejectedValue("ERROR");

    // Act
    element.item = mockFeedPost;
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

    const files = element.shadowRoot.querySelectorAll('li lightning-button-icon');
    expect(files.length).toBe(4);
    files[0].click();
    jest.runAllTimers();
    await flushPromises();

    files[1].click();
    jest.runAllTimers();
    await flushPromises();

    files[2].click();
    jest.runAllTimers();
    await flushPromises();

    files[3].click();
    jest.runAllTimers();
    await flushPromises();

    let addAttachmentBtn = element.shadowRoot.querySelector('lightning-button-icon.add-attachment');
    expect(addAttachmentBtn).not.toBeNull();
    addAttachmentBtn.click();

    await flushPromises();
    jest.runAllTimers();

    const submitBtn = element.shadowRoot.querySelector('lightning-button');
    submitBtn.click();

    jest.runAllTimers();
    await flushPromises();
    await flushPromises();
    await flushPromises();
 
    expect(updatePost).toHaveBeenCalledTimes(0);
  });

  it('Test file delete error', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-feed-item-edit', {
      is: LwrChatterFeedItemEdit
    });

    searchUsers.mockResolvedValue([{Id: '123456789', Name: 'Bill Clifford'}]);
    updatePost.mockResolvedValue();
    deleteRecord.mockRejectedValue('ERROR');

    // Act
    element.item = mockFeedPost;
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

    const files = element.shadowRoot.querySelectorAll('li lightning-button-icon');
    expect(files.length).toBe(4);
    files[0].click();
    jest.runAllTimers();
    await flushPromises();

    files[1].click();
    jest.runAllTimers();
    await flushPromises();

    files[2].click();
    jest.runAllTimers();
    await flushPromises();

    const submitBtn = element.shadowRoot.querySelector('lightning-button');
    submitBtn.click();

    jest.runAllTimers();
    await flushPromises();
    await flushPromises();
    await flushPromises();
 
    expect(updatePost).toHaveBeenCalledTimes(0);
  });
});