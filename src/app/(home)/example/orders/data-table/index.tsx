"use client";

// ** import components
import { DataTable } from "@/components/data-table/data-table";

// ** import schema
import { Order } from "./schema";

// ** import columns
import { getColumns } from "./components/columns";

// ** import utils
import { useExportConfig } from "./utils/config";
import { useOrdersData } from "./utils/data-fetching";

// ** import toolbar
import { ToolbarOptions } from "./components/toolbar-options";

export function OrdersDataTable() {
  return (
    <DataTable<Order, unknown>
      getColumns={getColumns}
      fetchDataFn={useOrdersData}
      idField="id"
      pageSizeOptions={[10, 20, 30, 50]}
      exportConfig={useExportConfig()}
      renderToolbarContent={({
        selectedRows,
        allSelectedIds,
        totalSelectedCount,
        resetSelection,
      }) => (
        <ToolbarOptions
          selectedOrders={selectedRows.map((row) => ({
            id: row.id,
            order_id: row.order_id,
          }))}
          allSelectedIds={allSelectedIds}
          totalSelectedCount={totalSelectedCount}
          resetSelection={resetSelection}
        />
      )}
      subRowsConfig={{
        enabled: true,
        mode: "same-columns",
        expandIconPosition: "first",
        hideExpandIconWhenSingle: false,
        autoExpandSingle: false,
        indentSize: 24,
      }}
      config={{
        enableRowSelection: true,
        enableToolbar: true,
        enablePagination: true,
        enableColumnResizing: true,
        columnResizingTableId: "orders-table",
        defaultSortBy: "order_id",
      }}
    />
  );
}
