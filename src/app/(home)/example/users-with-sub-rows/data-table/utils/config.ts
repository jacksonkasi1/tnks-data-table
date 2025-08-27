import type { TableConfig } from "@/components/data-table/utils/table-config";

export const tableConfig: TableConfig = {
  enableRowSelection: true,
  enableKeyboardNavigation: true,
  enableClickRowSelect: false,
  enablePagination: true,
  enableSearch: true,
  enableColumnFilters: true,
  enableDateFilter: false,
  enableColumnVisibility: true,
  enableExport: true,
  enableUrlState: true,
  enableColumnResizing: true,
  enableToolbar: true,
  size: 'default',
  allowExportNewColumns: true,
  
  // Sub-rows configuration
  enableExpanding: true,
  paginateExpandedRows: false,
  filterFromLeafRows: true,
  subRowIndentPx: 24, // 24px indentation for sub-rows
};

export const useExportConfig = () => ({
  entityName: "users-with-expenses",
  columnMapping: {
    name: "Name/Expense",
    email: "Email/Category", 
    department: "Department/Date",
    totalExpenses: "Amount",
    // Add sub-row specific fields
    expenseName: "Expense Name",
    category: "Category",
    date: "Date",
    amount: "Amount"
  },
  columnWidths: [
    { wch: 25 }, // Name/Expense
    { wch: 25 }, // Email/Category
    { wch: 20 }, // Department/Date
    { wch: 15 }, // Amount
  ],
  headers: ["name", "email", "department", "totalExpenses", "expenseName", "category", "date", "amount"],
  transformFunction: (row: any) => {
    // Handle both user and expense data
    const isUser = 'email' in row;
    
    if (isUser) {
      return {
        name: row.name,
        email: row.email,
        department: row.department,
        totalExpenses: row.totalExpenses,
        expenseName: '', // Empty for user rows
        category: '',
        date: '',
        amount: ''
      };
    } else {
      // This is an expense row
      return {
        name: row.expenseName,
        email: row.category,
        department: new Date(row.date).toLocaleDateString(),
        totalExpenses: row.amount,
        expenseName: row.expenseName,
        category: row.category,
        date: row.date,
        amount: row.amount
      };
    }
  },
  // Add sub-rows configuration for proper hierarchical export
  subRowsConfig: {
    includeSubRows: 'flatten' as const,
    subRowIndentation: "  ",
    maxDepth: 2,
    getSubRows: (row: any) => row.subRows
  }
});