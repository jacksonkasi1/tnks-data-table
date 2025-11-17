import { useMemo } from "react";

/**
 * Export configuration for orders data table
 */
export function useExportConfig() {
  // Column mapping for export
  const columnMapping = useMemo(() => {
    return {
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
    };
  }, []);

  // Column widths for Excel export
  const columnWidths = useMemo(() => {
    return [
      { wch: 15 }, // order_id
      { wch: 25 }, // customer_name
      { wch: 25 }, // product_name
      { wch: 10 }, // quantity
      { wch: 12 }, // price
      { wch: 12 }, // subtotal
      { wch: 12 }, // total_items
      { wch: 15 }, // total_amount
      { wch: 12 }, // status
      { wch: 15 }, // order_date
    ];
  }, []);

  // Headers for CSV export
  const headers = useMemo(() => {
    return [
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
    ];
  }, []);

  // Subrow export configuration
  const subRowExportConfig = useMemo(() => {
    return {
      entityName: "order-items",
      columnMapping: {
        order_id: "Order ID",
        product_name: "Product",
        quantity: "Quantity",
        price: "Price",
        subtotal: "Subtotal",
      },
      columnWidths: [
        { wch: 15 }, // order_id
        { wch: 25 }, // product_name
        { wch: 10 }, // quantity
        { wch: 12 }, // price
        { wch: 12 }, // subtotal
      ],
      headers: ["order_id", "product_name", "quantity", "price", "subtotal"],
    };
  }, []);

  return {
    columnMapping,
    columnWidths,
    headers,
    entityName: "orders",
    subRowExportConfig,
  };
}
