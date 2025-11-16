export interface Order
  extends Record<
    string,
    string | number | boolean | null | undefined | Order[]
  > {
  // ** Order identifiers
  id: number;
  order_id: string;

  // ** Customer information
  customer_name: string;
  customer_email: string;

  // ** Order metadata
  order_date: string;
  status: string;
  total_items: number;
  total_amount: string;
  shipping_address: string;
  payment_method: string;
  created_at: string;

  // ** First item data (merged with parent row)
  item_id?: number;
  product_name: string | null;
  quantity: number | null;
  price: string | null;
  subtotal: string | null;

  // ** Subrows (remaining items)
  subRows?: Order[];
}
