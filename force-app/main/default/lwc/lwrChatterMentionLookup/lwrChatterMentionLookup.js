import { LightningElement, api, track } from 'lwc';
import {removeHtml} from 'c/lwrChatterUtilities';
import searchUsers from '@salesforce/apex/LwrChatterController.searchUsers'

export default class LwrChatterMentionLookup extends LightningElement {
  _searchTerm;
  show = false;
  @track matches = [];
  _mentionMap = null;

  @api
  get searchTerm() {
    return this._searchTerm;
  }
  set searchTerm(value) {
    this._searchTerm = value;

    this.searchTermUpdated();
  }

  @api
  get mentionMap() {
    if (this._mentionMap == null) {
      this._mentionMap = new Map();
    }

    return this._mentionMap;
  }
  set mentionMap(value) {
    this._mentionMap = value;
  }

  @api mapMentions(value) {
    let output = value;

    for (const [key, userId] of this.mentionMap) {
      output = output.replaceAll(key, '{' + userId + '}');
    }

    return output;
  }

  searchTermUpdated() {
    let cleanedTerm = removeHtml(this._searchTerm);

    if (this.hasMention(cleanedTerm)) {
      let mention = cleanedTerm.split('@').pop();
      if (mention.length >= 2) {
        this.search(mention);
      } else {
        this.show = false;
      }
    } else {
      this.show = false;
    }
  }

  hasMention(searchTerm) {
    if ((searchTerm.includes('@')) && (
        ( (searchTerm.indexOf('@') > 0) && (searchTerm[searchTerm.indexOf('@') - 1] === ' ') ) ||
        (searchTerm.charAt(0) === '@')
      )) {
      return true;
    }

    return false;
  }

  search(searchTerm) {
    searchUsers({searchTerm: searchTerm}).then(result => {
      if (result.length > 0) {
        let matches = result.map(item => {
          return {
            label: item.Name,
            id: item.Id,
            search: searchTerm
          };
        });

        this.matches = matches;
        this.show = true;
      } else {
        this.show = false;
      }
    }).catch(error => {
      console.error(`Chatter Mention Lookup Error: ${JSON.stringify(error)}`);
      this.show = false;
    });
  }

  handleSelection(event) {
    let mention = `[${event.currentTarget.dataset.label}]`;

    if (!this.mentionMap.has(mention)) {
      this.mentionMap.set(mention, event.currentTarget.dataset.id);
    }

    let selection = new CustomEvent("select", { detail: {
      id: event.currentTarget.dataset.id,
      name: event.currentTarget.dataset.label,
      search: event.currentTarget.dataset.search,
      mention: mention
    }});
    this.dispatchEvent(selection);

    this.show = false;
  }
}