# Ready to Fly

[![CI Workflow](https://github.com/trailheadapps/ready-to-fly/workflows/CI/badge.svg)](https://github.com/trailheadapps/ready-to-fly/actions?query=workflow%3ACI) [![codecov](https://codecov.io/gh/trailheadapps/ready-to-fly/branch/main/graph/badge.svg)](https://codecov.io/gh/trailheadapps/ready-to-fly)

<img src="/airplaneLogo.png" width=30% height=30%>

Sample app to showcase Slack + Salesforce integrations.

This app has been created using the [Salesforce Slack Starter Kit](https://github.com/developerforce/salesforce-slack-starter-kit). For a detailed explanation of the app architecture and the scaffolding script, take a look at Salesforce Slack Starter Kit's README.

## Prerequisites

To be able to run this project you will need:

-   `git` (download [here](https://git-scm.com/downloads))
-   `node` >= 14 (download [here](https://nodejs.org/en/download/))
-   Salesforce Dev Hub
    -   If you don't have one, [sign up](https://developer.salesforce.com/signup) for a Developer Edition org and then follow the [instructions](https://help.salesforce.com/articleView?id=sfdx_setup_enable_devhub.htm&type=5) to enable Dev Hub.
-   `sfdx` CLI >= sfdx-cli/7.129.0 (download [here](https://developer.salesforce.com/tools/sfdxcli))
-   Heroku account ([signup](https://signup.heroku.com))
-   `heroku` CLI (download [here](https://devcenter.heroku.com/articles/heroku-cli))
-   Slack Workspace
    -   If you don't have one, [create one](https://slack.com/get-started#/createnew).

## Setup Steps

### Configuring Slack App

1. Open [https://api.slack.com/apps/new](https://api.slack.com/apps/new) and choose "From an app manifest"
1. Choose the workspace you want to install the application to
1. Copy the contents of [manifest.yml](./apps/ready-to-fly/manifest.YAML) into the text box that says `*Paste your manifest code here*` and click _Next_
1. Review the configuration and click _Create_
1. In _Basic Information_ scroll down to the _Display Information_ section. Upload a picture for the app. You can use [this logo](./airplaneLogo.png)
1. Now click _Install App_ on the left menu. Then click the _Install to Workspace_ button and then click on _Allow_

### Running the Scaffolding Script

The [`scripts/deploy.js`](./scripts/deploy.js) script scaffolds all the entities needed for the sample app to work. To run the scaffolding script follow these instructions:

```console
$ sfdx auth:web:login -d -a DevHub  # Authenticate using your Dev Hub org credentials (only needed if using JWT bearer flow)
$ heroku login  # Login with your Heroku account (or create one)
$ git clone https://github.com/trailheadapps/ready-to-fly
$ cd ready-to-fly/scripts
$ npm install
$ cd ..
$ node scripts/deploy.js
```

1. During the set up process, the script will prompt you to enter value for `SLACK_BOT_TOKEN`. To enter this value open your apps configuration page from [this list](https://api.slack.com/apps), click _OAuth & Permissions_ in the left hand menu, then copy the value in _Bot User OAuth Token_ and paste into terminal.

1. The script will prompt you for slack signing secret `SLACK_SIGNING_SECRET`. To enter this value open your apps configuration page from [this list](https://api.slack.com/apps), click _Basic Information_ and scroll to the section _App Credentials_ and click show button and copy the _Signing Secret_ and paste into terminal.

Note: as ready to fly performs calls from Salesforce to Slack, we've modified the Salesforce Slack Starter Kit script to also deploy a remote site setting and a custom metadata type record that are used for callouts. We've also included the setup of some sample data.

### Setting Heroku Instance in your Slack App

This is the last step, you will need to enter the current Heroku Instance url in Slack App.

-   To enter this value open your apps configuration page from [this list](https://api.slack.com/apps), click _App Manifest_. Find the `request_url` fields (there will be two to update) in the manifest and modify it to replace `heroku-app` with your actual heroku domain name. Note at the end of this step your url should look like `https://<heroku-domain>.herokuapp.com/slack/events`.
-   Once done that, you'll be prompted to verify the events endpoint. Click on 'verify'. You're ready to navigate to the app home!

## How to Build and Deploy Code

-   For Salesforce metadata synchronization use `sfdx force:source:pull` to retrieve and `sfdx force:source:push` to deploy metadata from orgs to local project folder `force-app`

-   For the Bolt Node.js app use the steps below:
    -   cd into apps/ready-to-fly folder `cd apps/ready-to-fly`
    -   add git remote to app repo using `heroku git:remote -a <heroku app name>`
    -   run `git push heroku main` to push code to Heroku

## Local Development

1. To use ngrok, first install it downloading the executable or with npm:

```console
$ npm install ngrok -g
```

1. Next you’ll have to [sign up](https://dashboard.ngrok.com/get-started/setup).
1. Once logged in, navigate to “Setup & Installation“ and copy your auth token.
1. Then set your auth token in your local machine:

```console
$ ngrok authtoken my_auth_token
```

1. Run the ngrok tunnel as follows:

```console
$ ngrok http 3000
```

1. Copy the ngrok tunnel URL to the following places:

-   Your manifest file request URLs
-   The HEROKU_URL environment variable in your .env file
-   The Callback URL for the connected app that’s used for authorization in Salesforce - simply add the ngrok URL in a new line
-   Add a new remote site setting that contains the ngrok URL, as it’s the one that we’ll use to callout from Salesforce to Slack
-   Modify the BoltAppConfigHeroku custom metadata type record URL\_\_c, as it’s used in the Apex logic to make the callout

1. Now you are prepared to run the app locally! In another terminal different from the one in which you’re running ngrok, execute `node app.js` from the project folder. You can then make changes to the code and restart the app as many times as you want.

### Note about Managers

The Managers dropdown that appears when you create a travel request is populated with information pulled from Salesforce. Concretelly, we take a look at the standard Nanager field on the User object, and pull two levels of Managers. You can change that behaviour to adapt it to your needs.
