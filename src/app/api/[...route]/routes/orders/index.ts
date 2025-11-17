import { Hono } from "hono";
import getOrdersGrouped from "./get-orders-grouped";
import getOrdersByIds from "./get-orders-by-ids";
import addOrder from "./add-order";
import deleteOrder from "./delete-order";
import deleteOrderItem from "./delete-order-item";

const router = new Hono();

// Register orders routes (order matters - specific routes before dynamic ones)
router.route("/grouped", getOrdersGrouped);
router.route("/by-ids", getOrdersByIds);
router.route("/add", addOrder);
router.route("/items", deleteOrderItem);
router.route("/", deleteOrder);

export default router;
