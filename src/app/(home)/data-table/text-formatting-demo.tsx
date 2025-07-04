"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { ColumnDef } from "@tanstack/react-table";

// Demo data with different naming conventions
interface DemoUser {
  // Snake case
  user_id: number;
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  birth_date: string;
  created_at: string;
  
  // Camel case  
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  isActive: boolean;
  
  // Pascal case
  FirstName: string;
  LastName: string;
  EmailAddress: string;
  
  // Kebab case (would be used as strings)
  "first-name": string;
  "last-name": string;
  "email-address": string;
}

// Sample data
const sampleData: DemoUser[] = [
  {
    user_id: 1,
    first_name: "John", 
    last_name: "Doe",
    email_address: "john.doe@example.com",
    phone_number: "+1-234-567-8901",
    birth_date: "1990-01-15",
    created_at: "2024-01-01T10:00:00Z",
    firstName: "John",
    lastName: "Doe", 
    emailAddress: "john.doe@example.com",
    phoneNumber: "+1-234-567-8901",
    isActive: true,
    FirstName: "John",
    LastName: "Doe",
    EmailAddress: "john.doe@example.com",
    "first-name": "John",
    "last-name": "Doe", 
    "email-address": "john.doe@example.com"
  },
  {
    user_id: 2,
    first_name: "Jane",
    last_name: "Smith", 
    email_address: "jane.smith@example.com",
    phone_number: "+1-234-567-8902",
    birth_date: "1985-05-20",
    created_at: "2024-01-02T11:00:00Z",
    firstName: "Jane",
    lastName: "Smith",
    emailAddress: "jane.smith@example.com", 
    phoneNumber: "+1-234-567-8902",
    isActive: false,
    FirstName: "Jane",
    LastName: "Smith",
    EmailAddress: "jane.smith@example.com",
    "first-name": "Jane",
    "last-name": "Smith",
    "email-address": "jane.smith@example.com"
  },
  {
    user_id: 3,
    first_name: "Alice",
    last_name: "Johnson",
    email_address: "alice.johnson@example.com", 
    phone_number: "+1-234-567-8903",
    birth_date: "1992-08-12",
    created_at: "2024-01-03T09:00:00Z",
    firstName: "Alice",
    lastName: "Johnson",
    emailAddress: "alice.johnson@example.com",
    phoneNumber: "+1-234-567-8903", 
    isActive: true,
    FirstName: "Alice",
    LastName: "Johnson",
    EmailAddress: "alice.johnson@example.com",
    "first-name": "Alice",
    "last-name": "Johnson",
    "email-address": "alice.johnson@example.com"
  }
];

// Different column configurations to demonstrate naming conventions
const snakeCaseColumns: ColumnDef<DemoUser>[] = [
  {
    accessorKey: "user_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div>{row.getValue("user_id")}</div>,
    size: 80,
  },
  {
    accessorKey: "first_name", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="First Name" />,
    cell: ({ row }) => <div>{row.getValue("first_name")}</div>,
    size: 150,
  },
  {
    accessorKey: "last_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Name" />,
    cell: ({ row }) => <div>{row.getValue("last_name")}</div>,
    size: 150,
  },
  {
    accessorKey: "email_address",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => <div>{row.getValue("email_address")}</div>,
    size: 250,
  },
  {
    accessorKey: "phone_number", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
    cell: ({ row }) => <div>{row.getValue("phone_number")}</div>,
    size: 180,
  },
];

const camelCaseColumns: ColumnDef<DemoUser>[] = [
  {
    accessorKey: "user_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div>{row.getValue("user_id")}</div>,
    size: 80,
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="First Name" />,
    cell: ({ row }) => <div>{row.getValue("firstName")}</div>, 
    size: 150,
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Name" />,
    cell: ({ row }) => <div>{row.getValue("lastName")}</div>,
    size: 150,
  },
  {
    accessorKey: "emailAddress",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => <div>{row.getValue("emailAddress")}</div>,
    size: 250,
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    size: 120,
  },
];

const kebabCaseColumns: ColumnDef<DemoUser>[] = [
  {
    accessorKey: "user_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div>{row.getValue("user_id")}</div>,
    size: 80,
  },
  {
    accessorKey: "first-name", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="First Name" />,
    cell: ({ row }) => <div>{row.getValue("first-name")}</div>,
    size: 150,
  },
  {
    accessorKey: "last-name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Name" />,
    cell: ({ row }) => <div>{row.getValue("last-name")}</div>,
    size: 150,
  },
  {
    accessorKey: "email-address",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => <div>{row.getValue("email-address")}</div>,
    size: 250,
  },
];

// Mock data fetching function
const fetchDemoData = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: sampleData,
    pagination: {
      page: 1,
      limit: 10,
      total_pages: 1,
      total_items: sampleData.length,
    },
  };
};

export default function TextFormattingDemo() {
  const [currentDemo, setCurrentDemo] = useState<'snake' | 'camel' | 'kebab' | 'custom'>('snake');
  
  const getColumns = () => {
    switch (currentDemo) {
      case 'camel':
        return camelCaseColumns;
      case 'kebab':
        return kebabCaseColumns;
      case 'custom':
        return snakeCaseColumns; // Will use custom formatter
      default:
        return snakeCaseColumns;
    }
  };
  
  const getConfig = () => {
    switch (currentDemo) {
      case 'camel':
        return {
          textFormatting: {
            convention: 'camelCase' as const,
            capitalizeAll: true
          }
        };
      case 'kebab':
        return {
          textFormatting: {
            convention: 'kebab-case' as const,
            capitalize: true
          }
        };
      case 'custom':
        return {
          textFormatting: {
            customFormatter: (text: string) => `🔧 ${text.replace(/_/g, ' ').toUpperCase()}`
          }
        };
      default:
        return {
          textFormatting: {
            convention: 'snake_case' as const,
            capitalize: true
          }
        };
    }
  };
  
  const exportConfig = {
    entityName: "demo-users",
    columnMapping: {},
    columnWidths: [
      { wch: 10 }, // ID
      { wch: 15 }, // First name
      { wch: 15 }, // Last name  
      { wch: 25 }, // Email
      { wch: 18 }, // Phone/Status
    ],
    headers: currentDemo === 'camel' 
      ? ["user_id", "firstName", "lastName", "emailAddress", "isActive"]
      : currentDemo === 'kebab'
      ? ["user_id", "first-name", "last-name", "email-address"]
      : ["user_id", "first_name", "last_name", "email_address", "phone_number"],
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Text Formatting Demo</CardTitle>
          <CardDescription>
            Demonstrates the new flexible text formatting feature that supports multiple naming conventions.
            Click the buttons below to see how different column naming styles are automatically formatted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              variant={currentDemo === 'snake' ? 'default' : 'outline'}
              onClick={() => setCurrentDemo('snake')}
            >
              Snake Case (snake_case)
            </Button>
            <Button 
              variant={currentDemo === 'camel' ? 'default' : 'outline'}
              onClick={() => setCurrentDemo('camel')}
            >
              Camel Case (camelCase)
            </Button>
            <Button 
              variant={currentDemo === 'kebab' ? 'default' : 'outline'}
              onClick={() => setCurrentDemo('kebab')}
            >
              Kebab Case (kebab-case)
            </Button>
            <Button 
              variant={currentDemo === 'custom' ? 'default' : 'outline'}
              onClick={() => setCurrentDemo('custom')}
            >
              Custom Formatter
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground mb-4">
            <strong>Current configuration:</strong>{' '}
            {currentDemo === 'snake' && 'Snake case with capitalize: true'}
            {currentDemo === 'camel' && 'Camel case with capitalizeAll: true'}
            {currentDemo === 'kebab' && 'Kebab case with capitalize: true'}
            {currentDemo === 'custom' && 'Custom formatter that adds 🔧 prefix and converts to uppercase'}
          </div>
        </CardContent>
      </Card>

      <DataTable
        config={getConfig()}
        getColumns={() => getColumns()}
        fetchDataFn={fetchDemoData}
        exportConfig={exportConfig}
        idField="user_id"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>About This Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">What you&apos;re seeing:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Snake Case:</strong> Column names like `first_name` are automatically converted to &quot;First name&quot;</li>
              <li><strong>Camel Case:</strong> Column names like `firstName` are automatically converted to &quot;First Name&quot;</li>
              <li><strong>Kebab Case:</strong> Column names like `first-name` are automatically converted to &quot;First name&quot;</li>
              <li><strong>Custom Formatter:</strong> You can provide your own formatting function for complete control</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Key Benefits:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Automatic detection of naming conventions</li>
              <li>No need to manually specify column titles for common cases</li>
              <li>Flexibility to use any naming convention in your API/backend</li>
              <li>Custom formatting for special requirements</li>
              <li>Backward compatibility with existing snake_case implementations</li>
              <li>Export functionality also uses the same formatting rules</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Column Mapping Override:</h4>
            <p className="text-sm">
              Note that explicit column mappings in the `columnMapping` prop still take precedence over automatic formatting.
              This ensures you can override specific columns when needed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}