'use strict';
const CryptoJS = require('crypto-js');
const config = require('../../config/config');

const upsert = async (connection, slackUserId, salesforceUserId) => {
    try {
        const encryptedAccessToken = CryptoJS.AES.encrypt(
            connection.accessToken,
            config.slack.aesKey
        ).toString();
        const encryptedRefreshToken = CryptoJS.AES.encrypt(
            connection.refreshToken,
            config.slack.aesKey
        ).toString();

        const result = await connection
            .sobject('Slack_Authentication__c')
            .upsert(
                {
                    Access_Token__c: encryptedAccessToken,
                    Refresh_Token__c: encryptedRefreshToken,
                    Slack_User_ID__c: slackUserId,
                    User__c: salesforceUserId
                },
                'Slack_User_ID__c'
            );

        if (!result.success) {
            throw JSON.stringify(result);
        }

        return result;
    } catch (e) {
        throw 'Failed to upsert auth info in Salesforce: ' + e.message;
    }
};

module.exports = { upsert };
