'use strict';

const { HomeTab, Blocks, Elements, Md } = require('slack-block-builder');

const myTravelRequestsScreen = (travelRequests, username, instanceUrl) => {
    const homeTab = HomeTab();
    _addButtonsToHomeTab(homeTab);
    homeTab.blocks(
        Blocks.Header({
            text: `Recent Travel Requests from ${username}`
        }),
        Blocks.Divider()
    );

    if (travelRequests.totalSize === 0) {
        homeTab.blocks(
            Blocks.Section({
                text: 'No existing travel requests.'
            })
        );
    }

    travelRequests.records.forEach((request, requestIndex) => {
        if (requestIndex > 0) {
            homeTab.blocks(Blocks.Divider());
        }
        let requestText = `${Md.emoji('airplane')} ${Md.bold(request.Name)}: ${
            request.Description__c
        }\n`;
        requestText += `${Md.bold('From-To:')} ${request.Origin__c} - ${
            request.Destination__c
        }\n`;
        const startDate = new Date(request.Start_Date__c).toLocaleDateString(
            'en-US'
        );
        const endDate = new Date(request.End_Date__c).toLocaleDateString(
            'en-US'
        );
        requestText += `${Md.bold('Dates:')} ${startDate} - ${endDate}\n`;
        requestText += `${Md.bold('Cost:')} $${request.Cost__c}\n`;
        requestText += `${Md.bold('Status:')} ${request.Status__c} ${Md.emoji(
            getEmoji(request.Status__c)
        )}\n`;
        requestText += `${Md.bold('Approver:')} ${request.Approver__r.Name}`;
        homeTab.blocks(
            Blocks.Section({
                text: requestText
            }).accessory(
                Elements.Button({
                    actionId: 'view-request',
                    text: 'View Details',
                    url: `${instanceUrl}/${request.Id}`
                })
            )
        );
    });

    const createNewRequestButton = Elements.Button({
        actionId: 'create-travel-request',
        text: 'Create New Travel Request'
    });
    homeTab.blocks(Blocks.Divider());
    homeTab.blocks(Blocks.Actions().elements(createNewRequestButton));

    return homeTab.buildToJSON();
};

const travelRequestsReviewScreen = (pendingTravelRequests, instanceUrl) => {
    const homeTab = HomeTab();
    _addButtonsToHomeTab(homeTab);
    homeTab.blocks(
        Blocks.Header({
            text: `Travel Requests to Review`
        }),
        Blocks.Divider()
    );

    if (pendingTravelRequests.totalSize === 0) {
        homeTab.blocks(
            Blocks.Section({
                text: "You're all done!"
            })
        );
    }

    pendingTravelRequests.records.forEach((request, requestIndex) => {
        if (requestIndex > 0) {
            homeTab.blocks(Blocks.Divider());
        }
        appendPendingTravelRequestBlock(homeTab, request, instanceUrl);
    });

    return homeTab.buildToJSON();
};

const appendPendingTravelRequestBlock = (
    parentElement,
    request,
    instanceUrl,
    addTitle
) => {
    let requestText = '';
    if (addTitle) {
        requestText += 'You have a new Travel Request to review:\n\n';
    }
    requestText += `${Md.emoji('airplane')} ${Md.bold(request.Name)}: ${
        request.Description__c
    }\n`;
    requestText += `${Md.bold('From-To:')} ${request.Origin__c} - ${
        request.Destination__c
    }\n`;
    const startDate = new Date(request.Start_Date__c).toLocaleDateString(
        'en-US'
    );
    const endDate = new Date(request.End_Date__c).toLocaleDateString('en-US');
    requestText += `${Md.bold('Dates:')} ${startDate} - ${endDate}\n`;
    requestText += `${Md.bold('Cost:')} $${request.Cost__c}\n`;
    requestText += `${Md.bold('Status:')} ${request.Status__c} ${Md.emoji(
        getEmoji(request.Status__c)
    )}\n`;
    requestText += `${Md.bold('Owner:')} ${request.Owner.Name}`;
    parentElement.blocks(
        Blocks.Section({
            text: requestText
        })
    );
    parentElement.blocks(
        Blocks.Actions().elements(
            Elements.Button({
                actionId: 'view-request',
                text: 'View Details',
                url: `${instanceUrl}/${request.Id}`
            }),
            Elements.Button({
                actionId: 'reject-request',
                text: 'Reject',
                value: request.Id
            }).danger(),
            Elements.Button({
                actionId: 'approve-request',
                text: 'Approve',
                value: request.Id
            }).primary()
        )
    );
};

const _addButtonsToHomeTab = (homeTab) => {
    const firstButton = Elements.Button({
        actionId: 'view-my-travel-requests',
        text: 'My Travel Requests'
    });
    const secondButton = Elements.Button({
        actionId: 'view-travel-requests-to-review',
        text: 'Travel Requests To Review'
    });

    homeTab.blocks(Blocks.Actions().elements(firstButton, secondButton));
    return homeTab;
};

const getEmoji = (status) => {
    switch (status) {
        case 'Approved':
            return 'white_check_mark';
        case 'Rejected':
            return 'x';
        default:
            return 'grey_question';
    }
};

module.exports = {
    myTravelRequestsScreen,
    travelRequestsReviewScreen,
    appendPendingTravelRequestBlock
};
