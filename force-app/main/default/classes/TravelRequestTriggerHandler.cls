public with sharing class TravelRequestTriggerHandler {
    public static void afterInsert(List<Travel_Request__c> requests) {
        // Preload related records to preserve bulkification
        Map<Id, String> slackUserIdsBySalesforceUserId = preloadUserMappings(
            requests
        );
        Map<Id, User> usersById = preloadOwnerNames(requests);

        List<SlackMessage> messages = new List<SlackMessage>();
        for (Travel_Request__c request : requests) {
            SlackMessage message = createMessage(
                request,
                slackUserIdsBySalesforceUserId,
                usersById
            );
            if (message != null) {
                messages.add(message);
            }
        }

        if (messages.size() > 0) {
            SlackService.postMessages(JSON.serialize(messages));
        }
    }

    public static void afterUpdate(
        List<Travel_Request__c> requests,
        Map<Id, Travel_Request__c> oldrequestsById
    ) {
        // Preload related records to preserve bulkification
        Map<Id, String> slackUserIdsBySalesforceUserId = preloadUserMappings(
            requests
        );
        Map<Id, User> usersById = preloadOwnerNames(requests);

        List<SlackMessage> messages = new List<SlackMessage>();
        for (Travel_Request__c request : requests) {
            Travel_Request__c oldrequest = oldrequestsById.get(request.Id);
            if (oldrequest.Status__c != request.Status__c) {
                SlackMessage message = createMessage(
                    request,
                    slackUserIdsBySalesforceUserId,
                    usersById
                );
                if (message != null) {
                    messages.add(message);
                }
            }
        }

        if (messages.size() > 0) {
            SlackService.postMessages(JSON.serialize(messages));
        }
    }

    private static Map<Id, String> preloadUserMappings(
        List<Travel_Request__c> requests
    ) {
        Set<Id> salesforceUserIds = new Set<Id>();
        List<SlackMessage> messages = new List<SlackMessage>();
        for (Travel_Request__c request : requests) {
            salesforceUserIds.add(request.OwnerId);
            salesforceUserIds.add(request.Approver__c);
        }
        List<Slack_Authentication__c> userMappings = [
            SELECT Slack_User_ID__c, User__c
            FROM Slack_Authentication__c
            WHERE User__c IN :salesforceUserIds
        ];

        Map<Id, String> slackUserIdsBySalesforceUserId = new Map<Id, String>();
        for (Slack_Authentication__c userMapping : userMappings) {
            slackUserIdsBySalesforceUserId.put(
                userMapping.User__c,
                userMapping.Slack_User_ID__c
            );
        }
        return slackUserIdsBySalesforceUserId;
    }

    private static Map<Id, User> preloadOwnerNames(
        List<Travel_Request__c> requests
    ) {
        Set<Id> ownerIds = new Set<Id>();
        List<SlackMessage> messages = new List<SlackMessage>();
        for (Travel_Request__c request : requests) {
            ownerIds.add(request.OwnerId);
        }
        List<User> users = [SELECT Name FROM User WHERE Id IN :ownerIds];

        return new Map<Id, User>(users);
    }

    private static SlackMessage createMessage(
        Travel_Request__c request,
        Map<Id, String> slackUserIdsBySalesforceUserId,
        Map<Id, User> usersById
    ) {
        Id destinationUserId;
        if (request.Status__c == 'New') {
            destinationUserId = request.Approver__c;
        } else {
            destinationUserId = request.OwnerId;
        }

        SlackMessage message;
        String slackUserId = slackUserIdsBySalesforceUserId.get(
            destinationUserId
        );
        if (slackUserId != null) {
            // Just post message if user authenticated from slack
            message = new SlackMessage();
            message.id = request.Id;
            message.name = request.Name;
            message.description = request.Description__c;
            message.origin = request.Origin__c;
            message.destination = request.Destination__c;
            message.startDate = request.Start_Date__c;
            message.endDate = request.End_Date__c;
            message.cost = request.Cost__c.intvalue();
            message.status = request.Status__c;
            message.ownerName = usersById.get(request.OwnerId).Name;
            message.userId = slackUserId;
            message.instanceUrl = URL.getSalesforceBaseUrl().toExternalForm();
        }
        return message;
    }
}
