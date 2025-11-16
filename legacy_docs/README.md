# Advanced Data Table Component Documentation

**Version:** 1.0.0  
**Updated:** 2025-04-14  
**Author:** Jackson Kasi

## Table of Contents

1. [Introduction](#introduction)
2. [Features Overview](#features-overview)
3. [File Structure](#file-structure)
4. [Installation & Setup](#installation--setup)
5. [Basic Usage](#basic-usage)
6. [Core Components](#core-components)
7. [API Integration](#api-integration)
8. [Advanced Configuration](#advanced-configuration)
   - [Column Configuration](#column-configuration)
   - [Row Actions](#row-actions)
   - [Filtering & Sorting](#filtering--sorting)
   - [Pagination](#pagination)
   - [Date Range Filtering](#date-range-filtering)
   - [Row Selection](#row-selection)
   - [Toolbar Customization](#toolbar-customization)
   - [Export Options](#export-options)
9. [Server Implementation](#server-implementation)
   - [API Endpoints](#api-endpoints)
   - [Request & Response Formats](#request--response-formats)
   - [Error Handling](#error-handling)
10. [Popups & Modals](#popups--modals)
11. [Customization](#customization)
12. [Performance Optimization](#performance-optimization)
13. [Best Practices](#best-practices)
14. [Troubleshooting](#troubleshooting)
15. [Complete API Reference](#complete-api-reference)
16. [Example Implementations](#example-implementations)

---

## Introduction

The Advanced Data Table component is a highly configurable and feature-rich table implementation built on top of Shadcn UI components and TanStack Table (React Table v8). It's designed to handle enterprise-level requirements including complex data operations, server-side processing, and customizable UI elements.

This documentation provides comprehensive guidance on how to implement, configure, and extend the data table for your specific needs.

## Server

Check out the API development document to understand the default configuration for this table. [👉 Click here](./src/SERVER.md)

### Key Benefits

- **TypeScript Support**: Fully typed components for better developer experience
- **Modular Architecture**: Easily extendable and customizable
- **Server Integration**: Built-in support for server-side operations
- **Accessibility**: Follows WCAG guidelines for accessible tables
- **Performance Optimized**: Efficient rendering even with large datasets
- **Responsive Design**: Works across various screen sizes
- **Theming Support**: Customizable appearance with Tailwind CSS

---

## Features Overview

The Data Table includes the following features:

### Data Management

- ✅ Server-side pagination
- ✅ Server-side sorting
- ✅ Server-side filtering
- ✅ Single & multi-row selection
- ✅ Optimistic UI updates

### UI Features

- ✅ Responsive layout
- ✅ Column resizing
- ✅ Column visibility toggle
- ✅ Date range filtering
- ✅ Search functionality
- ✅ Customizable toolbar
- ✅ Row actions menu
- ✅ Bulk action support

### Operations

- ✅ Add new records
- ✅ Edit existing records
- ✅ Delete single records
- ✅ Bulk delete operations
- ✅ Data export (CSV/Excel)

### Integration

- ✅ React Query data fetching
- ✅ Zod validation
- ✅ Form handling with React Hook Form
- ✅ Toast notifications
- ✅ URL state persistence

---

## File Structure

The data table implementation follows a modular structure to separate concerns and improve maintainability. Below is the recommended file structure for implementing the data table in your project:

```sh
src/
├── api/                       # API integration layer
│   └── entity/                # Entity-specific API functions
│       ├── add-entity.ts      # Create operation
│       ├── delete-entity.ts   # Delete operation
│       ├── fetch-entities.ts  # List operation with filters
│       └── fetch-entity-by-ids.ts # Fetch specific entities
│
├── components/                # Shared UI components
└── 📁data-table               # Core data table components
    └── 📁hooks                # Custom React hooks for data-table
        └── use-table-column-resize.ts  # Hook for managing column resize state and persistence
    └── 📁utils                # Utility functions and helpers
        └── column-sizing.ts   # Functions for calculating and managing column widths
        └── conditional-state.ts # Logic for conditional rendering and state transitions
        └── date-format.ts     # Date formatting and manipulation utilities
        └── deep-utils.ts      # Deep object comparison and manipulation
        └── export-utils.ts    # Utilities for data export (CSV/Excel)
        └── index.ts           # Export barrel file for utilities
        └── keyboard-navigation.ts # Keyboard navigation and accessibility
        └── search.ts          # Search functionality and text matching
        └── table-config.ts    # Table configuration types and defaults
        └── table-state-handlers.ts # Handlers for table state changes
        └── url-state.ts       # URL state persistence utilities
    └── column-header.tsx      # Sortable column header component
    └── data-export.tsx        # Component for export functionality UI
    └── data-table-resizer.tsx # Column resize handler component
    └── data-table.tsx         # Main data table component
    └── pagination.tsx         # Pagination controls component
    └── toolbar.tsx            # Table toolbar with search and filtering
    └── view-options.tsx       # Column visibility and display options
│
├── app/                       # Application routes and pages
│   └── (section)/             # Section grouping
│       └── entity-table/      # Entity-specific implementation
│           ├── components/    # Entity table components
│           │   ├── columns.tsx                # Column definitions
│           │   ├── row-actions.tsx            # Row action menu
│           │   ├── toolbar-options.tsx        # Toolbar customizations
│           │   └── actions/                   # Action components
│           │       ├── add-entity-popup.tsx   # Add modal
│           │       ├── delete-entity-popup.tsx # Delete confirmation
│           │       └── bulk-delete-popup.tsx  # Bulk delete confirmation
│           ├── schema/        # Data schemas
│           │   ├── entity-schema.ts           # Entity type definitions
│           │   └── index.ts                   # Schema exports
│           ├── utils/         # Utility functions
│           │   ├── config.ts                  # Table configuration
│           │   └── data-fetching.ts           # Data fetching hooks
│           └── index.tsx      # Table component entry
```

### Understanding the Structure

This file structure follows a clear separation of concerns:

1. **API Layer**: Handles all communication with the backend
2. **Core Components**: Reusable data table building blocks
3. **Implementation**: Entity-specific configuration and customization
4. **Schema**: Type definitions and validation
5. **Utils**: Helper functions for specific implementations

By following this structure, you can easily maintain and extend your data tables while keeping each part focused on its specific responsibility.

---

## Installation & Setup

### Prerequisites

- Next.js 13+ with App Router
- React 18+
- TypeScript 5+
- Tailwind CSS
- Shadcn UI components

### Installation Steps

1. **Install required dependencies**:

```bash
# Installing dependencies with Bun
bun add @tanstack/react-table @tanstack/react-query zod @hookform/resolvers sonner date-fns
```

2. **Copy the core data table components** to your project:

Create a `/components/data-table` directory in your project and copy the following core components:

- `data-table.tsx`: Main component
- `column-header.tsx`: Sortable column headers
- `filters.tsx`: Filter components
- `utils.ts`: Helper functions

3. **Set up the API layer**:

Create an API directory structure as shown in the file structure section above. Implement the necessary API functions for your entity.

4. **Create Schema Definitions**:

Define your entity schema using Zod for type validation.

5. **Implement the Data Table**:

Create your entity-specific table implementation following the structure outlined above.

---

## Basic Usage

Here's a basic example of how to implement a data table for your entity:

### 1. Define your entity schema

```typescript
// src/app/(section)/entity-table/schema/entity-schema.ts
import { z } from "zod";

export const entitySchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  created_at: z.string(),
  // Add other fields as needed
});

export type Entity = z.infer<typeof entitySchema>;

export const entitiesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(entitySchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total_pages: z.number(),
    total_items: z.number(),
  }),
});
```

### 2. Create API functions

```typescript
// src/api/entity/fetch-entities.ts
import { z } from "zod";
import { entitiesResponseSchema } from "@/app/(section)/entity-table/schema";

const API_BASE_URL = "/api";

export async function fetchEntities({
  search = "",
  from_date = "",
  to_date = "",
  sort_by = "created_at",
  sort_order = "desc",
  page = 1,
  limit = 10,
}) {
  // Build query parameters
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (from_date) params.append("from_date", from_date);
  if (to_date) params.append("to_date", to_date);
  params.append("sort_by", sort_by);
  params.append("sort_order", sort_order);
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  // Fetch data
  const response = await fetch(`${API_BASE_URL}/entities?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch entities: ${response.statusText}`);
  }

  const data = await response.json();
  return entitiesResponseSchema.parse(data);
}
```

### 3. Create a data fetching hook

```typescript
// src/app/(section)/entity-table/utils/data-fetching.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchEntities } from "@/api/entity/fetch-entities";

export function useEntitiesData(
  page: number,
  pageSize: number,
  search: string,
  dateRange: { from_date: string; to_date: string },
  sortBy: string,
  sortOrder: string
) {
  return useQuery({
    queryKey: [
      "entities",
      page,
      pageSize,
      search,
      dateRange,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      fetchEntities({
        page,
        limit: pageSize,
        search,
        from_date: dateRange.from_date,
        to_date: dateRange.to_date,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    placeholderData: keepPreviousData,
  });
}

// Add this property for the DataTable component
useEntitiesData.isQueryHook = true;
```

### 4. Define your columns

```typescript
// src/app/(section)/entity-table/components/columns.tsx
"use client";

import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";

// Import components
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { Checkbox } from "@/components/ui/checkbox";

// Import schema and actions
import { Entity } from "../schema";
import { DataTableRowActions } from "./row-actions";

export const getColumns = (
  handleRowDeselection: ((rowId: string) => void) | null | undefined
): ColumnDef<Entity>[] => {
  const baseColumns: ColumnDef<Entity>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
      size: 200,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
      size: 250,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        const formatted = format(date, "MMM d, yyyy");
        return <div>{formatted}</div>;
      },
      size: 120,
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row, table }) => <DataTableRowActions row={row} table={table} />,
      size: 100,
    },
  ];

  // Only include selection column if row selection is enabled
  if (handleRowDeselection !== null) {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-0.5 cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              if (!value && handleRowDeselection) {
                handleRowDeselection(row.id);
              }
            }}
            aria-label="Select row"
            className="translate-y-0.5 cursor-pointer"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
      },
      ...baseColumns,
    ];
  }

  return baseColumns;
};
```

### 5. Implement the main table component

```typescript
// src/app/(section)/entity-table/index.tsx
"use client";

import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./components/columns";
import { useExportConfig } from "./utils/config";
import { fetchEntitiesByIds } from "@/api/entity/fetch-entities-by-ids";
import { useEntitiesData } from "./utils/data-fetching";
import { ToolbarOptions } from "./components/toolbar-options";
import { Entity } from "./schema";

export default function EntityTable() {
  return (
    <DataTable<Entity, any>
      getColumns={getColumns}
      exportConfig={useExportConfig()}
      fetchDataFn={useEntitiesData}
      fetchByIdsFn={fetchEntitiesByIds}
      idField="id"
      pageSizeOptions={[10, 20, 50, 100]}
      renderToolbarContent={({
        selectedRows,
        allSelectedIds,
        totalSelectedCount,
        resetSelection,
      }) => (
        <ToolbarOptions
          selectedEntities={selectedRows.map((row) => ({
            id: row.id,
            name: row.name,
          }))}
          allSelectedIds={allSelectedIds}
          totalSelectedCount={totalSelectedCount}
          resetSelection={resetSelection}
        />
      )}
      config={{
        enableRowSelection: true,
        enableSearch: true,
        enableDateFilter: true,
        enableColumnVisibility: true,
        enableUrlState: true,
        columnResizingTableId: "entity-table",
      }}
    />
  );
}
```

### 6. Add the table to your page

```typescript
// src/app/(section)/entities/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import EntityTable from "./entity-table";

export const metadata: Metadata = {
  title: "Entities Management",
};

export default function EntitiesPage() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-xl font-bold mb-4">Entities List</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <EntityTable />
      </Suspense>
    </main>
  );
}
```

---

## Core Components

The data table is built using several key components that work together. Understanding these components will help you customize and extend the table according to your needs.

### Main Data Table Component

The `DataTable` component is the main entry point for the table implementation. It handles:

- State management
- Data fetching
- URL state persistence
- Pagination
- Sorting
- Filtering
- Row selection
- Export functionality

### Column Header Component

The `DataTableColumnHeader` component provides:

- Visual indication of sort direction
- Sorting controls
- Column header rendering

### Filter Components

Filter components provide UI for filtering data:

- Search input
- Date range picker
- Custom filters can be added

### Row Actions

Row action components handle operations on individual rows:

- Action menus
- Delete confirmations
- Edit forms

### Toolbar Components

The toolbar area provides:

- Global actions (add new, bulk delete)
- Filter controls
- Export buttons
- View options

---

## API Integration

### API Layer Structure

The data table relies on a consistent API layer to communicate with your backend services. Each entity should have the following API functions:

#### 1. Fetch List with Filtering

```typescript
// Function signature
async function fetchEntities({
  search?: string,
  from_date?: string,
  to_date?: string,
  sort_by?: string,
  sort_order?: string,
  page?: number,
  limit?: number,
}): Promise<EntityResponse>;
```

#### 2. Fetch Multiple by IDs

```typescript
// Function signature
async function fetchEntitiesByIds(ids: number[]): Promise<Entity[]>;
```

#### 3. Add Entity

```typescript
// Function signature
async function addEntity(data: NewEntity): Promise<AddEntityResponse>;
```

#### 4. Delete Entity

```typescript
// Function signature
async function deleteEntity(id: number): Promise<DeleteEntityResponse>;
```

### Error Handling in API Layer

Each API function should include proper error handling:

```typescript
export async function addEntity(
  entityData: NewEntity
): Promise<AddEntityResponse> {
  try {
    // Validate input data
    const validatedData = addEntitySchema.parse(entityData);

    // Make API request
    const response = await fetch(`${API_BASE_URL}/entities/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData),
    });

    // Parse response
    const data = await response.json();

    // Validate response
    const validatedResponse = addEntityResponseSchema.parse(data);

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(validatedResponse.error || "Failed to add entity");
    }

    return validatedResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid response format from server");
    }
    throw error;
  }
}
```

---

## Advanced Configuration

### Column Configuration

Columns are defined using TanStack Table's `ColumnDef` interface. Each column can be customized with:

#### Basic Properties

- `accessorKey`: The key to use when accessing the data
- `header`: Custom header rendering
- `cell`: Custom cell rendering
- `size`: Column width

#### Advanced Properties

- `enableSorting`: Enable/disable sorting for this column
- `enableHiding`: Allow column to be hidden/shown
- `meta`: Custom metadata for the column
- `filterFn`: Custom filtering function

#### Example Column Definition

```typescript
{
  accessorKey: "name",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Name" />
  ),
  cell: ({ row }) => {
    // Custom rendering with additional styling or components
    return (
      <div className="flex items-center">
        <Avatar className="mr-2" name={row.getValue("name")} />
        <span className="font-medium">{row.getValue("name")}</span>
      </div>
    );
  },
  enableSorting: true,
  enableHiding: true,
  size: 200,
}
```

### Row Actions

Row actions provide operations on individual rows. They're implemented using the `DataTableRowActions` component:

```typescript
// src/app/(section)/entity-table/components/row-actions.tsx
"use client";

import * as React from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { entitySchema } from "../schema";
import { DeleteEntityPopup } from "./actions/delete-entity-popup";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  table: any; // Table instance
}

export function DataTableRowActions<TData>({
  row,
  table,
}: DataTableRowActionsProps<TData>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const entity = entitySchema.parse(row.original);

  // Function to reset all selections
  const resetSelection = () => {
    table.resetRowSelection();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => console.log("Edit", entity)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteEntityPopup
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        entityId={entity.id}
        entityName={entity.name}
        resetSelection={resetSelection}
      />
    </>
  );
}
```

### Filtering & Sorting

The data table supports server-side filtering and sorting. Configure the API to handle the following parameters:

- `search`: Text search term
- `sort_by`: Column to sort by
- `sort_order`: Sort direction (asc/desc)

### Pagination

Server-side pagination is handled through the following parameters:

- `page`: Current page number (1-based)
- `limit`: Number of items per page

The server should return pagination information in the response:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_pages": 5,
    "total_items": 48
  }
}
```

### Date Range Filtering

Date range filtering allows filtering records by a date field:

- `from_date`: Start date in ISO format
- `to_date`: End date in ISO format

This is useful for limiting records to a specific time period.

### Row Selection

Row selection enables operations on multiple rows. It's controlled by:

```typescript
config={{
  enableRowSelection: true, // Enable row selection
  enableClickRowSelect: false // Enable/disable row selection by clicking anywhere in the row
}}
```

Selected rows can be accessed via the `renderToolbarContent` prop:

```typescript
renderToolbarContent={({
  selectedRows,  // Currently visible selected rows
  allSelectedIds, // All selected IDs across pages
  totalSelectedCount, // Total number of selected items
  resetSelection  // Function to reset selection
}) => (
  <ToolbarOptions
    selectedEntities={selectedRows}
    allSelectedIds={allSelectedIds}
    totalSelectedCount={totalSelectedCount}
    resetSelection={resetSelection}
  />
)}
```

### Toolbar Customization

The toolbar area can be customized with your own components:

```typescript
// src/app/(section)/entity-table/components/toolbar-options.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { AddEntityPopup } from "./actions/add-entity-popup";
import { BulkDeletePopup } from "./actions/bulk-delete-popup";

interface ToolbarOptionsProps {
  selectedEntities: { id: number; name: string }[];
  allSelectedIds?: number[];
  totalSelectedCount: number;
  resetSelection: () => void;
}

export const ToolbarOptions = ({
  selectedEntities,
  allSelectedIds = [],
  totalSelectedCount,
  resetSelection,
}: ToolbarOptionsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-2">
      <AddEntityPopup />

      {totalSelectedCount > 0 && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete ({totalSelectedCount})
          </Button>

          <BulkDeletePopup
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            selectedEntities={selectedEntities}
            allSelectedIds={allSelectedIds}
            totalSelectedCount={totalSelectedCount}
            resetSelection={resetSelection}
          />
        </>
      )}
    </div>
  );
};
```

### Export Options

The data table supports exporting data in various formats. Configure export options:

```typescript
// src/app/(section)/entity-table/utils/config.ts
import { useMemo } from "react";

export function useExportConfig() {
  // Column mapping for export
  const columnMapping = useMemo(() => {
    return {
      id: "ID",
      name: "Name",
      email: "Email",
      created_at: "Created Date",
      // Add other fields
    };
  }, []);

  // Column widths for Excel export
  const columnWidths = useMemo(() => {
    return [
      { wch: 10 }, // ID
      { wch: 20 }, // Name
      { wch: 30 }, // Email
      { wch: 20 }, // Created At
    ];
  }, []);

  // Headers for CSV export
  const headers = useMemo(() => {
    return ["id", "name", "email", "created_at"];
  }, []);

  return {
    columnMapping,
    columnWidths,
    headers,
    entityName: "entities", // Used in filename
  };
}
```

---

## Server Implementation

### API Endpoints

The data table expects the following API endpoints:

#### 1. List endpoint

```
GET /api/entities
```

Parameters:

- `search` (optional): Search term
- `from_date` (optional): Start date filter
- `to_date` (optional): End date filter
- `sort_by` (optional): Column to sort by
- `sort_order` (optional): 'asc' or 'desc'
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

#### 2. Create endpoint

```
POST /api/entities/add
```

Body: Entity data according to schema

#### 3. Delete endpoint

```
DELETE /api/entities/:id
```

Path parameter: `id` - Entity ID

### Request & Response Formats

#### List Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Example Entity",
      "email": "example@example.com",
      "created_at": "2025-01-15T10:30:00Z",
      ...
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_pages": 5,
    "total_items": 48
  }
}
```

#### Create Request Format

```json
{
  "name": "New Entity",
  "email": "new@example.com",
  ...
}
```

#### Create Response Format

```json
{
  "success": true,
  "data": {
    "id": 49,
    "name": "New Entity",
    "email": "new@example.com",
    "created_at": "2025-04-14T06:44:16Z",
    ...
  }
}
```

#### Delete Response Format

```json
{
  "success": true,
  "message": "Entity deleted successfully"
}
```

### Error Handling

All API responses should follow a consistent error format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Optional array with detailed error information
}
```

HTTP status codes should also be appropriate:

- 400: Bad Request (validation errors)
- 404: Not Found
- 409: Conflict (e.g., duplicate entity)
- 500: Internal Server Error

---

## Popups & Modals

The data table uses several modal dialogs for different operations. Here's how to implement them:

### Add Entity Popup

```tsx
// src/app/(section)/entity-table/components/actions/add-entity-popup.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Import API
import { addEntity } from "@/api/entity/add-entity";

// Form schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  // Add other fields
});

type FormValues = z.infer<typeof formSchema>;

export function AddEntityPopup() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      const response = await addEntity(data);

      if (response.success) {
        toast.success("Entity added successfully");
        form.reset();
        setOpen(false);
        router.refresh();
        await queryClient.invalidateQueries({ queryKey: ["entities"] });
      } else {
        toast.error(response.error || "Failed to add entity");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add entity"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Entity</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Entity</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add other form fields */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Entity"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### Delete Entity Popup

```tsx
// src/app/(section)/entity-table/components/actions/delete-entity-popup.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import API
import { deleteEntity } from "@/api/entity/delete-entity";

interface DeleteEntityPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: number;
  entityName: string;
  resetSelection?: () => void;
}

export function DeleteEntityPopup({
  open,
  onOpenChange,
  entityId,
  entityName,
  resetSelection,
}: DeleteEntityPopupProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const response = await deleteEntity(entityId);

      if (response.success) {
        toast.success("Entity deleted successfully");
        onOpenChange(false);

        // Reset the selection state if the function is provided
        if (resetSelection) {
          resetSelection();
        }

        // Refresh data
        router.refresh();
        await queryClient.invalidateQueries({ queryKey: ["entities"] });
      } else {
        toast.error(response.error || "Failed to delete entity");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete entity"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Entity</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {entityName}? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Bulk Delete Popup

```tsx
// src/app/(section)/entity-table/components/actions/bulk-delete-popup.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import API
import { deleteEntity } from "@/api/entity/delete-entity";

interface BulkDeletePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEntities: { id: number; name: string }[];
  allSelectedIds?: number[];
  totalSelectedCount?: number;
  resetSelection: () => void;
}

export function BulkDeletePopup({
  open,
  onOpenChange,
  selectedEntities,
  allSelectedIds,
  totalSelectedCount,
  resetSelection,
}: BulkDeletePopupProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = React.useState(false);

  // Use allSelectedIds if available, otherwise fallback to selectedEntities ids
  const idsToDelete =
    allSelectedIds || selectedEntities.map((entity) => entity.id);

  // Use total count if available, otherwise fallback to visible items count
  const itemCount = totalSelectedCount ?? selectedEntities.length;

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      // Delete entities sequentially
      for (const id of idsToDelete) {
        const response = await deleteEntity(id);
        if (!response.success) {
          throw new Error(`Failed to delete entity ID ${id}`);
        }
      }

      toast.success(
        itemCount === 1
          ? "Entity deleted successfully"
          : `${itemCount} entities deleted successfully`
      );

      onOpenChange(false);
      resetSelection();
      router.refresh();
      await queryClient.invalidateQueries({ queryKey: ["entities"] });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete entities"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getDialogTitle = () => {
    if (itemCount === 1) {
      return "Delete Entity";
    }
    return "Delete Entities";
  };

  const getDialogDescription = () => {
    if (itemCount === 1 && selectedEntities.length === 1) {
      return `Are you sure you want to delete ${selectedEntities[0].name}? This action cannot be undone.`;
    }
    return `Are you sure you want to delete ${itemCount} entities? This action cannot be undone.`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Customization

### Custom Column Rendering

You can customize column rendering with custom cell components:

```typescript
{
  accessorKey: "status",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Status" />
  ),
  cell: ({ row }) => {
    const status = row.getValue("status") as string;

    // Map status to badge variant
    const variant = {
      active: "success",
      inactive: "secondary",
      pending: "warning",
      error: "destructive",
    }[status] || "outline";

    return (
      <div className="flex w-full justify-center">
        <Badge variant={variant}>{status}</Badge>
      </div>
    );
  },
  size: 100,
}
```

### Custom Toolbar Content

Add your own content to the toolbar:

```tsx
renderToolbarContent={({
  selectedRows,
  allSelectedIds,
  totalSelectedCount,
  resetSelection
}) => (
  <div className="flex items-center gap-2">
    <AddEntityPopup />

    {totalSelectedCount > 0 && (
      <>
        {/* Custom bulk action button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkApprove(allSelectedIds)}
        >
          Approve ({totalSelectedCount})
        </Button>

        {/* Default delete button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete ({totalSelectedCount})
        </Button>

        <BulkDeletePopup
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          selectedEntities={selectedRows}
          allSelectedIds={allSelectedIds}
          totalSelectedCount={totalSelectedCount}
          resetSelection={resetSelection}
        />
      </>
    )}
  </div>
)}
```

### Custom Filtering

Add custom filtering controls:

```tsx
// Inside your DataTable component
const renderFilters = () => (
  <div className="flex gap-2">
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="h-8 w-[150px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="inactive">Inactive</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
      </SelectContent>
    </Select>

    {/* Use custom filters in your API call */}
    {statusFilter !== "all" && (
      <Badge variant="outline" className="h-8 px-3 flex items-center gap-1">
        Status: {statusFilter}
        <X
          className="h-3 w-3 cursor-pointer"
          onClick={() => setStatusFilter("all")}
        />
      </Badge>
    )}
  </div>
);
```

### Styling

The data table uses Tailwind CSS for styling. You can customize the appearance:

```tsx
<DataTable
  className="border rounded-lg"
  tableClassName="min-w-full divide-y divide-gray-200"
  headerClassName="bg-gray-50 text-xs uppercase tracking-wider"
  rowClassName="even:bg-gray-50 hover:bg-gray-100"
/>
```

---

## Performance Optimization

### Server-Side Operations

For optimal performance, ensure that all data operations are handled server-side:

- Filtering
- Sorting
- Pagination

This approach ensures that:

1. Only necessary data is transferred
2. The client doesn't need to process large datasets
3. Performance scales with your server capacity

### Data Batching

When fetching individual records (like for selection across pages), use batching:

```typescript
export async function fetchEntitiesByIds(
  entityIds: number[]
): Promise<Entity[]> {
  if (entityIds.length === 0) {
    return [];
  }

  // Use batching to avoid URL length limits
  const BATCH_SIZE = 50;
  const results: Entity[] = [];

  // Process in batches
  for (let i = 0; i < entityIds.length; i += BATCH_SIZE) {
    const batchIds = entityIds.slice(i, i + BATCH_SIZE);

    try {
      const params = new URLSearchParams();
      batchIds.forEach((id) => {
        params.append("id", id.toString());
      });

      const response = await fetch(
        `${API_BASE_URL}/entities?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch entities: ${response.statusText}`);
      }

      const data = await response.json();
      const parsedData = entitiesResponseSchema.parse(data);

      results.push(...parsedData.data);
    } catch (error) {
      console.error(`Error fetching batch of entities:`, error);
    }
  }

  return results;
}
```

### Query Caching

The data table uses React Query for data fetching, which provides:

- Automatic caching
- Background refetching
- Stale data management

To optimize React Query usage:

```typescript
useQuery({
  queryKey: ["entities", ...], // Include all filters in the queryKey
  queryFn: () => fetchEntities({...}),
  placeholderData: keepPreviousData, // Show previous data while loading new data
  staleTime: 30000, // Data is considered fresh for 30 seconds
  refetchOnWindowFocus: false, // Disable refetching when window regains focus
})
```

### Virtualized Rendering

For very large tables, consider adding virtualization:

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

// Inside your component:
const tableContainerRef = React.useRef(null);

const rowVirtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => tableContainerRef.current,
  estimateSize: () => 35, // Approximate row height
  overscan: 10,
});

// Use with your table:
<div ref={tableContainerRef} className="max-h-[500px] overflow-auto">
  <table>
    <thead>{/* ... */}</thead>
    <tbody>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index];
        return (
          <tr
            key={row.id}
            data-index={virtualRow.index}
            style={{
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {/* Render cells */}
          </tr>
        );
      })}
    </tbody>
  </table>
</div>;
```

---

## Best Practices

### 1. State Management

- Use URL state for filters, sorting, and pagination to enable bookmarking and sharing
- Keep complex state in React Query for automatic caching and refetching
- Use local state only for UI-specific state like modal visibility

### 2. Error Handling

- Implement consistent error handling across all API calls
- Use toast notifications for user feedback
- Log errors to the console for debugging
- Include error details in the UI when appropriate

### 3. Loading States

- Show loading indicators for initial load and filtering operations
- Use optimistic updates for better UX during create/update/delete operations
- Keep previous data visible while loading new data

### 4. Accessibility

- Use proper ARIA attributes for interactive elements
- Ensure keyboard navigation works for all table interactions
- Maintain sufficient color contrast for all text
- Make sure all interactive elements have accessible labels

### 5. Form Validation

- Use Zod for consistent validation on both client and server
- Provide clear error messages for validation failures
- Validate form inputs as the user types for immediate feedback
- Debounce validation to avoid excessive processing

### 6. API Design

- Use consistent API response formats across all endpoints
- Include appropriate HTTP status codes
- Validate input on both client and server
- Use pagination for all list endpoints

### 7. Performance

- Only fetch the data you need
- Use pagination for large datasets
- Implement caching for frequently accessed data
- Optimize server queries (use indexes, limit fields, etc.)

### 8. Security

- Validate all user inputs (client and server)
- Implement proper authentication and authorization
- Use HTTPS for all API requests
- Sanitize data before displaying it in the UI

### 9. Code Organization

- Follow the file structure outlined in this documentation
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use consistent naming conventions

### 10. Testing

- Write unit tests for critical components
- Test edge cases (empty states, error states, etc.)
- Consider using integration tests for complete workflows
- Test accessibility with automated tools

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Table data doesn't update after adding or deleting items

**Possible Causes:**

- React Query cache not invalidated
- Missing router.refresh() call

**Solution:**

```typescript
// After successful mutation:
await queryClient.invalidateQueries({ queryKey: ["entities"] });
router.refresh();
```

#### Issue: Form validation errors not displaying

**Possible Causes:**

- Missing FormMessage component
- Incorrect field names in form

**Solution:**

```tsx
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input type="email" {...field} />
      </FormControl>
      <FormMessage /> {/* Make sure to include this */}
    </FormItem>
  )}
/>
```

#### Issue: Row selection not working correctly across pages

**Possible Causes:**

- Missing handleRowDeselection function
- Not tracking selected rows across pages

**Solution:**

```typescript
// In your DataTable component:
const [selectedRowIds, setSelectedRowIds] = React.useState<Record<string, boolean>>({});

// Pass this to the getColumns function:
getColumns={(handleRowDeselection) => columns(handleRowDeselection)}

// Define handleRowDeselection:
const handleRowDeselection = (rowId: string) => {
  setSelectedRowIds((prev) => {
    const newSelected = { ...prev };
    delete newSelected[rowId];
    return newSelected;
  });
};
```

#### Issue: API calls failing with validation errors

**Possible Causes:**

- Schema mismatch between client and server
- Missing required fields
- Format errors (e.g., date format)

**Solution:**

- Compare client and server schemas
- Check API request/response in browser devtools
- Add more detailed error reporting from your API

#### Issue: "TypeError: Cannot read property 'x' of undefined"

**Possible Causes:**

- Trying to access nested properties that may not exist
- Data structure mismatch

**Solution:**
Use optional chaining and nullish coalescing:

```typescript
// Instead of data.user.name (which may fail if user is undefined)
const userName = data?.user?.name ?? "Unknown";

// Or with array access
const firstItem = data?.items?.[0]?.title ?? "No items";
```

---

## Complete API Reference

### DataTable Component Props

| Prop                   | Type                                                                                                                               | Required | Default                 | Description                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------- | -------------------------------------------- |
| `getColumns`           | `(handleRowDeselection?: (rowId: string) => void) => ColumnDef<T>[]`                                                               | Yes      | -                       | Function to get column definitions           |
| `fetchDataFn`          | `(page: number, pageSize: number, search: string, dateRange: DateRange, sortBy: string, sortOrder: string) => QueryObserverResult` | Yes      | -                       | Function to fetch data                       |
| `fetchByIdsFn`         | `(ids: number[]) => Promise<T[]>`                                                                                                  | No       | -                       | Function to fetch entities by IDs            |
| `idField`              | `keyof T`                                                                                                                          | Yes      | -                       | Field to use as unique identifier            |
| `pageSizeOptions`      | `number[]`                                                                                                                         | No       | `[10, 20, 30, 50, 100]` | Available page size options                  |
| `renderToolbarContent` | `(options: ToolbarOptions<T>) => React.ReactNode`                                                                                  | No       | -                       | Function to render custom toolbar content    |
| `exportConfig`         | `ExportConfig`                                                                                                                     | No       | -                       | Configuration for export functionality       |
| `config`               | `DataTableConfig`                                                                                                                  | No       | -                       | Table configuration options                  |
| `className`            | `string`                                                                                                                           | No       | -                       | Additional CSS class for the table container |
| `tableClassName`       | `string`                                                                                                                           | No       | -                       | Additional CSS class for the table element   |

### DataTableConfig Options

| Option                     | Type                        | Default     | Description                              |
| -------------------------- | --------------------------- | ----------- | ---------------------------------------- |
| `enableRowSelection`       | `boolean`                   | `false`     | Enable row selection                     |
| `enableClickRowSelect`     | `boolean`                   | `false`     | Allow clicking on row to select it       |
| `enableKeyboardNavigation` | `boolean`                   | `true`      | Enable keyboard navigation               |
| `enableSearch`             | `boolean`                   | `true`      | Show search input                        |
| `enableDateFilter`         | `boolean`                   | `false`     | Show date range filter                   |
| `enableColumnVisibility`   | `boolean`                   | `true`      | Allow toggling column visibility         |
| `enableUrlState`           | `boolean`                   | `true`      | Save table state in URL                  |
| `columnResizingTableId`    | `string`                    | -           | ID for column resizing persistence       |
| `size`                     | `'sm' \| 'default' \| 'lg'` | `'default'` | Size for buttons and inputs in the table |

The `size` prop affects the following components:

- Pagination buttons
- "Rows per page" select component
- Navigation buttons (First, Previous, Next, Last)
- Toolbar Components

Available sizes:

- `'sm'`: Small size (h-7)
- `'default'`: Default size (h-8 / default)
- `'lg'`: Large size (h-11)

### ExportConfig Options

| Option          | Type                     | Description                       |
| --------------- | ------------------------ | --------------------------------- |
| `columnMapping` | `Record<string, string>` | Maps column keys to display names |
| `columnWidths`  | `{ wch: number }[]`      | Column widths for Excel export    |
| `headers`       | `string[]`               | Column keys to include in export  |
| `entityName`    | `string`                 | Name for export files             |

### ToolbarOptions Interface

| Property             | Type         | Description                               |
| -------------------- | ------------ | ----------------------------------------- |
| `selectedRows`       | `T[]`        | Currently selected rows on current page   |
| `allSelectedIds`     | `number[]`   | IDs of all selected rows across all pages |
| `totalSelectedCount` | `number`     | Total number of selected rows             |
| `resetSelection`     | `() => void` | Function to reset selection               |

---

## Example Implementations

### Basic Example

```tsx
// src/app/(dashboard)/users/page.tsx
import { Suspense } from "react";
import UsersTable from "./users-table";

export default function UsersPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <UsersTable />
      </Suspense>
    </div>
  );
}
```

```tsx
// src/app/(dashboard)/users/users-table/index.tsx
"use client";

import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./components/columns";
import { useExportConfig } from "./utils/config";
import { fetchUsersByIds } from "@/api/user/fetch-users-by-ids";
import { useUsersData } from "./utils/data-fetching";
import { ToolbarOptions } from "./components/toolbar-options";
import { User } from "./schema";

export default function UsersTable() {
  return (
    <DataTable<User, any>
      getColumns={getColumns}
      exportConfig={useExportConfig()}
      fetchDataFn={useUsersData}
      fetchByIdsFn={fetchUsersByIds}
      idField="id"
      pageSizeOptions={[10, 20, 50, 100]}
      renderToolbarContent={({
        selectedRows,
        allSelectedIds,
        totalSelectedCount,
        resetSelection,
      }) => (
        <ToolbarOptions
          selectedUsers={selectedRows.map((row) => ({
            id: row.id,
            name: row.name,
          }))}
          allSelectedIds={allSelectedIds}
          totalSelectedCount={totalSelectedCount}
          resetSelection={resetSelection}
        />
      )}
      config={{
        enableRowSelection: true,
        enableSearch: true,
        enableDateFilter: true,
        enableColumnVisibility: true,
        enableUrlState: true,
      }}
    />
  );
}
```

### Complex Example with Custom Filters

```tsx
// src/app/(dashboard)/orders/orders-table/index.tsx
"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./components/columns";
import { useExportConfig } from "./utils/config";
import { fetchOrdersByIds } from "@/api/order/fetch-orders-by-ids";
import { useOrdersData } from "./utils/data-fetching";
import { ToolbarOptions } from "./components/toolbar-options";
import { Order, OrderStatus } from "./schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function OrdersTable() {
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "all">(
    "all"
  );

  // Custom function that extends the base query to add the status filter
  const fetchOrdersWithStatus = React.useCallback(
    (
      page: number,
      pageSize: number,
      search: string,
      dateRange: any,
      sortBy: string,
      sortOrder: string
    ) => {
      return useOrdersData(
        page,
        pageSize,
        search,
        dateRange,
        sortBy,
        sortOrder,
        statusFilter === "all" ? undefined : statusFilter
      );
    },
    [statusFilter]
  );

  // Set isQueryHook property to true to match the DataTable expectations
  fetchOrdersWithStatus.isQueryHook = true;

  // Custom filters to render in the toolbar
  const renderCustomFilters = () => (
    <div className="flex items-center gap-2">
      <Select
        value={statusFilter}
        onValueChange={(value: OrderStatus | "all") => setStatusFilter(value)}
      >
        <SelectTrigger className="h-8 w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {statusFilter !== "all" && (
        <Badge variant="outline" className="h-8 px-3 flex items-center gap-1">
          Status: {statusFilter}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => setStatusFilter("all")}
          />
        </Badge>
      )}
    </div>
  );

  return (
    <DataTable<Order, any>
      getColumns={getColumns}
      exportConfig={useExportConfig()}
      fetchDataFn={fetchOrdersWithStatus}
      fetchByIdsFn={fetchOrdersByIds}
      idField="id"
      pageSizeOptions={[10, 20, 50, 100]}
      renderToolbarContent={({
        selectedRows,
        allSelectedIds,
        totalSelectedCount,
        resetSelection,
      }) => (
        <div className="flex items-center justify-between w-full">
          <div>{renderCustomFilters()}</div>
          <ToolbarOptions
            selectedOrders={selectedRows.map((row) => ({
              id: row.id,
              reference: row.reference,
            }))}
            allSelectedIds={allSelectedIds}
            totalSelectedCount={totalSelectedCount}
            resetSelection={resetSelection}
          />
        </div>
      )}
      config={{
        enableRowSelection: true,
        enableSearch: true,
        enableDateFilter: true,
        enableColumnVisibility: true,
        enableUrlState: true,
      }}
    />
  );
}
```

By following this documentation and the provided examples, you should now have a complete understanding of how to implement and customize the data table component for your specific needs. The component is designed to be highly flexible while maintaining performance and accessibility.
