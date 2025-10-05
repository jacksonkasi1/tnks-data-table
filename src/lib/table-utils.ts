/**
 * Table utility functions for common column operations
 */

/**
 * Format a number or string as USD currency
 * @param amount - The amount to format (string or number)
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined) return "$0.00";
  
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numericAmount);
}

/**
 * Format a date as "MMM d, yyyy" (e.g., "Jan 15, 2025")
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatShortDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a datetime as "MMM d, h:mm AM/PM" (e.g., "Jan 15, 2:30 PM")
 * @param date - Date string or Date object
 * @returns Formatted datetime string
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  return dateObj.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Capitalize first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format kebab-case or hyphenated string to Title Case
 * @param str - String to format (e.g., "in-progress")
 * @returns Title case string (e.g., "In Progress")
 */
export function formatKebabToTitle(str: string): string {
  if (!str) return "";
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
