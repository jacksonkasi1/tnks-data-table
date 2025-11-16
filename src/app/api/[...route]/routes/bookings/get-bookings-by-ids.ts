// ** import core packages
import { Hono } from "hono";

// ** import validation
import { z } from "zod";

// ** import database
import { asc, inArray, sql } from "drizzle-orm";

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
  ids: z.string(),
});

// Get bookings by IDs with nested stops
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

    const { ids } = result.data;

    // Parse comma-separated IDs
    const idArray = ids.split(",").map((id) => parseInt(id.trim(), 10));

    if (idArray.length === 0 || idArray.some(isNaN)) {
      return c.json(
        {
          success: false,
          error: "Invalid IDs provided",
        },
        400
      );
    }

    // Get bookings by IDs
    const bookingsList = await db
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
      .where(inArray(bookings.id, idArray));

    // PERFORMANCE FIX: Fetch all stops in a single query instead of N+1 queries
    // Get all booking IDs from the results
    const bookingIds = bookingsList.map((booking) => booking.booking_id);

    // Fetch all stops for these bookings in a single batch query
    // Guard against empty bookingIds array to prevent SQL IN () errors
    const allStops = bookingIds.length > 0
      ? await db
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
          .where(sql`${bookingStops.booking_id} IN ${bookingIds}`)
          .orderBy(asc(bookingStops.stop_number))
      : []; // Return empty array if no bookings

    // Group stops by booking_id in memory
    const stopsByBookingId = new Map<string, typeof allStops>();
    for (const stop of allStops) {
      if (!stopsByBookingId.has(stop.booking_id)) {
        stopsByBookingId.set(stop.booking_id, []);
      }
      const bookingStopsList = stopsByBookingId.get(stop.booking_id)!;
      // Limit to MAX_STOPS_PER_BOOKING per booking
      if (bookingStopsList.length < MAX_STOPS_PER_BOOKING) {
        bookingStopsList.push(stop);
      }
    }

    // Map stops to their bookings
    const bookingsWithStops = bookingsList.map((booking) => {
      const stops = stopsByBookingId.get(booking.booking_id) || [];

      return {
        ...booking,
        subRows: stops,
      };
    });

    return c.json({
      success: true,
      data: bookingsWithStops,
    });
  } catch (error) {
    console.error("Error getting bookings by IDs:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch bookings by IDs",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default router;
