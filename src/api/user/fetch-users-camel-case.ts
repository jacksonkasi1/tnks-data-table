// ** Import Schema
import { usersCamelCaseResponseSchema } from "@/app/(home)/example/users-camel-case/data-table/schema/user-schema";

const API_BASE_URL = "/api";

/**
 * Parameters for fetching users with camelCase formatting
 */
interface FetchParams {
  /** Search term for filtering users */
  search?: string;
  /** Start date for date range filtering (YYYY-MM-DD) */
  fromDate?: string;
  /** End date for date range filtering (YYYY-MM-DD) */
  toDate?: string;
  /** Field to sort by (camelCase format: createdAt, totalExpenses, etc.) */
  sortBy?: string;
  /** Sort direction: 'asc' or 'desc' */
  sortOrder?: string;
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  limit?: number;
}

/**
 * Fetch users with expenses using camelCase API
 */
export async function fetchUsersCamelCase(fetchOptions: FetchParams = {}) {
  const {
    search = "",
    fromDate = "",
    toDate = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = fetchOptions;

  // Process search term - trim and sanitize
  const processedSearch = search ? search.trim().replace(/\s+/g, ' ') : "";

  // Build query parameters with camelCase keys
  const queryParams = new URLSearchParams();
  
  if (processedSearch) queryParams.append('search', processedSearch);
  if (fromDate) queryParams.append('fromDate', fromDate);
  if (toDate) queryParams.append('toDate', toDate);
  queryParams.append('sortBy', sortBy);
  queryParams.append('sortOrder', sortOrder);
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());

  // Fetch data from camelCase API endpoint
  const response = await fetch(`${API_BASE_URL}/users/camel-case?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // The API response is already in camelCase format, validate directly
  return usersCamelCaseResponseSchema.parse(data);
}