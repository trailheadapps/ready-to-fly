'use strict';
const appHomeAuthorizeButtonCallback = async ({ body, ack, client }) => {
    // This listener needs to exist for acknowledging the button click
    // but the user is redirected to /oauthstart custom route
    try {
        await ack();
        console.log('Initiating user to user OAuth dance...');
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }
};

module.exports = { appHomeAuthorizeButtonCallback };
