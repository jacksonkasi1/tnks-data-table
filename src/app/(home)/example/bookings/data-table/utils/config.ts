import { useMemo } from "react";

/**
 * Export configuration for bookings data table
 */
export function useExportConfig() {
  // Column mapping for export (parent bookings)
  const columnMapping = useMemo(() => {
    return {
      booking_id: "Booking ID",
      customer_name: "Customer",
      customer_email: "Email",
      customer_phone: "Phone",
      pickup_location: "Pickup",
      delivery_location: "Delivery",
      booking_date: "Booking Date",
      status: "Status",
      total_stops: "Total Stops",
      total_distance: "Total Distance",
      total_amount: "Total Amount",
      driver_name: "Driver",
      vehicle_number: "Vehicle",
    };
  }, []);

  // Column widths for Excel export
  const columnWidths = useMemo(() => {
    return [
      { wch: 15 }, // booking_id
      { wch: 20 }, // customer_name
      { wch: 25 }, // customer_email
      { wch: 15 }, // customer_phone
      { wch: 20 }, // pickup_location
      { wch: 20 }, // delivery_location
      { wch: 15 }, // booking_date
      { wch: 12 }, // status
      { wch: 12 }, // total_stops
      { wch: 15 }, // total_distance
      { wch: 12 }, // total_amount
      { wch: 18 }, // driver_name
      { wch: 15 }, // vehicle_number
    ];
  }, []);

  // Headers for CSV export
  const headers = useMemo(() => {
    return [
      "booking_id",
      "customer_name",
      "customer_email",
      "customer_phone",
      "pickup_location",
      "delivery_location",
      "booking_date",
      "status",
      "total_stops",
      "total_distance",
      "total_amount",
      "driver_name",
      "vehicle_number",
    ];
  }, []);

  // Subrow export configuration (booking stops)
  const subRowExportConfig = useMemo(() => {
    return {
      entityName: "booking-stops",
      columnMapping: {
        stop_number: "Stop #",
        stop_type: "Type",
        location_name: "Location",
        location_address: "Address",
        location_city: "City",
        location_state: "State",
        contact_name: "Contact",
        contact_phone: "Phone",
        scheduled_time: "Scheduled",
        status: "Status",
        distance_from_previous: "Distance",
      },
      columnWidths: [
        { wch: 10 }, // stop_number
        { wch: 12 }, // stop_type
        { wch: 20 }, // location_name
        { wch: 25 }, // location_address
        { wch: 15 }, // location_city
        { wch: 12 }, // location_state
        { wch: 18 }, // contact_name
        { wch: 15 }, // contact_phone
        { wch: 18 }, // scheduled_time
        { wch: 12 }, // status
        { wch: 12 }, // distance_from_previous
      ],
      headers: [
        "stop_number",
        "stop_type",
        "location_name",
        "location_address",
        "location_city",
        "location_state",
        "contact_name",
        "contact_phone",
        "scheduled_time",
        "status",
        "distance_from_previous",
      ],
    };
  }, []);

  return {
    columnMapping,
    columnWidths,
    headers,
    entityName: "bookings",
    subRowExportConfig,
  };
}
