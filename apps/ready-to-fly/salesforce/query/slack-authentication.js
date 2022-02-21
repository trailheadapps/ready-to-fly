'use strict';
const CryptoJS = require('crypto-js');
const config = require('../../config/config');

const querySlackAuthentication = async (connection, slackUserId) => {
    try {
        const result = await connection.query(
            `SELECT Id, Refresh_Token__c, Access_Token__c, Slack_User_ID__c, User__c FROM Slack_Authentication__c WHERE Slack_User_ID__c = \'${slackUserId}\'`
        );

        if (result.records.length > 0) {
            result.records[0].Access_Token__c = CryptoJS.AES.decrypt(
                result.records[0].Access_Token__c,
                config.slack.aesKey
            ).toString(CryptoJS.enc.Utf8);
            result.records[0].Refresh_Token__c = CryptoJS.AES.decrypt(
                result.records[0].Refresh_Token__c,
                config.slack.aesKey
            ).toString(CryptoJS.enc.Utf8);
        }
        return result;
    } catch (e) {
        throw new Error(e.message);
    }
};

module.exports = { querySlackAuthentication };
