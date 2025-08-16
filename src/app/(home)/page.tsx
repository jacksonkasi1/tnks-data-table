import { Metadata } from "next";
import { Suspense } from "react";

// ** Import Table
import UserTable from "./data-table";

export const metadata: Metadata = {
  title: "Users",
};

export default function Home() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-xl font-bold mb-4">Users</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <UserTable />
      </Suspense>
    </main>
  );
}
