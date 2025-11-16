// ** import types
import { Order } from "@/app/(home)/example/orders/data-table/schema";

const API_BASE_URL = "/api";

/**
 * Fetch orders by IDs (including subrows)
 */
export async function fetchOrdersByIds(
  ids: number[] | string[]
): Promise<Order[]> {
  if (ids.length === 0) {
    return [];
  }

  // Convert ids to comma-separated string
  const idsParam = ids.map((id) => String(id)).join(",");

  // Fetch data from API endpoint
  const response = await fetch(
    `${API_BASE_URL}/orders/by-ids?ids=${idsParam}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch orders by IDs: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch orders by IDs");
  }

  return data.data;
}
