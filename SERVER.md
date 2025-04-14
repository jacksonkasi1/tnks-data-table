# Server Implementation Guide for Data Table API

## Using Hono.js, Drizzle ORM, and PostgreSQL

**Version:** 1.0.0  
**Updated:** 2025-04-14 07:08:59  
**Author:** Jackson Kasi

## Table of Contents

1. [Introduction](#introduction)
2. [Technology Stack](#technology-stack)
3. [Project Setup](#project-setup)
4. [Database Configuration](#database-configuration)
5. [Schema Definition](#schema-definition)
6. [API Architecture](#api-architecture)
7. [API Implementation](#api-implementation)
   - [Route Configuration](#route-configuration)
   - [Request Handlers](#request-handlers)
   - [Error Handling](#error-handling)
8. [Endpoint Implementation](#endpoint-implementation)
   - [List Endpoint](#list-endpoint)
   - [Single Item Endpoint](#single-item-endpoint)
   - [Create Endpoint](#create-endpoint)
   - [Delete Endpoint](#delete-endpoint)
   - [Batch Operations](#batch-operations)
9. [Query Parameter Handling](#query-parameter-handling)
   - [Filtering Implementation](#filtering-implementation)
   - [Sorting Implementation](#sorting-implementation)
   - [Pagination Implementation](#pagination-implementation)
   - [Search Implementation](#search-implementation)
10. [Data Validation](#data-validation)
11. [Response Format](#response-format)
12. [Performance Optimization](#performance-optimization)
13. [Security Considerations](#security-considerations)
14. [Deployment](#deployment)
15. [Best Practices](#best-practices)
16. [Troubleshooting](#troubleshooting)
17. [References](#references)

---

## Introduction

This guide provides a comprehensive walkthrough for implementing server-side APIs to support data table components using Hono.js (a lightweight web framework), Drizzle ORM (a TypeScript ORM), and PostgreSQL. The implementation follows RESTful principles and includes features such as pagination, sorting, filtering, and CRUD operations.

The server implementation described in this guide is specifically designed to work with the Advanced Data Table component, providing all the necessary endpoints and data structures required by the frontend.

---

## Technology Stack

### Core Technologies

- **Hono.js**: A small, simple, and ultrafast web framework for the Edges
- **Drizzle ORM**: TypeScript ORM with strong focus on type safety
- **PostgreSQL**: Advanced open-source relational database
- **Neon Database**: Serverless Postgres service (optional, can be replaced with any PostgreSQL provider)
- **TypeScript**: For type safety and better developer experience
- **Zod**: Schema validation library

### Key Dependencies

```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.6.0",
    "drizzle-orm": "^0.28.6",
    "hono": "^3.10.0",
    "zod": "^3.22.4",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "drizzle-kit": "^0.19.13",
    "typescript": "^5.2.2"
  }
}
```

---

## Project Setup

### Installation

If you're using Bun (as specified):

```bash
# Create a new project directory
mkdir data-table-api
cd data-table-api

# Initialize the project
bun init

# Install dependencies
bun add hono @hono/node-server drizzle-orm @neondatabase/serverless zod dotenv
bun add -D drizzle-kit typescript @types/node
```

### Directory Structure

```
src/
├── app/                       # Application routes
│   └── api/                   # API routes
│       └── [...route]/        # Catch-all route for API
│           ├── route.tsx      # API route handler
│           └── routes/        # Route implementations
│               ├── index.ts   # Routes barrel file
│               └── users/     # User-related routes
│                   ├── add-user.ts              # Create user endpoint
│                   ├── delete-user.ts           # Delete user endpoint
│                   ├── get-users-with-expenses.ts # List users endpoint
│                   └── index.ts                 # User routes barrel file
├── db/                        # Database configuration
│   ├── index.ts               # Database connection setup
│   └── schema/                # Database schema definitions
│       ├── index.ts           # Schema barrel file
│       ├── tbl_users.ts       # User table schema
│       └── tbl_expenses.ts    # Expenses table schema
├── env.ts                     # Environment variable validation
└── index.ts                   # Application entry point

# Configuration files
drizzle.config.ts              # Drizzle ORM configuration
.env                           # Environment variables (not in version control)
example.env                    # Example environment variables template
tsconfig.json                  # TypeScript configuration
```

---

## Database Configuration

### Environment Configuration

Create a `.env` file with your database credentials:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

Create an `env.ts` file to validate environment variables:

```typescript
// src/env.ts
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, { message: "DATABASE_URL is required" }),
});

export const env = envSchema.parse(process.env);
```

### Database Connection Setup

Create a database connection file:

```typescript
// src/db/index.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// ** Table Schema
import * as schema from "./schema";

// ** Env
import { env } from "@/env";

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, {
  schema,
});
```

### Drizzle Configuration

Create a `drizzle.config.ts` file for migrations and schema management:

```typescript
// drizzle.config.ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## Schema Definition

### User Schema

Define the user table schema:

```typescript
// src/db/schema/tbl_users.ts
import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { expenses } from "./tbl_expenses";

export const users = pgTable("tbl_users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  age: integer("age").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 255 }).notNull().unique(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Export type
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Table relationships
export const userRelations = relations(users, ({ many }) => ({
  expenses: many(expenses),
}));
```

### Expense Schema

Define the expense table schema with a relationship to users:

```typescript
// src/db/schema/tbl_expenses.ts
import {
  integer,
  pgTable,
  varchar,
  timestamp,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./tbl_users";

export const expenses = pgTable("tbl_expenses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expense_name: varchar("expense_name", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  expense_date: timestamp("expense_date").notNull().defaultNow(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

// Table relationships
export const expenseRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.user_id],
    references: [users.id],
  }),
}));
```

### Schema Barrel File

Create an index file to export all schemas:

```typescript
// src/db/schema/index.ts
export * from "./tbl_users";
export * from "./tbl_expenses";
```

---

## API Architecture

### API Route Handler

Create the main API route handler:

```typescript
// src/app/api/[...route]/route.tsx
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
```

### Routes Configuration

Set up the main router and user routes:

```typescript
// src/app/api/[...route]/routes/index.ts
import { Hono } from "hono";
import { user_routes } from "./users";

export const router = new Hono();
router.route("/users", user_routes);
```

```typescript
// src/app/api/[...route]/routes/users/index.ts
import { Hono } from "hono";

// ** import api
import getUsersWithExpenses from "./get-users-with-expenses";
import addUser from "./add-user";
import deleteUser from "./delete-user";

// ** create router
export const user_routes = new Hono();

// Mount API routes - each route handler defines its own path structure
user_routes.route("/", getUsersWithExpenses);
user_routes.route("/add", addUser);
user_routes.route("/", deleteUser);
```

---

## API Implementation

### Request Handlers

The following sections detail the implementation of key API endpoints.

#### List Endpoint Implementation

```typescript
// src/app/api/[...route]/routes/users/get-users-with-expenses.ts
import { Hono } from "hono";
import { z } from "zod";
import {
  and,
  asc,
  between,
  count,
  desc,
  eq,
  ilike,
  or,
  sql,
} from "drizzle-orm";
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
  sort_by: z
    .enum(["name", "email", "total_expenses", "created_at"])
    .default("created_at"),
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
      return c.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: result.error.format(),
        },
        400
      );
    }

    const { search, from_date, to_date, sort_by, sort_order, page, limit } =
      result.data;

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
    if (
      from_date &&
      to_date &&
      from_date.trim() !== "" &&
      to_date.trim() !== ""
    ) {
      // Date range filter
      filters.push(
        between(users.created_at, new Date(from_date), new Date(to_date))
      );
    } else if (from_date && from_date.trim() !== "") {
      // Single date filter: users created on or after specific date
      const fromDateTime = new Date(from_date);
      filters.push(sql`${users.created_at} >= ${fromDateTime}`);
    } else if (to_date && to_date.trim() !== "") {
      // Users created on or before specific date
      const toDateTime = new Date(to_date);
      filters.push(sql`${users.created_at} <= ${toDateTime}`);
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
        sort_by === "total_expenses"
          ? sort_order === "asc"
            ? asc(sql`coalesce(sum(${expenses.amount}), 0)`)
            : desc(sql`coalesce(sum(${expenses.amount}), 0)`)
          : sort_by === "name"
          ? sort_order === "asc"
            ? asc(users.name)
            : desc(users.name)
          : sort_by === "email"
          ? sort_order === "asc"
            ? asc(users.email)
            : desc(users.email)
          : sort_order === "asc"
          ? asc(users.created_at)
          : desc(users.created_at)
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
    return c.json(
      {
        success: false,
        error: "Failed to fetch users with expenses",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

// Get user expenses by ID with date filtering
router.get("/:id/expenses", async (c) => {
  try {
    const userId = parseInt(c.req.param("id"), 10);

    if (isNaN(userId)) {
      return c.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        400
      );
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
      return c.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: result.error.format(),
        },
        400
      );
    }

    const { from_date, to_date, page, limit } = result.data;

    // Build date filters
    const dateFilters = [];

    if (from_date && !to_date) {
      // Single date filter
      const fromDateTime = new Date(from_date);
      const nextDay = new Date(fromDateTime);
      nextDay.setDate(nextDay.getDate() + 1);

      dateFilters.push(between(expenses.expense_date, fromDateTime, nextDay));
    } else if (from_date && to_date) {
      // Date range filter
      dateFilters.push(
        between(expenses.expense_date, new Date(from_date), new Date(to_date))
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
        updated_at: expenses.updated_at,
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
      return c.json(
        {
          success: false,
          error: "User not found",
        },
        404
      );
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
          min_amount: "0",
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
    return c.json(
      {
        success: false,
        error: "Failed to fetch user expenses",
      },
      500
    );
  }
});

export default router;
```

#### Create User Endpoint

```typescript
// src/app/api/[...route]/routes/users/add-user.ts
import { Hono } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema/tbl_users";

// Create a new Hono app
const app = new Hono();

// Input validation schema
const addUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  age: z.number().int().min(0, "Age must be a positive number"),
  email: z.string().email("Invalid email format").max(255),
  phone: z.string().min(1, "Phone is required").max(255),
});

// POST /api/users/add
app.post("/", async (c) => {
  try {
    // Parse and validate request body
    const body = await c.req.json();
    const validatedData = addUserSchema.parse(body);

    // Check if email already exists
    const existingEmail = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (existingEmail) {
      return c.json(
        {
          success: false,
          error: "Email already exists",
        },
        409
      );
    }

    // Check if phone already exists
    const existingPhone = await db.query.users.findFirst({
      where: eq(users.phone, validatedData.phone),
    });

    if (existingPhone) {
      return c.json(
        {
          success: false,
          error: "Phone number already exists",
        },
        409
      );
    }

    // Insert new user
    const [newUser] = await db
      .insert(users)
      .values({
        name: validatedData.name,
        age: validatedData.age,
        email: validatedData.email,
        phone: validatedData.phone,
      })
      .returning();

    return c.json(
      {
        success: true,
        data: newUser,
      },
      201
    );
  } catch (error) {
    console.error("Error adding user:", error);

    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        400
      );
    }

    return c.json(
      {
        success: false,
        error: "Internal server error",
      },
      500
    );
  }
});

export default app;
```

#### Delete User Endpoint

```typescript
// src/app/api/[...route]/routes/users/delete-user.ts
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema/tbl_users";
import { expenses } from "@/db/schema/tbl_expenses";

// Create a new Hono app
const app = new Hono();

// DELETE /api/users/:id
app.delete("/:id", async (c) => {
  try {
    // Parse and validate user ID
    const userId = parseInt(c.req.param("id"), 10);

    if (isNaN(userId)) {
      return c.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        400
      );
    }

    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return c.json(
        {
          success: false,
          error: "User not found",
        },
        404
      );
    }

    // First delete all expenses associated with the user
    await db.delete(expenses).where(eq(expenses.user_id, userId));

    // Then delete the user
    await db.delete(users).where(eq(users.id, userId));

    return c.json(
      {
        success: true,
        message: "User and associated expenses deleted successfully",
      },
      200
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return c.json(
      {
        success: false,
        error: "Failed to delete user",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default app;
```

---

## Endpoint Implementation Details

### List Endpoint

The list endpoint retrieves multiple user records with support for filtering, sorting, and pagination. Here's a breakdown of its key components:

#### Query Parameters

1. **search**: Allows text search across user fields (name, email, phone)
2. **from_date** & **to_date**: Date range filtering for the created_at field
3. **sort_by**: Field to sort by (name, email, total_expenses, created_at)
4. **sort_order**: Sort direction (asc or desc)
5. **page**: Page number for pagination (1-based)
6. **limit**: Number of items per page

#### Implementation Highlights

1. **Parameter Validation**: Uses Zod schema to validate and parse query parameters
2. **Dynamic Filtering**: Builds filters based on provided parameters
3. **SQL Aggregation**: Uses SQL expressions for aggregating expense data
4. **Efficient Pagination**: Includes limit and offset for SQL-level pagination
5. **Complete Pagination Info**: Returns total pages and items for UI pagination controls

#### Response Structure

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "age": 30,
      "created_at": "2025-04-10T08:30:45.123Z",
      "expense_count": 5,
      "total_expenses": "1250.75"
    }
    // ... more user records
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_pages": 5,
    "total_items": 48
  }
}
```

### Single Item Endpoint

The API includes an endpoint to get detailed information about a specific user including their expenses.

#### Path Parameters

- **id**: The unique identifier of the user

#### Query Parameters

1. **from_date** & **to_date**: Date range filtering for expenses
2. **page**: Page number for expense pagination
3. **limit**: Number of expenses per page

#### Implementation Highlights

1. **Parameter Validation**: Validates user ID and query parameters
2. **Relationship Handling**: Fetches related expense records
3. **Date Filtering**: Filters expenses by date range
4. **Aggregation**: Calculates expense statistics
5. **Detailed Response**: Includes user details, paginated expenses, and expense statistics

#### Response Structure

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "age": 30,
      "created_at": "2025-04-10T08:30:45.123Z"
    },
    "expenses": [
      {
        "id": 101,
        "user_id": 1,
        "expense_name": "Office Supplies",
        "amount": "150.75",
        "expense_date": "2025-04-05T10:15:30.000Z",
        "created_at": "2025-04-05T10:15:30.000Z",
        "updated_at": "2025-04-05T10:15:30.000Z"
      }
      // ... more expense records
    ],
    "stats": {
      "total_amount": "1250.75",
      "avg_amount": "250.15",
      "max_amount": "500.00",
      "min_amount": "50.25"
    }
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_pages": 1,
    "total_items": 5
  }
}
```

### Create Endpoint

The create endpoint adds a new user to the system.

#### Request Body

```json
{
  "name": "Jane Smith",
  "age": 28,
  "email": "jane@example.com",
  "phone": "+9876543210"
}
```

#### Implementation Highlights

1. **Input Validation**: Uses Zod schema to validate request body
2. **Uniqueness Check**: Verifies email and phone uniqueness before creating
3. **Database Insert**: Uses Drizzle ORM to insert the new record
4. **Structured Response**: Returns the created user data with success status

#### Response Structure

```json
{
  "success": true,
  "data": {
    "id": 49,
    "name": "Jane Smith",
    "age": 28,
    "email": "jane@example.com",
    "phone": "+9876543210",
    "created_at": "2025-04-14T07:08:59.123Z",
    "updated_at": "2025-04-14T07:08:59.123Z"
  }
}
```

### Delete Endpoint

The delete endpoint removes a user and their associated expenses.

#### Path Parameters

- **id**: The unique identifier of the user to delete

#### Implementation Highlights

1. **Parameter Validation**: Validates the user ID
2. **Existence Check**: Verifies that the user exists before deletion
3. **Cascading Delete**: Deletes all associated expense records first
4. **Success Response**: Returns confirmation of successful deletion

#### Response Structure

```json
{
  "success": true,
  "message": "User and associated expenses deleted successfully"
}
```

---

## Query Parameter Handling

### Filtering Implementation

Filtering allows clients to request only resources matching specific criteria.

#### Search Filtering

The search parameter performs a case-insensitive search across multiple fields:

```typescript
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
```

#### Date Filtering

Date filtering allows filtering records by a date range:

```typescript
// Date filtering based on user created_at
if (from_date && to_date) {
  // Date range filter
  filters.push(
    between(users.created_at, new Date(from_date), new Date(to_date))
  );
} else if (from_date) {
  // Single date filter: on or after specific date
  const fromDateTime = new Date(from_date);
  filters.push(sql`${users.created_at} >= ${fromDateTime}`);
} else if (to_date) {
  // On or before specific date
  const toDateTime = new Date(to_date);
  filters.push(sql`${users.created_at} <= ${toDateTime}`);
}
```

### Sorting Implementation

Sorting allows the client to specify the order of returned resources:

```typescript
// Apply sorting based on sort_by and sort_order parameters
.orderBy(
  sort_by === "total_expenses"
    ? sort_order === "asc"
      ? asc(sql`coalesce(sum(${expenses.amount}), 0)`)
      : desc(sql`coalesce(sum(${expenses.amount}), 0)`)
    : sort_by === "name"
      ? sort_order === "asc" ? asc(users.name) : desc(users.name)
      : sort_by === "email"
        ? sort_order === "asc" ? asc(users.email) : desc(users.email)
        : sort_order === "asc" ? asc(users.created_at) : desc(users.created_at)
)
```

### Pagination Implementation

Pagination breaks large result sets into smaller pages:

```typescript
// Apply pagination
.limit(limit)
.offset((page - 1) * limit)
```

The response includes pagination metadata:

```typescript
"pagination": {
  page,
  limit,
  total_pages: Math.ceil(totalItems / limit),
  total_items: totalItems,
}
```

### Search Implementation

Search functionality allows text searching across multiple fields:

```typescript
if (search) {
  filters.push(
    or(
      ilike(users.name, `%${search}%`),
      ilike(users.email, `%${search}%`),
      ilike(users.phone, `%${search}%`)
    )
  );
}
```

The `ilike` operator performs case-insensitive partial matching on text fields.

---

## Data Validation

### Input Validation

Input validation is crucial for ensuring data integrity and security. The implementation uses Zod for schema validation:

```typescript
// Input validation schema
const addUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  age: z.number().int().min(0, "Age must be a positive number"),
  email: z.string().email("Invalid email format").max(255),
  phone: z.string().min(1, "Phone is required").max(255),
});

// Parse and validate request body
const body = await c.req.json();
const validatedData = addUserSchema.parse(body);
```

### Query Parameter Validation

Query parameters are also validated using Zod schemas:

```typescript
// Schema for query parameters
const querySchema = z.object({
  search: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  sort_by: z
    .enum(["name", "email", "total_expenses", "created_at"])
    .default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

// Parse and validate query parameters
const result = querySchema.safeParse(c.req.query());

if (!result.success) {
  return c.json(
    {
      success: false,
      error: "Invalid query parameters",
      details: result.error.format(),
    },
    400
  );
}
```

### Error Response for Validation Failures

When validation fails, a structured error response is returned:

```typescript
if (error instanceof z.ZodError) {
  return c.json(
    {
      success: false,
      error: "Validation error",
      details: error.errors,
    },
    400
  );
}
```

---

## Response Format

### Standard Response Structure

All API responses follow a consistent structure:

#### Success Response

```json
{
  "success": true,
  "data": {...} | [...],
  "pagination": {...},  // Only for list endpoints
  "message": "..."      // Optional success message
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": {...} | [...] // Optional detailed error information
}
```

### Status Codes

The API uses appropriate HTTP status codes:

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **404**: Not Found
- **409**: Conflict (e.g., duplicate email)
- **500**: Internal Server Error

---

## Performance Optimization

### Query Optimization

1. **Efficient Joins**: Uses left joins to connect users and expenses when needed
2. **SQL Aggregation**: Calculates aggregations at the database level
3. **Indexed Fields**: Ensures that frequently queried fields are indexed
4. **Limited Result Sets**: Uses pagination to limit the number of records returned

### Database Optimization

1. **Proper Indexing**: Primary keys and foreign keys are indexed
2. **PostgreSQL Optimization**: Leverages PostgreSQL's efficient query execution
3. **Connection Pooling**: Uses connection pooling for better performance
4. **Typed Queries**: Uses Drizzle ORM for type-safe and optimized queries

---

## Security Considerations

### Input Validation

All user inputs are validated using Zod schemas before processing.

### CORS Configuration

CORS is configured to control access to the API:

```typescript
import { cors } from "hono/cors";
app.use("*", cors());
```

For production, you should restrict the CORS settings to specific origins:

```typescript
app.use(
  "*",
  cors({
    origin: ["https://yourdomain.com", "https://app.yourdomain.com"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    maxAge: 86400,
  })
);
```

### SQL Injection Prevention

Drizzle ORM provides protection against SQL injection by using parameterized queries.

### Error Handling

Detailed error information is only exposed in the API response when necessary, avoiding leakage of sensitive information.

---

## Deployment

### Vercel Deployment

This implementation is designed to work with Vercel's serverless functions. The main API route exports handlers for different HTTP methods:

```typescript
// Export Vercel handlers
export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
export const PUT = handle(app);
```

### Database Connection

For serverless environments, use connection pooling and consider the following:

1. **Serverless Database**: Use database services like Neon, PlanetScale, or Supabase optimized for serverless environments
2. **Connection Limits**: Be aware of connection limits in serverless environments
3. **Warm-up Strategies**: Consider strategies to keep database connections warm

### Environment Variables

Ensure all required environment variables are set in your deployment environment:

```
DATABASE_URL="postgresql://user:password@host:port/database"
```

---

## Best Practices

### 1. Type Safety

- Use TypeScript for type checking
- Leverage Drizzle ORM's type inference
- Define proper interfaces and types

### 2. Code Organization

- Group related functionality (routes, handlers, models)
- Use barrel files for clean imports
- Keep functions focused on a single responsibility

### 3. Error Handling

- Catch and handle all potential errors
- Provide meaningful error messages
- Log errors for debugging
- Return appropriate HTTP status codes

### 4. Query Optimization

- Only fetch the fields you need
- Use indexes for frequently queried fields
- Limit result sets with pagination
- Use JOINs efficiently

### 5. Validation

- Validate all inputs with Zod schemas
- Validate query parameters
- Perform business rule validation (e.g., uniqueness checks)

### 6. Security

- Sanitize inputs
- Validate data before processing
- Use HTTPS
- Configure CORS appropriately
- Implement authentication and authorization

### 7. Documentation

- Document API endpoints
- Include response formats
- Document query parameters
- Provide usage examples

---

## Troubleshooting

### Common Issues

#### Issue: Database Connection Failures

**Possible Causes:**

- Invalid connection string
- Database server is down
- Network issues
- Connection limit reached

**Solution:**

- Verify the connection string format
- Check if the database server is accessible
- Ensure you have the correct credentials
- Implement retry logic with exponential backoff

#### Issue: Validation Errors

**Possible Causes:**

- Client sending invalid data
- Schema validation too strict

**Solution:**

- Check the request payload against the schema requirements
- Add detailed validation error messages
- Consider making some validation rules more lenient if appropriate

#### Issue: Performance Problems

**Possible Causes:**

- Missing database indexes
- Inefficient queries
- Large result sets

**Solution:**

- Add indexes to frequently queried fields
- Optimize JOIN operations
- Ensure pagination is properly implemented
- Use SQL EXPLAIN to analyze query performance

#### Issue: Endpoint Returns 500 Error

**Possible Causes:**

- Uncaught exceptions in handler
- Database query errors
- Invalid data transformations

**Solution:**

- Add comprehensive try-catch blocks
- Log errors with detailed information
- Check data types before transformations
- Verify that the database schema matches your expectations

---

## References

### Official Documentation

1. [Hono Documentation](https://hono.dev/)
2. [Drizzle ORM Documentation](https://orm.drizzle.team/)
3. [PostgreSQL Documentation](https://www.postgresql.org/docs/)
4. [Neon PostgreSQL Documentation](https://neon.tech/docs/)
5. [Zod Documentation](https://zod.dev/)

### Recommended Reading

1. [Database Performance Optimization](https://use-the-index-luke.com/)
2. [API Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
3. [Understanding Data Pagination](https://www.moesif.com/blog/technical/api-design/REST-API-Design-Filtering-Sorting-and-Pagination/)
