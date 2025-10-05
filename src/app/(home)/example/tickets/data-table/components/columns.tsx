"use client";

// ** import types
import { ColumnDef } from "@tanstack/react-table";

// ** import components
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import {
  createExpandColumn,
  createSubRowSelectColumn,
} from "@/components/data-table/subrow-columns";
import { PriorityBadge, StatusBadge } from "@/components/table/status-badge";

// ** import utils
import { formatShortDate } from "@/lib/table-utils";

// ** import schema
import { Ticket } from "../schema";

// ** import custom component
import { CommentComponent } from "./comment-component";

// ** import row actions
import { DataTableRowActions } from "./row-actions";

const ticketColumns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "ticket_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ticket ID" />
    ),
    size: 120,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    size: 280,
  },
  {
    accessorKey: "customer_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    size: 160,
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    size: 100,
    cell: ({ getValue }) => {
      const priority = getValue() as string;
      return <PriorityBadge priority={priority} />;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    size: 120,
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return <StatusBadge status={status} />;
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    size: 120,
    cell: ({ getValue }) => {
      const category = getValue() as string | null;
      return category ? category.charAt(0).toUpperCase() + category.slice(1) : "—";
    },
  },
  {
    accessorKey: "assigned_to",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned To" />
    ),
    size: 150,
    cell: ({ getValue }) => {
      const assigned = getValue() as string | null;
      return assigned || "—";
    },
  },
  {
    accessorKey: "total_comments",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Comments" />
    ),
    size: 100,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    size: 140,
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return formatShortDate(date);
    },
  },
];

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

  // Add ticket columns (headers already defined)
  columns.push(...ticketColumns);

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
