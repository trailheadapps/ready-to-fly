const Haikunator = require('haikunator');
const haikunator = new Haikunator();
const sh = require('shelljs');

const validateAppName = (str) => {
    if (!str) return 'Please provide a non-empty app name.';
    if (str.length < 3 || str.length > 30)
        return 'App name must be between 3 and 30 characters long.';
    if (!str.match(/^[a-z]+[a-z0-9\-]+$/))
        return 'App name must begin with a lowercase letter and contain only lowercase letters, numbers, and dashes.';

    return true;
};

const generateUniqueAppName = (input) => {
    let name =
        `${input.options.name}` +
        `-` +
        `${haikunator.haikunate({ tokenLength: 2 })}`;

    if (name.length >= 30) name = generateUniqueAppName(input);

    return name;
};

const getDefaultDevHub = () => {
    const orgs = JSON.parse(
        sh.exec('sf config get target-dev-hub --json', {
            silent: true
        })
    );
    if (orgs.result.length === 0) {
        throw new Error(
            'No default DevHub org configured. Please use "sf org login web --set-default-dev-hub" and authorize a Salesforce Developer org with DevHub Enabled'
        );
    }
    return orgs.result[0].value;
};

const getDefaultOrg = () => {
    const orgs = JSON.parse(
        sh.exec('sf config get target-org --json', {
            silent: true
        })
    );
    if (orgs.result.length === 0) {
        throw new Error(
            'No default Org configured. Please use "sf org login web --set-default" and authorize a Salesforce Developer org'
        );
    }
    return orgs.result[0].value;
};

const getRandomNumber = (length) => {
    return Math.floor(
        Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
    );
};

const getRandomString = (length) => {
    let result = '';
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
};

const assignPermissionset = async () => {
    // Assign permission set to user
    const assignPermissionset = JSON.parse(
        sh.exec(
            `sf org assign permset -n Salesforce_Slack_App_Admin,Ready_to_Fly -o ${sh.env.SF_USERNAME} --json`,
            { silent: true }
        )
    );

    if (!assignPermissionset.result.successes) {
        console.error(
            'Permission set assignment failed - try again later: ' +
                JSON.stringify(assignPermissionset)
        );
    }
};

const loadSampleData = async () => {
    // Load sample data
    const loadSampleData = JSON.parse(
        sh.exec(
            `sf apex run --file data/setup.apex -o ${sh.env.SF_USERNAME} --json`,
            { silent: true }
        )
    );

    if (!loadSampleData.result.success) {
        console.error(
            'Sample data load failed - try again later: ' +
                JSON.stringify(loadSampleData)
        );
    }
};

module.exports = {
    assignPermissionset,
    generateUniqueAppName,
    getDefaultDevHub,
    getDefaultOrg,
    getRandomNumber,
    getRandomString,
    loadSampleData,
    validateAppName
};
