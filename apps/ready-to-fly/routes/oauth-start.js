'use strict';

// Defining this route as a ExpressReceiver route as we need a param passed in
const startOAuthProcess = async (req, res) => {
    try {
        // Store slackUserId in session
        req.session.slackUserId = req.params.slackUserId;

        // Send success message
        console.log('redirecting to: ' + _buildOAuthURL());
        res.redirect(307, _buildOAuthURL()); // Using 307 response code to prevent browser from caching the redirection
        res.end('OAuth flow correctly started');
    } catch (e) {
        console.error(e);
        res.writeHead(500);
        res.end('Failed to start OAuth flow', 'utf-8');
    }
};

// Returns OAuth URL to start Web based OAuth 2.0 flow
const _buildOAuthURL = () => {
    let auth_url = `${process.env.SF_LOGIN_URL}/services/oauth2/authorize`;
    auth_url += `?client_id=${process.env.SF_CLIENT_ID}`;
    auth_url += `&redirect_uri=${process.env.HEROKU_URL}/oauthcallback`;
    auth_url += '&response_type=code';
    return auth_url;
};

const oauthStart = {
    path: '/oauthstart/:slackUserId',
    method: ['GET'],
    handler: startOAuthProcess
};

module.exports = { oauthStart };
