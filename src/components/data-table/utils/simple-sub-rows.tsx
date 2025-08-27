import type { ColumnDef, Row } from "@tanstack/react-table";
import React, { type ReactNode } from "react";
import type { ExportableData } from "./export-utils";

/**
 * Simplified sub-row configuration
 * Designed to be intuitive and work out-of-the-box with minimal configuration
 */
export interface SimpleSubRowConfig<TData extends ExportableData = ExportableData> {
  /**
   * Function to extract sub-rows from a parent row
   * @example (row) => row.children || row.subRows || row.items
   */
  getSubRows: (row: TData) => TData[] | undefined;

  /**
   * Sub-row rendering type
   * - 'auto': Automatically detect based on data structure (default)
   * - 'unified': Same columns for parent and child, content adapts
   * - 'different': Different data structure for parent and child
   */
  type?: 'auto' | 'unified' | 'different';

  /**
   * Visual configuration for sub-rows
   */
  visual?: {
    /** Indentation in pixels per level (default: 24) */
    indentSize?: number;
    /** Apply muted styling to sub-rows (default: true) */
    muteSubRows?: boolean;
    /** Show connecting lines (default: false) */
    showLines?: boolean;
  };

  /**
   * Export configuration for hierarchical data
   */
  export?: {
    /** How to export sub-rows (default: 'flatten') */
    strategy?: 'flatten' | 'separate-sheets' | 'skip';
    /** Indentation string for flattened export (default: '  ') */
    indentString?: string;
    /** Include sub-rows in export (default: true) */
    includeSubRows?: boolean;
  };

  /**
   * Optional: Detect row type for advanced rendering
   * If not provided, will auto-detect based on data structure
   */
  getRowType?: (row: TData) => 'parent' | 'child';

  /**
   * Optional: Custom cell renderers for different row types
   * Only needed for complex scenarios
   */
  cellRenderers?: {
    [columnId: string]: (row: TData, isSubRow: boolean) => ReactNode;
  };
}

/**
 * Default configuration values
 */
export const DEFAULT_SUB_ROW_CONFIG: Partial<SimpleSubRowConfig> = {
  type: 'auto',
  visual: {
    indentSize: 24,
    muteSubRows: true,
    showLines: false,
  },
  export: {
    strategy: 'flatten',
    indentString: '  ',
    includeSubRows: true,
  },
};

/**
 * Auto-detect sub-row type based on data structure
 */
export function detectSubRowType<TData extends ExportableData>(
  parentRow: TData,
  childRow: TData | undefined
): 'unified' | 'different' {
  if (!childRow) return 'unified';

  const parentKeys = Object.keys(parentRow);
  const childKeys = Object.keys(childRow);

  // Check if they have mostly the same keys
  const commonKeys = parentKeys.filter(key => childKeys.includes(key));
  const similarity = commonKeys.length / Math.max(parentKeys.length, childKeys.length);

  // If more than 70% of keys are common, treat as unified
  return similarity > 0.7 ? 'unified' : 'different';
}

/**
 * Detect if a row is a parent row (has sub-rows)
 */
export function isParentRow<TData extends ExportableData>(
  row: TData,
  config: SimpleSubRowConfig<TData>
): boolean {
  const subRows = config.getSubRows(row);
  return Array.isArray(subRows) && subRows.length > 0;
}

/**
 * Detect if a row is likely a child row based on common patterns
 */
export function isChildRow<TData extends ExportableData>(row: TData): boolean {
  // Common patterns that indicate a child row
  const childIndicators = [
    'parentId' in row,
    'parent_id' in row,
    'parentUserId' in row,
    'parentOrderId' in row,
    !('subRows' in row || 'children' in row || 'items' in row),
  ];

  return childIndicators.some(indicator => indicator);
}

/**
 * Apply visual styling to a row based on whether it's a sub-row
 */
export function getSubRowClassName(
  depth: number,
  config: SimpleSubRowConfig['visual']
): string {
  const classes: string[] = [];

  if (depth > 0) {
    if (config?.muteSubRows) {
      classes.push('text-muted-foreground');
    }
  }

  return classes.join(' ');
}

/**
 * Get indentation style for a cell based on row depth
 */
export function getSubRowIndentStyle(
  depth: number,
  config: SimpleSubRowConfig['visual']
): React.CSSProperties {
  const indentSize = config?.indentSize ?? 24;
  return depth > 0 ? { paddingLeft: `${depth * indentSize}px` } : {};
}

/**
 * Enhanced column wrapper that automatically handles sub-row rendering
 */
export function wrapColumnWithSubRowSupport<TData extends ExportableData>(
  column: ColumnDef<TData>,
  config: SimpleSubRowConfig<TData>
): ColumnDef<TData> {
  // Don't wrap special columns
  if (column.id === '__expanding__' || column.id === 'select') {
    return column;
  }

  const originalCell = column.cell;

  return {
    ...column,
    cell: (context) => {
      const row = context.row;
      const depth = row.depth;
      const isSubRow = depth > 0;

      // Apply visual configuration
      const className = getSubRowClassName(depth, config.visual);
      const style = getSubRowIndentStyle(depth, config.visual);

      // Check for custom renderer
      if (config.cellRenderers && column.id && config.cellRenderers[column.id]) {
        return (
          <div className={className} style={style}>
            {config.cellRenderers[column.id](row.original, isSubRow)}
          </div>
        );
      }

      // Use original cell renderer with styling
      const originalContent = typeof originalCell === 'function' 
        ? originalCell(context)
        : context.getValue();

      return (
        <div className={className} style={style}>
          {originalContent}
        </div>
      );
    },
  };
}

/**
 * Process columns to add sub-row support
 */
export function processColumnsForSubRows<TData extends ExportableData>(
  columns: ColumnDef<TData>[],
  config: SimpleSubRowConfig<TData>
): ColumnDef<TData>[] {
  return columns.map(column => wrapColumnWithSubRowSupport(column, config));
}

/**
 * Create a simplified sub-row configuration from minimal input
 */
export function createSimpleSubRowConfig<TData extends ExportableData>(
  getSubRows: (row: TData) => TData[] | undefined,
  overrides?: Partial<SimpleSubRowConfig<TData>>
): SimpleSubRowConfig<TData> {
  return {
    ...DEFAULT_SUB_ROW_CONFIG,
    getSubRows,
    ...overrides,
  } as SimpleSubRowConfig<TData>;
}

/**
 * Hook to use simplified sub-rows in a component
 */
export function useSimpleSubRows<TData extends ExportableData>(
  config: SimpleSubRowConfig<TData> | ((row: TData) => TData[] | undefined)
) {
  // Allow passing just the getSubRows function for simplicity
  const fullConfig = typeof config === 'function' 
    ? createSimpleSubRowConfig(config)
    : config;

  return {
    getSubRows: fullConfig.getSubRows,
    getRowCanExpand: (row: { original: TData }) => isParentRow(row.original, fullConfig),
    processColumns: (columns: ColumnDef<TData>[]) => processColumnsForSubRows(columns, fullConfig),
    exportConfig: fullConfig.export,
    visualConfig: fullConfig.visual,
  };
}

/**
 * Flatten hierarchical data for export
 */
export function flattenHierarchicalData<TData extends ExportableData>(
  data: TData[],
  config: SimpleSubRowConfig<TData>
): TData[] {
  const result: TData[] = [];
  const exportConfig = config.export ?? DEFAULT_SUB_ROW_CONFIG.export!;

  if (!exportConfig.includeSubRows) {
    return data;
  }

  const processRow = (row: TData, depth: number = 0) => {
    // Add the row (with indentation for visual hierarchy in exports)
    if (depth > 0 && exportConfig.indentString) {
      // Clone the row and add indentation to the first string field
      const indentedRow = { ...row };
      const firstStringKey = Object.keys(row).find(key => 
        typeof row[key] === 'string' && row[key]
      );
      if (firstStringKey) {
        (indentedRow as any)[firstStringKey] = 
          exportConfig.indentString.repeat(depth) + row[firstStringKey];
      }
      result.push(indentedRow);
    } else {
      result.push(row);
    }

    // Process sub-rows
    const subRows = config.getSubRows(row);
    if (subRows && subRows.length > 0) {
      subRows.forEach(subRow => processRow(subRow, depth + 1));
    }
  };

  data.forEach(row => processRow(row));
  return result;
}

/**
 * Common presets for typical use cases
 */
export const SUB_ROW_PRESETS = {
  /**
   * E-commerce orders with products
   */
  ecommerce: {
    getSubRows: (row: any) => row.products || row.items || row.subRows,
    type: 'different' as const,
    visual: {
      indentSize: 24,
      muteSubRows: true,
    },
    export: {
      strategy: 'flatten' as const,
      indentString: '  ',
      includeSubRows: true,
    },
  },

  /**
   * Users with related records (expenses, tasks, etc.)
   */
  userRecords: {
    getSubRows: (row: any) => row.subRows || row.records || row.children,
    type: 'different' as const,
    visual: {
      indentSize: 24,
      muteSubRows: true,
    },
    export: {
      strategy: 'flatten' as const,
      indentString: '  ',
      includeSubRows: true,
    },
  },

  /**
   * Hierarchical categories or folders
   */
  hierarchy: {
    getSubRows: (row: any) => row.children || row.subItems,
    type: 'unified' as const,
    visual: {
      indentSize: 20,
      muteSubRows: false,
      showLines: true,
    },
    export: {
      strategy: 'flatten' as const,
      indentString: '→ ',
      includeSubRows: true,
    },
  },

  /**
   * Project tasks with subtasks
   */
  projectTasks: {
    getSubRows: (row: any) => row.subtasks || row.children,
    type: 'unified' as const,
    visual: {
      indentSize: 24,
      muteSubRows: true,
    },
    export: {
      strategy: 'flatten' as const,
      indentString: '  ',
      includeSubRows: true,
    },
  },
} as const;
