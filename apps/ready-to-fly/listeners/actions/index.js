'use strict';
const { appHomeAuthorizeButtonCallback } = require('./app-home-authorize-btn');
const {
    appHomeViewRequestButtonCallback
} = require('./app-home-view-request-btn');
const {
    appHomeViewMyTravelRequestsButtonCallback
} = require('./app-home-view-my-travel-requests-btn');
const {
    appHomeViewTravelRequestsToReviewButtonCallback
} = require('./app-home-view-travel-requests-to-review-btn');
const {
    appHomeApproveRequestCallback
} = require('./app-home-approve-request-btn');
const {
    appHomeRejectRequestCallback
} = require('./app-home-reject-request-btn');
const {
    createTravelRequestCallback
} = require('./app-home-create-travel-request-btn');

module.exports.register = (app) => {
    app.action('authorize-with-salesforce', appHomeAuthorizeButtonCallback);
    app.action('view-request', appHomeViewRequestButtonCallback);
    app.action(
        'view-my-travel-requests',
        appHomeViewMyTravelRequestsButtonCallback
    );
    app.action(
        'view-travel-requests-to-review',
        appHomeViewTravelRequestsToReviewButtonCallback
    );
    app.action('approve-request', appHomeApproveRequestCallback);
    app.action('reject-request', appHomeRejectRequestCallback);
    app.action('create-travel-request', createTravelRequestCallback);
};
