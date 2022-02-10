'use strict';
const { authorizeSalesforcePrompt } = require('./authorize-sf-prompt');
const { createTravelRequestForm } = require('./create-travel-request-form');
const { travelRequestSuccess } = require('./travel-request-success');
const { travelRequestApproved } = require('./travel-request-approved');
const { travelRequestRejected } = require('./travel-request-rejected');
const {
    travelRequestCreationFailed
} = require('./travel-request-create-failed');

module.exports = {
    authorizeSalesforcePrompt,
    createTravelRequestForm,
    travelRequestSuccess,
    travelRequestApproved,
    travelRequestRejected,
    travelRequestCreationFailed
};
