import { DataTable } from "./data-table-components/data-table";
import { UserNav } from "./data-table-components/user-nav";

export default function Home() {
  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users & Expenses Dashboard</h2>
          <p className="text-muted-foreground">
            View and manage user data and their associated expenses
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <UserNav />
        </div>
      </div>
      <DataTable />
    </div>
  );
}
