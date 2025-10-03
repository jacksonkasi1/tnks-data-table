// ** import types
import type { ColumnDef } from "@tanstack/react-table";
import type { BookingStop } from "../schema";

export const subrowColumns: ColumnDef<BookingStop>[] = [
  {
    accessorKey: "stop_number",
    header: "Stop #",
    size: 80,
  },
  {
    accessorKey: "stop_type",
    header: "Type",
    size: 100,
  },
  {
    accessorKey: "location_name",
    header: "Location",
    size: 180,
  },
  {
    accessorKey: "location_address",
    header: "Address",
    size: 200,
  },
  {
    accessorKey: "location_city",
    header: "City",
    size: 130,
    cell: ({ getValue }) => {
      const city = getValue() as string | null;
      return city || "—";
    },
  },
  {
    accessorKey: "contact_name",
    header: "Contact",
    size: 140,
    cell: ({ getValue }) => {
      const contact = getValue() as string | null;
      return contact || "—";
    },
  },
  {
    accessorKey: "scheduled_time",
    header: "Scheduled",
    size: 150,
    cell: ({ getValue }) => {
      const time = getValue() as string | null;
      if (!time) return "—";
      return new Date(time).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
  },
];
