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

// ** import api
import { fetchOrdersByIds } from "@/api/order/fetch-orders-by-ids";

// ** import toolbar
import { ToolbarOptions } from "./components/toolbar-options";

export function OrdersDataTable() {
  return (
    <DataTable<Order, unknown>
      getColumns={getColumns}
      fetchDataFn={useOrdersData}
      fetchByIdsFn={fetchOrdersByIds}
      idField="id"
      pageSizeOptions={[10, 20, 30, 50]}
      exportConfig={useExportConfig()}
      renderToolbarContent={({
        selectedRows,
        allSelectedIds,
        totalSelectedCount,
        resetSelection,
      }) => {
        // Separate parent orders from child items
        const parentOrders = selectedRows.filter(
          (row) => !row.item_id || row.item_id === undefined
        );
        const childItems = selectedRows.filter(
          (row) => row.item_id !== undefined && row.item_id !== null
        );

        // Get parent order_ids to check if child's parent is also selected
        const parentOrderIds = new Set(
          parentOrders.map((order) => order.order_id)
        );

        // Filter out child items whose parent order is already selected
        const independentChildItems = childItems.filter(
          (child) => !parentOrderIds.has(child.order_id)
        );

        return (
          <ToolbarOptions
            selectedOrders={selectedRows.map((row) => ({
              id: row.id,
              order_id: row.order_id,
              item_id: row.item_id,
            }))}
            parentOrders={parentOrders.map((row) => ({
              id: row.id,
              order_id: row.order_id,
            }))}
            independentChildItems={independentChildItems.map((row) => ({
              id: row.id,
              order_id: row.order_id,
              item_id: row.item_id,
            }))}
            allSelectedIds={allSelectedIds}
            totalSelectedCount={totalSelectedCount}
            resetSelection={resetSelection}
          />
        );
      }}
      subRowsConfig={{
        enabled: true,
        mode: "same-columns", // "same-columns" | "nested"
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
