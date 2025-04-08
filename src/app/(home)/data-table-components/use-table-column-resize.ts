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
  
  // Debounce the columnSizing for localStorage operations to improve performance
  const debouncedColumnSizing = useDebounce(columnSizing, 300);

  // Load saved column sizes from localStorage on mount
  useEffect(() => {
    if (enableResizing && !initialLoadComplete.current) {
      try {
        const savedSizing = localStorage.getItem(`table-column-sizing-${tableId}`);
        if (savedSizing) {
          setColumnSizing(JSON.parse(savedSizing));
        }
        initialLoadComplete.current = true;
      } catch (error) {
        console.warn('Failed to load saved column sizing from localStorage:', error);
        initialLoadComplete.current = true;
      }
    }
  }, [tableId, enableResizing]);

  // Save column sizes to localStorage when they change (debounced)
  useEffect(() => {
    if (enableResizing && initialLoadComplete.current && Object.keys(debouncedColumnSizing).length > 0) {
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
    setColumnSizing,
    resetColumnSizing,
  };
} 