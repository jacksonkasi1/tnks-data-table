import { Hono } from "hono";

// ** import router
import { user_routes } from "./users";

export const router = new Hono();

router.route("/users", user_routes);
