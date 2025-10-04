"use client";

// ** import types
import { ColumnDef } from "@tanstack/react-table";

// ** import components
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import {
  createExpandColumn,
  createSubRowSelectColumn,
} from "@/components/data-table/subrow-columns";

// ** import schema
import { Ticket } from "../schema";

// ** import columns
import { ticketColumns } from "./ticket-columns";

// ** import custom component
import { CommentComponent } from "./comment-component";

// ** import row actions
import { DataTableRowActions } from "./row-actions";

export const getColumns = (
  handleRowDeselection: ((rowId: string) => void) | null | undefined
): ColumnDef<Ticket>[] => {
  const columns: ColumnDef<Ticket>[] = [];

  // Add expand column
  columns.push(createExpandColumn<Ticket>({ hideWhenSingle: false }));

  // Add select column if handleRowDeselection is provided
  if (handleRowDeselection !== null) {
    columns.push(createSubRowSelectColumn<Ticket>({ handleRowDeselection }));
  }

  // Add ticket columns with proper headers
  const ticketColumnsWithHeaders = ticketColumns.map((col) => {
    if (typeof col.header === "string") {
      const title = col.header;
      return {
        ...col,
        header: ({ column }: { column: any }) => (
          <DataTableColumnHeader column={column} title={title} />
        ),
      } as ColumnDef<Ticket>;
    }
    return col;
  });

  columns.push(...ticketColumnsWithHeaders);

  // Add actions column at the end
  columns.push({
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row, table }) => <DataTableRowActions row={row} table={table} />,
    size: 100,
  });

  return columns;
};

// Export comment component for custom-component mode
export { CommentComponent };
