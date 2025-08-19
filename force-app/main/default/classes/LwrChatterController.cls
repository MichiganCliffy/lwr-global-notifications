/**
 * @name : LwrChatterController
 * @description : Contains methods that the LWC Chatter Components will call.
 */
public with sharing class LwrChatterController {
  private static final Integer COMMENT_COUNT = 25;
  private static final Integer ELEMENT_COUNT = 10;

  @AuraEnabled
  public static Map<String, Object> getNewsFeed(String pageToken, Integer pageSize, String sortOrder) {
    ConnectApi.FeedSortOrder sortParam = ConnectApi.FeedSortOrder.LASTMODIFIEDDATEDESC;
    if (String.isNotBlank(sortOrder)) {
      sortParam = ConnectApi.FeedSortOrder.valueOf(sortOrder);
    }

    ConnectApi.FeedElementPage feed = ConnectApi.ChatterFeeds.getFeedElementsFromFeed(Network.getNetworkId(), ConnectApi.FeedType.News, 'me', pageToken, pageSize, sortParam);
    return ConnectApiHelper.parseFeed(feed);
  }

  @AuraEnabled
  public static Map<String, Object> searchNewsFeed(String searchTerm, String pageToken, Integer pageSize, String sortOrder) {
    ConnectApi.FeedSortOrder sortParam = ConnectApi.FeedSortOrder.LASTMODIFIEDDATEDESC;
    if (String.isNotBlank(sortOrder)) {
      sortParam = ConnectApi.FeedSortOrder.valueOf(sortOrder);
    }

    ConnectApi.FeedElementPage feed = ConnectApi.ChatterFeeds.searchFeedElementsInFeed(Network.getNetworkId(), ConnectApi.FeedType.News, 'me', pageToken, pageSize, sortParam, searchTerm);
    return ConnectApiHelper.parseFeed(feed);
  }

  @AuraEnabled
  public static Map<String, Object> getRecordFeed(String recordId, String pageToken, Integer pageSize, String sortOrder) {
    ConnectApi.FeedSortOrder sortParam = ConnectApi.FeedSortOrder.LASTMODIFIEDDATEDESC;
    if (String.isNotBlank(sortOrder)) {
      sortParam = ConnectApi.FeedSortOrder.valueOf(sortOrder);
    }

    ConnectApi.FeedElementPage feed = ConnectApi.ChatterFeeds.getFeedElementsFromFeed(Network.getNetworkId(), ConnectApi.FeedType.Record, recordId, pageToken, pageSize, sortParam);
    return ConnectApiHelper.parseFeed(feed);
  }

  @AuraEnabled
  public static Map<String, Object> searchRecordFeed(String recordId, String searchTerm, String pageToken, Integer pageSize, String sortOrder) {
    ConnectApi.FeedSortOrder sortParam = ConnectApi.FeedSortOrder.LASTMODIFIEDDATEDESC;
    if (String.isNotBlank(sortOrder)) {
      sortParam = ConnectApi.FeedSortOrder.valueOf(sortOrder);
    }

    ConnectApi.FeedElementPage feed = ConnectApi.ChatterFeeds.searchFeedElementsInFeed(Network.getNetworkId(), ConnectApi.FeedType.Record, recordId, pageToken, pageSize, sortParam, searchTerm);
    return ConnectApiHelper.parseFeed(feed);
  }

  @AuraEnabled()
  public static Map<String, Object> getFeedItem(String feedElementId) {
    ConnectApi.FeedElement element = ConnectApi.ChatterFeeds.getFeedElement(Network.getNetworkId(), feedElementId, COMMENT_COUNT, ELEMENT_COUNT, false, ConnectApi.FeedCommentSortOrder.CreatedDateLatestAsc);
    return ConnectApiHelper.parseFeedElement(element);
  }

	@AuraEnabled
  public static ConnectApi.CommentPage getFeedItemComments(String feedElementId, String pageParam) {
    return ConnectApi.ChatterFeeds.getCommentsForFeedElement(Network.getNetworkId(), feedElementId, pageParam, COMMENT_COUNT);
  }

	@AuraEnabled
  public static void likeFeedElement(String feedElementId) {
    updateLikeOnFeedElement(feedElementId, true);
  }

	@AuraEnabled
  public static void unlikeFeedElement(String feedElementId) {
    updateLikeOnFeedElement(feedElementId, false);
  }

	@AuraEnabled
  public static void updateLikeOnFeedElement(String feedElementId, Boolean liked) {
    ConnectApi.ChatterFeeds.updateLikeForFeedElement(Network.getNetworkId(), feedElementId, liked);
  }

	@AuraEnabled
  public static void likeComment(String commentId) {
    updateLikeOnComment(commentId, true);
  }

	@AuraEnabled
  public static void unlikeComment(String commentId) {
    updateLikeOnComment(commentId, false);
  }

	@AuraEnabled
  public static void updateLikeOnComment(String commentId, Boolean liked) {
    ConnectApi.ChatterFeeds.updateLikeForComment(Network.getNetworkId(), commentId, liked);
  }

	@AuraEnabled
	public static List<User> searchUsers(String searchTerm) {
    String searchQuery = 'FIND \'*' + searchTerm + '*\' IN ALL FIELDS RETURNING  User(Id,Name LIMIT 10)';
    List<List<SObject>> searchResults = Search.query(searchQuery);
    
    if (searchResults != null && searchResults.size() > 0) {
      return (List<User>) searchResults[0];
    }

    return null;
	}

  @AuraEnabled
  public static ConnectApi.Comment commentOnFeedElement(String feedElementId, String comment, String contentDocumentId) { 
    ConnectApi.CommentInput input = ConnectApiHelper.createComment(comment, contentDocumentId);
    return ConnectApi.ChatterFeeds.postCommentToFeedElement(Network.getNetworkId(), feedElementId, input, null);
  }

  @AuraEnabled
  public static ConnectApi.Comment updateComment(String feedCommentId, String comment, String contentDocumentId) { 
    // Cannot update attachment on a comment, so ignore the content document id
    ConnectApi.CommentInput input = ConnectApiHelper.createComment(comment, null);
    return ConnectApi.ChatterFeeds.updateComment(Network.getNetworkId(), feedCommentId, input);
  }

  @AuraEnabled
  public static void deleteComment(String feedCommentId) {
    ConnectApi.ChatterFeeds.deleteComment(Network.getNetworkId(), feedCommentId);
  }

	@AuraEnabled
	public static ConnectApi.FeedElement createPost(String subjectId, String body, List<String> contentDocumentIds) {
    ConnectApi.FeedItemInput post = ConnectApiHelper.createPost(subjectId, body, contentDocumentIds);
    return ConnectApi.ChatterFeeds.postFeedElement(Network.getNetworkId(), post);
	}

	@AuraEnabled
	public static ConnectApi.FeedElement updatePost(String feedElementId, String body, List<String> contentDocumentIds) {
    ConnectApi.FeedItemInput post = ConnectApiHelper.createPost(null, body, contentDocumentIds);
    return ConnectApi.ChatterFeeds.updateFeedElement(Network.getNetworkId(), feedElementId, post);
	}

	@AuraEnabled
  public static void bookmarkOnFeedItem(String feedElementId) {
    updateBookmarkOnFeedItem(feedElementId, true);
  }

	@AuraEnabled
  public static void removeBookmarkOnFeedItem(String feedElementId) {
    updateBookmarkOnFeedItem(feedElementId, false);
  }

	@AuraEnabled
  public static void updateBookmarkOnFeedItem(String feedElementId, Boolean bookmark) {
    ConnectApi.BookmarksCapabilityInput option = new ConnectApi.BookmarksCapabilityInput();
    option.isBookmarkedByCurrentUser = bookmark;

    ConnectApi.ChatterFeeds.updateFeedElementBookmarks(Network.getNetworkId(), feedElementId, option);
  }

	@AuraEnabled
  public static void muteFeedItem(String feedElementId) {
    updateMuteOnFeedItem(feedElementId, true);
  }

	@AuraEnabled
  public static void unmuteFeedItem(String feedElementId) {
    updateMuteOnFeedItem(feedElementId, false);
  }

	@AuraEnabled
  public static void updateMuteOnFeedItem(String feedElementId, Boolean mute) {
    ConnectAPi.ChatterFeeds.setIsMutedByMe(Network.getNetworkId(), feedElementId, mute);
  }

  @AuraEnabled
  public static void deleteFeedItem(String feedElementId) {
    ConnectApi.ChatterFeeds.deleteFeedElement(Network.getNetworkId(), feedElementId);
  }
}