/**
 * Fetch grouped tickets with nested comments
 */
export async function fetchTicketsGrouped(params: {
  page: number;
  limit: number;
  search: string;
  from_date: string;
  to_date: string;
  sort_by: string;
  sort_order: string;
}) {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    search: params.search || "",
    from_date: params.from_date || "",
    to_date: params.to_date || "",
    sort_by: params.sort_by || "created_at",
    sort_order: params.sort_order || "desc",
  });

  const response = await fetch(`/api/tickets/grouped?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tickets: ${response.statusText}`);
  }

  return response.json();
}
