import fs from 'fs';
import path from 'path';

const IMPRESSIONS_FILE = path.join(process.cwd(), 'sponsors-impressions.json');

/**
 * Get all impressions from the file
 * Returns empty object if file doesn't exist
 */
export const getImpressionsData = () => {
  try {
    if (fs.existsSync(IMPRESSIONS_FILE)) {
      const data = fs.readFileSync(IMPRESSIONS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Error reading impressions file:', error.message);
  }
  return {};
};

/**
 * Get impressions for a specific sponsor
 * Returns 0 if sponsor not found in file
 */
export const getSponsorImpressions = (sponsorId) => {
  try {
    const data = getImpressionsData();
    return data[sponsorId] || 0;
  } catch (error) {
    console.warn(`Error getting impressions for sponsor ${sponsorId}:`, error.message);
    return 0;
  }
};

/**
 * Increment impressions for a sponsor
 * Creates file if it doesn't exist
 */
export const incrementImpressions = (sponsorId) => {
  try {
    const data = getImpressionsData();
    
    // Initialize to 0 if sponsor not in file
    if (!(sponsorId in data)) {
      data[sponsorId] = 0;
    }
    
    // Increment
    data[sponsorId] += 1;
    
    // Write back to file
    fs.writeFileSync(IMPRESSIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    
    return data[sponsorId];
  } catch (error) {
    console.error(`Error incrementing impressions for sponsor ${sponsorId}:`, error.message);
    return 0;
  }
};

/**
 * Set impressions for a sponsor to a specific value
 * Useful for resetting or bulk updates
 */
export const setImpressions = (sponsorId, count) => {
  try {
    const data = getImpressionsData();
    data[sponsorId] = Math.max(0, count); // Ensure non-negative
    fs.writeFileSync(IMPRESSIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return data[sponsorId];
  } catch (error) {
    console.error(`Error setting impressions for sponsor ${sponsorId}:`, error.message);
    return 0;
  }
};

/**
 * Reset all impressions
 */
export const resetAllImpressions = () => {
  try {
    fs.writeFileSync(IMPRESSIONS_FILE, JSON.stringify({}, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error resetting impressions:', error.message);
    return false;
  }
};
