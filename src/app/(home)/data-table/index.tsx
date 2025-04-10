"use client";

import { fetchUsersByIds } from "@/api/user/get-users";
import { fetchUsers } from "@/api/user/get-users";
import { getColumns } from "./columns";
import { DataTable } from "@/components/data-table/data-table";
import { useExportConfig } from "./config";

export default function UserTable() {
  return (
    <DataTable
      getColumns={getColumns}
      exportConfig={useExportConfig()}
      fetchDataFn={fetchUsers}
      fetchByIdsFn={fetchUsersByIds}
      idField="id"
      config={{
        enableRowSelection: true, // Enable row selection
        enableClickRowSelect: false, // Disable clicking rows to select them
        enableKeyboardNavigation: true, // Enable keyboard navigation
        enableSearch: true, // Enable search functionality
        enableDateFilter: true, // Enable date filter
        enableColumnVisibility: true, // Enable column visibility options
        enableUrlState: true, // Enable URL state persistence
        columnResizingTableId: "user-table",
      }}
    />
  );
}
