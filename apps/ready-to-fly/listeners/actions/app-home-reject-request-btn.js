'use strict';
const { travelRequestRejected } = require('../../user-interface/modals');
const { rejectTravelRequest } = require('../../salesforce/dml/travel-request');
const {
    refreshUIAfterStatusChange
} = require('../utils/approve-reject-callbacks');

const appHomeRejectRequestCallback = async ({ body, ack, client, context }) => {
    try {
        await ack();
        if (context.hasAuthorized) {
            try {
                // Reject travel request
                const travelRequestId = body.actions[0].value;
                await rejectTravelRequest(
                    context.sfconnection,
                    travelRequestId
                );
                // Trigger a Success Modal
                await client.views.open({
                    trigger_id: body.trigger_id,
                    view: travelRequestRejected()
                });
                // Delete message or refresh home tab
                refreshUIAfterStatusChange(body, client, context);
            } catch (e) {
                throw e;
            }
        } else {
            // Get BotInfo
            const botInfo = await client.bots.info({ bot: context.botId });
            // Open a Modal with message to navigate to App Home for authorization
            await client.views.open({
                trigger_id: shortcut.trigger_id,
                view: authorizeSalesforcePrompt(
                    context.teamId,
                    botInfo.bot.app_id
                )
            });
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }
};

module.exports = { appHomeRejectRequestCallback };
