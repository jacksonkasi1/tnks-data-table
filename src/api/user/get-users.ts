// API helper functions to interact with the backend API

import { usersResponseSchema, userExpensesResponseSchema, User } from "@/app/(home)/data-table/schema";

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
 * Fetch specific users by their IDs
 */
export async function fetchUsersByIds(userIds: number[]): Promise<User[]> {
  if (userIds.length === 0) {
    return [];
  }
  
  // Use a more efficient approach with batching
  // Define a reasonable batch size to avoid URL length limits
  const BATCH_SIZE = 50;
  const results: User[] = [];

  // Process in batches
  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    const batchIds = userIds.slice(i, i + BATCH_SIZE);
    
    try {
      // Build parameter string with multiple IDs
      const params = new URLSearchParams();
      // Add each ID as a separate "id" parameter
      batchIds.forEach(id => {
        params.append("id", id.toString());
      });
      
      // Set a large limit to ensure we get all matches
      params.append("limit", "1000"); 
      
      // Fetch the batch
      const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      
      const data = await response.json();
      const parsedData = usersResponseSchema.parse(data);
      
      // Add the batch results to our collection
      // Filter to ensure we only include users that were requested
      const validUsers = parsedData.data.filter(user => 
        batchIds.includes(user.id)
      );
      
      results.push(...validUsers);
    } catch (error) {
      console.error(`Error fetching batch of users:`, error);
      // Continue with the next batch even if this one failed
    }
  }
  
  // Create a map of user ID to user to eliminate potential duplicates
  const userMap = new Map<number, User>();
  results.forEach(user => {
    userMap.set(user.id, user);
  });
  
  // Find which user IDs we're missing
  const foundIds = Array.from(userMap.keys());
  const missingIds = userIds.filter(id => !foundIds.includes(id));
  
  if (missingIds.length > 0) {
    console.warn(`Failed to fetch data for ${missingIds.length} users: ${missingIds.join(", ")}`);
  }
  
  // Return the results in the same order as the input IDs where possible
  return userIds
    .map(id => userMap.get(id))
    .filter((user): user is User => user !== undefined);
} 