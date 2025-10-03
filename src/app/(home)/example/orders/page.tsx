// ** import core packages
import { Suspense } from "react";
import Link from "next/link";

// ** import components
import { OrdersDataTable } from "./data-table";
import { Skeleton } from "@/components/ui/skeleton";

function OrdersTableWrapper() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <OrdersDataTable />
    </Suspense>
  );
}

export default function OrdersPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        {/* Breadcrumb/Navigation Path */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/example" className="hover:text-foreground transition-colors">Examples</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Orders</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Orders & Products</h1>
        <p className="text-muted-foreground mt-2">
          Example of subrows feature with same-columns mode. Each order shows its first product in the parent row, with remaining products as expandable subrows.
        </p>
      </div>
      <OrdersTableWrapper />
    </div>
  );
}
