/**
 * @name : LwrNotificationsController
 * @description : The Notification LWC Components will call these methods to show the end user their notifications.
 */
public with sharing class LwrNotificationsController {
  /**
   * @Method Name : getStatus
   * @description : This method will return the users current counts of unseen and unread notifications.
   * @param : none
   * @return : Map<String,Object>
   */
  @AuraEnabled
  public static Map<String,Object> getStatus() {
    return NotificationService.getStatus();
  }

  /**
   * @Method Name : setNotificationAsRead
   * @description : This method will mark a single notification as read.
   * @param : String notificationId
   */
  @AuraEnabled
  public static void setNotificationAsRead(String notificationId) {
    NotificationService.setNotificationAsRead(notificationId);
  }

  /**
   * @Method Name : setNotificationAsSeen
   * @description : This method will mark a single notifications as seen.
   * @param : String notificationId
   */
  @AuraEnabled
  public static void setNotificationAsSeen(String notificationId) {
    NotificationService.setNotificationAsSeen(notificationId);
  }

  /**
   * @Method Name : getNotifications
   * @description : This method will return the most recent 50 notifications.
   * @param : none
   * @return : Map<String,Object>
   */
  @AuraEnabled
  public static Map<String,Object> getNotifications() {
    return NotificationService.getNotifications();
  }

  /**
   * @Method Name : getMoreNotifications
   * @description : This method will return the next 50 notifications after the specified date/time.
   * @param : String before (date/time string)
   * @return : Map<String,Object>
   */
  @AuraEnabled
  public static Map<String,Object> getMoreNotifications(String before) {
    return NotificationService.getMoreNotifications(before);
  }
}