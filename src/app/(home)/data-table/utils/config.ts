import { useMemo } from "react";
import { CaseFormatConfig, DEFAULT_CASE_CONFIG } from "@/components/data-table/utils/case-utils";

/**
 * Default export configuration for the users data table
 */
export function useExportConfig() {
  // Column mapping for export
  const columnMapping = useMemo(() => {
    return {
      id: "ID",
      name: "Name",
      email: "Email",
      phone: "Phone",
      age: "Age",
      created_at: "Joined Date",
      expense_count: "Expense Count",
      total_expenses: "Total Expenses"
    };
  }, []);
  
  // Column widths for Excel export
  const columnWidths = useMemo(() => {
    return [
      { wch: 10 }, // ID
      { wch: 20 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 8 },  // Age
      { wch: 20 }, // Created At
      { wch: 15 }, // Expense Count
      { wch: 15 }  // Total Expenses
    ];
  }, []);
  
  // Headers for CSV export
  const headers = useMemo(() => {
    return [
      "id",
      "name",
      "email",
      "phone",
      "age",
      "created_at",
      "expense_count",
      "total_expenses"
    ];
  }, []);

  // Case formatting configuration for the table
  const caseConfig: CaseFormatConfig = useMemo(() => ({
    urlFormat: 'camelCase', // URL parameters use camelCase (sortBy, pageSize)
    apiFormat: 'snake_case', // API parameters use snake_case (sort_by, page_size)
    // Custom mapper example (commented out):
    // keyMapper: (key: string) => {
    //   const customMappings: Record<string, string> = {
    //     'sortBy': 'orderBy',
    //     'sortOrder': 'direction',
    //     'pageSize': 'perPage',
    //   };
    //   return customMappings[key] || key;
    // }
  }), []);

  return {
    columnMapping,
    columnWidths,
    headers,
    entityName: "users",
    caseConfig
  };
} 