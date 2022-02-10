/**
 * Class used to create sample data
 */
Profile standardPlatformUserProfile = [SELECT Id FROM Profile WHERE Name ='Standard Platform User'];

Id myUserId = UserInfo.getUserId();

// Retrieve / Delete existing records to allow re-execution of script
String subordinateName = 'jhoffman' + myUserId + '@trailhead.com';
String managerName = 'mchang' + myUserId + '@trailhead.com';
List<User> subordinates = [SELECT Id FROM User WHERE Username = :subordinateName];
List<User> managers = [SELECT Id FROM User WHERE Username = :managerName];
delete [SELECT Id FROM Travel_Request__c];

User subordinate;
if (subordinates.size() == 0) {
  subordinate = new User();
  subordinate.FirstName = 'John';
  subordinate.LastName = 'Hoffman';
  subordinate.Email = 'jhoffman@trailhead.com';
  subordinate.Alias = 'jhoffman';
  subordinate.Username = subordinateName;
  subordinate.LocaleSidKey = 'en_US';
  subordinate.TimeZoneSidKey = 'GMT';
  subordinate.ProfileID = standardPlatformUserProfile.Id;
  subordinate.LanguageLocaleKey = 'en_US';
  subordinate.EmailEncodingKey = 'UTF-8';
  subordinate.ManagerId = myUserId;
  insert subordinate;
} else {
  subordinate = subordinates[0];
}

User manager;
if (managers.size() == 0) {
  manager = new User();
  manager.FirstName = 'Maria';
  manager.LastName = 'Chang';
  manager.Email = 'mchang@trailhead.com';
  manager.Alias = 'mchang';
  manager.Username = managerName;
  manager.LocaleSidKey = 'en_US';
  manager.TimeZoneSidKey = 'GMT';
  manager.ProfileID = standardPlatformUserProfile.Id;
  manager.LanguageLocaleKey = 'en_US';
  manager.EmailEncodingKey = 'UTF-8';
  insert manager;
} else {
  manager = managers[0];
}

User myUser = [SELECT ManagerId FROM User WHERE Id = :myUserId LIMIT 1];
myUser.ManagerId = manager.Id;
update myUser;

Travel_Request__c ta1 = new Travel_Request__c();
ta1.OwnerId = myUser.Id;
ta1.Approver__c = manager.Id;
ta1.Cost__c = 500;
ta1.Description__c = 'Trip to visit London Developer Group';
ta1.Origin__c = 'Madrid';
ta1.Destination__c = 'London';
ta1.Start_Date__c = Date.newInstance(2022,6,1);
ta1.End_Date__c = Date.newInstance(2022,6,3);
ta1.Status__c = 'Approved';
insert ta1;

Travel_Request__c ta2 = new Travel_Request__c();
ta2.OwnerId = myUser.Id;
ta2.Approver__c = manager.Id;
ta2.Cost__c = 3000;
ta2.Description__c = 'Trip to I love JS conference 2022';
ta2.Origin__c = 'Madrid';
ta2.Destination__c = 'Vegas';
ta2.Start_Date__c = Date.newInstance(2022,8,22);
ta2.End_Date__c = Date.newInstance(2022,8,27);
ta2.Status__c = 'New';
insert ta2;

Travel_Request__c ta3 = new Travel_Request__c();
ta3.OwnerId = myUser.Id;
ta3.Approver__c = manager.Id;
ta3.Cost__c = 2000;
ta3.Description__c = 'Trip for customer X meeting';
ta3.Origin__c = 'Madrid';
ta3.Destination__c = 'San Francisco';
ta3.Start_Date__c = Date.newInstance(2022,3,2);
ta3.End_Date__c = Date.newInstance(2022,3,5);
ta3.Status__c = 'Rejected';
insert ta3;

Travel_Request__c ta4 = new Travel_Request__c();
ta4.OwnerId = subordinate.Id;
ta4.Approver__c = myUser.Id;
ta4.Cost__c = 1000;
ta4.Description__c = 'Trip for customer Y meeting';
ta4.Origin__c = 'Madrid';
ta4.Destination__c = 'Paris';
ta4.Start_Date__c = Date.newInstance(2022,5,12);
ta4.End_Date__c = Date.newInstance(2022,5,14);
ta4.Status__c = 'New';
insert ta4;

Travel_Request__c ta5 = new Travel_Request__c();
ta5.OwnerId = subordinate.Id;
ta5.Approver__c = myUser.Id;
ta5.Cost__c = 1000;
ta5.Description__c = 'Trip for Apex for All Conference 2022';
ta5.Origin__c = 'Madrid';
ta5.Destination__c = 'Dublin';
ta5.Start_Date__c = Date.newInstance(2022,7,17);
ta5.End_Date__c = Date.newInstance(2022,7,20);
ta5.Status__c = 'New';
insert ta5;