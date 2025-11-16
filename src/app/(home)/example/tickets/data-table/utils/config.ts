import { useMemo } from "react";

/**
 * Export configuration for tickets data table
 */
export function useExportConfig() {
  // Column mapping for export (parent tickets)
  const columnMapping = useMemo(() => {
    return {
      ticket_id: "Ticket ID",
      title: "Title",
      description: "Description",
      customer_name: "Customer",
      customer_email: "Email",
      priority: "Priority",
      status: "Status",
      category: "Category",
      assigned_to: "Assigned To",
      total_comments: "Comments",
      created_at: "Created",
      updated_at: "Updated",
    };
  }, []);

  // Column widths for Excel export
  const columnWidths = useMemo(() => {
    return [
      { wch: 15 }, // ticket_id
      { wch: 30 }, // title
      { wch: 40 }, // description
      { wch: 20 }, // customer_name
      { wch: 25 }, // customer_email
      { wch: 12 }, // priority
      { wch: 12 }, // status
      { wch: 15 }, // category
      { wch: 18 }, // assigned_to
      { wch: 10 }, // total_comments
      { wch: 18 }, // created_at
      { wch: 18 }, // updated_at
    ];
  }, []);

  // Headers for CSV export
  const headers = useMemo(() => {
    return [
      "ticket_id",
      "title",
      "description",
      "customer_name",
      "customer_email",
      "priority",
      "status",
      "category",
      "assigned_to",
      "total_comments",
      "created_at",
      "updated_at",
    ];
  }, []);

  // Subrow export configuration (comments)
  const subRowExportConfig = useMemo(() => {
    return {
      entityName: "comments",
      columnMapping: {
        comment_number: "#",
        author_name: "Author",
        author_email: "Email",
        author_role: "Role",
        comment_text: "Comment",
        is_internal: "Internal",
        created_at: "Created",
      },
      columnWidths: [
        { wch: 8 }, // comment_number
        { wch: 20 }, // author_name
        { wch: 25 }, // author_email
        { wch: 12 }, // author_role
        { wch: 50 }, // comment_text
        { wch: 10 }, // is_internal
        { wch: 18 }, // created_at
      ],
      headers: [
        "comment_number",
        "author_name",
        "author_email",
        "author_role",
        "comment_text",
        "is_internal",
        "created_at",
      ],
    };
  }, []);

  return {
    columnMapping,
    columnWidths,
    headers,
    entityName: "tickets",
    subRowExportConfig,
  };
}
