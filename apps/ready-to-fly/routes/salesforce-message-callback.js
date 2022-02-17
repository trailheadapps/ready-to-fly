'use strict';
const CryptoJS = require('crypto-js');
const persistedClient = require('../store/bolt-web-client');
const {
    appendPendingTravelRequestBlock
} = require('../user-interface/app-home');
const { Md, Message } = require('slack-block-builder');
const { authWithSalesforce } = require('../middleware/salesforce-auth');
const config = require('../config/config');

const salesforceMessageHandler = async (req, res) => {
    // Note:if using HTTPReceiver instead of ExpressReceiver, compute the body with raw-body as follows:
    // const rawBody = await getRawBody(req);
    // const body = JSON.parse(rawBody.toString());

    // Get Salesforce signature
    const signature = req.headers['x-salesforce-signature'];

    // Check HMAC 256 signature
    // Note: if fields sent in body have decimal digits,
    // the JSON parsing from Apex and Node differs and this may fail
    const hmac = CryptoJS.HmacSHA256(JSON.stringify(req.body), config.hmacKey);
    const hmacBase64 = CryptoJS.enc.Base64.stringify(hmac);

    if (signature !== hmacBase64) {
        console.error('Suspicious callout origin');
        // Respond with error
        res.writeHead(403);
        res.end('Wrong Salesforce signature', 'utf-8');
        return;
    }

    // We can ensure the user is authorized because it was checked
    // in Salesforce before sending the message,
    // and we verified the HMAC on receival
    const message = req.body[0];
    switch (message.status) {
        case 'New':
            await _postNewTravelRequestToReviewMessage(
                message.userId,
                _convertMessageToTravelRequestObject(message),
                message.instanceUrl
            );
            break;
        case 'Approved':
            await _postMessage(
                message.userId,
                `Your travel request <${message.instanceUrl}/${message.id}|${
                    message.name
                }> has been approved ${Md.emoji(
                    'tada'
                )}. Pack your bags and get started!!!`
            );
            break;
        case 'Rejected':
            await _postMessage(
                message.userId,
                `Ops! Your travel request <${message.instanceUrl}/${message.id}|${message.name}> has been rejected.`
            );
            break;
        default:
            break;
    }
    // Send success message
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('Message posted successfully');
};

const _postMessage = async (userId, message) => {
    const msg = Message({ channel: userId, text: message });
    await persistedClient.client.chat.postMessage(msg.buildToObject());
};

const _convertMessageToTravelRequestObject = (message) => {
    return {
        Id: message.id,
        Name: message.name,
        Description__c: message.description,
        Origin__c: message.origin,
        Destination__c: message.destination,
        Start_Date__c: message.startDate,
        End_Date__c: message.endDate,
        Cost__c: message.cost,
        Status__c: message.status,
        Owner: {
            Name: message.ownerName
        }
    };
};

const _postNewTravelRequestToReviewMessage = async (
    userId,
    request,
    instanceUrl
) => {
    const msg = Message({
        channel: userId,
        text: 'You have new travel requests to review. Check the app home tab.'
    });
    appendPendingTravelRequestBlock(msg, request, instanceUrl, true);
    await persistedClient.client.chat.postMessage(msg.buildToObject());
};

const salesforceMessageCallback = {
    path: '/salesforce/message',
    method: ['POST'],
    handler: salesforceMessageHandler
};

module.exports = { salesforceMessageCallback };
