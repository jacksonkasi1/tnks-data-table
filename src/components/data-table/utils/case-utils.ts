/**
 * Utility functions for case conversion in table keys
 */

export type CaseFormat = 'snake_case' | 'camelCase' | 'PascalCase' | 'kebab-case';

/**
 * Convert a string to snake_case
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[-\s]/g, '_')
    .toLowerCase()
    .replace(/^_/, '');
}

/**
 * Convert a string to camelCase
 */
export function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[-_\s](.)/g, (_, char) => char.toUpperCase());
}

/**
 * Convert a string to PascalCase
 */
export function toPascalCase(str: string): string {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

/**
 * Convert a string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/[_\s]/g, '-')
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
 * Type for converted object keys
 */
type ConvertedKeys<T extends Record<string, unknown>> = {
  [K in keyof T as K extends string ? string : never]: T[K];
};

/**
 * Convert all keys in an object to the specified case format
 */
export function convertObjectKeys<T extends Record<string, unknown>>(
  obj: T,
  format: CaseFormat
): ConvertedKeys<T> {
  const result: Record<string, unknown> = {};

  Object.entries(obj).forEach(([key, value]) => {
    const newKey = convertCase(key, format);
    result[newKey] = value;
  });

  return result as ConvertedKeys<T>;
}

/**
 * Type for custom key mapping function
 */
export type KeyMappingFunction = (key: string) => string;

/**
 * Convert object keys using a custom mapping function
 */
export function convertObjectKeysWithMapper<T extends Record<string, unknown>>(
  obj: T,
  mapper: KeyMappingFunction
): ConvertedKeys<T> {
  const result: Record<string, unknown> = {};

  Object.entries(obj).forEach(([key, value]) => {
    const newKey = mapper(key);
    result[newKey] = value;
  });

  return result as ConvertedKeys<T>;
}

/**
 * Configuration interface for case formatting
 */
export interface CaseFormatConfig {
  /** Format for URL parameters */
  urlFormat?: CaseFormat;
  /** Format for API parameters */
  apiFormat?: CaseFormat;
  /** Custom key mapping function (overrides format settings) */
  keyMapper?: KeyMappingFunction;
}

/**
 * Default case format configuration
 */
export const DEFAULT_CASE_CONFIG: Required<CaseFormatConfig> = {
  urlFormat: 'camelCase',
  apiFormat: 'snake_case',
  keyMapper: (key: string) => key, // No transformation by default
};