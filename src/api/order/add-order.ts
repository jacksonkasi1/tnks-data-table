// ** import core packages
import { z } from "zod";

const API_BASE_URL = "/api";

// Response schema
const addOrderResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      id: z.number(),
      order_id: z.string(),
      customer_name: z.string(),
      customer_email: z.string(),
      order_date: z.string(),
      status: z.string(),
      total_items: z.number(),
      total_amount: z.string(),
      created_at: z.string(),
    })
    .optional(),
  error: z.string().optional(),
  details: z.array(z.any()).optional(),
});

export type AddOrderResponse = z.infer<typeof addOrderResponseSchema>;

/**
 * Add a new order with random seed data
 * @returns Promise<AddOrderResponse> - The response from the API
 * @throws Error if the API request fails
 */
export async function addOrder(): Promise<AddOrderResponse> {
  try {
    // Make API request - backend will generate random order data
    const response = await fetch(`${API_BASE_URL}/orders/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Parse response
    const data = await response.json();

    // Validate response
    const validatedResponse = addOrderResponseSchema.parse(data);

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(validatedResponse.error || "Failed to add order");
    }

    return validatedResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format from server");
    }
    throw error;
  }
}
