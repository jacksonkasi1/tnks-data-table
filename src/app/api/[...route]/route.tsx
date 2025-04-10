import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";

export const dynamic = "force-dynamic";

// ** Routes
import { router } from "./routes";

const app = new Hono().basePath("/api");
app.use("*", cors());

// Mount API routes directly at the root
app.route("/", router);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    version: process.env.npm_package_version,
  });
});

// Root API endpoint with documentation
app.get("/doc", (c) => {
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
export const DELETE = handle(app);
export const PUT = handle(app);
