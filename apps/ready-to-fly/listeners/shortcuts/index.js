'use strict';

const { createTravelRequestCallback } = require('./create-travel-request');

module.exports.register = (app) => {
    app.shortcut('create-travel-request', createTravelRequestCallback);
};
