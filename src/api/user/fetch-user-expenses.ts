// ** Import Schema
import { userExpensesResponseSchema } from "@/app/(home)/data-table/schema";

const API_BASE_URL = "/api";

/**
 * Fetch expenses for a specific user
 */
export async function fetchUserExpenses({
  userId,
  from_date = "",
  to_date = "",
  page = 1,
  limit = 10,
}: {
  userId: number;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}) {
  // Build query parameters
  const params = new URLSearchParams();
  if (from_date) params.append("from_date", from_date);
  if (to_date) params.append("to_date", to_date);
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  // Fetch data
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}/expenses?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch user expenses: ${response.statusText}`);
  }

  const data = await response.json();
  return userExpensesResponseSchema.parse(data);
}
