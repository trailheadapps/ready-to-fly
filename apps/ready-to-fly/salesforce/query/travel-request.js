'use strict';

const queryMyTravelRequests = async (connection) => {
    try {
        //Get the UserId
        const currentuser = await connection.identity();

        // Query for travel requests
        const result = await connection.query(
            `SELECT Id,Cost__c, Description__c, Destination__c, End_Date__c, Origin__c, Start_Date__c, Status__c, Approver__r.Name, Name FROM Travel_Request__c WHERE OwnerId = \'${currentuser.user_id}\' ORDER BY Name`
        );
        return result;
    } catch (e) {
        throw new Error(e.message);
    }
};

const queryTravelRequestsPendingReview = async (connection) => {
    try {
        //Get the UserId
        const currentuser = await connection.identity();

        // Query for travel requests
        const result = await connection.query(
            `SELECT Id, Cost__c, Description__c, Destination__c, End_Date__c, Origin__c, Start_Date__c, Status__c, Owner.Name, Name FROM Travel_Request__c WHERE Approver__c = \'${currentuser.user_id}\' AND Status__c = 'New' ORDER BY Name`
        );
        return result;
    } catch (e) {
        throw new Error(e.message);
    }
};

module.exports = { queryMyTravelRequests, queryTravelRequestsPendingReview };
