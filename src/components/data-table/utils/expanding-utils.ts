import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ExpandingColumn } from "../expanding-column";
import type { ExportableData } from "./export-utils";

// Column ID for the expanding column
export const EXPANDING_COLUMN_ID = "__expanding__";

/**
 * Creates an expanding column definition that can be added to table columns
 * This column shows expand/collapse controls for rows with sub-rows
 */
export function createExpandingColumn<TData extends ExportableData>(): ColumnDef<TData, unknown> {
  return {
    id: EXPANDING_COLUMN_ID,
    header: "",
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: false,
    enableResizing: false,
    size: 50,
    minSize: 50,
    maxSize: 50,
    cell: ({ row, table }) => {
      const canExpand = row.getCanExpand();
      const isExpanded = row.getIsExpanded();
      const depth = row.depth;

      return ExpandingColumn({
        isExpanded,
        canExpand,
        depth,
        onToggle: () => row.toggleExpanded(),
      });
    },
  };
}

/**
 * Helper function to automatically inject expanding column when expanding is enabled
 * This should be called when building the column definitions
 * Places expanding column as the FIRST column (before selection column)
 */
export function withExpandingColumn<TData extends ExportableData, TValue = unknown>(
  columns: ColumnDef<TData, TValue>[],
  enableExpanding: boolean
): ColumnDef<TData, TValue>[] {
  if (!enableExpanding) {
    return columns;
  }

  // Check if expanding column already exists
  const hasExpandingColumn = columns.some(col => col.id === EXPANDING_COLUMN_ID);
  
  if (hasExpandingColumn) {
    return columns;
  }

  // Add expanding column as the ABSOLUTE first column (before any other columns including selection)
  return [createExpandingColumn<TData>() as ColumnDef<TData, TValue>, ...columns];
}

/**
 * Helper function to extract row depth for styling purposes
 * Can be used in custom cell renderers to apply indentation
 */
export function getRowDepth<TData>(row: { depth: number }): number {
  return row.depth;
}

/**
 * Helper function to check if a row is a leaf row (has no children)
 */
export function isLeafRow<TData>(row: { subRows: TData[] }): boolean {
  return !row.subRows || row.subRows.length === 0;
}