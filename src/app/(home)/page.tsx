import { DataTable } from "./data-table-components/data-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Table Example",
};

export default function Home() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-xl font-bold mb-4">Users</h1>
      
      {/* DataTable with custom configuration */}
      <DataTable
        config={{
          enableRowSelection: true,      // Enable row selection
          enableClickRowSelect: false,    // Disable clicking rows to select them
          enableKeyboardNavigation: true, // Enable keyboard navigation
          enablePagination: true,        // Enable pagination
          enableSearch: true,            // Enable search
          enableColumnFilters: true,     // Enable column filters
          enableDateFilter: true,        // Enable date filter
          enableColumnVisibility: true,  // Enable column visibility
          enableExport: true,            // Enable export
          enableUrlState: false,          // Enable url state
        }}
      />
    </main>
  );
}
