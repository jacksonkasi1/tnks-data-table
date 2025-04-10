// ** Import 3rd Party Libs
import { z } from "zod";

const API_BASE_URL = "/api";

// Response schema
const deleteUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
  details: z.array(z.any()).optional(),
});

export type DeleteUserResponse = z.infer<typeof deleteUserResponseSchema>;

/**
 * Delete a user by ID
 * @param userId - The ID of the user to delete
 * @returns Promise<DeleteUserResponse> - The response from the API
 * @throws Error if the API request fails
 */
export async function deleteUser(userId: number): Promise<DeleteUserResponse> {
  try {
    // Make API request
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
    });

    // Parse response
    const data = await response.json();

    // Validate response
    const validatedResponse = deleteUserResponseSchema.parse(data);

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(validatedResponse.error || "Failed to delete user");
    }

    return validatedResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format from server");
    }
    throw error;
  }
} 