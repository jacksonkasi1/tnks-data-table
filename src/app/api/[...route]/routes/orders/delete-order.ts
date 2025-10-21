import { Hono } from "hono";

// ** import database
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";

// ** import drizzle
import { eq, sql } from "drizzle-orm";

// Minimum records constant
const MINIMUM_RECORDS = 1000;

const app = new Hono();

// DELETE /api/orders/:id
app.delete("/:id", async (c) => {
  try {
    // Parse and validate order ID
    const orderId = parseInt(c.req.param("id"), 10);

    if (isNaN(orderId)) {
      return c.json(
        {
          success: false,
          error: "Invalid order ID",
        },
        400
      );
    }

    // Check if order exists
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));

    if (!order) {
      return c.json(
        {
          success: false,
          error: "Order not found",
        },
        404
      );
    }

    // Check total order count before deleting
    const [{ count: totalOrders }] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(orders);

    // Prevent deletion if it would result in less than minimum records
    if (totalOrders <= MINIMUM_RECORDS) {
      return c.json(
        {
          success: false,
          error: "Cannot delete order",
          message: `Minimum ${MINIMUM_RECORDS} orders must be maintained. Current count: ${totalOrders}`,
        },
        400
      );
    }

    // Delete all order items first (cascade will handle this, but being explicit)
    await db.delete(orderItems).where(eq(orderItems.order_id, order.order_id));

    // Delete the order
    await db.delete(orders).where(eq(orders.id, orderId));

    return c.json(
      {
        success: true,
        message: "Order and all items deleted successfully",
      },
      200
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    return c.json(
      {
        success: false,
        error: "Failed to delete order",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default app;
