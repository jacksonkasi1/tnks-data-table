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
import { Booking, BookingStop } from "../schema";

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

  // Add parent columns (headers already defined)
  columns.push(...parentColumns);

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

// Create complete subrow columns with expand, checkbox, and actions
export const getSubRowColumns = (
  handleRowDeselection: ((rowId: string) => void) | null | undefined
): ColumnDef<BookingStop>[] => {
  const columns: ColumnDef<BookingStop>[] = [];

  // Add expand column for subrows (same as parent)
  columns.push(createExpandColumn<BookingStop>({ hideWhenSingle: false }));

  // Add select column if handleRowDeselection is provided
  if (handleRowDeselection !== null) {
    columns.push(createSubRowSelectColumn<BookingStop>({ handleRowDeselection }));
  }

  // Add subrow columns (headers, sorting, and resizing already configured)
  columns.push(...subrowColumns);

  // Add actions column at the end
  columns.push({
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row, table }) => <DataTableRowActions row={row} table={table} />,
    size: 100,
    enableResizing: true,
  });

  return columns;
};
