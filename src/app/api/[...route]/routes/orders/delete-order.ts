import { Hono } from "hono";

// ** import database
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";

// ** import drizzle
import { eq } from "drizzle-orm";

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
