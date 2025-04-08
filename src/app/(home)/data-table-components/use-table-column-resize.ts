"use client";

import { useState, useEffect } from "react";
import { ColumnSizingState } from "@tanstack/react-table";

/**
 * Custom hook to manage table column sizing with localStorage persistence
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

  // Load saved column sizes from localStorage on mount
  useEffect(() => {
    if (enableResizing) {
      try {
        const savedSizing = localStorage.getItem(`table-column-sizing-${tableId}`);
        if (savedSizing) {
          setColumnSizing(JSON.parse(savedSizing));
        }
      } catch (error) {
        console.warn('Failed to load saved column sizing from localStorage:', error);
      }
    }
  }, [tableId, enableResizing]);

  // Save column sizes to localStorage when they change
  useEffect(() => {
    if (enableResizing && Object.keys(columnSizing).length > 0) {
      try {
        localStorage.setItem(`table-column-sizing-${tableId}`, JSON.stringify(columnSizing));
      } catch (error) {
        console.warn('Failed to save column sizing to localStorage:', error);
      }
    }
  }, [columnSizing, tableId, enableResizing]);

  // Helper function to reset column sizes to default
  const resetColumnSizing = () => {
    setColumnSizing({});
    if (enableResizing) {
      try {
        localStorage.removeItem(`table-column-sizing-${tableId}`);
      } catch (error) {
        console.warn('Failed to remove column sizing from localStorage:', error);
      }
    }
  };

  return {
    columnSizing,
    setColumnSizing,
    resetColumnSizing,
  };
} 