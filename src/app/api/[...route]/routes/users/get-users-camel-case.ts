// ** import core packages
import { Hono } from "hono";

// ** import database
import { and, asc, between, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";

// ** import schema
import { expenses } from "@/db/schema/tbl_expenses";
import { users } from "@/db/schema/tbl_users";

// ** import validation
import { z } from "zod";

// ** import utils
import { convertObjectKeys, toCamelCase } from "@/components/data-table/utils/case-utils";

// Create a router
const router = new Hono();

// Convert snake_case to camelCase for sortBy parameter and validate
function convertSortByToCamelCase(sortBy: string): string {
  const mappings: Record<string, string> = {
    created_at: "createdAt",
    total_expenses: "totalExpenses", 
    expense_count: "expenseCount",
  };
  
  const converted = mappings[sortBy] || sortBy;
  
  // Validate that the converted value is one of the allowed camelCase fields
  const allowedFields = ["id", "name", "email", "phone", "age", "totalExpenses", "expenseCount", "createdAt"];
  
  if (!allowedFields.includes(converted)) {
    throw new Error(`Invalid sortBy field: ${sortBy}. Allowed values: ${allowedFields.join(", ")}`);
  }
  
  return converted;
}

// Schema for query parameters (accepts both camelCase and snake_case)
const querySchema = z.object({
  search: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.string().default("createdAt").transform(convertSortByToCamelCase),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

// Convert camelCase sortBy to snake_case for database
function convertSortByToDbField(sortBy: string): string {
  const mappings: Record<string, string> = {
    totalExpenses: "total_expenses",
    expenseCount: "expense_count",
    createdAt: "created_at",
  };
  return mappings[sortBy] || sortBy;
}

// Interface for database row
interface UserRowFromDb {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  created_at: Date;
  expense_count: number;
  total_expenses: string;
}

// Convert database row to camelCase
function convertUserRowToCamelCase(row: UserRowFromDb) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    age: row.age,
    createdAt: row.created_at,
    expenseCount: row.expense_count,
    totalExpenses: row.total_expenses,
  };
}

// Get users with expenses (camelCase API)
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

    const { search, fromDate, toDate, sortBy, sortOrder, page, limit } = result.data;

    // Convert camelCase sortBy to database field
    const dbSortBy = convertSortByToDbField(sortBy);

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
    if (fromDate && toDate && fromDate.trim() !== "" && toDate.trim() !== "") {
      // Date range filter
      filters.push(
        between(
          users.created_at,
          new Date(fromDate),
          new Date(toDate)
        )
      );
    } else if (fromDate && fromDate.trim() !== "") {
      // Single date filter: users created on or after specific date
      const fromDateTime = new Date(fromDate);
      filters.push(
        sql`${users.created_at} >= ${fromDateTime}`
      );
    } else if (toDate && toDate.trim() !== "") {
      // Users created on or before specific date
      const toDateTime = new Date(toDate);
      filters.push(
        sql`${users.created_at} <= ${toDateTime}`
      );
    }

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
        dbSortBy === "total_expenses"
          ? sortOrder === "asc"
            ? asc(sql`coalesce(sum(${expenses.amount}), 0)`)
            : desc(sql`coalesce(sum(${expenses.amount}), 0)`)
          : dbSortBy === "expense_count"
            ? sortOrder === "asc"
              ? asc(sql`coalesce(count(${expenses.id}), 0)`)
              : desc(sql`coalesce(count(${expenses.id}), 0)`)
          // Handle user table fields
          : dbSortBy === "id"
            ? sortOrder === "asc" ? asc(users.id) : desc(users.id)
          : dbSortBy === "name"
            ? sortOrder === "asc" ? asc(users.name) : desc(users.name)
          : dbSortBy === "email"
            ? sortOrder === "asc" ? asc(users.email) : desc(users.email)
          : dbSortBy === "phone"
            ? sortOrder === "asc" ? asc(users.phone) : desc(users.phone)
          : dbSortBy === "age"
            ? sortOrder === "asc" ? asc(users.age) : desc(users.age)
          // Default to created_at
          : sortOrder === "asc" ? asc(users.created_at) : desc(users.created_at)
      )
      .limit(limit)
      .offset((page - 1) * limit);

    // Count total users (for pagination)
    const [{ count: totalUsers }] = await db
      .select({ count: count() })
      .from(users)
      .where(and(...filters));

    // Convert data to camelCase
    const camelCaseData = usersWithExpenses.map(convertUserRowToCamelCase);

    return c.json({
      success: true,
      data: camelCaseData,
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

// Get user expenses by ID with date filtering (camelCase)
router.get("/:id/expenses", async (c) => {
  try {
    const userId = parseInt(c.req.param("id"), 10);

    if (isNaN(userId)) {
      return c.json({
        success: false,
        error: "Invalid user ID",
      }, 400);
    }

    // Parse and validate query parameters (camelCase)
    const schema = z.object({
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
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

    const { fromDate, toDate, page, limit } = result.data;

    // Build date filters
    const dateFilters = [];

    if (fromDate && !toDate) {
      // Single date filter
      const fromDateTime = new Date(fromDate);
      const nextDay = new Date(fromDateTime);
      nextDay.setDate(nextDay.getDate() + 1);

      dateFilters.push(
        between(
          expenses.expense_date,
          fromDateTime,
          nextDay
        )
      );
    } else if (fromDate && toDate) {
      // Date range filter
      dateFilters.push(
        between(
          expenses.expense_date,
          new Date(fromDate),
          new Date(toDate)
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

    // Convert to camelCase
    const camelCaseUser = convertObjectKeys(user, 'camelCase');
    const camelCaseExpenses = userExpenses.map(expense => convertObjectKeys(expense, 'camelCase'));
    const camelCaseStats = expenseStats ? convertObjectKeys(expenseStats, 'camelCase') : {
      totalAmount: "0",
      avgAmount: "0",
      maxAmount: "0",
      minAmount: "0"
    };

    return c.json({
      success: true,
      data: {
        user: camelCaseUser,
        expenses: camelCaseExpenses,
        stats: camelCaseStats,
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