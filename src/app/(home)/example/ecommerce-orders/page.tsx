import { Suspense } from "react";
import { Info } from "lucide-react";
import EcommerceOrdersDataTable from "./data-table";

// ** Import UI Components
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function EcommerceOrdersPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-xl font-bold">E-commerce Orders</h1>
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Info className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">Simple Orders Table</h4>
              <p className="text-sm text-muted-foreground">
                This table demonstrates a simple e-commerce orders data table with basic functionality.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <EcommerceOrdersDataTable />
      </Suspense>
    </div>
  );
}