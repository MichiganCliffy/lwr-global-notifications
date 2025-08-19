/**
 * @name : NotificationServiceParser
 * @description : Utility methods for parsing out the response from the ConnectAPI Notification methods
 */
public with sharing class NotificationServiceParser {
  /**
   * Cached map of object API Names to icon names. Used to avoid
   * unnecessary describe calls to get these.
   */
  public Map<String, String> icons = new Map<String, String>();

  /**
   * @Method Name : getObjectApiName
   * @description : This method will return the object API name for the provided record ID.
   * @param : Id recordId
   * @return : String
   */
  public String getObjectApiName(Id recordId) {
    if ((recordId != null) && (recordId != '000000000000000AAA')) {
      try {
        return (recordId).getSObjectType().getDescribe().getName();
      } catch (Exception e) {
        return null;
      }
    }

    return null;
  }

  /**
   * @Method Name : getIconName
   * @description : This method will return the icon name for the provided object API name.
   * @param : String objectApiName
   * @return : String
   */
  public String getIconName(String objectApiName) {
    String iconName = '';
    List<Schema.DescribeTabSetResult> tabSetDesc = Schema.describeTabs();
    List<Schema.DescribeTabResult> tabDesc = new List<Schema.DescribeTabResult>();
    List<Schema.DescribeIconResult> iconDesc = new List<Schema.DescribeIconResult>();

    for (Schema.DescribeTabSetResult tsr : tabSetDesc) {
        tabDesc.addAll(tsr.getTabs());
    }

    for (Schema.DescribeTabResult tr : tabDesc) {
        if (objectApiName == tr.getSobjectName()) {
            if (tr.isCustom() == true) {
                iconDesc.addAll(tr.getIcons());
            } else {
                iconName = 'standard:' + objectApiName.toLowerCase();
                break;
            }
        }
    }

    for (Schema.DescribeIconResult ir : iconDesc) {
        if (ir.getContentType() == 'image/svg+xml') {
            iconName =
                'custom:' +
                ir.getUrl()
                    .substringBetween('custom/', '.svg')
                    .substringBefore('_');
            break;
        }
    }

    return iconName;
  }

  /**
   * @Method Name : findIconName
   * @description : This method will first check to see if the icon name is cached, if it is it will return
   * the cached icon name, otherwise it will look up the name and then store it to cache prior to returning it.
   * @param : String objectApiName
   * @return : String
   */
  public String findIconName(String objectApiName) {
    if (!this.icons.containsKey(objectApiName)) {
      String icon = this.getIconName(objectApiName);
      this.icons.put(objectApiName, icon);
      return icon;
    } else {
      return this.icons.get(objectApiName);
    }
  }

  /**
   * @Method Name : parseNotifications
   * @description : This method will parse a list notifications.
   * @param : Object notifications
   * @return : Object
   */
  public Object parseNotifications(Object notifications) {
    List<Object> notificationsList = (List<Object>)notifications;
    List<Object> output = new List<Object>();
    
    for(Object notification : notificationsList) {
        Map<String, Object> objMap = this.parseNotification(notification);
        output.add(objMap);
    }

    return output;
  }

  /**
   * @Method Name : parseNotification
   * @description : This method will parse a single notification.
   * @param : Object notification
   * @return : Map<String, Object>
   */
  public Map<String, Object> parseNotification(Object notification) {
    Map<String, Object> objMap = (Map<String,Object>) notification;
    String messageBody = (String)objMap.get('messageBody');
    if(messageBody != null && messageBody.trim() != '')
    {
        messageBody = messageBody.unescapeHtml4();
        objMap.put('messageBody', messageBody);
    }

    String messageTitle = (String)objMap.get('messageTitle');
    if(messageTitle != null && messageTitle.trim() != '')
    {
        messageTitle = messageTitle.unescapeHtml4();
        objMap.put('messageTitle', messageTitle);
    }

    Id objectId = (ID)objMap.get('target');
    if (objectId != null) {
      String objectApiName = this.getObjectApiName(objectId);
      objMap.put('objectApiName', objectApiName);

      if (String.isNotBlank(objectApiName)) {
        String icon = this.findIconName(objectApiName);
        if (String.isNotEmpty(icon)) {
          objMap.put('icon', icon);
        }
      }
    }

    return objMap;
  }
}