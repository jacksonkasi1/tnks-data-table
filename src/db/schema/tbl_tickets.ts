import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const tickets = pgTable("tbl_tickets", {
  id: serial("id").primaryKey(),
  ticket_id: varchar("ticket_id", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  customer_name: varchar("customer_name", { length: 100 }).notNull(),
  customer_email: varchar("customer_email", { length: 100 }).notNull(),
  priority: varchar("priority", { length: 20 }).notNull(), // low, medium, high, urgent
  status: varchar("status", { length: 20 }).notNull(), // open, in-progress, resolved, closed
  category: varchar("category", { length: 50 }), // bug, feature, support, question
  assigned_to: varchar("assigned_to", { length: 100 }),
  total_comments: integer("total_comments").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});
