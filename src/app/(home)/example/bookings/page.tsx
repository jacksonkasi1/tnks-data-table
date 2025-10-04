// ** import core packages
import { Suspense } from "react";

// ** import components
import { BookingsDataTable } from "./data-table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// ** import icons
import { Info } from "lucide-react";

export default function BookingsPage() {
  return (
    <main className="container mx-auto py-10">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-xl font-bold">Logistics Bookings</h1>
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Info className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">Subrows Feature</h4>
              <p className="text-sm text-muted-foreground">
                Example of subrows feature with custom-columns mode. Each booking has different columns than its stops (subrows). Bookings show customer and route info, while stops display detailed location and schedule data.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <BookingsDataTable />
      </Suspense>
    </main>
  );
}
