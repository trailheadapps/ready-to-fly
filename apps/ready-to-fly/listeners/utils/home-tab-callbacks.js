'use strict';
const {
    authorizationScreen,
    myTravelRequestsScreen,
    travelRequestsReviewScreen
} = require('../../user-interface/app-home');
const {
    queryMyTravelRequests,
    queryTravelRequestsPendingReview
} = require('../../salesforce/query/travel-request');

const myTravelRequestsCallback = async (context, client, slackUserId) => {
    if (context.hasAuthorized) {
        const conn = context.sfconnection;
        const currentuser = await conn.identity();

        // Query for travel requests
        const travelRequests = await queryMyTravelRequests(conn);

        await client.views.publish({
            // Use the user ID associated with the event
            user_id: slackUserId,
            view: myTravelRequestsScreen(
                travelRequests,
                currentuser.display_name,
                conn.instanceUrl
            )
        });
    } else {
        _publishAuthScreen(client, slackUserId);
    }
};

const pendingTravelRequestsCallback = async (context, client, slackUserId) => {
    if (context.hasAuthorized) {
        const conn = context.sfconnection;

        // Query for Pending travel requests
        const pendingTravelRequests = await queryTravelRequestsPendingReview(
            conn
        );

        await client.views.publish({
            // Use the user ID associated with the event
            user_id: slackUserId,
            view: travelRequestsReviewScreen(
                pendingTravelRequests,
                conn.instanceUrl
            )
        });
    } else {
        _publishAuthScreen(client, slackUserId);
    }
};

const _publishAuthScreen = async (client, slackUserId) => {
    await client.views.publish({
        user_id: slackUserId,
        view: authorizationScreen(
            `${process.env.HEROKU_URL}/oauthstart/${slackUserId}`
        )
    });
};

module.exports = { myTravelRequestsCallback, pendingTravelRequestsCallback };
