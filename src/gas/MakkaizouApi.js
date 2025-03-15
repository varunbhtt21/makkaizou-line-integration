/**
 * MakkaizouApi.js
 * 
 * This file contains functions for interacting with the Makkaizou AI API.
 */

// Makkaizou API endpoints
const MAKKAIZOU_API = {
  CHAT: 'https://api.makkaizou.com/v1/chat',
  STATUS: 'https://api.makkaizou.com/v1/status'
};

/**
 * Sends a message to the Makkaizou API
 * @param {string} talkId - The talk_id for the conversation
 * @param {string} message - The message to send
 * @param {Object} metadata - Additional metadata for the request
 * @return {Object} - The API response
 */
function sendToMakkaizou(talkId, message, metadata = {}) {
  try {
    const apiKey = getConfigValue('makkaizou_api_key');
    
    if (!apiKey) {
      throw new Error('Makkaizou API key not configured');
    }
    
    // Prepare the payload
    const payload = {
      talk_id: talkId,
      message: message,
      metadata: {
        source: 'line',
        ...metadata
      }
    };
    
    // Set request options
    const options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    // Send the request
    const startTime = new Date().getTime();
    const response = UrlFetchApp.fetch(MAKKAIZOU_API.CHAT, options);
    const endTime = new Date().getTime();
    const processingTime = endTime - startTime;
    
    // Check response code
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode !== 200) {
      throw new Error(`Makkaizou API returned status code ${responseCode}: ${responseText}`);
    }
    
    // Parse and return the response
    const responseData = JSON.parse(responseText);
    
    // Log the successful API call
    logInfo('Makkaizou API response received', {
      talkId: talkId,
      processingTime: processingTime,
      responseLength: responseData.response ? responseData.response.length : 0
    });
    
    return {
      ...responseData,
      processingTime: processingTime
    };
  } catch (error) {
    logError(
      ERROR_TYPES.API_ERROR,
      `Error calling Makkaizou API: ${error.message}`,
      { talkId: talkId, message: message }
    );
    throw error;
  }
}

/**
 * Checks the status of the Makkaizou API
 * @return {Object} - The status response
 */
function checkMakkaizouStatus() {
  try {
    const apiKey = getConfigValue('makkaizou_api_key');
    
    if (!apiKey) {
      throw new Error('Makkaizou API key not configured');
    }
    
    // Set request options
    const options = {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      muteHttpExceptions: true
    };
    
    // Send the request
    const response = UrlFetchApp.fetch(MAKKAIZOU_API.STATUS, options);
    
    // Check response code
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode !== 200) {
      throw new Error(`Makkaizou API status check returned code ${responseCode}: ${responseText}`);
    }
    
    // Parse and return the response
    return JSON.parse(responseText);
  } catch (error) {
    logError(
      ERROR_TYPES.API_ERROR,
      `Error checking Makkaizou API status: ${error.message}`
    );
    return { status: 'error', message: error.message };
  }
}

/**
 * Formats a Makkaizou response for LINE
 * @param {Object} makkaizouResponse - The response from the Makkaizou API
 * @return {Array} - Array of LINE message objects
 */
function formatMakkaizouResponse(makkaizouResponse) {
  // If there's no response or an error, return a generic message
  if (!makkaizouResponse || !makkaizouResponse.response) {
    return [createTextMessage('Sorry, I couldn\'t process your request at this time.')];
  }
  
  // Get the response text
  const responseText = makkaizouResponse.response;
  
  // Check if the response is too long for a single message (LINE limit is 5000 characters)
  if (responseText.length <= 5000) {
    return [createTextMessage(responseText)];
  }
  
  // Split long responses into multiple messages
  const messages = [];
  let remainingText = responseText;
  
  while (remainingText.length > 0) {
    // Find a good breaking point (end of sentence or paragraph)
    let breakPoint = 4900; // Leave some buffer
    
    if (remainingText.length > breakPoint) {
      // Try to find a period, question mark, or exclamation point followed by a space or newline
      const matches = remainingText.slice(0, breakPoint).match(/[.!?][\s\n]/g);
      
      if (matches && matches.length > 0) {
        // Find the last sentence break
        const lastMatch = remainingText.slice(0, breakPoint).lastIndexOf(matches[matches.length - 1]) + 2;
        breakPoint = lastMatch;
      } else {
        // If no sentence break, try to find a newline
        const newlineIndex = remainingText.slice(0, breakPoint).lastIndexOf('\n');
        
        if (newlineIndex > 0) {
          breakPoint = newlineIndex + 1;
        }
      }
    } else {
      breakPoint = remainingText.length;
    }
    
    // Add the message part
    messages.push(createTextMessage(remainingText.slice(0, breakPoint)));
    
    // Update the remaining text
    remainingText = remainingText.slice(breakPoint);
  }
  
  return messages;
}