'use strict';

const ServerToServerAuth = require('../salesforce/server-server-auth');
const UserToUserAuth = require('../salesforce/user-user-oauth');
const config = require('../config/config');

const {
    querySlackAuthentication
} = require('../salesforce/query/slack-authentication');
const NodeCache = require('node-cache');

// Cache to Store access and refresh tokens per user
const tokenCache = new NodeCache({ stdTTL: 600 });
// Cache to Store connection object per user
const connectionCache = new NodeCache({ stdTTL: 600 });

/*
 * This global middleware is run for all incoming requests before
 * any listener middleware
 * https://slack.dev/bolt-js/concepts#global-middleware
 */
const authWithSalesforce = async ({
    payload,
    context = {},
    next,
    body,
    slackUserId
} = {}) => {
    console.log('Executing Salesforce auth middleware');
    if (!slackUserId) {
        // For all events Slack returns the users Id as user.id
        if (payload?.user?.id) {
            slackUserId = payload.user.id;
        } else if (payload?.user) {
            // For Home Event payload.user gives the Id
            slackUserId = payload.user;
        } else if (body?.user?.id) {
            // For Views Listener Event, we retrieve it from the Body
            slackUserId = body.user.id;
        }
    }
    try {
        let authInfo = {};
        let serverToServerConnection = {};
        // User authorized and tokens are cached
        if (tokenCache.has(slackUserId)) {
            console.log('Tokens are cached');
            authInfo = tokenCache.get(slackUserId);
            context.hasAuthorized = true;
        } else {
            // Query for Slack Authentication records to see if user has authorized the app
            // with server to server flow
            console.log(
                'Tokens are not cached. Querying Salesforce with server to server flow...'
            );
            const serverToServerAuth = new ServerToServerAuth(
                config.salesforce
            );
            serverToServerConnection = await serverToServerAuth.connect();
            const result = await querySlackAuthentication(
                serverToServerConnection,
                slackUserId
            );
            // User not authorized
            if (result.records.length === 0) {
                console.log(
                    'Slack user not authorized, redirecting to Authorize page'
                );
                context.hasAuthorized = false;
            } else {
                // User authorized and tokens not cached
                authInfo = result.records[0];
                context.hasAuthorized = true;
                tokenCache.set(slackUserId, authInfo);
            }
        }
        // If user is authorized, create/retrieve user to user connection
        if (context.hasAuthorized === true) {
            console.log(
                'Slack user is authorized! Connecting with user to user flow'
            );
            let userToUserConnection = {};
            // Cache connection object for 10 minutes in the app
            if (connectionCache.has(slackUserId)) {
                userToUserConnection = connectionCache.get(slackUserId);
            } else {
                // Construct token object
                const token = {
                    accessToken: authInfo.Access_Token__c,
                    refreshToken: authInfo.Refresh_Token__c
                };
                const userToUserAuth = new UserToUserAuth(
                    config.salesforce,
                    serverToServerConnection.instanceUrl, // Can we obtain this in a different way?
                    token
                );
                userToUserConnection = await userToUserAuth.connect();
                connectionCache.set(slackUserId, userToUserConnection);
            }
            context.sfconnection = userToUserConnection;
        }
    } catch (e) {
        console.error(e);
        throw new Error(e.message);
    }
    if (next) {
        // Middleware has been invoked regularly
        await next();
    }

    return context;
};

module.exports = { authWithSalesforce, tokenCache };
