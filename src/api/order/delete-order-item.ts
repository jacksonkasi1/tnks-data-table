// ** import core packages
import { z } from "zod";

const API_BASE_URL = "/api";

// Response schema
const deleteOrderItemResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
  details: z.array(z.any()).optional(),
});

export type DeleteOrderItemResponse = z.infer<
  typeof deleteOrderItemResponseSchema
>;

/**
 * Delete a single order item (subrow)
 * @param itemId - The ID of the order item to delete
 * @returns Promise<DeleteOrderItemResponse> - The response from the API
 * @throws Error if the API request fails
 */
export async function deleteOrderItem(
  itemId: number
): Promise<DeleteOrderItemResponse> {
  try {
    // Make API request
    const response = await fetch(`${API_BASE_URL}/orders/items/${itemId}`, {
      method: "DELETE",
    });

    // Parse response
    const data = await response.json();

    // Validate response
    const validatedResponse = deleteOrderItemResponseSchema.parse(data);

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(validatedResponse.error || "Failed to delete order item");
    }

    return validatedResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format from server");
    }
    throw error;
  }
}
