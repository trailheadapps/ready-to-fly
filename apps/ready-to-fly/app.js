const express = require('express');
const session = require('express-session');
const { App, ExpressReceiver, LogLevel } = require('@slack/bolt');
const config = require('./config/config');
const { registerListeners } = require('./listeners');
const { registerCustomRoutes } = require('./routes');
const persistedClient = require('./store/bolt-web-client');
const { authWithSalesforce } = require('./middleware/salesforce-auth');

let logLevel;
switch (process.env.LOG_LEVEL) {
    case 'debug':
        logLevel = LogLevel.DEBUG;
        break;
    case 'info':
        logLevel = LogLevel.INFO;
        break;
    case 'warn':
        logLevel = LogLevel.WARN;
        break;
    case 'error':
        logLevel = LogLevel.ERROR;
        break;
    default:
        logLevel = LogLevel.INFO;
}

// Create custom express app to be able to use express-session middleware
const app = express();
app.use(
    session({
        secret: config.hmacKey,
        resave: true,
        saveUninitialized: true
    })
);

// Use custom ExpressReceiver to be able to use express-session middleware
const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    app
});

// Initializes your app with your bot token and signing secret
const boltApp = new App({
    ...config.slack,
    logLevel,
    receiver
});

// Defining ExpressReceiver custom routes
receiver.router.use(express.json());
registerCustomRoutes().forEach((route) => {
    const method = route.method[0].toLowerCase();
    receiver.router[method](route.path, route.handler);
});

// Register Listeners
registerListeners(boltApp);

// Assign Slack WebClient
persistedClient.client = boltApp.client;

// Use global middleware to fetch Salesforce Authentication details
boltApp.use(authWithSalesforce);

// Asynchronous function to start the app
(async () => {
    try {
        // Start your app
        await boltApp.start(process.env.PORT || 3000);
        console.log(
            `⚡️ Bolt app is running on port ${process.env.PORT || 3000}!`
        );
    } catch (error) {
        console.error('Unable to start App', error);
        process.exit(1);
    }
})();
