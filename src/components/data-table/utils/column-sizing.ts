import { ColumnDef } from "@tanstack/react-table";

/**
 * Extract default column sizes from column definitions
 */
export function extractDefaultColumnSizes<TData>(
  columns: ColumnDef<TData, any>[]
): Record<string, number> {
  const defaultSizing: Record<string, number> = {};
  
  columns.forEach(column => {
    if ('id' in column && column.id && 'size' in column && typeof column.size === 'number') {
      defaultSizing[column.id] = column.size;
    } else if ('accessorKey' in column && typeof column.accessorKey === 'string' && 'size' in column && typeof column.size === 'number') {
      defaultSizing[column.accessorKey] = column.size;
    }
  });
  
  return defaultSizing;
}

/**
 * Initialize column sizes from localStorage or defaults
 */
export function initializeColumnSizes<TData>(
  columns: ColumnDef<TData, any>[],
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
      
      // Apply saved sizing
      setColumnSizing(parsedSizing);
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