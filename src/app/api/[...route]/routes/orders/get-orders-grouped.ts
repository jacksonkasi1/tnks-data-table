import { Hono } from "hono";

// ** import validation
import { z } from "zod";

// ** import database
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";

// ** import db
import { db } from "@/db";

// ** import schema
import { orders } from "@/db/schema/tbl_orders";
import { orderItems } from "@/db/schema/tbl_order_items";

// Create a router
const router = new Hono();

// Maximum subrows per parent (configurable constant)
const MAX_SUBROWS_PER_ORDER = 20;

// Schema for query parameters
const querySchema = z.object({
  search: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  sort_by: z
    .enum([
      "order_id",
      "customer_name",
      "customer_email",
      "order_date",
      "status",
      "total_items",
      "total_amount",
    ])
    .default("order_date"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

// Get orders with nested items (grouped/hierarchical structure)
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

    const { search, from_date, to_date, sort_by, sort_order, page, limit } =
      result.data;

    // Build filters for orders
    const filters = [];

    // Search filter (across order and customer fields)
    if (search) {
      filters.push(
        or(
          ilike(orders.order_id, `%${search}%`),
          ilike(orders.customer_name, `%${search}%`),
          ilike(orders.customer_email, `%${search}%`),
          ilike(orders.status, `%${search}%`)
        )
      );
    }

    // Date filtering based on order_date
    if (from_date && to_date && from_date.trim() !== "" && to_date.trim() !== "") {
      filters.push(
        and(
          sql`${orders.order_date} >= ${new Date(from_date)}`,
          sql`${orders.order_date} <= ${new Date(to_date)}`
        )
      );
    } else if (from_date && from_date.trim() !== "") {
      filters.push(sql`${orders.order_date} >= ${new Date(from_date)}`);
    } else if (to_date && to_date.trim() !== "") {
      filters.push(sql`${orders.order_date} <= ${new Date(to_date)}`);
    }

    // Get total count for pagination
    const [{ count: totalOrders }] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(orders)
      .where(filters.length > 0 ? and(...filters) : undefined);

    // Get orders with sorting and pagination
    const ordersQuery = db
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
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(
        sort_by === "order_id"
          ? sort_order === "asc"
            ? asc(orders.order_id)
            : desc(orders.order_id)
          : sort_by === "customer_name"
            ? sort_order === "asc"
              ? asc(orders.customer_name)
              : desc(orders.customer_name)
            : sort_by === "customer_email"
              ? sort_order === "asc"
                ? asc(orders.customer_email)
                : desc(orders.customer_email)
              : sort_by === "status"
                ? sort_order === "asc"
                  ? asc(orders.status)
                  : desc(orders.status)
                : sort_by === "total_items"
                  ? sort_order === "asc"
                    ? asc(orders.total_items)
                    : desc(orders.total_items)
                  : sort_by === "total_amount"
                    ? sort_order === "asc"
                      ? asc(orders.total_amount)
                      : desc(orders.total_amount)
                    : sort_order === "asc"
                      ? asc(orders.order_date)
                      : desc(orders.order_date)
      )
      .limit(limit)
      .offset((page - 1) * limit);

    const ordersList = await ordersQuery;

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
      pagination: {
        page,
        limit,
        total_pages: Math.ceil(totalOrders / limit),
        total_items: totalOrders,
      },
    });
  } catch (error) {
    console.error("Error getting orders:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch orders",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default router;
