import { Suspense } from "react";
import { Info } from "lucide-react";
import UsersWithSubRowsDataTable from "./data-table";

// ** Import UI Components
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function UsersWithSubRowsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-xl font-bold">Users with Expenses</h1>
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Info className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">Simple Users Table</h4>
              <p className="text-sm text-muted-foreground">
                This table demonstrates a simple users data table with basic functionality.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <UsersWithSubRowsDataTable />
      </Suspense>
    </div>
  );
}