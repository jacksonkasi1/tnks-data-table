import { ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpandingColumnProps {
  isExpanded: boolean;
  canExpand: boolean;
  depth: number;
  onToggle: () => void;
}

export function ExpandingColumn({ 
  isExpanded, 
  canExpand, 
  depth, 
  onToggle 
}: ExpandingColumnProps) {
  return (
    <div 
      className="flex items-center"
      style={{ 
        paddingLeft: `${depth * 20}px` // 20px indentation per level
      }}
    >
      {canExpand ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted"
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
        <div className="w-6 h-6" />
      )}
    </div>
  );
}