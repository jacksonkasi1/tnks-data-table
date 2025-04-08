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
}

export function DataTableToolbar<TData>({
  table,
  setSearch,
  setDateRange,
}: DataTableToolbarProps<TData>) {
  const tableFiltered = table.getState().columnFilters.length > 0;

  const [localSearch, setLocalSearch] = useState("");
  
  // Default dates for initialization and reset
  const defaultFromDate = new Date(new Date().getFullYear(), 0, 1);
  const defaultToDate = new Date();
  
  // Date state with defaults
  const [dates, setDates] = useState<{ from: Date; to: Date }>({
    from: defaultFromDate,
    to: defaultToDate,
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
    
    // Mark dates as modified by user
    const isDefault = 
      from.getTime() === defaultFromDate.getTime() && 
      to.getTime() === defaultToDate.getTime();
    
    setDatesModified(!isDefault);
    
    // Convert dates to strings in YYYY-MM-DD format for the API
    setDateRange({
      from_date: formatDate(from),
      to_date: formatDate(to),
    });
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    // Reset table filters
    table.resetColumnFilters();
    
    // Reset search
    setLocalSearch("");
    setSearch("");
    
    // Reset dates to defaults
    setDates({ 
      from: defaultFromDate, 
      to: defaultToDate 
    });
    setDatesModified(false);
    setDateRange({
      from_date: formatDate(defaultFromDate),
      to_date: formatDate(defaultToDate),
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
        <CalendarDatePicker
          date={{
            from: dates.from,
            to: dates.to,
          }}
          onDateSelect={handleDateSelect}
          className="h-9 w-[250px]"
          variant="outline"
        />
      </div>

      <div className="flex items-center gap-2">
        {table.getFilteredSelectedRowModel().rows.length > 0 ? (
          <Button variant="outline" size="sm">
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
            Delete ({table.getFilteredSelectedRowModel().rows.length})
          </Button>
        ) : null}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}