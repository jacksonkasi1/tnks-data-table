# Case Formatting Configuration

The DataTable component now supports flexible case formatting for API parameters, allowing you to integrate with backends that expect different naming conventions.

## Supported Case Formats

- **snake_case** (default) - `sort_by`, `sort_order`, `from_date`, `to_date`
- **camelCase** - `sortBy`, `sortOrder`, `fromDate`, `toDate`
- **PascalCase** - `SortBy`, `SortOrder`, `FromDate`, `ToDate`
- **kebab-case** - `sort-by`, `sort-order`, `from-date`, `to-date`

## Configuration Options

### 1. Using Predefined Case Formats

```typescript
// CamelCase parameters
<DataTable
  config={{
    parameterFormat: 'camelCase'
  }}
  fetchDataFn={fetchDataFn}
  // ... other props
/>

// Kebab-case parameters
<DataTable
  config={{
    parameterFormat: 'kebab-case'
  }}
  fetchDataFn={fetchDataFn}
  // ... other props
/>
```

### 2. Custom Parameter Mapping

For complete control over parameter names, use the `parameterMapping` function:

```typescript
<DataTable
  config={{
    parameterMapping: (params) => ({
      // Custom mapping for your API
      currentPage: params.page,
      itemsPerPage: params.limit,
      searchTerm: params.search,
      startDate: params.from_date,
      endDate: params.to_date,
      orderBy: params.sort_by,
      orderDirection: params.sort_order
    })
  }}
  fetchDataFn={fetchDataFn}
  // ... other props
/>
```

## Parameter Mapping Reference

The table below shows how the internal parameters are mapped to different case formats:

| Internal Parameter | snake_case | camelCase | PascalCase | kebab-case |
|--------------------|------------|-----------|------------|------------|
| `page` | `page` | `page` | `Page` | `page` |
| `limit` | `limit` | `limit` | `Limit` | `limit` |
| `search` | `search` | `search` | `Search` | `search` |
| `sortBy` | `sort_by` | `sortBy` | `SortBy` | `sort-by` |
| `sortOrder` | `sort_order` | `sortOrder` | `SortOrder` | `sort-order` |
| `fromDate` | `from_date` | `fromDate` | `FromDate` | `from-date` |
| `toDate` | `to_date` | `toDate` | `ToDate` | `to-date` |

## Examples

### Example 1: CamelCase API

```typescript
const fetchUsers = async (params: any) => {
  // params will be: { page, limit, search, sortBy, sortOrder, fromDate, toDate }
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return response.json();
};

<DataTable
  config={{ parameterFormat: 'camelCase' }}
  fetchDataFn={fetchUsers}
  // ... other props
/>
```

### Example 2: GraphQL API with Custom Mapping

```typescript
const fetchUsers = async (params: any) => {
  // params will be: { first, after, filter, orderBy }
  const query = `
    query GetUsers($first: Int, $after: String, $filter: String, $orderBy: OrderBy) {
      users(first: $first, after: $after, filter: $filter, orderBy: $orderBy) {
        edges { node { id name email } }
        pageInfo { hasNextPage endCursor }
      }
    }
  `;
  
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: params })
  });
  return response.json();
};

<DataTable
  config={{
    parameterMapping: (params) => ({
      first: params.limit,
      after: params.page > 1 ? btoa(`cursor:${(params.page - 1) * params.limit}`) : null,
      filter: params.search,
      orderBy: {
        field: params.sort_by,
        direction: params.sort_order.toUpperCase()
      }
    })
  }}
  fetchDataFn={fetchUsers}
  // ... other props
/>
```

### Example 3: Backward Compatibility (Default)

```typescript
// No configuration needed - snake_case is the default
<DataTable
  fetchDataFn={fetchUsers} // expects snake_case parameters
  // ... other props
/>
```

## Migration Guide

### From Hardcoded snake_case

If you're migrating from a version that only supported snake_case, no changes are needed. The default behavior remains the same.

### To Support CamelCase APIs

1. Add `parameterFormat: 'camelCase'` to your table config
2. Update your API function to expect camelCase parameters
3. Test your integration

### To Support Custom Parameter Names

1. Add a `parameterMapping` function to your table config
2. Map the internal parameters to your API's expected parameter names
3. Update your API function accordingly

## Utilities

The following utility functions are available for advanced use cases:

```typescript
import { 
  toSnakeCase, 
  toCamelCase, 
  toPascalCase, 
  toKebabCase,
  convertCase,
  convertObjectKeys,
  createParameterMapping,
  createCustomParameterMapping
} from '@/components/data-table/utils/case-conversion';

// Convert individual strings
const snakeCase = toSnakeCase('sortBy'); // 'sort_by'
const camelCase = toCamelCase('sort_by'); // 'sortBy'

// Convert object keys
const params = { sortBy: 'name', sortOrder: 'asc' };
const snakeCaseParams = convertObjectKeys(params, 'snake_case');
// Result: { sort_by: 'name', sort_order: 'asc' }

// Create parameter mapping functions
const mapper = createParameterMapping('camelCase');
const mappedParams = mapper(params);
```