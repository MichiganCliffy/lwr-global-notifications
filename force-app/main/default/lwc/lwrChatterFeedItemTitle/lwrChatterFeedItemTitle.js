import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { isEmptyString } from 'c/lwrChatterUtilities';

export default class LwrChatterFeedItemTitle extends NavigationMixin(LightningElement) {
  _header = null;
  _items = [];

  @api mapping;

  @api
  get header() {
    return this._header;
  }
  set header(value) {
    this._header = value;

    if (value.messageSegments) {
      this._items = [];

      for(let i = 0; i < value.messageSegments.length; i++) {
        let message = value.messageSegments[i];
        let item = {
          id: i,
          label: message.text,
          isLink: message.type === 'EntityLink'
        };

        this._items.push(item);
      }
    }
  }

  @api
  get items() {
    return this._items;
  }

  handleClick(event) {
    let position = event.target.dataset.position;
    let message = this._header.messageSegments[position];
    let recordId = message.reference.id;
    let objectApiName = this.getObjectApiName(recordId);
    if (!isEmptyString(objectApiName)) {
      this[NavigationMixin.GenerateUrl]({
        type: 'standard__recordPage',
        attributes: {
          actionName: 'view',
          objectApiName: objectApiName,
          recordId: recordId
        }
      }).then((url) => {
        window.location.href = url;
      });
    } else {
      console.error(`Chatter Feed Item Title Navigation error: unable to determine the Object API Name for ${recordId}`);
    }
  }

  getObjectApiName(id) {
    return this.mapping[id];
    
    // TODO: This should live within the Apex code, have it return a map of ids to object API names
    // let prefix = id.substring(0,3);
    // switch(prefix) {
    //   case '001':
    //     return 'Account';

    //   case '003':
    //     return 'Contact';

    //   case '005':
    //     return 'User';

    //   case '006':
    //     return 'Opportunity';

    //   case '00Q':
    //     return 'Lead';

    //   default:
    //     return '';
    // }
  }
}