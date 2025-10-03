// ** import types
import type { ColumnDef } from "@tanstack/react-table";
import type { Booking } from "../schema";

export const parentColumns: ColumnDef<Booking>[] = [
  {
    accessorKey: "booking_id",
    header: "Booking ID",
    size: 120,
  },
  {
    accessorKey: "customer_name",
    header: "Customer",
    size: 160,
  },
  {
    accessorKey: "customer_email",
    header: "Email",
    size: 200,
  },
  {
    accessorKey: "pickup_location",
    header: "Pickup",
    size: 180,
  },
  {
    accessorKey: "delivery_location",
    header: "Delivery",
    size: 180,
  },
  {
    accessorKey: "booking_date",
    header: "Booking Date",
    size: 130,
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
  },
  {
    accessorKey: "total_stops",
    header: "Stops",
    size: 80,
  },
  {
    accessorKey: "total_amount",
    header: "Amount",
    size: 100,
    cell: ({ getValue }) => {
      const amount = getValue() as string;
      return `$${parseFloat(amount).toFixed(2)}`;
    },
  },
  {
    accessorKey: "driver_name",
    header: "Driver",
    size: 140,
    cell: ({ getValue }) => {
      const driver = getValue() as string | null;
      return driver || "—";
    },
  },
];
