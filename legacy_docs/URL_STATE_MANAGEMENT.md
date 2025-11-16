# URL State Management Implementation

## Overview

We've implemented URL state management for the data table using a custom `useUrlState` hook that leverages Next.js App Router's built-in search params utilities. This enables the table's state (pagination, sorting, filtering, etc.) to be persisted in the URL, which provides several benefits:

1. **Shareable URLs**: Users can share links that preserve their exact view of the data
2. **Browser history support**: Forward/back navigation works with table state changes
3. **Bookmarkable states**: Users can bookmark specific filtered views
4. **SEO benefits**: Search engines can index specific data views
5. **Type safety**: Our custom hook provides full TypeScript support

## Implemented URL Parameters

The following table states are now managed through URL parameters:

- **page**: Current page number (default: 1)
- **pageSize**: Number of rows per page (default: 10)
- **search**: Global search query
- **sortBy**: Column being sorted
- **sortOrder**: Sort direction ("asc" or "desc")
- **dateRange**: Date filter with from/to dates
- **columnVisibility**: Which columns are visible/hidden
- **columnFilters**: Active column-specific filters

## Components Updated

1. **DataTable**: Core component that uses `useUrlState` hooks for all state parameters
2. **DataTableToolbar**: Updated to work with the URL state for search and date filters
3. **DataTablePagination**: Updated to work with pagination URL state
4. **DataTableViewOptions**: Updated to work with column visibility URL state

## Implementation Details

### Custom URL State Hook

We created a custom hook `useUrlState` that:
- Takes a parameter key, default value, and optional serialization options
- Automatically serializes/deserializes complex objects to/from the URL
- Updates the URL when state changes
- Updates local state when the URL changes

Example:
```typescript
const [page, setPage] = useUrlState("page", 1);
const [dateRange, setDateRange] = useUrlState<{ from_date: string; to_date: string }>(
  "dateRange", 
  { from_date: "", to_date: "" }
);
```

### State Management

All table state is now managed through our `useUrlState` hook:

```typescript
const [page, setPage] = useUrlState("page", 1);
const [pageSize, setPageSize] = useUrlState("pageSize", 10);
// etc.
```

### Auto Serialization

The hook automatically handles serialization based on the type of data:
- Numbers are parsed from strings
- Booleans are converted to/from "true"/"false" strings
- Objects and arrays are JSON-serialized/deserialized

## Benefits

1. **Persistent State**: Table state persists across page refreshes and navigation
2. **Better User Experience**: Users can share exact data views and use browser history
3. **Simplified State Management**: State logic is centralized and managed through the URL
4. **No Dependencies**: No external libraries needed, just Next.js built-in utilities
5. **Type Safety**: Full TypeScript support with generics

## Usage Examples

Example URLs with state:
- `/users?page=2&pageSize=20&sortBy=name&sortOrder=asc`
- `/users?search=john&dateRange={"from_date":"2023-01-01","to_date":"2023-12-31"}`
- `/users?columnVisibility={"id":false,"email":true,"phone":false}`

## Future Improvements

1. Add debouncing for frequently changing values to reduce URL updates
2. Implement URL state for row selection when appropriate
3. Consider compression for complex state objects
4. Add middleware to clean up URL parameters when they match defaults 