import { createElement } from '@lwc/engine-dom';
import LwrChatterFileUpload from 'c/lwrChatterFileUpload';

const mockFile1 = new File(['test content'], 'test1.txt', { type: 'text/plain' });
Object.defineProperty(mockFile1, 'size', { value: 1024 * 1024 }); // 1MB file

const mockFile2 = new File(['test content'], 'test2.txt', { type: 'text/plain' });
Object.defineProperty(mockFile2, 'size', { value: 1024 * 1024 }); // 1MB file

const mockFile3 = new File(['test content'], 'test3.txt', { type: 'text/plain' });
Object.defineProperty(mockFile3, 'size', { value: 1024 * 1024 }); // 1MB file

async function flushPromises() {
  return Promise.resolve();
}

function wireUpFileReaderSuccess() {
  Object.defineProperty(global, "FileReader", {
    writable: true,
    value: jest.fn().mockImplementation(() => {
      return {
        readAsDataURL: jest.fn(function () {
          this.result = "text/plain,bG9ydW0gaXBzdW0=";
          this.onloadend({ target: this });
        }),
        onload: jest.fn(),
        onloadend: jest.fn(),
        onerror: jest.fn()
      };
    })
  });
}

function wireUpFileReaderError() {
  Object.defineProperty(global, "FileReader", {
    writable: true,
    value: jest.fn().mockImplementation(() => {
      return {
        readAsDataURL: jest.fn(function () {
          this.onerror('ERROR');
        }),
        onload: jest.fn(),
        onloadend: jest.fn(),
        onerror: jest.fn()
      };
    })
  });
}

describe('c-lwr-chatter-file-upload', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    jest.clearAllMocks();
  });

  it('Test basic scaffolding', async () => {
    // Arrange
    const element = createElement('c-lwr-chatter-file-upload', {
      is: LwrChatterFileUpload
    });

    wireUpFileReaderSuccess();

    // Act
    expect(element.multiple).toBeFalsy();
    document.body.appendChild(element);

    // Assert
    const button = element.modalBody$('lightning-input');
    expect(button).not.toBeNull();

    Object.defineProperty(button, 'files', { value: [mockFile1] });
    button.dispatchEvent(new CustomEvent('change'));

    await flushPromises();

    const listItems = element.modalBody$$('li');
    expect(listItems.length).toBe(1);

    const submitBtn = element.modalFooter$('lightning-button');
    submitBtn.click();

    expect(element.closeValue).not.toBeNull();
    expect(element.closeValue.action).toBe('done');
    expect(element.closeValue.files.length).toBe(1);
    expect(element.closeValue.files[0].name).toBe('test1.txt');
  });

  it('Test multiple files', async () => {
    // Arrange
    const element = createElement('c-lwr-chatter-file-upload', {
      is: LwrChatterFileUpload
    });

    wireUpFileReaderSuccess();

    // Act
    element.multiple = true;
    expect(element.multiple).toBeTruthy();
    document.body.appendChild(element);

    // Assert
    const button = element.modalBody$('lightning-input');
    expect(button).not.toBeNull();

    Object.defineProperty(button, 'files', { value: [mockFile1, mockFile2, mockFile3] });
    button.dispatchEvent(new CustomEvent('change'));

    await flushPromises();

    const listItems = element.modalBody$$('li');
    expect(listItems.length).toBe(3);

    const submitBtn = element.modalFooter$('lightning-button');
    submitBtn.click();

    expect(element.closeValue).not.toBeNull();
    expect(element.closeValue.action).toBe('done');
    expect(element.closeValue.files.length).toBe(3);
    expect(element.closeValue.files[0].name).toBe('test1.txt');
    expect(element.closeValue.files[1].name).toBe('test2.txt');
    expect(element.closeValue.files[2].name).toBe('test3.txt');
  });

  it('Test error processing file', async () => {
    // Arrange
    const element = createElement('c-lwr-chatter-file-upload', {
      is: LwrChatterFileUpload
    });

    wireUpFileReaderError();

    // Act
    expect(element.multiple).toBeFalsy();
    document.body.appendChild(element);

    // Assert
    const button = element.modalBody$('lightning-input');
    expect(button).not.toBeNull();

    Object.defineProperty(button, 'files', { value: [mockFile1] });
    button.dispatchEvent(new CustomEvent('change'));

    await flushPromises();
    await flushPromises();
    await flushPromises();

    const listItems = element.modalBody$$('li');
    expect(listItems.length).toBe(0);

    const errorMsg = element.modalBody$('.slds-text-color_error');
    expect(errorMsg).not.toBeNull();
    expect(errorMsg.textContent).toBe("There was an error reading file: 'test1.txt', error: ERROR");
  });
});