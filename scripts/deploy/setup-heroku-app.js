'use strict';
const sh = require('shelljs');
const chalk = require('chalk');
const fs = require('fs');
const log = console.log;
const { getRandomString } = require('./util');

const setupHerokuApp = () => {
    log('');
    log(
        `${chalk.bold('*** Setting up Heroku app')} ${chalk.dim(
            '(step 2 of 2)'
        )}`
    );
    // Check user is correctly logged into Heroku
    const whoAmI = sh.exec('heroku whoami', { silent: true });
    if (whoAmI.stderr) {
        throw new Error(
            'Not logged into Heroku. Run heroku login to authenticate yourself.'
        );
    }
    // Check app name is not already used
    const appNameCheck = sh.exec(`heroku apps:info ${sh.env.HEROKU_APP_NAME}`, {
        silent: true
    });
    if (appNameCheck.stdout.includes(sh.env.HEROKU_APP_NAME)) {
        throw new Error(`App name already in use: ${sh.env.HEROKU_APP_NAME}`);
    }

    const appBase = 'apps/ready-to-fly';
    sh.cd(appBase);

    log(`*** Creating Heroku app ${chalk.bold(sh.env.HEROKU_APP_NAME)}`);
    const appData = JSON.parse(
        sh.exec(
            `heroku apps:create ${sh.env.HEROKU_APP_NAME} --json --buildpack https://github.com/lstoll/heroku-buildpack-monorepo.git`,
            { silent: true }
        )
    );
    sh.env.HEROKU_APP_NAME = appData.name;
    sh.env.HEROKU_URL = appData.web_url;
    sh.env.AES_KEY = getRandomString(32);

    log('*** Adding Node.js Buildpack');
    sh.exec(
        `heroku buildpacks:add -a ${sh.env.HEROKU_APP_NAME} heroku/nodejs`,
        {
            silent: true
        }
    );

    log('*** Writing .env file for local development');
    fs.writeFileSync(`../../${appBase}/.env`, ''); // empty the .env file for fresh write
    const stream = fs.createWriteStream(`../../${appBase}/.env`, {
        flags: 'a'
    });
    // env variables for Slack Auth
    stream.write(
        'SLACK_SIGNING_SECRET=' + sh.env.SLACK_SIGNING_SECRET + '\r\n'
    );
    stream.write('SLACK_BOT_TOKEN=' + sh.env.SLACK_BOT_TOKEN + '\r\n');
    // env variables for Salesforce Auth
    stream.write('SF_USERNAME=' + sh.env.SF_USERNAME + '\r\n');
    stream.write('SF_LOGIN_URL=' + sh.env.SF_LOGIN_URL + '\r\n');
    stream.write('HEROKU_URL=' + sh.env.HEROKU_URL + '\r\n');
    stream.write('SF_CLIENT_ID=' + sh.env.CONSUMERKEY + '\r\n');
    stream.write('SF_CLIENT_SECRET=' + sh.env.SF_CLIENT_SECRET + '\r\n');
    stream.write('AES_KEY=' + sh.env.AES_KEY + '\r\n');
    stream.write('HMAC_KEY=' + sh.env.HMAC_KEY + '\r\n');
    stream.write(
        'PRIVATE_KEY=' +
            '"' +
            sh.env.PRIVATE_KEY.replace(/(\r\n|\r|\n)/g, '\\n') +
            '"'
    );
    stream.close();

    log('*** Pushing app to Heroku');
    log('*** Setting remote configuration parameters');
    sh.exec(
        `heroku config:set PRIVATE_KEY="${sh.env.PRIVATE_KEY}" -a ${sh.env.HEROKU_APP_NAME}`,
        { silent: true }
    );
    // Needed by buildpack
    sh.exec(
        `heroku config:set APP_BASE=${appBase} -a ${sh.env.HEROKU_APP_NAME}`
    );
    sh.exec(
        `heroku config:set SF_USERNAME=${sh.env.SF_USERNAME} -a ${sh.env.HEROKU_APP_NAME}`
    );
    sh.exec(
        `heroku config:set SF_LOGIN_URL=${sh.env.SF_LOGIN_URL} -a ${sh.env.HEROKU_APP_NAME}`
    );
    sh.exec(
        `heroku config:set SLACK_BOT_TOKEN=${sh.env.SLACK_BOT_TOKEN} -a ${sh.env.HEROKU_APP_NAME}`,
        { silent: true }
    );
    sh.exec(
        `heroku config:set SLACK_SIGNING_SECRET=${sh.env.SLACK_SIGNING_SECRET} -a ${sh.env.HEROKU_APP_NAME}`,
        { silent: true }
    );
    sh.exec(
        `heroku config:set SF_CLIENT_ID=${sh.env.CONSUMERKEY} -a ${sh.env.HEROKU_APP_NAME}`,
        { silent: true }
    );
    sh.exec(
        `heroku config:set SF_CLIENT_SECRET=${sh.env.SF_CLIENT_SECRET} -a ${sh.env.HEROKU_APP_NAME}`,
        { silent: true }
    );
    sh.exec(
        `heroku config:set HEROKU_URL=${sh.env.HEROKU_URL} -a ${sh.env.HEROKU_APP_NAME}`,
        { silent: true }
    );
    sh.exec(
        `heroku config:set AES_KEY=${sh.env.AES_KEY} -a ${sh.env.HEROKU_APP_NAME}`,
        { silent: true }
    );
    sh.exec(
        `heroku config:set HMAC_KEY=${sh.env.HMAC_KEY} -a ${sh.env.HEROKU_APP_NAME}`,
        { silent: true }
    );
    sh.cd('../../');
    sh.exec(
        `git push git@heroku.com:${sh.env.HEROKU_APP_NAME}.git ${sh.env.CURRENT_BRANCH}:main`
    );

    log(
        chalk.green(
            `*** ✔ Done deploying Heroku app ${chalk.bold(
                sh.env.HEROKU_APP_NAME
            )}`
        )
    );
};

module.exports = { setupHerokuApp };
