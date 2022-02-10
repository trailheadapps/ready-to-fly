'use strict';
const { Modal, Blocks } = require('slack-block-builder');

const authorizeSalesforcePrompt = (teamId, appId) => {
    return Modal({ title: 'Ready to Fly', close: 'Close' })
        .blocks(
            Blocks.Section({
                text: `*This shortcut requires to link Slack to your Salesforce account.*\n\n Navigate to <slack://app?team=${teamId}&id=${appId}&tab=home|App Home> and click *Authorize with Salesforce* to connect your Salesforce account`
            })
        )
        .buildToJSON();
};

module.exports = { authorizeSalesforcePrompt };
