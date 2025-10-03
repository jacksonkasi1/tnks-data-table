import { Hono } from "hono";
import getOrdersGrouped from "./get-orders-grouped";
import addOrder from "./add-order";
import deleteOrder from "./delete-order";
import deleteOrderItem from "./delete-order-item";

const router = new Hono();

// Register orders routes (order matters - specific routes before dynamic ones)
router.route("/grouped", getOrdersGrouped);
router.route("/add", addOrder);
router.route("/items", deleteOrderItem);
router.route("/", deleteOrder);

export default router;
