// ** import types
import type { Row } from "@tanstack/react-table";
import type { Ticket, TicketComment } from "../schema";

// ** import components
import { Badge } from "@/components/ui/badge";

interface CommentComponentProps {
  row: Row<Ticket>;
  data: Ticket;
}

export function CommentComponent({ data }: CommentComponentProps) {
  // Cast to TicketComment for subrow data
  const comment = data as unknown as TicketComment;
  const roleColors = {
    customer: "bg-blue-500",
    agent: "bg-green-500",
    admin: "bg-purple-500",
  };

  const role = (comment.author_role || "customer").toLowerCase();
  const roleColor = roleColors[role as keyof typeof roleColors] || "bg-gray-500";

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
          <Badge className={`${roleColor} text-white text-xs`}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>
          {comment.is_internal === 1 && (
            <Badge variant="outline" className="text-xs">
              Internal
            </Badge>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(comment.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="text-sm">{comment.comment_text}</div>
      </div>
    </div>
  );
}
