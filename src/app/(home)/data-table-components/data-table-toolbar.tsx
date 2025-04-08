"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { DataTableViewOptions } from "./data-table-view-options";
import { TrashIcon } from "lucide-react";
import { formatDate } from "@/api/user/get-users";
import { DataTableExport } from "./data-table-export";
import { User } from "./schema";
import { resetUrlState } from "./utils";
import { parseDateFromUrl } from "./url-state";
import { TableConfig } from "./table-config";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  setSearch: (value: string | ((prev: string) => string)) => void;
  setDateRange: (value: { from_date: string; to_date: string } | ((prev: { from_date: string; to_date: string }) => { from_date: string; to_date: string })) => void;
  totalSelectedItems?: number;
  clearSelection?: () => void;
  getSelectedUsers?: () => Promise<User[]>;
  getAllUsers?: () => User[];
  config: TableConfig;
  resetColumnSizing?: () => void;
}

export function DataTableToolbar<TData>({
  table,
  setSearch,
  setDateRange,
  totalSelectedItems = 0,
  clearSelection,
  getSelectedUsers,
  getAllUsers,
  config,
  resetColumnSizing,
}: DataTableToolbarProps<TData>) {
  // Get router and pathname for URL state reset
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const tableFiltered = table.getState().columnFilters.length > 0;

  // Get search value directly from URL query parameter
  const searchParamFromUrl = searchParams.get('search') || '';
  
  // Get search value from table state as fallback
  const currentSearchFromTable = table.getState().globalFilter as string || "";
  
  // Initialize local search state with URL value or table state
  const [localSearch, setLocalSearch] = useState(searchParamFromUrl || currentSearchFromTable);
  
  // Update local search when URL param changes
  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    if (searchFromUrl !== localSearch) {
      setLocalSearch(searchFromUrl);
    }
  }, [searchParams, setLocalSearch]);
  
  // Also update local search when table globalFilter changes
  useEffect(() => {
    const tableSearch = table.getState().globalFilter as string || "";
    if (tableSearch !== localSearch && tableSearch !== '') {
      setLocalSearch(tableSearch);
    }
  }, [table.getState().globalFilter, setLocalSearch]);
  
  // Get date range from URL if available
  const getInitialDates = (): { from: Date | undefined; to: Date | undefined } => {
    const dateRangeParam = searchParams.get('dateRange');
    if (dateRangeParam) {
      try {
        const parsed = JSON.parse(dateRangeParam);
        return {
          from: parsed?.from_date ? parseDateFromUrl(parsed.from_date) : undefined,
          to: parsed?.to_date ? parseDateFromUrl(parsed.to_date) : undefined
        };
      } catch (e) {
        console.warn("Error parsing dateRange from URL:", e);
        return { from: undefined, to: undefined };
      }
    }
    return { from: undefined, to: undefined };
  };
  
  // Initial state with date values from URL
  const [dates, setDates] = useState<{ from: Date | undefined; to: Date | undefined }>(getInitialDates());
  
  // Track if user has explicitly changed dates
  const [datesModified, setDatesModified] = useState(!!dates.from || !!dates.to);

  // Load initial date range from URL params when component mounts
  useEffect(() => {
    const initialDates = getInitialDates();
    if (initialDates.from || initialDates.to) {
      setDates(initialDates);
      setDatesModified(true);
    }
  }, []);

  // Determine if any filters are active
  const isFiltered = tableFiltered || !!localSearch || datesModified;

  // Handle search with debounce and trim whitespace
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);

    // Debounce search to reduce API calls
    const timeoutId = setTimeout(() => {
      // Trim whitespace before sending to backend API
      const trimmedValue = value.trim();
      setSearch(trimmedValue);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  // Handle date selection for filtering
  const handleDateSelect = ({ from, to }: { from: Date; to: Date }) => {
    setDates({ from, to });
    
    // Mark dates as modified when actual dates are selected
    setDatesModified(true);
    
    // Convert dates to strings in YYYY-MM-DD format for the API
    setDateRange({
      from_date: from ? formatDate(from) : "",
      to_date: to ? formatDate(to) : "",
    });
  };
  
  // Reset all filters and URL state
  const handleResetFilters = () => {
    // Reset table filters
    table.resetColumnFilters();
    
    // Reset search
    setLocalSearch("");
    setSearch("");
    
    // Reset dates to undefined (no filter)
    setDates({ 
      from: undefined, 
      to: undefined 
    });
    setDatesModified(false);
    setDateRange({
      from_date: "",
      to_date: "",
    });
    
    // Reset URL state by removing all query parameters, but only if URL state is enabled
    if (config.enableUrlState) {
      resetUrlState(router, pathname);
    }
  };

  // Get selected users data for export - this is now just for the UI indication
  // The actual data fetching happens in the export component
  const selectedUsers = totalSelectedItems > 0 ? new Array(totalSelectedItems).fill({} as User) : [];
  
  // Get all available users data for export
  const allUsers = getAllUsers ? getAllUsers() : [];

  return (
    <div className="flex flex-wrap items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {config.enableSearch && (
          <Input
            placeholder="Search users..."
            value={localSearch}
            onChange={handleSearchChange}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="h-8 px-2 lg:px-3"
          >
            Reset Filters
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
        
        {config.enableDateFilter && (
          <div className="flex items-center">
            <CalendarDatePicker
              date={{
                from: dates.from,
                to: dates.to,
              }}
              onDateSelect={handleDateSelect}
              className="h-9 w-[250px] cursor-pointer"
              variant="outline"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {config.enableRowSelection && totalSelectedItems > 0 ? (
          <Button variant="outline" size="sm" onClick={clearSelection}>
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
            Delete ({totalSelectedItems})
          </Button>
        ) : null}
        
        {config.enableExport && (
          <DataTableExport 
            table={table as any} 
            data={allUsers}
            selectedData={selectedUsers}
            getSelectedUsers={getSelectedUsers}
          />
        )}
        
        {config.enableColumnVisibility && (
          <DataTableViewOptions table={table} />
        )}
        
        {config.enableColumnResizing && resetColumnSizing && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetColumnSizing}
            className="ml-2"
          >
            Reset Columns
          </Button>
        )}
      </div>
    </div>
  );
}