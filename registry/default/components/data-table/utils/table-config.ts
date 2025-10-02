/**
 * Table configuration options
 * This file provides centralized configuration for the data table features
 */
export interface TableConfig {
  // Enable/disable row selection
  enableRowSelection: boolean;
  
  // Enable/disable keyboard navigation
  enableKeyboardNavigation: boolean;
  
  // Enable/disable clicking a row to select it
  enableClickRowSelect: boolean;
  
  // Enable/disable pagination
  enablePagination: boolean;
  
  // Enable/disable search
  enableSearch: boolean;
  
  // Enable/disable column filters
  enableColumnFilters: boolean;
  
  // Enable/disable date range filter
  enableDateFilter: boolean;
  
  // Enable/disable column visibility options
  enableColumnVisibility: boolean;
  
  // Enable/disable data export
  enableExport: boolean;
  
  // Enable/disable URL state persistence
  enableUrlState: boolean;
  
  // Enable/disable column resizing
  enableColumnResizing: boolean;
  
  // Enable/disable toolbar
  enableToolbar: boolean;
  
  // Control the size of buttons and inputs throughout the table
  // sm: small, default: standard, lg: large
  size: 'sm' | 'default' | 'lg';
  
  // Unique ID for storing column sizing in localStorage
  // This allows multiple tables to have independent sizing states
  columnResizingTableId?: string;
  
  // Custom placeholder text for search input
  // If not provided, defaults to "Search {entityName}..."
  searchPlaceholder?: string;
  
  // Allow exporting new columns created by transform function
  // When true (default): Export includes visible columns + new columns from transform function
  // When false: Export only includes visible columns (hidden columns always excluded)
  // Note: Hidden columns are ALWAYS excluded regardless of this setting
  allowExportNewColumns: boolean;

  // Default sort column (should match column accessorKey exactly)
  // Use the same case format as your API response (snake_case or camelCase)
  defaultSortBy?: string;

  // Default sort direction
  defaultSortOrder?: 'asc' | 'desc';
}

// Default configuration
const defaultConfig: TableConfig = {
  enableRowSelection: true,      // Row selection enabled by default
  enableKeyboardNavigation: false, // Keyboard navigation disabled by default
  enableClickRowSelect: false,    // Clicking row to select disabled by default
  enablePagination: true,         // Pagination enabled by default
  enableSearch: true,             // Search enabled by default
  enableColumnFilters: true,      // Column filters enabled by default
  enableDateFilter: true,         // Date filter enabled by default
  enableColumnVisibility: true,   // Column visibility options enabled by default
  enableExport: true,             // Data export enabled by default
  enableUrlState: true,           // URL state persistence enabled by default
  enableColumnResizing: true,     // Column resizing enabled by default
  enableToolbar: true,            // Toolbar enabled by default
  size: 'default',                // Default size for buttons and inputs
  columnResizingTableId: undefined, // No table ID by default
  searchPlaceholder: undefined,   // No custom search placeholder by default
  allowExportNewColumns: true,    // Allow new columns from transform function by default
  defaultSortBy: undefined,       // No default sort column - must be provided in config
  defaultSortOrder: 'desc',       // Default to descending order
};

/**
 * Hook to provide table configuration
 * Allows overriding default configuration
 */
export function useTableConfig(overrideConfig?: Partial<TableConfig>): TableConfig {
  // Merge default config with any overrides
  const config = { ...defaultConfig, ...overrideConfig };
  
  return config;
} 