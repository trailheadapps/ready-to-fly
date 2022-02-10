'use strict';
const { myTravelRequestsCallback } = require('../utils/home-tab-callbacks');

const appHomeViewMyTravelRequestsButtonCallback = async ({
    body,
    ack,
    client,
    context
}) => {
    try {
        await ack();
        await myTravelRequestsCallback(context, client, body.user.id);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }
};

module.exports = { appHomeViewMyTravelRequestsButtonCallback };
