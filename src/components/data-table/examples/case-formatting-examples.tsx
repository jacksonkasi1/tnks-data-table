/**
 * Example usage of flexible case formatting in DataTable
 * 
 * This example demonstrates how to use the DataTable component with different
 * case formats for API parameters.
 */

import { DataTable } from "@/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";

// Example 1: Using camelCase parameters
const camelCaseApiExample = {
  fetchDataFn: async (params: any) => {
    // params will be in camelCase format: { sortBy, sortOrder, fromDate, toDate }
    console.log('CamelCase params:', params);
    
    // Make API call with camelCase parameters
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    return response.json();
  },
  
  config: {
    parameterFormat: 'camelCase' as const
  }
};

// Example 2: Using kebab-case parameters
const kebabCaseApiExample = {
  fetchDataFn: async (params: any) => {
    // params will be in kebab-case format: { "sort-by", "sort-order", "from-date", "to-date" }
    console.log('Kebab-case params:', params);
    
    // Make API call with kebab-case parameters
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    return response.json();
  },
  
  config: {
    parameterFormat: 'kebab-case' as const
  }
};

// Example 3: Using custom parameter mapping
const customMappingExample = {
  fetchDataFn: async (params: any) => {
    // params will be mapped according to custom mapping
    console.log('Custom mapped params:', params);
    
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    return response.json();
  },
  
  config: {
    parameterMapping: (params: any) => ({
      // Custom mapping for specific API requirements
      currentPage: params.page,
      itemsPerPage: params.limit,
      searchTerm: params.search,
      startDate: params.from_date,
      endDate: params.to_date,
      orderBy: params.sort_by,
      orderDirection: params.sort_order
    })
  }
};

// Example 4: Default snake_case (backward compatibility)
const defaultSnakeCaseExample = {
  fetchDataFn: async (params: any) => {
    // params will be in snake_case format: { sort_by, sort_order, from_date, to_date }
    console.log('Snake_case params:', params);
    
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    return response.json();
  },
  
  // No config needed - snake_case is default
  config: {}
};

// Usage examples in React components
export function CamelCaseDataTable() {
  return (
    <DataTable
      config={camelCaseApiExample.config}
      fetchDataFn={camelCaseApiExample.fetchDataFn}
      getColumns={() => []} // Your column definitions
      exportConfig={{
        entityName: "users",
        columnMapping: {}
      }}
    />
  );
}

export function KebabCaseDataTable() {
  return (
    <DataTable
      config={kebabCaseApiExample.config}
      fetchDataFn={kebabCaseApiExample.fetchDataFn}
      getColumns={() => []} // Your column definitions
      exportConfig={{
        entityName: "users",
        columnMapping: {}
      }}
    />
  );
}

export function CustomMappingDataTable() {
  return (
    <DataTable
      config={customMappingExample.config}
      fetchDataFn={customMappingExample.fetchDataFn}
      getColumns={() => []} // Your column definitions
      exportConfig={{
        entityName: "users",
        columnMapping: {}
      }}
    />
  );
}

export function DefaultSnakeCaseDataTable() {
  return (
    <DataTable
      config={defaultSnakeCaseExample.config}
      fetchDataFn={defaultSnakeCaseExample.fetchDataFn}
      getColumns={() => []} // Your column definitions
      exportConfig={{
        entityName: "users",
        columnMapping: {}
      }}
    />
  );
}