"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { ExportableData } from "@/components/data-table/utils/export-utils";
import { getStatusColor, getCategoryColor } from "../mock-data";
import { withExpandingColumn } from "@/components/data-table/utils/expanding-utils";

const baseColumns: ColumnDef<ExportableData>[] = [
  {
    accessorKey: "name",
    header: "Order / Product",
    cell: ({ row }) => {
      const data = row.original;
      const isOrder = 'orderNumber' in data && 'customerName' in data;
      
      if (isOrder) {
        return (
          <div className="font-medium">
            {String(data.orderNumber || '')} - {String(data.customerName || '')}
          </div>
        );
      } else {
        return (
          <div className="pl-6 text-muted-foreground">
            {String(data.productName || '')}
          </div>
        );
      }
    },
  },
  {
    accessorKey: "status",
    header: "Status / Category",
    cell: ({ row }) => {
      const data = row.original;
      const isOrder = 'orderNumber' in data && 'customerName' in data;
      
      if (isOrder) {
        const status = String(data.status || '');
        return (
          <Badge className={getStatusColor(data.status as any)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      } else {
        const category = String(data.category || '');
        return (
          <div className="pl-6">
            <Badge className={getCategoryColor(category)}>
              {category}
            </Badge>
          </div>
        );
      }
    },
  },
  {
    accessorKey: "date",
    header: "Date / Brand",
    cell: ({ row }) => {
      const data = row.original;
      const isOrder = 'orderNumber' in data && 'customerName' in data;
      
      if (isOrder) {
        return (
          <div>
            {data.orderDate ? new Date(String(data.orderDate)).toLocaleDateString() : ''}
          </div>
        );
      } else {
        return (
          <div className="pl-6 text-muted-foreground">
            {String(data.brand || '')}
          </div>
        );
      }
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const data = row.original;
      const isOrder = 'orderNumber' in data && 'customerName' in data;
      
      if (isOrder) {
        return (
          <div className="font-medium">
            ${Number(data.total || 0).toFixed(2)}
          </div>
        );
      } else {
        return (
          <div className="pl-6 font-mono">
            ${Number(data.price || 0).toFixed(2)} × {Number(data.quantity || 0)}
          </div>
        );
      }
    },
  },
];

export const getColumns = (
  handleRowDeselection: ((rowId: string) => void) | null | undefined
): ColumnDef<ExportableData>[] => {
  // Start with base columns
  let columns = [...baseColumns];
  
  // Add selection column if row selection is enabled
  if (handleRowDeselection !== null) {
    const selectColumn: ColumnDef<ExportableData> = {
      id: "select",
      header: ({ table }) => (
        <div className="pl-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="pl-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    };
    
    // Add selection column to the data columns
    columns = [selectColumn, ...columns];
  }
  
  // The expanding column will be added first by the DataTable component
  // Don't add it here to avoid duplication issues
  return columns;
};
