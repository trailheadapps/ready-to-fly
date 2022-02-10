'use strict';

// Singleton Class to persist the Slack WebClient Object
class SlackWebClient {
    constructor() {
        this.client = {};
    }
}

module.exports = new SlackWebClient();
