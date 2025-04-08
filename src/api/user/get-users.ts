// API helper functions to interact with the backend API

import { usersResponseSchema, userExpensesResponseSchema, User, Expense } from "@/app/(home)/data-table-components/schema";

const API_BASE_URL = "/api";

/**
 * Fetch users with expenses
 */
export async function fetchUsers({
  search = "",
  from_date = "",
  to_date = "",
  sort_by = "created_at",
  sort_order = "desc",
  page = 1,
  limit = 10,
}: {
  search?: string;
  from_date?: string;
  to_date?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
}) {
  // Build query parameters
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (from_date) params.append("from_date", from_date);
  if (to_date) params.append("to_date", to_date);
  params.append("sort_by", sort_by);
  params.append("sort_order", sort_order);
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  // Fetch data
  const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  
  const data = await response.json();
  return usersResponseSchema.parse(data);
}

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
  const response = await fetch(`${API_BASE_URL}/users/${userId}/expenses?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user expenses: ${response.statusText}`);
  }
  
  const data = await response.json();
  return userExpensesResponseSchema.parse(data);
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
} 