"use client";

import * as React from "react";

// ** import components
import { TrashIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ** import actions
import { AddOrderPopup } from "./actions/add-order-popup";
import { BulkDeletePopup } from "./actions/bulk-delete-popup";

interface ToolbarOptionsProps {
  selectedOrders: { id: number; order_id: string; item_id?: number }[];
  parentOrders: { id: number; order_id: string }[];
  independentChildItems: { id: number; order_id: string; item_id?: number }[];
  allSelectedIds?: (string | number)[];
  totalSelectedCount: number;
  resetSelection: () => void;
}

type DeleteMode = "orders" | "items" | null;

export const ToolbarOptions = ({
  selectedOrders,
  parentOrders,
  independentChildItems,
  allSelectedIds = [],
  totalSelectedCount,
  resetSelection,
}: ToolbarOptionsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteMode, setDeleteMode] = React.useState<DeleteMode>(null);

  const selectionCount = totalSelectedCount || selectedOrders.length;
  const hasParents = parentOrders.length > 0;
  const hasChildren = independentChildItems.length > 0;

  const selectedIds =
    allSelectedIds.length > 0
      ? allSelectedIds
      : selectedOrders.map((order) => order.id);

  // Smart delete logic:
  // 1. If both parents and children selected → Show dropdown
  // 2. If only parents OR only children → Show normal button
  const showDropdown = hasParents && hasChildren;

  const handleDirectDelete = () => {
    // For single type selection, auto-determine mode
    if (hasParents && !hasChildren) {
      setDeleteMode("orders");
    } else if (hasChildren && !hasParents) {
      setDeleteMode("items");
    }
    setDeleteDialogOpen(true);
  };

  const handleDropdownDelete = (mode: DeleteMode) => {
    setDeleteMode(mode);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="flex items-center gap-2">
      <AddOrderPopup />

      {selectionCount > 0 && (
        <>
          {showDropdown ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="default">
                  <TrashIcon className="mr-2 size-4" aria-hidden="true" />
                  Delete ({selectionCount})
                  <ChevronDown className="ml-2 size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleDropdownDelete("orders")}
                >
                  <TrashIcon className="mr-2 size-4" />
                  Delete Orders ({parentOrders.length})
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDropdownDelete("items")}
                >
                  <TrashIcon className="mr-2 size-4" />
                  Delete Items ({independentChildItems.length})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="default"
              onClick={handleDirectDelete}
            >
              <TrashIcon className="mr-2 size-4" aria-hidden="true" />
              Delete ({selectionCount})
            </Button>
          )}

          <BulkDeletePopup
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            selectedOrders={selectedOrders}
            parentOrders={parentOrders}
            independentChildItems={independentChildItems}
            allSelectedIds={selectedIds}
            totalSelectedCount={selectionCount}
            deleteMode={deleteMode}
            resetSelection={resetSelection}
          />
        </>
      )}
    </div>
  );
};
