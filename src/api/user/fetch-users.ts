// ** Import Schema
import { usersResponseSchema } from "@/app/(home)/data-table/schema";
import { convertObjectKeys, convertObjectKeysWithMapper, CaseFormatConfig, DEFAULT_CASE_CONFIG } from "@/components/data-table/utils/case-utils";

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
  caseConfig = DEFAULT_CASE_CONFIG,
}: {
  search?: string;
  from_date?: string;
  to_date?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
  caseConfig?: CaseFormatConfig;
}) {
  // Process search term - trim and sanitize
  const processedSearch = search ? search.trim().replace(/\s+/g, ' ') : "";

  // Build query parameters with case conversion
  const rawParams = {
    search: processedSearch || undefined,
    from_date: from_date || undefined,
    to_date: to_date || undefined,
    sort_by,
    sort_order,
    page: page.toString(),
    limit: limit.toString(),
  };

  // Remove undefined values
  const filteredParams = Object.fromEntries(
    Object.entries(rawParams).filter(([_, value]) => value !== undefined)
  );

  // Convert keys based on configuration
  const convertedParams = caseConfig.keyMapper 
    ? convertObjectKeysWithMapper(filteredParams, caseConfig.keyMapper)
    : convertObjectKeys(filteredParams, caseConfig.apiFormat || 'snake_case');

  // Build URLSearchParams
  const params = new URLSearchParams();
  Object.entries(convertedParams).forEach(([key, value]) => {
    params.append(key, String(value));
  });

  // Fetch data
  const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  
  const data = await response.json();
  return usersResponseSchema.parse(data);
} 