"use client";

// ** Import 3rd Party Libs
import { PlusIcon } from "lucide-react";

// ** Import UI Components
import { Button } from "@/components/ui/button";

// ** Import Date Table
import { DataTable } from "@/components/data-table/data-table";

// ** Import Table Config & Columns
import { getColumns } from "./components/columns";
import { useExportConfig } from "./utils/config";

// ** Import API
import { fetchUsersByIds } from "@/api/user/fetch-users-by-ids";
import { fetchUsers } from "@/api/user/fetch-users";

const AddButton = () => (
  <Button size="sm" variant="outline">
    <PlusIcon className="mr-2 h-4 w-4" />
    Add User
  </Button>
);

export default function UserTable() {
  return (
    <DataTable
      getColumns={getColumns}
      exportConfig={useExportConfig()}
      fetchDataFn={fetchUsers}
      fetchByIdsFn={fetchUsersByIds}
      idField="id"
      pageSizeOptions={[10, 20, 30, 40, 50, 100, 150]}
      customToolbarComponent={<AddButton />}
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
