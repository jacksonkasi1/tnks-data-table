# Case Format Configuration Guide

The DataTable component now supports customizable case formatting for table keys, addressing the need for flexible integration with different backend systems.

## Problem Solved

Previously, the table component only supported **snake_case** formatting for keys, which caused integration issues when working with APIs or backends expecting **camelCase** or other formats. This led to data mismatches and errors when interfacing with different naming conventions.

## Features

### 1. Built-in Case Formats

- **snake_case**: `sort_by`, `page_size`, `created_at`
- **camelCase**: `sortBy`, `pageSize`, `createdAt`
- **PascalCase**: `SortBy`, `PageSize`, `CreatedAt`
- **kebab-case**: `sort-by`, `page-size`, `created-at`

### 2. Custom Key Mapping

Define your own parameter name mappings for APIs with non-standard conventions.

### 3. Separate URL and API Formats

Configure different formats for URL parameters and API requests independently.

## Configuration

### Basic Usage

```typescript
import { CaseFormatConfig } from "@/components/data-table/utils/case-utils";

// Example 1: Full camelCase
const camelCaseConfig: CaseFormatConfig = {
  urlFormat: 'camelCase',  // URL: ?sortBy=name&pageSize=10
  apiFormat: 'camelCase',  // API: sortBy=name&pageSize=10
};

// Example 2: Mixed formats (default)
const mixedConfig: CaseFormatConfig = {
  urlFormat: 'camelCase',  // URL: ?sortBy=name&pageSize=10
  apiFormat: 'snake_case', // API: sort_by=name&page_size=10
};
```

### Custom Key Mapping

```typescript
const customConfig: CaseFormatConfig = {
  keyMapper: (key: string) => {
    const mappings: Record<string, string> = {
      'sortBy': 'orderBy',
      'sortOrder': 'direction',
      'pageSize': 'limit',
      'page': 'offset',
      'search': 'query',
    };
    return mappings[key] || key;
  }
};
```

### Integration with DataTable

```typescript
// In your table configuration file
export function useTableConfig() {
  const caseConfig: CaseFormatConfig = {
    urlFormat: 'camelCase',
    apiFormat: 'snake_case',
  };

  return {
    // ... other config
    caseConfig
  };
}

// In your data fetching hook
export function useUsersData(
  page: number,
  pageSize: number,
  search: string,
  dateRange: { from_date: string; to_date: string },
  sortBy: string,
  sortOrder: string,
  caseConfig: CaseFormatConfig = DEFAULT_CASE_CONFIG
) {
  return useQuery({
    queryKey: ["users", page, pageSize, search, dateRange, sortBy, sortOrder, caseConfig],
    queryFn: () => fetchUsers({
      page,
      limit: pageSize,
      search,
      from_date: dateRange.from_date,
      to_date: dateRange.to_date,
      sort_by: sortBy,
      sort_order: sortOrder,
      caseConfig, // Pass the configuration
    }),
  });
}
```

## API Integration Examples

### Laravel-style API

```typescript
const laravelConfig: CaseFormatConfig = {
  keyMapper: (key: string) => {
    const mappings: Record<string, string> = {
      'sortBy': 'sort',
      'sortOrder': 'order',
      'pageSize': 'per_page',
      'page': 'page',
    };
    return mappings[key] || key;
  }
};
```

### Express.js/Node.js API

```typescript
const nodeConfig: CaseFormatConfig = {
  urlFormat: 'camelCase',
  apiFormat: 'camelCase',
};
```

### Django/Python API

```typescript
const djangoConfig: CaseFormatConfig = {
  urlFormat: 'camelCase',
  apiFormat: 'snake_case',
};
```

## Benefits

1. **Flexible Integration** - Works with any backend naming convention
2. **No Design Changes** - UI remains exactly the same
3. **Type Safety** - Full TypeScript support with proper type checking
4. **Backward Compatible** - Existing implementations continue to work
5. **Developer Experience** - Aligns with project-specific naming conventions

## Default Configuration

The default configuration maintains backward compatibility:

```typescript
export const DEFAULT_CASE_CONFIG: Required<CaseFormatConfig> = {
  urlFormat: 'camelCase',
  apiFormat: 'snake_case',
  keyMapper: (key: string) => key, // No transformation by default
};
```

## Migration Guide

### Existing Projects

No changes required - the default configuration maintains current behavior.

### New Projects

Add case configuration to your table setup:

```typescript
// 1. Define your case configuration
const caseConfig: CaseFormatConfig = {
  apiFormat: 'camelCase', // Match your backend
};

// 2. Add to export configuration
export function useExportConfig() {
  return {
    // ... existing config
    caseConfig
  };
}

// 3. Use in data fetching
export function useYourData(...params, caseConfig = DEFAULT_CASE_CONFIG) {
  // Your implementation
}
```

## Examples

See `src/components/data-table/examples/case-config-examples.ts` for complete configuration examples including:

- Default configuration
- Full camelCase
- Full snake_case
- Custom mappings
- Laravel-style
- GraphQL-style
- And more!

This enhancement makes the DataTable component truly production-ready for a broader range of applications and backend integrations.