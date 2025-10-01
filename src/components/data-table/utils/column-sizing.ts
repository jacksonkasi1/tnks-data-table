// ** import types
import type { ColumnDef } from "@tanstack/react-table";

/**
 * Type guard to check if column has id and size
 */
function hasIdAndSize<TData>(
  column: ColumnDef<TData, unknown>
): column is ColumnDef<TData, unknown> & { id: string; size: number } {
  return (
    'id' in column &&
    typeof column.id === 'string' &&
    'size' in column &&
    typeof column.size === 'number'
  );
}

/**
 * Type guard to check if column has accessorKey and size
 */
function hasAccessorKeyAndSize<TData>(
  column: ColumnDef<TData, unknown>
): column is ColumnDef<TData, unknown> & { accessorKey: string; size: number } {
  return (
    'accessorKey' in column &&
    typeof column.accessorKey === 'string' &&
    'size' in column &&
    typeof column.size === 'number'
  );
}

/**
 * Extract default column sizes from column definitions
 */
export function extractDefaultColumnSizes<TData>(
  columns: ColumnDef<TData, unknown>[]
): Record<string, number> {
  const defaultSizing: Record<string, number> = {};

  columns.forEach((column) => {
    if (hasIdAndSize(column)) {
      defaultSizing[column.id] = column.size;
    } else if (hasAccessorKeyAndSize(column)) {
      defaultSizing[column.accessorKey] = column.size;
    }
  });

  return defaultSizing;
}

/**
 * Validate parsed column sizing object
 */
function isValidColumnSizing(value: unknown): value is Record<string, number> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return Object.values(value as Record<string, unknown>).every(
    (size) =>
      typeof size === 'number' && !Number.isNaN(size) && size > 0
  );
}

/**
 * Initialize column sizes from localStorage or defaults
 */
export function initializeColumnSizes<TData>(
  columns: ColumnDef<TData, unknown>[],
  tableId: string,
  setColumnSizing: (sizes: Record<string, number>) => void
): void {
  // Only proceed if we have columns to work with
  if (columns.length === 0) return;

  // Extract default sizes from column definitions
  const defaultSizing = extractDefaultColumnSizes(columns);

  // Only set if we have sizes to apply
  if (Object.keys(defaultSizing).length === 0) return;

  // Check localStorage first
  try {
    const savedSizing = localStorage.getItem(`table-column-sizing-${tableId}`);
    if (!savedSizing) {
      // Only apply defaults if no saved sizing exists
      setColumnSizing(defaultSizing);
    } else {
      // Parse saved sizing
      const parsedSizing = JSON.parse(savedSizing);

      // Validate the parsed sizing
      if (isValidColumnSizing(parsedSizing)) {
        setColumnSizing(parsedSizing);
      } else {
        console.warn('Invalid column sizing format in localStorage, using defaults');
        setColumnSizing(defaultSizing);
      }
    }
  } catch (error) {
    // If localStorage fails, apply defaults
    console.warn('Failed to load saved column sizes. Using defaults.', error);
    setColumnSizing(defaultSizing);
  }
}

/**
 * Track column resizing state in document body for styling purposes
 */
export function trackColumnResizing(
  isResizing: boolean,
  attribute = 'data-resizing'
): void {
  if (isResizing) {
    document.body.setAttribute(attribute, 'true');
  } else {
    document.body.removeAttribute(attribute);
  }
}

/**
 * Clean up column resizing tracking when component unmounts
 */
export function cleanupColumnResizing(
  attribute = 'data-resizing'
): void {
  document.body.removeAttribute(attribute);
} 