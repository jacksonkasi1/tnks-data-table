import { Hono } from "hono";
import getBookingsGrouped from "./get-bookings-grouped";

const router = new Hono();

// Register bookings routes
router.route("/grouped", getBookingsGrouped);

export default router;
