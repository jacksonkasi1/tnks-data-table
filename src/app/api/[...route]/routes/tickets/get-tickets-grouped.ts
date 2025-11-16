import { Hono } from "hono";
import { db } from "@/db";
import { tickets, ticketComments } from "@/db/schema";
import { desc, asc, sql, or, ilike, and, gte, lte, eq } from "drizzle-orm";

const router = new Hono();

router.get("/", async (c) => {
  try {
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;
    const search = c.req.query("search") || "";
    const fromDate = c.req.query("from_date") || "";
    const toDate = c.req.query("to_date") || "";
    const sortBy = c.req.query("sort_by") || "created_at";
    const sortOrder = c.req.query("sort_order") || "desc";

    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions = [];

    // Search across multiple fields
    if (search) {
      conditions.push(
        or(
          ilike(tickets.ticket_id, `%${search}%`),
          ilike(tickets.title, `%${search}%`),
          ilike(tickets.customer_name, `%${search}%`),
          ilike(tickets.customer_email, `%${search}%`),
          ilike(tickets.status, `%${search}%`),
          ilike(tickets.priority, `%${search}%`)
        )
      );
    }

    // Date range filter
    if (fromDate) {
      conditions.push(gte(tickets.created_at, new Date(fromDate)));
    }
    if (toDate) {
      conditions.push(lte(tickets.created_at, new Date(toDate)));
    }

    // Combine all conditions
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Determine sort direction and column
    const sortDirection = sortOrder === "desc" ? desc : asc;

    // Safely get sort column with proper type
    const getSortColumn = () => {
      switch (sortBy) {
        case "ticket_id": return tickets.ticket_id;
        case "title": return tickets.title;
        case "customer_name": return tickets.customer_name;
        case "priority": return tickets.priority;
        case "status": return tickets.status;
        case "category": return tickets.category;
        case "assigned_to": return tickets.assigned_to;
        case "total_comments": return tickets.total_comments;
        case "created_at": return tickets.created_at;
        case "updated_at": return tickets.updated_at;
        default: return tickets.created_at;
      }
    };

    // Fetch tickets with pagination
    const ticketsData = await db
      .select()
      .from(tickets)
      .where(whereClause)
      .orderBy(sortDirection(getSortColumn()))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tickets)
      .where(whereClause);

    const totalRecords = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    // Fetch comments for these tickets (limit to 15 comments per ticket)
    const ticketIds = ticketsData.map((t) => t.ticket_id);

    const comments = ticketIds.length > 0
      ? await db
          .select()
          .from(ticketComments)
          .where(sql`${ticketComments.ticket_id} IN ${ticketIds}`)
          .orderBy(asc(ticketComments.comment_number))
      : [];

    // Group comments by ticket_id
    const commentsByTicket = comments.reduce((acc, comment) => {
      if (!acc[comment.ticket_id]) {
        acc[comment.ticket_id] = [];
      }
      // Limit to 15 comments per ticket
      if (acc[comment.ticket_id].length < 15) {
        acc[comment.ticket_id].push(comment);
      }
      return acc;
    }, {} as Record<string, typeof comments>);

    // Attach comments as subRows to each ticket
    const ticketsWithComments = ticketsData.map((ticket) => ({
      ...ticket,
      subRows: commentsByTicket[ticket.ticket_id] || [],
    }));

    return c.json({
      success: true,
      data: ticketsWithComments,
      pagination: {
        page,
        limit,
        total_pages: totalPages,
        total_items: totalRecords,
      },
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch tickets",
      },
      500
    );
  }
});

export default router;
