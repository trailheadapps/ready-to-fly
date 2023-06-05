const sh = require('shelljs');
const chalk = require('chalk');
const log = console.log;

const { assignPermissionset, loadSampleData } = require('./util');

const setupNonScratchOrgUserContext = async () => {
    log('');
    log(
        `${chalk.bold('*** Setting up Salesforce App')} ${chalk.dim(
            '(step 1 of 2)'
        )}`
    );
    const userData = JSON.parse(
        sh.exec('sf org display --json', { silent: true })
    );
    sh.env.SF_USERNAME = userData.result.username;
    sh.env.ORGID = userData.result.id;
    // Check if the currently authorized org is Sandbox or Production
    const organization = JSON.parse(
        sh.exec(
            'sf data query -q "SELECT IsSandbox FROM Organization LIMIT 1" --json',
            { silent: true }
        )
    );
    if (organization.result.records.length > 0) {
        if (organization.result.records[0].IsSandbox) {
            sh.env.SF_LOGIN_URL = 'https://test.salesforce.com';
        } else {
            sh.env.SF_LOGIN_URL = 'https://login.salesforce.com';
        }
    } else {
        sh.env.SF_LOGIN_URL = 'https://test.salesforce.com';
    }
};

// Deploy source to non-scratch org, apply permset, and load sample data
const setupDefaultNonScratchOrg = async () => {
    log('*** Deploying Salesforce metadata');
    const deployResult = JSON.parse(
        sh.exec(
            `sf project deploy start -d force-app/main/default -o ${sh.env.SF_USERNAME} -w 10 --json`,
            { silent: true }
        )
    );

    if (!deployResult.result || deployResult.result.status === 'Failed') {
        throw new Error(
            'Source deployment failed ' + JSON.stringify(deployResult)
        );
    }
    // Assign permission set to user
    await assignPermissionset();
    // Load sample data
    await loadSampleData();

    log(chalk.green('*** ✔ Done with the Salesforce org setup'));
};

module.exports = { setupDefaultNonScratchOrg, setupNonScratchOrgUserContext };
