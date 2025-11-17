import { db } from "..";
import { bookings, bookingStops } from "../schema";

const statuses = ["pending", "in-transit", "delivered", "cancelled"];
const stopTypes = ["pickup", "delivery", "waypoint"];
const stopStatuses = ["pending", "completed", "skipped"];

const cities = [
  { name: "New York", state: "NY" },
  { name: "Los Angeles", state: "CA" },
  { name: "Chicago", state: "IL" },
  { name: "Houston", state: "TX" },
  { name: "Phoenix", state: "AZ" },
  { name: "Philadelphia", state: "PA" },
  { name: "San Antonio", state: "TX" },
  { name: "San Diego", state: "CA" },
  { name: "Dallas", state: "TX" },
  { name: "San Jose", state: "CA" },
  { name: "Austin", state: "TX" },
  { name: "Jacksonville", state: "FL" },
  { name: "Fort Worth", state: "TX" },
  { name: "Columbus", state: "OH" },
  { name: "Charlotte", state: "NC" },
  { name: "San Francisco", state: "CA" },
  { name: "Indianapolis", state: "IN" },
  { name: "Seattle", state: "WA" },
  { name: "Denver", state: "CO" },
  { name: "Boston", state: "MA" },
];

const streets = [
  "Main St", "Oak Ave", "Elm St", "Maple Dr", "Pine Rd",
  "Cedar Ln", "Birch Way", "Ash Blvd", "Spruce Ct", "Willow Pl",
  "Cherry St", "Walnut Ave", "Hickory Dr", "Poplar Rd", "Dogwood Ln",
];

const companyNames = [
  "ACME Corp", "Global Shipping", "FastTrack Logistics", "Prime Transport",
  "Express Delivery", "Swift Cargo", "Reliable Freight", "QuickMove Inc",
  "Metro Logistics", "Urban Freight", "Coastal Shipping", "Mountain Express",
];

const driverNames = [
  "John Smith", "Maria Garcia", "James Johnson", "Patricia Martinez",
  "Robert Williams", "Jennifer Lopez", "Michael Brown", "Linda Davis",
  "David Rodriguez", "Barbara Wilson", "Richard Martinez", "Susan Anderson",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function generateAddress(cityIndex: number): string {
  const number = randomInt(100, 9999);
  const street = randomItem(streets);
  return `${number} ${street}`;
}

export async function seedBookings() {
  console.log("🚛 Seeding bookings...");

  // Clear existing booking data
  console.log("🗑️  Clearing existing booking data...");
  await db.delete(bookingStops);
  await db.delete(bookings);
  console.log("✅ Existing booking data cleared");

  const bookingsData: Array<typeof bookings.$inferInsert> = [];
  const stopsData: Array<typeof bookingStops.$inferInsert> = [];

  const startDate = new Date("2024-01-01");
  const endDate = new Date();

  for (let i = 1; i <= 150; i++) {
    const bookingId = `BK-${String(i).padStart(5, "0")}`;
    const numStops = randomInt(2, 15);
    const status = randomItem(statuses);
    const bookingDate = randomDate(startDate, endDate);

    const pickupCity = randomItem(cities);
    const deliveryCity = randomItem(cities.filter(c => c.name !== pickupCity.name));

    const booking: typeof bookings.$inferInsert = {
      booking_id: bookingId,
      customer_name: randomItem(companyNames),
      customer_email: `contact@${randomItem(companyNames).toLowerCase().replace(/\s+/g, "")}.com`,
      customer_phone: `+1-${randomInt(200, 999)}-${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
      pickup_location: `${pickupCity.name}, ${pickupCity.state}`,
      delivery_location: `${deliveryCity.name}, ${deliveryCity.state}`,
      booking_date: bookingDate,
      status,
      total_stops: numStops,
      total_distance: (randomInt(50, 2000) + Math.random()).toFixed(2),
      total_amount: (randomInt(200, 5000) + Math.random() * 100).toFixed(2),
      driver_name: status !== "pending" ? randomItem(driverNames) : null,
      vehicle_number: status !== "pending" ? `${randomItem(["CA", "TX", "NY", "FL"])}-${randomInt(1000, 9999)}` : null,
    };

    bookingsData.push(booking);

    // Generate stops
    for (let j = 1; j <= numStops; j++) {
      const isFirst = j === 1;
      const isLast = j === numStops;

      let stopType: string;
      if (isFirst) stopType = "pickup";
      else if (isLast) stopType = "delivery";
      else stopType = randomItem(["pickup", "delivery", "waypoint"]);

      const cityForStop = j === 1 ? pickupCity : j === numStops ? deliveryCity : randomItem(cities);

      const stop: typeof bookingStops.$inferInsert = {
        booking_id: bookingId,
        stop_number: j,
        stop_type: stopType,
        location_name: `${stopType === "pickup" ? "Pickup" : stopType === "delivery" ? "Delivery" : "Stop"} Point ${j}`,
        location_address: generateAddress(0),
        location_city: cityForStop.name,
        location_state: cityForStop.state,
        location_zip: String(randomInt(10000, 99999)),
        contact_name: randomItem(driverNames),
        contact_phone: `+1-${randomInt(200, 999)}-${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
        scheduled_time: new Date(bookingDate.getTime() + j * 2 * 60 * 60 * 1000), // 2 hours apart
        actual_arrival_time: status === "delivered" || (status === "in-transit" && j < numStops / 2)
          ? new Date(bookingDate.getTime() + j * 2 * 60 * 60 * 1000 + randomInt(-30, 30) * 60 * 1000)
          : null,
        status: status === "delivered" ? "completed" :
                status === "in-transit" && j < numStops / 2 ? "completed" :
                status === "cancelled" && Math.random() > 0.5 ? "skipped" :
                "pending",
        notes: Math.random() > 0.7 ? `Special instructions for stop ${j}` : null,
        distance_from_previous: j > 1 ? (randomInt(10, 200) + Math.random()).toFixed(2) : "0",
      };

      stopsData.push(stop);
    }
  }

  // Insert bookings
  await db.insert(bookings).values(bookingsData);
  console.log(`✅ Inserted ${bookingsData.length} bookings`);

  // Insert stops
  await db.insert(bookingStops).values(stopsData);
  console.log(`✅ Inserted ${stopsData.length} booking stops`);

  console.log("🎉 Bookings seeding completed!");
}
