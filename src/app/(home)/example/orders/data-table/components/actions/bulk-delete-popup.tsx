"use client";

// ** import core packages
import * as React from "react";

// ** import components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BulkDeletePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrders: { id: number; order_id: string }[];
  allSelectedIds?: (string | number)[];
  totalSelectedCount?: number;
  resetSelection: () => void;
}

export function BulkDeletePopup({
  open,
  onOpenChange,
  selectedOrders,
  allSelectedIds,
  totalSelectedCount,
  resetSelection,
}: BulkDeletePopupProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const idsToDelete =
    allSelectedIds || selectedOrders.map((order) => order.id);

  const itemCount = totalSelectedCount ?? selectedOrders.length;

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      // TODO: Implement actual bulk delete API call
      console.log("Bulk delete orders:", idsToDelete);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      onOpenChange(false);
      resetSelection();
    } catch (error) {
      console.error("Failed to bulk delete orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDialogTitle = () => {
    return itemCount === 1 ? "Delete Order" : "Delete Orders";
  };

  const getDialogDescription = () => {
    if (itemCount === 1 && selectedOrders.length === 1) {
      return `Are you sure you want to delete order ${selectedOrders[0].order_id}? This action cannot be undone.`;
    }
    return `Are you sure you want to delete ${itemCount} orders? This action cannot be undone.`;
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
