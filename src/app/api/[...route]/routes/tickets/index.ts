import { Hono } from "hono";
import getTicketsGrouped from "./get-tickets-grouped";

const router = new Hono();

// Register tickets routes
router.route("/grouped", getTicketsGrouped);

export default router;
