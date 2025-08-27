"use client";

// ** Import Date Table
import { DataTable } from "@/components/data-table/data-table";

// ** Import Table Config & Columns
import { getColumns } from "./components/columns";
import { tableConfig, useExportConfig } from "./utils/config";

// ** Import Mock Data
import { fetchOrdersWithProducts, type OrderWithProducts } from "./mock-data";

// ** Import Sub-row presets
import { SUB_ROW_PRESETS } from "@/components/data-table/utils/simple-sub-rows";

export default function EcommerceOrdersDataTable() {
  return (
    <DataTable
      config={tableConfig}
      getColumns={getColumns}
      exportConfig={useExportConfig()}
      fetchDataFn={fetchOrdersWithProducts}
      idField="orderId"
      // Custom row ID generator for hierarchical data
      getRowId={(originalRow, index, parent) => {
        // For orders, use their orderId
        if ('orderNumber' in originalRow) {
          return `order-${originalRow.orderId}`;
        }
        // For products, use product ID + parent order ID to ensure uniqueness
        if ('productName' in originalRow && 'parentOrderId' in originalRow) {
          return `product-${originalRow.productId}-parent-${originalRow.parentOrderId}`;
        }
        // Fallback to index
        return `row-${index}`;
      }}
      pageSizeOptions={[10, 20, 30, 40, 50]}
      // NATIVE APPROACH: Use TanStack Table's built-in sub-rows
      getSubRows={(row) => (row as OrderWithProducts).subRows}
      defaultExpanded={{
        'order-1001': true // Expand first order by default using actual row ID
      }}
    />
  );
}
