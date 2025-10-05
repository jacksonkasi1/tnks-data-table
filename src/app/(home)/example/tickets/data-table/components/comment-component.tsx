// ** import types
import type { Row } from "@tanstack/react-table";
import type { Ticket, TicketComment } from "../schema";

// ** import components
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/table/status-badge";

// ** import utils
import { formatDateTime } from "@/lib/table-utils";

interface CommentComponentProps {
  row: Row<Ticket>;
  data: Ticket;
}

export function CommentComponent({ data }: CommentComponentProps) {
  // Cast to TicketComment for subrow data
  const comment = data as unknown as TicketComment;
  const role = comment.author_role || "customer";

  return (
    <div className="flex gap-4 py-3 px-4 border-l-2 border-muted">
      <div className="flex-shrink-0 w-12 text-center">
        <div className="text-sm font-semibold text-muted-foreground">
          #{comment.comment_number}
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{comment.author_name}</span>
          <RoleBadge role={role} className="text-xs" />
          {comment.is_internal === 1 && (
            <Badge variant="outline" className="text-xs">
              Internal
            </Badge>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {formatDateTime(comment.created_at)}
          </span>
        </div>
        <div className="text-sm">{comment.comment_text}</div>
      </div>
    </div>
  );
}
