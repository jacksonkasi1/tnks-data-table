// ** import types
import type { ColumnDef } from "@tanstack/react-table";
import type { Booking } from "../schema";

// ** import components
import { DataTableColumnHeader } from "@/components/data-table/column-header";

// ** import utils
import { formatShortDate } from "@/lib/table-utils";

export const parentColumns: ColumnDef<Booking>[] = [
  {
    accessorKey: "booking_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Booking ID" />
    ),
    size: 120,
  },
  {
    accessorKey: "customer_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    size: 160,
  },
  {
    accessorKey: "customer_email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    size: 200,
  },
  {
    accessorKey: "pickup_location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pickup" />
    ),
    size: 180,
  },
  {
    accessorKey: "delivery_location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Delivery" />
    ),
    size: 180,
  },
  {
    accessorKey: "booking_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Booking Date" />
    ),
    size: 130,
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return formatShortDate(date);
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    size: 120,
  },
  {
    accessorKey: "total_stops",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stops" />
    ),
    size: 80,
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    size: 100,
    cell: ({ getValue }) => {
      const amount = getValue() as string;
      return `$${parseFloat(amount).toFixed(2)}`;
    },
  },
  {
    accessorKey: "driver_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Driver" />
    ),
    size: 140,
    cell: ({ getValue }) => {
      const driver = getValue() as string | null;
      return driver || "—";
    },
  },
];
