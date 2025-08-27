import type { ColumnDef, Row } from "@tanstack/react-table";
import type { ExportableData } from "./export-utils";
import type { ReactNode } from "react";

// Enhanced sub-row configuration system
export interface AdvancedSubRowConfig<TData extends ExportableData = ExportableData> {
  // Core sub-row extraction
  getSubRows: (row: TData) => TData[] | undefined;
  
  // Row type detection for flexible rendering
  getRowType?: (row: TData) => string;
  
  // Rendering strategy
  renderingStrategy: 'unified-columns' | 'typed-columns' | 'custom-content' | 'hybrid';
  
  // Strategy 1: Unified columns with row-type-aware cell rendering
  unifiedColumns?: {
    enabled: boolean;
    columns: ColumnDef<TData>[];
    // Custom cell renderer based on row type
    cellRenderer?: {
      [rowType: string]: {
        [columnId: string]: (value: any, row: TData) => ReactNode;
      };
    };
  };
  
  // Strategy 2: Different column sets per row type
  typedColumns?: {
    [rowType: string]: ColumnDef<TData>[];
  };
  
  // Strategy 3: Custom content rendering (no columns)
  customContent?: {
    renderSubRow: (row: Row<TData>) => ReactNode;
    // Optional: still show some columns alongside custom content
    showColumnsWithCustomContent?: boolean;
    customContentColumns?: ColumnDef<TData>[];
  };
  
  // Strategy 4: Hybrid - mix of strategies based on row type
  hybrid?: {
    [rowType: string]: {
      strategy: 'columns' | 'custom';
      columns?: ColumnDef<TData>[];
      customRenderer?: (row: Row<TData>) => ReactNode;
    };
  };
  
  // Visual configuration
  visual?: {
    indentationPx?: number; // Default: 20px per level
    showConnectingLines?: boolean;
    customRowStyles?: {
      [rowType: string]: string; // CSS classes
    };
  };
  
  // Export configuration
  export?: AdvancedSubRowExportConfig<TData>;
}

// Enhanced export configuration
export interface AdvancedSubRowExportConfig<TData extends ExportableData = ExportableData> {
  // Export strategy
  strategy: 'skip' | 'flatten' | 'separate-sheets' | 'nest' | 'smart-auto';
  
  // Column mapping per row type
  columnMappingByType?: {
    [rowType: string]: Record<string, string>;
  };
  
  // Headers per row type
  headersByType?: {
    [rowType: string]: string[];
  };
  
  // Custom field extraction per row type
  fieldExtractorByType?: {
    [rowType: string]: (row: TData) => ExportableData;
  };
  
  // Excel-specific: separate sheets per row type
  excelConfig?: {
    separateSheets: boolean;
    sheetNames?: {
      [rowType: string]: string;
    };
  };
  
  // Flattening configuration
  flatten?: {
    indentationByType?: {
      [rowType: string]: string;
    };
    prefixByType?: {
      [rowType: string]: string;
    };
    maxDepth?: number;
  };
}

// Row type detector utilities
export class RowTypeDetector<TData extends ExportableData> {
  private config: AdvancedSubRowConfig<TData>;
  
  constructor(config: AdvancedSubRowConfig<TData>) {
    this.config = config;
  }
  
  getRowType(row: TData): string {
    if (this.config.getRowType) {
      return this.config.getRowType(row);
    }
    
    // Auto-detect based on common patterns
    if ('orderId' in row || 'orderNumber' in row) return 'order';
    if ('productId' in row || 'productName' in row) return 'product';
    if ('customerId' in row || 'customerName' in row) return 'customer';
    if ('parentId' in row) return 'child';
    
    return 'default';
  }
  
  isParentRow(row: TData): boolean {
    const subRows = this.config.getSubRows(row);
    return subRows !== undefined && subRows.length > 0;
  }
  
  isChildRow(row: TData): boolean {
    return 'parentId' in row || !this.isParentRow(row);
  }
}

// Column configuration builder
export class SubRowColumnBuilder<TData extends ExportableData> {
  private config: AdvancedSubRowConfig<TData>;
  private detector: RowTypeDetector<TData>;
  
  constructor(config: AdvancedSubRowConfig<TData>) {
    this.config = config;
    this.detector = new RowTypeDetector(config);
  }
  
  getColumnsForRowType(rowType: string): ColumnDef<TData>[] {
    switch (this.config.renderingStrategy) {
      case 'unified-columns':
        return this.buildUnifiedColumns();
      
      case 'typed-columns':
        return this.config.typedColumns?.[rowType] || [];
      
      case 'custom-content':
        return this.config.customContent?.customContentColumns || [];
      
      case 'hybrid':
        const hybridConfig = this.config.hybrid?.[rowType];
        if (hybridConfig?.strategy === 'columns') {
          return hybridConfig.columns || [];
        }
        return [];
      
      default:
        return [];
    }
  }
  
  private buildUnifiedColumns(): ColumnDef<TData>[] {
    if (!this.config.unifiedColumns?.columns) return [];
    
    return this.config.unifiedColumns.columns.map(column => ({
      ...column,
      cell: (context) => {
        const rowType = this.detector.getRowType(context.row.original);
        const customRenderer = this.config.unifiedColumns?.cellRenderer?.[rowType]?.[column.id as string];
        
        if (customRenderer) {
          return customRenderer(context.getValue(), context.row.original);
        }
        
        // Default rendering
        if (typeof column.cell === 'function') {
          return column.cell(context);
        }
        
        return context.getValue();
      }
    }));
  }
}

// Export strategy resolver
export class SubRowExportResolver<TData extends ExportableData> {
  private config: AdvancedSubRowConfig<TData>;
  private detector: RowTypeDetector<TData>;
  
  constructor(config: AdvancedSubRowConfig<TData>) {
    this.config = config;
    this.detector = new RowTypeDetector(config);
  }
  
  resolveExportStrategy(data: TData[]): AdvancedSubRowExportConfig<TData>['strategy'] {
    const exportConfig = this.config.export;
    
    if (!exportConfig || exportConfig.strategy !== 'smart-auto') {
      return exportConfig?.strategy || 'flatten';
    }
    
    // Smart auto-detection
    const hasMultipleRowTypes = this.hasMultipleRowTypes(data);
    const hasCustomContent = this.config.renderingStrategy === 'custom-content';
    
    if (hasCustomContent) return 'skip'; // Can't export custom content easily
    if (hasMultipleRowTypes) return 'separate-sheets';
    return 'flatten';
  }
  
  private hasMultipleRowTypes(data: TData[]): boolean {
    const rowTypes = new Set<string>();
    
    const processRow = (row: TData) => {
      rowTypes.add(this.detector.getRowType(row));
      const subRows = this.config.getSubRows(row);
      if (subRows) {
        subRows.forEach(processRow);
      }
    };
    
    data.forEach(processRow);
    return rowTypes.size > 1;
  }
  
  getColumnMappingForRowType(rowType: string): Record<string, string> {
    return this.config.export?.columnMappingByType?.[rowType] || {};
  }
  
  getHeadersForRowType(rowType: string): string[] {
    return this.config.export?.headersByType?.[rowType] || [];
  }
}

// Preset configurations for common use cases
export const SUB_ROW_PRESETS = {
  // E-commerce: Orders with Products
  ecommerce: {
    renderingStrategy: 'unified-columns' as const,
    getRowType: (row: any) => {
      if (row.orderId || row.orderNumber) return 'order';
      if (row.productId || row.productName) return 'product';
      return 'default';
    },
    unifiedColumns: {
      enabled: true,
      cellRenderer: {
        order: {
          name: (value: any, row: any) => `Order #${row.orderNumber || row.orderId}`,
          amount: (value: any, row: any) => `$${row.total || row.amount}`,
          details: (value: any, row: any) => `${row.itemCount || 0} items`
        },
        product: {
          name: (value: any, row: any) => `• ${row.productName || row.name}`,
          amount: (value: any, row: any) => `$${row.price} × ${row.quantity}`,
          details: (value: any, row: any) => row.sku || row.productId
        }
      }
    },
    export: {
      strategy: 'separate-sheets' as const,
      excelConfig: {
        separateSheets: true,
        sheetNames: {
          order: 'Orders',
          product: 'Products'
        }
      }
    }
  },
  
  // Project Management: Projects with Tasks
  projectManagement: {
    renderingStrategy: 'typed-columns' as const,
    getRowType: (row: any) => {
      if (row.projectId) return 'project';
      if (row.taskId) return 'task';
      return 'default';
    },
    typedColumns: {
      project: [
        { accessorKey: 'projectName', header: 'Project' },
        { accessorKey: 'startDate', header: 'Start Date' },
        { accessorKey: 'budget', header: 'Budget' },
        { accessorKey: 'status', header: 'Status' }
      ],
      task: [
        { accessorKey: 'taskName', header: 'Task' },
        { accessorKey: 'assignee', header: 'Assigned To' },
        { accessorKey: 'dueDate', header: 'Due Date' },
        { accessorKey: 'progress', header: 'Progress' }
      ]
    }
  },
  
  // Custom Content: Rich details
  customDetails: {
    renderingStrategy: 'custom-content' as const,
    customContent: {
      renderSubRow: (row: any) => (
        // This would be implemented in the actual component
        null // Placeholder
      ),
      showColumnsWithCustomContent: false
    },
    export: {
      strategy: 'skip' as const
    }
  }
} as const;

export type SubRowPresetName = keyof typeof SUB_ROW_PRESETS;

// Advanced sub-row manager that coordinates all functionality
export class AdvancedSubRowManager<TData extends ExportableData> {
  private config: AdvancedSubRowConfig<TData>;
  private detector: RowTypeDetector<TData>;
  private columnBuilder: SubRowColumnBuilder<TData>;
  private exportResolver: SubRowExportResolver<TData>;

  constructor(config: AdvancedSubRowConfig<TData>) {
    this.config = config;
    this.detector = new RowTypeDetector(config);
    this.columnBuilder = new SubRowColumnBuilder(config);
    this.exportResolver = new SubRowExportResolver(config);
  }

  // Get columns for a specific row type
  getColumnsForRowType(rowType: string): ColumnDef<TData>[] {
    return this.columnBuilder.getColumnsForRowType(rowType);
  }

  // Get all columns with enhanced cell rendering
  getEnhancedColumns(): ColumnDef<TData>[] {
    switch (this.config.renderingStrategy) {
      case 'unified-columns':
        return this.columnBuilder.getColumnsForRowType('default');
      
      case 'typed-columns':
        // Return a unified set that adapts based on row type
        return this.buildAdaptiveColumns();
      
      case 'custom-content':
        return this.config.customContent?.customContentColumns || [];
      
      case 'hybrid':
        return this.buildHybridColumns();
      
      default:
        return [];
    }
  }

  private buildAdaptiveColumns(): ColumnDef<TData>[] {
    if (!this.config.typedColumns) return [];
    
    // Create adaptive columns that show different content based on row type
    const allColumnIds = new Set<string>();
    Object.values(this.config.typedColumns).forEach(columns => {
      columns.forEach(col => {
        if ('accessorKey' in col && typeof col.accessorKey === 'string') {
          allColumnIds.add(col.accessorKey);
        }
      });
    });

    return Array.from(allColumnIds).map(columnId => ({
      accessorKey: columnId as keyof TData,
      header: columnId.charAt(0).toUpperCase() + columnId.slice(1),
      cell: (context) => {
        const rowType = this.detector.getRowType(context.row.original);
        const typeColumns = this.config.typedColumns?.[rowType] || [];
        const column = typeColumns.find(col => 'accessorKey' in col && col.accessorKey === columnId);
        
        if (column?.cell && typeof column.cell === 'function') {
          return column.cell(context);
        }
        
        return context.getValue();
      }
    }));
  }

  private buildHybridColumns(): ColumnDef<TData>[] {
    if (!this.config.hybrid) return [];
    
    // For hybrid strategy, we need to create adaptive columns
    const allColumnIds = new Set<string>();
    Object.values(this.config.hybrid).forEach(hybridConfig => {
      if (hybridConfig.strategy === 'columns' && hybridConfig.columns) {
        hybridConfig.columns.forEach(col => {
          if ('accessorKey' in col && typeof col.accessorKey === 'string') {
            allColumnIds.add(col.accessorKey);
          }
        });
      }
    });

    return Array.from(allColumnIds).map(columnId => ({
      accessorKey: columnId as keyof TData,
      header: columnId.charAt(0).toUpperCase() + columnId.slice(1),
      cell: (context) => {
        const rowType = this.detector.getRowType(context.row.original);
        const hybridConfig = this.config.hybrid?.[rowType];
        
        if (hybridConfig?.strategy === 'custom' && hybridConfig.customRenderer) {
          return hybridConfig.customRenderer(context.row);
        }
        
        if (hybridConfig?.strategy === 'columns' && hybridConfig.columns) {
          const column = hybridConfig.columns.find(col => 'accessorKey' in col && col.accessorKey === columnId);
          if (column?.cell && typeof column.cell === 'function') {
            return column.cell(context);
          }
        }
        
        return context.getValue();
      }
    }));
  }

  // Enhanced export configuration that adapts to the row strategy
  getExportConfiguration(data: TData[]): AdvancedSubRowExportConfig<TData> {
    const strategy = this.exportResolver.resolveExportStrategy(data);
    
    const baseConfig: AdvancedSubRowExportConfig<TData> = {
      strategy,
      ...this.config.export
    };

    // Auto-generate column mappings if not provided
    if (!baseConfig.columnMappingByType) {
      baseConfig.columnMappingByType = this.generateColumnMappings(data);
    }

    // Auto-generate headers if not provided
    if (!baseConfig.headersByType) {
      baseConfig.headersByType = this.generateHeadersByType(data);
    }

    return baseConfig;
  }

  private generateColumnMappings(data: TData[]): Record<string, Record<string, string>> {
    const mappings: Record<string, Record<string, string>> = {};
    const processedTypes = new Set<string>();

    const processRow = (row: TData) => {
      const rowType = this.detector.getRowType(row);
      if (!processedTypes.has(rowType)) {
        mappings[rowType] = {};
        Object.keys(row).forEach(key => {
          mappings[rowType][key] = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        });
        processedTypes.add(rowType);
      }
      
      const subRows = this.config.getSubRows(row);
      if (subRows) {
        subRows.forEach(processRow);
      }
    };

    data.forEach(processRow);
    return mappings;
  }

  private generateHeadersByType(data: TData[]): Record<string, string[]> {
    const headers: Record<string, string[]> = {};
    const processedTypes = new Set<string>();

    const processRow = (row: TData) => {
      const rowType = this.detector.getRowType(row);
      if (!processedTypes.has(rowType)) {
        headers[rowType] = Object.keys(row);
        processedTypes.add(rowType);
      }
      
      const subRows = this.config.getSubRows(row);
      if (subRows) {
        subRows.forEach(processRow);
      }
    };

    data.forEach(processRow);
    return headers;
  }

  // Utility methods for integration
  getRowType(row: TData): string {
    return this.detector.getRowType(row);
  }

  isParentRow(row: TData): boolean {
    return this.detector.isParentRow(row);
  }

  getSubRows(row: TData): TData[] | undefined {
    return this.config.getSubRows(row);
  }

  canExpand(row: TData): boolean {
    return this.isParentRow(row);
  }

  getVisualConfig() {
    return {
      indentationPx: this.config.visual?.indentationPx ?? 20,
      showConnectingLines: this.config.visual?.showConnectingLines ?? false,
      customRowStyles: this.config.visual?.customRowStyles ?? {}
    };
  }
}

// Factory function to create advanced sub-row configuration from presets
export function createAdvancedSubRowConfig<TData extends ExportableData>(
  preset: SubRowPresetName,
  overrides?: Partial<AdvancedSubRowConfig<TData>>
): AdvancedSubRowConfig<TData> {
  const baseConfig = SUB_ROW_PRESETS[preset] as AdvancedSubRowConfig<TData>;
  return {
    ...baseConfig,
    ...overrides
  } as AdvancedSubRowConfig<TData>;
}

// Hook-like function for React components to use advanced sub-rows
export function useAdvancedSubRows<TData extends ExportableData>(
  config: AdvancedSubRowConfig<TData>
) {
  const manager = new AdvancedSubRowManager(config);
  
  return {
    manager,
    getColumns: () => manager.getEnhancedColumns(),
    getSubRows: (row: TData) => manager.getSubRows(row),
    canExpand: (row: TData) => manager.canExpand(row),
    getRowType: (row: TData) => manager.getRowType(row),
    getExportConfig: (data: TData[]) => manager.getExportConfiguration(data),
    getVisualConfig: () => manager.getVisualConfig()
  };
}