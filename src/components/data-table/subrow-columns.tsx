"use client";

// ** import types
import type { Row, Table } from "@tanstack/react-table";

// ** import components
import { Checkbox } from "@/components/ui/checkbox";
import { ExpandIcon } from "./expand-icon";

/**
 * Create an expand column for subrow tables
 * This column shows the expand/collapse icon for rows with subrows
 */
export function createExpandColumn<TData>(config?: {
  hideWhenSingle?: boolean;
  size?: number;
}) {
  return {
    id: "expand",
    size: config?.size ?? 55,
    header: () => null,
    cell: ({ row }: { row: Row<TData> }) => (
      <ExpandIcon row={row} hideWhenSingle={config?.hideWhenSingle ?? false} />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

/**
 * Create a select column for subrow tables with parent-child selection logic
 * This column handles:
 * - Independent parent/child selection
 * - Indeterminate state for partially selected groups
 * - Automatic parent selection when all children selected
 */
export function createSubRowSelectColumn<TData>(config?: {
  handleRowDeselection?: (rowId: string) => void;
  size?: number;
}) {
  return {
    id: "select",
    size: config?.size ?? 50,
    header: ({ table }: { table: Table<TData> }) => (
      <SubRowSelectHeader table={table} />
    ),
    cell: ({ row }: { row: Row<TData> }) => (
      <SubRowSelectCell
        row={row}
        handleRowDeselection={config?.handleRowDeselection}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

/**
 * Header checkbox for subrow tables
 * Handles selection of all parent rows and their children
 */
function SubRowSelectHeader<TData>({ table }: { table: Table<TData> }) {
  const allRows = table.getRowModel().rows;
  const flatRows = table.getRowModel().flatRows;

  const selectedRows = flatRows.filter((row) => row.getIsSelected());
  const allSelected =
    flatRows.length > 0 && selectedRows.length === flatRows.length;
  const someSelected =
    selectedRows.length > 0 && selectedRows.length < flatRows.length;

  return (
    <div className="pl-2 truncate">
      <Checkbox
        checked={allSelected || (someSelected && "indeterminate")}
        onCheckedChange={(value) => {
          const parentRows = allRows.filter((row) => row.depth === 0);
          if (value) {
            parentRows.forEach((row) => {
              row.toggleSelected(true);
              if (row.subRows && row.subRows.length > 0) {
                row.subRows.forEach((subRow) => subRow.toggleSelected(true));
              }
            });
          } else {
            flatRows.forEach((row) => row.toggleSelected(false));
          }
        }}
        aria-label="Select all"
        className="translate-y-0.5 cursor-pointer"
      />
    </div>
  );
}

/**
 * Cell checkbox for subrow tables
 * Handles individual row selection with parent-child synchronization
 */
function SubRowSelectCell<TData>({
  row,
  handleRowDeselection,
}: {
  row: Row<TData>;
  handleRowDeselection?: (rowId: string) => void;
}) {
  const isParent = row.depth === 0;
  const isSelected = row.getIsSelected();

  let isSomeSelected = false;
  let allSubrowsSelected = false;
  const hasSubrows = isParent && row.subRows && row.subRows.length > 0;

  if (hasSubrows) {
    const selectedSubrows = row.subRows.filter((subRow) =>
      subRow.getIsSelected()
    );
    allSubrowsSelected = selectedSubrows.length === row.subRows.length;
    isSomeSelected =
      selectedSubrows.length > 0 &&
      selectedSubrows.length < row.subRows.length;
  }

  const checkboxState = isParent
    ? hasSubrows
      ? allSubrowsSelected && isSelected
        ? true
        : isSomeSelected
          ? "indeterminate"
          : false
      : isSelected
    : isSelected;

  return (
    <div className="truncate">
      <Checkbox
        checked={checkboxState}
        onCheckedChange={(value) => {
          if (isParent) {
            row.toggleSelected(!!value);
            if (row.subRows && row.subRows.length > 0) {
              row.subRows.forEach((subRow) => {
                subRow.toggleSelected(!!value);
              });
            }
          } else {
            row.toggleSelected(!!value);

            if (row.getParentRow()) {
              const parent = row.getParentRow()!;
              const allSiblingsSelected = parent.subRows?.every((subRow) =>
                subRow.getIsSelected()
              );
              const noSiblingsSelected = parent.subRows?.every(
                (subRow) => !subRow.getIsSelected()
              );

              if (value && allSiblingsSelected) {
                parent.toggleSelected(true);
              } else if (!value && noSiblingsSelected) {
                parent.toggleSelected(false);
              }
            }
          }

          if (!value && handleRowDeselection) {
            handleRowDeselection(row.id);
          }
        }}
        aria-label="Select row"
        className="translate-y-0.5 cursor-pointer"
      />
    </div>
  );
}
