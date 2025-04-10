"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

// ** Import 3rd Party Libs
import { toast } from "sonner";

// ** Import UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ** Import API
import { deleteUser } from "@/api/user/delete-user";

interface BulkDeletePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUsers: { id: number; name: string }[];
  resetSelection: () => void;
}

export function BulkDeletePopup({
  open,
  onOpenChange,
  selectedUsers,
  resetSelection,
}: BulkDeletePopupProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      
      // Delete users sequentially
      for (const user of selectedUsers) {
        const response = await deleteUser(user.id);
        if (!response.success) {
          throw new Error(`Failed to delete user ${user.name}`);
        }
      }

      toast.success(
        selectedUsers.length === 1
          ? "User deleted successfully"
          : `${selectedUsers.length} users deleted successfully`
      );
      
      onOpenChange(false);
      resetSelection();
      router.refresh();
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete users");
    } finally {
      setIsLoading(false);
    }
  };

  const getDialogTitle = () => {
    if (selectedUsers.length === 1) {
      return "Delete User";
    }
    return "Delete Users";
  };

  const getDialogDescription = () => {
    if (selectedUsers.length === 1) {
      return `Are you sure you want to delete ${selectedUsers[0].name}? This action cannot be undone.`;
    }
    return `Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 