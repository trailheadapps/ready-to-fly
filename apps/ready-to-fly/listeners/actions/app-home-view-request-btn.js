'use strict';
const appHomeViewRequestButtonCallback = async ({ body, ack, client }) => {
    // This listener needs to exist for acknowledging the button click
    // but the user is redirected to salesforce
    try {
        await ack();
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }
};

module.exports = { appHomeViewRequestButtonCallback };
