/**
 * Deep equality check for objects and arrays
 * @param a First value to compare
 * @param b Second value to compare
 * @returns Boolean indicating if values are deeply equal
 */
export function isDeepEqual(a: any, b: any): boolean {
  // Handle primitive types
  if (a === b) return true;
  
  // Handle null and undefined
  if (a == null || b == null) return a === b;
  
  // Handle different types
  if (typeof a !== typeof b) return false;
  
  // Handle Date objects
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  
  // Handle RegExp objects
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString();
  }
  
  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    
    for (let i = 0; i < a.length; i++) {
      if (!isDeepEqual(a[i], b[i])) return false;
    }
    
    return true;
  }
  
  // Handle objects
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!isDeepEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  return false;
}

/**
 * Memoizes the result of a function based on its arguments
 * This helps prevent redundant expensive operations
 */
export function memoize<T>(fn: (...args: any[]) => T): (...args: any[]) => T {
  const cache = new Map();
  
  return (...args: any[]): T => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  };
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Reset URL parameters by removing all query parameters
 * @param router Next.js router instance
 * @param pathname Current pathname
 */
export function resetUrlState(router: any, pathname: string): void {
  router.replace(pathname);
} 