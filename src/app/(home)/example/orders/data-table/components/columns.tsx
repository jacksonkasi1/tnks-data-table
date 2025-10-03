"use client";

// ** import types
import { ColumnDef } from "@tanstack/react-table";

// ** import core packages
import { format } from "date-fns";

// ** import components
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ExpandIcon } from "@/components/data-table/expand-icon";

// ** import schema
import { Order } from "../schema";

// ** import row actions
import { DataTableRowActions } from "./row-actions";

export const getColumns = (
  handleRowDeselection: ((rowId: string) => void) | null | undefined
): ColumnDef<Order>[] => {
  // Base columns (without expand and select)
  const baseColumns: ColumnDef<Order>[] = [
    {
      accessorKey: "order_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order ID" />
      ),
      cell: ({ row }) => (
        <div className="font-medium truncate text-left">
          {row.getValue("order_id")}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "customer_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => (
        <div className="truncate text-left">{row.getValue("customer_name")}</div>
      ),
      size: 180,
    },
    {
      accessorKey: "product_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product" />
      ),
      cell: ({ row }) => {
        const productName = row.getValue("product_name") as string | null;
        return (
          <div className="truncate text-left">
            {productName || <span className="text-muted-foreground">-</span>}
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qty" />
      ),
      cell: ({ row }) => {
        const quantity = row.getValue("quantity") as number | null;
        return (
          <div className="text-left">
            {quantity !== null ? quantity : <span className="text-muted-foreground">-</span>}
          </div>
        );
      },
      size: 80,
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => {
        const price = row.getValue("price") as string | null;
        if (!price) return <span className="text-muted-foreground">-</span>;

        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(parseFloat(price));

        return <div className="text-left font-medium">{formatted}</div>;
      },
      size: 100,
    },
    {
      accessorKey: "subtotal",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subtotal" />
      ),
      cell: ({ row }) => {
        const subtotal = row.getValue("subtotal") as string | null;
        if (!subtotal) return <span className="text-muted-foreground">-</span>;

        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(parseFloat(subtotal));

        return <div className="text-left font-medium">{formatted}</div>;
      },
      size: 120,
    },
    {
      accessorKey: "total_items",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Items" />
      ),
      cell: ({ row }) => {
        // Only show for parent rows (depth 0)
        if (row.depth > 0) return null;

        const count = row.getValue("total_items") as number;
        return (
          <Badge variant="outline" className="truncate">
            {count}
          </Badge>
        );
      },
      size: 80,
    },
    {
      accessorKey: "total_amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => {
        // Only show for parent rows (depth 0)
        if (row.depth > 0) return null;

        const amount = row.getValue("total_amount") as string;
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(parseFloat(amount || "0"));

        return <div className="text-left font-medium">{formatted}</div>;
      },
      size: 120,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        // Only show for parent rows (depth 0)
        if (row.depth > 0) return null;

        const status = row.getValue("status") as string;
        const variant =
          status === "delivered"
            ? "default"
            : status === "shipped"
              ? "secondary"
              : status === "processing"
                ? "outline"
                : status === "cancelled"
                  ? "destructive"
                  : "outline";

        return (
          <Badge variant={variant} className="truncate capitalize">
            {status}
          </Badge>
        );
      },
      size: 110,
    },
    {
      accessorKey: "order_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        // Only show for parent rows (depth 0)
        if (row.depth > 0) return null;

        const date = new Date(row.getValue("order_date"));
        const formattedDate = format(date, "MMM d, yyyy");
        return <div className="text-left truncate">{formattedDate}</div>;
      },
      size: 120,
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row, table }) => <DataTableRowActions row={row} table={table} />,
      size: 80,
    },
  ];

  // Build final columns array
  const columns: ColumnDef<Order>[] = [];

  // 1. Add expand icon column first
  columns.push({
    id: "expand",
    size: 55,
    header: () => null,
    cell: ({ row }) => <ExpandIcon row={row} hideWhenSingle={false} />,
    enableSorting: false,
    enableHiding: false,
  });

  // 2. Add select column if row selection is enabled
  if (handleRowDeselection !== null) {
    columns.push({
      id: "select",
      header: ({ table }) => {
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
      },
      cell: ({ row }) => {
        const isParent = row.depth === 0;
        const isSelected = row.getIsSelected();

        let isSomeSelected = false;
        let allSubrowsSelected = false;

        if (isParent && row.subRows && row.subRows.length > 0) {
          const selectedSubrows = row.subRows.filter((subRow) =>
            subRow.getIsSelected()
          );
          allSubrowsSelected = selectedSubrows.length === row.subRows.length;
          isSomeSelected =
            selectedSubrows.length > 0 &&
            selectedSubrows.length < row.subRows.length;
        }

        const checkboxState = isParent
          ? allSubrowsSelected && isSelected
            ? true
            : isSomeSelected
              ? "indeterminate"
              : false
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
      },
      enableSorting: false,
      enableHiding: false,
      size: 50,
    });
  }

  // 3. Add all base columns
  columns.push(...baseColumns);

  return columns;
};
