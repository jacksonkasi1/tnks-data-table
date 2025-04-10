// ** Import 3rd Party Libs
import { z } from "zod";

// ** Import Schema
import { NewUser } from "@/db/schema/tbl_users";

const API_BASE_URL = "/api";

// Input validation schema
const addUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  age: z.number().int().min(0, "Age must be a positive number"),
  email: z.string().email("Invalid email format").max(255),
  phone: z.string().min(1, "Phone is required").max(255),
});

// Response schema
const addUserResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      id: z.number(),
      name: z.string(),
      age: z.number(),
      email: z.string(),
      phone: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
    })
    .optional(),
  error: z.string().optional(),
  details: z.array(z.any()).optional(),
});

export type AddUserResponse = z.infer<typeof addUserResponseSchema>;

/**
 * Add a new user to the system
 * @param userData - The user data to add
 * @returns Promise<AddUserResponse> - The response from the API
 * @throws Error if the API request fails
 */
export async function addUser(userData: NewUser): Promise<AddUserResponse> {
  try {
    // Validate input data
    const validatedData = addUserSchema.parse(userData);

    // Make API request
    const response = await fetch(`${API_BASE_URL}/users/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData),
    });

    // Parse response
    const data = await response.json();

    // Validate response
    const validatedResponse = addUserResponseSchema.parse(data);

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(validatedResponse.error || "Failed to add user");
    }

    return validatedResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format from server");
    }
    throw error;
  }
}
