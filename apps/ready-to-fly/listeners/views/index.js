'use strict';

const {
    createTravelRequestCallback
} = require('./create-travel-request-sf-record');

module.exports.register = (app) => {
    app.view('initiate_travel_request', createTravelRequestCallback);
};
