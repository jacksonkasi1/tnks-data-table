import { useQuery, keepPreviousData } from "@tanstack/react-query";

// ** import api
import { fetchBookingsGrouped } from "@/api/booking/fetch-bookings-grouped";

/**
 * Hook to fetch bookings with current filters and pagination
 */
export function useBookingsData(
  page: number,
  pageSize: number,
  search: string,
  dateRange: { from_date: string; to_date: string },
  sortBy: string,
  sortOrder: string
) {
  return useQuery({
    queryKey: [
      "bookings",
      page,
      pageSize,
      search,
      dateRange,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      fetchBookingsGrouped({
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
useBookingsData.isQueryHook = true;
