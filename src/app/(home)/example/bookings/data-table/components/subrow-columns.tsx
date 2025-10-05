// ** import types
import type { ColumnDef } from "@tanstack/react-table";
import type { BookingStop } from "../schema";

// ** import components
import { DataTableColumnHeader } from "@/components/data-table/column-header";

// ** import utils
import { formatDateTime } from "@/lib/table-utils";

export const subrowColumns: ColumnDef<BookingStop>[] = [
  {
    accessorKey: "stop_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stop #" />
    ),
    meta: { title: "Stop #" },
    size: 80,
    enableSorting: true,
    enableResizing: true,
  },
  {
    accessorKey: "stop_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    meta: { title: "Type" },
    size: 100,
    enableSorting: true,
    enableResizing: true,
  },
  {
    accessorKey: "location_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    meta: { title: "Location" },
    size: 180,
    enableSorting: true,
    enableResizing: true,
  },
  {
    accessorKey: "location_address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" />
    ),
    meta: { title: "Address" },
    size: 200,
    enableSorting: true,
    enableResizing: true,
  },
  {
    accessorKey: "location_city",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    meta: { title: "City" },
    size: 130,
    cell: ({ getValue }) => {
      const city = getValue() as string | null;
      return city || "—";
    },
    enableSorting: true,
    enableResizing: true,
  },
  {
    accessorKey: "contact_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact" />
    ),
    meta: { title: "Contact" },
    size: 140,
    cell: ({ getValue }) => {
      const contact = getValue() as string | null;
      return contact || "—";
    },
    enableSorting: true,
    enableResizing: true,
  },
  {
    accessorKey: "scheduled_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Scheduled" />
    ),
    meta: { title: "Scheduled" },
    size: 150,
    cell: ({ getValue }) => {
      const time = getValue() as string | null;
      if (!time) return "—";
      return formatDateTime(time);
    },
    enableSorting: true,
    enableResizing: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    meta: { title: "Status" },
    size: 120,
    enableSorting: true,
    enableResizing: true,
  },
];
