'use strict';

const {
    authorizeSalesforcePrompt,
    createTravelRequestForm
} = require('../../user-interface/modals');

const {
    fetchLoggedInUserManagerHirerachy
} = require('../../salesforce/query/user');

const openCreateTravelRequestModal = async (triggerId, client, context) => {
    if (context.hasAuthorized) {
        // Query for possible approvers
        const userRecords = await fetchLoggedInUserManagerHirerachy(
            context.sfconnection
        );
        const currentUser = userRecords.records[0];
        let approvers = [];
        if (currentUser.ManagerId) {
            approvers.push({
                name: currentUser?.Manager.Name,
                id: currentUser?.ManagerId
            });
        } else {
            // Send empty objects to please Bolt and not fail due to data issues
            approvers.push({ name: '', id: '' });
        }
        if (currentUser.Manager?.ManagerId) {
            approvers.push({
                name: currentUser?.Manager?.Manager.Name,
                id: currentUser?.Manager?.ManagerId
            });
        }
        await client.views.open({
            trigger_id: triggerId,
            view: createTravelRequestForm(approvers)
        });
    } else {
        // Get BotInfo
        const botInfo = await client.bots.info({ bot: context.botId });
        // Open a Modal with message to navigate to App Home for authorization
        await client.views.open({
            trigger_id: triggerId,
            view: authorizeSalesforcePrompt(context.teamId, botInfo.bot.app_id)
        });
    }
};

module.exports = { openCreateTravelRequestModal };
