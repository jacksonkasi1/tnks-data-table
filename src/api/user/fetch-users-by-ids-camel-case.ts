// ** Import Types
import { UserCamelCase } from "@/app/(home)/example/users-camel-case/data-table/schema/user-schema";

const API_BASE_URL = "/api";

/**
 * Fetch users by IDs using camelCase API
 */
export async function fetchUsersByIdsCamelCase(
  ids: number[] | string[]
): Promise<UserCamelCase[]> {
  if (ids.length === 0) {
    return [];
  }

  // Convert ids to comma-separated string (handle both number[] and string[])
  const idsParam = ids.map(id => String(id)).join(",");

  // Fetch data from camelCase API endpoint
  const response = await fetch(
    `${API_BASE_URL}/users/camel-case/by-ids?ids=${idsParam}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch users by IDs: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch users by IDs");
  }

  return data.data;
}