// ** import schema
import { Ticket } from "@/app/(home)/example/tickets/data-table/schema";

/**
 * Fetch tickets by their IDs (for cross-page selection and export)
 * @param ids - Array of ticket IDs (can be strings or numbers)
 * @returns Promise with tickets data
 */
export async function fetchTicketsByIds(ids: string[] | number[]): Promise<Ticket[]> {
  try {
    if (ids.length === 0) {
      return [];
    }

    const idsParam = ids.join(",");
    const response = await fetch(`/api/tickets/by-ids?ids=${idsParam}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch tickets");
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching tickets by IDs:", error);
    throw error;
  }
}
