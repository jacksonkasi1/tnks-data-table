"use client";

// ** import types
import type { Row, Table } from "@tanstack/react-table";

// ** import core packages
import * as React from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

// ** import components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteOrderPopup } from "./actions/delete-order-popup";

// ** import schema
import { Order } from "../schema";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  table: Table<TData>;
}

export function DataTableRowActions<TData>({
  row,
  table,
}: DataTableRowActionsProps<TData>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const order = row.original as Order;

  // Check if this is a subrow (has parent) or parent row
  const isSubrow = row.depth > 0;

  // For subrows, use the item_id if it exists, otherwise use id
  // For parent rows, always use id (which is the order id)
  const deleteId = isSubrow && order.item_id ? order.item_id : order.id;

  const handleEdit = () => {
    console.log(isSubrow ? "Edit order item:" : "Edit order:", order);
  };

  const handleViewDetails = () => {
    console.log(
      isSubrow ? "View item details:" : "View order details:",
      order
    );
  };

  // Function to reset all selections
  const resetSelection = () => {
    table.resetRowSelection();
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewDetails}>
            View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
            {isSubrow ? "Delete Item" : "Delete Order"}
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteOrderPopup
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        orderId={deleteId}
        orderReference={order.order_id}
        isSubrow={isSubrow}
        resetSelection={resetSelection}
      />
    </>
  );
}
