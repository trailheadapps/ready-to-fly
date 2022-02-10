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
        sh.exec('sfdx force:org:list --skipconnectionstatus --json', {
            silent: true
        })
    );

    if (orgs.result.nonScratchOrgs.length === 0) {
        throw new Error('No DevHub available on your system.');
    }

    for (const org of orgs.result.nonScratchOrgs) {
        if (org.isDevHub && org.isDefaultDevHubUsername) {
            return org.alias;
        }
    }

    return 'DevHub';
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

module.exports = {
    generateUniqueAppName,
    getDefaultDevHub,
    validateAppName,
    getRandomNumber,
    getRandomString
};
