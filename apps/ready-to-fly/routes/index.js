'use strict';
const { oauthStart } = require('./oauth-start');
const { oauthCallback } = require('./oauth-callback');
const { salesforceMessageCallback } = require('./salesforce-message-callback');

const registerCustomRoutes = () => {
    const routes = [];
    routes.push(oauthStart);
    routes.push(oauthCallback);
    routes.push(salesforceMessageCallback);
    return routes;
};

module.exports = { registerCustomRoutes };
