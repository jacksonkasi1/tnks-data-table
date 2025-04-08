"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "./schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const getColumns = (
  handleRowDeselection?: (rowId: string) => void
): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          if (value) {
            row.toggleSelected(true);
          } else {
            row.toggleSelected(false);
            // If we have a deselection handler, use it for better cross-page tracking
            if (handleRowDeselection) {
              handleRowDeselection(row.id);
            }
          }
        }}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("email")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("phone")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "age",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Age" />
    ),
    cell: ({ row }) => {
      return <div className="w-[80px] text-center">{row.getValue("age")}</div>;
    },
  },
  {
    accessorKey: "expense_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expenses" />
    ),
    cell: ({ row }) => {
      const count = row.getValue("expense_count") as number;
      return (
        <div className="w-[80px] text-center">
          <Badge variant="outline">{count}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "total_expenses",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Amount" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("total_expenses") as string;
      // Format as currency
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(parseFloat(amount || "0"));
      
      return <div className="w-[120px] text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      // Format date as "MMM d, yyyy" (e.g., "Mar 16, 2025")
      const formattedDate = format(date, "MMM d, yyyy");
      
      return <div className="w-[120px]">{formattedDate}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];