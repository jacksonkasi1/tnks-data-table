"use client";

// ** import core packages
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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

// ** import api
import { deleteOrder } from "@/api/order/delete-order";
import { deleteOrderItem } from "@/api/order/delete-order-item";

interface DeleteOrderPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  orderReference: string;
  isSubrow?: boolean;
  resetSelection?: () => void;
}

export function DeleteOrderPopup({
  open,
  onOpenChange,
  orderId,
  orderReference,
  isSubrow = false,
  resetSelection,
}: DeleteOrderPopupProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      // Use different API based on whether it's a subrow or parent row
      const response = isSubrow
        ? await deleteOrderItem(orderId)
        : await deleteOrder(orderId);

      if (response.success) {
        toast.success(
          isSubrow
            ? "Order item deleted successfully"
            : "Order and all items deleted successfully"
        );
        onOpenChange(false);

        if (resetSelection) {
          resetSelection();
        }

        router.refresh();
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
      } else {
        toast.error(
          response.error ||
            `Failed to delete ${isSubrow ? "order item" : "order"}`
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to delete ${isSubrow ? "order item" : "order"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isSubrow ? "Delete Order Item" : "Delete Order"}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete order{" "}
            <strong>{orderReference}</strong>?
            {!isSubrow && (
              <span className="block mt-2 text-destructive">
                This will delete the entire order and all its items.
              </span>
            )}
            <span className="block mt-1">This action cannot be undone.</span>
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
