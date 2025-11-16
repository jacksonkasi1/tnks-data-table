import { useQuery, keepPreviousData } from "@tanstack/react-query";

// ** import api
import { fetchTicketsGrouped } from "@/api/ticket/fetch-tickets-grouped";

/**
 * Hook to fetch tickets with current filters and pagination
 */
export function useTicketsData(
  page: number,
  pageSize: number,
  search: string,
  dateRange: { from_date: string; to_date: string },
  sortBy: string,
  sortOrder: string
) {
  return useQuery({
    queryKey: [
      "tickets",
      page,
      pageSize,
      search,
      dateRange,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      fetchTicketsGrouped({
        page,
        limit: pageSize,
        search,
        from_date: dateRange.from_date,
        to_date: dateRange.to_date,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    placeholderData: keepPreviousData,
  });
}

// Add property for DataTable component
useTicketsData.isQueryHook = true;
