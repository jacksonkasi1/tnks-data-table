"use client";

// ** import core packages
import * as React from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";

// ** import api
import { addOrder } from "@/api/order/add-order";

export function AddOrderPopup() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const queryClient = useQueryClient();

  const handleAdd = async () => {
    try {
      setIsLoading(true);
      const response = await addOrder();

      if (response.success) {
        toast.success("Order created successfully with random data");
        setOpen(false);
        router.refresh();
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
      } else {
        toast.error(response.error || "Failed to add order");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add order"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="default">
          <PlusCircle className="mr-2 size-4" aria-hidden="true" />
          Add Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Order</DialogTitle>
          <DialogDescription>
            Create a new order with randomly generated data including customer
            details and products.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            A random order will be created with:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
            <li>Random customer information</li>
            <li>1-5 random products</li>
            <li>Calculated totals and pricing</li>
            <li>Random order status</li>
          </ul>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleAdd} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
