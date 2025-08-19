import { LightningElement, api } from 'lwc';
import { renderMessageSegments } from 'c/lwrChatterUtilities';

export default class LwrChatterCommentBody extends LightningElement {
  _capabilities;
  filePreview = null;

  @api body;
  @api
  get capabilities() {
    return this._capabilities;
  }
  set capabilities(value) {
    this._capabilities = value;

    if (this._capabilities?.content) {
      this.filePreview = {
        src: this._capabilities.content.renditionUrl,
        title: this._capabilities.content.title,
        alt: this._capabilities.content.title,
        status: this._capabilities.content.thumb120By90RenditionStatus,
        download: this._capabilities.content.downloadUrl
      };
    }
  }

  get message() {
    if (this.body) {
      return renderMessageSegments(this.body.messageSegments);
    }

    return '';
  }

  get hasAttachement() {
    if (this.filePreview != null) {
      return this.filePreview.status !== 'Processing';
    }

    return false;
  }

  get isAttachmentProcessing() {
    if (this.filePreview != null) {
      return this.filePreview.status === 'Processing';
    }

    return false;
  }
}