public with sharing class LwrFilesController {
  @AuraEnabled(cacheable=true)
  public static ContentVersion getContentDocumentId(String contentVersionId) {
    List<ContentVersion> versions = [
      SELECT ContentDocumentId
      FROM ContentVersion
      WHERE Id = :contentVersionId
      WITH SECURITY_ENFORCED
    ];

    if (versions.size() > 0) {
      return versions[0];
    } else {
      return null;
    }
  }
}