import { Hono } from "hono";

// ** import router
import { user_routes } from "./users";
import order_routes from "./orders";

export const router = new Hono();

router.route("/users", user_routes);
router.route("/orders", order_routes);
