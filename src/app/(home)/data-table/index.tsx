"use client";

// ** Import Date Table
import { DataTable } from "@/components/data-table/data-table";

// ** Import Table Config & Columns
import { getColumns } from "./components/columns";
import { useExportConfig } from "./utils/config";

// ** Import API
import { fetchUsersByIds } from "@/api/user/fetch-users-by-ids";
import { useUsersData } from "./utils/data-fetching";

// ** Import Toolbar Options
import { ToolbarOptions } from "./components/toolbar-options";

// ** Import Types
import { User } from "./schema";

export default function UserTable() {
  return (
    <DataTable<User, unknown>
      getColumns={getColumns}
      exportConfig={useExportConfig()}
      fetchDataFn={useUsersData}
      fetchByIdsFn={fetchUsersByIds}
      idField="id"
      pageSizeOptions={[10, 20, 30, 40, 50, 100, 150]}
      renderToolbarContent={({ selectedRows, allSelectedIds, totalSelectedCount, resetSelection }) => (
        <ToolbarOptions
          selectedUsers={selectedRows.map(row => ({
            id: row.id,
            name: row.name,
          }))}
          allSelectedUserIds={allSelectedIds}
          totalSelectedCount={totalSelectedCount}
          resetSelection={resetSelection}
        />
      )}
      config={{
        enableRowSelection: true,
        enableClickRowSelect: false,
        enableKeyboardNavigation: true,
        enableSearch: true,
        enableDateFilter: true,
        enableColumnVisibility: true,
        enableUrlState: true,
        size: "default",
        columnResizingTableId: "user-table",
        searchPlaceholder: "Search users",
        defaultSortBy: "created_at",        // Snake_case sorting (matches API response)
        defaultSortOrder: "desc"
      }}
    />
  );
}
