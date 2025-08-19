@isTest
private class LwrNotificationsControllerTests {
  @isTest
  static void testGetStatusSuccess() {
    Test.setMock(HttpCalloutMock.class, new NotificationServiceMocks());
    Map<String,Object> response = LwrNotificationsController.getStatus();

    System.assert(response.containsKey('success'));
    System.assert((Boolean)response.get('success'));
    System.assert(response.containsKey('unseenCount'));
    System.assertEquals(41, (Integer)response.get('unseenCount'));
  }

  @isTest
  static void testGetStatusException() {
    Test.setMock(HttpCalloutMock.class, new NotificationServiceMocks(true));
    Map<String,Object> response = LwrNotificationsController.getStatus();

    System.assert(response.containsKey('success'));
    System.assert(!(Boolean)response.get('success'));
    System.assert(response.containsKey('error'));
    System.assertEquals('Simulating an exception', (String)response.get('error'));
  }

  @isTest
  static void testGetStatusError() {
    Test.setMock(HttpCalloutMock.class, new NotificationServiceMocks(false, true));
    Map<String,Object> response = LwrNotificationsController.getStatus();

    System.assert(response.containsKey('success'));
    System.assert(!(Boolean)response.get('success'));
  }

  @isTest
  static void testMarkAsReadSuccess() {
    Test.setMock(HttpCalloutMock.class, new NotificationServiceMocks());
    LwrNotificationsController.setNotificationAsRead('1234567890');
  }

  @isTest
  static void testMarkAsReadException() {
    Test.setMock(HttpCalloutMock.class, new NotificationServiceMocks(true));
    LwrNotificationsController.setNotificationAsRead('1234567890');
  }

  @isTest
  static void testMarkAsSeenSuccess() {
    Test.setMock(HttpCalloutMock.class, new NotificationServiceMocks());
    LwrNotificationsController.setNotificationAsSeen('1234567890');
  }

  @isTest
  static void testMarkAsSeenException() {
    Test.setMock(HttpCalloutMock.class, new NotificationServiceMocks(true));
    LwrNotificationsController.setNotificationAsSeen('1234567890');
  }

  @isTest
  static void testGetNotificationsSuccess() {
    Test.setMock(HttpCalloutMock.class, new NotificationServiceMocks());
    Map<String,Object> response = LwrNotificationsController.getNotifications();

    System.assert(response.containsKey('success'));
    System.assert((Boolean)response.get('success'));
    System.assert(response.containsKey('notifications'));

    List<Object> notifications = (List<Object>)response.get('notifications');
    System.assertEquals(50, notifications.size());

    Map<String,Object> notification = (Map<String,Object>)notifications.get(0);
    System.assert(notification.containsKey('objectApiName'));
  }

  @isTest
  static void testGetNotificationsException() {
    Test.setMock(HttpCalloutMock.class, new NotificationServiceMocks(true));
    Map<String,Object> response = LwrNotificationsController.getNotifications();

    System.assert(response.containsKey('success'));
    System.assert(!(Boolean)response.get('success'));
    System.assert(response.containsKey('error'));
    System.assertEquals('Simulating an exception', (String)response.get('error'));
  }

  @isTest
  static void testGetNotificationsError() {
    Test.setMock(HttpCalloutMock.class, new NotificationServiceMocks(false, true));
    Map<String,Object> response = LwrNotificationsController.getNotifications();

    System.assert(response.containsKey('success'));
    System.assert(!(Boolean)response.get('success'));
  }

  @isTest
  static void testGetMoreNotificationsSuccess() {
    Test.setMock(HttpCalloutMock.class, new NotificationServiceMocks());
    Map<String,Object> response = LwrNotificationsController.getMoreNotifications('TEST');

    System.assert(response.containsKey('success'));
    System.assert((Boolean)response.get('success'));
    System.assert(response.containsKey('notifications'));

    List<Object> notifications = (List<Object>)response.get('notifications');
    System.assertEquals(0, notifications.size());
  }

  @isTest
  static void testGetMoreNotificationsException() {
    Test.setMock(HttpCalloutMock.class, new NotificationServiceMocks(true));
    Map<String,Object> response = LwrNotificationsController.getMoreNotifications('TEST');

    System.assert(response.containsKey('success'));
    System.assert(!(Boolean)response.get('success'));
    System.assert(response.containsKey('error'));
    System.assertEquals('Simulating an exception', (String)response.get('error'));
  }

  @isTest
  static void testGetMoreNotificationsError() {
    Test.setMock(HttpCalloutMock.class, new NotificationServiceMocks(false, true));
    Map<String,Object> response = LwrNotificationsController.getMoreNotifications('TEST');

    System.assert(response.containsKey('success'));
    System.assert(!(Boolean)response.get('success'));
  }
}