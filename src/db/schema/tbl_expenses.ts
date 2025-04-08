// ** Third Party Lib
import {
  integer,
  pgTable,
  varchar,
  timestamp,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ** Table
import { users } from "./tbl_users";

export const expenses = pgTable("tbl_expenses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expense_name: varchar("expense_name", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  expense_date: timestamp("expense_date").notNull().defaultNow(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

// Table relationships

export const expenseRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.user_id],
    references: [users.id],
  }),
}));
