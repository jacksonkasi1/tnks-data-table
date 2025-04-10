/**
 * Preprocess search terms before sending to API
 * 
 * - Trims whitespace
 * - Removes excessive spaces
 * - Sanitizes potentially harmful characters
 * - Returns empty string for invalid inputs
 */
export function preprocessSearch(searchTerm: string): string {
  if (!searchTerm) return "";
  
  // Trim whitespace
  let processed = searchTerm.trim();
  
  // Remove excessive whitespace within the search term
  processed = processed.replace(/\s+/g, ' ');
  
  // Check for minimum length after processing (e.g., if it's just spaces)
  if (processed.length < 1) return "";
  
  // Basic sanitization for API safety
  // Remove any potentially harmful characters for the backend
  processed = processed.replace(/[<>]/g, '');
  
  return processed;
}
