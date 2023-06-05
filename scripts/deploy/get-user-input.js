const { prompt, Select } = require('enquirer');
const sh = require('shelljs');
const {
    validateAppName,
    getDefaultDevHub,
    getDefaultOrg,
    generateUniqueAppName
} = require('./util');

const userInputPrompt = async () => {
    const selectSfOrgType = new Select({
        name: 'sfOrg',
        message: 'Select Salesforce Development Environment',
        choices: ['Non-Scratch Org', 'Scratch Org']
    });
    const selectedSfOrgType = await selectSfOrgType.run();
    sh.env.SALESFORCE_ENV_TYPE = selectedSfOrgType;
    const basicInfo = await promptBasicInfo(selectedSfOrgType);
    return basicInfo;
};

const promptBasicInfo = async (selectedSfOrgType) => {
    let sfdxInputs = [];
    if (selectedSfOrgType == 'Scratch Org') {
        sfdxInputs = [
            {
                type: 'input',
                name: 'devhub',
                message: 'Existing DevHub Org CLI Alias',
                initial: getDefaultDevHub
            },
            {
                type: 'input',
                name: 'scratchorg',
                message: 'Scratch Org CLI Alias',
                initial: 'scratchorg'
            }
        ];
    } else {
        sfdxInputs = [
            {
                type: 'input',
                name: 'defaultusername',
                message: 'Existing Default Org CLI Alias',
                initial: getDefaultOrg
            }
        ];
    }
    return (response = await prompt([
        {
            type: 'input',
            name: 'heroku-app',
            message: 'Heroku App Name',
            initial: generateUniqueAppName,
            validate: validateAppName
        },
        {
            type: 'password',
            name: 'slack-bot-token',
            message: 'Slack Bot Token'
        },
        {
            type: 'password',
            name: 'slack-signing-secret',
            message: 'Slack Signing Secret'
        },
        ...sfdxInputs
    ]));
};

module.exports = {
    userInputPrompt
};
