"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ColumnSizingState } from "@tanstack/react-table";

// Debounce function to limit expensive operations
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook to manage table column sizing with localStorage persistence
 * and optimized performance
 * 
 * @param tableId Unique identifier for the table
 * @param enableResizing Whether column resizing is enabled
 * @returns An object with column sizing state and setter
 */
export function useTableColumnResize(
  tableId: string,
  enableResizing: boolean = false
) {
  // Column sizing state
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  
  // Track if initial load from localStorage is complete
  const initialLoadComplete = useRef(false);

  // Track if sizes have been changed by user (to avoid overwriting on initial load)
  const userChangedSizes = useRef(false);
  
  // Track the previous state to detect actual changes
  const prevSizingRef = useRef<ColumnSizingState>({});
  
  // Debounce the columnSizing for localStorage operations to improve performance
  const debouncedColumnSizing = useDebounce(columnSizing, 300);

  // Custom setter that marks user changes
  const handleSetColumnSizing = useCallback((newSizing: ColumnSizingState | ((prev: ColumnSizingState) => ColumnSizingState)) => {
    setColumnSizing(prev => {
      const nextState = typeof newSizing === 'function' ? newSizing(prev) : newSizing;
      
      // Check if this is a real user change and not just the initial load
      if (initialLoadComplete.current && 
          JSON.stringify(nextState) !== JSON.stringify(prevSizingRef.current)) {
        userChangedSizes.current = true;
        prevSizingRef.current = nextState;
      }
      
      return nextState;
    });
  }, []);

  // Load saved column sizes from localStorage on mount
  useEffect(() => {
    if (enableResizing && !initialLoadComplete.current) {
      try {
        const savedSizing = localStorage.getItem(`table-column-sizing-${tableId}`);
        if (savedSizing) {
          const parsed = JSON.parse(savedSizing);
          setColumnSizing(parsed);
          prevSizingRef.current = parsed;
        }
      } catch (error) {
        console.warn('Failed to load saved column sizing from localStorage:', error);
      } finally {
        initialLoadComplete.current = true;
      }
    }
  }, [tableId, enableResizing]);

  // Save column sizes to localStorage when they change (debounced)
  useEffect(() => {
    if (enableResizing && initialLoadComplete.current && userChangedSizes.current) {
      try {
        localStorage.setItem(`table-column-sizing-${tableId}`, JSON.stringify(debouncedColumnSizing));
      } catch (error) {
        console.warn('Failed to save column sizing to localStorage:', error);
      }
    }
  }, [debouncedColumnSizing, tableId, enableResizing]);

  // Memoized function to reset column sizes
  const resetColumnSizing = useCallback(() => {
    setColumnSizing({});
    userChangedSizes.current = true;
    prevSizingRef.current = {};

    if (enableResizing) {
      try {
        localStorage.removeItem(`table-column-sizing-${tableId}`);
      } catch (error) {
        console.warn('Failed to remove column sizing from localStorage:', error);
      }
    }
  }, [enableResizing, tableId]);

  return {
    columnSizing,
    setColumnSizing: handleSetColumnSizing,
    resetColumnSizing,
  };
} 