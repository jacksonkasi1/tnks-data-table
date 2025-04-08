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
import { useQuery } from "@tanstack/react-query";

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
import { fetchUsers } from "@/api/user/get-users";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { User } from "./schema";
import { getColumns } from "./columns";

interface DataTableProps {
  // The component no longer needs columns as a prop
}

export function DataTable({}: DataTableProps) {
  // States for API parameters
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [dateRange, setDateRange] = React.useState<{ from_date: string; to_date: string }>({
    from_date: "",
    to_date: "",
  });
  const [sortBy, setSortBy] = React.useState<string>("created_at");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  // Store persistent row selection across pages
  // Use userId as the key instead of the row index
  const [selectedUserIds, setSelectedUserIds] = React.useState<Record<number, boolean>>({});
  
  // Table states
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

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

  // Custom handler for row selection changes
  const handleRowSelectionChange = (updaterOrValue: any) => {
    let newRowSelection: Record<string, boolean>;
    
    if (typeof updaterOrValue === 'function') {
      newRowSelection = updaterOrValue(rowSelection);
    } else {
      newRowSelection = updaterOrValue;
    }
    
    setRowSelection(newRowSelection);
    
    // Update the selectedUserIds based on the new row selection
    if (data?.data) {
      const newSelectedUserIds = { ...selectedUserIds };
      
      // First identify rows that were deselected in the current page
      // and remove them from newSelectedUserIds
      const currentPageUserIds = data.data.map(user => user.id);
      const selectedIndices = Object.keys(newRowSelection).map(idx => parseInt(idx, 10));
      
      // For each user in the current page
      data.data.forEach((user, index) => {
        // If the row index is not in the selected indices, remove the user from selectedUserIds
        if (!selectedIndices.includes(index)) {
          delete newSelectedUserIds[user.id];
        }
      });
      
      // Now add newly selected rows
      Object.entries(newRowSelection).forEach(([rowIndex, isSelected]) => {
        const index = parseInt(rowIndex, 10);
        const user = data.data[index];
        
        if (user && isSelected) {
          newSelectedUserIds[user.id] = true;
        }
      });
      
      setSelectedUserIds(newSelectedUserIds);
    }
  };
  
  // Get the total number of selected items across all pages
  const totalSelectedItems = Object.keys(selectedUserIds).length;

  // Function to handle clearing all selections
  const clearAllSelections = () => {
    setSelectedUserIds({});
    setRowSelection({});
  };

  // Function to handle individual row deselection
  const handleRowDeselection = (rowId: string) => {
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
  };

  // Get columns with the deselection handler
  const columns = getColumns(handleRowDeselection);

  // Set up the table
  const table = useReactTable({
    data: data?.data || [],
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
    pageCount: data?.pagination.total_pages || 0,
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);
      
      if (newSorting.length > 0) {
        const column = newSorting[0].id;
        const direction = newSorting[0].desc ? "desc" : "asc";
        setSortBy(column);
        setSortOrder(direction);
      } else {
        setSortBy("created_at");
        setSortOrder("desc");
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === "function" 
        ? updater({ pageIndex: page - 1, pageSize }) 
        : updater;
        
      setPage(newPagination.pageIndex + 1);
      setPageSize(newPagination.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

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
      />
      
      <div className="overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className="px-4 py-2"
                    key={header.id}
                    colSpan={header.colSpan}
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
                <TableRow key={`skeleton-${i}`}>
                  {Array.from({ length: columns.length }).map((_, j) => (
                    <TableCell key={`skeleton-cell-${j}`} className="px-4 py-2">
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              // Data rows
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="px-4 py-2" key={cell.id}>
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
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <DataTablePagination 
        table={table} 
        totalItems={data?.pagination.total_items || 0} 
        totalSelectedItems={totalSelectedItems}
      />
    </div>
  );
}