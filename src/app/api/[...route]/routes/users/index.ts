import { Hono } from "hono";

// ** import api
import getUsersWithExpenses from "./get-users-with-expenses";
import getUsersCamelCase from "./get-users-camel-case";
import addUser from "./add-user";
import deleteUser from "./delete-user";

// ** create router
export const user_routes = new Hono();

// Mount API routes - each route handler defines its own path structure
user_routes.route("/", getUsersWithExpenses);
user_routes.route("/camel-case", getUsersCamelCase);
user_routes.route("/add", addUser);
user_routes.route("/", deleteUser);
