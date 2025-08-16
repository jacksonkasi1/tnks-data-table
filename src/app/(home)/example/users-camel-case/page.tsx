import { Suspense } from "react";
import { Info } from "lucide-react";
import UserCamelCaseTable from "./data-table";

// ** Import UI Components
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function UsersCamelCasePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-xl font-bold">Users CamelCase</h1>
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Info className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">API Response Format</h4>
              <p className="text-sm text-muted-foreground">
                This table demonstrates <strong>camelCase</strong> API responses. Field names use camelCase formatting (e.g., firstName, lastName, createdAt).
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <UserCamelCaseTable />
      </Suspense>
    </div>
  );
}