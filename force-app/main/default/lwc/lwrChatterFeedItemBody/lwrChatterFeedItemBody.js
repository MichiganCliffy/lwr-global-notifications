import { LightningElement, api } from 'lwc';
import { renderMessageSegments } from 'c/lwrChatterUtilities';

export default class LwrChatterFeedItemBody extends LightningElement {
  _capabilities;
  attachments = [];

  @api body;
  
  @api 
  get capabilities() {
    return this._capabilities;
  }
  set capabilities(value) {
    this._capabilities = value;

    if (this._capabilities?.files?.items?.length > 0) {
      this.attachments = this._capabilities.files.items.map(file => {
        return {
          id: file.id,
          title: file.title,
          alt: file.title,
          src: file.renditionUrl,
          processing: file.thumb120By90RenditionStatus === 'Processing',
          download: file.downloadUrl
        }
      });
    }
  }

  get message() {
    if (this.body) {
      return renderMessageSegments(this.body.messageSegments);
    }

    return '';
  }

  get hasAttachements() {
    return this.attachments.length > 0;
  }
}