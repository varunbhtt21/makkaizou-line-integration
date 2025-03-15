# Makkaizou-LINE Integration: Phase 2 Configuration Guide

This guide will help you set up the necessary configuration values for Phase 2 of the Makkaizou-LINE integration.

## Required Configuration Values

The following configuration values must be set in the Configuration sheet for the integration to work properly:

### LINE API Configuration

| Key | Description | How to Obtain |
|-----|-------------|---------------|
| `line_channel_secret` | Channel secret for validating LINE webhooks | Found in the LINE Developers Console under your channel's Basic Settings |
| `line_access_token` | Access token for the LINE Messaging API | Found in the LINE Developers Console under your channel's Messaging API settings |
| `line_bot_user_id` | The LINE user ID of the bot | You can obtain this by sending a direct message to your bot and checking the logs for the userId |
| `bot_name` | The name of the bot for text-based mention detection | Choose any name you want users to use when mentioning the bot (e.g., "LineBot") |

### Makkaizou API Configuration

| Key | Description | How to Obtain |
|-----|-------------|---------------|
| `makkaizou_api_key` | API key for the Makkaizou platform | Provided by the Makkaizou team or generated in the Makkaizou dashboard |

### Feature Flags

| Key | Description | Recommended Value |
|-----|-------------|------------------|
| `enable_loading_indicator` | Whether to show loading indicators | `true` for better user experience |
| `debug_mode` | Whether to enable debug logging | `true` during testing, `false` in production |

## Setting Configuration Values

You can set these configuration values in two ways:

### Method 1: Using the Google Apps Script Editor

1. Open your Google Apps Script project
2. Run the `testSetup()` function to initialize the sheets
3. Open the linked Google Sheet
4. Navigate to the "Configuration" sheet
5. Add or update the configuration values in the appropriate rows

### Method 2: Using the `setConfigValue` Function

You can also set configuration values programmatically by running a script in the Apps Script editor:

```javascript
function setupPhase2Config() {
  // LINE API Configuration
  setConfigValue('line_channel_secret', 'YOUR_CHANNEL_SECRET', 'Channel secret for validating LINE webhooks');
  setConfigValue('line_access_token', 'YOUR_ACCESS_TOKEN', 'Access token for the LINE Messaging API');
  setConfigValue('line_bot_user_id', 'YOUR_BOT_USER_ID', 'The LINE user ID of the bot');
  setConfigValue('bot_name', 'LineBot', 'The name of the bot for mention detection');
  
  // Makkaizou API Configuration
  setConfigValue('makkaizou_api_key', 'YOUR_MAKKAIZOU_API_KEY', 'API key for the Makkaizou platform');
  
  // Feature Flags
  setConfigValue('enable_loading_indicator', 'true', 'Whether to show loading indicators');
  setConfigValue('debug_mode', 'true', 'Whether to enable debug logging');
  
  return 'Phase 2 configuration values set successfully!';
}
```

Replace the placeholder values with your actual values.

## Verifying Configuration

After setting up the configuration values, you can verify them by running the `testPhase2()` function in the Apps Script editor. This function will test the mention detection, talk_id management, and Makkaizou API integration (if an API key is configured).

## Troubleshooting

If you encounter issues with the configuration:

1. Check that all required configuration values are set correctly
2. Verify that your LINE channel is properly set up in the LINE Developers Console
3. Ensure that your Makkaizou API key is valid
4. Check the error logs in the "ErrorLogs" sheet for specific error messages
5. Enable debug mode by setting `debug_mode` to `true` for more detailed logging

If you continue to experience issues, please contact the development team for assistance.