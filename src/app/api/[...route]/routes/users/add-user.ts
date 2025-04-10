import { Hono } from "hono";

// ** Import 3rd Party Libs
import { z } from "zod";
import { eq } from "drizzle-orm";

// ** Import DB
import { db } from "@/db";

// ** Import Schema
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
