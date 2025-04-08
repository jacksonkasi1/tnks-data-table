"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { useState, useEffect } from "react";
import { DataTableViewOptions } from "./data-table-view-options";
import { TrashIcon } from "lucide-react";
import { formatDate } from "@/api/user/get-users";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  setSearch: (value: string) => void;
  setDateRange: (range: { from_date: string; to_date: string }) => void;
  totalSelectedItems?: number;
  clearSelection?: () => void;
}

export function DataTableToolbar<TData>({
  table,
  setSearch,
  setDateRange,
  totalSelectedItems = 0,
  clearSelection,
}: DataTableToolbarProps<TData>) {
  const tableFiltered = table.getState().columnFilters.length > 0;

  const [localSearch, setLocalSearch] = useState("");
  
  // Initial state with empty date values
  const [dates, setDates] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  
  // Track if user has explicitly changed dates
  const [datesModified, setDatesModified] = useState(false);
  
  // Determine if any filters are active
  const isFiltered = tableFiltered || !!localSearch || datesModified;

  // Handle search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    
    // Debounce search to reduce API calls
    const timeoutId = setTimeout(() => {
      setSearch(value);
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
  
  // Reset all filters
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
  };

  return (
    <div className="flex flex-wrap items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Search users..."
          value={localSearch}
          onChange={handleSearchChange}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
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
      </div>

      <div className="flex items-center gap-2">
        {totalSelectedItems > 0 ? (
          <Button variant="outline" size="sm" onClick={clearSelection}>
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
            Delete ({totalSelectedItems})
          </Button>
        ) : null}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}