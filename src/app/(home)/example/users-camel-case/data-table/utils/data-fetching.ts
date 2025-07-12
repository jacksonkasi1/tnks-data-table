import { useQuery, keepPreviousData } from "@tanstack/react-query";

// ** Import API
import { fetchUsersCamelCase } from "@/api/user/fetch-users-camel-case";

// ** Import Utils
import { preprocessSearch } from "@/components/data-table/utils";
import { CaseFormatConfig, DEFAULT_CASE_CONFIG } from "@/components/data-table/utils/case-utils";

/**
 * Hook to fetch users with camelCase format
 */
export function useUsersCamelCaseData(
  page: number,
  pageSize: number,
  search: string,
  dateRange: { from_date: string; to_date: string },
  sortBy: string,
  sortOrder: string,
  caseConfig: CaseFormatConfig = DEFAULT_CASE_CONFIG
) {
  return useQuery({
    queryKey: [
      "users-camel-case",
      page,
      pageSize,
      preprocessSearch(search),
      dateRange,
      sortBy,
      sortOrder,
      caseConfig,
    ],
    queryFn: () =>
      fetchUsersCamelCase({
        page,
        limit: pageSize,
        search: preprocessSearch(search),
        fromDate: dateRange.from_date,
        toDate: dateRange.to_date,
        sortBy: sortBy,
        sortOrder: sortOrder,
      }),
    placeholderData: keepPreviousData,
  });
}

// Add a property to the function so we can use it with the DataTable component
useUsersCamelCaseData.isQueryHook = true;