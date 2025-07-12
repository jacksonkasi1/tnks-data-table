import { useMemo } from "react";
import { CaseFormatConfig } from "@/components/data-table/utils/case-utils";
import { DataTransformFunction } from "@/components/data-table/utils/export-utils";
import { formatTimestampToReadable, formatCurrency } from "@/utils/format";
import type { UserCamelCase } from "../schema";

/**
 * Export configuration for the camelCase users data table
 */
export function useExportConfig() {
  // Column mapping for export (camelCase version)
  const columnMapping = useMemo(() => {
    return {
      id: "ID",
      name: "Name",
      email: "Email",
      phone: "Phone",
      age: "Age",
      createdAt: "Joined Date",
      expenseCount: "Expense Count",
      totalExpenses: "Total Expenses"
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
  
  // Headers for CSV export (camelCase version)
  const headers = useMemo(() => {
    return [
      "id",
      "name",
      "email",
      "phone",
      "age",
      "createdAt",
      "expenseCount",
      "totalExpenses"
    ];
  }, []);

  // Case formatting configuration for camelCase table
  const caseConfig: CaseFormatConfig = useMemo(() => ({
    urlFormat: 'camelCase', // URL parameters use camelCase
    apiFormat: 'camelCase', // API parameters also use camelCase
  }), []);

  // Example transformation function showcasing different formatting options
  const transformFunction: DataTransformFunction<UserCamelCase> = useMemo(() => (row: UserCamelCase) => ({
    ...row,
    // Format timestamps to human-readable format
    createdAt: formatTimestampToReadable(row.createdAt),
    // Format currency values
    totalExpenses: formatCurrency(row.totalExpenses),
    // Add any other custom transformations as needed
  }), []);

  return {
    columnMapping,
    columnWidths,
    headers,
    entityName: "users-camel-case",
    caseConfig,
    transformFunction
  };
}