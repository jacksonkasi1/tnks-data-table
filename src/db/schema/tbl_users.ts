// ** Third Party Lib
import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ** Table
import { expenses } from "./tbl_expenses";

export const users = pgTable("tbl_users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  age: integer("age").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 255 }).notNull().unique(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Export type
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Table relationships
export const userRelations = relations(users, ({ many }) => ({
  expenses: many(expenses),
}));
