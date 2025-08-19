/**
 * @name : NotificationService
 * @description : Wraps calls to the ConnectAPI Notification api.
 */
public with sharing class NotificationService {
  /**
   * @Method Name : getStatus()
   * @description : This method will return the users current counts of unseen and unread notifications.
   * @param : none
   * @return : Map<String,Object>
   */
  public static Map<String,Object> getStatus() {
    Map<String,Object> output = null;

    // Build the Request
    HttpRequest httpRequest = buildRequest('GET');
    String endpoint = httpRequest.getEndpoint();
    endpoint += '/status';
    httpRequest.setEndpoint(endpoint);

    try {
      // Call API
      Http http = new Http();
      HttpResponse httpResponse = http.send(httpRequest);
      String response = httpResponse.getBody();

      // Parse the Response
      if (httpResponse.getStatusCode() == 200 ) {
        Map<String,Object> responseObject = (Map<String,Object>) JSON.deserializeUntyped(response);
        output = responseObject;
        output.put('success', true);
      } else {
        List<Object> responseArray = (List<Object>) JSON.deserializeUntyped(response);
        output = (Map<String,Object>) responseArray[0];
        output.put('success', false);
      }
    } catch(Exception e) {
      System.debug(LoggingLevel.ERROR, e.getMessage());

      output = new Map<String,Object>();
      output.put('error', e.getMessage());
      output.put('success', false);
    }

    return output;
  }

  /**
   * @Method Name : getNotifications()
   * @description : This method will return the 50 most recent notifications.
   * @param : none
   * @return : Map<String,Object>
   */
  public static Map<String,Object> getNotifications() {
    Map<String,Object> output = new Map<String,Object>();

    NotificationServiceParser parser = new NotificationServiceParser();

    // Build the Request
    HttpRequest httpRequest = buildRequest('GET');
    String endpoint = httpRequest.getEndpoint();
    endpoint += '?size=50';
    httpRequest.setEndpoint(endpoint);
  
    try {
      // Call API
      Http http = new Http();
      HttpResponse httpResponse = http.send(httpRequest);
      String response = httpResponse.getBody();

      // Parse the Response
      if (httpResponse.getStatusCode() == 200) {
        Map<String,Object> responseObject = (Map<String,Object>) JSON.deserializeUntyped(response);
        // output.put('notifications', responseObject.get('notifications'));
        Object notifications = parser.parseNotifications(responseObject.get('notifications'));
        output.put('notifications', notifications);
        output.put('success', true);
      } else {
        List<Object> responseArray = (List<Object>) JSON.deserializeUntyped(response);
        output.put('error', responseArray[0]);
        output.put('success', false);
      }
    } catch(Exception e) {
      System.debug(LoggingLevel.ERROR, e.getMessage());

      output.put('error', e.getMessage());
      output.put('success', false);
    }

    return output;
  }

  /**
   * @Method Name : getMoreNotifications()
   * @description : This method will return 50 more notifications after the specified date/time.
   * @param : String before (date/time string)
   * @return : Map<String,Object>
   */
  public static Map<String,Object> getMoreNotifications(String before) {
    Map<String,Object> output = null;

    NotificationServiceParser parser = new NotificationServiceParser();

    // Build the Request
    HttpRequest httpRequest = buildRequest('GET');
    String endpoint = httpRequest.getEndpoint();
    endpoint += '?size=50&before=' + before;
    httpRequest.setEndpoint(endpoint);
  
    try {
      // Call API
      Http http = new Http();
      HttpResponse httpResponse = http.send(httpRequest);
      String response = httpResponse.getBody();

      // Parse the Response
      if (httpResponse.getStatusCode() == 200) {
        Map<String,Object> responseObject = (Map<String,Object>) JSON.deserializeUntyped(response);
        Object notifications = parser.parseNotifications(responseObject.get('notifications'));
        output = new Map<String,Object>();
        output.put('notifications', notifications);
        output.put('success', true);
      } else {
        List<Object> responseArray = (List<Object>) JSON.deserializeUntyped(response);
        output = (Map<String,Object>) responseArray[0];
        output.put('success', false);
      }
    } catch(Exception e) {
      System.debug(LoggingLevel.ERROR, e.getMessage());

      output = new Map<String,Object>();
      output.put('error', e.getMessage());
      output.put('success', false);
    }

    return output;
  }

  /**
   * @Method Name : setNotificationAsSeen()
   * @description : This method will flag a single notification as seen.
   * @param : String notificationId
   */
  public static void setNotificationAsSeen(String notificationId){
    // Build the Request
    HttpRequest httpRequest = buildRequest('PATCH');
    String endpoint = httpRequest.getEndpoint();
    endpoint += '/' + notificationId;
    httpRequest.setEndpoint(endpoint);

    String body = '{\"seen\": \"true\"}';
    httpRequest.setBody(body);

    try {
      // Call API
      Http http = new Http();
      HttpResponse httpResponse = http.send(httpRequest);
    } catch(Exception e) {
      System.debug(LoggingLevel.ERROR, e.getMessage());
    }
  }

  /**
   * @Method Name : setNotificationAsRead()
   * @description : This method will flag a single notification as read.
   * @param : String notificationId
   */
  public static void setNotificationAsRead(String notificationId) {
    // Build the Request
    HttpRequest httpRequest = buildRequest('PATCH');
    String endpoint = httpRequest.getEndpoint();
    endpoint += '/' + notificationId;
    httpRequest.setEndpoint(endpoint);

    String body = '{\"read\": \"true\"}';
    httpRequest.setBody(body);

    try {
      // Call API
      Http http = new Http();
      HttpResponse httpResponse = http.send(httpRequest);
    } catch(Exception e) {
      System.debug(LoggingLevel.ERROR, e.getMessage());
    }
  }

  /**
   * @Method Name : buildRequest()
   * @description : This method will build the HttpRequest object
   * @param : String method (GET, POST, PATCH, etc.)
   * @return : HttpRequest
   */
  private static HttpRequest buildRequest(String method) {
    HttpRequest webReq = new HttpRequest();
    webReq.setMethod(method);
    webReq.setHeader('Authorization','Bearer ' + UserInfo.getSessionId());
    webReq.setHeader('Content-Type', 'application/json'); 
    webReq.setHeader('Accept', 'application/json'); 

    // String domainPath = System.Url.getOrgDomainUrl().toExternalForm();
    String domainPath = System.Site.getBaseUrl();
    if(domainPath.endsWith('/s'))
    {
        domainPath = domainPath.left(domainPath.length() - 2);
    }

    String endpoint = domainPath + '/services/data/v58.0/connect/notifications';
    
    webReq.setEndpoint(endpoint);
    return webReq;
  }
}