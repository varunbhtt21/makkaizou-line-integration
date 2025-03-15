/**
 * LineApi.js
 * 
 * This file contains functions for interacting with the LINE Messaging API.
 */

// LINE API endpoints
const LINE_API = {
  REPLY: 'https://api.line.me/v2/bot/message/reply',
  PUSH: 'https://api.line.me/v2/bot/message/push',
  PROFILE: 'https://api.line.me/v2/bot/profile',
  GROUP_MEMBER: 'https://api.line.me/v2/bot/group/{groupId}/member/{userId}',
  LOADING_INDICATOR: 'https://api.line.me/v2/bot/message/reply/loading'
};

/**
 * Sends a reply to a LINE message
 * @param {string} replyToken - The reply token from the webhook event
 * @param {Array} messages - Array of message objects to send
 * @return {Object} - The API response
 */
function replyMessage(replyToken, messages) {
  try {
    const accessToken = getConfigValue('line_access_token');
    
    if (!accessToken) {
      throw new Error('LINE access token not configured');
    }
    
    const payload = {
      replyToken: replyToken,
      messages: messages
    };
    
    const options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(LINE_API.REPLY, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      throw new Error(`LINE API returned status code ${responseCode}`);
    }
    
    return JSON.parse(response.getContentText());
  } catch (error) {
    logError(
      ERROR_TYPES.API_ERROR,
      `Error replying to message: ${error.message}`,
      { replyToken: replyToken, messages: messages }
    );
    throw error;
  }
}

/**
 * Shows a loading indicator for a reply
 * @param {string} replyToken - The reply token from the webhook event
 * @return {Object} - The API response
 */
function showLoadingIndicator(replyToken) {
  try {
    // Check if loading indicators are enabled
    if (getConfigValue('enable_loading_indicator') !== 'true') {
      return null;
    }
    
    const accessToken = getConfigValue('line_access_token');
    
    if (!accessToken) {
      throw new Error('LINE access token not configured');
    }
    
    const payload = {
      replyToken: replyToken
    };
    
    const options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(LINE_API.LOADING_INDICATOR, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      throw new Error(`LINE API returned status code ${responseCode}`);
    }
    
    return JSON.parse(response.getContentText());
  } catch (error) {
    logError(
      ERROR_TYPES.API_ERROR,
      `Error showing loading indicator: ${error.message}`,
      { replyToken: replyToken }
    );
    // Don't throw the error, just log it and continue
    return null;
  }
}

/**
 * Creates a text message object
 * @param {string} text - The message text
 * @return {Object} - The message object
 */
function createTextMessage(text) {
  return {
    type: 'text',
    text: text
  };
}

/**
 * Creates a flex message object
 * @param {string} altText - Alternative text for notifications
 * @param {Object} contents - The flex message contents
 * @return {Object} - The message object
 */
function createFlexMessage(altText, contents) {
  return {
    type: 'flex',
    altText: altText,
    contents: contents
  };
}

/**
 * Gets user profile information
 * @param {string} userId - The LINE user ID
 * @return {Object} - The user profile
 */
function getUserProfile(userId) {
  try {
    const accessToken = getConfigValue('line_access_token');
    
    if (!accessToken) {
      throw new Error('LINE access token not configured');
    }
    
    const options = {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    };
    
    const response = UrlFetchApp.fetch(`${LINE_API.PROFILE}/${userId}`, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      throw new Error(`LINE API returned status code ${responseCode}`);
    }
    
    return JSON.parse(response.getContentText());
  } catch (error) {
    logError(
      ERROR_TYPES.API_ERROR,
      `Error getting user profile: ${error.message}`,
      { userId: userId }
    );
    return null;
  }
}

/**
 * Gets group member profile information
 * @param {string} groupId - The LINE group ID
 * @param {string} userId - The LINE user ID
 * @return {Object} - The user profile
 */
function getGroupMemberProfile(groupId, userId) {
  try {
    const accessToken = getConfigValue('line_access_token');
    
    if (!accessToken) {
      throw new Error('LINE access token not configured');
    }
    
    const url = LINE_API.GROUP_MEMBER
      .replace('{groupId}', groupId)
      .replace('{userId}', userId);
    
    const options = {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      throw new Error(`LINE API returned status code ${responseCode}`);
    }
    
    return JSON.parse(response.getContentText());
  } catch (error) {
    logError(
      ERROR_TYPES.API_ERROR,
      `Error getting group member profile: ${error.message}`,
      { groupId: groupId, userId: userId }
    );
    return null;
  }
}