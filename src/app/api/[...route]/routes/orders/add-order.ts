import { Hono } from "hono";

// ** import core packages
import { faker } from "@faker-js/faker";

// ** import database
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";

const app = new Hono();

// Helper function to generate random order
function generateRandomOrder() {
  const orderId = `ORD-${faker.string.alphanumeric(8).toUpperCase()}`;
  const itemCount = faker.number.int({ min: 1, max: 5 });

  const items = Array.from({ length: itemCount }, () => {
    const quantity = faker.number.int({ min: 1, max: 10 });
    const price = faker.number.float({ min: 10, max: 500, fractionDigits: 2 });
    const subtotal = quantity * price;

    return {
      order_id: orderId,
      product_name: faker.commerce.productName(),
      quantity,
      price: price.toString(),
      subtotal: subtotal.toString(),
    };
  });

  const totalAmount = items.reduce(
    (sum, item) => sum + parseFloat(item.subtotal),
    0
  );

  const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

  return {
    order: {
      order_id: orderId,
      customer_name: faker.person.fullName(),
      customer_email: faker.internet.email(),
      order_date: faker.date.recent({ days: 90 }),
      status: faker.helpers.arrayElement(statuses),
      total_items: itemCount,
      total_amount: totalAmount.toFixed(2),
      shipping_address: faker.location.streetAddress({ useFullAddress: true }),
      payment_method: faker.helpers.arrayElement([
        "Credit Card",
        "PayPal",
        "Bank Transfer",
        "Cash on Delivery",
      ]),
    },
    items,
  };
}

// POST /api/orders/add
app.post("/", async (c) => {
  try {
    // Generate random order data
    const { order, items } = generateRandomOrder();

    // Insert order
    const [newOrder] = await db.insert(orders).values(order).returning();

    // Insert order items
    await db.insert(orderItems).values(items);

    return c.json(
      {
        success: true,
        data: newOrder,
      },
      201
    );
  } catch (error) {
    console.error("Error adding order:", error);

    return c.json(
      {
        success: false,
        error: "Failed to create order",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default app;
