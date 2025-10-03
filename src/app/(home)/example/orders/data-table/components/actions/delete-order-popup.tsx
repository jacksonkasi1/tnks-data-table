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

interface DeleteOrderPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  orderReference: string;
  resetSelection?: () => void;
}

export function DeleteOrderPopup({
  open,
  onOpenChange,
  orderId,
  orderReference,
  resetSelection,
}: DeleteOrderPopupProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      // TODO: Implement actual delete API call
      console.log("Delete order:", { orderId, orderReference });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onOpenChange(false);

      if (resetSelection) {
        resetSelection();
      }
    } catch (error) {
      console.error("Failed to delete order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete order <strong>{orderReference}</strong>?
            This action cannot be undone.
          </DialogDescription>
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
