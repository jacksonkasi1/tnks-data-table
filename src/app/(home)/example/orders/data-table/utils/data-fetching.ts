import { useQuery, keepPreviousData } from "@tanstack/react-query";

// ** import api
import { fetchOrdersGrouped } from "@/api/order/fetch-orders-grouped";

/**
 * Hook to fetch orders with current filters and pagination
 */
export function useOrdersData(
  page: number,
  pageSize: number,
  search: string,
  dateRange: { from_date: string; to_date: string },
  sortBy: string,
  sortOrder: string
) {
  return useQuery({
    queryKey: [
      "orders",
      page,
      pageSize,
      search,
      dateRange,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      fetchOrdersGrouped({
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
useOrdersData.isQueryHook = true;
