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

/**
 * Hook to manage selection of users across multiple pages
 */
export function useUserSelection(data: { data: User[] } | undefined) {
  // Store persistent row selection across pages
  const [selectedUserIds, setSelectedUserIds] = useState<Record<number, boolean>>({});
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  
  // Calculate how many items are selected across all pages
  const totalSelectedItems = Object.keys(selectedUserIds).length;

  // Query client for data fetching
  const queryClient = useQueryClient();

  // Function to handle individual row deselection
  const handleRowDeselection = useCallback((rowId: string) => {
    if (data?.data) {
      const rowIndex = parseInt(rowId, 10);
      const user = data.data[rowIndex];
      
      if (user) {
        // Remove from selectedUserIds
        const newSelectedUserIds = { ...selectedUserIds };
        delete newSelectedUserIds[user.id];
        setSelectedUserIds(newSelectedUserIds);
        
        // Update rowSelection
        const newRowSelection = { ...rowSelection } as Record<string, boolean>;
        delete newRowSelection[rowId];
        setRowSelection(newRowSelection);
      }
    }
  }, [data?.data, selectedUserIds, rowSelection]);

  // Function to clear all selections
  const clearAllSelections = useCallback(() => {
    setSelectedUserIds({});
    setRowSelection({});
  }, []);

  // Function to handle row selection changes
  const handleRowSelectionChange = useCallback((updaterOrValue: any) => {
    // Handle both direct values and updater functions
    const newSelection = typeof updaterOrValue === 'function'
      ? updaterOrValue(rowSelection)
      : updaterOrValue;
    
    // Update the UI-level selection state
    setRowSelection(newSelection);
    
    // For every row that's selected, we need to add its user ID to our selectedUserIds object
    const updatedSelectedUserIds = { ...selectedUserIds };
    
    // Process current page selections
    if (data?.data) {
      Object.keys(newSelection).forEach(rowId => {
        const rowIndex = parseInt(rowId, 10);
        const user = data.data[rowIndex];
        
        if (user) {
          if (newSelection[rowId]) {
            // Row is selected, add to selectedUserIds
            updatedSelectedUserIds[user.id] = true;
          } else {
            // Row is deselected, remove from selectedUserIds
            delete updatedSelectedUserIds[user.id];
          }
        }
      });
      
      // Find rows that are no longer selected
      data.data.forEach((user, index) => {
        const rowId = String(index);
        
        if (!newSelection[rowId] && selectedUserIds[user.id]) {
          // This row was previously selected but isn't anymore
          delete updatedSelectedUserIds[user.id];
        }
      });
    }
    
    setSelectedUserIds(updatedSelectedUserIds);
  }, [data?.data, selectedUserIds, rowSelection]);

  // Function to get selected users data from all available data
  const getSelectedUsers = useCallback(async (): Promise<User[]> => {
    // If nothing is selected, return empty array
    if (totalSelectedItems === 0 || Object.keys(selectedUserIds).length === 0) {
      return [];
    }
    
    // Get array of selected IDs from the selection object
    const selectedIds = Object.keys(selectedUserIds).map(id => parseInt(id));
    
    // First, get users from the current page that are selected
    const usersInCurrentPage = data?.data.filter(user => selectedUserIds[user.id]) || [];
    const idsInCurrentPage = usersInCurrentPage.map(user => user.id);
    
    // Find which IDs need to be fetched from the server
    const idsToFetch = selectedIds.filter(id => !idsInCurrentPage.includes(id));
    
    if (idsToFetch.length === 0) {
      // All selected users are on the current page, no need for API call
      return usersInCurrentPage;
    }
    
    try {
      // Show loading state for user
      toast.loading("Preparing export data...", {
        description: `Fetching data for ${idsToFetch.length} selected users...`,
        id: "fetch-selected-users",
        duration: 3000, // Auto dismiss after 3 seconds if not manually dismissed
      });
      
      // Fetch data for all missing users in a single batch
      const fetchedUsers = await fetchUsersByIds(idsToFetch);
      
      // Dismiss loading toast immediately after fetch completes
      toast.dismiss("fetch-selected-users");
      
      // Create a new array to track unique users by ID
      const userMap = new Map<number, User>();
      
      // Add users from current page to the map 
      usersInCurrentPage.forEach(user => {
        userMap.set(user.id, user);
      });
      
      // Add fetched users to the map (this will overwrite any duplicates)
      fetchedUsers.forEach(user => {
        userMap.set(user.id, user);
      });
      
      // Convert map values back to array
      const uniqueUsers = Array.from(userMap.values());
      
      // Verify that all selected IDs are present
      const foundIds = uniqueUsers.map(user => user.id);
      const missingIds = selectedIds.filter(id => !foundIds.includes(id));
      
      // If there are missing IDs, create placeholder data
      if (missingIds.length > 0) {
        console.warn(`Missing user data for IDs: ${missingIds.join(', ')}`);
        const placeholderData = missingIds.map(id => ({
          id,
          name: `User ${id}`,
          email: "(data unavailable)",
          phone: "",
          age: 0,
          created_at: new Date().toISOString(),
          expense_count: 0,
          total_expenses: "0",
        } as User));
        
        // Add placeholders to the results
        uniqueUsers.push(...placeholderData);
      }
      
      // Ensure we only have users that were actually selected
      return uniqueUsers.filter(user => selectedUserIds[user.id]);
    } catch (error) {
      console.error("Error fetching selected users:", error);
      
      // Dismiss loading toast
      toast.dismiss("fetch-selected-users");
      
      toast.error("Error fetching user data", {
        description: "Some user data could not be retrieved. The export may be incomplete.",
      });
      
      // Fall back to returning current page + placeholder data for errors
      const placeholderData = idsToFetch.map(id => ({
        id,
        name: `User ${id}`,
        email: "(data unavailable)",
        phone: "",
        age: 0,
        created_at: new Date().toISOString(),
        expense_count: 0,
        total_expenses: "0",
      } as User));
      
      // Create a map to ensure uniqueness by ID
      const userMap = new Map<number, User>();
      
      // Add users from current page
      usersInCurrentPage.forEach(user => {
        userMap.set(user.id, user);
      });
      
      // Add placeholder data
      placeholderData.forEach(user => {
        userMap.set(user.id, user);
      });
      
      // Convert map values back to array
      return Array.from(userMap.values());
    }
  }, [data?.data, selectedUserIds, totalSelectedItems]);

  // Function to get all available users data for export
  const getAllUsers = useCallback((): User[] => {
    // Return current page data
    return data?.data || [];
  }, [data?.data]);
  
  // Sync rowSelection with selected user IDs when data loads
  useCallback(() => {
    if (data?.data) {
      const newRowSelection: Record<string, boolean> = {};
      
      // Map the current page's rows to their selection state
      data.data.forEach((user, index) => {
        if (selectedUserIds[user.id]) {
          newRowSelection[index] = true;
        }
      });
      
      setRowSelection(newRowSelection);
    }
  }, [data?.data, selectedUserIds]);

  return {
    selectedUserIds,
    setSelectedUserIds,
    rowSelection,
    setRowSelection,
    totalSelectedItems,
    handleRowDeselection,
    clearAllSelections,
    handleRowSelectionChange,
    getSelectedUsers,
    getAllUsers
  };
} 