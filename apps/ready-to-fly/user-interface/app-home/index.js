'use strict';
const { authorizationScreen } = require('./authorization-screen');
const {
    myTravelRequestsScreen,
    travelRequestsReviewScreen,
    appendPendingTravelRequestBlock
} = require('./travel-requests');

module.exports = {
    authorizationScreen,
    myTravelRequestsScreen,
    travelRequestsReviewScreen,
    appendPendingTravelRequestBlock
};
