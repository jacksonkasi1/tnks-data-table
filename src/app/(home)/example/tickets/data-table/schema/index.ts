// ** Ticket parent interface
export interface Ticket
  extends Record<
    string,
    string | number | boolean | null | undefined | TicketComment[]
  > {
  id: number;
  ticket_id: string;
  title: string;
  description: string | null;
  customer_name: string;
  customer_email: string;
  priority: string;
  status: string;
  category: string | null;
  assigned_to: string | null;
  total_comments: number;
  created_at: string;
  updated_at: string;

  // Subrows
  subRows?: TicketComment[];
}

// ** Ticket comment (subrow) interface
export interface TicketComment
  extends Record<string, string | number | boolean | null | undefined> {
  id: number;
  ticket_id: string;
  comment_number: number;
  author_name: string;
  author_email: string;
  author_role: string | null;
  comment_text: string;
  is_internal: number;
  created_at: string;
}
