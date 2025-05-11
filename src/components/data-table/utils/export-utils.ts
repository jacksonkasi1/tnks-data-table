import { toast } from "sonner";
import * as XLSX from "xlsx";


// Generic type for exportable data - should have string keys and values that can be converted to string
export type ExportableData = Record<string, string | number | boolean | null | undefined>;

/**
 * Convert array of objects to CSV string
 */
function convertToCSV<T extends ExportableData>(data: T[], headers: string[], columnMapping?: Record<string, string>): string {
  if (data.length === 0) {
    throw new Error("No data to export");
  }

  // Create CSV header row with column mapping if provided
  let csvContent = "";

  if (columnMapping) {
    // Use column mapping for header names
    const headerRow = headers.map(header => {
      const mappedHeader = columnMapping[header] || header;
      // Escape quotes and wrap in quotes if contains comma
      return mappedHeader.includes(",") || mappedHeader.includes('"')
        ? `"${mappedHeader.replace(/"/g, '""')}"`
        : mappedHeader;
    });
    csvContent = `${headerRow.join(",")}\n`;
  } else {
    // Use original headers
    csvContent = `${headers.join(",")}\n`;
  }

  // Add data rows
  for (const item of data) {
    const row = headers.map(header => {
      // Get the value for this header
      const value = item[header as keyof T];

      // Convert all values to string and properly escape for CSV
      const cellValue = value === null || value === undefined ? "" : String(value);
      // Escape quotes and wrap in quotes if contains comma
      const escapedValue = cellValue.includes(",") || cellValue.includes('"')
        ? `"${cellValue.replace(/"/g, '""')}"`
        : cellValue;

      return escapedValue;
    });

    csvContent += `${row.join(",")}\n`;
  }

  return csvContent;
}

/**
 * Download blob as file
 */
function downloadFile(blob: Blob, filename: string) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to CSV file
 */
export function exportToCSV<T extends ExportableData>(
  data: T[],
  filename: string,
  headers: string[] = Object.keys(data[0] || {}),
  columnMapping?: Record<string, string> // Add columnMapping parameter
): boolean {
  if (data.length === 0) {
    console.error("No data to export");
    return false;
  }

  try {
    // Filter data to only include specified headers
    const filteredData = data.map(item => {
      const filteredItem: Record<string, string | number | boolean | null | undefined> = {};
      for (const header of headers) {
        if (header in item) {
          filteredItem[header] = item[header];
        }
      }
      return filteredItem;
    });

    const csvContent = convertToCSV(filteredData, headers, columnMapping);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    downloadFile(blob, `${filename}.csv`);
    return true;
  } catch (error) {
    console.error("Error creating CSV:", error);
    return false;
  }
}

/**
 * Export data to Excel file using xlsx package
 */
export function exportToExcel<T extends ExportableData>(
  data: T[],
  filename: string,
  columnMapping?: Record<string, string>, // Optional mapping of data keys to display names
  columnWidths?: Array<{ wch: number }>,
  headers?: string[] // Add headers parameter to specify which columns to export
): boolean {
  if (data.length === 0) {
    console.error("No data to export");
    return false;
  }

  try {
    // If no column mapping is provided, create one from the data keys
    const mapping = columnMapping ||
      Object.keys(data[0] || {}).reduce((acc, key) => {
        acc[key] = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
        return acc;
      }, {} as Record<string, string>);

    // Map data to worksheet format, only including mapped columns
    const worksheetData = data.map(item => {
      const row: Record<string, string | number | boolean | null | undefined> = {};
      // If headers are provided, only include those columns
      const columnsToExport = headers || Object.keys(mapping);
      for (const key of columnsToExport) {
        if (key in item) {
          row[mapping[key]] = item[key];
        }
      }
      return row;
    });

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Set column widths if provided
    if (columnWidths) {
      worksheet["!cols"] = columnWidths;
    }

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    // Create blob and download
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    downloadFile(blob, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error("Error creating Excel file:", error);
    return false;
  }
}

/**
 * Unified export function that handles loading states and error handling
 */
export async function exportData<T extends ExportableData>(
  type: "csv" | "excel",
  getData: () => Promise<T[]>,
  onLoadingStart?: () => void,
  onLoadingEnd?: () => void,
  options?: {
    headers?: string[];
    columnMapping?: Record<string, string>;
    columnWidths?: Array<{ wch: number }>;
    entityName?: string;
  }
): Promise<boolean> {
  // Use a consistent toast ID to ensure only one toast is shown at a time
  const TOAST_ID = "export-data-toast";
  
  try {
    // Start loading
    if (onLoadingStart) onLoadingStart();

    // Show toast for long operations using consistent ID
    toast.loading("Preparing export...", {
      description: "Fetching data for export...",
      id: TOAST_ID
    });

    // Get the data
    const exportData = await getData();

    // Update the same toast for processing
    toast.loading("Processing data...", {
      description: "Generating export file...",
      id: TOAST_ID
    });

    if (exportData.length === 0) {
      toast.error("Export failed", {
        description: "No data available to export.",
        id: TOAST_ID
      });
      return false;
    }

    // Get entity name for display in notifications
    const entityName = options?.entityName || "items";

    // Generate timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${entityName}-export-${timestamp}`;

    // Export based on type
    let success = false;
    if (type === "csv") {
      success = exportToCSV(exportData, filename, options?.headers, options?.columnMapping);
      if (success) {
        toast.success("Export successful", {
          description: `Exported ${exportData.length} ${entityName} to CSV.`,
          id: TOAST_ID
        });
      }
    } else {
      success = exportToExcel(
        exportData,
        filename,
        options?.columnMapping,
        options?.columnWidths,
        options?.headers // Pass headers to exportToExcel
      );
      if (success) {
        toast.success("Export successful", {
          description: `Exported ${exportData.length} ${entityName} to Excel.`,
          id: TOAST_ID
        });
      }
    }

    return success;
  } catch (error) {
    console.error("Error exporting data:", error);
    
    toast.error("Export failed", {
      description: "There was a problem exporting the data. Please try again.",
      id: TOAST_ID
    });
    return false;
  } finally {
    // End loading regardless of result
    if (onLoadingEnd) onLoadingEnd();
  }
}
