"use client";

// ** Import Date Table
import { DataTable } from "@/components/data-table/data-table";

// ** Import Table Config & Columns
import { getColumns } from "./components/columns";
import { useExportConfig } from "./utils/config";

// ** Import API
import { fetchUsersByIdsCamelCase } from "@/api/user/fetch-users-by-ids-camel-case";
import { useUsersCamelCaseData } from "./utils/data-fetching";

// ** Import Toolbar Options
import { ToolbarOptions } from "./components/toolbar-options";

// ** Import Types
import { UserCamelCase } from "./schema";

/**
 * UserCamelCaseTable Component
 * 
 * A data table component that demonstrates camelCase field support.
 * This table uses camelCase field names for both API requests and responses.
 * 
 * Features:
 * - Row selection with bulk operations
 * - Search and date filtering
 * - Column sorting and resizing
 * - Data export functionality
 * - URL state persistence
 * 
 * @returns JSX.Element
 */
export default function UserCamelCaseTable() {
  return (
    <DataTable<UserCamelCase, unknown>
      getColumns={getColumns}
      exportConfig={useExportConfig()}
      fetchDataFn={useUsersCamelCaseData}
      fetchByIdsFn={fetchUsersByIdsCamelCase}
      idField="id"
      pageSizeOptions={[10, 20, 30, 40, 50, 100, 150]}
      renderToolbarContent={({ selectedRows, allSelectedIds, totalSelectedCount, resetSelection }) => (
        <ToolbarOptions
          selectedUsers={selectedRows.map(row => ({
            id: Number(row.id),
            name: row.name,
          }))}
          allSelectedUserIds={allSelectedIds.map(id => Number(id))}
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
        columnResizingTableId: "user-camel-case-table",
        searchPlaceholder: "Search users",
        defaultSortBy: "createdAt",         // CamelCase sorting (matches API response)
        defaultSortOrder: "desc"
      }}
    />
  );
}