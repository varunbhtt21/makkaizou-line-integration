/**
 * TalkIdManager.js
 * 
 * This file contains functions for managing the mapping between
 * LINE group/user IDs and Makkaizou talk_ids.
 */

/**
 * Generates a new talk_id
 * @return {string} - The generated talk_id
 */
function generateTalkId() {
  // Generate a 6-digit random number
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `wiz-user-id-${randomNum}`;
}

/**
 * Gets the talk_id for a given group and user
 * If no talk_id exists, creates a new one
 * @param {string} groupId - The LINE group ID
 * @param {string} userId - The LINE user ID
 * @return {string} - The talk_id
 */
function getTalkId(groupId, userId) {
  const sheet = getOrCreateSheet(SHEET_NAMES.MAPPING);
  const data = sheet.getDataRange().getValues();
  
  // Skip the header row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === groupId && data[i][1] === userId) {
      // Update the last_used timestamp
      const now = new Date();
      sheet.getRange(i + 1, 5).setValue(now);
      
      // Return the existing talk_id
      return data[i][2];
    }
  }
  
  // If no mapping exists, create a new one
  return createTalkId(groupId, userId);
}

/**
 * Creates a new talk_id for a given group and user
 * @param {string} groupId - The LINE group ID
 * @param {string} userId - The LINE user ID
 * @return {string} - The created talk_id
 */
function createTalkId(groupId, userId) {
  const sheet = getOrCreateSheet(SHEET_NAMES.MAPPING);
  const now = new Date();
  const talkId = generateTalkId();
  
  // Add a new row with the mapping
  sheet.appendRow([groupId, userId, talkId, now, now]);
  
  // Log the creation of a new talk_id
  logInfo('Created new talk_id', {
    groupId: groupId,
    userId: userId,
    talk_id: talkId
  });
  
  return talkId;
}

/**
 * Gets all mappings for a given group
 * @param {string} groupId - The LINE group ID
 * @return {Array} - Array of mappings (userId, talk_id)
 */
function getMappingsForGroup(groupId) {
  const sheet = getOrCreateSheet(SHEET_NAMES.MAPPING);
  const data = sheet.getDataRange().getValues();
  const mappings = [];
  
  // Skip the header row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === groupId) {
      mappings.push({
        userId: data[i][1],
        talkId: data[i][2],
        createdAt: data[i][3],
        lastUsed: data[i][4]
      });
    }
  }
  
  return mappings;
}

/**
 * Gets all mappings for a given user across all groups
 * @param {string} userId - The LINE user ID
 * @return {Array} - Array of mappings (groupId, talk_id)
 */
function getMappingsForUser(userId) {
  const sheet = getOrCreateSheet(SHEET_NAMES.MAPPING);
  const data = sheet.getDataRange().getValues();
  const mappings = [];
  
  // Skip the header row
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === userId) {
      mappings.push({
        groupId: data[i][0],
        talkId: data[i][2],
        createdAt: data[i][3],
        lastUsed: data[i][4]
      });
    }
  }
  
  return mappings;
}

/**
 * Deletes a mapping for a given group and user
 * @param {string} groupId - The LINE group ID
 * @param {string} userId - The LINE user ID
 * @return {boolean} - Whether the deletion was successful
 */
function deleteTalkId(groupId, userId) {
  const sheet = getOrCreateSheet(SHEET_NAMES.MAPPING);
  const data = sheet.getDataRange().getValues();
  
  // Skip the header row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === groupId && data[i][1] === userId) {
      // Delete the row
      sheet.deleteRow(i + 1);
      
      // Log the deletion
      logInfo('Deleted talk_id mapping', {
        groupId: groupId,
        userId: userId
      });
      
      return true;
    }
  }
  
  return false;
}