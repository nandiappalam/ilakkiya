/**
 * Safe Array Utility
 * Normalizes API responses to always return an array
 * This prevents TypeError when using .find(), .map(), .filter() on non-array responses
 * 
 * @param {any} result - The API response to normalize
 * @returns {Array} - Always returns an array
 */
export function safeArray(result) {
  // If result is already an array, return it
  if (Array.isArray(result)) {
    return result;
  }
  
  // If result is null or undefined, return empty array
  if (result === null || result === undefined) {
    return [];
  }
  
  // If result has a data property that is an array, return that
  if (result.data && Array.isArray(result.data)) {
    return result.data;
  }
  
  // If result has a data.data property (nested), return that
  if (result.data && result.data.data && Array.isArray(result.data.data)) {
    return result.data.data;
  }
  
  // If result is an object with success/data structure, try data
  if (typeof result === 'object' && !Array.isArray(result)) {
    // Handle { success: true, data: [...] } format
    if (Array.isArray(result.data)) {
      return result.data;
    }
  }
  
  // Default: return empty array
  console.warn('[safeArray] Unable to normalize result to array:', typeof result);
  return [];
}

export default safeArray;

