'use strict';

const insertTravelRequest = async (connection, travelRequestInput) => {
    try {
        const result = await connection.sobject('Travel_Request__c').create({
            Origin__c: travelRequestInput.origin,
            Destination__c: travelRequestInput.destination,
            Start_Date__c: travelRequestInput.startDate,
            End_Date__c: travelRequestInput.endDate,
            Cost__c: travelRequestInput.cost,
            Description__c: travelRequestInput.desc,
            Approver__c: travelRequestInput.approver
        });
        if (!result.success) {
            throw (
                'Failed to create travel request record in Salesforce ' +
                result.err[0]
            );
        }
        return result;
    } catch (e) {
        throw (
            'Failed to create travel request record in Salesforce ' + e.message
        );
    }
};

const approveTravelRequest = async (connection, travelRequestId) => {
    await _updateStatus(connection, travelRequestId, 'Approved');
};

const rejectTravelRequest = async (connection, travelRequestId) => {
    await _updateStatus(connection, travelRequestId, 'Rejected');
};

const _updateStatus = async (connection, travelRequestId, status) => {
    try {
        const result = await connection.sobject('Travel_Request__c').update({
            Id: travelRequestId,
            Status__c: status
        });
        if (!result.success) {
            throw result.err[0];
        }
        return result;
    } catch (e) {
        throw `Failed to ${
            status == 'Rejected' ? 'reject' : 'approve'
        } travel request in Salesforce: ${e.message}`;
    }
};

module.exports = {
    insertTravelRequest,
    approveTravelRequest,
    rejectTravelRequest
};
