import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { isDeepEqual } from "./deep-utils";

// Flag to track if we're currently in a batch update
let isInBatchUpdate = false;

// Used to prevent multiple URL state hooks from trampling over each other
const pendingUpdates = new Map<string, unknown>();

// Track the last URL update to ensure it's properly applied
const lastUrlUpdate = {
  timestamp: 0,
  params: new URLSearchParams(),
};

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

  // Add a reference to track the last value we updated to
  const lastSetValue = useRef<T>(defaultValue);

  // Custom serialization/deserialization functions
  const serialize =
    options.serialize ||
    ((value: T) =>
      typeof value === "object" ? JSON.stringify(value) : String(value));

  const deserialize =
    options.deserialize ||
    ((value: string) => {
      try {
        if (typeof defaultValue === "number") {
          const num = Number(value);
          // Check if the parsed value is a valid number
          if (Number.isNaN(num)) return defaultValue;
          return num as unknown as T;
        }

        if (typeof defaultValue === "boolean") {
          return (value === "true") as unknown as T;
        }

        if (typeof defaultValue === "object") {
          try {
            const parsed = JSON.parse(value) as T;
            // Validate the structure matches what we expect
            if (parsed && typeof parsed === "object") {
              // For dateRange, check if it has the expected properties
              if (key === "dateRange") {
                const dateRange = parsed as {
                  from_date?: string;
                  to_date?: string;
                };
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
    // Check if we have a pending update for this key that hasn't been applied yet
    if (pendingUpdates.has(key)) {
      return pendingUpdates.get(key) as T;
    }

    const paramValue = searchParams.get(key);
    if (paramValue === null) {
      return defaultValue;
    }

    // Special handling for search parameter to decode URL-encoded spaces
    if (key === "search" && typeof defaultValue === "string") {
      return decodeURIComponent(paramValue) as unknown as T;
    }

    return deserialize(paramValue);
  }, [searchParams, key, deserialize, defaultValue]);

  // State to store the current value
  const [value, setValue] = useState<T>(getValueFromUrl);

  // Track the previous search params to avoid unnecessary updates
  const prevSearchParamsRef = useRef<URLSearchParams | null>(null);

  // Deep compare objects/arrays before updating state
  const areEqual = useMemo(() => {
    return (a: T, b: T): boolean => {
      if (typeof a === "object" && typeof b === "object") {
        return isDeepEqual(a, b);
      }
      return a === b;
    };
  }, []);

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

    // Check if this is a value we just set ourselves
    if (
      !areEqual(value, newValue) &&
      !areEqual(lastSetValue.current, newValue)
    ) {
      setValue(newValue);
      lastSetValue.current = newValue;
    } else if (
      pendingUpdates.has(key) &&
      areEqual(pendingUpdates.get(key) as T, newValue)
    ) {
      // If our pending update has been applied, we can remove it from the map
      pendingUpdates.delete(key);
    }
  }, [searchParams, getValueFromUrl, key, value, areEqual]);

  // Synchronously update URL now instead of waiting
  const updateUrlNow = useCallback(
    (params: URLSearchParams) => {
      const now = Date.now();
      lastUrlUpdate.timestamp = now;
      lastUrlUpdate.params = params;

      // Update the URL immediately
      const newParamsString = params.toString();
      router.replace(
        `${pathname}${newParamsString ? `?${newParamsString}` : ""}`
      );

      // Return the params for Promise chaining
      return Promise.resolve(params);
    },
    [router, pathname]
  );

  // Update the URL when the state changes
  const updateValue = useCallback(
    (newValue: T | ((prevValue: T) => T)) => {
      const resolvedValue =
        typeof newValue === "function"
          ? (newValue as (prev: T) => T)(value)
          : newValue;

      // Skip update if value is the same (deep comparison for objects)
      if (areEqual(value, resolvedValue)) {
        return Promise.resolve(new URLSearchParams(searchParams.toString()));
      }

      // Save this value to our ref to prevent overrides
      lastSetValue.current = resolvedValue;

      // Store the value in the pending updates map
      pendingUpdates.set(key, resolvedValue);

      // Set state locally first for immediate UI response
      setValue(resolvedValue);

      // Set flag to prevent recursive updates
      isUpdatingUrl.current = true;

      // Handle pageSize and page relationship - ensure page is reset to 1 when pageSize changes
      if (key === "pageSize") {
        pendingUpdates.set("page", 1); // Reset to page 1 when pageSize changes
      }

      // If we're in a batch update, delay URL change
      if (isInBatchUpdate) {
        return Promise.resolve(new URLSearchParams(searchParams.toString()));
      }

      // Start a batch update to collect multiple URL changes in the current event loop
      isInBatchUpdate = true;

      // Use microtask to batch all URL changes in the current event loop
      return new Promise<URLSearchParams>((resolve) => {
        queueMicrotask(() => {
          const params = new URLSearchParams(searchParams.toString());

          if (areEqual(resolvedValue, defaultValue)) {
            params.delete(key);
          } else {
            // Special handling for search parameter to preserve spaces
            if (key === "search" && typeof resolvedValue === "string") {
              // Use encodeURIComponent to properly encode spaces as %20 instead of +
              params.set(key, encodeURIComponent(resolvedValue));
            } else {
              params.set(key, serialize(resolvedValue));
            }
          }

          // Handle pageSize and page relationship in URL
          if (key === "pageSize" && pendingUpdates.has("page")) {
            params.set("page", "1"); // Reset to page 1 in URL
            pendingUpdates.delete("page"); // Remove from pending updates
          }

          // End the batch update
          isInBatchUpdate = false;

          // Update the URL immediately and resolve
          updateUrlNow(params).then(resolve);
        });
      });
    },
    [
      searchParams,
      key,
      serialize,
      value,
      defaultValue,
      updateUrlNow,
      areEqual
    ]
  );

  return [value, updateValue] as const;
}

// Helper to convert a date object to YYYY-MM-DD format
export function formatDateForUrl(date: Date | undefined): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

// Helper to safely validate and parse date strings from URL
export function validateDateString(dateString: string): boolean {
  if (!dateString) return false;

  // Check if it's in YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  // Check if it's a valid date
  const date = new Date(dateString);
  return !Number.isNaN(date.getTime());
}

// Helper to parse a YYYY-MM-DD string to a Date object
export function parseDateFromUrl(dateString: string): Date | undefined {
  if (!validateDateString(dateString)) return undefined;
  return new Date(dateString);
}
