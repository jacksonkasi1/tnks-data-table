import { usersResponseSchema } from "@/app/(home)/data-table/schema";

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
  // Process search term - trim and sanitize
  const processedSearch = search ? search.trim().replace(/\s+/g, ' ') : "";

  // Build query parameters
  const params = new URLSearchParams();
  if (processedSearch) params.append("search", processedSearch);
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