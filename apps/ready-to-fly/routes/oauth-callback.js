'use strict';
const jsforce = require('jsforce');
const config = require('../config/config');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { upsert } = require('../salesforce/dml/slack-authentication');
const persistedClient = require('../store/bolt-web-client');
const { authWithSalesforce } = require('../middleware/salesforce-auth');
const {
    myTravelRequestsCallback
} = require('../listeners/utils/home-tab-callbacks');

const fetchOAuthToken = async (req, res) => {
    console.log('Executing user to user OAuth callback');

    try {
        // Retrieve slackuserId from session
        const slackUserId = req.session.slackUserId;

        if (slackUserId) {
            // Parse Authorization Code
            let code = url.parse(req.url, true).query.code;

            // Request Access and Refresh tokens
            const authInfo = await _requestAccessAndRefreshTokens(code);

            // Upsert record in Salesforce
            console.log('Correctly authorized, Storying tokens in Salesforce');
            await upsert(
                authInfo.connection,
                slackUserId,
                authInfo.salesforceUserId
            );

            // Force execution of auth middleware so that user to user auth
            // flow is executed and we obtain the user context
            const context = await authWithSalesforce({
                slackUserId: slackUserId
            });

            // Show travel requests in app home
            await myTravelRequestsCallback(
                context,
                persistedClient.client,
                slackUserId
            );

            // Send success message
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(
                fs.readFileSync(
                    path.resolve(__dirname, '../routes/oauth-success.html')
                ),
                'utf-8'
            );
        } else {
            res.writeHead(500);
            res.end(
                'Missing Slack User Id in session. Failed to connect to Salesforce',
                'utf-8'
            );
        }
    } catch (e) {
        console.error(e);
        res.writeHead(500);
        res.end('Failed to connect to Salesforce', 'utf-8');
    }
};

const _requestAccessAndRefreshTokens = async (code) => {
    // You can change loginUrl to connect to sandbox or prerelease env
    const connection = new jsforce.Connection({
        oauth2: new jsforce.OAuth2({
            loginUrl: config.salesforce.loginUrl,
            clientId: config.salesforce.clientId,
            clientSecret: config.salesforce.clientSecret,
            redirectUri: `${config.salesforce.herokuUrl}/oauthcallback`
        }),
        version: config.salesforce.apiVersion
    });

    // Authorize to obtain refresh and access tokens
    const result = await connection.authorize(code);

    return {
        salesforceUserId: result.id,
        connection: connection
    };
};

const oauthCallback = {
    path: '/oauthcallback',
    method: ['GET'],
    handler: fetchOAuthToken
};

module.exports = { oauthCallback };
