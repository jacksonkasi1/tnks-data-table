import { Hono } from "hono";
import getOrdersGrouped from "./get-orders-grouped";

const router = new Hono();

// Register orders routes
router.route("/grouped", getOrdersGrouped);

export default router;
