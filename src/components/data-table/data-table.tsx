"use client";

// ** import types
import type * as React from "react";
import type { ColumnDef, ColumnResizeMode, Row, ExpandedState } from "@tanstack/react-table";
import type { TableConfig } from "./utils/table-config";
import type { CaseFormatConfig } from "./utils/case-utils";
import type { DataTransformFunction, ExportableData } from "./utils/export-utils";

// ** import core packages
import {
  type ColumnSizingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useCallback, useMemo, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";

// ** import components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTablePagination } from "./pagination";
import { DataTableToolbar } from "./toolbar";
import { DataTableResizer } from "./data-table-resizer";

// ** import utils
import { cn } from "@/lib/utils";
import { useTableConfig } from "./utils/table-config";
import { useTableColumnResize } from "./hooks/use-table-column-resize";
import { preprocessSearch } from "./utils/search";
import {
  createSortingHandler,
  createColumnFiltersHandler,
  createColumnVisibilityHandler,
  createPaginationHandler,
  createColumnSizingHandler,
  createSortingState
} from "./utils/table-state-handlers";
import { createKeyboardNavigationHandler } from "./utils/keyboard-navigation";
import { createConditionalStateHook } from "./utils/conditional-state";
import {
  initializeColumnSizes,
  trackColumnResizing,
  cleanupColumnResizing
} from "./utils/column-sizing";

// Define types for the data fetching function params and result
interface DataFetchParams {
  page: number;
  limit: number;
  search: string;
  from_date: string;
  to_date: string;
  sort_by: string;
  sort_order: string;
}

interface DataFetchResult<TData> {
  success: boolean;
  data: TData[];
  pagination: {
    page: number;
    limit: number;
    total_pages: number;
    total_items: number;
  };
}

// Types for table handlers
type PaginationUpdater<TData> = (prev: { pageIndex: number; pageSize: number }) => { pageIndex: number; pageSize: number };
type SortingUpdater = (prev: { id: string; desc: boolean }[]) => { id: string; desc: boolean }[];
type ColumnOrderUpdater = (prev: string[]) => string[];
type RowSelectionUpdater = (prev: Record<string, boolean>) => Record<string, boolean>;

// Subrows configuration interface
export interface SubRowsConfig<TData> {
  // Enable subrows feature
  enabled: boolean;

  // Rendering mode
  mode: 'same-columns' | 'custom-columns' | 'custom-component';

  // Field name for accessing subrows in data (default: 'subRows')
  subRowsField?: string;

  // For custom-columns mode: different columns for subrows
  subRowColumns?: ColumnDef<TData, unknown>[];
  showSubRowHeaders?: boolean;

  // For custom-component mode: custom component for subrows
  SubRowComponent?: React.ComponentType<{
    row: Row<TData>;
    data: TData;
  }>;

  // Expand icon position
  expandIconPosition?: 'before-checkbox' | 'after-checkbox' | 'first';

  // Hide expand icon when only 1 subrow
  hideExpandIconWhenSingle?: boolean;

  // Auto-expand rows with single subrow
  autoExpandSingle?: boolean;

  // Indentation size for subrows (in pixels)
  indentSize?: number;

  // Default expanded state
  defaultExpanded?: boolean | ExpandedState;
}

interface DataTableProps<TData extends ExportableData, TValue> {
  // Allow overriding the table configuration
  config?: Partial<TableConfig>;

  // Column definitions generator
  getColumns: (handleRowDeselection: ((rowId: string) => void) | null | undefined) => ColumnDef<TData, TValue>[];

  // Data fetching function
  fetchDataFn: ((params: DataFetchParams) => Promise<DataFetchResult<TData>>) | 
               ((page: number, pageSize: number, search: string, dateRange: { from_date: string; to_date: string }, sortBy: string, sortOrder: string, caseConfig?: CaseFormatConfig) => unknown);

  // Function to fetch specific items by their IDs
  fetchByIdsFn?: (ids: number[] | string[]) => Promise<TData[]>;

  // Export configuration
  exportConfig: {
    entityName: string;
    columnMapping: Record<string, string>;
    columnWidths: Array<{ wch: number }>;
    headers: string[];
    caseConfig?: CaseFormatConfig;
    transformFunction?: DataTransformFunction<TData>;
    // Enable/disable export formats (both enabled by default)
    enableCsv?: boolean;
    enableExcel?: boolean;
    // Subrow export configuration
    subRowExportConfig?: {
      entityName: string;
      columnMapping: Record<string, string>;
      columnWidths: Array<{ wch: number }>;
      headers: string[];
      transformFunction?: DataTransformFunction<TData>;
    };
  };

  // ID field in TData for tracking selected items
  idField: keyof TData;

  // Custom page size options
  pageSizeOptions?: number[];

  // Custom toolbar content render function
  renderToolbarContent?: (props: {
    selectedRows: TData[];
    allSelectedIds: string[];
    totalSelectedCount: number;
    resetSelection: () => void;
  }) => React.ReactNode;

  // Row click callback
  onRowClick?: (rowData: TData, rowIndex: number) => void;

  // Subrows configuration
  subRowsConfig?: SubRowsConfig<TData>;
}

export function DataTable<TData extends ExportableData, TValue>({
  config = {},
  getColumns,
  fetchDataFn,
  fetchByIdsFn,
  exportConfig,
  idField = 'id' as keyof TData,
  pageSizeOptions,
  renderToolbarContent,
  onRowClick,
  subRowsConfig
}: DataTableProps<TData, TValue>) {
  // Load table configuration with any overrides
  const tableConfig = useTableConfig(config);

  // Table ID for localStorage storage - generate a default if not provided
  const tableId = tableConfig.columnResizingTableId || 'data-table-default';

  // Use our custom hook for column resizing
  const { columnSizing, setColumnSizing, resetColumnSizing } = useTableColumnResize(
    tableId,
    tableConfig.enableColumnResizing
  );

  // Create conditional URL state hook based on config
  const useConditionalUrlState = createConditionalStateHook(tableConfig.enableUrlState);

  // States for API parameters using conditional URL state
  const [page, setPage] = useConditionalUrlState("page", 1);
  const [pageSize, setPageSize] = useConditionalUrlState("pageSize", 10);
  const [search, setSearch] = useConditionalUrlState("search", "");
  const [dateRange, setDateRange] = useConditionalUrlState<{ from_date: string; to_date: string }>("dateRange", { from_date: "", to_date: "" });
  const [sortBy, setSortBy] = useConditionalUrlState("sortBy", tableConfig.defaultSortBy || "id");
  const [sortOrder, setSortOrder] = useConditionalUrlState<"asc" | "desc">("sortOrder", tableConfig.defaultSortOrder || "desc");
  const [columnVisibility, setColumnVisibility] = useConditionalUrlState<Record<string, boolean>>("columnVisibility", {});
  const [columnFilters, setColumnFilters] = useConditionalUrlState<Array<{ id: string; value: unknown }>>("columnFilters", []);

  // Internal states
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<{
    data: TData[];
    pagination: {
      page: number;
      limit: number;
      total_pages: number;
      total_items: number;
    };
  } | null>(null);

  // Column order state (managed separately from URL state as it's persisted in localStorage)
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  // Expanded state for subrows
  const [expanded, setExpanded] = useState<ExpandedState>(() => {
    const defaultVal = subRowsConfig?.defaultExpanded;
    if (typeof defaultVal === 'boolean') {
      return defaultVal ? true : {};
    }
    return defaultVal ?? {};
  });

  // PERFORMANCE FIX: Use only one selection state as the source of truth
  // All IDs are stored as strings for consistency
  const [selectedItemIds, setSelectedItemIds] = useState<Record<string, boolean>>({});

  // Convert the sorting from URL to the format TanStack Table expects
  const sorting = useMemo(() => createSortingState(sortBy, sortOrder), [sortBy, sortOrder]);

  // Get current data items - memoize to avoid recalculations
  const dataItems = useMemo(() => data?.data || [], [data?.data]);

  // PERFORMANCE FIX: rowSelection is now directly selectedItemIds (no conversion needed)
  // Since getRowId returns actual IDs, TanStack Table uses IDs as keys
  const rowSelection = selectedItemIds;

  // Calculate total selected items - memoize to avoid recalculation
  const totalSelectedItems = useMemo(() =>
    Object.keys(selectedItemIds).length,
    [selectedItemIds]
  );

  // PERFORMANCE FIX: Optimized row deselection handler
  const handleRowDeselection = useCallback((rowId: string) => {
    // With getRowId, rowId is already the actual item ID (not an index)
    setSelectedItemIds(prev => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  }, []);

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    setSelectedItemIds({});
  }, []);

  // PERFORMANCE FIX: Optimized row selection handler
  const handleRowSelectionChange = useCallback((updaterOrValue: RowSelectionUpdater | Record<string, boolean>) => {
    setSelectedItemIds(prev => {
      // Determine the new row selection value
      const newRowSelection = typeof updaterOrValue === 'function'
        ? updaterOrValue(prev)
        : updaterOrValue;

      // With getRowId, rowIds are actual item IDs (not indices)
      // So we can directly use newRowSelection as selectedItemIds
      return newRowSelection;
    });
  }, []);

  // Get selected items data
  const getSelectedItems = useCallback(async () => {
    // If nothing is selected, return empty array
    if (totalSelectedItems === 0) {
      return [];
    }

    // Get IDs of selected items - determine if they are strings or numbers
    const selectedIdsArray = Object.keys(selectedItemIds);

    // Check if the first item ID is a number to determine the type
    const isNumericIds = dataItems.length > 0 && typeof dataItems[0][idField] === 'number';

    // Find items from current page that are selected
    const itemsInCurrentPage = dataItems.filter(item =>
      selectedItemIds[String(item[idField])]
    );

    // Get IDs of items on current page
    const idsInCurrentPage = itemsInCurrentPage.map(item => String(item[idField]));

    // Find IDs that need to be fetched (not on current page)
    const idsToFetchRaw = selectedIdsArray.filter(id =>
      !idsInCurrentPage.includes(id)
    );

    // Convert IDs to the appropriate type for the fetchByIdsFn
    const idsToFetch = isNumericIds
      ? idsToFetchRaw.map(id => Number.parseInt(id, 10)).filter(id => !Number.isNaN(id))
      : idsToFetchRaw;

    // If all selected items are on current page or we can't fetch by IDs
    if (idsToFetch.length === 0 || !fetchByIdsFn) {
      return itemsInCurrentPage;
    }

    try {
      // Fetch missing items in a single batch - TypeScript will infer the correct type
      const fetchedItems = await fetchByIdsFn(idsToFetch as number[] | string[]);

      // Combine current page items with fetched items
      return [...itemsInCurrentPage, ...fetchedItems];
    } catch (error) {
      console.error("Error fetching selected items:", error);
      return itemsInCurrentPage;
    }
  }, [dataItems, selectedItemIds, totalSelectedItems, fetchByIdsFn, idField]);

  // Get all items on current page
  const getAllItems = useCallback((): TData[] => {
    // Return current page data
    return dataItems;
  }, [dataItems]);

  // Fetch data
  useEffect(() => {
    // Check if the fetchDataFn is a query hook
    const isQueryHook = (fetchDataFn as { isQueryHook?: boolean }).isQueryHook === true;

    if (!isQueryHook) {
      // Create refs to capture the current sort values at the time of fetching
      const currentSortBy = sortBy;
      const currentSortOrder = sortOrder;
      
      const fetchData = async () => {
        try {
          setIsLoading(true);
          
          const result = await (fetchDataFn as (params: DataFetchParams) => Promise<DataFetchResult<TData>>)({
            page,
            limit: pageSize,
            search: preprocessSearch(search),
            from_date: dateRange.from_date,
            to_date: dateRange.to_date,
            sort_by: currentSortBy,
            sort_order: currentSortOrder,
          });
          setData(result);
          setIsError(false);
          setError(null);
        } catch (err) {
          setIsError(true);
          setError(err instanceof Error ? err : new Error("Unknown error"));
          console.error("Error fetching data:", err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [page, pageSize, search, dateRange, sortBy, sortOrder, fetchDataFn]);

  // If fetchDataFn is a React Query hook, call it directly with parameters
  const queryResult = (fetchDataFn as { isQueryHook?: boolean }).isQueryHook === true
    ? (fetchDataFn as (page: number, pageSize: number, search: string, dateRange: { from_date: string; to_date: string }, sortBy: string, sortOrder: string, caseConfig?: CaseFormatConfig) => { 
        isLoading: boolean; 
        isSuccess: boolean; 
        isError: boolean; 
        data?: DataFetchResult<TData>; 
        error?: Error 
      })(
        page, 
        pageSize, 
        search, 
        dateRange, 
        sortBy,
        sortOrder,
        exportConfig.caseConfig
      )
    : null;

  // If using React Query, update state based on query result
  useEffect(() => {
    if (queryResult) {
      setIsLoading(queryResult.isLoading);
      if (queryResult.isSuccess && queryResult.data) {
        setData(queryResult.data);
        setIsError(false);
        setError(null);
      }
      if (queryResult.isError) {
        setIsError(true);
        setError(queryResult.error instanceof Error ? queryResult.error : new Error("Unknown error"));
      }
    }
  }, [queryResult]);

  // Memoized pagination state
  const pagination = useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize,
    }),
    [page, pageSize]
  );

  // Ref for the table container for keyboard navigation
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Get columns with the deselection handler (memoize to avoid recreation on render)
  const columns = useMemo(() => {
    // Only pass deselection handler if row selection is enabled
    return getColumns(tableConfig.enableRowSelection ? handleRowDeselection : null);
  }, [getColumns, handleRowDeselection, tableConfig.enableRowSelection]);

  // Create event handlers using utility functions
  const handleSortingChange = useCallback(
    (updaterOrValue: SortingUpdater | { id: string; desc: boolean }[]) => {
      // Extract the new sorting state
      const newSorting = typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting)
        : updaterOrValue;
      
      if (newSorting.length > 0) {
        const columnId = newSorting[0].id;
        const direction = newSorting[0].desc ? "desc" : "asc";
        // Use Promise.all for batch updates to ensure they're applied together
        Promise.all([
          setSortBy(columnId),
          setSortOrder(direction)
        ]).catch(err => {
          console.error("Failed to update URL sorting params:", err);
        });
      }
    },
    [setSortBy, setSortOrder, sorting]
  );

  const handleColumnFiltersChange = useCallback(
    createColumnFiltersHandler(setColumnFilters),
    []
  );

  const handleColumnVisibilityChange = useCallback(
    createColumnVisibilityHandler(setColumnVisibility),
    []
  );

  const handlePaginationChange = useCallback(
    (updaterOrValue: PaginationUpdater<TData> | { pageIndex: number; pageSize: number }) => {
      // Extract the new pagination state
      const newPagination = typeof updaterOrValue === 'function'
        ? updaterOrValue({ pageIndex: page - 1, pageSize })
        : updaterOrValue;
      
      // Special handling: When page size changes, always reset to page 1
      if (newPagination.pageSize !== pageSize) {
        // First, directly update URL to ensure it's in sync
        const url = new URL(window.location.href);
        url.searchParams.set('pageSize', String(newPagination.pageSize));
        url.searchParams.set('page', '1'); // Always reset to page 1
        window.history.replaceState({}, '', url.toString());
        
        // Then update our state
        setPageSize(newPagination.pageSize);
        setPage(1);
        return;
      }
      
      // Only update page if it's changed - this handles normal page navigation
      if ((newPagination.pageIndex + 1) !== page) {
        const setPagePromise = setPage(newPagination.pageIndex + 1);
        if (setPagePromise && typeof setPagePromise.catch === 'function') {
          setPagePromise.catch(err => {
            console.error("Failed to update page param:", err);
          });
        }
      }
    },
    [page, pageSize, setPage, setPageSize]
  );

  const handleColumnSizingChange = useCallback(
    (updaterOrValue: ColumnSizingState | ((prev: ColumnSizingState) => ColumnSizingState)) => {
      if (typeof updaterOrValue === 'function') {
        setColumnSizing(current => updaterOrValue(current));
      } else {
        setColumnSizing(updaterOrValue);
      }
    },
    [setColumnSizing]
  );

  // Column order change handler
  const handleColumnOrderChange = useCallback((updaterOrValue: ColumnOrderUpdater | string[]) => {
    const newColumnOrder = typeof updaterOrValue === 'function'
      ? updaterOrValue(columnOrder)
      : updaterOrValue;

    setColumnOrder(newColumnOrder);

    // Persist column order to localStorage
    try {
      localStorage.setItem('data-table-column-order', JSON.stringify(newColumnOrder));
    } catch (error) {
      console.error('Failed to save column order to localStorage:', error);
    }
  }, [columnOrder]);

  // Load column order from localStorage on initial render
  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem('data-table-column-order');
      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        // Validate array of strings
        if (Array.isArray(parsedOrder) && parsedOrder.every(item => typeof item === 'string')) {
          setColumnOrder(parsedOrder);
        } else {
          console.warn('Invalid column order format, ignoring');
          localStorage.removeItem('data-table-column-order');
        }
      }
    } catch (error) {
      console.error('Error loading column order:', error);
      localStorage.removeItem('data-table-column-order');
    }
  }, []);

  // Memoize table configuration to prevent unnecessary re-renders
  const tableOptions = useMemo(() => ({
    data: dataItems,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      columnSizing,
      columnOrder,
      ...(subRowsConfig?.enabled && { expanded }),
    },
    columnResizeMode: 'onChange' as ColumnResizeMode,
    onColumnSizingChange: handleColumnSizingChange,
    onColumnOrderChange: handleColumnOrderChange,
    pageCount: data?.pagination.total_pages || 0,
    enableRowSelection: tableConfig.enableRowSelection,
    enableColumnResizing: tableConfig.enableColumnResizing,
    // SUBROW SELECTION: Disable automatic cascading
    // We handle parent-child selection manually in the checkbox handler
    enableSubRowSelection: false,
    // SUBROW ID FIX: Use actual IDs instead of row indices
    // This generates unique IDs for parent and subrow selection tracking
    getRowId: (row: TData, index: number, parent?: Row<TData>) => {
      if (subRowsConfig?.enabled) {
        // For subrows, use the id field from the row data
        // Parent rows use their order/parent ID, subrows use their unique item ID
        return String((row as any)[idField]);
      }
      // Default: use the idField value
      return String((row as any)[idField]);
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onPaginationChange: handlePaginationChange,
    ...(subRowsConfig?.enabled && {
      onExpandedChange: setExpanded,
      getExpandedRowModel: getExpandedRowModel(),
      getSubRows: (row: TData) => (row as any)[subRowsConfig.subRowsField || 'subRows'],
    }),
    getCoreRowModel: getCoreRowModel<TData>(),
    getFilteredRowModel: getFilteredRowModel<TData>(),
    getPaginationRowModel: getPaginationRowModel<TData>(),
    getSortedRowModel: getSortedRowModel<TData>(),
    getFacetedRowModel: getFacetedRowModel<TData>(),
    getFacetedUniqueValues: getFacetedUniqueValues<TData>(),
  }), [
    dataItems,
    columns,
    sorting,
    columnVisibility,
    rowSelection,
    columnFilters,
    pagination,
    columnSizing,
    columnOrder,
    expanded,
    handleColumnSizingChange,
    handleColumnOrderChange,
    data?.pagination.total_pages,
    tableConfig.enableRowSelection,
    tableConfig.enableColumnResizing,
    handleRowSelectionChange,
    handleSortingChange,
    handleColumnFiltersChange,
    handleColumnVisibilityChange,
    handlePaginationChange,
    subRowsConfig,
    idField,
  ]);

  // Set up the table with memoized configuration
  const table = useReactTable<TData>(tableOptions);

  // Row click handler with conflict prevention
  const handleRowClick = useCallback((event: React.MouseEvent, rowData: TData, rowIndex: number) => {
    // Prevent row click if clicking on interactive elements (buttons, links, etc.)
    const target = event.target as HTMLElement;
    const isInteractiveElement = target.closest('button, a, input, select, textarea, [role="button"], [role="link"]');
    
    if (isInteractiveElement) {
      return;
    }

    // Call the onRowClick callback if provided
    onRowClick?.(rowData, rowIndex);
  }, [onRowClick]);

  // Create keyboard navigation handler
  const handleKeyDown = useCallback(
    createKeyboardNavigationHandler(table, onRowClick ? (rowData: TData, rowIndex: number) => {
      // Handle keyboard activation (Enter/Space) for row clicks
      onRowClick(rowData, rowIndex);
    } : undefined),
    [onRowClick]
  );

  // Add an effect to validate page number when page size changes
  useEffect(() => {
    // This effect ensures page is valid after page size changes
    const totalPages = data?.pagination.total_pages || 0;
    
    if (totalPages > 0 && page > totalPages) {
      setPage(1);
    }
  }, [data?.pagination?.total_pages, page, setPage]);

  // Initialize default column sizes when columns are available and no saved sizes exist
  useEffect(() => {
    initializeColumnSizes(columns as ColumnDef<TData, unknown>[], tableId, setColumnSizing);
  }, [columns, tableId, setColumnSizing]);

  // Handle column resizing
  useEffect(() => {
    const isResizingAny =
      table.getHeaderGroups().some(headerGroup =>
        headerGroup.headers.some(header => header.column.getIsResizing())
      );

    trackColumnResizing(isResizingAny);

    // Cleanup on unmount
    return () => {
      cleanupColumnResizing();
    };
  }, [table]);

  // Reset column order
  const resetColumnOrder = useCallback(() => {
    // Reset to empty array (which resets to default order)
    table.setColumnOrder([]);
    setColumnOrder([]);

    // Remove from localStorage
    try {
      localStorage.removeItem('data-table-column-order');
    } catch (error) {
      console.error('Failed to remove column order from localStorage:', error);
    }
  }, [table]);

  // Add synchronization effect to ensure URL is the source of truth
  useEffect(() => {
    // Force the table's sorting state to match URL parameters
    table.setSorting(sorting);
  }, [table, sorting]);

  // Keep pagination in sync with URL parameters
  useEffect(() => {
    // Make sure table pagination state matches URL state
    const tableState = table.getState().pagination;
    if (tableState.pageIndex !== page - 1 || tableState.pageSize !== pageSize) {
      // Avoid unnecessary updates that might cause infinite loops
      if (tableState.pageSize !== pageSize || Math.abs(tableState.pageIndex - (page - 1)) > 0) {
        table.setPagination({
          pageIndex: page - 1,
          pageSize: pageSize
        });
      }
    }
  }, [table, page, pageSize]);

  // Handle error state
  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load data: {error instanceof Error ? error.message : "Unknown error"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {tableConfig.enableToolbar && (
        <DataTableToolbar
          table={table}
          setSearch={setSearch}
          setDateRange={setDateRange}
          totalSelectedItems={totalSelectedItems}
          deleteSelection={clearAllSelections}
          getSelectedItems={getSelectedItems}
          getAllItems={getAllItems}
          config={tableConfig}
          resetColumnSizing={() => {
            resetColumnSizing();
            // Force a small delay and then refresh the UI
            setTimeout(() => {
              window.dispatchEvent(new Event('resize'));
            }, 100);
          }}
          resetColumnOrder={resetColumnOrder}
          entityName={exportConfig.entityName}
          columnMapping={exportConfig.columnMapping}
          columnWidths={exportConfig.columnWidths}
          headers={exportConfig.headers}
          transformFunction={exportConfig.transformFunction}
          customToolbarComponent={renderToolbarContent?.({
            selectedRows: dataItems.filter((item) => selectedItemIds[String(item[idField])]),
            allSelectedIds: Object.keys(selectedItemIds),
            totalSelectedCount: totalSelectedItems,
            resetSelection: clearAllSelections
          })}
        />
      )}

      <div
        ref={tableContainerRef}
        className="overflow-y-auto rounded-md border table-container"
        aria-label="Data table"
        onKeyDown={tableConfig.enableKeyboardNavigation ? handleKeyDown : undefined}
      >
        <Table className={tableConfig.enableColumnResizing ? "resizable-table" : ""}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className="px-2 py-2 relative text-left group/th"
                    key={header.id}
                    colSpan={header.colSpan}
                    scope="col"
                    tabIndex={-1}
                    style={{
                      width: header.getSize(),
                    }}
                    data-column-resizing={header.column.getIsResizing() ? "true" : undefined}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    {tableConfig.enableColumnResizing && header.column.getCanResize() && (
                      <DataTableResizer header={header} table={table} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              // Loading state
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow
                  key={`loading-row-${crypto.randomUUID()}`}
                  tabIndex={-1}
                >
                  {Array.from({ length: columns.length }).map((_, j, array) => (
                    <TableCell
                      key={`skeleton-cell-${crypto.randomUUID()}`}
                      className="px-4 py-2 truncate max-w-0 text-left"
                      tabIndex={-1}
                    >
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              // Data rows
              table.getRowModel().rows.map((row, rowIndex) => {
                const isSubRow = row.depth > 0;
                const indentSize = subRowsConfig?.indentSize || 24;

                // For custom-component mode with subrows
                if (subRowsConfig?.enabled && subRowsConfig.mode === 'custom-component' && isSubRow) {
                  const SubRowComponent = subRowsConfig.SubRowComponent;
                  if (SubRowComponent) {
                    return (
                      <TableRow
                        key={row.id}
                        id={`row-${rowIndex}`}
                        data-row-index={rowIndex}
                        data-depth={row.depth}
                        className={cn(isSubRow && "bg-muted/30")}
                      >
                        <TableCell colSpan={columns.length} className="p-0">
                          <SubRowComponent row={row} data={row.original} />
                        </TableCell>
                      </TableRow>
                    );
                  }
                }

                // For custom-columns mode with subrows - render different columns
                if (subRowsConfig?.enabled && subRowsConfig.mode === 'custom-columns' && isSubRow && subRowsConfig.subRowColumns) {
                  return (
                    <TableRow
                      key={row.id}
                      id={`row-${rowIndex}`}
                      data-row-index={rowIndex}
                      data-depth={row.depth}
                      data-state={row.getIsSelected() ? "selected" : undefined}
                      tabIndex={0}
                      aria-selected={row.getIsSelected()}
                      className={cn(isSubRow && "bg-muted/30")}
                      onClick={(event) => {
                        if (tableConfig.enableClickRowSelect) {
                          row.toggleSelected();
                        }
                        if (onRowClick) {
                          handleRowClick(event, row.original, rowIndex);
                        }
                      }}
                    >
                      {row.getVisibleCells().map((cell, cellIndex) => (
                        <TableCell
                          key={cell.id}
                          className="px-4 py-2 truncate max-w-0 text-left"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                }

                // Default rendering (same-columns mode or parent rows)
                return (
                  <TableRow
                    key={row.id}
                    id={`row-${rowIndex}`}
                    data-row-index={rowIndex}
                    data-depth={row.depth}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    tabIndex={0}
                    aria-selected={row.getIsSelected()}
                    className={cn(isSubRow && "bg-muted/30")}
                    onClick={(event) => {
                      if (tableConfig.enableClickRowSelect) {
                        row.toggleSelected();
                      }
                      if (onRowClick) {
                        handleRowClick(event, row.original, rowIndex);
                      }
                    }}
                    onFocus={(e) => {
                      for (const el of document.querySelectorAll('[data-focused="true"]')) {
                        el.removeAttribute('data-focused');
                      }
                      e.currentTarget.setAttribute('data-focused', 'true');
                    }}
                    style={{
                      cursor: onRowClick ? 'pointer' : undefined
                    }}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <TableCell
                        className="px-4 py-2 truncate max-w-0 text-left"
                        key={cell.id}
                        id={`cell-${rowIndex}-${cellIndex}`}
                        data-cell-index={cellIndex}
                        style={{
                          paddingLeft: isSubRow && cellIndex === 0 ? `${indentSize + 16}px` : undefined
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              // No results
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-left truncate"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {tableConfig.enablePagination && (
        <DataTablePagination
          table={table}
          totalItems={data?.pagination.total_items || 0}
          totalSelectedItems={totalSelectedItems}
          pageSizeOptions={pageSizeOptions || [10, 20, 30, 40, 50]}
          size={tableConfig.size}
        />
      )}
    </div>
  );
}