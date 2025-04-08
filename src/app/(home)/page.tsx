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
          enableClickRowSelect: false,    // Enable clicking rows to select them
          enableKeyboardNavigation: true, // Enable keyboard navigation
          enablePagination: true,        // Enable pagination
          enableSearch: false,            // Enable search
          enableColumnFilters: false,     // Enable column filters
          enableDateFilter: false,        // Enable date filter
          enableColumnVisibility: false,  // Enable column visibility

        }} 
      />
    </main>
  );
}
