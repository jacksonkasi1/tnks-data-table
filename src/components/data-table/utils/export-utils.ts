import { toast } from "sonner";
import * as XLSX from "xlsx";


// Generic type for exportable data - should have string keys and values that can be converted to string
export type ExportableData = Record<string, string | number | boolean | null | undefined>;

// Type for transformation function that developers can provide
export type DataTransformFunction<T extends ExportableData> = (row: T) => ExportableData;

// Configuration for handling sub-rows during export
export interface SubRowsExportConfig {
  // How to handle sub-rows in export
  includeSubRows?: boolean | 'flatten' | 'nest';
  // Indentation string for flattened sub-rows (CSV only)
  subRowIndentation?: string;
  // Maximum depth to export
  maxDepth?: number;
  // Custom function to extract sub-rows from a row
  getSubRows?: <T extends ExportableData>(row: T) => T[] | undefined;
}

/**
 * Flatten hierarchical data for export
 * Recursively processes rows with sub-rows based on configuration
 */
function flattenDataWithSubRows<T extends ExportableData>(
  data: T[],
  subRowsConfig?: SubRowsExportConfig,
  depth: number = 0
): T[] {
  if (!subRowsConfig?.includeSubRows || !subRowsConfig.getSubRows) {
    return data;
  }

  const flattenedData: T[] = [];
  const maxDepth = subRowsConfig.maxDepth ?? Infinity;
  const indentation = subRowsConfig.subRowIndentation ?? "  ";

  for (const row of data) {
    // Add the parent row
    if (subRowsConfig.includeSubRows === 'flatten' && depth > 0) {
      // Add indentation to all string fields for CSV
      const indentedRow = { ...row };
      // Find the first string field to add indentation to
      const firstStringKey = Object.keys(row).find(key => 
        typeof row[key] === 'string' && row[key]
      );
      if (firstStringKey) {
        const originalValue = String(row[firstStringKey]);
        (indentedRow as any)[firstStringKey] = `${indentation.repeat(depth)}${originalValue}`;
      }
      flattenedData.push(indentedRow);
    } else {
      flattenedData.push(row);
    }

    // Process sub-rows if they exist and we haven't exceeded max depth
    if (depth < maxDepth) {
      const subRows = subRowsConfig.getSubRows(row);
      if (subRows && subRows.length > 0) {
        const flattenedSubRows = flattenDataWithSubRows(
          subRows,
          subRowsConfig,
          depth + 1
        );
        flattenedData.push(...flattenedSubRows);
      }
    }
  }

  return flattenedData;
}

/**
 * Convert array of objects to CSV string
 */
function convertToCSV<T extends ExportableData>(
  data: T[], 
  headers: string[], 
  columnMapping?: Record<string, string>,
  transformFunction?: DataTransformFunction<T>,
  subRowsConfig?: SubRowsExportConfig
): string {
  if (data.length === 0) {
    throw new Error("No data to export");
  }

  // Flatten data with sub-rows if configured
  const processedData = flattenDataWithSubRows(data, subRowsConfig);

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
  for (const item of processedData) {
    // Apply transformation function if provided
    const transformedItem = transformFunction ? transformFunction(item) : item;
    
    const row = headers.map(header => {
      // Get the value for this header from the transformed item
      const value = transformedItem[header];

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
  columnMapping?: Record<string, string>,
  transformFunction?: DataTransformFunction<T>,
  subRowsConfig?: SubRowsExportConfig
): boolean {
  if (data.length === 0) {
    console.error("No data to export");
    return false;
  }

  try {
    // Apply transformation function first if provided, then filter data to only include specified headers
    const processedData = data.map(item => {
      // Apply transformation function if provided
      const transformedItem = transformFunction ? transformFunction(item) : item;
      
      // Filter to only include specified headers
      const filteredItem: ExportableData = {};
      for (const header of headers) {
        if (header in transformedItem) {
          filteredItem[header] = transformedItem[header];
        }
      }
      return filteredItem;
    });

    const csvContent = convertToCSV(processedData as T[], headers, columnMapping, transformFunction, subRowsConfig);
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
  columnMapping?: Record<string, string>,
  columnWidths?: Array<{ wch: number }>,
  headers?: string[],
  transformFunction?: DataTransformFunction<T>,
  subRowsConfig?: SubRowsExportConfig
): boolean {
  if (data.length === 0) {
    console.error("No data to export");
    return false;
  }

  try {
    // Flatten data with sub-rows if configured
    const processedData = flattenDataWithSubRows(data, subRowsConfig);

    // If no column mapping is provided, create one from the data keys
    const mapping = columnMapping ||
      Object.keys(processedData[0] || {}).reduce((acc, key) => {
        acc[key] = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
        return acc;
      }, {} as Record<string, string>);

    // Apply transformation function first if provided, then map data to worksheet format
    const worksheetData = processedData.map(item => {
      // Apply transformation function if provided
      const transformedItem = transformFunction ? transformFunction(item) : item;
      
      const row: ExportableData = {};
      // If headers are provided, only include those columns
      const columnsToExport = headers || Object.keys(mapping);
      for (const key of columnsToExport) {
        if (key in transformedItem) {
          row[mapping[key]] = transformedItem[key];
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
 * Enhanced export function that works with advanced sub-row configurations
 */
export async function exportAdvancedSubRowData<T extends ExportableData>(
  type: "csv" | "excel",
  getData: () => Promise<T[]>,
  advancedConfig: import('./advanced-sub-rows').AdvancedSubRowExportConfig<T>,
  onLoadingStart?: () => void,
  onLoadingEnd?: () => void,
  options?: {
    entityName?: string;
  }
): Promise<boolean> {
  const TOAST_ID = "export-advanced-subrow-toast";
  
  try {
    if (onLoadingStart) onLoadingStart();

    toast.loading("Preparing advanced export...", {
      description: "Processing hierarchical data...",
      id: TOAST_ID
    });

    const data = await getData();

    if (data.length === 0) {
      toast.error("Export failed", {
        description: "No data available to export.",
        id: TOAST_ID
      });
      return false;
    }

    const entityName = options?.entityName || "data";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Handle different export strategies
    switch (advancedConfig.strategy) {
      case 'skip':
        toast.info("Export skipped", {
          description: "Sub-rows export is disabled for this data type.",
          id: TOAST_ID
        });
        return false;

      case 'separate-sheets':
        if (type === 'excel') {
          return await exportSeparateSheets(data, advancedConfig, `${entityName}-${timestamp}`, TOAST_ID);
        } else {
          // Fall back to flatten for CSV
          return await exportFlattened(data, advancedConfig, `${entityName}-${timestamp}`, type, TOAST_ID);
        }

      case 'flatten':
      case 'nest':
      case 'smart-auto':
      default:
        return await exportFlattened(data, advancedConfig, `${entityName}-${timestamp}`, type, TOAST_ID);
    }

  } catch (error) {
    console.error("Error exporting advanced sub-row data:", error);
    
    toast.error("Export failed", {
      description: "There was a problem exporting the hierarchical data.",
      id: TOAST_ID
    });
    return false;
  } finally {
    if (onLoadingEnd) onLoadingEnd();
  }
}

/**
 * Export data with separate sheets per row type (Excel only)
 */
async function exportSeparateSheets<T extends ExportableData>(
  data: T[],
  config: import('./advanced-sub-rows').AdvancedSubRowExportConfig<T>,
  filename: string,
  toastId: string
): Promise<boolean> {
  try {
    toast.loading("Creating separate sheets...", {
      description: "Organizing data by type...",
      id: toastId
    });

    // Group data by row type
    const dataByType: Record<string, T[]> = {};
    
    const addRowToType = (row: T, getRowTypeFn?: (row: T) => string) => {
      let rowType = 'default';
      if (getRowTypeFn) {
        rowType = getRowTypeFn(row);
      } else {
        // Auto-detect row type
        if ('orderId' in row || 'orderNumber' in row) rowType = 'order';
        else if ('productId' in row || 'productName' in row) rowType = 'product';
        else if ('parentId' in row) rowType = 'child';
      }
      
      if (!dataByType[rowType]) {
        dataByType[rowType] = [];
      }
      dataByType[rowType].push(row);
    };

    // Process all data including sub-rows
    data.forEach(row => {
      addRowToType(row);
      
      // Process sub-rows if they exist
      if (config.fieldExtractorByType) {
        // Use custom field extractor to get sub-rows
        Object.keys(config.fieldExtractorByType).forEach(rowType => {
          const extractor = config.fieldExtractorByType![rowType];
          const extracted = extractor(row);
          if (extracted && typeof extracted === 'object') {
            // This would need to be handled based on the specific extractor logic
          }
        });
      } else {
        // Try to find sub-rows using common patterns
        const subRowsKeys = ['subRows', 'children', 'items'];
        for (const key of subRowsKeys) {
          if (key in row && Array.isArray(row[key])) {
            (row[key] as T[]).forEach(subRow => addRowToType(subRow));
          }
        }
      }
    });

    // Create workbook with separate sheets
    const workbook = XLSX.utils.book_new();

    Object.entries(dataByType).forEach(([rowType, typeData]) => {
      if (typeData.length === 0) return;

      const headers = config.headersByType?.[rowType] || Object.keys(typeData[0]);
      const columnMapping = config.columnMappingByType?.[rowType] || {};

      // Transform data for this row type
      const worksheetData = typeData.map(item => {
        const row: ExportableData = {};
        headers.forEach(header => {
          const mappedHeader = columnMapping[header] || header;
          if (header in item) {
            row[mappedHeader] = item[header];
          }
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const sheetName = config.excelConfig?.sheetNames?.[rowType] || rowType.charAt(0).toUpperCase() + rowType.slice(1);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // Generate and download Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    downloadFile(blob, `${filename}.xlsx`);

    const totalRows = Object.values(dataByType).reduce((sum, arr) => sum + arr.length, 0);
    toast.success("Export successful", {
      description: `Exported ${totalRows} items across ${Object.keys(dataByType).length} sheets.`,
      id: toastId
    });

    return true;
  } catch (error) {
    console.error("Error creating separate sheets:", error);
    return false;
  }
}

/**
 * Export flattened hierarchical data
 */
async function exportFlattened<T extends ExportableData>(
  data: T[],
  config: import('./advanced-sub-rows').AdvancedSubRowExportConfig<T>,
  filename: string,
  type: "csv" | "excel",
  toastId: string
): Promise<boolean> {
  try {
    toast.loading("Flattening hierarchical data...", {
      description: "Processing parent-child relationships...",
      id: toastId
    });

    // Flatten the data
    const flattenedData: T[] = [];
    
    const flattenRow = (row: T, depth: number = 0) => {
      // Add indentation for CSV if specified
      if (type === 'csv' && depth > 0 && config.flatten?.indentationByType) {
        const rowType = getRowTypeFromData(row);
        const indentation = config.flatten.indentationByType[rowType] || '  ';
        const indentedRow = { ...row };
        
        // Apply indentation to first string field
        const firstStringKey = Object.keys(row).find(key => typeof row[key] === 'string');
        if (firstStringKey) {
          const originalValue = String(row[firstStringKey]);
          (indentedRow as any)[firstStringKey] = `${indentation.repeat(depth)}${originalValue}`;
        }
        flattenedData.push(indentedRow);
      } else {
        flattenedData.push(row);
      }

      // Process sub-rows
      const maxDepth = config.flatten?.maxDepth ?? Infinity;
      if (depth < maxDepth) {
        const subRowsKeys = ['subRows', 'children', 'items'];
        for (const key of subRowsKeys) {
          if (key in row && Array.isArray(row[key])) {
            (row[key] as T[]).forEach(subRow => flattenRow(subRow, depth + 1));
          }
        }
      }
    };

    data.forEach(row => flattenRow(row));

    // Export the flattened data
    if (type === 'csv') {
      const headers = Object.keys(flattenedData[0] || {});
      const success = exportToCSV(flattenedData, filename, headers);
      
      if (success) {
        toast.success("Export successful", {
          description: `Exported ${flattenedData.length} flattened rows to CSV.`,
          id: toastId
        });
      }
      return success;
    } else {
      const success = exportToExcel(flattenedData, filename);
      
      if (success) {
        toast.success("Export successful", {
          description: `Exported ${flattenedData.length} flattened rows to Excel.`,
          id: toastId
        });
      }
      return success;
    }
  } catch (error) {
    console.error("Error flattening data:", error);
    return false;
  }
}

/**
 * Helper function to determine row type from data
 */
function getRowTypeFromData<T extends ExportableData>(row: T): string {
  if ('orderId' in row || 'orderNumber' in row) return 'order';
  if ('productId' in row || 'productName' in row) return 'product';
  if ('customerId' in row || 'customerName' in row) return 'customer';
  if ('parentId' in row) return 'child';
  return 'default';
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
    transformFunction?: DataTransformFunction<T>;
    subRowsConfig?: SubRowsExportConfig;
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
      success = exportToCSV(
        exportData, 
        filename, 
        options?.headers, 
        options?.columnMapping,
        options?.transformFunction,
        options?.subRowsConfig
      );
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
        options?.headers,
        options?.transformFunction,
        options?.subRowsConfig
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
