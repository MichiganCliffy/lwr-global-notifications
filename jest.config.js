const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

module.exports = {
    ...jestConfig,
    modulePathIgnorePatterns: ['<rootDir>/.localdevserver'],
    moduleNameMapper: {
      '^lightning/actions$': '<rootDir>/force-app/test/jest-mocks/lightning/actions',
      '^lightning/confirm$': '<rootDir>/force-app/test/jest-mocks/lightning/confirm',
      '^lightning/modal$': '<rootDir>/force-app/test/jest-mocks/lightning/modal',
      '^lightning/modalHeader$': '<rootDir>/force-app/test/jest-mocks/lightning/modalHeader',
      '^lightning/modalBody$': '<rootDir>/force-app/test/jest-mocks/lightning/modalBody',
      '^lightning/modalFooter$': '<rootDir>/force-app/test/jest-mocks/lightning/modalFooter',
      '^lightning/platformShowToastEvent$': '<rootDir>/force-app/test/jest-mocks/lightning/platformShowToastEvent',
      '^lightning/navigation$': '<rootDir>/force-app/test/jest-mocks/lightning/navigation',
      '^lightning/uiRelatedListApi$': '<rootDir>/force-app/test/jest-mocks/lightning/uiRelatedListApi',
      '^lightning/empApi$': '<rootDir>/force-app/test/jest-mocks/lightning/empApi',
      '^lightning/messageService$': '<rootDir>/force-app/test/jest-mocks/lightning/messageService',
      '^@salesforce/community/basePath$': '<rootDir>/force-app/test/jest-mocks/@salesforce/community/basePath',
      '^@salesforce/client/formFactor$': '<rootDir>/force-app/test/jest-mocks/@salesforce/client/formFactor.js',
      '^lightning/refresh$':'<rootDir>/force-app/test/jest-mocks/lightning/refresh',
      '^lightning/uiRecordApi$':'<rootDir>/force-app/test/jest-mocks/lightning/uiRecordApi',
      '^lightning/toast$': '<rootDir>/force-app/test/jest-mocks/lightning/toast',
      '^lightning/platformWorkspaceApi$':'<rootDir>/force-app/test/jest-mocks/lightning/platformWorkspaceApi'
    }
};