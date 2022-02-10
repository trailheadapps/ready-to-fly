'use strict';
const {
    pendingTravelRequestsCallback
} = require('../utils/home-tab-callbacks');

const appHomeViewTravelRequestsToReviewButtonCallback = async ({
    body,
    ack,
    client,
    context
}) => {
    try {
        await ack();
        await pendingTravelRequestsCallback(context, client, body.user.id);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }
};

module.exports = { appHomeViewTravelRequestsToReviewButtonCallback };
