// ** import core packages
import { integer, pgTable, varchar, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ** import schema
import { orders } from "./tbl_orders";

export const orderItems = pgTable("tbl_order_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  order_id: varchar("order_id", { length: 50 })
    .notNull()
    .references(() => orders.order_id, { onDelete: "cascade" }),
  product_name: varchar("product_name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

// Table relationships
export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.order_id],
  }),
}));
