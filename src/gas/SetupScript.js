/**
 * SetupScript.js
 * 
 * This file contains functions for setting up and configuring the Makkaizou-LINE integration.
 */

/**
 * Sets up the configuration values for Phase 2
 * Replace the placeholder values with your actual values before running
 */
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

/**
 * Gets the bot's user ID by checking recent messages
 * Run this function after receiving at least one direct message to your bot
 */
function getBotUserId() {
  const sheet = getOrCreateSheet(SHEET_NAMES.LOGS);
  const data = sheet.getDataRange().getValues();
  
  // Skip the header row
  for (let i = 1; i < data.length; i++) {
    // Look for direct messages (where groupId is empty or same as userId)
    if (!data[i][1] || data[i][1] === data[i][2]) {
      const userId = data[i][2];
      if (userId) {
        Logger.log(`Potential bot user ID found: ${userId}`);
        return userId;
      }
    }
  }
  
  Logger.log('No potential bot user ID found in logs. Try sending a direct message to the bot first.');
  return null;
}

/**
 * Displays the current configuration values
 */
function showCurrentConfig() {
  const configKeys = [
    'line_channel_secret',
    'line_access_token',
    'line_bot_user_id',
    'bot_name',
    'makkaizou_api_key',
    'enable_loading_indicator',
    'debug_mode'
  ];
  
  const config = {};
  
  configKeys.forEach(key => {
    const value = getConfigValue(key);
    
    // Mask sensitive values
    if (key === 'line_channel_secret' || key === 'line_access_token' || key === 'makkaizou_api_key') {
      config[key] = value ? '********' + value.substr(-4) : 'Not set';
    } else {
      config[key] = value || 'Not set';
    }
  });
  
  Logger.log('Current Configuration:');
  Logger.log(JSON.stringify(config, null, 2));
  
  return config;
}

/**
 * Verifies the LINE API configuration by testing the access token
 */
function verifyLineConfig() {
  const accessToken = getConfigValue('line_access_token');
  
  if (!accessToken) {
    Logger.log('LINE access token not configured');
    return { success: false, error: 'LINE access token not configured' };
  }
  
  try {
    // Try to get the bot info using the access token
    const options = {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch('https://api.line.me/v2/bot/info', options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const botInfo = JSON.parse(response.getContentText());
      Logger.log('LINE API configuration verified successfully');
      Logger.log(`Bot name: ${botInfo.displayName}`);
      Logger.log(`Bot user ID: ${botInfo.userId}`);
      
      // Update the bot_name and line_bot_user_id if not already set
      if (!getConfigValue('bot_name')) {
        setConfigValue('bot_name', botInfo.displayName, 'The name of the bot for mention detection');
      }
      
      if (!getConfigValue('line_bot_user_id')) {
        setConfigValue('line_bot_user_id', botInfo.userId, 'The LINE user ID of the bot');
      }
      
      return { 
        success: true, 
        botInfo: botInfo 
      };
    } else {
      Logger.log(`LINE API returned status code ${responseCode}`);
      return { 
        success: false, 
        error: `LINE API returned status code ${responseCode}` 
      };
    }
  } catch (error) {
    Logger.log(`Error verifying LINE configuration: ${error.message}`);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Verifies the Makkaizou API configuration by testing the API key
 */
function verifyMakkaizouConfig() {
  try {
    const status = checkMakkaizouStatus();
    
    if (status.status === 'error') {
      Logger.log(`Error checking Makkaizou API status: ${status.message}`);
      return { 
        success: false, 
        error: status.message 
      };
    }
    
    Logger.log('Makkaizou API configuration verified successfully');
    Logger.log(`API Status: ${JSON.stringify(status)}`);
    
    return { 
      success: true, 
      status: status 
    };
  } catch (error) {
    Logger.log(`Error verifying Makkaizou configuration: ${error.message}`);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Verifies all configuration for Phase 2
 */
function verifyPhase2Config() {
  Logger.log('=== VERIFYING PHASE 2 CONFIGURATION ===');
  
  // Show current configuration
  Logger.log('\n--- Current Configuration ---');
  const config = showCurrentConfig();
  
  // Verify LINE configuration
  Logger.log('\n--- Verifying LINE Configuration ---');
  const lineResult = verifyLineConfig();
  
  // Verify Makkaizou configuration
  Logger.log('\n--- Verifying Makkaizou Configuration ---');
  const makkaizouResult = verifyMakkaizouConfig();
  
  // Summarize results
  Logger.log('\n=== VERIFICATION SUMMARY ===');
  Logger.log(`LINE API: ${lineResult.success ? 'VERIFIED' : 'FAILED'}`);
  Logger.log(`Makkaizou API: ${makkaizouResult.success ? 'VERIFIED' : 'FAILED'}`);
  
  return {
    config: config,
    lineResult: lineResult,
    makkaizouResult: makkaizouResult,
    overallSuccess: lineResult.success && makkaizouResult.success
  };
}