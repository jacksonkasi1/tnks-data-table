import type { TableConfig } from "@/components/data-table/utils/table-config";

export const tableConfig: TableConfig = {
  enableRowSelection: true,
  enableKeyboardNavigation: true,
  enableClickRowSelect: false,
  enablePagination: true,
  enableSearch: true,
  enableColumnFilters: true,
  enableDateFilter: false,
  enableColumnVisibility: true,
  enableExport: true,
  enableUrlState: true,
  enableColumnResizing: true,
  enableToolbar: true,
  size: 'default',
  allowExportNewColumns: true,
  
  // Sub-rows configuration
  enableExpanding: true,
  paginateExpandedRows: false,
  filterFromLeafRows: true,
};

export const useExportConfig = () => ({
  entityName: "ecommerce-orders",
  columnMapping: {
    orderInfo: "Order/Product",
    statusCategory: "Status/Category",
    dateBrand: "Date/Brand", 
    amount: "Amount",
    // Add individual field mappings
    orderNumber: "Order Number",
    customerName: "Customer Name",
    orderDate: "Order Date",
    status: "Status",
    total: "Total",
    productName: "Product Name",
    sku: "SKU",
    price: "Price",
    quantity: "Quantity",
    category: "Category",
    brand: "Brand",
    totalPrice: "Total Price"
  },
  columnWidths: [
    { wch: 30 }, // Order/Product
    { wch: 20 }, // Status/Category
    { wch: 20 }, // Date/Brand
    { wch: 15 }, // Amount
  ],
  headers: ["orderInfo", "statusCategory", "dateBrand", "amount"],
  transformFunction: (row: any) => {
    // Handle both order and product data
    const isOrder = 'orderNumber' in row;
    
    if (isOrder) {
      return {
        orderInfo: `${row.orderNumber} - ${row.customerName}`,
        statusCategory: row.status,
        dateBrand: new Date(row.orderDate).toLocaleDateString(),
        amount: `$${Number(row.total).toFixed(2)}`,
        // Individual fields for detailed export
        orderNumber: row.orderNumber,
        customerName: row.customerName,
        orderDate: row.orderDate,
        status: row.status,
        total: row.total,
        productName: '',
        sku: '',
        price: '',
        quantity: '',
        category: '',
        brand: '',
        totalPrice: ''
      };
    } else {
      // This is a product row
      return {
        orderInfo: row.productName,
        statusCategory: row.category,
        dateBrand: row.brand,
        amount: `$${Number(row.price).toFixed(2)} × ${row.quantity}`,
        // Individual fields for detailed export
        orderNumber: '',
        customerName: '',
        orderDate: '',
        status: '',
        total: '',
        productName: row.productName,
        sku: row.sku,
        price: row.price,
        quantity: row.quantity,
        category: row.category,
        brand: row.brand,
        totalPrice: row.totalPrice
      };
    }
  },
  // Add sub-rows configuration for proper hierarchical export
  subRowsConfig: {
    includeSubRows: 'flatten' as const,
    subRowIndentation: "  ",
    maxDepth: 2,
    getSubRows: (row: any) => row.subRows
  }
});