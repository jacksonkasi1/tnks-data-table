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

// ** import schema
import { Booking } from "../schema";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  table: Table<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const booking = row.original as Booking;

  // Check if this is a subrow (has parent) or parent row
  const isSubrow = row.depth > 0;

  const handleEdit = () => {
    console.log(isSubrow ? "Edit booking stop:" : "Edit booking:", booking);
  };

  const handleViewDetails = () => {
    console.log(
      isSubrow ? "View stop details:" : "View booking details:",
      booking
    );
  };

  const handleDelete = () => {
    console.log(isSubrow ? "Delete stop:" : "Delete booking:", booking);
  };

  return (
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
        <DropdownMenuItem onClick={handleDelete}>
          {isSubrow ? "Delete Stop" : "Delete Booking"}
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
