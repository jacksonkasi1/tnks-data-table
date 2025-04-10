import { useQuery, keepPreviousData } from "@tanstack/react-query";

// ** Import API
import { fetchUsers } from "@/api/user/fetch-users";

// ** Import Utils
import { preprocessSearch } from "@/components/data-table/utils";

/**
 * Hook to fetch users with the current filters and pagination
 */
export function useUsersData(
  page: number,
  pageSize: number,
  search: string,
  dateRange: { from_date: string; to_date: string },
  sortBy: string,
  sortOrder: string
) {
  return useQuery({
    queryKey: ["users", page, pageSize, preprocessSearch(search), dateRange, sortBy, sortOrder],
    queryFn: () => fetchUsers({
      page,
      limit: pageSize,
      search: preprocessSearch(search),
      from_date: dateRange.from_date,
      to_date: dateRange.to_date,
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
    placeholderData: keepPreviousData
  });
}