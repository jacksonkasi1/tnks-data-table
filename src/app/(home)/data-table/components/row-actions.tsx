"use client";

import * as React from "react";

// ** Import 3rd Party Libs
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";

// ** Import UI Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ** Import Schema
import { userSchema } from "../schema";

// ** Import Actions
import { DeleteUserPopup } from "./actions/delete-user-popup";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  table: any; // Table instance
}

export function DataTableRowActions<TData>({
  row,
  table,
}: DataTableRowActionsProps<TData>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const user = userSchema.parse(row.original);

  const handleEdit = () => {
    console.log(user);
  };

  // Function to reset all selections
  const resetSelection = () => {
    table.resetRowSelection();
  };

  return (
    <>
      <DropdownMenu>
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
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteUserPopup
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        userId={user.id}
        userName={user.name}
        resetSelection={resetSelection}
      />
    </>
  );
}
