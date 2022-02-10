'use strict';

const {
    travelRequestSuccess,
    travelRequestCreationFailed
} = require('../../user-interface/modals');
const { insertTravelRequest } = require('../../salesforce/dml/travel-request');
const { myTravelRequestsCallback } = require('../utils/home-tab-callbacks');

const createTravelRequestCallback = async ({
    ack,
    client,
    context,
    view,
    body
}) => {
    // Capture Data Input for the travel request record creation in Salesforce
    const origin =
        view['state']['values']['input-origin']['input-origin'].value;
    const destination =
        view['state']['values']['input-dest']['input-dest'].value;
    const startDate =
        view['state']['values']['input-start-date']['input-start-date']
            .selected_date;
    const endDate =
        view['state']['values']['input-end-date']['input-end-date']
            .selected_date;
    const cost = view['state']['values']['input-cost']['input-cost'].value;
    const desc = view['state']['values']['input-desc']['input-desc'].value;
    const approver =
        view['state']['values']['input-approver']['input-approver']
            .selected_option.value;
    // Add validations to forms before acknowledgement
    // This shows how to validate if cost contains only numbers and not a string
    if (isNaN(cost)) {
        await ack({
            response_action: 'errors',
            errors: {
                'input-cost': 'Enter a valid number for cost'
            }
        });
    } else {
        await ack();
        if (context.hasAuthorized) {
            // We do not use it, but this is how you can extract the Id of the Slack user from view listeners
            const userId = body['user']['id'];

            const travelRequestInput = {
                origin,
                destination,
                startDate,
                endDate,
                cost,
                desc,
                userId,
                approver
            };
            try {
                // Insert travel request
                const result = await insertTravelRequest(
                    context.sfconnection,
                    travelRequestInput
                );
                if (result.success) {
                    // Trigger a Success Modal
                    await client.views.open({
                        trigger_id: body.trigger_id,
                        view: travelRequestSuccess()
                    });
                    // Navigate to app home
                    myTravelRequestsCallback(context, client, userId);
                } else {
                    // Trigger a failure message Modal
                    await client.views.open({
                        trigger_id: body.trigger_id,
                        view: travelRequestCreationFailed()
                    });
                }
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
    }
};

module.exports = { createTravelRequestCallback };
