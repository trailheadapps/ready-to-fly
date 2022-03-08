const sh = require('shelljs');
const chalk = require('chalk');
const log = console.log;

const { assignPermissionset, loadSampleData } = require('./util');

// Push source to scratch org, apply permset, and load sample data
const setupDefaultNonScratchOrg = async () => {
    log('*** Deploying Salesforce metadata');
    const deployResult = JSON.parse(
        sh.exec(
            `sfdx force:source:push -u ${sh.env.SF_USERNAME} -w 10 --json`,
            { silent: true }
        )
    );

    if (!deployResult.result || deployResult.result.error) {
        throw new Error(
            'Source deployment failed ' + JSON.stringify(deployResult)
        );
    }

    // Assign permission set to user
    await assignPermissionset();
    // Load sample data
    await loadSampleData();

    log(chalk.green('*** ✔ Done with the Salesforce scratch org setup'));
};

module.exports = { setupDefaultNonScratchOrg };
