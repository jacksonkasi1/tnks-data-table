import { useMemo } from "react";
import { CaseFormatConfig, DEFAULT_CASE_CONFIG } from "@/components/data-table/utils/case-utils";
import { DataTransformFunction } from "@/components/data-table/utils/export-utils";
import { formatCurrency, formatTimestampToReadable } from "@/utils/format";
import type { User } from "../schema";

/**
 * Default export configuration for the users data table
 */
export function useExportConfig() {
  // Column mapping for export - include NEW column headers
  const columnMapping = useMemo(() => {
    return {
      id: "ID",
      name: "Name",
      email: "Email",
      phone: "Phone",
      age: "Age",
      created_at: "Joined Date",
      expense_count: "Expense Count",
      total_expenses: "Total Expenses",
      // Map new columns to readable headers
      status: "Account Status",
      expense_category: "Spending Category", 
      years_as_customer: "Years as Customer",
      customer_tier: "Customer Tier"
    };
  }, []);
  
  // Column widths for Excel export - include widths for NEW columns
  const columnWidths = useMemo(() => {
    return [
      { wch: 10 }, // ID
      { wch: 20 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 8 },  // Age
      { wch: 20 }, // Created At
      { wch: 15 }, // Expense Count
      { wch: 15 }, // Total Expenses
      { wch: 15 }, // Account Status
      { wch: 18 }, // Spending Category
      { wch: 18 }, // Years as Customer
      { wch: 15 }  // Customer Tier
    ];
  }, []);
  
  // Headers for CSV export - you can include NEW columns here
  const headers = useMemo(() => {
    return [
      "id",
      "name",
      "email",
      "phone",
      "age",
      "created_at",
      "expense_count",
      "total_expenses",
      // Add new columns that will be created by transformation function
      "status",
      "expense_category",
      "years_as_customer",
      "customer_tier"
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

  // Example transformation function that ADDS NEW COLUMNS
  const transformFunction: DataTransformFunction<User> = useMemo(() => (row: User) => {
    const expenseAmount = parseFloat(row.total_expenses) || 0;
    const currentYear = new Date().getFullYear();
    const joinYear = new Date(row.created_at).getFullYear();
    
    return {
      ...row,
      // Format existing columns
      created_at: formatTimestampToReadable(row.created_at),
      total_expenses: formatCurrency(row.total_expenses),
      
      // Add NEW columns that don't exist in the original data
      status: row.expense_count > 10 ? "ACTIVE" : "INACTIVE",
      expense_category: expenseAmount > 1000 ? "HIGH_SPENDER" : 
                       expenseAmount > 500 ? "MEDIUM_SPENDER" : "LOW_SPENDER",
      years_as_customer: currentYear - joinYear,
      customer_tier: expenseAmount > 2000 ? "PREMIUM" : 
                     expenseAmount > 1000 ? "GOLD" : 
                     expenseAmount > 500 ? "SILVER" : "BRONZE",
    };
  }, []);

  return {
    columnMapping,
    columnWidths,
    headers,
    entityName: "users",
    caseConfig,
    transformFunction // Add the transformation function to the export config
  };
} 