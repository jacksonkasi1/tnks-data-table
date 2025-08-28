"use client";

import type * as React from "react";
import {
  type ColumnSizingState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnResizeMode,
  type ExpandedState
} from "@tanstack/react-table";
import { useEffect, useCallback, useMemo, useRef, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./pagination";
import { DataTableToolbar } from "./toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useTableConfig, type TableConfig } from "./utils/table-config";
import type { CaseFormatConfig } from "./utils/case-utils";
import type { DataTransformFunction, ExportableData } from "./utils/export-utils";
import { useTableColumnResize } from "./hooks/use-table-column-resize";
import { DataTableResizer } from "./data-table-resizer";
import { withExpandingColumn } from "./utils/expanding-utils";
import { 
  type SimpleSubRowConfig, 
  useSimpleSubRows,
  flattenHierarchicalData 
} from "./utils/simple-sub-rows";

// Import core utilities
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

interface DataTableProps<TData extends ExportableData, TValue> {
  // Allow overriding the table configuration
  config?: Partial<TableConfig>;

  // Column definitions generator
  getColumns: (handleRowDeselection: ((rowId: string) => void) | null | undefined, subRowIndentPx?: number) => ColumnDef<TData, TValue>[];

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
    subRowsConfig?: import('./utils/export-utils').SubRowsExportConfig;
  };

  // ID field in TData for tracking selected items
  idField: keyof TData;

  // Custom row ID generator for hierarchical data
  getRowId?: (originalRow: TData, index: number, parent?: import('@tanstack/react-table').Row<TData>) => string;

  // Custom page size options
  pageSizeOptions?: number[];

  // Custom toolbar content render function
  renderToolbarContent?: (props: {
    selectedRows: TData[];
    allSelectedIds: (string | number)[];
    totalSelectedCount: number;
    resetSelection: () => void;
  }) => React.ReactNode;

  // Row click callback
  onRowClick?: (rowData: TData, rowIndex: number) => void;

  // Simplified sub-rows configuration
  subRowsConfig?: SimpleSubRowConfig<TData> | ((row: TData) => TData[] | undefined);
  
  // Legacy sub-rows configuration (deprecated, use subRowsConfig instead)
  getSubRows?: (row: TData) => TData[] | undefined;
  getRowCanExpand?: (row: { original: TData }) => boolean;
  
  // Default expanded state for rows
  defaultExpanded?: Record<string, boolean>;
}

export function DataTable<TData extends ExportableData, TValue>({
  config = {},
  getColumns,
  fetchDataFn,
  fetchByIdsFn,
  exportConfig,
  idField = 'id' as keyof TData,
  getRowId,
  pageSizeOptions,
  renderToolbarContent,
  onRowClick,
  subRowsConfig,
  getSubRows: legacyGetSubRows,
  getRowCanExpand: legacyGetRowCanExpand,
  defaultExpanded = {}
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
  const [sortBy, setSortBy] = useConditionalUrlState("sortBy", "created_at");
  const [sortOrder, setSortOrder] = useConditionalUrlState<"asc" | "desc">("sortOrder", "desc");
  const [columnVisibility, setColumnVisibility] = useConditionalUrlState<Record<string, boolean>>("columnVisibility", {});
  const [columnFilters, setColumnFilters] = useConditionalUrlState<Array<{ id: string; value: unknown }>>("columnFilters", []);
  const [expanded, setExpanded] = useConditionalUrlState<ExpandedState>("expanded", defaultExpanded);

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

  // PERFORMANCE FIX: Use only one selection state as the source of truth
  const [selectedItemIds, setSelectedItemIds] = useState<Record<string | number, boolean>>({});

  // Convert the sorting from URL to the format TanStack Table expects
  const sorting = useMemo(() => createSortingState(sortBy, sortOrder), [sortBy, sortOrder]);

  // Get current data items - memoize to avoid recalculations
  const dataItems = useMemo(() => {
    const items = data?.data || [];
    console.log('📊 Raw dataItems:', items.length, items[0] ? 'First item has subRows:' + !!items[0].subRows : 'No items');
    
    // TEMP: Debug the actual structure
    if (items.length > 0) {
      console.log('🔍 First item structure:', JSON.stringify(items[0], null, 2));
      console.log('🔍 First item subRows:', items[0].subRows);
    }
    
    return items;
  }, [data?.data]);

  // PERFORMANCE FIX: Derive rowSelection from selectedItemIds using memoization
  const rowSelection = useMemo(() => {
    if (!dataItems.length) return {};

    // Map selectedItemIds to row indices for the table
    const selection: Record<string, boolean> = {};

    dataItems.forEach((item, index) => {
      const itemId = String(item[idField]);
      if (selectedItemIds[itemId]) {
        selection[String(index)] = true;
      }
    });

    return selection;
  }, [dataItems, selectedItemIds, idField]);

  // Calculate total selected items - memoize to avoid recalculation
  const totalSelectedItems = useMemo(() =>
    Object.keys(selectedItemIds).length,
    [selectedItemIds]
  );

  // PERFORMANCE FIX: Optimized row deselection handler
  const handleRowDeselection = useCallback((rowId: string) => {
    if (!dataItems.length) return;

    const rowIndex = Number.parseInt(rowId, 10);
    const item = dataItems[rowIndex];

    if (item) {
      const itemId = String(item[idField]);
      setSelectedItemIds(prev => {
        // Remove this item ID from selection
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    }
  }, [dataItems, idField]);

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    setSelectedItemIds({});
  }, []);

  // PERFORMANCE FIX: Optimized row selection handler
  const handleRowSelectionChange = useCallback((updaterOrValue: RowSelectionUpdater | Record<string, boolean>) => {
    // Determine the new row selection value
    const newRowSelection = typeof updaterOrValue === 'function'
      ? updaterOrValue(rowSelection)
      : updaterOrValue;

    // Batch update selectedItemIds based on the new row selection
    setSelectedItemIds(prev => {
      const next = { ...prev };

      // Process changes for current page
      if (dataItems.length) {
        // First handle explicit selections in newRowSelection
        for (const [rowId, isSelected] of Object.entries(newRowSelection)) {
          const rowIndex = Number.parseInt(rowId, 10);
          if (rowIndex >= 0 && rowIndex < dataItems.length) {
            const item = dataItems[rowIndex];
            const itemId = String(item[idField]);

            if (isSelected) {
              next[itemId] = true;
            } else {
              delete next[itemId];
            }
          }
        }

        // Then handle implicit deselection (rows that were selected but aren't in newRowSelection)
        dataItems.forEach((item, index) => {
          const itemId = String(item[idField]);
          const rowId = String(index);

          // If item was selected but isn't in new selection, deselect it
          if (prev[itemId] && newRowSelection[rowId] === undefined) {
            delete next[itemId];
          }
        });
      }

      return next;
    });
  }, [dataItems, rowSelection, idField]);

  // Get selected items data
  const getSelectedItems = useCallback(async () => {
    // If nothing is selected, return empty array
    if (totalSelectedItems === 0) {
      return [];
    }

    // Get IDs of selected items
    const selectedIdsArray = Object.keys(selectedItemIds).map(id =>
      typeof id === 'string' ? Number.parseInt(id, 10) : id as number
    );

    // Find items from current page that are selected
    const itemsInCurrentPage = dataItems.filter(item =>
      selectedItemIds[String(item[idField])]
    );

    // Get IDs of items on current page
    const idsInCurrentPage = itemsInCurrentPage.map(item =>
      item[idField] as unknown as number
    );

    // Find IDs that need to be fetched (not on current page)
    const idsToFetch = selectedIdsArray.filter(id =>
      !idsInCurrentPage.includes(id)
    );

    // If all selected items are on current page or we can't fetch by IDs
    if (idsToFetch.length === 0 || !fetchByIdsFn) {
      return itemsInCurrentPage;
    }

    try {
      // Fetch missing items in a single batch
      const fetchedItems = await fetchByIdsFn(idsToFetch);

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

  // Load column order from localStorage on initial render
  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem('data-table-column-order');
      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        setColumnOrder(parsedOrder);
      }
    } catch (error) {
      console.error('Error loading column order:', error);
    }
  }, []);

  // Initialize sub-rows configuration
  const subRows = useMemo(() => {
    // Use new subRowsConfig if provided
    if (subRowsConfig) {
      // If subRowsConfig is a function, convert it to a full config
      if (typeof subRowsConfig === 'function') {
        return useSimpleSubRows({
          getSubRows: subRowsConfig,
          type: 'auto',
          visual: {
            indentSize: tableConfig.subRowIndentPx,
            rowOffsetPx: tableConfig.subRowOffsetPx,
            muteSubRows: true,
          },
        });
      } else {
        // Merge table config values with sub-row config, prioritizing sub-row config
        const mergedConfig = {
          ...subRowsConfig,
          visual: {
            indentSize: tableConfig.subRowIndentPx,
            rowOffsetPx: tableConfig.subRowOffsetPx,
            muteSubRows: true,
            ...subRowsConfig.visual,
          },
        };
        return useSimpleSubRows(mergedConfig);
      }
    }
    // Fall back to legacy props if provided
    if (legacyGetSubRows) {
      return useSimpleSubRows({
        getSubRows: legacyGetSubRows,
        type: 'auto',
        visual: {
          indentSize: tableConfig.subRowIndentPx,
          rowOffsetPx: tableConfig.subRowOffsetPx,
          muteSubRows: true,
        },
      });
    }
    // No sub-rows configuration
    return null;
  }, [subRowsConfig, legacyGetSubRows, tableConfig.subRowIndentPx, tableConfig.subRowOffsetPx]);

  // Get effective sub-row functions
  const effectiveGetSubRows = useMemo(() => {
    const getSubRowsFn = subRows?.getSubRows || legacyGetSubRows;
    console.log('🔧 effectiveGetSubRows created:', !!getSubRowsFn);
    
    // Debug wrapper to see what's being returned
    if (getSubRowsFn) {
      return (row: TData) => {
        const result = getSubRowsFn(row);
        console.log('🔍 getSubRows called for row:', row, 'returned:', result);
        return result;
      };
    }
    return getSubRowsFn;
  }, [subRows, legacyGetSubRows]);

  const effectiveGetRowCanExpand = useMemo(() => {
    const canExpandFn = subRows?.getRowCanExpand || legacyGetRowCanExpand;
    console.log('🔧 effectiveGetRowCanExpand created:', !!canExpandFn);
    return canExpandFn;
  }, [subRows, legacyGetRowCanExpand]);

  // Get columns with the deselection handler and sub-row support (memoize to avoid recreation on render)
  const columns = useMemo(() => {
    // Only pass deselection handler if row selection is enabled
    let processedColumns = getColumns(tableConfig.enableRowSelection ? handleRowDeselection : null);
    
    // Process columns for sub-row support if configured
    if (subRows) {
      processedColumns = subRows.processColumns(processedColumns as ColumnDef<TData>[]) as ColumnDef<TData, TValue>[];
    }
    
    // Add expanding column if expanding is enabled
    return withExpandingColumn(processedColumns, tableConfig.enableExpanding || !!effectiveGetSubRows);
  }, [getColumns, handleRowDeselection, tableConfig.enableRowSelection, tableConfig.enableExpanding, subRows, effectiveGetSubRows]);

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
      expanded,
    },
    columnResizeMode: 'onChange' as ColumnResizeMode,
    onColumnSizingChange: handleColumnSizingChange,
    onColumnOrderChange: handleColumnOrderChange,
    pageCount: data?.pagination.total_pages || 0,
    enableRowSelection: tableConfig.enableRowSelection,
    enableColumnResizing: tableConfig.enableColumnResizing,
    enableExpanding: tableConfig.enableExpanding,
    manualPagination: true, // Server-side pagination
    manualSorting: true,
    manualFiltering: true,
    manualExpanding: false, // Allow TanStack Table to handle expansion client-side
    paginateExpandedRows: false, // CRITICAL: Set to false when using manualPagination
    filterFromLeafRows: tableConfig.filterFromLeafRows,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onPaginationChange: handlePaginationChange,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel<TData>(),
    getFilteredRowModel: getFilteredRowModel<TData>(),
    getSortedRowModel: getSortedRowModel<TData>(),
    getExpandedRowModel: getExpandedRowModel<TData>(),
    getPaginationRowModel: getPaginationRowModel<TData>(),
    getFacetedRowModel: getFacetedRowModel<TData>(),
    getFacetedUniqueValues: getFacetedUniqueValues<TData>(),
    getSubRows: effectiveGetSubRows,
    getRowCanExpand: effectiveGetRowCanExpand,
    getRowId: getRowId,
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
    tableConfig.enableExpanding,
    tableConfig.paginateExpandedRows,
    tableConfig.filterFromLeafRows,
    handleRowSelectionChange,
    handleSortingChange,
    handleColumnFiltersChange,
    handleColumnVisibilityChange,
    handlePaginationChange,
    setExpanded,
    effectiveGetSubRows,
    effectiveGetRowCanExpand,
    getRowId,
  ]);

  // Set up the table with memoized configuration
  const table = useReactTable<TData>(tableOptions);

  // CUSTOM SUB-ROWS SOLUTION: Manually create expanded rows since TanStack's getExpandedRowModel() is broken
  const getManuallyExpandedRows = useCallback(() => {
    const coreRows = table.getCoreRowModel().rows;
    const expandedState = table.getState().expanded;
    
    
    const manualRows: typeof coreRows = [];
    
    coreRows.forEach((row) => {
      // Always add the parent row
      manualRows.push(row);
      
      // Check if this row is expanded
      const isRowExpanded = (expandedState as any)[row.id] || (expandedState as any)[row.index];
      
      if (isRowExpanded && effectiveGetSubRows) {
        const subRows = effectiveGetSubRows(row.original);
        if (subRows && subRows.length > 0) {
          
          // Create sub-row objects manually
          subRows.forEach((subRowData, subIndex) => {
            const subRowId = getRowId ? getRowId(subRowData, subIndex, row) : `${row.id}.${subIndex}`;
            
            // Create a mock row object that mimics TanStack Table's Row structure
            const subRow = {
              ...row, // Copy parent row structure
              id: subRowId,
              index: row.index + subIndex + 1, // Offset index
              original: subRowData,
              depth: 1, // Sub-row depth
              subRows: [], // Sub-rows don't have their own sub-rows for now
              parentId: row.id,
              getIsExpanded: () => false, // Sub-rows can't be expanded in this simple implementation
              getCanExpand: () => false,
              toggleExpanded: () => {},
              getIsSelected: () => {
                // Check if this sub-row is selected based on its ID
                const subRowIdStr = String(subRowData[idField]);
                return !!selectedItemIds[subRowIdStr];
              },
              toggleSelected: () => {
                // Handle sub-row selection
                const subRowIdStr = String(subRowData[idField]);
                setSelectedItemIds(prev => {
                  const next = { ...prev };
                  if (next[subRowIdStr]) {
                    delete next[subRowIdStr];
                  } else {
                    next[subRowIdStr] = true;
                  }
                  return next;
                });
              },
              getVisibleCells: () => {
                // Return cells for the sub-row using the same column structure
                return columns.map((column, cellIndex) => {
                  const cellValue = (() => {
                    if ('accessorKey' in column && typeof column.accessorKey === 'string') {
                      return (subRowData as any)[column.accessorKey];
                    }
                    if ('accessorFn' in column && typeof column.accessorFn === 'function') {
                      return column.accessorFn(subRowData, subIndex);
                    }
                    return undefined;
                  })();

                  const cell = {
                    id: `${subRowId}-${column.id || cellIndex}`,
                    column: {
                      ...column,
                      columnDef: {
                        ...column,
                        cell: column.cell || (({ getValue }) => getValue())
                      }
                    },
                    row: subRow,
                    getValue: () => cellValue,
                    getContext: () => ({
                      table,
                      column: {
                        ...column,
                        columnDef: {
                          ...column,
                          cell: column.cell || (({ getValue }) => getValue())
                        }
                      },
                      row: subRow,
                      cell,
                      getValue: () => cellValue,
                      renderValue: () => cellValue
                    })
                  };

                  return cell;
                });
              }
            } as any; // Type assertion needed due to complex Row type
            
            manualRows.push(subRow);
          });
        }
      }
    });
    
    return manualRows;
  }, [table, expanded, effectiveGetSubRows, getRowId, columns, selectedItemIds, idField, setSelectedItemIds]);

  // Get all items including expanded sub-rows for export
  const getAllItemsWithSubRows = useCallback((): TData[] => {
    // For export, we need to return the original parent data with subRows included
    // The export utilities will handle flattening them based on subRowsConfig
    return dataItems;
  }, [dataItems]);

  // Get the manually expanded rows for rendering
  const renderRows = useMemo(() => getManuallyExpandedRows(), [getManuallyExpandedRows]);

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
    initializeColumnSizes(columns, tableId, setColumnSizing);
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
          getAllItems={getAllItemsWithSubRows}
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
          subRowsConfig={exportConfig.subRowsConfig}
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
            ) : table.getCoreRowModel().rows?.length ? (
              // Data rows - use our MANUAL sub-row rendering since TanStack's getExpandedRowModel() is broken
              renderRows.map((row, rowIndex) => {
                // Calculate row offset based on depth and sub-row configuration
                const rowDepth = row.depth;
                const rowOffset = subRows?.getRowOffsetStyle ? subRows.getRowOffsetStyle(rowDepth) : {};
                
                return (
                <TableRow
                  key={row.id}
                  id={`row-${rowIndex}`}
                  data-row-index={rowIndex}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  tabIndex={0}
                  aria-selected={row.getIsSelected()}
                  onClick={(event) => {
                    // Handle click row select if enabled
                    if (tableConfig.enableClickRowSelect) {
                      row.toggleSelected();
                    }
                    // Handle custom row click callback
                    if (onRowClick) {
                      handleRowClick(event, row.original, rowIndex);
                    }
                  }}
                  onFocus={(e) => {
                    // Add a data attribute to the currently focused row
                    for (const el of document.querySelectorAll('[data-focused="true"]')) {
                      el.removeAttribute('data-focused');
                    }
                    e.currentTarget.setAttribute('data-focused', 'true');
                  }}
                  style={{
                    cursor: onRowClick ? 'pointer' : undefined,
                    ...rowOffset
                  }}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => (
                    <TableCell
                      className="px-4 py-2 truncate max-w-0 text-left"
                      key={cell.id}
                      id={`cell-${rowIndex}-${cellIndex}`}
                      data-cell-index={cellIndex}
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