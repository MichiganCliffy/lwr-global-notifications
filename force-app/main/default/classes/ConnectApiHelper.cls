 global class ConnectApiHelper {

    public class InvalidParameterException extends Exception {}

    private static final Map<String, ConnectApi.MarkupType> supportedMarkup = new Map<String, ConnectApi.MarkupType> {
        'b' => ConnectApi.MarkupType.Bold,
        'strong' => ConnectApi.MarkupType.Bold,
        'code' => ConnectApi.MarkupType.Code,
        'i' => ConnectApi.MarkupType.Italic,
        'em' => ConnectApi.MarkupType.Italic,
        'li' => ConnectApi.MarkupType.ListItem,
        'ol' => ConnectApi.MarkupType.OrderedList,
        'p' => ConnectApi.MarkupType.Paragraph,
        's' => ConnectApi.MarkupType.Strikethrough,
        'u' => ConnectApi.MarkupType.Underline,
        'ul' => ConnectApi.MarkupType.UnorderedList,
        'a' => ConnectApi.MarkupType.Hyperlink
    };

    public static ConnectApi.FeedItemInput createPost(String subjectId, String formattedText, List<String> contentDocumentIds) {
      ConnectApi.MessageBodyInput messageInput = new ConnectApi.MessageBodyInput();
      messageInput.messageSegments = getMessageSegmentInputs(formattedText);

      ConnectApi.FeedItemInput input = new ConnectApi.FeedItemInput();
      input.body = messageInput;

      if (!String.isBlank(subjectId)) {
        input.subjectId = subjectId;
      }

      if (contentDocumentIds != null && contentDocumentIds.size() > 0) {
        ConnectApi.FilesCapabilityInput files = new ConnectApi.FilesCapabilityInput();
        files.items = new List<ConnectApi.FileIdInput>();

        for(String contentDocumentId : contentDocumentIds) {
          ConnectApi.FileIdInput file = new ConnectApi.FileIdInput();
          file.id = contentDocumentId;
          files.items.add(file);
        }
        
        ConnectApi.FeedElementCapabilitiesInput capabilities = new ConnectApi.FeedElementCapabilitiesInput();
        capabilities.files = files;

        input.capabilities = capabilities;
      }

      return input;
    }

    public static ConnectApi.CommentInput createComment(String textWithMentions, String contentDocumentId) {
      ConnectApi.MessageBodyInput messageInput = new ConnectApi.MessageBodyInput();
      messageInput.messageSegments = getMessageSegmentInputs(textWithMentions);

      ConnectApi.CommentInput input = new ConnectApi.CommentInput();
      input.body = messageInput;

      if (!String.isBlank(contentDocumentId)) {
        ConnectApi.ContentCapabilityInput contentCapability = new ConnectApi.ContentCapabilityInput();
        contentCapability.contentDocumentId = contentDocumentId;

        ConnectApi.CommentCapabilitiesInput commentCapabilitiesInput = new ConnectApi.CommentCapabilitiesInput();
        commentCapabilitiesInput.content = contentCapability;
        input.capabilities = commentCapabilitiesInput;
      }

      return input;
    }

    public static Map<String, Object> parseFeed(ConnectApi.FeedElementPage feed) {
      Map<Id,String> objectMap = ConnectApiHelper.mapObjects(feed);

      Map<String, Object> output = new Map<String, Object>();
      output.put('feed', feed);
      output.put('mapping', objectMap);

      return output;
    }

    public static Map<String, Object> parseFeedElement(ConnectApi.FeedElement element) {
      Map<Id,String> objectMap = ConnectApiHelper.mapObjects(element);

      Map<String, Object> output = new Map<String, Object>();
      output.put('feedElement', element);
      output.put('mapping', objectMap);

      return output;
    }

    public static Map<Id, String> mapObjects(ConnectApi.FeedElementPage feed) {
      Map<Id, String> output = new Map<Id, String>();

      for(ConnectApi.FeedElement feedElement : feed.elements) {
        for(ConnectApi.MessageSegment messageSegment : feedElement.header.messageSegments) {
          if (messageSegment.type === ConnectApi.MessageSegmentType.ENTITYLINK) {
            ConnectApi.EntityLinkSegment entityLink = (ConnectApi.EntityLinkSegment)messageSegment;
            Id entityId = entityLink.reference.id;
            output.put(entityId, getObjectApiName(entityId));
          }
        }
      }

      return output;
    }

    private static Map<Id, String> mapObjects(ConnectApi.FeedElement element) {
      Map<Id, String> output = new Map<Id, String>();

      for(ConnectApi.MessageSegment messageSegment : element.header.messageSegments) {
        if (messageSegment.type === ConnectApi.MessageSegmentType.ENTITYLINK) {
          ConnectApi.EntityLinkSegment entityLink = (ConnectApi.EntityLinkSegment)messageSegment;
          Id entityId = entityLink.reference.id;
          output.put(entityId, getObjectApiName(entityId));
        }
      }

      return output;
    }

    private static String getObjectApiName(Id recordId) {
      if ((recordId != null) && (recordId != '000000000000000AAA')) {
        try {
          return (recordId).getSObjectType().getDescribe().getName();
        } catch (Exception e) {
          return null;
        }
      }

      return null;
    }

    private static List<ConnectApi.MessageSegmentInput> getMessageSegmentInputs(String inputText) {
        if (inputText == null) {
            throw new InvalidParameterException('The inputText parameter cannot be null.');
        }

        List<ConnectApi.MessageSegmentInput> messageSegmentInputs = new List<ConnectApi.MessageSegmentInput>();
        Integer strPos = 0;
        //line breaks aren't correctly interpreted - matching OOTB implementation
        inputText = inputText.replaceAll('<br>', '<p>&nbsp;</p>');
        // The pattern for matching mentions, markup begin/end tags, and inline images.
        // The first group matches a 15 or 18 character ID surrounded by {}:
        //   (\\{[a-zA-Z0-9]{15}\\}|\\{[a-zA-Z0-9]{18}\\})
        // The second/third groups match beginning/ending HTML tags: (<[a-zA-Z]*>)|(</[a-zA-Z]*>)
        // The fourth group matches a 15 or 18 character content document ID preceded by "img:",
        //    optionally followed by a string (not containing '}'), and surrounded by {}:
        //    (\\{img:(069[a-zA-Z0-9]{12,15})(:[\\s\\S]*?)?\\})
        // The fifth group matches a 15 or 18 character record ID preceded by "record:" ex:{record:01t3E000002GCm9QAG}
        Pattern globalPattern = Pattern.compile('(\\{[a-zA-Z0-9]{15}\\}|\\{[a-zA-Z0-9]{18}\\})|(<[a-zA-Z]*>)|(</[a-zA-Z]*>)|(\\{img:(069[a-zA-Z0-9]{12,15})(:[\\s\\S]*?)?\\})|(\\{record:([a-zA-Z0-9]){15,18}(:[\\s\\S]*?)?\\})|(<a\\s+href=\\"[^\\"]+\\"[^>]*>)|(</a>)');
        Matcher globalMatcher = globalPattern.matcher(inputText);
        while (globalMatcher.find()) {
            String textSegment = inputText.substring(strPos, globalMatcher.start());
            String matchingText = globalMatcher.group();
            if (matchingText.startsWith('{')) {
                // Add a segment for any accumulated text (which includes unsupported HTML tags).
                addTextSegment(messageSegmentInputs, textSegment);

                // Strip off the { and }.
                String innerMatchedText = matchingText.substring(1, matchingText.length() - 1);

                if (innerMatchedText.startsWith('img:')) {
                    // This is an inline image.
                    String[] imageInfo = innerMatchedText.split(':', 3);
                    String altText = imageInfo.size() == 3 ? imageInfo[2] : null;
                    ConnectApi.InlineImageSegmentInput inlineImageSegmentInput = makeInlineImageSegmentInput(imageInfo[1], altText);
                    messageSegmentInputs.add(inlineImageSegmentInput);
                    strPos = globalMatcher.end();
                }
                else if (innerMatchedText.startsWith('record:')) {
                    // Inline record
                    String[] recordInfo = innerMatchedText.split(':');
                    ConnectApi.EntityLinkSegmentInput entityLinkSegmentInput = makeEntityLinkSegmentInput(recordInfo[1]);
                    messageSegmentInputs.add(entityLinkSegmentInput);
                    strPos = globalMatcher.end();
                }
                else {
                    // This is a mention id.
                    ConnectApi.MentionSegmentInput mentionSegmentInput = makeMentionSegmentInput(innerMatchedText);
                    messageSegmentInputs.add(mentionSegmentInput);
                    strPos = globalMatcher.end();
                }
            }
            else if (matchingText.toLowerCase().startsWith('<a ')) {
                String href = extractHref(matchingText);

                Integer linkTextStart = globalMatcher.end();
                Integer linkTextEnd = inputText.indexOf('</a>', linkTextStart);
                if (linkTextEnd > -1) {
                    String linkText = inputText.substring(linkTextStart, linkTextEnd);
                    addTextSegment(messageSegmentInputs, textSegment);
                    addLinkTypeSegment(messageSegmentInputs, href, linkText);
                    strPos = linkTextEnd + 4; // "</a>" is 4 characters
                    globalMatcher.region(strPos, inputText.length());
                }
            }
            else {
                // This is an HTML tag.
                boolean isBeginTag = !matchingText.startsWith('</');
                if (isBeginTag) {
                    // Strip off the < and >.
                    String tag = matchingText.substring(1, matchingText.indexOf('>'));
                    if (supportedMarkup.containsKey(tag.toLowerCase())) {
                        // Add a segment for any accumulated text (which includes unsupported HTML tags).
                        addTextSegment(messageSegmentInputs, textSegment);

                        ConnectApi.MarkupBeginSegmentInput markupBeginSegmentInput = makeMarkupBeginSegmentInput(tag);
                        messageSegmentInputs.add(markupBeginSegmentInput);
                        strPos = globalMatcher.end();
                    }
                }
                else { // This is an end tag.
                    // Strip off the </ and >.
                    String tag = matchingText.substring(2, matchingText.indexOf('>'));
                    if (supportedMarkup.containsKey(tag.toLowerCase())) {
                        // Add a segment for any accumulated text (which includes unsupported HTML tags).
                        addTextSegment(messageSegmentInputs, textSegment);

                        ConnectApi.MarkupEndSegmentInput markupEndSegmentInput = makeMarkupEndSegmentInput(tag);
                        messageSegmentInputs.add(markupEndSegmentInput);
                        strPos = globalMatcher.end();
                    }
                }
            }
        }

        // Take care of any text that comes after the last match.
        if (strPos < inputText.length()) {
            String trailingText = inputText.substring(strPos, inputText.length());
            addTextSegment(messageSegmentInputs, trailingText);
        }

        return messageSegmentInputs;
    }

    private static void addLinkTypeSegment(List<ConnectApi.MessageSegmentInput> messageSegmentInputs, String url, String urlName) {
        ConnectApi.MarkupBeginSegmentInput linkMarkupBeginSegment = new ConnectApi.MarkupBeginSegmentInput();
        linkMarkupBeginSegment.altText = urlName;
        linkMarkupBeginSegment.url = url;
        linkMarkupBeginSegment.markupType = supportedMarkup.get('a');
        messageSegmentInputs.add(linkMarkupBeginSegment);

        addTextSegment(messageSegmentInputs, urlName);

        ConnectApi.MarkupEndSegmentInput linkMarkupEndSegment = new ConnectApi.MarkupEndSegmentInput();
        linkMarkupEndSegment.markupType = supportedMarkup.get('a');
        messageSegmentInputs.add(linkMarkupEndSegment);
    }

    private static void addTextSegment(List<ConnectApi.MessageSegmentInput> messageSegmentInputs, String text) {
        if (text != null && text.length() > 0) {
            ConnectApi.TextSegmentInput textSegmentInput = makeTextSegmentInput(text);
            messageSegmentInputs.add(textSegmentInput);
        }
    }

    private static ConnectApi.TextSegmentInput makeTextSegmentInput(String text) {
        ConnectApi.TextSegmentInput textSegment = new ConnectApi.TextSegmentInput();
        textSegment.text = text;
        return textSegment;
    }

    private static ConnectApi.MentionSegmentInput makeMentionSegmentInput(String mentionId) {
        ConnectApi.MentionSegmentInput mentionSegment = new ConnectApi.MentionSegmentInput();
        mentionSegment.id = mentionId;
        return mentionSegment;
    }

    // Create entity link segment input using record ID
    // In the chatter post, it will display the Name of the record, with a hyperlink to view the record
    private static ConnectApi.EntityLinkSegmentInput makeEntityLinkSegmentInput(String recordId) {
        ConnectApi.EntityLinkSegmentInput entityLinkSegment = new ConnectApi.EntityLinkSegmentInput();
        entityLinkSegment.entityId = recordId;
        return entityLinkSegment;
    }


    /**
     * Create a MarkupBeginSegmentInput corresponding to the tag.  Checking whether the tag is
     * supported markup should happen before calling this method.
     */
    private static ConnectApi.MarkupBeginSegmentInput makeMarkupBeginSegmentInput(String tag) {
        ConnectApi.MarkupBeginSegmentInput markupBeginSegment = new ConnectApi.MarkupBeginSegmentInput();
        markupBeginSegment.markupType = supportedMarkup.get(tag.toLowerCase());
        return markupBeginSegment;
    }

    /**
     * Create a MarkupEndSegmentInput corresponding to the tag.  Checking whether the tag is
     * supported markup should happen before calling this method.
     */
    private static ConnectApi.MarkupEndSegmentInput makeMarkupEndSegmentInput(String tag) {
        ConnectApi.MarkupEndSegmentInput markupEndSegment = new ConnectApi.MarkupEndSegmentInput();
        markupEndSegment.markupType = supportedMarkup.get(tag.toLowerCase());
        return markupEndSegment;
    }

    private static ConnectApi.InlineImageSegmentInput makeInlineImageSegmentInput(String fileId, String altText) {
        ConnectApi.InlineImageSegmentInput inlineImageSegment = new ConnectApi.InlineImageSegmentInput();
        inlineImageSegment.fileId = fileId;
        if (String.isNotBlank(altText)) {
            inlineImageSegment.altText = altText;
        }
        return inlineImageSegment;
    }

    private static String extractHref(String tag) {
        Pattern hrefPattern = Pattern.compile('href=\\\"([^\\\"]+)\\\"');
        Matcher matcher = hrefPattern.matcher(tag);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return '';
    }
}