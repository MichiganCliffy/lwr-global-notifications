/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/no-conditional-expect */
import { fileUploader } from 'c/lwrChatterUtilities';
import { createRecord } from "lightning/uiRecordApi";
import getContentDocumentId from "@salesforce/apex/LwrFilesController.getContentDocumentId";

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

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result.split(',')[1]); // Resolve with pure base64
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

describe('c-file-uploader', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Test uploading files', async() => {
    const blob = new Blob(['lorum ipsum'], { type: "text/plain" });
    const file = await blobToBase64(blob);
    
    let files = [
      {
        id: '123',
        name: 'test1.txt',
        contents: `text/plain,${file}`
      },
      {
        id: '234',
        name: 'test2.txt',
        contents: `text/plain,${file}`
      },
      {
        id: '345',
        name: 'test3.txt',
        contents: `text/plain,${file}`
      }
    ];

    createRecord.mockResolvedValue({contentVersion: '1'});
    getContentDocumentId.mockResolvedValue({ContentDocumentId: '2'});

    let uploader = new fileUploader(files);
    uploader.upload().then((output) => {
      expect(output.length).toBe(3);
      output.forEach((item) => {
        expect(item.successful).toBeTruthy();
        expect(item.contentDocumentId).toBe('2');
      });
    }).catch((error) => {
      console.log(error);
      expect(true).toBeFalsy();
    });

    await flushPromises();

    expect(createRecord).toHaveBeenCalledTimes(3);
    expect(getContentDocumentId).toHaveBeenCalledTimes(3);
  });

  it('Test uploading files where some have already been uploaded', async() => {
    const blob = new Blob(['lorum ipsum'], { type: "text/plain" });
    const file = await blobToBase64(blob);
    
    let files = [
      {
        id: '123',
        contentDocumentId: '123',
        name: 'test1.txt',
        contents: `text/plain,${file}`
      },
      {
        id: '234',
        name: 'test2.txt',
        contents: `text/plain,${file}`
      },
      {
        id: '345',
        contentDocumentId: '345',
        name: 'test3.txt',
        contents: `text/plain,${file}`
      }
    ];

    createRecord.mockResolvedValue({contentVersion: '1'});
    getContentDocumentId.mockResolvedValue({ContentDocumentId: '2'});

    let uploader = new fileUploader(files);
    uploader.upload().then((output) => {
      expect(output.length).toBe(3);
    }).catch((error) => {
      console.log(error);
      expect(true).toBeFalsy();
    });

    await flushPromises();

    expect(createRecord).toHaveBeenCalledTimes(1);
    expect(getContentDocumentId).toHaveBeenCalledTimes(1);
  });

  it('Test createRecord expection', async() => {
    const blob = new Blob(['lorum ipsum'], { type: "text/plain" });
    const file = await blobToBase64(blob);
    
    let files = [
      {
        id: '123',
        name: 'test1.txt',
        contents: `text/plain,${file}`
      },
      {
        id: '234',
        name: 'test2.txt',
        contents: `text/plain,${file}`
      },
      {
        id: '345',
        name: 'test3.txt',
        contents: `text/plain,${file}`
      }
    ];

    createRecord.mockRejectedValue('ERROR');

    let uploader = new fileUploader(files);
    uploader.upload().then((output) => {
      console.log(output);
      expect(true).toBeFalsy();
    }).catch((error) => {
      console.log(error);
      expect(error.successful).toBeFalsy();
      expect(error.error).toBe('ERROR');
    });

    await flushPromises();

    expect(createRecord).toHaveBeenCalledTimes(3);
    expect(getContentDocumentId).toHaveBeenCalledTimes(0);
  });

  it('Test getContentDocumentId exception', async() => {
    const blob = new Blob(['lorum ipsum'], { type: "text/plain" });
    const file = await blobToBase64(blob);
    
    let files = [
      {
        id: '123',
        name: 'test1.txt',
        contents: `text/plain,${file}`
      },
      {
        id: '234',
        name: 'test2.txt',
        contents: `text/plain,${file}`
      },
      {
        id: '345',
        name: 'test3.txt',
        contents: `text/plain,${file}`
      }
    ];

    createRecord.mockResolvedValue({contentVersion: '1'});
    getContentDocumentId.mockRejectedValue('ERROR');

    let uploader = new fileUploader(files);
    uploader.upload().then((output) => {
      console.log(output);
      expect(true).toBeFalsy();
    }).catch((error) => {
      console.log(error);
      expect(error.successful).toBeFalsy();
      expect(error.error).toBe('ERROR');
    });

    await flushPromises();

    expect(createRecord).toHaveBeenCalledTimes(3);
    expect(getContentDocumentId).toHaveBeenCalledTimes(3);
  });

  it('Test missing content document ids', async() => {
    const blob = new Blob(['lorum ipsum'], { type: "text/plain" });
    const file = await blobToBase64(blob);
    
    let files = [
      {
        id: '123',
        name: 'test1.txt',
        contents: `text/plain,${file}`
      },
      {
        id: '234',
        name: 'test2.txt',
        contents: `text/plain,${file}`
      },
      {
        id: '345',
        name: 'test3.txt',
        contents: `text/plain,${file}`
      }
    ];

    createRecord.mockResolvedValue({contentVersion: '1'});
    getContentDocumentId.mockResolvedValue({});

    let uploader = new fileUploader(files);
    uploader.upload().then((output) => {
      console.log(output);
      expect(true).toBeFalsy();
    }).catch((error) => {
      console.log(error);
      expect(error.successful).toBeFalsy();
      expect(error.error).toBe('No content document id');
    });

    await flushPromises();

    expect(createRecord).toHaveBeenCalledTimes(3);
    expect(getContentDocumentId).toHaveBeenCalledTimes(3);
  });
});