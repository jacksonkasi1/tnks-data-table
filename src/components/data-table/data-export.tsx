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
import { exportData, exportToCSV, exportToExcel, ExportableData } from "./utils/export-utils";
import { JSX, useState } from "react";
import { toast } from "sonner";

interface DataTableExportProps<TData extends ExportableData> {
  table: Table<TData>;
  data: TData[];
  selectedData?: TData[];
  getSelectedItems?: () => Promise<TData[]>;
  getAllItems?: () => Promise<TData[]>;
  entityName?: string;
  columnMapping?: Record<string, string>;
  columnWidths?: Array<{ wch: number }>;
  headers?: string[];
  size?: 'sm' | 'default' | 'lg';
}

export function DataTableExport<TData extends ExportableData>({
  table,
  data,
  selectedData,
  getSelectedItems,
  getAllItems,
  entityName = "items",
  columnMapping,
  columnWidths,
  headers,
  size = 'default'
}: DataTableExportProps<TData>): JSX.Element {
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
          toast.loading("Preparing export...", {
            description: `Fetching complete data for selected ${entityName}.`,
            id: "export-data-toast",
          });
        }
        
        // Fetch complete data for selected items
        const selectedItems = await getSelectedItems();
        
        if (selectedItems.length === 0) {
          throw new Error(`Failed to retrieve complete data for selected ${entityName}`);
        }
        
        // Order the items according to the current sorting in the table
        // This preserves the table's page order in the exported data
        const sortedItems = [...selectedItems];
        const sorting = table.getState().sorting;
        
        if (sorting.length > 0) {
          const { id: sortField, desc: isDescending } = sorting[0];
          
          sortedItems.sort((a, b) => {
            const valueA = a[sortField as keyof TData];
            const valueB = b[sortField as keyof TData];
            
            if (valueA === valueB) return 0;
            
            if (valueA === null || valueA === undefined) return isDescending ? 1 : -1;
            if (valueB === null || valueB === undefined) return isDescending ? -1 : 1;
            
            if (typeof valueA === 'string' && typeof valueB === 'string') {
              return isDescending 
                ? valueB.localeCompare(valueA) 
                : valueA.localeCompare(valueB);
            }
            
            return isDescending 
              ? (valueB > valueA ? 1 : -1) 
              : (valueA > valueB ? 1 : -1);
          });
        }
        
        return sortedItems;
      } else if (getAllItems && !selectedData?.length) {
        // If we're exporting all data and have a method to get it with proper ordering
        toast.loading("Preparing export...", {
          description: `Fetching all ${entityName} with current sorting...`,
          id: "export-data-toast",
        });
        
        // Fetch all data with server-side sorting applied
        const allItems = await getAllItems();
        
        if (allItems.length === 0) {
          throw new Error(`No ${entityName} available to export`);
        }
        
        return allItems;
      } else {
        // Otherwise use the provided data (current page data)
        if (!data || data.length === 0) {
          throw new Error("No data available for export");
        }
        return selectedData && selectedData.length > 0 ? selectedData : data;
      }
    };

    try {
      // Get visible columns from the table
      const visibleColumns = table.getAllColumns()
        .filter(column => column.getIsVisible())
        .filter(column => column.id !== 'actions' && column.id !== 'select');

      // Generate export options based on visible columns and respect column order
      const columnOrder = table.getState().columnOrder;
      const orderedVisibleColumns = columnOrder.length > 0
        ? [...visibleColumns].sort((a, b) => {
            const aIndex = columnOrder.indexOf(a.id);
            const bIndex = columnOrder.indexOf(b.id);
            // If column isn't in the order array, put it at the end
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
          })
        : visibleColumns;

      // Generate export headers based on ordered columns
      const exportHeaders = orderedVisibleColumns.map(column => column.id);

      // Auto-generate column mapping from table headers if not provided
      const exportColumnMapping = columnMapping || (() => {
        const mapping: Record<string, string> = {};
        orderedVisibleColumns.forEach(column => {
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
        });
        return mapping;
      })();

      // Filter column widths to match visible columns and their order
      const exportColumnWidths = columnWidths ? 
        orderedVisibleColumns.map((column, index) => {
          const originalIndex = visibleColumns.findIndex(vc => vc.id === column.id);
          return columnWidths[originalIndex] || { wch: 15 };
        }) :
        orderedVisibleColumns.map(() => ({ wch: 15 }));

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
          columnWidths: exportColumnWidths
        }
      );
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Export failed", {
        description: "There was a problem exporting. Please try again.",
        id: "export-data-toast"
      });
      setIsLoading(false);
    }
  };

  const exportAllPages = async (type: "csv" | "excel") => {
    if (isLoading || !getAllItems) return;
    setIsLoading(true);
    
    try {
      // Show toast for long operations
      toast.loading("Preparing export...", {
        description: `Fetching all ${entityName}...`,
        id: "export-data-toast"
      });
      
      // Fetch all data with server-side sorting
      const allData = await getAllItems();
      
      if (allData.length === 0) {
        toast.error("Export failed", {
          description: "No data available to export.",
          id: "export-data-toast"
        });
        return;
      }
      
      // Get visible columns and apply export
      const visibleColumns = table.getAllColumns()
        .filter(column => column.getIsVisible())
        .filter(column => column.id !== 'actions' && column.id !== 'select');
      
      const exportHeaders = visibleColumns.map(column => column.id);
      const exportColumnMapping = columnMapping || (() => {
        const mapping: Record<string, string> = {};
        visibleColumns.forEach(column => {
          const headerText = column.columnDef.header as string;
          
          if (headerText && typeof headerText === 'string') {
            mapping[column.id] = headerText;
          } else {
            mapping[column.id] = column.id
              .split(/(?=[A-Z])|_/)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
          }
        });
        return mapping;
      })();
      
      const exportColumnWidths = columnWidths ?
        visibleColumns.map((_, index) => columnWidths[index] || { wch: 15 }) :
        visibleColumns.map(() => ({ wch: 15 }));
      
      // Update toast for processing
      toast.loading("Processing data...", {
        description: "Generating export file...",
        id: "export-data-toast"
      });
      
      // Generate timestamp for filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `${entityName}-all-pages-export-${timestamp}`;
      
      // Export based on type
      let success = false;
      if (type === "csv") {
        success = exportToCSV(allData, filename, exportHeaders);
      } else {
        success = exportToExcel(
          allData, 
          filename, 
          exportColumnMapping, 
          exportColumnWidths,
          exportHeaders
        );
      }
      
      if (success) {
        toast.success("Export successful", {
          description: `Exported all ${allData.length} ${entityName} to ${type.toUpperCase()}.`,
          id: "export-data-toast"
        });
      }
    } catch (error) {
      console.error("Error exporting all pages:", error);
      toast.error("Export failed", {
        description: "There was a problem exporting all pages. Please try again.",
        id: "export-data-toast"
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
        <Button variant="outline" size={size} disabled={isLoading}>
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
        {hasSelection ? (
          <>
            <DropdownMenuItem onClick={() => handleExport("csv")} disabled={isLoading}>
              Export Selected as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("excel")} disabled={isLoading}>
              Export Selected as XLS
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => handleExport("csv")} disabled={isLoading}>
              Export Current Page as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("excel")} disabled={isLoading}>
              Export Current Page as XLS
            </DropdownMenuItem>
            {getAllItems && (
              <>
                <DropdownMenuItem 
                  onClick={() => exportAllPages("csv")} 
                  disabled={isLoading}
                >
                  Export All Pages as CSV
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => exportAllPages("excel")} 
                  disabled={isLoading}
                >
                  Export All Pages as XLS
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}