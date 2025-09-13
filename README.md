# Advanced Data Table Component Documentation

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/jacksonkasi1/tnks-data-table)

**Version:** 0.3.0
**Updated:** 2025-01-15
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
   - [Default Sort Configuration](#default-sort-configuration)
   - [Row Actions](#row-actions)
   - [Filtering & Sorting](#filtering--sorting)
   - [Pagination](#pagination)
   - [Date Range Filtering](#date-range-filtering)
   - [Row Selection](#row-selection)
   - [Row Click Handling](#row-click-handling)
   - [Toolbar Customization](#toolbar-customization)
   - [Export Options](#export-options)
   - [Case Format Support](#case-format-support)
   - [Export Data Transformation](#export-data-transformation)
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
- ✅ Row click callbacks for navigation
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
- ✅ Data export (CSV/Excel) with custom formatting
- ✅ Export data transformation and new calculated columns

### Integration

- ✅ React Query data fetching
- ✅ Zod validation
- ✅ Form handling with React Hook Form
- ✅ Toast notifications
- ✅ URL state persistence
- ✅ Case format conversion (snake_case ↔ camelCase)
- ✅ Flexible API parameter mapping

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

- **Next.js 15+** with App Router
- **React 19+**
- **TypeScript 5+**
- **Tailwind CSS**
- **Shadcn UI components**

### Installation Steps

#### 1. Install Required Dependencies

Install all required packages for the data table to work properly:

```bash
# Core dependencies for data table functionality
npm install @tanstack/react-table @tanstack/react-query @hookform/resolvers react-hook-form zod sonner date-fns date-fns-tz xlsx class-variance-authority clsx tailwind-merge lucide-react

# Radix UI components (required for Shadcn UI)
npm install @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-icons @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot

# Additional UI dependencies
npm install react-day-picker cmdk

# TypeScript types for XLSX
npm install @types/xlsx

# Optional: Development dependencies for better linting
npm install --save-dev @tanstack/eslint-plugin-query
```

Or with other package managers:

```bash
# Using Yarn
yarn add @tanstack/react-table @tanstack/react-query @hookform/resolvers react-hook-form zod sonner date-fns date-fns-tz xlsx class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-icons @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot react-day-picker cmdk @types/xlsx

# Using pnpm
pnpm add @tanstack/react-table @tanstack/react-query @hookform/resolvers react-hook-form zod sonner date-fns date-fns-tz xlsx class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-icons @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot react-day-picker cmdk @types/xlsx

# Using Bun
bun add @tanstack/react-table @tanstack/react-query @hookform/resolvers react-hook-form zod sonner date-fns date-fns-tz xlsx class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-icons @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot react-day-picker cmdk @types/xlsx
```

#### 2. Set Up Utility Functions

Create the utility function file:

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### 3. Copy Required UI Components

You need to have the following Shadcn UI components in your `src/components/ui/` directory:

**Required UI Components:**
- `alert.tsx` - For error states
- `avatar.tsx` - For user avatars (optional)
- `badge.tsx` - For status indicators
- `button.tsx` - For buttons and actions
- `calendar.tsx` - For date picker
- `checkbox.tsx` - For row selection
- `command.tsx` - For command palette functionality
- `dialog.tsx` - For modal dialogs
- `dropdown-menu.tsx` - For action menus
- `form.tsx` - For form handling
- `input.tsx` - For text inputs
- `label.tsx` - For form labels
- `popover.tsx` - For popover components
- `select.tsx` - For select dropdowns
- `separator.tsx` - For visual separators
- `skeleton.tsx` - For loading states
- `sonner.tsx` - For toast notifications
- `table.tsx` - For table structure

You can install these using Shadcn CLI:

```bash
# Install Shadcn UI CLI
npx shadcn-ui@latest init

# Add required components
npx shadcn-ui@latest add alert avatar badge button calendar checkbox command dialog dropdown-menu form input label popover select separator skeleton sonner table
```

#### 4. Copy Custom Components

Create these custom components in your project:

**A. Calendar Date Picker Component**

```typescript
// src/components/calendar-date-picker.tsx
// Copy from: src/components/calendar-date-picker.tsx in this repository
```

**B. Data Table Core Components**

Create `/src/components/data-table/` directory and copy these files:

```bash
src/components/data-table/
├── column-header.tsx           # Sortable column headers
├── data-export.tsx            # Export functionality UI
├── data-table-resizer.tsx     # Column resize handler
├── data-table.tsx             # Main data table component
├── pagination.tsx             # Pagination controls
├── toolbar.tsx                # Table toolbar with filters
├── view-options.tsx           # Column visibility options
├── hooks/
│   └── use-table-column-resize.ts  # Column resize hook
└── utils/
    ├── case-utils.ts          # Case format conversion utilities
    ├── column-sizing.ts       # Column sizing utilities
    ├── conditional-state.ts   # Conditional state management
    ├── date-format.ts         # Date formatting utilities
    ├── deep-utils.ts          # Deep object utilities
    ├── export-utils.ts        # Export functionality
    ├── index.ts               # Utility exports
    ├── keyboard-navigation.ts # Keyboard navigation
    ├── search.ts              # Search utilities
    ├── table-config.ts        # Table configuration
    ├── table-state-handlers.ts # State handlers
    └── url-state.ts           # URL state management
```

**C. Format Utilities**

```typescript
// src/utils/format.ts
// Copy from: src/utils/format.ts in this repository
```

#### 5. Set up React Query Provider

Wrap your app with React Query provider:

```typescript
// src/app/layout.tsx or your root layout
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: false,
      },
    },
  }));

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

#### 6. Configure Toast Notifications

Add the Sonner toaster to your layout:

```typescript
// src/app/layout.tsx
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

#### 7. Set Up API Layer

Create your API directory structure:

```bash
src/api/
└── [entity]/
    ├── add-entity.ts           # Create operations
    ├── delete-entity.ts        # Delete operations
    ├── fetch-entities.ts       # List with filtering
    └── fetch-entities-by-ids.ts # Bulk fetch by IDs
```

#### 8. Create Your First Data Table

Follow the [Basic Usage](#basic-usage) section to create your first data table implementation.

### Package Overview

Here's what each major dependency does:

| Package | Purpose |
|---------|---------|
| `@tanstack/react-table` | Core table functionality, sorting, filtering |
| `@tanstack/react-query` | Data fetching, caching, and synchronization |
| `@hookform/resolvers` | Form validation integration |
| `react-hook-form` | Form state management |
| `zod` | Runtime type validation and schemas |
| `sonner` | Toast notifications |
| `date-fns` | Date manipulation and formatting |
| `date-fns-tz` | Timezone support for dates |
| `xlsx` | Excel export functionality |
| `class-variance-authority` | Utility for managing CSS classes |
| `clsx` & `tailwind-merge` | CSS class utilities |
| `lucide-react` | Icon library |
| `react-day-picker` | Date picker component |
| `cmdk` | Command palette functionality |
| `@radix-ui/*` | Headless UI components (used by Shadcn) |

### Troubleshooting Installation

**Common Issues:**

1. **TypeScript errors**: Make sure all `@types/*` packages are installed
2. **Missing icons**: Ensure `lucide-react` is properly installed
3. **Style issues**: Verify Tailwind CSS is configured correctly
4. **Export functionality not working**: Check that `xlsx` and `@types/xlsx` are installed

**Version Compatibility:**
- This data table is built for Next.js 15+ and React 19+
- For older versions, you may need to adjust some dependencies
- All Radix UI components should be on their latest versions for best compatibility

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

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./components/columns";
import { useExportConfig } from "./utils/config";
import { fetchEntitiesByIds } from "@/api/entity/fetch-entities-by-ids";
import { useEntitiesData } from "./utils/data-fetching";
import { ToolbarOptions } from "./components/toolbar-options";
import { Entity } from "./schema";

export default function EntityTable() {
  const router = useRouter();

  // Handle row clicks for navigation
  const handleRowClick = (entity: Entity, rowIndex: number) => {
    router.push(`/entities/${entity.id}`);
  };

  return (
    <DataTable<Entity, any>
      getColumns={getColumns}
      exportConfig={useExportConfig()}
      fetchDataFn={useEntitiesData}
      fetchByIdsFn={fetchEntitiesByIds}
      idField="id"
      pageSizeOptions={[10, 20, 50, 100]}
      onRowClick={handleRowClick}
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

### Default Sort Configuration

Configure the default sorting behavior for your data table using the `defaultSortBy` and `defaultSortOrder` options in the table configuration.

#### Key Principles

- **Match Your API Response**: Use the exact field name as it appears in your API response
- **Case Consistency**: If your API returns `snake_case`, use `snake_case`. If it returns `camelCase`, use `camelCase`
- **Column Alignment**: The `defaultSortBy` value should match an `accessorKey` in your column definitions

#### Basic Configuration

```typescript
<DataTable
  // ... other props
  config={{
    defaultSortBy: "created_at",    // Default sort column
    defaultSortOrder: "desc",       // Default sort direction
    // ... other config options
  }}
/>
```

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultSortBy` | `string \| undefined` | `undefined` | Column to sort by on initial load. Must match a column's `accessorKey` |
| `defaultSortOrder` | `'asc' \| 'desc'` | `'desc'` | Sort direction on initial load |

#### Examples

**Snake_case API (Traditional REST API)**:
```typescript
// API Response: { id: 1, user_name: "John", created_at: "2023-01-01" }
// Column Definition: accessorKey: "created_at"

config={{
  defaultSortBy: "created_at",      // ✅ Matches API response field
  defaultSortOrder: "desc",
  // ... other options
}}
```

**CamelCase API (Modern JSON API)**:
```typescript
// API Response: { id: 1, userName: "John", createdAt: "2023-01-01" }
// Column Definition: accessorKey: "createdAt"

config={{
  defaultSortBy: "createdAt",       // ✅ Matches API response field
  defaultSortOrder: "desc",
  // ... other options
}}
```

**Custom Sort Options**:
```typescript
config={{
  defaultSortBy: "priority",        // Sort by priority column
  defaultSortOrder: "asc",         // Ascending order (lowest first)
  // ... other options
}}
```

#### Important Notes

- **No Fallback**: If `defaultSortBy` is not provided, it defaults to `"id"`
- **Column Match Required**: The `defaultSortBy` value must exist as an `accessorKey` in your column definitions
- **API Consistency**: The sort parameter sent to your API will use the same case format as `defaultSortBy`
- **URL State**: The default sort is applied only on initial load. User interactions are saved in URL state

#### Common Patterns

**Date-based Sorting (Most Common)**:
```typescript
// Show newest records first
defaultSortBy: "created_at",        // or "createdAt" for camelCase
defaultSortOrder: "desc"
```

**Priority-based Sorting**:
```typescript
// Show high priority items first
defaultSortBy: "priority",
defaultSortOrder: "desc"
```

**Name-based Sorting**:
```typescript
// Alphabetical ordering
defaultSortBy: "name",
defaultSortOrder: "asc"
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

The data table supports server-side filtering and sorting with automatic case format consistency.

#### API Parameters

Your API will receive the following parameters (case format matches your column definitions):

- `search`: Text search term
- `sortBy` or `sort_by`: Column to sort by (matches your `accessorKey` case format)
- `sortOrder` or `sort_order`: Sort direction (`"asc"` or `"desc"`)

#### Case Format Behavior

The data table automatically uses the same case format as your column definitions:

**Snake_case Example**:
```typescript
// Column Definition
{ accessorKey: "created_at" }

// API Request Parameters
{
  "search": "john",
  "sort_by": "created_at",      // ✅ Matches column case
  "sort_order": "desc",
  "page": 1,
  "limit": 10
}
```

**CamelCase Example**:
```typescript
// Column Definition
{ accessorKey: "createdAt" }

// API Request Parameters
{
  "search": "john",
  "sortBy": "createdAt",        // ✅ Matches column case
  "sortOrder": "desc",
  "page": 1,
  "limit": 10
}
```

#### Key Points

- **No Conversion**: The data table uses your API response directly without any case transformations
- **Consistent Format**: All API parameters follow the same case format as your column `accessorKey` values
- **Export Consistency**: Data export preserves the same field names and case format as your API

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

### Row Click Handling

The data table supports custom row click callbacks that allow you to handle user interactions when they click on table rows. This feature is perfect for navigation, opening detail modals, or triggering custom actions.

#### Basic Usage

Add the `onRowClick` prop to your DataTable component:

```typescript
<DataTable<Entity, any>
  getColumns={getColumns}
  exportConfig={useExportConfig()}
  fetchDataFn={useEntitiesData}
  fetchByIdsFn={fetchEntitiesByIds}
  idField="id"
  onRowClick={(rowData, rowIndex) => {
    console.log('Clicked row:', rowData);
    console.log('Row index:', rowIndex);
  }}
  config={{
    enableRowSelection: true,
    enableSearch: true,
    enableDateFilter: true,
  }}
/>
```

#### TypeScript Support

The `onRowClick` callback is fully typed with your data type:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// The callback receives typed data
onRowClick={(user: User, rowIndex: number) => {
  // `user` is fully typed as User interface
  console.log(`Clicked on ${user.name} at row ${rowIndex}`);
}}
```

#### Navigation Example

Use row clicks for navigation to detail pages:

```typescript
import { useRouter } from 'next/navigation';

function UsersTable() {
  const router = useRouter();

  const handleRowClick = (user: User, rowIndex: number) => {
    // Navigate to user detail page
    router.push(`/users/${user.id}`);
  };

  return (
    <DataTable<User, any>
      // ... other props
      onRowClick={handleRowClick}
    />
  );
}
```

#### Modal/Dialog Example

Open modals or dialogs when rows are clicked:

```typescript
function UsersTable() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (user: User, rowIndex: number) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <>
      <DataTable<User, any>
        // ... other props
        onRowClick={handleRowClick}
      />
      
      <UserDetailModal
        user={selectedUser}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
```

#### Conflict Prevention

The row click handler automatically prevents conflicts with interactive elements:

- **Action buttons**: Clicks on row action buttons won't trigger row clicks
- **Links**: Clicks on links within cells won't trigger row clicks  
- **Form inputs**: Clicks on checkboxes, inputs, selects won't trigger row clicks
- **Custom interactive elements**: Elements with `[role="button"]` or `[role="link"]` are automatically excluded

```typescript
// This row click will NOT trigger when clicking on:
// - The actions dropdown button
// - Selection checkboxes
// - Any links in the row
// - Any buttons in the row
onRowClick={(rowData, rowIndex) => {
  console.log('Safe row click - no conflicts!');
}}
```

#### Accessibility Support

Row clicks work seamlessly with keyboard navigation:

- **Enter key**: Pressing Enter on a focused row triggers the `onRowClick` callback
- **Space key**: Reserved for row selection (if enabled)
- **Focus management**: Proper focus indicators and screen reader support

```typescript
// This callback will be triggered by both:
// 1. Mouse clicks on the row
// 2. Pressing Enter when the row is focused
onRowClick={(rowData, rowIndex) => {
  // Handle both mouse and keyboard interactions
  handleUserAction(rowData);
}}
```

#### Visual Feedback

When `onRowClick` is provided, rows automatically receive visual feedback:

- **Cursor pointer**: Rows show a pointer cursor on hover
- **Hover effects**: Built-in hover states indicate clickable rows
- **Focus states**: Keyboard focus is clearly visible

#### Best Practices

1. **Keep callbacks fast**: Row click handlers should be lightweight to maintain responsiveness
2. **Use with row selection**: Row clicks work alongside row selection without conflicts
3. **Provide visual cues**: The automatic pointer cursor helps users understand rows are clickable
4. **Consider mobile**: Row clicks work well on touch devices
5. **Accessibility first**: Always test with keyboard navigation

#### Complete Example

```typescript
// src/app/(section)/users/users-table/index.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { User } from "./schema";
import { UserDetailModal } from "./components/user-detail-modal";

export default function UsersTable() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle row clicks with conditional logic
  const handleRowClick = (user: User, rowIndex: number) => {
    // Option 1: Navigate to detail page
    if (user.role === 'admin') {
      router.push(`/admin/users/${user.id}`);
      return;
    }

    // Option 2: Open modal for regular users
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <>
      <DataTable<User, any>
        getColumns={getColumns}
        exportConfig={useExportConfig()}
        fetchDataFn={useUsersData}
        fetchByIdsFn={fetchUsersByIds}
        idField="id"
        onRowClick={handleRowClick}
        renderToolbarContent={({ selectedRows, allSelectedIds, totalSelectedCount, resetSelection }) => (
          <ToolbarOptions
            selectedUsers={selectedRows}
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

      <UserDetailModal
        user={selectedUser}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
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

### Search Customization

The data table search input supports custom placeholder text to provide better context for users:

#### Custom Search Placeholder

You can customize the search input placeholder text by providing the `searchPlaceholder` option in your table configuration:

```typescript
// Basic usage with custom placeholder
<DataTable<Entity, any>
  getColumns={getColumns}
  exportConfig={useExportConfig()}
  fetchDataFn={useEntitiesData}
  fetchByIdsFn={fetchEntitiesByIds}
  idField="id"
  config={{
    enableRowSelection: true,
    enableSearch: true,
    searchPlaceholder: "Search by name, email, or ID...", // Custom placeholder
    enableDateFilter: true,
    enableColumnVisibility: true,
    enableUrlState: true,
  }}
/>
```

#### Default Behavior

If no custom placeholder is provided, the search input will use the default format: `"Search {entityName}..."` where `entityName` is taken from your export configuration.

#### Examples of Custom Placeholders

```typescript
// For different types of data tables
config={{
  searchPlaceholder: "Search users by name or email...",
}}

config={{
  searchPlaceholder: "Find orders by ID, customer, or status...",
}}

config={{
  searchPlaceholder: "Search products by name, SKU, or category...",
}}

config={{
  searchPlaceholder: "Type to filter results...", // Simple placeholder
}}
```

This feature helps provide more context to users about what fields they can search on and what format their search should take.

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

### Case Format Support

The data table supports both `snake_case` and `camelCase` APIs with a simple, direct approach - **no conversion needed**.

#### How It Works

The data table uses your API response exactly as-is, without any case transformations:

1. **Column Definition**: Use `accessorKey` to match your API response fields exactly
2. **API Requests**: Sort and filter parameters use the same case format as your columns
3. **Data Display**: API response data is displayed directly without conversion
4. **Data Export**: Exported files preserve the same field names as your API

#### Snake_case API Example

```typescript
// API Response
{
  "data": [
    {
      "id": 1,
      "user_name": "John Doe",
      "created_at": "2023-01-01T10:00:00Z",
      "total_expenses": "1234.56"
    }
  ]
}

// Column Definitions (matches API exactly)
{
  accessorKey: "user_name",      // ✅ Matches API field
  header: "Name"
}
{
  accessorKey: "created_at",     // ✅ Matches API field
  header: "Created"
}

// Table Configuration
config={{
  defaultSortBy: "created_at",   // ✅ Matches API field
  // ... other options
}}
```

#### CamelCase API Example

```typescript
// API Response
{
  "data": [
    {
      "id": 1,
      "userName": "John Doe",
      "createdAt": "2023-01-01T10:00:00Z",
      "totalExpenses": "1234.56"
    }
  ]
}

// Column Definitions (matches API exactly)
{
  accessorKey: "userName",       // ✅ Matches API field
  header: "Name"
}
{
  accessorKey: "createdAt",      // ✅ Matches API field
  header: "Created"
}

// Table Configuration
config={{
  defaultSortBy: "createdAt",    // ✅ Matches API field
  // ... other options
}}
```

#### Key Benefits

- **✅ No Conversion Logic**: Eliminates complex case transformation code
- **✅ Direct Integration**: API responses work immediately without modification
- **✅ Consistent Exports**: CSV/Excel exports use the same field names as your API
- **✅ Simple Debugging**: What you see in the API is exactly what's used in the table
- **✅ Performance**: No overhead from case conversion operations

#### Best Practices

1. **Match Your API**: Always use `accessorKey` values that exactly match your API response
2. **Stay Consistent**: Pick one case format (snake_case OR camelCase) and use it throughout your API
3. **Column Headers**: Use human-readable `header` values regardless of API case format
4. **Default Sort**: Set `defaultSortBy` to match one of your column `accessorKey` values

#### Migration from Complex Case Systems

If you're coming from a system with case conversions:

```typescript
// ❌ Old Complex Way (don't do this)
{
  accessorKey: "userName",           // camelCase column
  apiField: "user_name",            // snake_case API
  needsConversion: true
}

// ✅ New Simple Way (recommended)
{
  accessorKey: "user_name"          // Matches API exactly
  header: "User Name"               // Human readable display
}
```

### Export Data Transformation

The data table now supports powerful export customization that allows you to:

- **Format existing data** (timestamps, currency, phone numbers)
- **Add completely new calculated columns** that don't exist in your original data
- **Apply business logic** during export without affecting table display

#### Basic Data Formatting

```typescript
import { DataTransformFunction } from "@/components/data-table/utils/export-utils";
import { formatTimestampToReadable, formatCurrency } from "@/utils/format";

const transformFunction: DataTransformFunction<User> = (row: User) => ({
  ...row,
  // Format existing columns
  created_at: formatTimestampToReadable(row.created_at), // "01/15/2023 10:30 AM"
  total_expenses: formatCurrency(row.total_expenses),    // "$1,234.56"
  phone: formatPhoneNumber(row.phone),                   // "(123) 456-7890"
});
```

#### Adding New Calculated Columns

Add completely new columns with business logic:

```typescript
const enhancedTransform: DataTransformFunction<User> = (row: User) => {
  const expenseAmount = parseFloat(row.total_expenses) || 0;
  const currentYear = new Date().getFullYear();
  const joinYear = new Date(row.created_at).getFullYear();
  
  return {
    ...row,
    // Format existing data
    created_at: formatTimestampToReadable(row.created_at),
    total_expenses: formatCurrency(row.total_expenses),
    
    // Add NEW calculated columns
    account_status: row.expense_count > 10 ? "ACTIVE" : "INACTIVE",
    customer_tier: expenseAmount > 2000 ? "PREMIUM" : 
                   expenseAmount > 1000 ? "GOLD" : 
                   expenseAmount > 500 ? "SILVER" : "BRONZE",
    years_as_customer: currentYear - joinYear,
    spending_category: expenseAmount > 1000 ? "HIGH_SPENDER" : 
                      expenseAmount > 500 ? "MEDIUM_SPENDER" : "LOW_SPENDER",
    risk_score: row.expense_count < 2 ? "HIGH_RISK" : "LOW_RISK"
  };
};
```

#### Complete Export Configuration

Include new columns in your export configuration:

```typescript
export function useExportConfig() {
  return {
    // Include both original and new columns
    headers: [
      // Original columns
      "id", "name", "email", "phone", "age", "created_at", "expense_count", "total_expenses",
      // NEW calculated columns
      "account_status", "customer_tier", "years_as_customer", "spending_category", "risk_score"
    ],
    
    // Map all columns to readable headers
    columnMapping: {
      // Original columns
      id: "Customer ID",
      name: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      age: "Age",
      created_at: "Join Date",
      expense_count: "Total Transactions",
      total_expenses: "Total Spending",
      // NEW column headers
      account_status: "Account Status",
      customer_tier: "Customer Tier",
      years_as_customer: "Years as Customer",
      spending_category: "Spending Category",
      risk_score: "Risk Assessment"
    },
    
    // Apply transformation function
    transformFunction: enhancedTransform,
    entityName: "users"
  };
}
```

#### Export Result

Your exports will now include additional calculated columns:

```
Customer ID | Full Name | Email | Phone | Age | Join Date | Total Transactions | Total Spending | Account Status | Customer Tier | Years as Customer | Spending Category | Risk Assessment
1 | John Doe | john@example.com | (555) 123-4567 | 32 | 15/01/2023 10:30 AM | 15 | $2,450.75 | ACTIVE | PREMIUM | 1 | HIGH_SPENDER | LOW_RISK
```

#### Available Formatting Functions

The system includes comprehensive formatting utilities:

- `formatTimestampToReadable()` - ISO dates to readable format
- `formatCurrency()` - Number to currency format
- `formatPhoneNumber()` - Phone number formatting
- `formatToTitleCase()` - Text capitalization
- `formatBoolean()` - Boolean to Yes/No
- `formatNumber()` - Number with thousand separators
- `formatTruncatedText()` - Text truncation with ellipsis

For complete documentation and examples, see [Export Customization Guide](./docs/EXPORT_CUSTOMIZATION.md).

#### Controlling Export Column Behavior

The `allowExportNewColumns` configuration option gives you fine-grained control over which columns are included in exports:

**When `allowExportNewColumns: true` (default):**
- ✅ Exports visible table columns
- ❌ Excludes hidden table columns (always)
- ✅ Includes new columns created by transform function

**When `allowExportNewColumns: false`:**
- ✅ Exports visible table columns only
- ❌ Excludes hidden table columns (always)
- ❌ Excludes new columns from transform function

```typescript
// Example: Only export what user can see in the table
config={{
  allowExportNewColumns: false, // Strict mode - visible columns only
  enableColumnVisibility: true, // Allow users to hide/show columns
}}

// Example: Include calculated columns in export (default)
config={{
  allowExportNewColumns: true, // Include transform function columns
  enableColumnVisibility: true,
}}
```

**Use Cases:**

- **Strict Mode (`false`)**: When you want exports to match exactly what users see in the table
- **Enhanced Mode (`true`)**: When you want to provide additional calculated data in exports that doesn't need to be displayed in the table UI

**Note:** Hidden columns are always excluded from exports regardless of this setting. This option only controls whether new columns from the transform function are included.

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
| `onRowClick`           | `(rowData: T, rowIndex: number) => void`                                                                                          | No       | -                       | Callback function when a row is clicked      |
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
| `searchPlaceholder`        | `string`                    | -           | Custom placeholder text for search input |
| `allowExportNewColumns`    | `boolean`                   | `true`      | Allow exporting new columns from transform function |
| `defaultSortBy`            | `string`                    | -           | Default sort column (must match column accessorKey) |
| `defaultSortOrder`         | `'asc' \| 'desc'`           | `'desc'`    | Default sort direction                   |
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

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./components/columns";
import { useExportConfig } from "./utils/config";
import { fetchUsersByIds } from "@/api/user/fetch-users-by-ids";
import { useUsersData } from "./utils/data-fetching";
import { ToolbarOptions } from "./components/toolbar-options";
import { User } from "./schema";

export default function UsersTable() {
  const router = useRouter();

  // Handle row clicks to navigate to user detail page
  const handleRowClick = (user: User, rowIndex: number) => {
    router.push(`/users/${user.id}`);
  };

  return (
    <DataTable<User, any>
      getColumns={getColumns}
      exportConfig={useExportConfig()}
      fetchDataFn={useUsersData}
      fetchByIdsFn={fetchUsersByIds}
      idField="id"
      pageSizeOptions={[10, 20, 50, 100]}
      onRowClick={handleRowClick}
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
