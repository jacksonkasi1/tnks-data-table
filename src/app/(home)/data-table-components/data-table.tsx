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
} from "@tanstack/react-table";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRef } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { fetchUsers, fetchUsersByIds } from "@/api/user/get-users";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { User } from "./schema";
import { getColumns } from "./columns";
import { useUrlState } from "./url-state";
import { useTableConfig, TableConfig } from "./table-config";

interface DataTableProps {
  // Allow overriding the table configuration
  config?: Partial<TableConfig>;
}

export function DataTable({ config = {} }: DataTableProps) {
  // Load table configuration with any overrides
  const tableConfig = useTableConfig(config);
  
  // Create a wrapper for useUrlState that respects the enableUrlState config
  const useConditionalUrlState = <T,>(key: string, defaultValue: T, options = {}) => {
    const [state, setState] = React.useState<T>(defaultValue);
    
    // Only use URL state if enabled in config
    if (tableConfig.enableUrlState) {
      return useUrlState<T>(key, defaultValue, options);
    }
    
    // Otherwise use regular React state
    return [state, setState] as const;
  };
  
  // States for API parameters using conditional URL state
  const [page, setPage] = useConditionalUrlState("page", 1);
  const [pageSize, setPageSize] = useConditionalUrlState("pageSize", 10);
  const [search, setSearch] = useConditionalUrlState("search", "");
  const [dateRange, setDateRange] = useConditionalUrlState<{ from_date: string; to_date: string }>("dateRange", { from_date: "", to_date: "" });
  const [sortBy, setSortBy] = useConditionalUrlState("sortBy", "created_at");
  const [sortOrder, setSortOrder] = useConditionalUrlState<"asc" | "desc">("sortOrder", "desc");
  const [columnVisibility, setColumnVisibility] = useConditionalUrlState<Record<string, boolean>>("columnVisibility", {});
  const [columnFilters, setColumnFilters] = useConditionalUrlState<Array<{ id: string; value: any }>>("columnFilters", []);

  // Convert the sorting from URL to the format TanStack Table expects
  const sorting: SortingState = React.useMemo(() => {
    return sortBy && sortOrder
      ? [{ id: sortBy, desc: sortOrder === "desc" }]
      : [];
  }, [sortBy, sortOrder]);

  // Store persistent row selection across pages
  // Use userId as the key instead of the row index (not in URL since it's transient)
  const [selectedUserIds, setSelectedUserIds] = React.useState<Record<number, boolean>>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Ref for the table container for keyboard navigation
  const tableContainerRef = useRef<HTMLDivElement>(null!);
  
  // Handle custom keyboard shortcuts
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    // If the key is Space or Enter and we're not in an input/button, handle row selection/activation
    if ((e.key === " " || e.key === "Enter") && 
        !(e.target as HTMLElement).matches('input, button, [role="button"], [contenteditable="true"]')) {
      // Prevent default behavior
      e.preventDefault();
      
      // Find the focused row or cell
      const focusedElement = document.activeElement;
      if (focusedElement && (
          focusedElement.getAttribute('role') === 'row' || 
          focusedElement.getAttribute('role') === 'gridcell'
      )) {
        // Find the closest row
        const rowElement = focusedElement.getAttribute('role') === 'row' 
          ? focusedElement 
          : focusedElement.closest('[role="row"]');
          
        if (rowElement) {
          // Get the row index from the data-row-index attribute or the row id
          const rowId = rowElement.getAttribute('data-row-index') || rowElement.id;
          if (rowId) {
            // Find the row by index and toggle its selection
            const rowIndex = parseInt(rowId.replace(/^row-/, ''), 10);
            const row = table.getRowModel().rows[rowIndex];
            if (row) {
              if (e.key === " ") {
                // Space toggles selection
                row.toggleSelected();
              } else if (e.key === "Enter") {
                // Enter activates the row - you can add custom action here
                console.log(`Row ${rowIndex} activated`, row.original);
                // Example: Navigate to detail page or open modal with the row data
                // window.location.href = `/users/${row.original.id}`;
              }
            }
          }
        }
      }
    }
  }, []);
  
  // Access the query client for fetching all data
  const queryClient = useQueryClient();

  // Fetch users data from API using React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", page, pageSize, search, dateRange, sortBy, sortOrder],
    queryFn: () => fetchUsers({
      page,
      limit: pageSize,
      search,
      from_date: dateRange.from_date,
      to_date: dateRange.to_date,
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
  });

  // Memoize data to ensure stable reference
  const tableData = React.useMemo(() => data?.data || [], [data?.data]);
  
  // Memoized pagination state
  const pagination = React.useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize,
    }),
    [page, pageSize]
  );

  // Function to handle individual row deselection - DEFINE THIS BEFORE USING IT
  const handleRowDeselection = React.useCallback((rowId: string) => {
    if (data?.data) {
      const rowIndex = parseInt(rowId, 10);
      const user = data.data[rowIndex];
      
      if (user) {
        // Remove from selectedUserIds
        const newSelectedUserIds = { ...selectedUserIds };
        delete newSelectedUserIds[user.id];
        setSelectedUserIds(newSelectedUserIds);
        
        // Update rowSelection
        const newRowSelection = { ...rowSelection } as Record<string, boolean>;
        delete newRowSelection[rowId];
        setRowSelection(newRowSelection);
      }
    }
  }, [data?.data, selectedUserIds, rowSelection, setSelectedUserIds, setRowSelection]);

  // Calculate how many items are selected across all pages
  const totalSelectedItems = Object.keys(selectedUserIds).length;

  // Function to handle clearing all selections
  const clearAllSelections = React.useCallback(() => {
    setSelectedUserIds({});
    setRowSelection({});
  }, []);

  // Get selected users data from all available data
  const getSelectedUsers = React.useCallback(async (): Promise<User[]> => {
    // If nothing is selected, return empty array
    if (totalSelectedItems === 0 || Object.keys(selectedUserIds).length === 0) {
      return [];
    }
    
    // Get array of selected IDs from the selection object
    const selectedIds = Object.keys(selectedUserIds).map(id => parseInt(id));
    
    // First, get users from the current page that are selected
    const usersInCurrentPage = data?.data.filter(user => selectedUserIds[user.id]) || [];
    const idsInCurrentPage = usersInCurrentPage.map(user => user.id);
    
    // Find which IDs need to be fetched from the server
    const idsToFetch = selectedIds.filter(id => !idsInCurrentPage.includes(id));
    
    if (idsToFetch.length === 0) {
      // All selected users are on the current page, no need for API call
      return usersInCurrentPage;
    }
    
    try {
      // Show loading state for user
      toast.loading("Preparing export data...", {
        description: `Fetching data for ${idsToFetch.length} selected users...`,
        id: "fetch-selected-users",
        duration: 3000, // Auto dismiss after 3 seconds if not manually dismissed
      });
      
      // Fetch data for all missing users in a single batch
      const fetchedUsers = await fetchUsersByIds(idsToFetch);
      
      // Dismiss loading toast immediately after fetch completes
      toast.dismiss("fetch-selected-users");
      
      // Combine with users from current page
      const combinedUsers = [...usersInCurrentPage, ...fetchedUsers];
      
      return combinedUsers;
    } catch (error) {
      console.error("Error fetching selected users:", error);
      
      // Dismiss loading toast
      toast.dismiss("fetch-selected-users");
      
      toast.error("Error fetching user data", {
        description: "Some user data could not be retrieved. The export may be incomplete.",
      });
      
      // Fall back to returning current page + placeholder data for errors
      const placeholderData = idsToFetch.map(id => ({
        id,
        name: `User ${id}`,
        email: "(data unavailable)",
        phone: "",
        age: 0,
        created_at: new Date().toISOString(),
        expense_count: 0,
        total_expenses: "0",
      } as User));
      
      return [...usersInCurrentPage, ...placeholderData];
    }
  }, [data?.data, selectedUserIds, totalSelectedItems]);

  // Get all available users data for export
  const getAllUsers = React.useCallback((): User[] => {
    // Return current page data
    return data?.data || [];
  }, [data?.data]);
  
  // Handler for row selection changes
  const handleRowSelectionChange = React.useCallback((updaterOrValue: any) => {
    // Handle both direct values and updater functions
    const newSelection = typeof updaterOrValue === 'function'
      ? updaterOrValue(rowSelection)
      : updaterOrValue;
    
    // Update the UI-level selection state
    setRowSelection(newSelection);
    
    // For every row that's selected, we need to add its user ID to our selectedUserIds object
    const updatedSelectedUserIds = { ...selectedUserIds };
    
    // Process current page selections
    if (data?.data) {
      Object.keys(newSelection).forEach(rowId => {
        const rowIndex = parseInt(rowId, 10);
        const user = data.data[rowIndex];
        
        if (user) {
          if (newSelection[rowId]) {
            // Row is selected, add to selectedUserIds
            updatedSelectedUserIds[user.id] = true;
          } else {
            // Row is deselected, remove from selectedUserIds
            delete updatedSelectedUserIds[user.id];
          }
        }
      });
      
      // Find rows that are no longer selected
      data.data.forEach((user, index) => {
        const rowId = String(index);
        
        if (!newSelection[rowId] && selectedUserIds[user.id]) {
          // This row was previously selected but isn't anymore
          delete updatedSelectedUserIds[user.id];
        }
      });
    }
    
    setSelectedUserIds(updatedSelectedUserIds);
  }, [data?.data, selectedUserIds, rowSelection]);

  // Handler for sorting changes
  const handleSortingChange = React.useCallback((updaterOrValue: any) => {
    // Handle both direct values and updater functions
    const newSorting = typeof updaterOrValue === 'function'
      ? updaterOrValue(sorting)
      : updaterOrValue;
    
    if (newSorting.length > 0) {
      setSortBy(newSorting[0].id);
      setSortOrder(newSorting[0].desc ? "desc" : "asc");
    } else {
      // Default sorting
      setSortBy("created_at");
      setSortOrder("desc");
    }
  }, [setSortBy, setSortOrder, sorting]);

  // Handler for column filter changes
  const handleColumnFiltersChange = React.useCallback((updaterOrValue: any) => {
    // Pass through to setColumnFilters (which handles updater functions)
    setColumnFilters(updaterOrValue);
  }, [setColumnFilters]);

  // Handler for column visibility changes
  const handleColumnVisibilityChange = React.useCallback((updaterOrValue: any) => {
    // Pass through to setColumnVisibility (which handles updater functions)
    setColumnVisibility(updaterOrValue);
  }, [setColumnVisibility]);

  // Handler for pagination changes
  const handlePaginationChange = React.useCallback((updaterOrValue: any) => {
    // Handle both direct values and updater functions
    const newPagination = typeof updaterOrValue === 'function'
      ? updaterOrValue({ pageIndex: page - 1, pageSize })
      : updaterOrValue;
    
    setPage(newPagination.pageIndex + 1);
    setPageSize(newPagination.pageSize);
  }, [setPage, setPageSize, page, pageSize]);

  // Get columns with the deselection handler (memoize to avoid recreation on render)
  // IMPORTANT: Now we define columns AFTER handleRowDeselection is defined
  const columns = React.useMemo(() => {
    // If row selection is disabled, pass null as the handler which will hide the checkbox column
    return getColumns(tableConfig.enableRowSelection ? handleRowDeselection : null);
  }, [handleRowDeselection, tableConfig.enableRowSelection]);

  // Reset selection when URL params change (pagination, filters, etc.)
  React.useEffect(() => {
    // When URL changes, we want to maintain selection across pages
    if (page === 1 && search === "" && dateRange.from_date === "" && dateRange.to_date === "" && sortBy === "created_at" && sortOrder === "desc") {
      // If we're at default state, we can optionally reset selection
      // Uncomment the following line if you want selection to reset when all filters are removed
      // clearAllSelections();
    }
  }, [page, pageSize, search, dateRange, sortBy, sortOrder]);

  // When data loads, sync rowSelection with selected user IDs
  React.useEffect(() => {
    if (data?.data) {
      const newRowSelection: Record<string, boolean> = {};
      
      // Map the current page's rows to their selection state
      data.data.forEach((user, index) => {
        if (selectedUserIds[user.id]) {
          newRowSelection[index] = true;
        }
      });
      
      setRowSelection(newRowSelection);
    }
  }, [data?.data, selectedUserIds]);

  // Set up the table
  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    pageCount: data?.pagination.total_pages || 0,
    enableRowSelection: tableConfig.enableRowSelection,
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

  // Validate URL parameters to ensure proper format
  React.useEffect(() => {
    // Validate column filters
    if (columnFilters.length > 0 && table) {
      columnFilters.forEach(filter => {
        if (!filter.id || filter.value === undefined) {
          console.warn('Invalid column filter format:', filter);
        }
      });
    }
    
    // Validate search parameter
    if (search && typeof search !== 'string') {
      console.warn('Invalid search format:', search);
    }
    
    // Validate date range
    if (dateRange && (
      (dateRange.from_date && typeof dateRange.from_date !== 'string') || 
      (dateRange.to_date && typeof dateRange.to_date !== 'string')
    )) {
      console.warn('Invalid date range format:', dateRange);
    }
    
    // Validate pagination
    if (typeof page !== 'number' || page < 1) {
      console.warn('Invalid page number:', page);
    }
    
    if (typeof pageSize !== 'number' || pageSize < 1) {
      console.warn('Invalid page size:', pageSize);
    }
  }, [columnFilters, search, dateRange, page, pageSize, table]);

  // Handle error state
  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load users: {error instanceof Error ? error.message : "Unknown error"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar 
        table={table} 
        setSearch={setSearch} 
        setDateRange={setDateRange}
        totalSelectedItems={totalSelectedItems}
        clearSelection={clearAllSelections}
        getSelectedUsers={getSelectedUsers}
        getAllUsers={getAllUsers}
        config={tableConfig}
      />
      
      <div 
        ref={tableContainerRef} 
        className="overflow-y-auto rounded-md border table-container" 
        role="grid"
        tabIndex={0}
        aria-label="Data table"
        onKeyDown={tableConfig.enableKeyboardNavigation ? handleKeyDown : undefined}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow 
                key={headerGroup.id}
                role="row"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className="px-4 py-2"
                    key={header.id}
                    colSpan={header.colSpan}
                    role="columnheader"
                    tabIndex={-1}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
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