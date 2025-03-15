/**
 * Makkaizou-LINE Integration
 * 
 * This Google Apps Script handles the integration between LINE Messaging API
 * and the Makkaizou AI platform. It processes messages from LINE, forwards them
 * to Makkaizou when the bot is mentioned, and returns the AI-generated responses.
 */

// Global constants
const SHEET_NAMES = {
  MAPPING: 'Mapping',
  CONFIG: 'Configuration',
  LOGS: 'Logs',
  ERROR_LOGS: 'ErrorLogs'
};

const ERROR_TYPES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  API_ERROR: 'API_ERROR',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Handles POST requests from LINE webhook
 * @param {Object} e - The event object from the webhook
 * @return {Object} - Response object
 */
function doPost(e) {
  try {
    // Set CORS headers for the preflight request
    if (e.postData.contents === undefined) {
      return createCORSResponse();
    }
    
    // Log the raw request for debugging
    logDebug('Received webhook', e);
    
    // Validate the signature
    if (!validateSignature(e)) {
      logError(ERROR_TYPES.VALIDATION_ERROR, 'Invalid signature', { payload: e.postData.contents });
      return createCORSResponse(401, 'Invalid signature');
    }
    
    // Parse the webhook data
    const webhookData = JSON.parse(e.postData.contents);
    
    // Process each event in the webhook
    webhookData.events.forEach(event => {
      try {
        processEvent(event);
      } catch (eventError) {
        logError(
          ERROR_TYPES.PROCESSING_ERROR, 
          `Error processing event: ${eventError.message}`, 
          { event: JSON.stringify(event) }
        );
      }
    });
    
    // Return success response with CORS headers
    return createCORSResponse(200, 'OK');
  } catch (error) {
    // Log the error and return error response
    logError(
      ERROR_TYPES.UNKNOWN_ERROR, 
      `Unhandled error in doPost: ${error.message}`, 
      { stack: error.stack }
    );
    return createCORSResponse(500, 'Internal server error');
  }
}

/**
 * Handles GET requests for testing
 * @param {Object} e - The event object
 * @return {Object} - Response object
 */
function doGet(e) {
  return createCORSResponse(200, 'Webhook is working!');
}

/**
 * Creates an HTTP response object with CORS headers
 * @param {number} code - The HTTP status code (default: 200)
 * @param {string} message - The response message (default: '')
 * @return {Object} - The response object
 */
function createCORSResponse(code = 200, message = '') {
  // Create the response content
  const response = ContentService.createTextOutput(
    JSON.stringify({ status: code, message: message })
  );
  
  // Set MIME type and CORS headers
  response.setMimeType(ContentService.MimeType.JSON);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

/**
 * Creates an HTTP response object (legacy version for backward compatibility)
 * @param {number} code - The HTTP status code
 * @param {string} message - The response message
 * @return {Object} - The response object
 */
function createResponse(code, message) {
  return createCORSResponse(code, message);
}

/**
 * Processes a single LINE event
 * @param {Object} event - The LINE event object
 */
function processEvent(event) {
  // Only process message events
  if (event.type !== 'message') {
    logDebug('Ignoring non-message event', { eventType: event.type });
    return;
  }
  
  // Only process text messages
  if (event.message.type !== 'text') {
    logDebug('Ignoring non-text message', { messageType: event.message.type });
    return;
  }
  
  // Check if the message mentions the bot
  if (!isBotMentioned(event.message)) {
    logDebug('Bot not mentioned, ignoring message', { messageText: event.message.text });
    return;
  }
  
  // Log that we're processing a message with a mention
  logInfo('Processing message with bot mention', { 
    groupId: event.source.groupId,
    userId: event.source.userId,
    message: event.message.text
  });
  
  // TODO: Process the message and send to Makkaizou API
  // This will be implemented in Phase 2
}

/**
 * Validates the signature of the LINE webhook
 * @param {Object} e - The event object from the webhook
 * @return {boolean} - Whether the signature is valid
 */
function validateSignature(e) {
  try {
    // Get the channel secret from the configuration
    const channelSecret = getConfigValue('line_channel_secret');
    
    // If no channel secret is configured, skip validation in development
    if (!channelSecret) {
      logWarning('No channel secret configured, skipping signature validation');
      return true;
    }
    
    // Get the signature from the headers
    const signature = e.parameter['x-line-signature'] || 
                     (e.parameters && e.parameters['x-line-signature']) ||
                     e.headers['X-Line-Signature'] ||
                     e.headers['x-line-signature'];
    
    if (!signature) {
      logError(ERROR_TYPES.VALIDATION_ERROR, 'No signature provided');
      return false;
    }
    
    // Compute the expected signature
    const content = e.postData.contents;
    const expectedSignature = computeSignature(channelSecret, content);
    
    // Compare the signatures
    return signature === expectedSignature;
  } catch (error) {
    logError(
      ERROR_TYPES.VALIDATION_ERROR, 
      `Error validating signature: ${error.message}`, 
      { stack: error.stack }
    );
    return false;
  }
}

/**
 * Computes the HMAC-SHA256 signature for LINE webhook validation
 * @param {string} channelSecret - The LINE channel secret
 * @param {string} content - The request body
 * @return {string} - The computed signature
 */
function computeSignature(channelSecret, content) {
  // In GAS, we need to use the Utilities.computeHmacSha256Signature method
  const key = Utilities.newBlob(channelSecret).getBytes();
  const data = Utilities.newBlob(content).getBytes();
  const signature = Utilities.computeHmacSha256Signature(data, key);
  return Utilities.base64Encode(signature);
}

/**
 * Checks if the bot is mentioned in the message
 * @param {Object} message - The LINE message object
 * @return {boolean} - Whether the bot is mentioned
 */
function isBotMentioned(message) {
  // Get the bot name from configuration
  const botName = getConfigValue('bot_name');
  
  // If no bot name is configured, assume any message is for the bot
  if (!botName) {
    logWarning('No bot name configured, assuming all messages mention the bot');
    return true;
  }
  
  // Check if the message text contains @botName
  const mentionText = `@${botName}`;
  return message.text.includes(mentionText);
  
  // TODO: In Phase 2, enhance this to use the mention property from LINE API
}

// --- Spreadsheet Utility Functions ---

/**
 * Gets the active spreadsheet
 * @return {Spreadsheet} - The active spreadsheet
 */
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Gets a sheet by name, creating it if it doesn't exist
 * @param {string} sheetName - The name of the sheet
 * @return {Sheet} - The sheet
 */
function getOrCreateSheet(sheetName) {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    
    // Initialize the sheet with headers based on its type
    switch (sheetName) {
      case SHEET_NAMES.MAPPING:
        sheet.appendRow(['groupId', 'userId', 'talk_id', 'created_at', 'last_used']);
        break;
      case SHEET_NAMES.CONFIG:
        sheet.appendRow(['key', 'value', 'description']);
        break;
      case SHEET_NAMES.LOGS:
        sheet.appendRow(['timestamp', 'groupId', 'userId', 'message', 'response', 'status', 'processing_time']);
        break;
      case SHEET_NAMES.ERROR_LOGS:
        sheet.appendRow(['timestamp', 'error_type', 'error_message', 'context_data', 'stack_trace']);
        break;
    }
  }
  
  return sheet;
}

/**
 * Gets a configuration value from the Configuration sheet
 * @param {string} key - The configuration key
 * @return {string} - The configuration value
 */
function getConfigValue(key) {
  const sheet = getOrCreateSheet(SHEET_NAMES.CONFIG);
  const data = sheet.getDataRange().getValues();
  
  // Skip the header row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      return data[i][1];
    }
  }
  
  return null;
}

/**
 * Sets a configuration value in the Configuration sheet
 * @param {string} key - The configuration key
 * @param {string} value - The configuration value
 * @param {string} description - The description of the configuration
 */
function setConfigValue(key, value, description = '') {
  const sheet = getOrCreateSheet(SHEET_NAMES.CONFIG);
  const data = sheet.getDataRange().getValues();
  
  // Check if the key already exists
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      // Update the existing row
      sheet.getRange(i + 1, 2).setValue(value);
      if (description) {
        sheet.getRange(i + 1, 3).setValue(description);
      }
      return;
    }
  }
  
  // Add a new row if the key doesn't exist
  sheet.appendRow([key, value, description]);
}

// --- Logging Functions ---

/**
 * Logs an informational message
 * @param {string} message - The log message
 * @param {Object} data - Additional data to log
 */
function logInfo(message, data = {}) {
  const sheet = getOrCreateSheet(SHEET_NAMES.LOGS);
  const timestamp = new Date();
  
  sheet.appendRow([
    timestamp,
    data.groupId || '',
    data.userId || '',
    data.message || message,
    data.response || '',
    'INFO',
    data.processing_time || ''
  ]);
  
  // Also log to console for debugging
  console.info(message, data);
}

/**
 * Logs a debug message (only in development)
 * @param {string} message - The log message
 * @param {Object} data - Additional data to log
 */
function logDebug(message, data = {}) {
  // Only log debug messages if debug mode is enabled
  if (getConfigValue('debug_mode') !== 'true') {
    return;
  }
  
  console.debug(message, data);
}

/**
 * Logs a warning message
 * @param {string} message - The warning message
 * @param {Object} data - Additional data to log
 */
function logWarning(message, data = {}) {
  console.warn(message, data);
}

/**
 * Logs an error message
 * @param {string} errorType - The type of error
 * @param {string} errorMessage - The error message
 * @param {Object} contextData - Additional context data
 */
function logError(errorType, errorMessage, contextData = {}) {
  const sheet = getOrCreateSheet(SHEET_NAMES.ERROR_LOGS);
  const timestamp = new Date();
  
  sheet.appendRow([
    timestamp,
    errorType,
    errorMessage,
    JSON.stringify(contextData),
    contextData.stack || ''
  ]);
  
  // Also log to console for debugging
  console.error(errorType, errorMessage, contextData);
}

/**
 * Test function to verify the script is working
 * Can be run manually from the Apps Script editor
 */
function testSetup() {
  // Initialize the sheets
  getOrCreateSheet(SHEET_NAMES.MAPPING);
  getOrCreateSheet(SHEET_NAMES.CONFIG);
  getOrCreateSheet(SHEET_NAMES.LOGS);
  getOrCreateSheet(SHEET_NAMES.ERROR_LOGS);
  
  // Set some default configuration values
  setConfigValue('debug_mode', 'true', 'Enable debug logging');
  setConfigValue('bot_name', 'LineBot', 'The name of the LINE bot for mention detection');
  
  // Log a test message
  logInfo('Test setup completed successfully');
  
  return 'Setup completed successfully!';
}