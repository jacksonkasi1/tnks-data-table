"use client";

import * as React from "react";

// ** import components
import { TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// ** import actions
import { AddOrderPopup } from "./actions/add-order-popup";
import { BulkDeletePopup } from "./actions/bulk-delete-popup";

interface ToolbarOptionsProps {
  selectedOrders: { id: number; order_id: string }[];
  allSelectedIds?: (string | number)[];
  totalSelectedCount: number;
  resetSelection: () => void;
}

export const ToolbarOptions = ({
  selectedOrders,
  allSelectedIds = [],
  totalSelectedCount,
  resetSelection,
}: ToolbarOptionsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const selectionCount = totalSelectedCount || selectedOrders.length;

  const selectedIds =
    allSelectedIds.length > 0
      ? allSelectedIds
      : selectedOrders.map((order) => order.id);

  return (
    <div className="flex items-center gap-2">
      <AddOrderPopup />

      {selectionCount > 0 && (
        <>
          <Button
            variant="outline"
            size="default"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
            Delete ({selectionCount})
          </Button>

          <BulkDeletePopup
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            selectedOrders={selectedOrders}
            allSelectedIds={selectedIds}
            totalSelectedCount={selectionCount}
            resetSelection={resetSelection}
          />
        </>
      )}
    </div>
  );
};
