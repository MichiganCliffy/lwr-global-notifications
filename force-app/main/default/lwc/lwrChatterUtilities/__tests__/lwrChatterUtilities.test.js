import {removeHtml, debounce, isEmptyString, broadcastFeedUpdate, renderMessageSegments, renderMessageMentions} from 'c/lwrChatterUtilities';
import { publish } from 'lightning/messageService';
import lwrChatterFeedNotification from '@salesforce/messageChannel/lwrChatterFeedNotification__c';

const mockMessageSegments = require('./data/message-segments.json');

describe('c-lwr-chatter-utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('Test isEmptyString method', async() => {
    expect(isEmptyString('Test Test Test')).toBeFalsy();
    expect(isEmptyString('')).toBeTruthy();
    expect(isEmptyString(null)).toBeTruthy();
  });

  it('Test removeHtml method', async() => {
    expect(removeHtml('<p>Test Test Test</p>')).toBe('Test Test Test');
    expect(removeHtml('<p></p>')).toBe('');
    expect(removeHtml(null)).toBe('');
  });

  it('Test broadcastFeedUpdate method', async() => {
    broadcastFeedUpdate();

    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(undefined, lwrChatterFeedNotification, { action: 'RefreshFeed' });
  });

  it('Test debouce method', async() => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    debouncedFunc();
    debouncedFunc();

    jest.advanceTimersByTime(100);

    expect(func).toHaveBeenCalledTimes(1);
  });

  it('Test renderMessageSegments method', async() => {
    let actual = renderMessageSegments(mockMessageSegments);
    expect(actual).toBe('<p>Trying to @bclifford mention myself <b>This</b> is a <u>comment</u> with <i>a lot</i> of <s>rich</s> text!</p>');
  });

  it('Test renderMessageSegments method in edit mode', async() => {
    let actual = renderMessageSegments(mockMessageSegments, true);
    expect(actual).toBe('<p>Trying to [bclifford] mention myself <b>This</b> is a <u>comment</u> with <i>a lot</i> of <s>rich</s> text!</p>');
  });


  it('Test renderMessageMentions method', async() => {
    let actual = renderMessageMentions(mockMessageSegments);
    expect(actual.size).toBe(1);
    expect(actual.has('[bclifford]')).toBeTruthy();
    expect(actual.get('[bclifford]')).toBe('005al000000MFmnAAG');
  });
});