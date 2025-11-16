import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tickets } from "./tbl_tickets";

export const ticketComments = pgTable("tbl_ticket_comments", {
  id: serial("id").primaryKey(),
  ticket_id: varchar("ticket_id", { length: 50 }).notNull().references(() => tickets.ticket_id),
  comment_number: integer("comment_number").notNull(),
  author_name: varchar("author_name", { length: 100 }).notNull(),
  author_email: varchar("author_email", { length: 100 }).notNull(),
  author_role: varchar("author_role", { length: 50 }), // customer, agent, admin
  comment_text: text("comment_text").notNull(),
  is_internal: integer("is_internal").notNull().default(0), // 0 = public, 1 = internal
  created_at: timestamp("created_at").notNull().defaultNow(),
});
