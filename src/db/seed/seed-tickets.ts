import { db } from "../index";
import { tickets, ticketComments } from "../schema";

// Helper function to generate random integer between min and max (inclusive)
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to pick random item from array
function randomItem<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

// Helper function to generate random date within last 90 days
function randomDate(): Date {
  const now = new Date();
  const daysAgo = randomInt(0, 90);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

const priorities = ["low", "medium", "high", "urgent"];
const statuses = ["open", "in-progress", "resolved", "closed"];
const categories = ["bug", "feature", "support", "question"];
const roles = ["customer", "agent", "admin"];

const customers = [
  { name: "Alice Johnson", email: "alice.johnson@example.com" },
  { name: "Bob Smith", email: "bob.smith@example.com" },
  { name: "Carol White", email: "carol.white@example.com" },
  { name: "David Brown", email: "david.brown@example.com" },
  { name: "Emma Davis", email: "emma.davis@example.com" },
  { name: "Frank Miller", email: "frank.miller@example.com" },
  { name: "Grace Wilson", email: "grace.wilson@example.com" },
  { name: "Henry Moore", email: "henry.moore@example.com" },
  { name: "Ivy Taylor", email: "ivy.taylor@example.com" },
  { name: "Jack Anderson", email: "jack.anderson@example.com" },
];

const agents = [
  { name: "Support Agent Sarah", email: "sarah@company.com" },
  { name: "Support Agent Mike", email: "mike@company.com" },
  { name: "Support Agent Lisa", email: "lisa@company.com" },
  { name: "Support Agent Tom", email: "tom@company.com" },
];

const ticketTitles = [
  "Cannot login to account",
  "Feature request: Dark mode",
  "Bug: Data export not working",
  "Question about billing",
  "Issue with table sorting",
  "Request for API documentation",
  "Performance issue on dashboard",
  "Cannot update profile information",
  "Bug: CSV export shows wrong data",
  "How to integrate with third-party tools",
  "Search functionality not working",
  "Need help with user permissions",
  "Request for bulk operations",
  "Issue with email notifications",
  "Feature: Add export to PDF",
];

const commentTemplates = [
  "Thank you for reporting this issue. We're looking into it.",
  "I've escalated this to our development team.",
  "Can you provide more details about this issue?",
  "This has been fixed in the latest update.",
  "We're working on implementing this feature.",
  "Could you try clearing your cache and let us know if the issue persists?",
  "This is expected behavior based on current settings.",
  "I've updated your account settings as requested.",
  "The issue should now be resolved. Please verify.",
  "We appreciate your patience while we work on this.",
];

export async function seedTickets() {
  console.log("🎫 Seeding tickets...");

  // Clear existing ticket data
  await db.delete(ticketComments);
  await db.delete(tickets);

  // Generate 100 tickets with 1-8 comments each
  for (let i = 1; i <= 100; i++) {
    const ticketId = `TKT-${String(i).padStart(5, "0")}`;
    const customer = randomItem(customers);
    const numComments = randomInt(1, 8);
    const createdAt = randomDate();

    // Insert ticket
    await db.insert(tickets).values({
      ticket_id: ticketId,
      title: randomItem(ticketTitles),
      description: `Detailed description for ${ticketId}. This is a sample ticket created for testing purposes.`,
      customer_name: customer.name,
      customer_email: customer.email,
      priority: randomItem(priorities),
      status: randomItem(statuses),
      category: randomItem(categories),
      assigned_to: Math.random() > 0.3 ? randomItem(agents).name : null,
      total_comments: numComments,
      created_at: createdAt,
      updated_at: createdAt,
    });

    // Generate comments for this ticket
    for (let j = 1; j <= numComments; j++) {
      const isCustomerComment = j === 1 || Math.random() > 0.6;
      const author = isCustomerComment ? customer : randomItem(agents);
      const authorRole = isCustomerComment ? "customer" : randomItem(["agent", "admin"]);

      // Create comment timestamp after ticket creation
      const commentDate = new Date(createdAt);
      commentDate.setHours(commentDate.getHours() + j * randomInt(1, 12));

      await db.insert(ticketComments).values({
        ticket_id: ticketId,
        comment_number: j,
        author_name: author.name,
        author_email: author.email,
        author_role: authorRole,
        comment_text: randomItem(commentTemplates),
        is_internal: authorRole === "admin" && Math.random() > 0.7 ? 1 : 0,
        created_at: commentDate,
      });
    }

    if (i % 20 === 0) {
      console.log(`  Created ${i} tickets...`);
    }
  }

  console.log("✅ Tickets seeding completed! Created 100 tickets with comments.");
}
