import { createElement } from '@lwc/engine-dom';
import LwrChatterCommentBody from 'c/lwrChatterCommentBody';

describe('c-lwr-chatter-comment-body', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('Test basic scaffolding, no value provided', async () => {
        // Arrange
        const element = createElement('c-lwr-chatter-comment-body', {
          is: LwrChatterCommentBody
        });

        // Act
        document.body.appendChild(element);

        // Assert
        let content = element.shadowRoot.querySelector('lightning-formatted-rich-text');
        expect(content.value).toBe('');
    });

    it('Test basic scaffolding, value provided', async () => {
        // Arrange
        const element = createElement('c-lwr-chatter-comment-body', {
          is: LwrChatterCommentBody
        });

        // Act
        element.body = { 
          messageSegments: [
            { "htmlTag": "p", "type": "MarkupBegin", },
            { "text": "Hello World", "type": "Text" },
            { "htmlTag": "p", "type": "MarkupEnd" }
          ]
        };
        element.capabilities = {
          content: {
            id: "069al00000HOEb8AAH",
            renditionUrl: "/sfsites/c/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB120BY90&versionId=068al00000HgRTS&operationContext=CHATTER&contentId=05Tal00000i2TjO",
            thumb120By90RenditionStatus: "Success",
            title: "E2E Roadmap - 2025-Q1.pptx",
            downloadUrl: "/sfsites/c/sfc/servlet.shepherd/version/download/068al00000HgRTS?asPdf=false&operationContext=CHATTER"
          }
        }
        document.body.appendChild(element);
        expect(element.body.messageSegments).not.toBeNull();
        expect(element.body.messageSegments.length).toBe(3);
        expect(element.capabilities).not.toBeNull();
        expect(element.capabilities.content).not.toBeNull();
        expect(element.capabilities.content.id).toBe('069al00000HOEb8AAH');

        // Assert
        let content = element.shadowRoot.querySelector('lightning-formatted-rich-text');
        expect(content.value).toBe('<p>Hello World</p>');
    });
});