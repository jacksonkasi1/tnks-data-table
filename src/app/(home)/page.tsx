import { Metadata } from "next";

import UserTable from "./data-table";

export const metadata: Metadata = {
  title: "Data Table Example",
};

export default function Home() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-xl font-bold mb-4">Users List</h1>

      {/* DataTable with custom configuration */}
      <UserTable />
    </main>
  );
}
