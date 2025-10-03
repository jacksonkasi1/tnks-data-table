// ** import core packages
import { Hono } from "hono";

// ** import validation
import { z } from "zod";

// ** import database
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";

// ** import db
import { db } from "@/db";

// ** import schema
import { bookings } from "@/db/schema/tbl_bookings";
import { bookingStops } from "@/db/schema/tbl_booking_stops";

const router = new Hono();

// Maximum subrows per parent
const MAX_STOPS_PER_BOOKING = 20;

// Schema for query parameters
const querySchema = z.object({
  search: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  sort_by: z
    .enum([
      "booking_id",
      "customer_name",
      "booking_date",
      "status",
      "total_stops",
      "total_amount",
    ])
    .default("booking_date"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

// Get bookings with nested stops (grouped/hierarchical structure)
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

    // Build filters for bookings
    const filters = [];

    // Search filter
    if (search) {
      filters.push(
        or(
          ilike(bookings.booking_id, `%${search}%`),
          ilike(bookings.customer_name, `%${search}%`),
          ilike(bookings.pickup_location, `%${search}%`),
          ilike(bookings.delivery_location, `%${search}%`)
        )
      );
    }

    // Date filtering based on booking_date
    if (from_date && to_date && from_date.trim() !== "" && to_date.trim() !== "") {
      filters.push(
        and(
          sql`${bookings.booking_date} >= ${new Date(from_date)}`,
          sql`${bookings.booking_date} <= ${new Date(to_date)}`
        )
      );
    } else if (from_date && from_date.trim() !== "") {
      filters.push(sql`${bookings.booking_date} >= ${new Date(from_date)}`);
    } else if (to_date && to_date.trim() !== "") {
      filters.push(sql`${bookings.booking_date} <= ${new Date(to_date)}`);
    }

    // Get total count for pagination
    const [{ count: totalBookings }] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(bookings)
      .where(filters.length > 0 ? and(...filters) : undefined);

    // Get bookings with sorting and pagination
    const bookingsQuery = db
      .select({
        id: bookings.id,
        booking_id: bookings.booking_id,
        customer_name: bookings.customer_name,
        customer_email: bookings.customer_email,
        customer_phone: bookings.customer_phone,
        pickup_location: bookings.pickup_location,
        delivery_location: bookings.delivery_location,
        booking_date: bookings.booking_date,
        status: bookings.status,
        total_stops: bookings.total_stops,
        total_distance: bookings.total_distance,
        total_amount: bookings.total_amount,
        driver_name: bookings.driver_name,
        vehicle_number: bookings.vehicle_number,
        created_at: bookings.created_at,
      })
      .from(bookings)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(
        sort_by === "booking_id"
          ? sort_order === "asc"
            ? asc(bookings.booking_id)
            : desc(bookings.booking_id)
          : sort_by === "customer_name"
            ? sort_order === "asc"
              ? asc(bookings.customer_name)
              : desc(bookings.customer_name)
            : sort_by === "status"
              ? sort_order === "asc"
                ? asc(bookings.status)
                : desc(bookings.status)
              : sort_by === "total_stops"
                ? sort_order === "asc"
                  ? asc(bookings.total_stops)
                  : desc(bookings.total_stops)
                : sort_by === "total_amount"
                  ? sort_order === "asc"
                    ? asc(bookings.total_amount)
                    : desc(bookings.total_amount)
                  : sort_order === "asc"
                    ? asc(bookings.booking_date)
                    : desc(bookings.booking_date)
      )
      .limit(limit)
      .offset((page - 1) * limit);

    const bookingsList = await bookingsQuery;

    // Get stops for each booking (limited to MAX_STOPS_PER_BOOKING)
    const bookingsWithStops = await Promise.all(
      bookingsList.map(async (booking) => {
        const stops = await db
          .select({
            id: bookingStops.id,
            booking_id: bookingStops.booking_id,
            stop_number: bookingStops.stop_number,
            stop_type: bookingStops.stop_type,
            location_name: bookingStops.location_name,
            location_address: bookingStops.location_address,
            location_city: bookingStops.location_city,
            location_state: bookingStops.location_state,
            contact_name: bookingStops.contact_name,
            contact_phone: bookingStops.contact_phone,
            scheduled_time: bookingStops.scheduled_time,
            status: bookingStops.status,
            distance_from_previous: bookingStops.distance_from_previous,
          })
          .from(bookingStops)
          .where(eq(bookingStops.booking_id, booking.booking_id))
          .orderBy(asc(bookingStops.stop_number))
          .limit(MAX_STOPS_PER_BOOKING);

        // Return booking with all stops as subRows
        return {
          ...booking,
          subRows: stops,
        };
      })
    );

    return c.json({
      success: true,
      data: bookingsWithStops,
      pagination: {
        page,
        limit,
        total_pages: Math.ceil(totalBookings / limit),
        total_items: totalBookings,
      },
    });
  } catch (error) {
    console.error("Error getting bookings:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch bookings",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default router;
