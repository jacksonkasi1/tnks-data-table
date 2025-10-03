export interface Order extends Record<string, string | number | boolean | null | undefined | Order[]> {
  id: number; // Order ID (for parent rows)
  order_id: string;
  customer_name: string;
  customer_email: string;
  order_date: string;
  status: string;
  total_items: number;
  total_amount: string;
  shipping_address: string;
  payment_method: string;
  created_at: string;
  // First item data (merged with parent)
  item_id?: number; // Order item ID (for parent row's first item)
  product_name: string | null;
  quantity: number | null;
  price: string | null;
  subtotal: string | null;
  // Subrows (remaining items)
  subRows?: Order[];
}
