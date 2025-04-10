import { SortingState } from "@tanstack/react-table";

/**
 * Handler for sorting changes in a data table
 */
export function createSortingHandler(
  setSortBy: (value: string) => void,
  setSortOrder: (value: "asc" | "desc") => void,
  defaultSortBy = "created_at"
) {
  return (updaterOrValue: any) => {
    // Handle both direct values and updater functions
    const newSorting = typeof updaterOrValue === 'function'
      ? updaterOrValue([])
      : updaterOrValue;
    
    if (newSorting.length > 0) {
      setSortBy(newSorting[0].id);
      setSortOrder(newSorting[0].desc ? "desc" : "asc");
    } else {
      // Default sorting
      setSortBy(defaultSortBy);
      setSortOrder("desc");
    }
  };
}

/**
 * Handler for column filters changes in a data table
 */
export function createColumnFiltersHandler(
  setColumnFilters: (value: any) => void
) {
  return (updaterOrValue: any) => {
    // Pass through to setColumnFilters (which handles updater functions)
    setColumnFilters(updaterOrValue);
  };
}

/**
 * Handler for column visibility changes in a data table
 */
export function createColumnVisibilityHandler(
  setColumnVisibility: (value: any) => void
) {
  return (updaterOrValue: any) => {
    // Pass through to setColumnVisibility (which handles updater functions)
    setColumnVisibility(updaterOrValue);
  };
}

/**
 * Handler for pagination changes in a data table
 */
export function createPaginationHandler(
  setPage: (value: number) => void,
  setPageSize: (value: number) => void,
  currentPage: number,
  currentPageSize: number
) {
  return (updaterOrValue: any) => {
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
  setColumnSizing: (value: any) => void,
  columnSizing: Record<string, number>
) {
  return (updaterOrValue: any) => {
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