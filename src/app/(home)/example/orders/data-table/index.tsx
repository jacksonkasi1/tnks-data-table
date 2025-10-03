"use client";

// ** import core packages
import { DataTable } from "@/components/data-table/data-table";

// ** import api
import { fetchOrdersGrouped } from "@/api/order/fetch-orders-grouped";

// ** import schema
import { Order } from "./schema";

// ** import columns
import { getColumns } from "./components/columns";

export function OrdersDataTable() {
  return (
    <DataTable<Order, unknown>
      config={{
        enableRowSelection: true,
        enableToolbar: true,
        enablePagination: true,
        enableColumnResizing: true,
        columnResizingTableId: "orders-table",
        defaultSortBy: "order_id",
      }}
      getColumns={getColumns}
      fetchDataFn={fetchOrdersGrouped}
      exportConfig={{
        entityName: "orders",
        columnMapping: {
          order_id: "Order ID",
          customer_name: "Customer",
          product_name: "Product",
          quantity: "Quantity",
          price: "Price",
          subtotal: "Subtotal",
          total_items: "Total Items",
          total_amount: "Total Amount",
          status: "Status",
          order_date: "Order Date",
        },
        columnWidths: [
          { wch: 15 },
          { wch: 25 },
          { wch: 25 },
          { wch: 10 },
          { wch: 12 },
          { wch: 12 },
          { wch: 12 },
          { wch: 15 },
          { wch: 12 },
          { wch: 15 },
        ],
        headers: [
          "order_id",
          "customer_name",
          "product_name",
          "quantity",
          "price",
          "subtotal",
          "total_items",
          "total_amount",
          "status",
          "order_date",
        ],
      }}
      idField="id"
      pageSizeOptions={[10, 20, 30, 50]}
      subRowsConfig={{
        enabled: true,
        mode: "same-columns",
        expandIconPosition: "first",
        hideExpandIconWhenSingle: false,
        autoExpandSingle: false,
        indentSize: 24,
      }}
    />
  );
}
