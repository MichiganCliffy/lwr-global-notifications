import { createElement } from '@lwc/engine-dom';
import LwrChatterMentionLookup from 'c/lwrChatterMentionLookup';
import searchUsers from "@salesforce/apex/LwrChatterController.searchUsers";

jest.mock(
  "@salesforce/apex/LwrChatterController.searchUsers",
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

describe('c-lwr-chatter-mention-lookup', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('Test various search terms', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-mention-lookup', {
      is: LwrChatterMentionLookup
    });

    searchUsers.mockResolvedValue([{Id: '123456789', Name: 'Bill Clifford'}]);

    // Act
    document.body.appendChild(element);

    // Assert
    element.searchTerm = '<p></p>';
    jest.runAllTimers();
    await flushPromises();
    expect(searchUsers).toHaveBeenCalledTimes(0);

    element.searchTerm = '<p>this is a test</p>';
    jest.runAllTimers();
    await flushPromises();
    expect(searchUsers).toHaveBeenCalledTimes(0);

    element.searchTerm = '<p>this is a test using @b</p>';
    jest.runAllTimers();
    await flushPromises();
    expect(searchUsers).toHaveBeenCalledTimes(0);

    element.searchTerm = '<p>this is a test using @bclifford</p>';
    jest.runAllTimers();
    await flushPromises();
    expect(searchUsers).toHaveBeenCalledTimes(1);
    expect(searchUsers).toHaveBeenCalledWith({ searchTerm: 'bclifford' });
  });

  it('Test selecting a search result', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-mention-lookup', {
      is: LwrChatterMentionLookup
    });

    searchUsers.mockResolvedValue([{Id: '1', Name: 'Bill Clifford'},{Id: '2', Name: 'Bob Clifford'},{Id: '3', Name: 'Beth Clifford'}]);

    // Act
    const handler = jest.fn();
    element.addEventListener('select', handler);
    document.body.appendChild(element);

    // Assert
    element.searchTerm = '<p>this is a test using @bclifford</p>';
    jest.runAllTimers();
    await flushPromises();
    expect(searchUsers).toHaveBeenCalledTimes(1);
    expect(searchUsers).toHaveBeenCalledWith({ searchTerm: 'bclifford' });

    const results = element.shadowRoot.querySelectorAll('button');
    expect(results.length).toBe(3);

    let option = results[0];
    option.dataset.id = '1';
    option.dataset.label = 'Bill Clifford';
    option.dataset.search = 'bclifford';
    expect(option.dataset.id).toBe('1');

    results[0].click();

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0];
    expect(event.detail.id).toBe('1');
    expect(event.detail.name).toBe('Bill Clifford');
    expect(event.detail.search).toBe('bclifford');
    expect(event.detail.mention).toBe('[Bill Clifford]');

    expect(element.mentionMap).not.toBeNull();
    expect(element.mentionMap.size).toBe(1);
    expect(element.mentionMap.has('[Bill Clifford]')).toBeTruthy();
    expect(element.mentionMap.get('[Bill Clifford]')).toBe('1');
  });

  it('Test apex exception', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-mention-lookup', {
      is: LwrChatterMentionLookup
    });

    searchUsers.mockRejectedValue();

    // Act
    document.body.appendChild(element);

    // Assert
    element.searchTerm = '<p>this is a test using @bclifford</p>';
    jest.runAllTimers();
    await flushPromises();
    expect(searchUsers).toHaveBeenCalledTimes(1);
    expect(searchUsers).toHaveBeenCalledWith({ searchTerm: 'bclifford' });

    const results = element.shadowRoot.querySelectorAll('button');
    expect(results.length).toBe(0);
  });

    it('Test no results', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-mention-lookup', {
      is: LwrChatterMentionLookup
    });

    searchUsers.mockResolvedValue([]);

    // Act
    document.body.appendChild(element);

    // Assert
    element.searchTerm = '<p>this is a test using @bclifford</p>';
    jest.runAllTimers();
    await flushPromises();
    expect(searchUsers).toHaveBeenCalledTimes(1);
    expect(searchUsers).toHaveBeenCalledWith({ searchTerm: 'bclifford' });

    const results = element.shadowRoot.querySelectorAll('button');
    expect(results.length).toBe(0);
  });

  it('Test mapMentions method', async() => {
    // Arrange
    const element = createElement('c-lwr-chatter-mention-lookup', {
      is: LwrChatterMentionLookup
    });

    let mapping = new Map();
    mapping.set('[Bill Clifford]', '1');
    mapping.set('[Bob Clifford]', '2');
    mapping.set('[Beth Clifford]', '3');

    element.mentionMap = mapping;

    let actual = element.mapMentions('<p>this is a test using [Bill Clifford] for more stuff for [Bill Clifford] and [Beth Clifford] and [Bob Clifford]</p>');
    expect(actual).toBe('<p>this is a test using {1} for more stuff for {1} and {3} and {2}</p>');
  });
});