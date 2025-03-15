# Makkaizou-LINE Integration: Deployment Guide

This guide provides step-by-step instructions for deploying the Makkaizou-LINE integration using Google Apps Script and Google Sheets.

## Prerequisites

- A Google account with access to Google Sheets and Google Apps Script
- A LINE Developer account with a Messaging API channel
- Access to the Makkaizou API

## Step 1: Create a Google Sheets Document

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Rename the spreadsheet to "Makkaizou-LINE Integration"
3. The script will automatically create the necessary sheets when run

## Step 2: Set Up Google Apps Script

1. Open the Google Sheets document
2. Go to Extensions > Apps Script
3. Rename the project to "Makkaizou-LINE Integration"
4. Delete any existing code in the default `Code.gs` file
5. Create the following script files:

### Code.js

Copy the contents of `Code.js` from the project repository into this file.

### TalkIdManager.js

Create a new script file named `TalkIdManager.js` and copy the contents from the project repository.

### LineApi.js

Create a new script file named `LineApi.js` and copy the contents from the project repository.

## Step 3: Run the Setup Function

1. In the Apps Script editor, select the `testSetup` function from the dropdown menu
2. Click the Run button (▶️)
3. Grant the necessary permissions when prompted
4. Verify that the sheets are created with the correct headers

## Step 4: Configure the Integration

1. Go back to the Google Sheets document
2. Navigate to the "Configuration" sheet
3. Add the following configuration values:

| Key | Value | Description |
|-----|-------|-------------|
| line_channel_secret | [Your LINE Channel Secret] | From LINE Developer Console |
| line_access_token | [Your LINE Channel Access Token] | From LINE Developer Console |
| makkaizou_api_key | [Your Makkaizou API Key] | The external_integration_key |
| makkaizou_api_url | [Makkaizou API URL] | The Makkaizou API endpoint |
| learning_model_code | [Learning Model Code] | From Makkaizou dashboard |
| enable_loading_indicator | true | Whether to show loading indicators |
| bot_name | [Your LINE Bot Name] | The name of your LINE bot |
| debug_mode | true | Enable debug logging (set to false in production) |

## Step 5: Deploy as Web App

1. In the Apps Script editor, click on Deploy > New deployment
2. Select "Web app" as the deployment type
3. Enter a description, e.g., "Makkaizou-LINE Integration v1.0"
4. Set "Execute as" to "Me"
5. Set "Who has access" to "Anyone"
6. Click "Deploy"
7. Copy the web app URL that is displayed

## Step 6: Configure LINE Webhook

1. Go to the [LINE Developers Console](https://developers.line.biz/console/)
2. Select your provider and channel
3. Go to the "Messaging API" tab
4. Scroll down to "Webhook settings"
5. Paste the web app URL from Step 5 into the "Webhook URL" field
6. Click "Update"
7. Click "Verify" to ensure the webhook is working
8. Enable "Use webhook" option

## Step 7: Test the Integration

1. Add your LINE bot to a group chat
2. Send a message mentioning the bot (e.g., "@YourBotName hello")
3. Check the "Logs" sheet in Google Sheets to verify that the message was received
4. In Phase 2, the bot will respond to the message

## Troubleshooting

### Webhook Verification Fails

- Ensure the web app URL is correct
- Check that the script has been deployed as a web app
- Verify that the `doPost` function is correctly implemented
- Check the Apps Script logs for any errors

### Bot Doesn't Respond to Mentions

- Verify that the bot name in the Configuration sheet matches the actual bot name
- Check the "Logs" sheet for any error messages
- Ensure the LINE channel access token is correct
- Make sure the bot has been added to the group

### Error Logs

Check the "ErrorLogs" sheet for detailed error information, including:
- Timestamp of the error
- Error type
- Error message
- Context data
- Stack trace (if available)

## Next Steps

After completing Phase 1 setup, proceed to Phase 2 implementation:
- Implement mention detection using the LINE API's mention property
- Connect to the Makkaizou API to process messages
- Implement response formatting
- Test the full message flow