/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/no-conditional-expect */
import { fileDeleter } from 'c/lwrChatterUtilities';
import { deleteRecord } from "lightning/uiRecordApi";

async function flushPromises() {
  return Promise.resolve();
}

describe('c-file-deleter', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Test deleting files', async() => {
    deleteRecord.mockResolvedValue();

    let deleter = new fileDeleter();
    deleter.add({
      name: 'Test 1',
      id: '123',
      contentDocumentId: '123'
    });
    deleter.add({
      name: 'Test 2',
      id: '234'
    });
    deleter.add({
      name: 'Test 3',
      id: '345',
      contentDocumentId: '345'
    });

    deleter.deleteAll();

    await flushPromises();
    await flushPromises();
    await flushPromises();

    expect(deleteRecord).toHaveBeenCalledTimes(2);
  });
});