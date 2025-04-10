import { DataTable } from "./data-table/data-table";
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
          enableRowSelection: true, // Enable row selection
          enableClickRowSelect: false, // Disable clicking rows to select them
          enableKeyboardNavigation: true, // Enable keyboard navigation
          enableSearch: true, // Enable search functionality
          enableDateFilter: true, // Enable date filter
          enableColumnFilters: false, // Disable column filters
          enableColumnVisibility: true, // Enable column visibility options
          enableUrlState: true, // Enable URL state persistence
          columnResizingTableId: "user-table",
        }}
      />
    </main>
  );
}
