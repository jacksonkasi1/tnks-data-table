import UserCamelCaseTable from "@/app/(home)/data-table-camel-case";

export default function UsersCamelCasePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Users (CamelCase)</h1>
        <p className="text-muted-foreground">
          Example table demonstrating camelCase field support
        </p>
      </div>
      <UserCamelCaseTable />
    </div>
  );
}