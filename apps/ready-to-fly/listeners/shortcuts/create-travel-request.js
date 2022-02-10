'use strict';
const {
    openCreateTravelRequestModal
} = require('../utils/create-travel-request');

const createTravelRequestCallback = async ({
    shortcut,
    ack,
    client,
    context
}) => {
    try {
        await ack();
        await openCreateTravelRequestModal(
            shortcut.trigger_id,
            client,
            context
        );
    } catch (e) {
        throw e;
    }
};

module.exports = { createTravelRequestCallback };
