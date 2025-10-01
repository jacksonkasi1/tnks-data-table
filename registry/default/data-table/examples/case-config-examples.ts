/**
 * Examples of different case formatting configurations for the DataTable component
 * 
 * These examples demonstrate how to configure the table to work with different
 * backend systems that expect different parameter naming conventions.
 */

import { CaseFormatConfig } from "../utils/case-utils";

// Example 1: Default configuration (snake_case for API, camelCase for URL)
export const defaultCaseConfig: CaseFormatConfig = {
  urlFormat: 'camelCase',  // URL: ?sortBy=name&sortOrder=asc&pageSize=10
  apiFormat: 'snake_case', // API: sort_by=name&sort_order=asc&page_size=10
};

// Example 2: Full camelCase configuration (for modern REST APIs)
export const camelCaseConfig: CaseFormatConfig = {
  urlFormat: 'camelCase',  // URL: ?sortBy=name&sortOrder=asc&pageSize=10
  apiFormat: 'camelCase',  // API: sortBy=name&sortOrder=asc&pageSize=10
};

// Example 3: Full snake_case configuration (for traditional APIs)
export const snakeCaseConfig: CaseFormatConfig = {
  urlFormat: 'snake_case', // URL: ?sort_by=name&sort_order=asc&page_size=10
  apiFormat: 'snake_case', // API: sort_by=name&sort_order=asc&page_size=10
};

// Example 4: kebab-case configuration (for some APIs)
export const kebabCaseConfig: CaseFormatConfig = {
  urlFormat: 'kebab-case', // URL: ?sort-by=name&sort-order=asc&page-size=10
  apiFormat: 'kebab-case', // API: sort-by=name&sort-order=asc&page-size=10
};

// Example 5: Custom mapping configuration (for APIs with non-standard parameter names)
export const customMappingConfig: CaseFormatConfig = {
  keyMapper: (key: string) => {
    // Custom parameter name mappings
    const mappings: Record<string, string> = {
      'sortBy': 'orderBy',        // sortBy -> orderBy
      'sortOrder': 'direction',   // sortOrder -> direction
      'pageSize': 'limit',        // pageSize -> limit
      'page': 'offset',           // page -> offset (you might need to convert page number to offset)
      'search': 'query',          // search -> query
      'dateRange': 'dateFilter',  // dateRange -> dateFilter
    };
    return mappings[key] || key;
  }
};

// Example 6: Mixed configuration (camelCase URL, custom API mapping)
export const mixedConfig: CaseFormatConfig = {
  urlFormat: 'camelCase',
  keyMapper: (key: string) => {
    // Convert camelCase to custom API format
    const mappings: Record<string, string> = {
      'sortBy': 'order_column',
      'sortOrder': 'order_direction',
      'pageSize': 'per_page',
      'page': 'current_page',
      'search': 'search_term',
    };
    return mappings[key] || key;
  }
};

// Example 7: Laravel-style API configuration
export const laravelStyleConfig: CaseFormatConfig = {
  urlFormat: 'camelCase',
  keyMapper: (key: string) => {
    const mappings: Record<string, string> = {
      'sortBy': 'sort',
      'sortOrder': 'order',
      'pageSize': 'per_page',
      'page': 'page',
      'search': 'search',
    };
    return mappings[key] || key;
  }
};

// Example 8: GraphQL-style configuration (PascalCase)
export const graphqlStyleConfig: CaseFormatConfig = {
  urlFormat: 'camelCase',   // URL stays camelCase for consistency
  apiFormat: 'PascalCase',  // API uses PascalCase for GraphQL variables
};

/**
 * Usage examples:
 * 
 * // In your table configuration:
 * const tableConfig = {
 *   ...otherConfig,
 *   caseConfig: camelCaseConfig, // Choose your preferred config
 * };
 * 
 * // Or use a custom configuration:
 * const customConfig: CaseFormatConfig = {
 *   keyMapper: (key: string) => {
 *     // Your custom logic here
 *     return key.toUpperCase(); // Example: convert all keys to uppercase
 *   }
 * };
 */