// ** import core packages
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

// ** import utils
import { isDeepEqual } from "./deep-utils";
import { DATA_TABLE_URL_STATE_EVENT } from "./url-events";
import { ensureUrlStateHistoryPatched } from "./history-sync";

function canUseDOM(): boolean {
  return (
    typeof window !== "undefined" && typeof window.location !== "undefined"
  );
}

function getCurrentSearchParams(): URLSearchParams {
  if (!canUseDOM()) return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function replaceCurrentUrlSearchParams(params: URLSearchParams): void {
  if (!canUseDOM()) return;

  // Ensure we get a signal for ANY URL updates (router, other components, etc).
  ensureUrlStateHistoryPatched();

  const newParamsString = params.toString();
  const pathname = window.location.pathname;
  const hash = window.location.hash;
  const nextUrl = `${pathname}${newParamsString ? `?${newParamsString}` : ""}${hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  // Avoid doing work (and triggering re-renders) if the URL would not change.
  if (nextUrl === currentUrl) return;

  window.history.replaceState(window.history.state, "", nextUrl);
}

// Batch update state management with instance tracking to prevent race conditions
interface BatchUpdateState {
  isInBatchUpdate: boolean;
  batchId: number;
  pendingUpdates: Map<string, PendingUpdateEntry>;
}

interface PendingUpdateEntry<T = unknown> {
  value: T;
  defaultValue: T;
  serialize: (value: T) => string;
  areEqual: (a: T, b: T) => boolean;
}

// Global state with proper isolation
const batchUpdateState: BatchUpdateState = {
  isInBatchUpdate: false,
  batchId: 0,
  pendingUpdates: new Map<string, PendingUpdateEntry>(),
};

// Timeout to prevent stuck batch updates
let batchTimeoutId: ReturnType<typeof setTimeout> | null = null;
const BATCH_TIMEOUT = 100; // 100ms timeout for batch updates

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
    enabled?: boolean;
  } = {},
) {
  const enabled = options.enabled ?? true;
  const nextSearchParams = useSearchParams();

  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => {
    if (enabled && nextSearchParams) {
      return new URLSearchParams(nextSearchParams.toString());
    }
    return enabled ? getCurrentSearchParams() : new URLSearchParams();
  });

  // Keep searchParams in sync with Next.js router
  useEffect(() => {
    if (enabled && nextSearchParams) {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(nextSearchParams.toString());
        return prev.toString() === nextParams.toString() ? prev : nextParams;
      });
    }
  }, [enabled, nextSearchParams]);

  // Keep searchParams in sync with the real URL.
  // - popstate: back/forward navigation
  // - DATA_TABLE_URL_STATE_EVENT: our own URL updates
  useEffect(() => {
    if (!enabled || !canUseDOM()) return;

    // Patch once so we observe `pushState`/`replaceState` (e.g. Next router).
    ensureUrlStateHistoryPatched();

    const handleUrlChange = () => {
      const nextParams = getCurrentSearchParams();
      const nextString = nextParams.toString();
      setSearchParams((prev) =>
        prev.toString() === nextString ? prev : nextParams,
      );
    };

    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener(DATA_TABLE_URL_STATE_EVENT, handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener(DATA_TABLE_URL_STATE_EVENT, handleUrlChange);
    };
  }, [enabled]);

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
    if (!enabled) return defaultValue;

    // Check if we have a pending update for this key that hasn't been applied yet
    if (batchUpdateState.pendingUpdates.has(key)) {
      const pendingUpdate = batchUpdateState.pendingUpdates.get(key);
      if (pendingUpdate && typeof pendingUpdate.value !== "undefined") {
        return pendingUpdate.value as T;
      }
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
  }, [enabled, searchParams, key, deserialize, defaultValue]);

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

  // Keep a ref to track the current value to avoid dependency on the state variable
  const currentValueRef = useRef<T>(value);

  // Update currentValueRef whenever value changes
  useEffect(() => {
    currentValueRef.current = value;
  }, [value]);

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
    // Using refs to track state without creating dependencies
    if (
      !areEqual(lastSetValue.current, newValue) &&
      !areEqual(currentValueRef.current, newValue)
    ) {
      // Prevent immediate re-triggering of this effect due to state update
      lastSetValue.current = newValue;
      setValue(newValue);
    } else if (
      batchUpdateState.pendingUpdates.has(key) &&
      areEqual(
        batchUpdateState.pendingUpdates.get(key)?.value as unknown as T,
        newValue,
      )
    ) {
      // If our pending update has been applied, we can remove it from the map
      batchUpdateState.pendingUpdates.delete(key);
    }
  }, [searchParams, getValueFromUrl, key, areEqual]); // No dependency on value

  // Synchronously update URL now instead of waiting
  const updateUrlNow = useCallback(
    (params: URLSearchParams) => {
      if (!enabled) {
        isUpdatingUrl.current = false;
        return Promise.resolve(params);
      }

      // Update the URL immediately (framework-agnostic).
      replaceCurrentUrlSearchParams(params);
      isUpdatingUrl.current = false;

      // Return the params for Promise chaining
      return Promise.resolve(params);
    },
    [enabled],
  );

  // Update the URL when the state changes
  const updateValue = useCallback(
    (newValue: T | ((prevValue: T) => T)) => {
      const resolvedValue =
        typeof newValue === "function"
          ? (newValue as (prev: T) => T)(value)
          : newValue;

      if (!enabled) {
        setValue(resolvedValue);
        return Promise.resolve(new URLSearchParams());
      }

      // Skip update if value is the same (deep comparison for objects)
      if (areEqual(value, resolvedValue)) {
        return Promise.resolve(new URLSearchParams(searchParams.toString()));
      }

      // Save this value to our ref to prevent overrides
      lastSetValue.current = resolvedValue;

      // Store the value, defaultValue, serialize, and areEqual in the pending updates map
      batchUpdateState.pendingUpdates.set(key, {
        value: resolvedValue,
        defaultValue,
        serialize: serialize as (value: unknown) => string,
        areEqual: areEqual as (a: unknown, b: unknown) => boolean,
      });

      // Set state locally first for immediate UI response
      setValue(resolvedValue);

      // Set flag to prevent recursive updates
      isUpdatingUrl.current = true;

      // Handle pageSize and page relationship - ensure page is reset to 1 when pageSize changes
      if (key === "pageSize") {
        // If pageSize changes, "page" should be reset to 1.
        // We need to ensure this "page" entry has appropriate functions.
        // For now, assume standard defaults for "page" if it's not already managed by its own useUrlState.
        // A more robust solution might involve a shared registry or context for URL state configurations.
        const pageEntry: PendingUpdateEntry<number> =
          (batchUpdateState.pendingUpdates.get(
            "page",
          ) as PendingUpdateEntry<number>) || {
            value: 1,
            defaultValue: 1, // Assuming default page is 1
            serialize: (v: number) => String(v),
            areEqual: (a: number, b: number) => a === b,
          };
        batchUpdateState.pendingUpdates.set("page", {
          ...pageEntry,
          value: 1,
        } as PendingUpdateEntry<unknown>);
      }

      // If we're in a batch update, delay URL change
      if (batchUpdateState.isInBatchUpdate) {
        return Promise.resolve(new URLSearchParams(searchParams.toString()));
      }

      // Start a batch update to collect multiple URL changes in the current event loop
      batchUpdateState.isInBatchUpdate = true;
      batchUpdateState.batchId++;
      const currentBatchId = batchUpdateState.batchId;

      // Clear any existing timeout
      if (batchTimeoutId) {
        clearTimeout(batchTimeoutId);
      }

      // Use microtask to batch all URL changes in the current event loop
      return new Promise<URLSearchParams>((resolve) => {
        const processBatch = () => {
          // Check if this batch is still valid (not superseded by a newer batch)
          if (currentBatchId !== batchUpdateState.batchId) {
            return;
          }
          // Start with the current search params as a base - fetch directly from URL
          // to ensure we have the most up-to-date state, especially if other components
          // or resetUrlState have modified the URL synchronously.
          const currentParams = getCurrentSearchParams();
          const params = new URLSearchParams(currentParams.toString());
          let pageSizeChangedInBatch = false;

          // Keep track if any sort parameters are in the current batch
          let sortByInBatch = false;
          let sortOrderInBatch = false;

          // Check if sortBy/sortOrder are already in the URL
          const sortByInURL = params.has("sortBy");
          const defaultSortOrder = "desc"; // Match the default from the component

          // First pass: identify which sort parameters are being updated
          for (const [
            updateKey,
            _,
          ] of batchUpdateState.pendingUpdates.entries()) {
            if (updateKey === "sortBy") sortByInBatch = true;
            if (updateKey === "sortOrder") sortOrderInBatch = true;
          }

          // Iterate over all pending updates and apply them to the params
          for (const [
            updateKey,
            entry,
          ] of batchUpdateState.pendingUpdates.entries()) {
            const {
              value: updateValue,
              defaultValue: entryDefaultValue,
              serialize: entrySerialize,
              areEqual: entryAreEqual,
            } = entry;

            // Special case: Always include sort-related parameters to ensure URL consistency
            if (updateKey === "sortBy") {
              // When setting sortBy, always include it in URL
              params.set(updateKey, entrySerialize(updateValue));

              // If sortOrder isn't being updated in this batch, ensure it's included
              if (!sortOrderInBatch) {
                // Get current sortOrder value from URL or use default
                const currentSortOrder =
                  params.get("sortOrder") || defaultSortOrder;
                params.set("sortOrder", currentSortOrder);
              }
            } else if (updateKey === "sortOrder") {
              // Always include sortOrder when sortBy is present (either in URL or in this batch)
              if (sortByInURL || sortByInBatch) {
                params.set(updateKey, entrySerialize(updateValue));
              } else if (entryAreEqual(updateValue, entryDefaultValue)) {
                params.delete(updateKey);
              } else {
                params.set(updateKey, entrySerialize(updateValue));
              }
            } else if (entryAreEqual(updateValue, entryDefaultValue)) {
              params.delete(updateKey);
            } else {
              // Special handling for search parameter to preserve spaces
              if (updateKey === "search" && typeof updateValue === "string") {
                // Use encodeURIComponent to properly encode spaces as %20 instead of +
                params.set(updateKey, encodeURIComponent(updateValue));
              } else {
                params.set(updateKey, entrySerialize(updateValue));
              }
            }
            if (updateKey === "pageSize") {
              pageSizeChangedInBatch = true;
            }
          }

          // If pageSize was part of this batch update, ensure page is set to 1
          // This handles the case where "page" might have been set to something else
          // in the same batch, but a pageSize change should override it to 1.
          if (pageSizeChangedInBatch) {
            params.set("page", "1");
          }

          // Clear all pending updates as they've been processed
          batchUpdateState.pendingUpdates.clear();

          // End the batch update
          batchUpdateState.isInBatchUpdate = false;

          // Clear the timeout since we're processing now
          if (batchTimeoutId) {
            clearTimeout(batchTimeoutId);
            batchTimeoutId = null;
          }

          // Update the URL immediately and resolve
          updateUrlNow(params).then(resolve);
        };

        // Process batch in microtask
        queueMicrotask(processBatch);

        // Also set a timeout as fallback to prevent stuck batches
        batchTimeoutId = setTimeout(processBatch, BATCH_TIMEOUT);
      });
    },
    [
      enabled,
      searchParams,
      key,
      serialize,
      value,
      defaultValue,
      updateUrlNow,
      areEqual,
    ],
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
