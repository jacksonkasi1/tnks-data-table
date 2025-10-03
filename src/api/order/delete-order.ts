// ** import core packages
import { z } from "zod";

const API_BASE_URL = "/api";

// Response schema
const deleteOrderResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
  details: z.array(z.any()).optional(),
});

export type DeleteOrderResponse = z.infer<typeof deleteOrderResponseSchema>;

/**
 * Delete an entire order (parent row) with all its items
 * @param orderId - The ID of the order to delete
 * @returns Promise<DeleteOrderResponse> - The response from the API
 * @throws Error if the API request fails
 */
export async function deleteOrder(
  orderId: number
): Promise<DeleteOrderResponse> {
  try {
    // Make API request
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "DELETE",
    });

    // Parse response
    const data = await response.json();

    // Validate response
    const validatedResponse = deleteOrderResponseSchema.parse(data);

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(validatedResponse.error || "Failed to delete order");
    }

    return validatedResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format from server");
    }
    throw error;
  }
}
