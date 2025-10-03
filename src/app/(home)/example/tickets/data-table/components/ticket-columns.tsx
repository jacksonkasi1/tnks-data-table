// ** import types
import type { ColumnDef } from "@tanstack/react-table";
import type { Ticket } from "../schema";

// ** import components
import { Badge } from "@/components/ui/badge";

const priorityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

const statusColors = {
  open: "bg-blue-500",
  "in-progress": "bg-purple-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500",
};

export const ticketColumns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "ticket_id",
    header: "Ticket ID",
    size: 120,
  },
  {
    accessorKey: "title",
    header: "Title",
    size: 280,
  },
  {
    accessorKey: "customer_name",
    header: "Customer",
    size: 160,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    size: 100,
    cell: ({ getValue }) => {
      const priority = (getValue() as string).toLowerCase();
      const color = priorityColors[priority as keyof typeof priorityColors] || "bg-gray-500";
      return (
        <Badge className={`${color} text-white`}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    cell: ({ getValue }) => {
      const status = (getValue() as string).toLowerCase();
      const color = statusColors[status as keyof typeof statusColors] || "bg-gray-500";
      return (
        <Badge className={`${color} text-white`}>
          {status.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    size: 120,
    cell: ({ getValue }) => {
      const category = getValue() as string | null;
      return category ? category.charAt(0).toUpperCase() + category.slice(1) : "—";
    },
  },
  {
    accessorKey: "assigned_to",
    header: "Assigned To",
    size: 150,
    cell: ({ getValue }) => {
      const assigned = getValue() as string | null;
      return assigned || "—";
    },
  },
  {
    accessorKey: "total_comments",
    header: "Comments",
    size: 100,
  },
  {
    accessorKey: "created_at",
    header: "Created",
    size: 140,
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
  },
];
