import { integer, numeric, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  booking_id: varchar("booking_id", { length: 50 }).notNull().unique(),
  customer_name: varchar("customer_name", { length: 255 }).notNull(),
  customer_email: varchar("customer_email", { length: 255 }).notNull(),
  customer_phone: varchar("customer_phone", { length: 50 }),
  pickup_location: text("pickup_location").notNull(),
  delivery_location: text("delivery_location").notNull(),
  booking_date: timestamp("booking_date").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, in-transit, delivered, cancelled
  total_stops: integer("total_stops").notNull().default(0),
  total_distance: numeric("total_distance", { precision: 10, scale: 2 }),
  total_amount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  driver_name: varchar("driver_name", { length: 255 }),
  vehicle_number: varchar("vehicle_number", { length: 50 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
