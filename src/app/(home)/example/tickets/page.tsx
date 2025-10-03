"use client";

// ** import core packages
import { Suspense } from "react";

// ** import components
import { TicketsDataTable } from "./data-table";

export default function TicketsPage() {
  return (
    <main className="container mx-auto py-10">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Support Tickets</h1>
        <p className="text-sm text-muted-foreground">
          Subrows Example: Custom Component Mode (custom React component for
          rendering comments)
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <TicketsDataTable />
      </Suspense>
    </main>
  );
}
