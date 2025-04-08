"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DownloadIcon, Loader2 } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { exportData } from "@/lib/export-utils";
import { User } from "../data-table-components/schema";
import { useState } from "react";
import { toast } from "sonner";

interface DataTableExportProps<TData> {
  table: Table<TData>;
  data: User[];
  selectedData?: User[];
  getSelectedUsers?: () => Promise<User[]>;
}

export function DataTableExport<TData>({
  table,
  data,
  selectedData,
  getSelectedUsers,
}: DataTableExportProps<TData>) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async (type: "csv" | "excel") => {
    if (isLoading) return; // Prevent multiple export requests
    
    // Create a data fetching function based on the current state
    const fetchExportData = async (): Promise<User[]> => {
      // If we have selected users and a function to get their complete data
      if (getSelectedUsers && selectedData && selectedData.length > 0) {
        // Check if data is on current page or needs to be fetched
        if (selectedData.some(user => !user.name)) {
          // We have placeholder data, need to fetch complete data
          toast.loading("Preparing export data...", {
            description: "Fetching complete data for selected users.",
            id: "export-loading",
          });
        }
        
        // Fetch complete data for selected users
        const selectedUsers = await getSelectedUsers();
        
        // Force dismiss all loading toasts
        toast.dismiss("export-loading");
        toast.dismiss("fetch-selected-users");
        
        if (selectedUsers.length === 0) {
          throw new Error("Failed to retrieve complete data for selected users");
        }
        
        return selectedUsers;
      } else {
        // Otherwise use the provided data (current page data)
        if (!data || data.length === 0) {
          throw new Error("No data available for export");
        }
        return selectedData && selectedData.length > 0 ? selectedData : data;
      }
    };

    try {
      // Use the unified export function
      await exportData(
        type,
        fetchExportData,
        () => setIsLoading(true),
        () => setIsLoading(false)
      );
    } finally {
      // Ensure all toasts are dismissed regardless of outcome
      toast.dismiss("export-loading");
      toast.dismiss("fetch-selected-users");
    }
  };

  // Check if any rows are selected
  const hasSelection = selectedData && selectedData.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export
              {hasSelection && <span className="ml-1">({selectedData?.length})</span>}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")} disabled={isLoading}>
          {hasSelection ? "Export Selected as CSV" : "Export All as CSV"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")} disabled={isLoading}>
          {hasSelection ? "Export Selected as Excel" : "Export All as Excel"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 