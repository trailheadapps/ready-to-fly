'use strict';
const {
    openCreateTravelRequestModal
} = require('../utils/create-travel-request');

const createTravelRequestCallback = async ({ body, ack, client, context }) => {
    try {
        await ack();
        await openCreateTravelRequestModal(body.trigger_id, client, context);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }
};

module.exports = { createTravelRequestCallback };
