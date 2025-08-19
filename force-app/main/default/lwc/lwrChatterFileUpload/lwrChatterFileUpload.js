import {api} from 'lwc';
import LightningModal from 'lightning/modal';

export default class LwrChatterFileUpload extends LightningModal {
  files = [];
  processing = false;
  errorMessage = '';

  @api multiple;

  get hasFiles() {
    return this.files.length > 0;
  }

  get hasError() {
    return this.errorMessage.length > 0;
  }

  handleFilesSelected(event) {
    this.errorMessage = '';
    this.processing = true;
    let updated = [...this.files];

    for(let i = 0; i < event.target.files.length; i++) {
      let now =  Date.now();
      let file = {
        id: `${now}-${i}`,
        name: event.target.files[i].name,
        type: event.target.files[i].type,
        size: event.target.files[i].size,
        contents: null,
        file: event.target.files[i],
        error: null
      };

      updated.push(file);
    }

    this.readFiles(updated);
  }

  handleDone() {
    let data = {
      action: 'done',
      files: []
    };

    while(this.files.length > 0) {
      let file = this.files.shift();
      data.files.push(file);
    }

    this.close(data);
  }

  readFiles(files) {
    let promises = [];
    for(let i = 0; i < files.length; i++) {
      promises.push(this.readFile(files[i]));
    }

    Promise.all(promises).then(() => {
      console.debug('Successfully processed all files');
      this.files = files;
    }).catch((error) => {
      this.errorMessage = error;
      console.error(error);
    }).finally(() => {
      this.processing = false;
    });
  }

  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = (ev) => {
        file.contents = ev.target.result;
        resolve(file);
      };
      reader.onerror = (error) => {
        file.error = error;
        reject(
          `There was an error reading file: '${file.name}', error: ${error}`
        );
      };

      reader.readAsDataURL(file.file);
    });
  }
}