import { Suspense } from "react";
import UserCamelCaseTable from "./data-table";

export default function UsersCamelCasePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-xl font-bold mb-4">Users CamelCase</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <UserCamelCaseTable />
      </Suspense>
    </div>
  );
}