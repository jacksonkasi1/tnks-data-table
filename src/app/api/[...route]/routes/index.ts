import { Hono } from "hono";

// ** import router
import { user_routes } from "./users";
import order_routes from "./orders";
import booking_routes from "./bookings";
import ticket_routes from "./tickets";

export const router = new Hono();

router.route("/users", user_routes);
router.route("/orders", order_routes);
router.route("/bookings", booking_routes);
router.route("/tickets", ticket_routes);
