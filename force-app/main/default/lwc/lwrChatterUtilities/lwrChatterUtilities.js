import lwrChatterFeedNotification from '@salesforce/messageChannel/lwrChatterFeedNotification__c';
import { publish, createMessageContext } from 'lightning/messageService';
import { fileUploader } from './fileUploader';
import { fileDeleter } from './fileDeleter';

const removeHtml = (message) => {
  if (!message) {
    return '';
  }

  return message.replace(/<[^>]+>/g, function(match) {
    // You can perform custom logic here based on the matched tag.
    // For simple removal, just return an empty string.
    return '';
  }).replace(/&[^;]+;/gi, '');
}

const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const isEmptyString = (inputString)  =>{
  return (
    inputString === undefined ||
    inputString === null ||
      (typeof inputString === 'string' && inputString.trim() === '')
  );
}

const renderMessageSegments = (segments, edit = false) => {
  let output = '';

  segments.forEach((segment) => {
    if (segment.type === 'MarkupBegin') {
      output += `<${segment.htmlTag}>`;
    }

    if (segment.type === 'MarkupEnd') {
      output += `</${segment.htmlTag}>`;
    }

    if (segment.type === 'Text') {
      output += segment.text;
    }

    if (segment.type === 'Mention') {
      if (edit) {
        output += `[${segment.name}]`;
      } else {
        output += segment.text;
      }
    }
  });

  return output;
}

const renderMessageMentions = (segments) => {
  let output = new Map();

  segments.forEach((segment) => {
    if (segment.type === 'Mention') {
      let key = `[${segment.name}]`;
      output.set(key, segment.record.id);
    }
  });

  return output;
}

const broadcastFeedUpdate = () => {
  let messageContext = createMessageContext();
  publish(messageContext, lwrChatterFeedNotification, { action: 'RefreshFeed' });
}

export {
  removeHtml,
  debounce,
  isEmptyString,
  broadcastFeedUpdate,
  fileUploader,
  renderMessageSegments,
  renderMessageMentions,
  fileDeleter
};