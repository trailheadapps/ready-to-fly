'use strict';
const { HomeTab, Actions, Elements, Blocks } = require('slack-block-builder');

const authorizationScreen = (authUrl) => {
    const homeTab = HomeTab({
        callbackId: 'authorize-salesforce',
        privateMetaData: 'authorization-screen'
    }).blocks(
        Blocks.Header({ text: 'Connect to Salesforce' }),
        Blocks.Divider(),
        Blocks.Section({
            text: 'To get started with Ready to Fly, authorize with Salesforce'
        }),
        Actions({ blockId: 'sf-login' }).elements(
            Elements.Button({ text: 'Authorize with Salesforce' })
                .value('authorize-with-salesforce')
                .actionId('authorize-with-salesforce')
                .url(authUrl)
                .primary(true)
        )
    );
    return homeTab.buildToJSON();
};

module.exports = { authorizationScreen };
