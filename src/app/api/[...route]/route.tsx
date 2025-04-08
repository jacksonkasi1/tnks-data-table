import { Hono } from "hono";
import { handle } from "hono/vercel";
export const dynamic = "force-dynamic";

// ** Routes
import { router } from "./routes";

// Create the Hono app with base path
const app = new Hono().basePath("/api");

// Mount API routes - each route handler defines its own path structure
app.route("/", router);

// Root API endpoint with documentation
app.get("/", (c) => {
  return c.json({
    success: true,
    message: "API is running",
    endpoints: {
      users: "/api/users - Get users with expense aggregations and filtering",
      user_expenses:
        "/api/users/:id/expenses - Get expenses for a specific user",
    },
    examples: {
      search_users: "/api/users?search=john",
      date_filter: "/api/users?from_date=2023-01-01&to_date=2023-01-31",
      pagination: "/api/users?page=1&limit=10",
      sorting: "/api/users?sort_by=total_expenses&sort_order=desc",
      user_expenses: "/api/users/1/expenses?from_date=2023-01-01",
    },
  });
});

// Export Vercel handlers
export const GET = handle(app);
export const POST = handle(app);
