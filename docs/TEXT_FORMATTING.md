# Text Formatting Configuration Examples

This document demonstrates how to use the new flexible text formatting feature in the data table component.

## Basic Usage

The table component now automatically detects and formats column names based on their naming convention:

```typescript
// Snake case columns (default behavior)
const columns = [
  { accessorKey: "first_name" },    // Displays as "First name"
  { accessorKey: "created_at" },    // Displays as "Created at"
  { accessorKey: "user_id" },       // Displays as "User id"
];

// Camel case columns
const columns = [
  { accessorKey: "firstName" },     // Displays as "First Name"
  { accessorKey: "createdAt" },     // Displays as "Created At"
  { accessorKey: "userId" },        // Displays as "User Id"
];

// Pascal case columns
const columns = [
  { accessorKey: "FirstName" },     // Displays as "First Name"
  { accessorKey: "CreatedAt" },     // Displays as "Created At"
  { accessorKey: "UserId" },        // Displays as "User Id"
];

// Kebab case columns
const columns = [
  { accessorKey: "first-name" },    // Displays as "First name"
  { accessorKey: "created-at" },    // Displays as "Created at"
  { accessorKey: "user-id" },       // Displays as "User id"
];
```

## Advanced Configuration

### Setting Default Text Formatting

Configure the table to use a specific naming convention:

```typescript
import { DataTable } from "@/components/data-table";

function MyTableComponent() {
  const config = {
    textFormatting: {
      convention: 'camelCase',  // Force camelCase formatting
      capitalize: true,         // Capitalize first letter
      capitalizeAll: false      // Don't capitalize all words
    }
  };

  return (
    <DataTable
      config={config}
      getColumns={getColumns}
      fetchDataFn={fetchDataFn}
      // ... other props
    />
  );
}
```

### Custom Formatter Function

Use a completely custom formatter:

```typescript
const config = {
  textFormatting: {
    customFormatter: (text: string) => {
      // Your custom logic here
      return text
        .replace(/([a-z])([A-Z])/g, '$1 $2')  // Split camelCase
        .replace(/_/g, ' ')                   // Replace underscores
        .replace(/-/g, ' ')                   // Replace hyphens
        .toLowerCase()                        // Convert to lowercase
        .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
    }
  }
};
```

### Title Case Formatting

Format all words with title case:

```typescript
const config = {
  textFormatting: {
    convention: 'snake_case',
    capitalize: true,
    capitalizeAll: true  // "first_name" becomes "First Name"
  }
};
```

## Migration Guide

### From Old Snake Case Only

**Before (only snake_case supported):**
```typescript
// Only worked with snake_case
const columns = [
  { accessorKey: "first_name" },  // Required underscore format
  { accessorKey: "last_name" },
  { accessorKey: "email_address" },
];
```

**After (flexible naming conventions):**
```typescript
// Works with any naming convention
const columns = [
  { accessorKey: "firstName" },    // camelCase
  { accessorKey: "LastName" },     // PascalCase  
  { accessorKey: "email-address" }, // kebab-case
  { accessorKey: "phone_number" }, // snake_case (still supported)
];

// Or configure specific behavior
const config = {
  textFormatting: {
    convention: 'camelCase',
    capitalizeAll: true
  }
};
```

## Export Formatting

The new text formatting also applies to exported files:

```typescript
// When exporting, column headers will be formatted according to your configuration
// Snake case: "first_name" → "First name" 
// Camel case: "firstName" → "First Name"
// Custom formatter: applies your custom logic
```

## Backward Compatibility

The component maintains full backward compatibility:
- If no `textFormatting` config is provided, defaults to snake_case behavior
- Existing tables will continue to work without changes
- Column mappings still take precedence over automatic formatting

## API Reference

### TextFormatterOptions

```typescript
interface TextFormatterOptions {
  convention?: 'snake_case' | 'camelCase' | 'PascalCase' | 'kebab-case' | 'custom';
  customFormatter?: (text: string) => string;
  capitalize?: boolean;
  capitalizeAll?: boolean;
}
```

### TableConfig

```typescript
interface TableConfig {
  // ... other options
  textFormatting?: TextFormatterOptions;
}
```

### Utility Functions

```typescript
import { 
  formatText, 
  autoFormatText, 
  detectNamingConvention 
} from "@/components/data-table/utils/text-formatter";

// Auto-detect and format
const formatted = autoFormatText("firstName"); // "First Name"

// Explicit formatting
const formatted = formatText("first_name", { 
  convention: 'snake_case',
  capitalizeAll: true 
}); // "First Name"

// Detect naming convention
const convention = detectNamingConvention("firstName"); // "camelCase"
```