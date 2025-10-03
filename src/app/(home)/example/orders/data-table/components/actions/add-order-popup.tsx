"use client";

// ** import core packages
import * as React from "react";
import { PlusCircle } from "lucide-react";

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

export function AddOrderPopup() {
  const [open, setOpen] = React.useState(false);

  const handleAdd = () => {
    console.log("Add order functionality - to be implemented");
    setOpen(false);
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
            Create a new order. This is a placeholder for the add order form.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Form fields will be implemented here based on your order schema.
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleAdd}>
            Add Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
