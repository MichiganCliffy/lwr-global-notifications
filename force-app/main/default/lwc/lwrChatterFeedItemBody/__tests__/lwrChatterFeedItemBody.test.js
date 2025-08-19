import { createElement } from '@lwc/engine-dom';
import LwrChatterFeedItemBody from 'c/lwrChatterFeedItemBody';

describe('c-lwr-chatter-feed-item-body', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('Test basic scaffolding, no value provided', async () => {
        // Arrange
        const element = createElement('c-lwr-chatter-feed-item-body', {
          is: LwrChatterFeedItemBody
        });

        // Act
        document.body.appendChild(element);

        // Assert
        let content = element.shadowRoot.querySelector('lightning-formatted-rich-text');
        expect(content.value).toBe('');
    });

    it('Test basic scaffolding, value provided', async () => {
        // Arrange
        const element = createElement('c-lwr-chatter-feed-item-body', {
          is: LwrChatterFeedItemBody
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
          files: {
            items: [
              {
                downloadUrl: "/sfsites/c/sfc/servlet.shepherd/version/download/068al00000Hfruc?asPdf=false&operationContext=CHATTER",
                id: "069al00000HNf2IAAT",
                renditionUrl: "/sfsites/c/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB120BY90&versionId=068al00000Hfruc&operationContext=CHATTER&contentId=05Tal00000i1zwj",
                thumb120By90RenditionStatus: "Success",
                title: "Downtime Warnings.jpeg"
              },
              {
                downloadUrl: "/sfsites/c/sfc/servlet.shepherd/version/download/068al00000Hfb1u?asPdf=false&operationContext=CHATTER",
                id: "069al00000HNO7yAAH",
                renditionUrl: "/sfsites/c/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB120BY90&versionId=068al00000Hfb1u&operationContext=CHATTER&contentId=05Tal00000i1dDs",
                thumb120By90RenditionStatus: "Success",
                title: "lake tahoe pano copy.jpg"
              },
              {
                downloadUrl: "/sfsites/c/sfc/servlet.shepherd/version/download/068al00000Hg2tF?asPdf=false&operationContext=CHATTER",
                id: "069al00000HNpsrAAD",
                renditionUrl: "/sfsites/c/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB120BY90&versionId=068al00000Hg2tF&operationContext=CHATTER&contentId=05Tal00000i2Dax",
                thumb120By90RenditionStatus: "Success",
                title: "lake tahoe pano.jpg",
              },
              {
                downloadUrl: "/sfsites/c/sfc/servlet.shepherd/version/download/068al00000HfpCw?asPdf=false&operationContext=CHATTER",
                id: "069al00000HNcMEAA1",
                renditionUrl: "/sfsites/c/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB120BY90&versionId=068al00000HfpCw&operationContext=CHATTER&contentId=05Tal00000i1vIc",
                thumb120By90RenditionStatus: "Success",
                title: "List View Inline Editing Screenshots.pdf",
              }
            ]
          }
        };
        document.body.appendChild(element);
        expect(element.capabilities).not.toBeNull();
        expect(element.capabilities.files).not.toBeNull();
        expect(element.capabilities.files.items.length).toBe(4);

        // Assert
        let content = element.shadowRoot.querySelector('lightning-formatted-rich-text');
        expect(content.value).toBe('<p>Hello World</p>');
    });
  });