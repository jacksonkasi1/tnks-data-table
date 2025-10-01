/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  // Use local date components instead of UTC conversion
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-based
  const day = String(date.getDate()).padStart(2, '0');
  
  const result = `${year}-${month}-${day}`;
  
  return result;
}