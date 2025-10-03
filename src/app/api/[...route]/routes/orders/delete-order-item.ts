import { Hono } from "hono";

// ** import database
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";

// ** import drizzle
import { eq, sql } from "drizzle-orm";

const app = new Hono();

// DELETE /api/orders/items/:id
app.delete("/:id", async (c) => {
  try {
    // Parse and validate item ID
    const itemId = parseInt(c.req.param("id"), 10);

    if (isNaN(itemId)) {
      return c.json(
        {
          success: false,
          error: "Invalid item ID",
        },
        400
      );
    }

    // Check if item exists
    const [item] = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.id, itemId));

    if (!item) {
      return c.json(
        {
          success: false,
          error: "Order item not found",
        },
        404
      );
    }

    // Get the order to update counts
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.order_id, item.order_id));

    if (!order) {
      return c.json(
        {
          success: false,
          error: "Parent order not found",
        },
        404
      );
    }

    // Delete the item
    await db.delete(orderItems).where(eq(orderItems.id, itemId));

    // Recalculate order totals
    const remainingItems = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.order_id, item.order_id));

    if (remainingItems.length === 0) {
      // If no items left, delete the entire order
      await db.delete(orders).where(eq(orders.order_id, item.order_id));
      return c.json(
        {
          success: true,
          message: "Last item deleted. Order removed.",
        },
        200
      );
    } else {
      // Update order totals
      const newTotalAmount = remainingItems.reduce(
        (sum, item) => sum + parseFloat(item.subtotal),
        0
      );

      await db
        .update(orders)
        .set({
          total_items: remainingItems.length,
          total_amount: newTotalAmount.toFixed(2),
        })
        .where(eq(orders.order_id, item.order_id));

      return c.json(
        {
          success: true,
          message: "Order item deleted successfully",
        },
        200
      );
    }
  } catch (error) {
    console.error("Error deleting order item:", error);
    return c.json(
      {
        success: false,
        error: "Failed to delete order item",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default app;
