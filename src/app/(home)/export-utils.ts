import { User } from "@/app/(home)/data-table-components/schema";
import { exportData } from "@/components/data-table/utils/export-utils";

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

// For backward compatibility - specific export for User data
export function exportUserData(
    type: "csv" | "excel",
    getData: () => Promise<User[]>,
    onLoadingStart?: () => void,
    onLoadingEnd?: () => void
  ): Promise<boolean> {
    // Map of User properties to display names for Excel export
    const columnMapping: Record<string, string> = {
      id: "ID",
      name: "Name",
      email: "Email",
      phone: "Phone",
      age: "Age",
      created_at: "Created At",
      expense_count: "Expense Count",
      total_expenses: "Total Expenses"
    };
    
    // Column widths for Excel export
    const columnWidths = [
      { wch: 10 }, // ID
      { wch: 20 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 8 },  // Age
      { wch: 20 }, // Created At
      { wch: 15 }, // Expense Count
      { wch: 15 }  // Total Expenses
    ];

    return exportData(type, getData, onLoadingStart, onLoadingEnd, {
      headers: USER_EXPORT_HEADERS,
      columnMapping,
      columnWidths,
      entityName: "users"
    });
  }