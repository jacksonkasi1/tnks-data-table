// ** import types
import type { ColumnDef } from "@tanstack/react-table";

// ** import components
import { DataTableColumnHeader } from "@/components/data-table/column-header";

/**
 * Maps column definitions to include DataTableColumnHeader for sortable headers
 * Reduces code duplication between parent and subrow column definitions
 */
export function mapColumnsWithHeaders<TData>(
  columns: ColumnDef<TData>[]
): ColumnDef<TData>[] {
  return columns.map((col) => {
    if (typeof col.header === "string") {
      const title = col.header;
      return {
        ...col,
        meta: {
          ...(col.meta || {}),
          title, // Store original title for subrow headers
        },
        header: ({ column }: { column: any }) => (
          <DataTableColumnHeader column={column} title={title} />
        ),
      } as ColumnDef<TData>;
    }
    return col;
  });
}
