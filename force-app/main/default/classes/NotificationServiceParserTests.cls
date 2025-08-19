@isTest
private class NotificationServiceParserTests {
  @TestSetup
  static void createData() {
    UserRole role = new UserRole(DeveloperName = 'TestRole', Name = 'Test Role');
    insert role;

    Profile pf = [SELECT Id FROM Profile WHERE Name='System Administrator'];

    List<User> users = new List<User>();
    User user = new User(
      Username='unittest@aaa.bbb',
      FirstName='Unit',
      LastName='Test',
      Email='unittest@aaa.bbb', 
      Alias='UnitTest',
      TimeZoneSidKey='America/Los_Angeles', 
      LocaleSidKey='en_US', 
      EmailEncodingKey='ISO-8859-1', 
      ProfileId=pf.Id,
      LanguageLocaleKey='en_US',
      UserRoleId=role.Id
    );
    users.add(user);
    insert users;

    List<OpportunityStage> firstStage = [SELECT ApiName FROM OpportunityStage WHERE IsActive=true ORDER BY SortOrder ASC LIMIT 1];

    System.runAs(user) {
      //insert account
      List<Account> accounts = new List<Account>();
      Account account = new Account();
      account.Name = 'TestAccount';
      accounts.add(account);
      insert accounts;
      
      //insert contact
      List<Contact> contacts = new List<Contact>();
      Contact contact = new Contact();
      contact.Firstname = 'Contact';
      contact.LastName = 'Test1';
      contact.Email ='testContact1@test.com';
      contact.AccountId = account.Id;
      contacts.add(contact);
      insert contacts;

      //insert opportunity
      List<Opportunity> opportunities = new List<Opportunity>();
      Opportunity opportunity = new Opportunity();
      opportunity.name = 'Opportunity';
      opportunity.accountId = account.Id;
      opportunity.CloseDate = System.today().adddays(1);
      opportunity.StageName = firstStage[0].ApiName;
      opportunities.add(opportunity);
      insert opportunities;
    }
  }

  @isTest
  static void testGetObjectApiNameSuccess() {
    NotificationServiceParser parser = new NotificationServiceParser();

    List<Account> accounts = [SELECT Id FROM Account];
    String actual = parser.getObjectApiName(accounts[0].Id);
    System.assertEquals('Account', actual);

    List<Opportunity> opportunities = [SELECT Id FROM Opportunity];
    actual = parser.getObjectApiName(opportunities[0].Id);
    System.assertEquals('Opportunity', actual);
  }

  @isTest
  static void testGetObjectApiNameNull() {
    NotificationServiceParser parser = new NotificationServiceParser();
    String actual = parser.getObjectApiName('000000000000000AAA');
    System.assertEquals(null, actual);
  }

  @isTest
  static void testGetIconNameSuccess() {
    NotificationServiceParser parser = new NotificationServiceParser();
    String actual = parser.getIconName('Opportunity');
    System.assertEquals('standard:opportunity', actual);

    actual = parser.getIconName('Account');
    System.assertEquals('standard:account', actual);
  }

  @isTest
  static void testGetIconNameEmpty() {
    NotificationServiceParser parser = new NotificationServiceParser();
    String actual = parser.getIconName('NotAnObject');
    System.assertEquals('', actual);
  }

  @isTest
  static void testFindIconName() {
    NotificationServiceParser parser = new NotificationServiceParser();
    System.assertEquals(0, parser.icons.size());

    String actual = parser.findIconName('Opportunity');
    System.assertEquals('standard:opportunity', actual);

    System.assertEquals(1, parser.icons.size());
    System.assert(parser.icons.containsKey('Opportunity'));
    System.assertEquals('standard:opportunity', parser.icons.get('Opportunity'));
  }

  @isTest
  static void testParseNotification() {
    Object notification = JSON.deserializeUntyped('{"communityId":"all","count":1,"id":"e598d8f26ae97e886343aea0e8b86d53","image":"https://test.sandbox.my.salesforce.com/img/notificationsEmail/custom_notification.png","lastModified":"2025-02-24T21:27:50.313Z","messageBody":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus mattis luctus ante non congue. Donec lobortis, risus et faucibus rutrum, nunc lacus euismod odio, ac maximus dolor nisl non lacus.","messageTitle":"Test Notification 50","mostRecentActivityDate":"2025-02-24T21:45:06.730Z","organizationId":"00D8I000001VePiUAK","read":false,"recipientId":"00559000001kyRsAAI","seen":true,"target":"006Nq00000FEyJrIAL","type":"0ML59000000CbazGAC","url":"/connect/notifications/e598d8f26ae97e886343aea0e8b86d53"}');

    NotificationServiceParser parser = new NotificationServiceParser();
    Map<String,Object> actual = parser.parseNotification(notification);

    System.assert(actual.containsKey('id'));
    System.assertEquals('e598d8f26ae97e886343aea0e8b86d53', actual.get('id'));

    System.assert(actual.containsKey('objectApiName'));
    System.assertEquals('Opportunity', actual.get('objectApiName'));

    System.assert(actual.containsKey('messageBody'));
    System.assertEquals('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus mattis luctus ante non congue. Donec lobortis, risus et faucibus rutrum, nunc lacus euismod odio, ac maximus dolor nisl non lacus.', actual.get('messageBody'));

    System.assert(actual.containsKey('messageTitle'));
    System.assertEquals('Test Notification 50', actual.get('messageTitle'));

    System.assert(actual.containsKey('icon'));
    System.assertEquals('standard:opportunity', actual.get('icon'));
  }

  @isTest
  static void testParseNotifications() {
    Object notifications = JSON.deserializeUntyped('[{"communityId":"all","count":1,"id":"e598d8f26ae97e886343aea0e8b86d53","image":"https://test.sandbox.my.salesforce.com/img/notificationsEmail/custom_notification.png","lastModified":"2025-02-24T21:27:50.313Z","messageBody":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus mattis luctus ante non congue. Donec lobortis, risus et faucibus rutrum, nunc lacus euismod odio, ac maximus dolor nisl non lacus.","messageTitle":"Test Notification 1","mostRecentActivityDate":"2025-02-24T21:45:06.730Z","organizationId":"00D8I000001VePiUAK","read":false,"recipientId":"00559000001kyRsAAI","seen":true,"target":"006Nq00000FEyJrIAL","type":"0ML59000000CbazGAC","url":"/connect/notifications/e598d8f26ae97e886343aea0e8b86d53"},{"communityId":"all","count":1,"id":"e598d8f26ae97e886343aea0e8b86d54","image":"https://test.sandbox.my.salesforce.com/img/notificationsEmail/custom_notification.png","lastModified":"2025-02-24T21:27:50.313Z","messageBody":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus mattis luctus ante non congue. Donec lobortis, risus et faucibus rutrum, nunc lacus euismod odio, ac maximus dolor nisl non lacus.","messageTitle":"Test Notification 2","mostRecentActivityDate":"2025-02-24T21:45:06.730Z","organizationId":"00D8I000001VePiUAK","read":false,"recipientId":"00559000001kyRsAAI","seen":true,"target":"006Nq00000FEyJrIAL","type":"0ML59000000CbazGAC","url":"/connect/notifications/e598d8f26ae97e886343aea0e8b86d53"}]');

    NotificationServiceParser parser = new NotificationServiceParser();
    Object actual = parser.parseNotifications(notifications);

    System.assertEquals(1, parser.icons.size());

    System.assert(actual instanceOf List<Object>);

    List<Object> actualNotifications = (List<Object>)actual;
    System.assertEquals(2, actualNotifications.size());

    Object firstNotification = actualNotifications.get(0);
    System.assert(firstNotification instanceOf Map<String,Object>);

    Object secondNotification = actualNotifications.get(1);
    System.assert(secondNotification instanceOf Map<String,Object>);
  }
}