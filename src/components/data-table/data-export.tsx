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
import { exportData, ExportableData } from "@/components/data-table/utils/export-utils";
import { useState } from "react";
import { toast } from "sonner";

interface DataTableExportProps<TData extends ExportableData> {
  table: Table<TData>;
  data: TData[];
  selectedData?: TData[];
  getSelectedItems?: () => Promise<TData[]>;
  entityName?: string;
  columnMapping?: Record<string, string>;
  columnWidths?: Array<{ wch: number }>;
  headers?: string[];
}

export function DataTableExport<TData extends ExportableData>({
  table,
  data,
  selectedData,
  getSelectedItems,
  entityName = "items",
  columnMapping,
  columnWidths,
  headers
}: DataTableExportProps<TData>) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async (type: "csv" | "excel") => {
    if (isLoading) return; // Prevent multiple export requests
    
    // Create a data fetching function based on the current state
    const fetchExportData = async (): Promise<TData[]> => {
      // If we have selected items and a function to get their complete data
      if (getSelectedItems && selectedData && selectedData.length > 0) {
        // Check if data is on current page or needs to be fetched
        if (selectedData.some(item => Object.keys(item).length === 0)) {
          // We have placeholder data, need to fetch complete data
          toast.loading("Preparing export data...", {
            description: `Fetching complete data for selected ${entityName}.`,
            id: "export-loading",
          });
        }
        
        // Fetch complete data for selected items
        const selectedItems = await getSelectedItems();
        
        // Force dismiss all loading toasts
        toast.dismiss("export-loading");
        toast.dismiss("fetch-selected-items");
        
        if (selectedItems.length === 0) {
          throw new Error(`Failed to retrieve complete data for selected ${entityName}`);
        }
        
        return selectedItems;
      } else {
        // Otherwise use the provided data (current page data)
        if (!data || data.length === 0) {
          throw new Error("No data available for export");
        }
        return selectedData && selectedData.length > 0 ? selectedData : data;
      }
    };

    try {
      // Generate export options

      // Get column headers from provided headers, visible columns, or data keys
      const exportHeaders = headers || (
        table.getAllColumns()
          .filter(column => column.getIsVisible())
          .map(column => column.id)
          .filter(id => id !== 'actions' && id !== 'select')
      );

      // Auto-generate column mapping from table headers if not provided
      const exportColumnMapping = columnMapping || (() => {
        const mapping: Record<string, string> = {};

        // First try to get from table headers
        table.getAllColumns()
          .filter(column => column.getIsVisible())
          .forEach(column => {
            // Skip action columns
            if (column.id !== 'actions' && column.id !== 'select') {
              // Try to get header text if available
              const headerText = column.columnDef.header as string;
              
              if (headerText && typeof headerText === 'string') {
                mapping[column.id] = headerText;
              } else {
                // Fallback to formatted column ID
                mapping[column.id] = column.id
                  .split(/(?=[A-Z])|_/)
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
              }
            }
          });
          
        return mapping;
      })();

      // Use the generic export function with proper options
      await exportData(
        type,
        fetchExportData,
        () => setIsLoading(true),
        () => setIsLoading(false),
        {
          entityName,
          headers: exportHeaders,
          columnMapping: exportColumnMapping,
          columnWidths: columnWidths
        }
      );
    } finally {
      // Ensure all toasts are dismissed regardless of outcome
      toast.dismiss("export-loading");
      toast.dismiss("fetch-selected-items");
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