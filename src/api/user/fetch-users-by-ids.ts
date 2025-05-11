// ** Import Schema
import { usersResponseSchema, User } from "@/app/(home)/data-table/schema";

const API_BASE_URL = "/api";

/**
 * Fetch specific users by their IDs
 */
export async function fetchUsersByIds(userIds: string[] | number[]): Promise<User[]> {
  if (userIds.length === 0) {
    return [];
  }

  // Convert all IDs to numbers for consistent processing
  const numericIds = userIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id);

  // Use a more efficient approach with batching
  // Define a reasonable batch size to avoid URL length limits
  const BATCH_SIZE = 50;
  const results: User[] = [];

  // Process in batches
  for (let i = 0; i < numericIds.length; i += BATCH_SIZE) {
    const batchIds = numericIds.slice(i, i + BATCH_SIZE);
    
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
  const missingIds = numericIds.filter(id => !foundIds.includes(id));

  if (missingIds.length > 0) {
    console.warn(`Failed to fetch data for ${missingIds.length} users: ${missingIds.join(", ")}`);
  }
  
  // Return the results in the same order as the input IDs where possible
  return numericIds
    .map(id => userMap.get(id))
    .filter((user): user is User => user !== undefined);
}