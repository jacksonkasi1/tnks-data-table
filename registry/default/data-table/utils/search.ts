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
  
  // Comprehensive sanitization for XSS protection
  // Remove script tags and potentially harmful HTML/JS patterns
  processed = processed.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  processed = processed.replace(/javascript:/gi, '');
  processed = processed.replace(/on\w+\s*=/gi, '');
  
  // HTML entity encoding for common XSS vectors
  processed = processed.replace(/&/g, '&amp;')
                     .replace(/</g, '&lt;')
                     .replace(/>/g, '&gt;')
                     .replace(/"/g, '&quot;')
                     .replace(/'/g, '&#x27;')
                     .replace(/\//g, '&#x2F;');
  
  return processed;
}
