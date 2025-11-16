import { Hono } from "hono";
import getTicketsGrouped from "./get-tickets-grouped";
import getTicketsByIds from "./get-tickets-by-ids";

const router = new Hono();

// Register tickets routes
router.route("/grouped", getTicketsGrouped);
router.route("/by-ids", getTicketsByIds);

export default router;
