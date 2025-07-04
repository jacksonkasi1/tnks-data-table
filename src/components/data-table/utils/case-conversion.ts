/**
 * Utility functions for converting between different naming conventions
 * Supports: snake_case, camelCase, PascalCase, kebab-case
 */

export type CaseFormat = 'snake_case' | 'camelCase' | 'PascalCase' | 'kebab-case';

/**
 * Convert a string from any case to snake_case
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[-\s]+/g, '_')
    .toLowerCase()
    .replace(/^_/, '');
}

/**
 * Convert a string from any case to camelCase
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

/**
 * Convert a string from any case to PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[a-z]/, (char) => char.toUpperCase());
}

/**
 * Convert a string from any case to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
    .replace(/^-/, '');
}

/**
 * Convert a string to the specified case format
 */
export function convertCase(str: string, format: CaseFormat): string {
  switch (format) {
    case 'snake_case':
      return toSnakeCase(str);
    case 'camelCase':
      return toCamelCase(str);
    case 'PascalCase':
      return toPascalCase(str);
    case 'kebab-case':
      return toKebabCase(str);
    default:
      return str;
  }
}

/**
 * Convert all keys in an object to the specified case format
 */
export function convertObjectKeys<T extends Record<string, any>>(
  obj: T,
  format: CaseFormat
): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const convertedKey = convertCase(key, format);
    result[convertedKey] = value;
  }
  
  return result;
}

/**
 * Default parameter mapping for common API parameter names
 */
export const DEFAULT_PARAMETER_MAPPING = {
  page: 'page',
  limit: 'limit',
  pageSize: 'limit', // Common alias for limit
  search: 'search',
  sortBy: 'sort_by',
  sortOrder: 'sort_order',
  fromDate: 'from_date',
  toDate: 'to_date',
  dateRange: 'date_range',
} as const;

/**
 * Create a parameter mapping function for a specific case format
 */
export function createParameterMapping(format: CaseFormat) {
  return (params: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(params)) {
      // Check if there's a specific mapping for this key
      const mappedKey = DEFAULT_PARAMETER_MAPPING[key as keyof typeof DEFAULT_PARAMETER_MAPPING];
      if (mappedKey) {
        result[convertCase(mappedKey, format)] = value;
      } else {
        result[convertCase(key, format)] = value;
      }
    }
    
    return result;
  };
}

/**
 * Create a custom parameter mapping function
 */
export function createCustomParameterMapping(
  mapping: Record<string, string>
): (params: Record<string, any>) => Record<string, any> {
  return (params: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(params)) {
      const mappedKey = mapping[key] || key;
      result[mappedKey] = value;
    }
    
    return result;
  };
}