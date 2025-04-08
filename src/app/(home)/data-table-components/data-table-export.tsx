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
import { exportToCSV, exportToExcel } from "@/lib/export-utils";
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
    // Show loading state
    setIsLoading(true);
    
    try {
      let exportData: User[];
      
      // If we have selected users and a function to get their complete data
      if (getSelectedUsers && selectedData && selectedData.length > 0) {
        // Fetch complete data for selected users
        toast.loading("Preparing export data...", {
          description: "Fetching complete data for selected users."
        });
        
        exportData = await getSelectedUsers();
        
        if (exportData.length === 0) {
          throw new Error("Failed to retrieve complete data for selected users");
        }
      } else {
        // Otherwise use the provided data (current page data)
        exportData = selectedData && selectedData.length > 0 ? selectedData : data;
      }
      
      // Generate timestamp for filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `users-export-${timestamp}`;
      
      if (type === "csv") {
        exportToCSV(exportData, filename);
        toast.success("Export successful", {
          description: `Exported ${exportData.length} user(s) to CSV.`,
        });
      } else {
        exportToExcel(exportData, filename);
        toast.success("Export successful", {
          description: `Exported ${exportData.length} user(s) to Excel.`,
        });
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Export failed", {
        description: "There was a problem exporting the selected data. Please try again.",
      });
    } finally {
      setIsLoading(false);
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