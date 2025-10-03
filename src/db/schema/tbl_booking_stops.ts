import { integer, numeric, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const bookingStops = pgTable("booking_stops", {
  id: serial("id").primaryKey(),
  booking_id: varchar("booking_id", { length: 50 }).notNull(),
  stop_number: integer("stop_number").notNull(),
  stop_type: varchar("stop_type", { length: 50 }).notNull(), // pickup, delivery, waypoint
  location_name: varchar("location_name", { length: 255 }).notNull(),
  location_address: text("location_address").notNull(),
  location_city: varchar("location_city", { length: 100 }),
  location_state: varchar("location_state", { length: 100 }),
  location_zip: varchar("location_zip", { length: 20 }),
  contact_name: varchar("contact_name", { length: 255 }),
  contact_phone: varchar("contact_phone", { length: 50 }),
  scheduled_time: timestamp("scheduled_time"),
  actual_arrival_time: timestamp("actual_arrival_time"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, completed, skipped
  notes: text("notes"),
  distance_from_previous: numeric("distance_from_previous", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
