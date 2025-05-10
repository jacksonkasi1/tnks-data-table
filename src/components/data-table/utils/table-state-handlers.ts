import type { SortingState, ColumnFiltersState, VisibilityState, PaginationState, ColumnSizingState } from "@tanstack/react-table";

type SortingUpdater = (prev: SortingState) => SortingState;
type StatePromise = Promise<URLSearchParams> | undefined;
type SetStateFunction<T> = (value: T | ((prev: T) => T)) => StatePromise;

/**
 * Handler for sorting changes in a data table
 * Ensures that sortBy is updated before sortOrder for proper synchronization
 */
export function createSortingHandler(
  setSortBy: SetStateFunction<string>,
  setSortOrder: SetStateFunction<"asc" | "desc">,
  defaultSortBy = "created_at"
) {
  return (updaterOrValue: SortingState | SortingUpdater): void => {
    // Handle both direct values and updater functions
    const newSorting = typeof updaterOrValue === 'function'
      ? updaterOrValue([])
      : updaterOrValue;
    
    // Only update if there's a valid sorting instruction
    if (newSorting.length > 0) {
      const columnId = newSorting[0].id;
      const direction = newSorting[0].desc ? "desc" : "asc";
      
      // Important: Sequential updates to ensure proper synchronization
      // First update the column id
      const sortByResult = setSortBy(columnId);
      
      if (sortByResult instanceof Promise) {
        // If using URL state (Promise-based), chain the updates
        sortByResult.then(() => {
          // Then set the sort direction
          setSortOrder(direction);
        });
      } else {
        // If using regular state (non-Promise), just update sequentially
        setSortOrder(direction);
      }
    }
    // Don't reset to defaults when sort is explicitly cleared
    // This prevents overriding user selections with default values
  };
}

/**
 * Handler for column filters changes in a data table
 */
export function createColumnFiltersHandler(
  setColumnFilters: SetStateFunction<ColumnFiltersState>
) {
  return (updaterOrValue: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState)) => {
    // Pass through to setColumnFilters (which handles updater functions)
    setColumnFilters(updaterOrValue);
  };
}

/**
 * Handler for column visibility changes in a data table
 */
export function createColumnVisibilityHandler(
  setColumnVisibility: SetStateFunction<VisibilityState>
) {
  return (updaterOrValue: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => {
    // Pass through to setColumnVisibility (which handles updater functions)
    setColumnVisibility(updaterOrValue);
  };
}

/**
 * Handler for pagination changes in a data table
 */
export function createPaginationHandler(
  setPage: SetStateFunction<number>,
  setPageSize: SetStateFunction<number>,
  currentPage: number,
  currentPageSize: number
) {
  return (updaterOrValue: PaginationState | ((prev: PaginationState) => PaginationState)) => {
    // Handle both direct values and updater functions
    const newPagination = typeof updaterOrValue === 'function'
      ? updaterOrValue({ pageIndex: currentPage - 1, pageSize: currentPageSize })
      : updaterOrValue;
    
    setPage(newPagination.pageIndex + 1);
    setPageSize(newPagination.pageSize);
  };
}

/**
 * Handler for column sizing changes in a data table
 */
export function createColumnSizingHandler(
  setColumnSizing: SetStateFunction<ColumnSizingState>,
  columnSizing: ColumnSizingState
) {
  return (updaterOrValue: ColumnSizingState | ((prev: ColumnSizingState) => ColumnSizingState)) => {
    // Handle both direct values and updater functions
    const newSizing = typeof updaterOrValue === 'function'
      ? updaterOrValue(columnSizing)
      : updaterOrValue;
    setColumnSizing(newSizing);
  };
}

/**
 * Convert URL sorting parameters to TanStack Table SortingState
 */
export function createSortingState(
  sortBy?: string, 
  sortOrder?: "asc" | "desc"
): SortingState {
  return sortBy && sortOrder
    ? [{ id: sortBy, desc: sortOrder === "desc" }]
    : [];
} 