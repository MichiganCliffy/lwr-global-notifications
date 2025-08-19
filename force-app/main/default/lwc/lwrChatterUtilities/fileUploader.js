import { createRecord } from "lightning/uiRecordApi";
import getContentDocumentId from "@salesforce/apex/LwrFilesController.getContentDocumentId";

export class fileUploader {
  files;

  constructor(files) {
    this.files = files;
  }

  upload() {
    console.debug(`fileUploader: begin uploading ${this.files.length} files`);

    let promises = [];
    for(let i = 0; i < this.files.length; i++) {
      let file = this.files[i];
      if (file.contentDocumentId) {
        console.debug(`fileUploader: ${file.name} already uploaded`);
        promises.push(
          new Promise((resolve) => {
            resolve({successful: true, contentDocumentId: file.contentDocumentId})
          })
        );
      } else {
        promises.push(this.uploadData(file.name, file.id, file.contents));
      }
    }

    return Promise.all(promises);
  }

  // Use LDS createRecord function to upload file to a ContentVersion object.
  // ContentVersion is the standard representation of an uploaded file in Salesforce.
  uploadData(fileName, fileId, data) {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      const uniqueCvId = `${now}_${fileId}`;

      console.debug(`Uploading '${fileName}' with uniqueCvId '${uniqueCvId}'...`);
      createRecord({
        apiName: "ContentVersion",
        fields: {
          Title: fileName,
          PathOnClient: fileName,
          VersionData: data.split(",")[1], // extract base64 part of data
          Origin: "H",
          ReasonForChange: uniqueCvId
        }
      }).then((contentVersion) => {
        console.debug(`'${fileName}' has been saved to Salesforce...`);
        getContentDocumentId({ contentVersionId: contentVersion.id }).then((contentDocument) => {
          console.debug(`Retrieved content document id ${contentDocument.ContentDocumentId} for '${fileName}'...`);
          if (contentDocument.ContentDocumentId) {
            resolve({successful: true, contentDocumentId: contentDocument.ContentDocumentId});
          } else {
            reject({successful: false, error: 'No content document id'});
          }
        }).catch((contentDocumentIdError) => {
          reject({successful: false, error: contentDocumentIdError});
        });
      }).catch((contentVersionError) => {
        reject({successful: false, error: contentVersionError});
      });
    });
  }
}