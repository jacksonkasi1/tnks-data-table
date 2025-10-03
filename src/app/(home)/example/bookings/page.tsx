"use client";

// ** import core packages
import { Suspense } from "react";

// ** import components
import { BookingsDataTable } from "./data-table";

export default function BookingsPage() {
  return (
    <main className="container mx-auto py-10">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Logistics Bookings</h1>
        <p className="text-sm text-muted-foreground">
          Subrows Example: Custom Columns Mode (different columns for parent and
          subrows)
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <BookingsDataTable />
      </Suspense>
    </main>
  );
}
