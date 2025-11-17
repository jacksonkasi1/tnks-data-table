import { Hono } from "hono";
import { z } from "zod";
import { db } from "@/db";
import { tickets, ticketComments } from "@/db/schema";
import { inArray, sql, asc } from "drizzle-orm";

const router = new Hono();

// Schema for query parameters
const querySchema = z.object({
  ids: z.string(),
});

// Get tickets by IDs with nested comments
router.get("/", async (c) => {
  try {
    // Parse and validate query parameters
    const result = querySchema.safeParse(c.req.query());

    if (!result.success) {
      return c.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: result.error.format(),
        },
        400
      );
    }

    const { ids } = result.data;

    // Parse comma-separated IDs
    const idArray = ids.split(",").map((id) => parseInt(id.trim(), 10));

    if (idArray.length === 0 || idArray.some(isNaN)) {
      return c.json(
        {
          success: false,
          error: "Invalid IDs provided",
        },
        400
      );
    }

    // Get tickets by IDs
    const ticketsData = await db
      .select()
      .from(tickets)
      .where(inArray(tickets.id, idArray));

    // Fetch all comments for these tickets in a single query
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
    });
  } catch (error) {
    console.error("Error getting tickets by IDs:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch tickets by IDs",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default router;
