// ** Booking parent interface
export interface Booking
  extends Record<
    string,
    string | number | boolean | null | undefined | BookingStop[]
  > {
  id: number;
  booking_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  pickup_location: string;
  delivery_location: string;
  booking_date: string;
  status: string;
  total_stops: number;
  total_distance: string | null;
  total_amount: string;
  driver_name: string | null;
  vehicle_number: string | null;
  created_at: string;

  // Subrows
  subRows?: BookingStop[];
}

// ** Booking stop (subrow) interface
export interface BookingStop
  extends Record<string, string | number | boolean | null | undefined | BookingStop[]> {
  id: number;
  booking_id: string;
  stop_number: number;
  stop_type: string;
  location_name: string;
  location_address: string;
  location_city: string | null;
  location_state: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  scheduled_time: string | null;
  status: string;
  distance_from_previous: string | null;
  
  // Nested subrows (for multi-level expansion)
  subRows?: BookingStop[];
}
