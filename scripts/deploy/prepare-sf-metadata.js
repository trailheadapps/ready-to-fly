const forge = require('node-forge');
const sh = require('shelljs');
const fse = require('fs-extra');
const log = console.log;
const { getRandomString } = require('./util');
const { getRandomNumber } = require('./util');
const { getSelfSignedCertificate } = require('./generate-self-signed-cert');

const templateDir = 'scripts/templates';
const sfProjectFolder = 'force-app/main/default';

const prepareSfMetadata = async (pubkey) => {
    log('*** Preparing Salesforce metadata');

    sh.env.HMAC_KEY = getRandomString(32);

    fse.copySync(templateDir, sfProjectFolder, { overwrite: true });
    sh.sed(
        '-i',
        /{CONSUMERKEY}/,
        sh.env.CONSUMERKEY,
        `${sfProjectFolder}/applications/slackApp.connectedApp-meta.xml`
    );
    sh.sed(
        '-i',
        /{CERTIFICATE}/,
        pubkey,
        `${sfProjectFolder}/applications/slackApp.connectedApp-meta.xml`
    );
    sh.sed(
        '-i',
        /{USEREMAIL}/,
        sh.env.SF_USERNAME,
        `${sfProjectFolder}/applications/slackApp.connectedApp-meta.xml`
    );
    sh.sed(
        '-i',
        /{HEROKUINSTANCE}/,
        sh.env.HEROKU_APP_NAME,
        `${sfProjectFolder}/applications/slackApp.connectedApp-meta.xml`
    );
    sh.sed(
        '-i',
        /{HMACKEY}/,
        sh.env.HMAC_KEY,
        `${sfProjectFolder}/customMetadata/Bolt_App_Config.BoltAppConfigHeroku.md-meta.xml`
    );
    sh.sed(
        '-i',
        /{HEROKUINSTANCE}/,
        sh.env.HEROKU_APP_NAME,
        `${sfProjectFolder}/namedCredentials/boltApp.namedCredential-meta.xml`
    );
    sh.sed(
        '-i',
        /{SECRET}/,
        sh.env.SF_CLIENT_SECRET,
        `${sfProjectFolder}/applications/slackApp.connectedApp-meta.xml`
    );
};

// Creates public and Private keys for JWT token flow
const createCertificate = async () => {
    log('*** Generating Certificates for Connected App');
    const resultcert = { pubkey: '', privatekey: '' };
    const pki = forge.pki;
    const keys = pki.rsa.generateKeyPair(2048);
    const privKey = forge.pki.privateKeyToPem(keys.privateKey);

    const randomkey = getRandomNumber(20) + sh.env.ORGID;
    const clientSecretRandom =
        Math.floor(
            Math.pow(10, 20) +
                Math.random() * (Math.pow(10, 20) - Math.pow(10, 20 - 1) - 1)
        ) + sh.env.ORGID;
    // Create buffer object, specifying utf8 as encoding
    let bufferObj = Buffer.from(randomkey, 'utf8');
    // Encode the Buffer as a base64 string
    sh.env.CONSUMERKEY = bufferObj.toString('base64');
    sh.env.SF_CLIENT_SECRET = clientSecretRandom;

    const cert = getSelfSignedCertificate(pki, keys);
    const pubKey = pki.certificateToPem(cert);
    resultcert.privatekey = privKey;
    resultcert.pubkey = pubKey;
    sh.env.PRIVATE_KEY = privKey;
    return resultcert;
};

module.exports = { prepareSfMetadata, createCertificate };
