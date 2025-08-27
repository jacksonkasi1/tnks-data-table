"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { ExportableData } from "@/components/data-table/utils/export-utils";
import { withExpandingColumn } from "@/components/data-table/utils/expanding-utils";

const getBaseColumns = (subRowIndentPx: number = 0): ColumnDef<ExportableData>[] => [
  {
    accessorKey: "name",
    header: "Name / Expense",
    cell: ({ row }) => {
      const data = row.original;
      const isUser = 'email' in data && 'department' in data;
      const depth = row.depth || 0;
      const indentStyle = depth > 0 && subRowIndentPx > 0 ? { paddingLeft: `${depth * subRowIndentPx}px` } : {};
      
      if (isUser) {
        return (
          <div className="font-medium" style={indentStyle}>
            {String(data.name || '')}
          </div>
        );
      } else {
        return (
          <div style={indentStyle}>
            {String(data.expenseName || '')}
          </div>
        );
      }
    },
  },
  {
    accessorKey: "email",
    header: "Email / Category",
    cell: ({ row }) => {
      const data = row.original;
      const isUser = 'email' in data && 'department' in data;
      
      if (isUser) {
        return (
          <div className="text-muted-foreground">
            {String(data.email || '')}
          </div>
        );
      } else {
        return (
          <Badge variant="outline">
            {String(data.category || '')}
          </Badge>
        );
      }
    },
  },
  {
    accessorKey: "department",
    header: "Department / Date",
    cell: ({ row }) => {
      const data = row.original;
      const isUser = 'email' in data && 'department' in data;
      
      if (isUser) {
        return (
          <Badge variant="secondary">
            {String(data.department || '')}
          </Badge>
        );
      } else {
        return (
          <div className="text-sm">
            {data.date ? new Date(String(data.date)).toLocaleDateString() : ''}
          </div>
        );
      }
    },
  },
  {
    accessorKey: "totalExpenses",
    header: "Amount",
    cell: ({ row }) => {
      const data = row.original;
      const isUser = 'email' in data && 'department' in data;
      
      if (isUser) {
        return (
          <div className="font-mono font-semibold">
            ${Number(data.totalExpenses || 0).toFixed(2)}
          </div>
        );
      } else {
        return (
          <div className="font-mono">
            ${Number(data.amount || 0).toFixed(2)}
          </div>
        );
      }
    },
  },
];

export const getColumns = (
  handleRowDeselection: ((rowId: string) => void) | null | undefined,
  subRowIndentPx: number = 0
): ColumnDef<ExportableData>[] => {
  // Start with base columns
  let columns = [...getBaseColumns(subRowIndentPx)];
  
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