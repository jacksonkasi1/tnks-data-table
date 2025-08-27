"use client";

// ** Import Date Table
import { DataTable } from "@/components/data-table/data-table";

// ** Import Table Config & Columns
import { getColumns } from "./components/columns";
import { tableConfig, useExportConfig } from "./utils/config";

// ** Import Mock Data
import { fetchUsersWithExpenses, type UserWithExpenses } from "./mock-data";

// ** Import Sub-row presets
import { SUB_ROW_PRESETS } from "@/components/data-table/utils/simple-sub-rows";

export default function UsersWithSubRowsDataTable() {
  return (
    <DataTable
      config={tableConfig}
      getColumns={getColumns}
      exportConfig={useExportConfig()}
      fetchDataFn={fetchUsersWithExpenses}
      idField="id"
      // Custom row ID generator for hierarchical data
      getRowId={(originalRow, index, parent) => {
        // For users, use their ID
        if ('email' in originalRow) {
          return `user-${originalRow.id}`;
        }
        // For expenses, use expense ID + parent user ID to ensure uniqueness
        if ('expenseName' in originalRow && 'parentUserId' in originalRow) {
          return `expense-${originalRow.id}-parent-${originalRow.parentUserId}`;
        }
        // Fallback to index
        return `row-${index}`;
      }}
      pageSizeOptions={[10, 20, 30, 40, 50]}
      // NATIVE APPROACH: Use TanStack Table's built-in sub-rows
      getSubRows={(row) => (row as UserWithExpenses).subRows}
      defaultExpanded={{}}
    />
  );
}
