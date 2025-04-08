import { User } from "@/app/(home)/data-table-components/schema";
import { toast } from "sonner";

// Define column headers for User exports
const USER_EXPORT_HEADERS = [
  "id",
  "name",
  "email",
  "phone",
  "age",
  "created_at",
  "expense_count",
  "total_expenses"
];

/**
 * Convert array of objects to CSV string
 */
function convertToCSV(data: User[], headers: string[]): string {
  if (data.length === 0) {
    throw new Error("No data to export");
  }
  
  // Create CSV header row
  let csvContent = headers.join(",") + "\n";
  
  // Add data rows
  data.forEach(user => {
    const row = headers.map(header => {
      // Get the value for this header
      const value = user[header as keyof User];
      
      // Convert all values to string and properly escape for CSV
      const cellValue = value === null || value === undefined ? "" : String(value);
      // Escape quotes and wrap in quotes if contains comma
      const escapedValue = cellValue.includes(",") || cellValue.includes('"') 
        ? `"${cellValue.replace(/"/g, '""')}"`
        : cellValue;
        
      return escapedValue;
    });
    
    csvContent += row.join(",") + "\n";
  });
  
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
export function exportToCSV(data: User[], filename: string): boolean {
  if (data.length === 0) {
    console.error("No data to export");
    return false;
  }

  try {
    const csvContent = convertToCSV(data, USER_EXPORT_HEADERS);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    downloadFile(blob, `${filename}.csv`);
    return true;
  } catch (error) {
    console.error("Error creating CSV:", error);
    return false;
  }
}

/**
 * Export data to Excel file (CSV with .xlsx extension)
 */
export function exportToExcel(data: User[], filename: string): boolean {
  if (data.length === 0) {
    console.error("No data to export");
    return false;
  }

  try {
    const csvContent = convertToCSV(data, USER_EXPORT_HEADERS);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
export async function exportData(
  type: "csv" | "excel",
  getData: () => Promise<User[]>,
  onLoadingStart?: () => void,
  onLoadingEnd?: () => void
): Promise<boolean> {
  try {
    // Start loading
    if (onLoadingStart) onLoadingStart();
    
    // Show toast for long operations
    const loadingToast = toast.loading("Preparing export data...", {
      description: "Fetching data for export..."
    });
    
    // Get the data
    const exportData = await getData();
    
    // Clear all loading toasts
    toast.dismiss(loadingToast);
    toast.dismiss("fetch-selected-users");
    toast.dismiss("export-loading");
    
    if (exportData.length === 0) {
      toast.error("Export failed", {
        description: "No data available to export."
      });
      return false;
    }
    
    // Generate timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `users-export-${timestamp}`;
    
    // Export based on type
    let success = false;
    if (type === "csv") {
      success = exportToCSV(exportData, filename);
      if (success) {
        toast.success("Export successful", {
          description: `Exported ${exportData.length} user(s) to CSV.`,
        });
      }
    } else {
      success = exportToExcel(exportData, filename);
      if (success) {
        toast.success("Export successful", {
          description: `Exported ${exportData.length} user(s) to Excel.`,
        });
      }
    }
    
    return success;
  } catch (error) {
    console.error("Error exporting data:", error);
    // Clear all loading toasts in case of error too
    toast.dismiss("fetch-selected-users");
    toast.dismiss("export-loading");
    
    toast.error("Export failed", {
      description: "There was a problem exporting the data. Please try again."
    });
    return false;
  } finally {
    // End loading regardless of result
    if (onLoadingEnd) onLoadingEnd();
  }
} 