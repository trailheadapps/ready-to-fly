const sh = require('shelljs');
const chalk = require('chalk');
const log = console.log;

/*
 * Create a scratch org and save user login details
 */

const createScratchOrg = () => {
    log('');
    log(
        `${chalk.bold('*** Setting up Salesforce App')} ${chalk.dim(
            '(step 1 of 2)'
        )}`
    );
    log('*** Creating scratch org');
    const scratchOrgResult = JSON.parse(
        sh.exec(
            `sfdx force:org:create -s -f config/project-scratch-def.json -a ${sh.env.SF_SCRATCH_ORG} -d 30 -v ${sh.env.SF_DEV_HUB} --json`,
            { silent: true }
        )
    );
    // Check error creating scratch org
    if (!scratchOrgResult.result || !scratchOrgResult.result.orgId) {
        throw new Error(
            'Scratch org creation failed ' + JSON.stringify(scratchOrgResult)
        );
    }
    const userData = JSON.parse(
        sh.exec('sfdx force:org:display --json', { silent: true })
    );
    sh.env.SF_USERNAME = userData.result.username;
    sh.env.ORGID = userData.result.id;
};

// Push source to scratch org, apply permset, and load sample data
const setupScratchOrg = () => {
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
    const assignPermissionset = JSON.parse(
        sh.exec(
            `sfdx force:user:permset:assign --permsetname Salesforce_Slack_App_Admin,Ready_to_Fly -u ${sh.env.SF_USERNAME} --json`,
            { silent: true }
        )
    );

    if (!assignPermissionset.result.successes) {
        console.error(
            'Permission set assignment failed - try again later: ' +
                JSON.stringify(assignPermissionset)
        );
    }

    // Load sample data
    const loadSampleData = JSON.parse(
        sh.exec(
            `sfdx force:apex:execute --apexcodefile data/setup.apex -u ${sh.env.SF_USERNAME} --json`,
            { silent: true }
        )
    );

    if (!loadSampleData.result.success) {
        console.error(
            'Sample data load failed - try again later: ' +
                JSON.stringify(loadSampleData)
        );
    }

    log(chalk.green('*** ✔ Done with the Salesforce scratch org setup'));
};

module.exports = { createScratchOrg, setupScratchOrg };
