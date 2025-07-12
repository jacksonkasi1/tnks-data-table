# Export Customization Guide

This guide explains how to customize data table exports with transformation functions, format data, and add new calculated columns.

## Overview

The data table export system supports optional transformation functions that allow you to:
- Format existing data (timestamps, currency, phone numbers)
- Add completely new calculated columns
- Apply business logic during export
- Customize data presentation without affecting the table display

## Basic Usage

### Default Export (No Customization)
```typescript
// Default export works unchanged
const exportConfig = {
  entityName: "users",
  columnMapping: { id: "ID", name: "Name" },
  columnWidths: [{ wch: 10 }, { wch: 20 }],
  headers: ["id", "name"]
};
```

### Custom Transformation Export
```typescript
import { DataTransformFunction } from "@/components/data-table/utils/export-utils";
import { formatTimestampToReadable, formatCurrency } from "@/utils/format";

const transformFunction: DataTransformFunction<User> = (row: User) => ({
  ...row,
  // Format existing columns
  created_at: formatTimestampToReadable(row.created_at),
  total_expenses: formatCurrency(row.total_expenses),
  
  // Add new calculated columns
  status: row.expense_count > 10 ? "ACTIVE" : "INACTIVE",
  customer_tier: row.total_expenses > 1000 ? "PREMIUM" : "STANDARD"
});

const exportConfig = {
  entityName: "users",
  columnMapping: {
    id: "ID",
    name: "Name", 
    created_at: "Join Date",
    total_expenses: "Total Spending",
    status: "Account Status",        // New column
    customer_tier: "Customer Tier"   // New column
  },
  headers: ["id", "name", "created_at", "total_expenses", "status", "customer_tier"],
  transformFunction
};
```

## Available Formatting Functions

The `/src/utils/format.ts` file provides these utilities:

### Date & Time Formatting
```typescript
// Format ISO timestamp to readable date
formatTimestampToReadable("2023-01-15T10:30:00Z")
// Output: "15/01/2023 10:30 AM"

// Format date only
formatDateToReadable("2023-01-15")
// Output: "15/01/2023"
```

### Number & Currency Formatting
```typescript
// Format currency
formatCurrency(1234.56, "USD")
// Output: "$1,234.56"

// Format numbers with separators
formatNumber(1234567)
// Output: "1,234,567"
```

### Text Formatting
```typescript
// Title case
formatToTitleCase("john doe")
// Output: "John Doe"

// Truncate text
formatTruncatedText("Very long text here", 10)
// Output: "Very long..."

// Format phone numbers
formatPhoneNumber("1234567890")
// Output: "(123) 456-7890"
```

### Boolean Formatting
```typescript
// Format boolean values
formatBoolean(true, { true: "Yes", false: "No" })
// Output: "Yes"
```

## Adding New Calculated Columns

### Example 1: Simple Status Fields
```typescript
const transformFunction = (row: User) => ({
  ...row,
  // Simple status based on data
  account_status: row.expense_count > 10 ? "ACTIVE" : "INACTIVE",
  risk_level: row.expense_count < 2 ? "HIGH_RISK" : "LOW_RISK"
});
```

### Example 2: Mathematical Calculations
```typescript
const transformFunction = (row: User) => {
  const expenseAmount = parseFloat(row.total_expenses) || 0;
  
  return {
    ...row,
    average_expense: expenseAmount / Math.max(row.expense_count, 1),
    lifetime_value: expenseAmount * 1.2, // 20% markup
    monthly_average: expenseAmount / 12
  };
};
```

### Example 3: Time-based Calculations
```typescript
const transformFunction = (row: User) => {
  const currentYear = new Date().getFullYear();
  const joinYear = new Date(row.created_at).getFullYear();
  const daysSince = Math.floor((Date.now() - new Date(row.created_at).getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    ...row,
    years_as_customer: currentYear - joinYear,
    days_since_joined: daysSince,
    tenure_category: currentYear - joinYear > 2 ? "VETERAN" : "NEW"
  };
};
```

### Example 4: Business Logic Categories
```typescript
const transformFunction = (row: User) => {
  const expenseAmount = parseFloat(row.total_expenses) || 0;
  
  return {
    ...row,
    spending_tier: expenseAmount > 2000 ? "PREMIUM" : 
                   expenseAmount > 1000 ? "GOLD" : 
                   expenseAmount > 500 ? "SILVER" : "BRONZE",
    
    engagement_level: row.expense_count > 20 ? "HIGHLY_ENGAGED" : 
                     row.expense_count > 10 ? "MODERATELY_ENGAGED" : "LOW_ENGAGEMENT",
                     
    customer_segment: expenseAmount > 1500 && row.expense_count > 15 ? "VIP" :
                     expenseAmount > 800 && row.expense_count > 8 ? "PREMIUM" : "STANDARD"
  };
};
```

### Example 5: Privacy & Compliance
```typescript
const transformFunction = (row: User) => ({
  ...row,
  // Obfuscate sensitive data for certain exports
  email_masked: row.email.replace(/(.{2}).*@/, "$1****@"),
  phone_masked: row.phone ? `***-***-${row.phone.slice(-4)}` : "",
  // Add compliance flags
  gdpr_compliant: "YES", // Could be calculated based on user data
  data_retention_days: 365 // Business rule
});
```

## Complete Configuration Example

Here's a comprehensive example showing all features:

```typescript
import { DataTransformFunction } from "@/components/data-table/utils/export-utils";
import { 
  formatTimestampToReadable, 
  formatCurrency, 
  formatPhoneNumber,
  formatToTitleCase 
} from "@/utils/format";

// Transformation function with multiple new columns
const enhancedTransformFunction: DataTransformFunction<User> = (row: User) => {
  const expenseAmount = parseFloat(row.total_expenses) || 0;
  const currentYear = new Date().getFullYear();
  const joinYear = new Date(row.created_at).getFullYear();
  
  return {
    ...row,
    // Format existing data
    name: formatToTitleCase(row.name),
    created_at: formatTimestampToReadable(row.created_at),
    phone: formatPhoneNumber(row.phone),
    total_expenses: formatCurrency(row.total_expenses),
    
    // Add new calculated columns
    account_status: row.expense_count > 10 ? "ACTIVE" : "INACTIVE",
    spending_category: expenseAmount > 1000 ? "HIGH_SPENDER" : 
                      expenseAmount > 500 ? "MEDIUM_SPENDER" : "LOW_SPENDER",
    years_as_customer: currentYear - joinYear,
    customer_tier: expenseAmount > 2000 ? "PREMIUM" : 
                   expenseAmount > 1000 ? "GOLD" : 
                   expenseAmount > 500 ? "SILVER" : "BRONZE",
    average_expense: expenseAmount / Math.max(row.expense_count, 1),
    engagement_level: row.expense_count > 20 ? "HIGH" : 
                     row.expense_count > 10 ? "MEDIUM" : "LOW",
    risk_score: row.expense_count < 2 ? "HIGH_RISK" : "LOW_RISK"
  };
};

// Complete export configuration
export const enhancedExportConfig = {
  entityName: "users",
  
  // Include all columns (original + new)
  headers: [
    // Original columns
    "id", "name", "email", "phone", "age", "created_at", "expense_count", "total_expenses",
    // New calculated columns
    "account_status", "spending_category", "years_as_customer", "customer_tier", 
    "average_expense", "engagement_level", "risk_score"
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
    // New column headers
    account_status: "Account Status",
    spending_category: "Spending Category",
    years_as_customer: "Years as Customer",
    customer_tier: "Customer Tier",
    average_expense: "Average per Transaction",
    engagement_level: "Engagement Level",
    risk_score: "Risk Assessment"
  },
  
  // Excel column widths
  columnWidths: [
    { wch: 12 }, // Customer ID
    { wch: 20 }, // Full Name
    { wch: 25 }, // Email Address
    { wch: 15 }, // Phone Number
    { wch: 8 },  // Age
    { wch: 18 }, // Join Date
    { wch: 12 }, // Total Transactions
    { wch: 15 }, // Total Spending
    { wch: 15 }, // Account Status
    { wch: 18 }, // Spending Category
    { wch: 18 }, // Years as Customer
    { wch: 15 }, // Customer Tier
    { wch: 20 }, // Average per Transaction
    { wch: 18 }, // Engagement Level
    { wch: 15 }  // Risk Assessment
  ],
  
  // Apply the transformation function
  transformFunction: enhancedTransformFunction
};
```

## Best Practices

### 1. Performance Considerations
- Keep transformation functions simple and fast
- Avoid heavy computations or API calls in transformations
- Cache expensive calculations when possible

### 2. Data Consistency
- Ensure new calculated fields are deterministic
- Handle null/undefined values gracefully
- Use consistent formatting across similar fields

### 3. User Experience
- Provide meaningful column headers in `columnMapping`
- Order columns logically (original data first, then calculated)
- Use appropriate column widths for Excel exports

### 4. Maintainability
- Keep transformation logic separate and well-documented
- Use utility functions for common formatting patterns
- Consider creating multiple transformation functions for different use cases

## Advanced Patterns

### Conditional Transformations
```typescript
// Apply different transformations based on user role or export type
const getTransformFunction = (userRole: string, exportType: 'internal' | 'external') => {
  return (row: User) => {
    const baseTransform = { ...row };
    
    if (userRole === 'admin' && exportType === 'internal') {
      // Include sensitive data for admin internal reports
      return {
        ...baseTransform,
        internal_notes: generateInternalNotes(row),
        profit_margin: calculateProfitMargin(row)
      };
    }
    
    // Standard transformation for external reports
    return {
      ...baseTransform,
      customer_tier: calculateTier(row)
    };
  };
};
```

### Async Data Enhancement
If you need to include data from external sources, fetch it before calling the export:

```typescript
// Pre-fetch additional data, then use in transformation
const enhancedData = await Promise.all(
  originalData.map(async (row) => ({
    ...row,
    credit_score: await getCreditScore(row.id),
    market_segment: await getMarketSegment(row.location)
  }))
);

// Then export the enhanced data with transformation
```

## Troubleshooting

### Common Issues

1. **New columns not appearing**: Ensure the column names are included in the `headers` array
2. **Headers not readable**: Add mappings to `columnMapping` object  
3. **Excel formatting issues**: Adjust `columnWidths` array to match number of columns
4. **TypeScript errors**: Ensure your transformation function returns `ExportableData` type
5. **Performance issues**: Simplify transformation logic or pre-calculate complex values

### Debugging Tips

```typescript
// Add logging to debug transformation issues
const debugTransformFunction = (row: User) => {
  const result = {
    ...row,
    new_field: calculateNewField(row)
  };
  
  console.log('Transform input:', row);
  console.log('Transform output:', result);
  
  return result;
};
```

This flexible system allows you to create powerful, customized exports that provide exactly the data your users need in the format they expect.