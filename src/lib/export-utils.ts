import { User } from "@/app/(home)/data-table-components/schema";

// Convert array of objects to CSV string
export function exportToCSV(data: User[], filename: string) {
  if (data.length === 0) {
    console.error("No data to export");
    return;
  }

  // Define column headers from the data keys 
  // For User schema, we know what fields to include
  const headers = [
    "id",
    "name",
    "email",
    "phone",
    "age",
    "created_at",
    "expense_count",
    "total_expenses"
  ];
  
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
  
  // Create a Blob object with the CSV data
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
  // Create a link element and trigger download
  const link = document.createElement("a");
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export as Excel (actually CSV with .xlsx extension)
export function exportToExcel(data: User[], filename: string) {
  // This still exports CSV, but with the .xlsx extension that Excel will open
  if (data.length === 0) {
    console.error("No data to export");
    return;
  }

  // Define column headers from the data keys
  const headers = [
    "id",
    "name",
    "email",
    "phone",
    "age",
    "created_at",
    "expense_count",
    "total_expenses"
  ];
  
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
  
  // Create a Blob object with the CSV data
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
  // Create a link element and trigger download
  const link = document.createElement("a");
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.xlsx`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} 