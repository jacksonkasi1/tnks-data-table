import { Metadata } from "next";
import { Suspense } from "react";
import { Info } from "lucide-react";

// ** Import Table
import UserTable from "./data-table";

// ** Import UI Components
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const metadata: Metadata = {
  title: "Users",
};

export default function Home() {
  return (
    <main className="container mx-auto py-10">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-xl font-bold">Users</h1>
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
                This table demonstrates <strong>snake_case</strong> API responses. Field names use underscores (e.g., first_name, last_name, created_at).
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <UserTable />
      </Suspense>
    </main>
  );
}
