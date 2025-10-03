// ** import core packages
import { integer, pgTable, varchar, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ** import schema
import { orderItems } from "./tbl_order_items";

export const orders = pgTable("tbl_orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  order_id: varchar("order_id", { length: 50 }).notNull().unique(),
  customer_name: varchar("customer_name", { length: 255 }).notNull(),
  customer_email: varchar("customer_email", { length: 255 }).notNull(),
  order_date: timestamp("order_date").notNull().defaultNow(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  total_items: integer("total_items").notNull().default(0),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  shipping_address: varchar("shipping_address", { length: 500 }).notNull(),
  payment_method: varchar("payment_method", { length: 100 }).notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

// Table relationships
export const orderRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));
