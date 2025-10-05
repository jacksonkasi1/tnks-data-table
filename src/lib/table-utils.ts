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
