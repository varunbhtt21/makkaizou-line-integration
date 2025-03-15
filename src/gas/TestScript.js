/**
 * TestScript.js
 * 
 * This file contains test functions to verify the setup and functionality
 * of the Makkaizou-LINE integration.
 */

/**
 * Tests the sheet creation and initialization
 */
function testSheetSetup() {
  // Initialize all sheets
  const mappingSheet = getOrCreateSheet(SHEET_NAMES.MAPPING);
  const configSheet = getOrCreateSheet(SHEET_NAMES.CONFIG);
  const logsSheet = getOrCreateSheet(SHEET_NAMES.LOGS);
  const errorLogsSheet = getOrCreateSheet(SHEET_NAMES.ERROR_LOGS);
  
  // Log the test
  logInfo('Test sheet setup completed successfully');
  
  // Return success message
  return 'Sheet setup test completed successfully!';
}

/**
 * Tests the configuration management
 */
function testConfigManagement() {
  // Set some test configuration values
  setConfigValue('test_key', 'test_value', 'Test configuration value');
  
  // Get the value back
  const value = getConfigValue('test_key');
  
  // Verify the value
  if (value !== 'test_value') {
    throw new Error(`Expected 'test_value', got '${value}'`);
  }
  
  // Log the test
  logInfo('Test configuration management completed successfully');
  
  // Return success message
  return 'Configuration management test completed successfully!';
}

/**
 * Tests the talk_id management
 */
function testTalkIdManagement() {
  // Generate a test talk_id
  const talkId = generateTalkId();
  
  // Verify the format
  if (!talkId.startsWith('wiz-user-id-')) {
    throw new Error(`Invalid talk_id format: ${talkId}`);
  }
  
  // Create a mapping for a test group and user
  const testGroupId = 'test_group_' + Date.now();
  const testUserId = 'test_user_' + Date.now();
  
  // Create the talk_id
  const createdTalkId = createTalkId(testGroupId, testUserId);
  
  // Get the talk_id back
  const retrievedTalkId = getTalkId(testGroupId, testUserId);
  
  // Verify the talk_id
  if (createdTalkId !== retrievedTalkId) {
    throw new Error(`Expected '${createdTalkId}', got '${retrievedTalkId}'`);
  }
  
  // Clean up the test data
  deleteTalkId(testGroupId, testUserId);
  
  // Log the test
  logInfo('Test talk_id management completed successfully');
  
  // Return success message
  return 'Talk_id management test completed successfully!';
}

/**
 * Tests the logging functionality
 */
function testLogging() {
  // Test info logging
  logInfo('Test info log', { test: 'info' });
  
  // Test debug logging
  logDebug('Test debug log', { test: 'debug' });
  
  // Test warning logging
  logWarning('Test warning log', { test: 'warning' });
  
  // Test error logging
  logError(ERROR_TYPES.UNKNOWN_ERROR, 'Test error log', { test: 'error' });
  
  // Return success message
  return 'Logging test completed successfully!';
}

/**
 * Tests the webhook validation
 */
function testWebhookValidation() {
  // Set a test channel secret
  setConfigValue('line_channel_secret', 'test_secret', 'Test channel secret');
  
  // Create a test event object
  const testEvent = {
    postData: {
      contents: '{"events":[{"type":"message","message":{"type":"text","text":"Hello"}}]}'
    },
    parameter: {
      'x-line-signature': ''
    }
  };
  
  // Compute the expected signature
  const expectedSignature = computeSignature('test_secret', testEvent.postData.contents);
  
  // Set the signature in the test event
  testEvent.parameter['x-line-signature'] = expectedSignature;
  
  // Validate the signature
  const isValid = validateSignature(testEvent);
  
  // Verify the validation
  if (!isValid) {
    throw new Error('Webhook validation failed');
  }
  
  // Log the test
  logInfo('Test webhook validation completed successfully');
  
  // Return success message
  return 'Webhook validation test completed successfully!';
}

/**
 * Simulates a LINE webhook event
 */
function simulateWebhook() {
  // Create a test webhook event
  const testEvent = {
    postData: {
      contents: JSON.stringify({
        events: [
          {
            type: 'message',
            replyToken: 'test_reply_token',
            source: {
              type: 'group',
              groupId: 'test_group_id',
              userId: 'test_user_id'
            },
            message: {
              type: 'text',
              text: '@LineBot Hello, this is a test message'
            }
          }
        ]
      })
    },
    parameter: {}
  };
  
  // Set the bot name in configuration
  setConfigValue('bot_name', 'LineBot', 'Test bot name');
  
  // Compute a signature (skip validation in this test)
  setConfigValue('line_channel_secret', '', 'Empty for test');
  
  // Process the webhook
  const response = doPost(testEvent);
  
  // Log the response
  logInfo('Simulated webhook response', { response: JSON.stringify(response) });
  
  // Return success message
  return 'Webhook simulation completed successfully!';
}

/**
 * Runs all tests
 */
function runAllTests() {
  try {
    // Run all the tests
    testSheetSetup();
    testConfigManagement();
    testTalkIdManagement();
    testLogging();
    testWebhookValidation();
    simulateWebhook();
    
    // Log the success
    logInfo('All tests completed successfully');
    
    // Return success message
    return 'All tests completed successfully!';
  } catch (error) {
    // Log the error
    logError(ERROR_TYPES.UNKNOWN_ERROR, `Test failed: ${error.message}`, { stack: error.stack });
    
    // Return error message
    return `Tests failed: ${error.message}`;
  }
}