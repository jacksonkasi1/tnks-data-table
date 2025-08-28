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
  
  // Enable/disable row expanding (sub-rows)
  enableExpanding: boolean;
  
  // Include expanded rows in pagination count
  // When true: Expanded rows count toward page size
  // When false: Expanded rows always show with their parent
  paginateExpandedRows: boolean;
  
  // Filter from leaf rows up (includes parent if any child matches)
  // When true: If any sub-row matches filter, show parent + all children
  // When false: Filter each row independently
  filterFromLeafRows: boolean;
  
  // Sub-row indentation in pixels
  // Controls how much sub-rows are indented from their parent
  // Default: 0 (no indentation)
  subRowIndentPx: number;

  // Sub-row horizontal offset in pixels
  // Controls the horizontal positioning of entire sub-rows (left/right offset)
  // Positive values move sub-rows to the right, negative to the left
  // Default: 0 (no offset, sub-rows align with parent rows)
  subRowOffsetPx: number;
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
  enableExpanding: false,         // Row expanding disabled by default
  paginateExpandedRows: false,    // Don't paginate expanded rows by default
  filterFromLeafRows: false,      // Filter each row independently by default
  subRowIndentPx: 0,              // No sub-row indentation by default
  subRowOffsetPx: 0,              // No sub-row horizontal offset by default
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