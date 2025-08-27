// E-commerce mock data demonstrating advanced sub-rows with orders and products
export interface OrderWithProducts {
  // Order fields
  orderId: number;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  itemCount: number;
  shippingAddress: string;
  
  // Sub-rows (products)
  subRows?: ProductItem[];
  
  // Make it compatible with ExportableData
  [key: string]: string | number | boolean | null | undefined | ProductItem[];
}

export interface ProductItem {
  // Product fields
  productId: number;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  category: string;
  brand: string;
  totalPrice: number;
  
  // Reference to parent order
  parentOrderId: number;
  
  // Make it compatible with ExportableData
  [key: string]: string | number | boolean | null | undefined;
}

// Union type for the data that can appear in rows
export type EcommerceRowData = OrderWithProducts | ProductItem;

// Mock orders with products
export const mockOrdersWithProducts: OrderWithProducts[] = [
  {
    orderId: 1001,
    orderNumber: "ORD-2024-001",
    customerName: "Alice Johnson",
    orderDate: "2024-01-15",
    status: "delivered",
    total: 1299.97,
    itemCount: 3,
    shippingAddress: "123 Main St, New York, NY 10001",
    subRows: [
      {
        productId: 5001,
        productName: "MacBook Air M2",
        sku: "MBA-M2-256",
        price: 999.00,
        quantity: 1,
        category: "Electronics",
        brand: "Apple",
        totalPrice: 999.00,
        parentOrderId: 1001
      },
      {
        productId: 5002,
        productName: "Magic Mouse",
        sku: "MM-WHT-001",
        price: 79.00,
        quantity: 1,
        category: "Accessories",
        brand: "Apple",
        totalPrice: 79.00,
        parentOrderId: 1001
      },
      {
        productId: 5003,
        productName: "USB-C Hub",
        sku: "HUB-7P-001",
        price: 221.97,
        quantity: 1,
        category: "Accessories",
        brand: "Belkin",
        totalPrice: 221.97,
        parentOrderId: 1001
      }
    ]
  },
  {
    orderId: 1002,
    orderNumber: "ORD-2024-002",
    customerName: "Bob Smith",
    orderDate: "2024-01-18",
    status: "processing",
    total: 2847.96,
    itemCount: 4,
    shippingAddress: "456 Oak Ave, Los Angeles, CA 90210",
    subRows: [
      {
        productId: 5004,
        productName: "iPhone 15 Pro",
        sku: "IP15P-256-TI",
        price: 1199.00,
        quantity: 2,
        category: "Electronics",
        brand: "Apple",
        totalPrice: 2398.00,
        parentOrderId: 1002
      },
      {
        productId: 5005,
        productName: "AirPods Pro",
        sku: "APP-2ND-001",
        price: 249.00,
        quantity: 1,
        category: "Audio",
        brand: "Apple",
        totalPrice: 249.00,
        parentOrderId: 1002
      },
      {
        productId: 5006,
        productName: "iPhone Case",
        sku: "IPC-LTH-BLK",
        price: 59.99,
        quantity: 2,
        category: "Accessories",
        brand: "Apple",
        totalPrice: 119.98,
        parentOrderId: 1002
      },
      {
        productId: 5007,
        productName: "Screen Protector",
        sku: "SP-TPD-001",
        price: 39.99,
        quantity: 2,
        category: "Accessories",
        brand: "Zagg",
        totalPrice: 79.98,
        parentOrderId: 1002
      }
    ]
  },
  {
    orderId: 1003,
    orderNumber: "ORD-2024-003",
    customerName: "Carol Davis",
    orderDate: "2024-01-20",
    status: "shipped",
    total: 549.98,
    itemCount: 2,
    shippingAddress: "789 Pine Rd, Chicago, IL 60601",
    subRows: [
      {
        productId: 5008,
        productName: "iPad Air",
        sku: "IPA-5TH-64",
        price: 449.00,
        quantity: 1,
        category: "Electronics",
        brand: "Apple",
        totalPrice: 449.00,
        parentOrderId: 1003
      },
      {
        productId: 5009,
        productName: "Apple Pencil",
        sku: "AP-2ND-001",
        price: 100.98,
        quantity: 1,
        category: "Accessories",
        brand: "Apple",
        totalPrice: 100.98,
        parentOrderId: 1003
      }
    ]
  },
  {
    orderId: 1004,
    orderNumber: "ORD-2024-004",
    customerName: "David Wilson",
    orderDate: "2024-01-22",
    status: "pending",
    total: 1849.95,
    itemCount: 1,
    shippingAddress: "321 Elm St, Houston, TX 77001",
    subRows: [
      {
        productId: 5010,
        productName: "MacBook Pro 14\"",
        sku: "MBP-14-512",
        price: 1849.95,
        quantity: 1,
        category: "Electronics",
        brand: "Apple",
        totalPrice: 1849.95,
        parentOrderId: 1004
      }
    ]
  },
  {
    orderId: 1005,
    orderNumber: "ORD-2024-005",
    customerName: "Eva Brown",
    orderDate: "2024-01-25",
    status: "cancelled",
    total: 0,
    itemCount: 0,
    shippingAddress: "654 Maple Dr, Miami, FL 33101",
    subRows: [] // Cancelled order with no products
  }
];

// Function to extract products from an order
export const getOrderProducts = (order: OrderWithProducts): ProductItem[] | undefined => {
  return order.subRows;
};

// Type guard functions
export const isOrder = (row: EcommerceRowData): row is OrderWithProducts => {
  return 'orderId' in row && 'orderNumber' in row;
};

export const isProduct = (row: EcommerceRowData): row is ProductItem => {
  return 'productId' in row && 'parentOrderId' in row;
};

// Mock API function
export const fetchOrdersWithProducts = async (): Promise<{
  success: boolean;
  data: OrderWithProducts[];
  pagination: {
    page: number;
    limit: number;
    total_pages: number;
    total_items: number;
  };
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // CRITICAL FIX: Ensure subRows are directly accessible for TanStack Table
  const dataWithDirectSubRows = mockOrdersWithProducts.map(order => ({
    ...order,
    // TanStack Table expects subRows to be directly accessible
    subRows: order.subRows || []
  }));

  return {
    success: true,
    data: dataWithDirectSubRows,
    pagination: {
      page: 1,
      limit: 50,
      total_pages: 1,
      total_items: mockOrdersWithProducts.length
    }
  };
};

// Simple function to fetch orders for the basic data table
export const fetchOrders = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: mockOrdersWithProducts.map(order => ({
      id: order.orderId,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      orderDate: order.orderDate,
      status: order.status,
      total: order.total,
      itemCount: order.itemCount,
      shippingAddress: order.shippingAddress
    })),
    pagination: {
      page: 1,
      limit: 10,
      total_pages: Math.ceil(mockOrdersWithProducts.length / 10),
      total_items: mockOrdersWithProducts.length
    }
  };
};

// Status color mapping for UI
export const getStatusColor = (status: OrderWithProducts['status']) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Category color mapping for products
export const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Electronics: 'bg-blue-100 text-blue-800',
    Audio: 'bg-green-100 text-green-800',
    Accessories: 'bg-purple-100 text-purple-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};