const sh = require('shelljs');
const chalk = require('chalk');
const log = console.log;

const { assignPermissionset, loadSampleData } = require('./util');

// Push source to scratch org, apply permset, and load sample data
const setupDefaultNonScratchOrg = async () => {
    log('');
    log(
        `${chalk.bold('*** Setting up Salesforce App')} ${chalk.dim(
            '(step 1 of 2)'
        )}`
    );
    const userData = JSON.parse(
        sh.exec('sfdx force:org:display --json', { silent: true })
    );
    sh.env.SF_USERNAME = userData.result.username;
    sh.env.ORGID = userData.result.id;
    log('*** Deploying Salesforce metadata');
    const deployResult = JSON.parse(
        sh.exec(
            `sfdx force:source:deploy -u ${sh.env.SF_USERNAME} -p force-app/main/default -w 10 --json`,
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
