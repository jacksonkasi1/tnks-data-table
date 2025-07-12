"use client";

import { Button } from "@/components/ui/button";

interface ToolbarOptionsProps {
  selectedUsers: Array<{ id: number; name: string }>;
  allSelectedUserIds: number[];
  totalSelectedCount: number;
  resetSelection: () => void;
}

export function ToolbarOptions({
  selectedUsers,
  allSelectedUserIds,
  totalSelectedCount,
  resetSelection,
}: ToolbarOptionsProps) {
  if (totalSelectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {totalSelectedCount} selected
      </span>
      <Button 
        onClick={resetSelection}
        className="text-sm"
      >
        Clear selection
      </Button>
    </div>
  );
}