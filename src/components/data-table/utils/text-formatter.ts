/**
 * Flexible text formatting utility for column names
 * Supports different naming conventions and custom formatting
 */

export type NamingConvention = 'snake_case' | 'camelCase' | 'PascalCase' | 'kebab-case' | 'custom';

export interface TextFormatterOptions {
  /**
   * The naming convention to detect and format
   * @default 'snake_case'
   */
  convention?: NamingConvention;
  
  /**
   * Custom formatter function that takes the original text and returns formatted text
   * If provided, this takes precedence over the convention-based formatting
   */
  customFormatter?: (text: string) => string;
  
  /**
   * Whether to capitalize the first letter of the result
   * @default true
   */
  capitalize?: boolean;
  
  /**
   * Whether to capitalize all words in the result
   * @default false
   */
  capitalizeAll?: boolean;
}

/**
 * Converts camelCase to space-separated words
 * Example: "firstName" -> "first Name"
 */
function camelCaseToWords(text: string): string {
  return text.replace(/([a-z])([A-Z])/g, '$1 $2');
}

/**
 * Converts PascalCase to space-separated words
 * Example: "FirstName" -> "First Name"
 */
function pascalCaseToWords(text: string): string {
  return text.replace(/([a-z])([A-Z])/g, '$1 $2');
}

/**
 * Converts snake_case to space-separated words
 * Example: "first_name" -> "first name"
 */
function snakeCaseToWords(text: string): string {
  return text.replace(/_/g, ' ');
}

/**
 * Converts kebab-case to space-separated words
 * Example: "first-name" -> "first name"
 */
function kebabCaseToWords(text: string): string {
  return text.replace(/-/g, ' ');
}

/**
 * Capitalizes the first letter of a string
 */
function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Capitalizes all words in a string
 */
function capitalizeWords(text: string): string {
  return text.split(' ').map(word => capitalizeFirst(word)).join(' ');
}

/**
 * Detects the naming convention of a given text
 */
export function detectNamingConvention(text: string): NamingConvention {
  // Check for snake_case
  if (text.includes('_')) {
    return 'snake_case';
  }
  
  // Check for kebab-case
  if (text.includes('-')) {
    return 'kebab-case';
  }
  
  // Check for PascalCase (starts with uppercase)
  if (text.match(/^[A-Z][a-z]/) && text.match(/[A-Z]/)) {
    return 'PascalCase';
  }
  
  // Check for camelCase (starts with lowercase and contains uppercase)
  if (text.match(/^[a-z]/) && text.match(/[A-Z]/)) {
    return 'camelCase';
  }
  
  // Default to snake_case for backward compatibility
  return 'snake_case';
}

/**
 * Formats text according to the specified options
 */
export function formatText(text: string, options: TextFormatterOptions = {}): string {
  const {
    convention = 'snake_case',
    customFormatter,
    capitalize = true,
    capitalizeAll = false
  } = options;
  
  // If custom formatter is provided, use it
  if (customFormatter) {
    return customFormatter(text);
  }
  
  // Use the detected convention if 'auto' is specified
  const detectedConvention = convention === 'custom' ? detectNamingConvention(text) : convention;
  
  // Format based on the convention
  let formatted: string;
  
  switch (detectedConvention) {
    case 'camelCase':
      formatted = camelCaseToWords(text);
      break;
    case 'PascalCase':
      formatted = pascalCaseToWords(text);
      break;
    case 'kebab-case':
      formatted = kebabCaseToWords(text);
      break;
    case 'snake_case':
    default:
      formatted = snakeCaseToWords(text);
      break;
  }
  
  // Apply capitalization rules
  if (capitalizeAll) {
    return capitalizeWords(formatted);
  } else if (capitalize) {
    return capitalizeFirst(formatted);
  }
  
  return formatted;
}

/**
 * Auto-detects the naming convention and formats accordingly
 */
export function autoFormatText(text: string, options: Omit<TextFormatterOptions, 'convention'> = {}): string {
  const convention = detectNamingConvention(text);
  return formatText(text, { ...options, convention });
}