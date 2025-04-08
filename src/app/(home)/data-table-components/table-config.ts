/**
 * Table configuration options
 * This file provides centralized configuration for the data table features
 */
import { useState } from 'react';

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
}

// Default configuration
const defaultConfig: TableConfig = {
  enableRowSelection: false,      // Row selection disabled by default
  enableKeyboardNavigation: true, // Keyboard navigation enabled by default
  enableClickRowSelect: false,    // Clicking row to select disabled by default
  enablePagination: true,         // Pagination enabled by default
  enableSearch: true,             // Search enabled by default
  enableColumnFilters: true,      // Column filters enabled by default
  enableDateFilter: true,         // Date filter enabled by default
  enableColumnVisibility: true,   // Column visibility options enabled by default
  enableExport: true,             // Data export enabled by default
  enableUrlState: true,           // URL state persistence enabled by default
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