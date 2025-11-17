// ** import schema
import { Booking } from "@/app/(home)/example/bookings/data-table/schema";

/**
 * Fetch bookings by their IDs (for cross-page selection and export)
 * @param ids - Array of booking IDs (can be strings or numbers)
 * @returns Promise with bookings data
 */
export async function fetchBookingsByIds(ids: string[] | number[]): Promise<Booking[]> {
  try {
    if (ids.length === 0) {
      return [];
    }

    const idsParam = ids.join(",");
    const response = await fetch(`/api/bookings/by-ids?ids=${idsParam}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch bookings");
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching bookings by IDs:", error);
    throw error;
  }
}
