trigger TravelRequestTriggerHandler on Travel_Request__c(
    after insert,
    after update
) {
    if (Trigger.isInsert) {
        TravelRequestTriggerHandler.afterInsert(Trigger.new);
    } else if (Trigger.isAfter) {
        TravelRequestTriggerHandler.afterUpdate(Trigger.new, Trigger.oldMap);
    }
}
