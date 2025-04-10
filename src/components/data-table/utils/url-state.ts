import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect, useRef } from "react";
import { isDeepEqual } from "./deep-utils";

/**
 * Custom hook for managing URL-based state
 * This provides a simpler approach for storing state in URL params
 */
export function useUrlState<T>(
  key: string,
  defaultValue: T,
  options: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  } = {}
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Use ref to track if we're currently updating URL
  // This prevents recursive updates when router changes trigger effects
  const isUpdatingUrl = useRef(false);
  
  // Custom serialization/deserialization functions
  const serialize = options.serialize || ((value: T) => 
    typeof value === 'object' ? JSON.stringify(value) : String(value)
  );
  
  const deserialize = options.deserialize || ((value: string) => {
    try {
      if (typeof defaultValue === 'number') {
        const num = Number(value);
        // Check if the parsed value is a valid number
        if (isNaN(num)) return defaultValue;
        return num as unknown as T;
      }
      
      if (typeof defaultValue === 'boolean') {
        return (value === 'true') as unknown as T;
      }
      
      if (typeof defaultValue === 'object') {
        try {
          const parsed = JSON.parse(value) as T;
          // Validate the structure matches what we expect
          if (parsed && typeof parsed === 'object') {
            // For dateRange, check if it has the expected properties
            if (key === 'dateRange') {
              const dateRange = parsed as any;
              if (!dateRange.from_date || !dateRange.to_date) {
                console.warn(`Invalid dateRange format in URL: ${value}`);
                return defaultValue;
              }
            }
            return parsed;
          }
          return defaultValue;
        } catch (e) {
          console.warn(`Error parsing JSON from URL parameter ${key}: ${e}`);
          return defaultValue;
        }
      }
      
      return value as unknown as T;
    } catch (e) {
      console.warn(`Error deserializing URL parameter ${key}: ${e}`);
      return defaultValue;
    }
  });
  
  // Get the initial value from URL or use default
  const getValueFromUrl = useCallback(() => {
    const paramValue = searchParams.get(key);
    if (paramValue === null) {
      return defaultValue;
    }
    
    // Special handling for search parameter to decode URL-encoded spaces
    if (key === 'search' && typeof defaultValue === 'string') {
      return decodeURIComponent(paramValue) as unknown as T;
    }
    
    return deserialize(paramValue);
  }, [searchParams, key, deserialize, defaultValue]);
  
  // State to store the current value
  const [value, setValue] = useState<T>(getValueFromUrl);
  
  // Track the previous search params to avoid unnecessary updates
  const prevSearchParamsRef = useRef<URLSearchParams | null>(null);
  
  // Deep compare objects/arrays before updating state
  const areEqual = (a: T, b: T): boolean => {
    if (typeof a === 'object' && typeof b === 'object') {
      return isDeepEqual(a, b);
    }
    return a === b;
  };
  
  // Update state when URL changes, but only if we're not the ones changing it
  useEffect(() => {
    // Skip if we're the ones currently updating the URL
    if (isUpdatingUrl.current) {
      isUpdatingUrl.current = false;
      return;
    }
    
    // Check if searchParams actually changed
    const searchParamsString = searchParams.toString();
    if (
      prevSearchParamsRef.current && 
      prevSearchParamsRef.current.toString() === searchParamsString
    ) {
      return;
    }
    
    // Update the previous search params ref
    const newParams = new URLSearchParams(searchParamsString);
    prevSearchParamsRef.current = newParams;
    
    // Get the new value and update if different
    const newValue = getValueFromUrl();
    if (!areEqual(value, newValue)) {
      setValue(newValue);
    }
  }, [searchParams, getValueFromUrl, value]);
  
  // Update the URL when the state changes (with debounce)
  const updateValue = useCallback((newValue: T | ((prevValue: T) => T)) => {
    const resolvedValue = typeof newValue === 'function' 
      ? (newValue as Function)(value) 
      : newValue;
    
    // Skip update if value is the same (deep comparison for objects)
    if (areEqual(value, resolvedValue)) {
      return;
    }
    
    // Set state locally first
    setValue(resolvedValue);
    
    // Set flag to prevent recursive updates
    isUpdatingUrl.current = true;
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    
    if (areEqual(resolvedValue, defaultValue)) {
      params.delete(key);
    } else {
      // Special handling for search parameter to preserve spaces
      if (key === 'search' && typeof resolvedValue === 'string') {
        // Use encodeURIComponent to properly encode spaces as %20 instead of +
        params.set(key, encodeURIComponent(resolvedValue));
      } else {
        params.set(key, serialize(resolvedValue));
      }
    }
    
    // Only update URL if params actually changed
    const newParamsString = params.toString();
    const currentParamsString = searchParams.toString();
    
    if (newParamsString !== currentParamsString) {
      // Use `replace` to avoid adding to browser history
      router.replace(`${pathname}${newParamsString ? `?${newParamsString}` : ''}`);
    }
  }, [pathname, router, searchParams, key, serialize, value, defaultValue]);
  
  return [value, updateValue] as const;
}

// Helper to convert a date object to YYYY-MM-DD format
export function formatDateForUrl(date: Date | undefined): string {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

// Helper to safely validate and parse date strings from URL
export function validateDateString(dateString: string): boolean {
  if (!dateString) return false;
  
  // Check if it's in YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  // Check if it's a valid date
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

// Helper to parse a YYYY-MM-DD string to a Date object
export function parseDateFromUrl(dateString: string): Date | undefined {
  if (!validateDateString(dateString)) return undefined;
  return new Date(dateString);
}