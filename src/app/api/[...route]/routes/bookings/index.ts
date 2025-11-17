import { Hono } from "hono";
import getBookingsGrouped from "./get-bookings-grouped";
import getBookingsByIds from "./get-bookings-by-ids";

const router = new Hono();

// Register bookings routes
router.route("/grouped", getBookingsGrouped);
router.route("/by-ids", getBookingsByIds);

export default router;
