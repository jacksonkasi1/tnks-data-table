import { Hono } from "hono";

// ** import api
import getUsersWithExpenses from "./get-users-with-expenses";

// ** create router
export const user_routes = new Hono();

// Mount API routes - each route handler defines its own path structure
user_routes.route("/", getUsersWithExpenses);
