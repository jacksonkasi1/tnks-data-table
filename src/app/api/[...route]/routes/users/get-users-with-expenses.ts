import { Hono } from "hono";
import { z } from "zod";
import { and, asc, between, count, desc, eq, ilike, or, sql, sum } from "drizzle-orm";

// Database
import { db } from "@/db";
import { expenses } from "@/db/schema/tbl_expenses";
import { users } from "@/db/schema/tbl_users";

// Create a router
const router = new Hono();

// Schema for query parameters
const querySchema = z.object({
  search: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  sort_by: z.enum(["name", "email", "total_expenses", "created_at"]).default("created_at"),
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
    
    // Get users with expense aggregations
    const usersWithExpenses = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        age: users.age,
        created_at: users.created_at,
        expense_count: count(expenses.id),
        total_expenses: sql<string>`cast(sum(${expenses.amount}) as text)`,
      })
      .from(users)
      .leftJoin(expenses, eq(users.id, expenses.user_id))
      .where(and(...filters))
      .groupBy(users.id)
      .orderBy(
        sort_by === "total_expenses" 
          ? sort_order === "asc" 
            ? asc(sql`sum(${expenses.amount})`) 
            : desc(sql`sum(${expenses.amount})`)
          : sort_by === "name"
            ? sort_order === "asc" ? asc(users.name) : desc(users.name)
            : sort_by === "email"
              ? sort_order === "asc" ? asc(users.email) : desc(users.email)
              : sort_order === "asc" ? asc(users.created_at) : desc(users.created_at)
      )
      .limit(limit)
      .offset((page - 1) * limit);
    
    // If date filtering is applied, we need to get the detailed expenses with filter
    if (from_date || to_date) {
      // Handle single date case
      const dateFilters = [];
      
      if (from_date && !to_date) {
        // Single date filter: expenses on specific date
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
      
      // Get user IDs from the first query
      const userIds = usersWithExpenses.map(user => user.id);
      
      if (userIds.length > 0) {
        // Get filtered expenses for these users
        const filteredExpenses = await db
          .select({
            user_id: expenses.user_id,
            expense_count: count(expenses.id),
            total_expenses: sql<string>`cast(sum(${expenses.amount}) as text)`,
          })
          .from(expenses)
          .where(
            and(
              ...dateFilters,
              // Only include expenses for users in our result set
              sql`${expenses.user_id} = ANY(ARRAY[${userIds.join(',')}]::int[])`
            )
          )
          .groupBy(expenses.user_id);
        
        // Create a lookup map for the filtered expense data
        const expenseLookup = new Map(
          filteredExpenses.map(item => [item.user_id, item])
        );
        
        // Update the user data with the filtered expense information
        for (const user of usersWithExpenses) {
          const filteredData = expenseLookup.get(user.id);
          if (filteredData) {
            user.expense_count = filteredData.expense_count;
            user.total_expenses = filteredData.total_expenses;
          } else {
            // No expenses in the date range
            user.expense_count = 0;
            user.total_expenses = "0";
          }
        }
      }
    }
    
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
