import { ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpandingColumnProps {
  isExpanded: boolean;
  canExpand: boolean;
  depth: number;
  onToggle: () => void;
  indentPx?: number;
}

export function ExpandingColumn({ 
  isExpanded, 
  canExpand, 
  depth, 
  onToggle,
  indentPx = 20
}: ExpandingColumnProps) {
  return (
    <div 
      className="flex items-center justify-center"
      style={{ 
        paddingLeft: `${depth * indentPx}px` // Configurable indentation per level
      }}
    >
      {canExpand ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click when clicking expand button
            onToggle();
          }}
          aria-label={isExpanded ? "Collapse row" : "Expand row"}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
      ) : (
        // Maintain consistent spacing even for non-expandable rows
        <div className="w-6 h-6 flex-shrink-0" />
      )}
    </div>
  );
}