import { Hono } from "hono";

// ** Third Party Libraries
import { z } from "zod";

// ** Drizzle
import { and, asc, between, count, desc, eq, ilike, or, sql } from "drizzle-orm";

// ** Import DB
import { db } from "@/db";

// ** Import Schema
import { expenses } from "@/db/schema/tbl_expenses";
import { users } from "@/db/schema/tbl_users";

// Create a router
const router = new Hono();

// Schema for query parameters
const querySchema = z.object({
  search: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  sort_by: z.enum(["id", "name", "email", "phone", "age", "total_expenses", "expense_count", "created_at"]).default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

// Get users with expenses (including aggregation and filtering)
router.get("/", async (c) => {
  try {
    // Parse and validate query parameters
    const result = querySchema.safeParse(c.req.query());

    if (!result.success) {
      return c.json({
        success: false,
        error: "Invalid query parameters",
        details: result.error.format(),
      }, 400);
    }

    const { search, from_date, to_date, sort_by, sort_order, page, limit } = result.data;

    // Build filters
    const filters = [];

    // Search filter (search across multiple user fields)
    if (search) {
      filters.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.phone, `%${search}%`)
        )
      );
    }

    // Date filtering based on user created_at
    // Only apply if there are non-empty values
    if (from_date && to_date && from_date.trim() !== "" && to_date.trim() !== "") {
      // Date range filter
      filters.push(
        between(
          users.created_at,
          new Date(from_date),
          new Date(to_date)
        )
      );
    } else if (from_date && from_date.trim() !== "") {
      // Single date filter: users created on or after specific date
      const fromDateTime = new Date(from_date);
      filters.push(
        sql`${users.created_at} >= ${fromDateTime}`
      );
    } else if (to_date && to_date.trim() !== "") {
      // Users created on or before specific date
      const toDateTime = new Date(to_date);
      filters.push(
        sql`${users.created_at} <= ${toDateTime}`
      );
    }
    // If both are empty or undefined, no date filter will be applied

    // Get users with expense aggregations
    const usersWithExpenses = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        age: users.age,
        created_at: users.created_at,
        expense_count: sql<number>`cast(coalesce(count(${expenses.id}), 0) as integer)`,
        total_expenses: sql<string>`coalesce(cast(sum(${expenses.amount}) as text), '0')`,
      })
      .from(users)
      .leftJoin(expenses, eq(users.id, expenses.user_id))
      .where(and(...filters))
      .groupBy(users.id)
      .orderBy(
        // Handle aggregated fields
        sort_by === "total_expenses"
          ? sort_order === "asc"
            ? asc(sql`coalesce(sum(${expenses.amount}), 0)`)
            : desc(sql`coalesce(sum(${expenses.amount}), 0)`)
          : sort_by === "expense_count"
            ? sort_order === "asc"
              ? asc(sql`coalesce(count(${expenses.id}), 0)`)
              : desc(sql`coalesce(count(${expenses.id}), 0)`)
          // Handle user table fields
          : sort_by === "id"
            ? sort_order === "asc" ? asc(users.id) : desc(users.id)
          : sort_by === "name"
            ? sort_order === "asc" ? asc(users.name) : desc(users.name)
          : sort_by === "email"
            ? sort_order === "asc" ? asc(users.email) : desc(users.email)
          : sort_by === "phone"
            ? sort_order === "asc" ? asc(users.phone) : desc(users.phone)
          : sort_by === "age"
            ? sort_order === "asc" ? asc(users.age) : desc(users.age)
          // Default to created_at
          : sort_order === "asc" ? asc(users.created_at) : desc(users.created_at)
      )
      .limit(limit)
      .offset((page - 1) * limit);

    // Count total users (for pagination)
    const [{ count: totalUsers }] = await db
      .select({ count: count() })
      .from(users)
      .where(and(...filters));

    return c.json({
      success: true,
      data: usersWithExpenses,
      pagination: {
        page,
        limit,
        total_pages: Math.ceil(totalUsers / limit),
        total_items: totalUsers,
      },
    });
  } catch (error) {
    console.error("Error getting users with expenses:", error);
    return c.json({
      success: false,
      error: "Failed to fetch users with expenses",
      details: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

// Get user expenses by ID with date filtering
router.get("/:id/expenses", async (c) => {
  try {
    const userId = parseInt(c.req.param("id"), 10);

    if (isNaN(userId)) {
      return c.json({
        success: false,
        error: "Invalid user ID",
      }, 400);
    }

    // Parse and validate query parameters
    const schema = z.object({
      from_date: z.string().optional(),
      to_date: z.string().optional(),
      page: z.coerce.number().default(1),
      limit: z.coerce.number().default(10),
    });

    const result = schema.safeParse(c.req.query());

    if (!result.success) {
      return c.json({
        success: false,
        error: "Invalid query parameters",
        details: result.error.format(),
      }, 400);
    }

    const { from_date, to_date, page, limit } = result.data;

    // Build date filters
    const dateFilters = [];

    if (from_date && !to_date) {
      // Single date filter
      const fromDateTime = new Date(from_date);
      const nextDay = new Date(fromDateTime);
      nextDay.setDate(nextDay.getDate() + 1);

      dateFilters.push(
        between(
          expenses.expense_date,
          fromDateTime,
          nextDay
        )
      );
    } else if (from_date && to_date) {
      // Date range filter
      dateFilters.push(
        between(
          expenses.expense_date,
          new Date(from_date),
          new Date(to_date)
        )
      );
    }

    // Combine user ID filter with date filters
    const filters = [eq(expenses.user_id, userId), ...dateFilters];

    // Get user expenses with pagination
    const userExpenses = await db
      .select({
        id: expenses.id,
        user_id: expenses.user_id,
        expense_name: expenses.expense_name,
        amount: expenses.amount,
        expense_date: expenses.expense_date,
        created_at: expenses.created_at,
        updated_at: expenses.updated_at
      })
      .from(expenses)
      .where(and(...filters))
      .orderBy(desc(expenses.expense_date))
      .limit(limit)
      .offset((page - 1) * limit);

    // Get total count for pagination
    const [{ count: totalExpenses }] = await db
      .select({ count: count() })
      .from(expenses)
      .where(and(...filters));

    // Get user details
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return c.json({
        success: false,
        error: "User not found",
      }, 404);
    }

    // Get aggregate expense data
    const [expenseStats] = await db
      .select({
        total_amount: sql<string>`cast(sum(${expenses.amount}) as text)`,
        avg_amount: sql<string>`cast(avg(${expenses.amount}) as text)`,
        max_amount: sql<string>`cast(max(${expenses.amount}) as text)`,
        min_amount: sql<string>`cast(min(${expenses.amount}) as text)`,
      })
      .from(expenses)
      .where(and(...filters));

    return c.json({
      success: true,
      data: {
        user,
        expenses: userExpenses,
        stats: expenseStats || {
          total_amount: "0",
          avg_amount: "0",
          max_amount: "0",
          min_amount: "0"
        },
      },
      pagination: {
        page,
        limit,
        total_pages: Math.ceil(totalExpenses / limit),
        total_items: totalExpenses,
      },
    });
  } catch (error) {
    console.error("Error getting user expenses:", error);
    return c.json({
      success: false,
      error: "Failed to fetch user expenses",
    }, 500);
  }
});

export default router;
