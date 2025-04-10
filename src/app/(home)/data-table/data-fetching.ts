import { useQueryClient, useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { toast } from "sonner";

import { fetchUsers, fetchUsersByIds } from "@/api/user/get-users";
import { User } from "./schema";
import { preprocessSearch } from "@/components/data-table/utils/search";

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