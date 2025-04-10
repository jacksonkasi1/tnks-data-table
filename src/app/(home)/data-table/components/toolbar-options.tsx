"use client";

import * as React from "react";

// ** Import Icons
import { TrashIcon } from "lucide-react";

// ** Import UI Components
import { Button } from "@/components/ui/button";

// ** Import Actions
import { AddUserPopup } from "./actions/add-user-popup";
import { BulkDeletePopup } from "./actions/bulk-delete-popup";

interface ToolbarOptionsProps {
  selectedUsers: { id: number; name: string }[];
  resetSelection: () => void;
}

export const ToolbarOptions = ({
  selectedUsers,
  resetSelection,
}: ToolbarOptionsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-2">
      <AddUserPopup />
      
      {selectedUsers.length > 0 && (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDeleteDialogOpen(true)}
          >
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
            Delete ({selectedUsers.length})
          </Button>

          <BulkDeletePopup
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            selectedUsers={selectedUsers}
            resetSelection={resetSelection}
          />
        </>
      )}
    </div>
  );
};
