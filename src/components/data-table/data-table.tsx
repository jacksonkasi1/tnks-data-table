"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
  ColumnResizeMode,
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

import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useTableConfig, TableConfig } from "@/components/data-table/utils/table-config";
import { useTableColumnResize } from "@/components/data-table/hooks/use-table-column-resize";
import { DataTableResizer } from "@/components/data-table/data-table-resizer";

// Import core utilities
import { preprocessSearch } from "@/components/data-table/utils/search";
import { 
  createSortingHandler, 
  createColumnFiltersHandler,
  createColumnVisibilityHandler,
  createPaginationHandler,
  createColumnSizingHandler,
  createSortingState
} from "@/components/data-table/utils/table-state-handlers";
import { createKeyboardNavigationHandler } from "@/components/data-table/utils/keyboard-navigation";
import { createConditionalStateHook } from "@/components/data-table/utils/conditional-state";
import { 
  initializeColumnSizes, 
  trackColumnResizing,
  cleanupColumnResizing
} from "@/components/data-table/utils/column-sizing";

interface DataTableProps<TData, TValue> {
  // Allow overriding the table configuration
  config?: Partial<TableConfig>;
  
  // Column definitions generator
  getColumns: (handleRowDeselection: ((rowId: string) => void) | null | undefined) => ColumnDef<TData, TValue>[];
  
  // Data fetching function
  fetchDataFn: (params: {
    page: number;
    limit: number;
    search: string;
    from_date: string;
    to_date: string;
    sort_by: string;
    sort_order: string;
  }) => Promise<{
    success: boolean;
    data: TData[];
    pagination: {
      page: number;
      limit: number;
      total_pages: number;
      total_items: number;
    };
  }>;
  
  // Function to fetch specific items by their IDs
  fetchByIdsFn?: (ids: number[]) => Promise<TData[]>;
  
  // Export configuration
  exportConfig: {
    entityName: string;
    columnMapping: Record<string, string>;
    columnWidths: Array<{ wch: number }>;
    headers: string[];
  };
  
  // ID field in TData for tracking selected items
  idField: keyof TData;
}

export function DataTable<TData, TValue>({
  config = {},
  getColumns,
  fetchDataFn,
  fetchByIdsFn,
  exportConfig,
  idField = 'id' as keyof TData
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
  const [columnFilters, setColumnFilters] = useConditionalUrlState<Array<{ id: string; value: any }>>("columnFilters", []);

  // Internal states
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<{
    data: TData[];
    pagination: {
      page: number;
      limit: number;
      total_pages: number;
      total_items: number;
    };
  } | null>(null);
  
  // Selection states
  const [selectedIds, setSelectedIds] = useState<Record<string | number, boolean>>({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Convert the sorting from URL to the format TanStack Table expects
  const sorting = createSortingState(sortBy, sortOrder);

  // Ref for the table container for keyboard navigation
  const tableContainerRef = useRef<HTMLDivElement>(null!);
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await fetchDataFn({
          page,
          limit: pageSize,
          search: preprocessSearch(search),
          from_date: dateRange.from_date,
          to_date: dateRange.to_date,
          sort_by: sortBy,
          sort_order: sortOrder,
        });
        setData(result);
        setIsError(false);
        setError(null);
      } catch (err) {
        setIsError(true);
        setError(err);
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page, pageSize, search, dateRange, sortBy, sortOrder, fetchDataFn]);

  // Calculate total selected items
  const totalSelectedItems = Object.keys(selectedIds).length;

  // Handle row deselection
  const handleRowDeselection = useCallback((rowId: string) => {
    if (data?.data) {
      const rowIndex = parseInt(rowId, 10);
      const item = data.data[rowIndex];
      
      if (item) {
        const itemId = String(item[idField]);
        
        // Remove from selectedIds
        const newSelectedIds = { ...selectedIds };
        delete newSelectedIds[itemId];
        setSelectedIds(newSelectedIds);
        
        // Update rowSelection
        const newRowSelection = { ...rowSelection } as Record<string, boolean>;
        delete newRowSelection[rowId];
        setRowSelection(newRowSelection);
      }
    }
  }, [data?.data, selectedIds, rowSelection, idField]);

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    setSelectedIds({});
    setRowSelection({});
  }, []);

  // Handle row selection changes
  const handleRowSelectionChange = useCallback((updaterOrValue: any) => {
    // Handle both direct values and updater functions
    const newSelection = typeof updaterOrValue === 'function'
      ? updaterOrValue(rowSelection)
      : updaterOrValue;
    
    // Update the UI-level selection state
    setRowSelection(newSelection);
    
    // For every row that's selected, we need to add its ID to our selectedIds object
    const updatedSelectedIds = { ...selectedIds };
    
    // Process current page selections
    if (data?.data) {
      Object.keys(newSelection).forEach(rowId => {
        const rowIndex = parseInt(rowId, 10);
        const item = data.data[rowIndex];
        
        if (item) {
          const itemId = String(item[idField]);
          if (newSelection[rowId]) {
            // Row is selected, add to selectedIds
            updatedSelectedIds[itemId] = true;
          } else {
            // Row is deselected, remove from selectedIds
            delete updatedSelectedIds[itemId];
          }
        }
      });
      
      // Find rows that are no longer selected
      data.data.forEach((item, index) => {
        const rowId = String(index);
        const itemId = String(item[idField]);
        
        if (!newSelection[rowId] && selectedIds[itemId]) {
          // This row was previously selected but isn't anymore
          delete updatedSelectedIds[itemId];
        }
      });
    }
    
    setSelectedIds(updatedSelectedIds);
  }, [data?.data, selectedIds, rowSelection, idField]);

  // Get selected items data
  const getSelectedItems = useCallback(async () => {
    // If nothing is selected, return empty array
    if (totalSelectedItems === 0 || Object.keys(selectedIds).length === 0) {
      return [];
    }
    
    // Get array of selected IDs from the selection object
    const selectedIdsArray = Object.keys(selectedIds).map(id => 
      typeof id === 'string' ? parseInt(id, 10) : id as number
    );
    
    // First, get items from the current page that are selected
    const itemsInCurrentPage = data?.data.filter(item => 
      selectedIds[String(item[idField])]
    ) || [];
    
    const idsInCurrentPage = itemsInCurrentPage.map(item => 
      item[idField] as unknown as number
    );
    
    // Find which IDs need to be fetched from the server
    const idsToFetch = selectedIdsArray.filter(id => 
      !idsInCurrentPage.some(currentId => 
        currentId === id
      )
    );
    
    if (idsToFetch.length === 0 || !fetchByIdsFn) {
      // All selected items are on the current page or we can't fetch by IDs
      return itemsInCurrentPage;
    }
    
    try {
      // Fetch data for all missing items in a single batch
      const fetchedItems = await fetchByIdsFn(idsToFetch);
      
      // Combine current page items with fetched items, ensuring no duplicates
      const allSelectedItems = [...itemsInCurrentPage];
      
      // Add fetched items, avoiding duplicates
      fetchedItems.forEach(fetchedItem => {
        const fetchedId = fetchedItem[idField] as unknown as number | string;
        
        // Check if this item is already in our results
        const exists = allSelectedItems.some(existingItem => 
          existingItem[idField] === fetchedId
        );
        
        if (!exists) {
          allSelectedItems.push(fetchedItem);
        }
      });
      
      return allSelectedItems;
      
    } catch (error) {
      console.error("Error fetching selected items:", error);
      return itemsInCurrentPage;
    }
  }, [data?.data, selectedIds, totalSelectedItems, fetchByIdsFn, idField]);

  // Get all items on current page
  const getAllItems = useCallback((): TData[] => {
    // Return current page data
    return data?.data || [];
  }, [data?.data]);

  // Memoize data to ensure stable reference
  const tableData = useMemo(() => data?.data || [], [data?.data]);
  
  // Memoized pagination state
  const pagination = useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize,
    }),
    [page, pageSize]
  );

  // Get columns with the deselection handler (memoize to avoid recreation on render)
  const columns = useMemo(() => {
    // If row selection is disabled, pass null as the handler which will hide the checkbox column
    return getColumns(tableConfig.enableRowSelection ? handleRowDeselection : null);
  }, [getColumns, handleRowDeselection, tableConfig.enableRowSelection]);

  // Create event handlers using utility functions
  const handleSortingChange = useCallback(
    createSortingHandler(setSortBy, setSortOrder), 
    [setSortBy, setSortOrder]
  );

  const handleColumnFiltersChange = useCallback(
    createColumnFiltersHandler(setColumnFilters),
    [setColumnFilters]
  );

  const handleColumnVisibilityChange = useCallback(
    createColumnVisibilityHandler(setColumnVisibility),
    [setColumnVisibility]
  );

  const handlePaginationChange = useCallback(
    createPaginationHandler(setPage, setPageSize, page, pageSize),
    [setPage, setPageSize, page, pageSize]
  );

  const handleColumnSizingChange = useCallback(
    createColumnSizingHandler(setColumnSizing, columnSizing),
    [columnSizing, setColumnSizing]
  );

  // When data loads, sync rowSelection with selected user IDs
  useEffect(() => {
    if (data?.data) {
      const newRowSelection: Record<string, boolean> = {};
      
      // Map the current page's rows to their selection state
      data.data.forEach((item, index) => {
        const itemId = String(item[idField]);
        if (selectedIds[itemId]) {
          newRowSelection[index] = true;
        }
      });
      
      // Only update if there's an actual change to prevent infinite loops
      if (JSON.stringify(newRowSelection) !== JSON.stringify(rowSelection)) {
        setRowSelection(newRowSelection);
      }
    }
  }, [data?.data, selectedIds, idField, rowSelection]);

  // Set up the table
  const table = useReactTable<TData>({
    data: tableData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      columnSizing,
    },
    columnResizeMode: 'onChange' as ColumnResizeMode,
    onColumnSizingChange: handleColumnSizingChange,
    pageCount: data?.pagination.total_pages || 0,
    enableRowSelection: tableConfig.enableRowSelection,
    enableColumnResizing: tableConfig.enableColumnResizing,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Create keyboard navigation handler
  const handleKeyDown = useCallback(
    createKeyboardNavigationHandler(table, (row, rowIndex) => {
      console.log(`Row ${rowIndex} activated`, row);
      // Example: Navigate to detail page or open modal with the row data
      // window.location.href = `/users/${row.id}`;
    }),
    [table]
  );

  // Initialize default column sizes when columns are available and no saved sizes exist
  useEffect(() => {
    initializeColumnSizes(columns, tableId, setColumnSizing);
  }, [columns, tableId, setColumnSizing]);

  // Update to use data attribute instead of class for better performance
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
          entityName={exportConfig.entityName}
          columnMapping={exportConfig.columnMapping}
          columnWidths={exportConfig.columnWidths}
          headers={exportConfig.headers}
        />
      )}
      
      <div 
        ref={tableContainerRef} 
        className="overflow-y-auto rounded-md border table-container" 
        role="grid"
        tabIndex={0}
        aria-label="Data table"
        onKeyDown={tableConfig.enableKeyboardNavigation ? handleKeyDown : undefined}
      >
        <Table className={tableConfig.enableColumnResizing ? "resizable-table" : ""}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow 
                key={headerGroup.id}
                role="row"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className="px-4 py-2 group/th relative"
                    key={header.id}
                    colSpan={header.colSpan}
                    role="columnheader"
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
                  key={`skeleton-${i}`}
                  role="row"
                  tabIndex={-1}
                >
                  {Array.from({ length: columns.length }).map((_, j) => (
                    <TableCell 
                      key={`skeleton-cell-${j}`} 
                      className="px-4 py-2"
                      role="gridcell"
                      tabIndex={-1}
                    >
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              // Data rows
              table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  id={`row-${rowIndex}`}
                  data-row-index={rowIndex}
                  data-state={row.getIsSelected() && "selected"}
                  tabIndex={0}
                  role="row"
                  aria-selected={row.getIsSelected()}
                  onClick={tableConfig.enableClickRowSelect ? () => row.toggleSelected() : undefined}
                  onFocus={(e) => {
                    // Add a data attribute to the currently focused row
                    // Remove it from all other rows first
                    document.querySelectorAll('[data-focused="true"]')
                      .forEach(el => el.removeAttribute('data-focused'));
                    e.currentTarget.setAttribute('data-focused', 'true');
                  }}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => (
                    <TableCell 
                      className="px-4 py-2" 
                      key={cell.id}
                      id={`cell-${rowIndex}-${cellIndex}`}
                      data-cell-index={cellIndex}
                      role="gridcell"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // No results
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
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
        />
      )}
    </div>
  );
}