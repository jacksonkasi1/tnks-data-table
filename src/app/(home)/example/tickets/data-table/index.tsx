"use client";

// ** import components
import { DataTable } from "@/components/data-table/data-table";

// ** import schema
import { Ticket } from "./schema";

// ** import columns
import { getColumns, CommentComponent } from "./components/columns";

// ** import utils
import { useExportConfig } from "./utils/config";
import { useTicketsData } from "./utils/data-fetching";

export function TicketsDataTable() {
  return (
    <DataTable<Ticket, unknown>
      getColumns={getColumns}
      fetchDataFn={useTicketsData}
      idField="id"
      pageSizeOptions={[10, 20, 30, 50]}
      exportConfig={useExportConfig()}
      subRowsConfig={{
        enabled: true,
        mode: "custom-component",
        SubRowComponent: CommentComponent,
        hideExpandIconWhenSingle: false,
        autoExpandSingle: false,
        indentSize: 0,
      }}
      config={{
        enableRowSelection: true,
        enableToolbar: true,
        enablePagination: true,
        enableColumnResizing: true,
        columnResizingTableId: "tickets-table",
        defaultSortBy: "created_at",
      }}
    />
  );
}
