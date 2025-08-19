import { deleteRecord } from 'lightning/uiRecordApi';

export class fileDeleter {
  files = [];

  add(file) {
    if (file) {
      this.files.push(file);
    }
  }

  deleteAll() {
    let promises = [];

    if (this.files) {
      for(let i = 0; i < this.files.length; i++) {
        let file = this.files[i];
        promises.push(this.deleteFile(file));
      }
    }

    return Promise.all(promises);
  }

  deleteFile(file) {
    console.debug(`fileDeleter: deleting ${file.name} with id of ${file.contentDocumentId}`);
    if (file.contentDocumentId) {
      return deleteRecord(file.contentDocumentId);
    }

    return new Promise((resolve) => {
      resolve();
    });
  }
}