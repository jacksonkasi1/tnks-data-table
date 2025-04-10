"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Settings, Undo2, TrashIcon, ColumnsIcon, EyeOff, CheckSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { DataTableViewOptions } from "@/components/data-table/view-options";
import { formatDate } from "@/api/user/get-users";
import { DataTableExport } from "./data-export";
import { User } from "./schema";
import { resetUrlState } from "../../../components/data-table/hooks/deep-utils";
import { parseDateFromUrl } from "../../../components/data-table/utils/url-state";
import { TableConfig } from "../../../components/data-table/table-config";

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
  
  // Track if the search is being updated locally
  const isLocallyUpdatingSearch = useRef(false);
  
  // Update local search when URL param changes
  useEffect(() => {
    // Skip if local update is in progress
    if (isLocallyUpdatingSearch.current) {
      return;
    }
    
    const searchFromUrl = searchParams.get('search') || '';
    if (searchFromUrl !== localSearch) {
      setLocalSearch(searchFromUrl);
    }
  }, [searchParams, setLocalSearch, localSearch]);
  
  // Also update local search when table globalFilter changes
  useEffect(() => {
    // Skip if local update is in progress
    if (isLocallyUpdatingSearch.current) {
      return;
    }
    
    const tableSearch = table.getState().globalFilter as string || "";
    if (tableSearch !== localSearch && tableSearch !== '') {
      setLocalSearch(tableSearch);
    }
  }, [table.getState().globalFilter, setLocalSearch, localSearch]);
  
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

  // Create a ref to store the debounce timer
  const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timers when component unmounts
  useEffect(() => {
    return () => {
      // Clear debounce timer
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
    };
  }, []);

  // Handle search with improved debounce to prevent character loss
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Mark that search is being updated locally
    isLocallyUpdatingSearch.current = true;
    setLocalSearch(value);

    // Clear any existing timer to prevent race conditions
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }

    // Set a new debounce timer to update the actual search state
    searchDebounceTimerRef.current = setTimeout(() => {
      // Trim whitespace before sending to backend API
      const trimmedValue = value.trim();
      setSearch(trimmedValue);
      searchDebounceTimerRef.current = null;
      
      // Reset the local update flag after a short delay
      // This ensures URL changes don't override the input immediately
      setTimeout(() => {
        isLocallyUpdatingSearch.current = false;
      }, 100);
    }, 500);
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

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              title="Table Settings"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Open table settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Table Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Configure the table appearance and behavior.
                </p>
              </div>
              <Separator />
              <div className="grid gap-2">
                {config.enableColumnResizing && resetColumnSizing && (
                  <Button
                    variant="outline" 
                    size="sm"
                    className="justify-start"
                    onClick={(e) => {
                      e.preventDefault();
                      resetColumnSizing();
                    }}
                  >
                    <Undo2 className="mr-2 h-4 w-4" />
                    Reset Column Sizes
                  </Button>
                )}

                {config.enableRowSelection && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => table.resetRowSelection()}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Clear Selection
                  </Button>
                )}
                
                {!table.getIsAllColumnsVisible() && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => table.resetColumnVisibility()}
                  >
                    <EyeOff className="mr-2 h-4 w-4" />
                    Show All Columns
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}