type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;

/**
 * Optimized deep equality check for objects and arrays
 * @param a First value to compare
 * @param b Second value to compare
 * @returns Boolean indicating if values are deeply equal
 */
export function isDeepEqual(a: any, b: any): boolean {
  // Use a WeakMap to track object pairs we've compared to handle circular references
  const visited = new WeakMap();
  
  return compare(a, b);
  
  function compare(a: any, b: any): boolean {
    // Fast path for primitives and identical references
    if (a === b) return true;
    
    // Handle null/undefined
    if (a == null || b == null) return a === b;
    
    // Handle different types quickly
    const typeA = typeof a;
    if (typeA !== typeof b) return false;
    
    // Fast non-recursive paths for common types
    if (typeA !== 'object') return false; // We already checked a === b for primitives

    // Handle special object types
    if (a instanceof Date) {
      return b instanceof Date && a.getTime() === b.getTime();
    }
    
    if (a instanceof RegExp) {
      return b instanceof RegExp && a.toString() === b.toString();
    }
    
    // Handle arrays more efficiently
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;
      
      // For small arrays, use direct comparison
      if (a.length < 20) {
        for (let i = 0; i < a.length; i++) {
          if (!compare(a[i], b[i])) return false;
        }
        return true;
      }
      
      // For larger arrays, handle simple values quickly first
      const sortedA = [...a].sort(); 
      const sortedB = [...b].sort();
      
      // First do a quick comparison of primitives
      for (let i = 0; i < sortedA.length; i++) {
        const itemA = sortedA[i];
        const itemB = sortedB[i];
        if (typeof itemA !== 'object' && typeof itemB !== 'object') {
          if (itemA !== itemB) return false;
        }
      }
      
      // Then compare actual positions
      for (let i = 0; i < a.length; i++) {
        if (!compare(a[i], b[i])) return false;
      }
      
      return true;
    }
    
    // Special handling for Set
    if (a instanceof Set) {
      if (!(b instanceof Set) || a.size !== b.size) return false;
      
      // Convert to arrays and compare
      return compare([...a], [...b]);
    }
    
    // Special handling for Map
    if (a instanceof Map) {
      if (!(b instanceof Map) || a.size !== b.size) return false;
      
      for (const [key, val] of a.entries()) {
        if (!b.has(key) || !compare(val, b.get(key))) return false;
      }
      
      return true;
    }
    
    // Handle typed arrays
    if (ArrayBuffer.isView(a)) {
      if (!ArrayBuffer.isView(b) || (a as TypedArray).length !== (b as TypedArray).length) return false;

      // Use fast native comparison for TypedArrays
      if (a instanceof Uint8Array && b instanceof Uint8Array) {
        for (let i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) return false;
        }
        return true;
      }
      
      // For other typed arrays
      return compare(Array.from(a as any), Array.from(b as any));
    }
    
    // Handle plain objects with circular reference detection
    if (a.constructor === Object && b.constructor === Object) {
      // Check for circular references
      if (visited.has(a)) {
        return visited.get(a) === b;
      }
      
      visited.set(a, b);
      
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      // Quick length check
      if (keysA.length !== keysB.length) return false;
      
      // Sort keys for faster comparison
      keysA.sort();
      keysB.sort();
      
      // Compare keys first (much faster than comparing values)
      for (let i = 0; i < keysA.length; i++) {
        if (keysA[i] !== keysB[i]) return false;
      }
      
      // Compare values
      for (const key of keysA) {
        if (!compare(a[key], b[key])) return false;
      }
      
      return true;
    }
    
    // If we get here, we're dealing with different object types or custom classes
    // First check if the objects have the same constructor
    if (a.constructor !== b.constructor) return false;
    
    // For custom classes, fall back to comparing properties
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!compare(a[key], b[key])) return false;
    }
    
    return true;
  }
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