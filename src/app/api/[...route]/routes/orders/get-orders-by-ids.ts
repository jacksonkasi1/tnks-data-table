// ** import core packages
import { Hono } from "hono";

// ** import validation
import { z } from "zod";

// ** import database
import { eq, inArray } from "drizzle-orm";

// ** import db
import { db } from "@/db";

// ** import schema
import { orders } from "@/db/schema/tbl_orders";
import { orderItems } from "@/db/schema/tbl_order_items";

const router = new Hono();

// Maximum subrows per parent (configurable constant)
const MAX_SUBROWS_PER_ORDER = 20;

// Schema for query parameters
const querySchema = z.object({
  ids: z.string(),
});

// Get orders by IDs with nested items
router.get("/", async (c) => {
  try {
    // Parse and validate query parameters
    const result = querySchema.safeParse(c.req.query());

    if (!result.success) {
      return c.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: result.error.format(),
        },
        400
      );
    }

    const { ids } = result.data;

    // Parse comma-separated IDs
    const idArray = ids.split(",").map((id) => parseInt(id.trim(), 10));

    if (idArray.length === 0 || idArray.some(isNaN)) {
      return c.json(
        {
          success: false,
          error: "Invalid IDs provided",
        },
        400
      );
    }

    // Get orders by IDs
    const ordersList = await db
      .select({
        id: orders.id,
        order_id: orders.order_id,
        customer_name: orders.customer_name,
        customer_email: orders.customer_email,
        order_date: orders.order_date,
        status: orders.status,
        total_items: orders.total_items,
        total_amount: orders.total_amount,
        shipping_address: orders.shipping_address,
        payment_method: orders.payment_method,
        created_at: orders.created_at,
      })
      .from(orders)
      .where(inArray(orders.id, idArray));

    // Get items for each order (limited to MAX_SUBROWS_PER_ORDER)
    const ordersWithItems = await Promise.all(
      ordersList.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            order_id: orderItems.order_id,
            product_name: orderItems.product_name,
            quantity: orderItems.quantity,
            price: orderItems.price,
            subtotal: orderItems.subtotal,
          })
          .from(orderItems)
          .where(eq(orderItems.order_id, order.order_id))
          .limit(MAX_SUBROWS_PER_ORDER);

        // Return order summary with first item as parent data, rest as subRows
        if (items.length === 0) {
          return {
            ...order,
            product_name: null,
            quantity: null,
            price: null,
            subtotal: null,
            subRows: [],
          };
        }

        // First item merged with parent
        const [firstItem, ...restItems] = items;

        return {
          ...order,
          item_id: firstItem.id, // Include first item's ID in parent
          product_name: firstItem.product_name,
          quantity: firstItem.quantity,
          price: firstItem.price,
          subtotal: firstItem.subtotal,
          subRows: restItems.map((item) => ({
            id: item.id, // Unique subrow ID
            order_id: item.order_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          })),
        };
      })
    );

    return c.json({
      success: true,
      data: ordersWithItems,
    });
  } catch (error) {
    console.error("Error getting orders by IDs:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch orders by IDs",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default router;
