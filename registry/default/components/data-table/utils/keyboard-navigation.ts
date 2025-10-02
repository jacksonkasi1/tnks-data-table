import type { Table } from "@tanstack/react-table";
import type { KeyboardEvent } from "react";

/**
 * Creates a keyboard navigation handler for data tables
 * 
 * Supports:
 * - Space to toggle selection
 * - Enter to activate/view a row
 */
export function createKeyboardNavigationHandler<TData>(
  table: Table<TData>,
  onRowActivate?: (row: TData, rowIndex: number) => void
) {
  return (e: KeyboardEvent) => {
    // If the key is Space or Enter and we're not in an input/button, handle row selection/activation
    if ((e.key === " " || e.key === "Enter") && 
        !(e.target as HTMLElement).matches('input, button, [role="button"], [contenteditable="true"]')) {
      // Prevent default behavior
      e.preventDefault();
      
      // Find the focused row or cell
      const focusedElement = document.activeElement;
      if (focusedElement && (
          focusedElement.getAttribute('role') === 'row' || 
          focusedElement.getAttribute('role') === 'gridcell'
      )) {
        // Find the closest row
        const rowElement = focusedElement.getAttribute('role') === 'row' 
          ? focusedElement 
          : focusedElement.closest('[role="row"]');
          
        if (rowElement) {
          // Get the row index from the data-row-index attribute or the row id
          const rowId = rowElement.getAttribute('data-row-index') || rowElement.id;
          if (rowId) {
            // Find the row by index and toggle its selection
            const rowIndex = Number.parseInt(rowId.replace(/^row-/, ''), 10);
            const row = table.getRowModel().rows[rowIndex];
            if (row) {
              if (e.key === " ") {
                // Space toggles selection
                row.toggleSelected();
              } else if (e.key === "Enter" && onRowActivate) {
                // Enter activates the row
                onRowActivate(row.original, rowIndex);
              }
            }
          }
        }
      }
    }
  };
} 