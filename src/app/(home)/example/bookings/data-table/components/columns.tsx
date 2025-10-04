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
import { Booking } from "../schema";

// ** import columns
import { parentColumns } from "./parent-columns";
import { subrowColumns } from "./subrow-columns";

// ** import row actions
import { DataTableRowActions } from "./row-actions";

export const getColumns = (
  handleRowDeselection: ((rowId: string) => void) | null | undefined
): ColumnDef<Booking>[] => {
  const columns: ColumnDef<Booking>[] = [];

  // Add expand column
  columns.push(createExpandColumn<Booking>({ hideWhenSingle: false }));

  // Add select column if handleRowDeselection is provided
  if (handleRowDeselection !== null) {
    columns.push(createSubRowSelectColumn<Booking>({ handleRowDeselection }));
  }

  // Add parent columns with proper headers
  const parentColumnsWithHeaders = parentColumns.map((col) => {
    if (typeof col.header === "string") {
      const title = col.header;
      return {
        ...col,
        header: ({ column }: { column: any }) => (
          <DataTableColumnHeader column={column} title={title} />
        ),
      } as ColumnDef<Booking>;
    }
    return col;
  });

  columns.push(...parentColumnsWithHeaders);

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

// Export subrow columns for DataTable to use in custom-columns mode
export { subrowColumns };
