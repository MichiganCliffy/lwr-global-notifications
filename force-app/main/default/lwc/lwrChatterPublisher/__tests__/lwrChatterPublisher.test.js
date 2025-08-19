import { createElement } from '@lwc/engine-dom';
import LwrChatterPublisher from 'c/lwrChatterPublisher';
import lwrChatterFileUpload from 'c/lwrChatterFileUpload';
import { CurrentPageReference } from 'lightning/navigation';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import createPost from "@salesforce/apex/LwrChatterController.createPost";
import searchUsers from '@salesforce/apex/LwrChatterController.searchUsers'
import { createRecord } from "lightning/uiRecordApi";
import getContentDocumentId from "@salesforce/apex/LwrFilesController.getContentDocumentId";

const mockCurrentPageReference = require('./data/currentPageReference.json')
const mockModelWithFiles = require('./data/modal-with-some-files.json');
const mockModelWithToManyFiles = require('./data/modal-with-to-many-files.json');

jest.mock(
  "@salesforce/apex/LwrChatterController.createPost",
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

describe('c-lwr-chatter-publisher', () => {
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
    const element = createElement('c-lwr-chatter-publisher', {
        is: LwrChatterPublisher
    });

    CurrentPageReference.emit(mockCurrentPageReference);
    getObjectInfo.emit({apiName: 'Opportunity', label: 'Opportunity'});

    // Act
    element.recordId = 'ABCDEFG';
    expect(element.recordId).toBe('ABCDEFG');
    element.recordId = null;

    document.body.appendChild(element);
    await flushPromises();

    // Assert
    const post = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(post).toBeNull();

    const toggle = element.shadowRoot.querySelector('lightning-input');
    expect(toggle).not.toBeNull();
  });

  it('Test togglng post', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-publisher', {
        is: LwrChatterPublisher
    });

    CurrentPageReference.emit(mockCurrentPageReference);
    getObjectInfo.emit({apiName: 'Opportunity', label: 'Opportunity'});

    // Act
    document.body.appendChild(element);
    await flushPromises();

    // Assert
    const toggle = element.shadowRoot.querySelector('lightning-input');
    expect(toggle).not.toBeNull();
    toggle.dispatchEvent(new CustomEvent('focus'));

    let post = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(post).toBeNull();

    await flushPromises();
    jest.runAllTimers();

    post = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(post).not.toBeNull();

    const message = element.shadowRoot.querySelector('.slds-publisher-target');
    expect(message).not.toBeNull();
    expect(message.textContent).toBe('Share an updateTo: Opportunity');
  });

  it('Test error with getObjectInfo post', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-publisher', {
        is: LwrChatterPublisher
    });

    CurrentPageReference.emit(mockCurrentPageReference);
    getObjectInfo.error();

    // Act
    document.body.appendChild(element);
    await flushPromises();

    // Assert
    const toggle = element.shadowRoot.querySelector('lightning-input');
    expect(toggle).not.toBeNull();
    toggle.dispatchEvent(new CustomEvent('focus'));

    jest.runAllTimers();
    await flushPromises();

    const post = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(post).not.toBeNull();

    const message = element.shadowRoot.querySelector('.slds-publisher-target');
    expect(message).not.toBeNull();
    expect(message.textContent).toBe('Share an updateTo: Unknown');
  });

  it('Test passing search term to mention lookup component', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-publisher', {
      is: LwrChatterPublisher
    });

    CurrentPageReference.emit(mockCurrentPageReference);
    getObjectInfo.emit({apiName: 'Opportunity', label: 'Opportunity'});

    // Act
    document.body.appendChild(element);
    await flushPromises();

    const toggle = element.shadowRoot.querySelector('lightning-input');
    toggle.dispatchEvent(new CustomEvent('focus'));

    jest.runAllTimers();
    await flushPromises();

    const mentionLookup = element.shadowRoot.querySelector('c-lwr-chatter-mention-lookup');
    expect(mentionLookup).not.toBeNull();

    let comment = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(comment).not.toBeNull();
    comment.value = "123456";
    comment.dispatchEvent(new CustomEvent('change'));
    jest.runAllTimers();

    expect(mentionLookup.searchTerm).toBe('123456');
  });

  it('Test passing a mention back from the mention lookup component and submitting the post', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-publisher', {
      is: LwrChatterPublisher
    });

    CurrentPageReference.emit(mockCurrentPageReference);
    getObjectInfo.emit({apiName: 'Opportunity', label: 'Opportunity'});

    searchUsers.mockResolvedValue([{Id: '123456789', Name: 'Bill Clifford'}]);
    createPost.mockResolvedValue({});

    // Act
    document.body.appendChild(element);
    await flushPromises();

    const toggle = element.shadowRoot.querySelector('lightning-input');
    toggle.dispatchEvent(new CustomEvent('focus'));

    jest.runAllTimers();
    await flushPromises();

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

    expect(createPost).toHaveBeenCalledTimes(1);
    expect(createPost).toHaveBeenCalledWith({
        subjectId: '006al000000WfCyAAK',
        body: 'This is a {123456789} test message',
        contentDocumentIds: null,
      });
  });

  it('Test passing error with submitting the post', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-publisher', {
      is: LwrChatterPublisher
    });

    CurrentPageReference.emit(mockCurrentPageReference);
    getObjectInfo.emit({apiName: 'Opportunity', label: 'Opportunity'});

    searchUsers.mockResolvedValue([{Id: '123456789', Name: 'Bill Clifford'}]);
    createPost.mockRejectedValue();

    // Act
    document.body.appendChild(element);
    await flushPromises();

    const toggle = element.shadowRoot.querySelector('lightning-input');
    toggle.dispatchEvent(new CustomEvent('focus'));

    jest.runAllTimers();
    await flushPromises();

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

    expect(createPost).toHaveBeenCalledTimes(1);
    expect(createPost).toHaveBeenCalledWith({
        subjectId: '006al000000WfCyAAK',
        body: 'This is a {123456789} test message',
        contentDocumentIds: null
      });
  });

  it('Test opening and closing files modal', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-publisher', {
        is: LwrChatterPublisher
    });

    CurrentPageReference.emit(mockCurrentPageReference);
    getObjectInfo.emit({apiName: 'Opportunity', label: 'Opportunity'});
    lwrChatterFileUpload.open = jest.fn().mockResolvedValue(mockModelWithFiles);

    // Act
    document.body.appendChild(element);
    await flushPromises();

    // Assert
    const toggle = element.shadowRoot.querySelector('lightning-input');
    expect(toggle).not.toBeNull();
    toggle.dispatchEvent(new CustomEvent('focus'));

    jest.runAllTimers();
    await flushPromises();

    let addAttachmentBtn = element.shadowRoot.querySelector('lightning-button-icon.add-attachment');
    expect(addAttachmentBtn).not.toBeNull();
    addAttachmentBtn.click();

    await flushPromises();

    expect(lwrChatterFileUpload.open).toHaveBeenCalledTimes(1);
    expect(lwrChatterFileUpload.open).toHaveBeenCalledWith({
      size: 'small',
      description: 'attach files to this post',
      multiple: true
    });

    let files = element.shadowRoot.querySelectorAll('.slds-publisher-attachments li');
    expect(files.length).toBe(3);

    let removeBtns = element.shadowRoot.querySelectorAll('lightning-button-icon.remove-attachment');
    expect(removeBtns.length).toBe(3);

    let removeBtn = removeBtns[0];
    removeBtn.click();

    await flushPromises();

    files = element.shadowRoot.querySelectorAll('.slds-publisher-attachments li');
    expect(files.length).toBe(2);
  });

  it('Test adding too many files the first time', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-publisher', {
        is: LwrChatterPublisher
    });

    CurrentPageReference.emit(mockCurrentPageReference);
    getObjectInfo.emit({apiName: 'Opportunity', label: 'Opportunity'});
    lwrChatterFileUpload.open = jest.fn().mockResolvedValue(mockModelWithToManyFiles);

    // Act
    document.body.appendChild(element);
    await flushPromises();

    // Assert
    const toggle = element.shadowRoot.querySelector('lightning-input');
    expect(toggle).not.toBeNull();
    toggle.dispatchEvent(new CustomEvent('focus'));

    jest.runAllTimers();
    await flushPromises();

    let addAttachmentBtn = element.shadowRoot.querySelector('lightning-button-icon.add-attachment');
    expect(addAttachmentBtn).not.toBeNull();
    addAttachmentBtn.click();

    await flushPromises();
    jest.runAllTimers();

    expect(lwrChatterFileUpload.open).toHaveBeenCalledTimes(1);

    let files = element.shadowRoot.querySelectorAll('.slds-publisher-attachments li');
    expect(files.length).toBe(11);

    let removeBtns = element.shadowRoot.querySelectorAll('lightning-button-icon.remove-attachment');
    expect(removeBtns.length).toBe(11);

    let errorFlag = element.shadowRoot.querySelector('.slds-publisher-attachments.overlimit');
    expect(errorFlag).not.toBeNull();

    addAttachmentBtn = element.shadowRoot.querySelector('lightning-button-icon.add-attachment');
    expect(addAttachmentBtn).toBeNull();

    removeBtns[0].click();
    await flushPromises();

    removeBtns[1].click();
    await flushPromises();

    files = element.shadowRoot.querySelectorAll('.slds-publisher-attachments li');
    expect(files.length).toBe(9);

    errorFlag = element.shadowRoot.querySelector('.slds-publisher-attachments.overlimit');
    expect(errorFlag).toBeNull();

    addAttachmentBtn = element.shadowRoot.querySelector('lightning-button-icon.add-attachment');
    expect(addAttachmentBtn).not.toBeNull();
  });

  it('Test adding too many files the second time', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-publisher', {
        is: LwrChatterPublisher
    });

    CurrentPageReference.emit(mockCurrentPageReference);
    getObjectInfo.emit({apiName: 'Opportunity', label: 'Opportunity'});
    lwrChatterFileUpload.open = jest.fn().mockResolvedValue(mockModelWithFiles);

    // Act
    document.body.appendChild(element);
    await flushPromises();

    // Assert
    const toggle = element.shadowRoot.querySelector('lightning-input');
    expect(toggle).not.toBeNull();
    toggle.dispatchEvent(new CustomEvent('focus'));

    jest.runAllTimers();
    await flushPromises();

    let addAttachmentBtn = element.shadowRoot.querySelector('lightning-button-icon.add-attachment');
    expect(addAttachmentBtn).not.toBeNull();
    addAttachmentBtn.click();

    await flushPromises();
    jest.runAllTimers();

    let files = element.shadowRoot.querySelectorAll('.slds-publisher-attachments li');
    expect(files.length).toBe(3);

    let errorFlag = element.shadowRoot.querySelector('.slds-publisher-attachments.overlimit');
    expect(errorFlag).toBeNull();

    lwrChatterFileUpload.open = jest.fn().mockResolvedValue(mockModelWithToManyFiles);
    addAttachmentBtn.click();

    await flushPromises();
    jest.runAllTimers();

    files = element.shadowRoot.querySelectorAll('.slds-publisher-attachments li');
    expect(files.length).toBe(14);

    errorFlag = element.shadowRoot.querySelector('.slds-publisher-attachments.overlimit');
    expect(errorFlag).not.toBeNull();

    addAttachmentBtn = element.shadowRoot.querySelector('lightning-button-icon.add-attachment');
    expect(addAttachmentBtn).toBeNull();

    let removeBtns = element.shadowRoot.querySelectorAll('lightning-button-icon.remove-attachment');
    expect(removeBtns.length).toBe(14);

    removeBtns[0].click();
    await flushPromises();

    removeBtns[1].click();
    await flushPromises();

    removeBtns[2].click();
    await flushPromises();

    removeBtns[3].click();
    await flushPromises();

    files = element.shadowRoot.querySelectorAll('.slds-publisher-attachments li');
    expect(files.length).toBe(10);

    errorFlag = element.shadowRoot.querySelector('.slds-publisher-attachments.overlimit');
    expect(errorFlag).toBeNull();

    addAttachmentBtn = element.shadowRoot.querySelector('lightning-button-icon.add-attachment');
    expect(addAttachmentBtn).toBeNull();
  });

  it('Test submitting a post with files', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-publisher', {
      is: LwrChatterPublisher
    });

    CurrentPageReference.emit(mockCurrentPageReference);
    getObjectInfo.emit({apiName: 'Opportunity', label: 'Opportunity'});
    createPost.mockResolvedValue({});
    lwrChatterFileUpload.open = jest.fn().mockResolvedValue(mockModelWithFiles);
    createRecord.mockResolvedValue({contentVersion: '1'});
    getContentDocumentId.mockResolvedValue({ContentDocumentId: '2'});

    // Act
    document.body.appendChild(element);
    await flushPromises();

    const toggle = element.shadowRoot.querySelector('lightning-input');
    toggle.dispatchEvent(new CustomEvent('focus'));

    jest.runAllTimers();
    await flushPromises();

    let comment = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(comment).not.toBeNull();
    comment.value = "This is a test message";

    let addAttachmentBtn = element.shadowRoot.querySelector('lightning-button-icon.add-attachment');
    expect(addAttachmentBtn).not.toBeNull();
    addAttachmentBtn.click();

    await flushPromises();
    jest.runAllTimers();

    const submitBtn = element.shadowRoot.querySelector('lightning-button');
    submitBtn.click();

    await flushPromises();
    await flushPromises();
    await flushPromises();

    expect(createPost).toHaveBeenCalledTimes(1);
    expect(createPost).toHaveBeenCalledWith({
        subjectId: '006al000000WfCyAAK',
        body: 'This is a test message',
        contentDocumentIds: ['2','2','2'],
      });
  });

  it('Test file upload exception', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-publisher', {
      is: LwrChatterPublisher
    });

    CurrentPageReference.emit(mockCurrentPageReference);
    getObjectInfo.emit({apiName: 'Opportunity', label: 'Opportunity'});
    createPost.mockResolvedValue({});
    lwrChatterFileUpload.open = jest.fn().mockResolvedValue(mockModelWithFiles);
    createRecord.mockRejectedValue('ERROR');

    // Act
    document.body.appendChild(element);
    await flushPromises();

    const toggle = element.shadowRoot.querySelector('lightning-input');
    toggle.dispatchEvent(new CustomEvent('focus'));

    jest.runAllTimers();
    await flushPromises();

    let comment = element.shadowRoot.querySelector('lightning-input-rich-text');
    expect(comment).not.toBeNull();
    comment.value = "This is a test message";

    let addAttachmentBtn = element.shadowRoot.querySelector('lightning-button-icon.add-attachment');
    expect(addAttachmentBtn).not.toBeNull();
    addAttachmentBtn.click();

    await flushPromises();
    jest.runAllTimers();

    const submitBtn = element.shadowRoot.querySelector('lightning-button');
    submitBtn.click();

    await flushPromises();
    await flushPromises();
    await flushPromises();

    expect(createPost).toHaveBeenCalledTimes(0);
  });
});