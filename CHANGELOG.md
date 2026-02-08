# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [0.5.0] - 2026-02-08

### Added
- **Framework Support**: Added documentation for Vite integration and framework compatibility
- **CSS Setup**: Added CSS installation steps for manual setup

### Changed
- **UI Components**: Major update to UI components foundation
- **Documentation**: Clarified manual installation steps and updated framework support details

### Fixed
- **Hydration Error**: Fixed hydration mismatch error by adding `suppressHydrationWarning` to body
- **Accessibility**:
  - Fixed input-group accessibility issues
  - Updated PopoverTitle to use correct heading element
- **Imports**: Corrected Radix UI imports in dialog component
- **Registry**: Fixed registry dependencies for correct component installation

### Chore
- **Dependencies**: Updated project dependencies to latest versions

## [0.4.0] - 2025-11-18

### Added
- **Hierarchical Subrows Feature**: Complete implementation with three rendering modes
  - `same-columns` mode: Parent and child rows share the same column structure
  - `custom-columns` mode: Different columns for parent rows and subrows
  - `custom-component` mode: Custom React components for rendering subrows
  - Expand/collapse functionality with animated expand icon component
  - Support for nested data structures with `getSubRows` and `getExpandedRowModel`
  - Configurable subrow indentation and display options
  - Cross-page selection support for hierarchical data structures
  - Export functionality with flatten and parent-only options

- **Three Complete Example Implementations**:
  - **Orders Example**: Hierarchical order management with order items (same-columns mode)
    - Parent-child relationships demonstrating nested data structures
    - CRUD operations (add, delete orders and order items)
    - Row actions and bulk operations
  - **Bookings Example**: Logistics bookings with booking stops (custom-columns mode)
    - Different columns for parent bookings vs. child stops
    - Demonstrates custom column structures for hierarchical data
  - **Tickets Example**: Ticket management with comments (custom-component mode)
    - Custom comment component for rendering ticket discussions
    - Shows flexibility of component-based subrow rendering

- **Comprehensive Fumadocs Documentation Site**:
  - Getting Started guides (installation, file structure)
  - API documentation with interactive examples
  - Configuration guides (case format, URL state management)
  - Core concepts and feature documentation
  - Subrows feature documentation with all three modes
  - Data export customization guide
  - Best practices and troubleshooting guides
  - Multi-language support and advanced search

- **New Database Tables & API Endpoints**:
  - Orders and Order Items tables with full CRUD operations
  - Bookings and Booking Stops tables for logistics management
  - Tickets and Ticket Comments tables for support tracking
  - Comprehensive seed data (200 orders with 2,714 items, 150 bookings, 100 tickets)
  - Batch fetch endpoints (`get-orders-by-ids`, `get-bookings-by-ids`, `get-tickets-by-ids`)
  - Server-side grouping endpoints with N+1 query optimization

- **Data Table Enhancements**:
  - `expand-icon.tsx` component with smooth animations
  - `subrow-columns.tsx` helper for creating subrow-specific columns
  - Status badge component with predefined status styles
  - Currency formatting utilities
  - Date formatting helpers
  - Reusable column helper functions

- **Shadcn Registry Updates**:
  - Added `expand-icon.tsx` to component registry
  - Updated dependencies: replaced `xlsx` with `exceljs` for better Excel support
  - Updated component descriptions to mention hierarchical subrows
  - Regenerated all registry JSON files with latest component changes

### Changed
- **Export Functionality**: Enhanced to support hierarchical data structures
  - Flatten option to export all parent and child rows
  - Parent-only option to export only top-level data
  - Cross-page selection for exporting selected items across multiple pages
  - Updated `export-utils.ts` with subrow handling logic

- **Performance Optimizations**:
  - Optimized subrow rendering and sorting performance
  - Reduced N+1 queries in API endpoints with batch fetching
  - Improved checkbox state logic for parent-child relationships
  - Better handling of expanded state management

- **Documentation Structure**:
  - Moved legacy docs to `legacy_docs/` directory
  - Created new comprehensive documentation site in `docs/` directory
  - Updated README.md with subrows feature overview
  - Added progress reports and quality reports

### Fixed
- **Selection Issues**: Resolved selection conflicts with hierarchical data
  - Fixed checkbox state management for parent and child rows
  - Proper row ID generation for nested structures
  - Cross-page selection now works correctly with subrows

- **Data Table Styling**:
  - Removed background color classes from table rows for better theming
  - Increased expand icon size for better visibility
  - Fixed modal behavior for dropdown menus in subrows

### Technical Details
- **Files Changed**: 186 files modified/created
- **Code Changes**: +26,151 insertions, -3,444 deletions
- **Performance**: Server-side grouping with configurable row limits
- **Type Safety**: Full TypeScript support for all subrow configurations
- **Testing**: All examples pass typecheck, lint, and build processes

## [0.3.2] - 2025-10-02

### Added
- **Shadcn Registry Support**: Complete registry implementation for easy component installation
  - Created `registry.json` with proper schema and component definitions
  - Added `scripts/build-registry.ts` for automated registry file generation
  - Generated registry JSON files in `public/r/` directory (data-table.json, calendar-date-picker.json)
  - Added `registry:build` npm script for building registry
  - Created `vercel.json` with proper CORS and caching headers for registry endpoints
  - Organized registry files in `registry/default/` directory structure

### Changed
- **Installation Documentation**: Updated README.md with comprehensive installation methods
  - Added "Quick Start" section with single-command installation
  - Added "Method 1: Using Shadcn Registry (Recommended)" section with remote and local installation
  - Added "Method 2: Manual Installation" section for step-by-step setup
  - Updated installation URLs to use deployed Vercel URL (https://tnks-data-table.vercel.app)
  - Clarified required Shadcn UI component prerequisites
  - Improved installation flow and user experience

### Fixed
- **Registry Import Paths**: Fixed import path in `calendar-date-picker.tsx` for registry compatibility
  - Changed from relative import `./ui/calendar` to absolute import `@/components/ui/calendar`
  - Ensures proper module resolution when installed via Shadcn CLI

## [0.3.1] - 2025-10-01

### Fixed
- **Type Safety Improvements**: Removed all `any` types and replaced with proper TypeScript types
  - Fixed `DataTableResizer` component with proper `Header<TData, unknown>` and `Table<TData>` types
  - Fixed `DataTableRowActions` with correct `Table<TData>` type instead of `any`
  - Added `UserRowFromDb` interface for API route type safety
  - Improved `case-utils` with `ConvertedKeys<T>` type for better type inference
  - Enhanced `column-sizing` with proper type guards and `unknown` instead of `any`

- **Enhanced Validation & Error Handling**: Added comprehensive validation for external data sources
  - Added type guards `hasIdAndSize()` and `hasAccessorKeyAndSize()` for column sizing
  - Implemented `isValidColumnSizing()` validation for localStorage data
  - Enhanced URL state validation with proper JSON structure checks
  - Added empty array checks before accessing array elements in data export
  - Improved primitive value detection before array sorting in deep-utils

- **ID Handling Improvements**: Standardized ID handling to support all ID formats
  - Unified internal ID storage to use strings for consistency
  - Smart type detection for numeric vs string IDs
  - Full support for UUID, Nano ID, and custom string ID formats
  - Proper type conversion when calling fetchByIdsFn API
  - Safe parsing with NaN filtering for numeric conversions

- **localStorage Safety**: Added robust validation for localStorage operations
  - Validates parsed JSON structure before use
  - Checks array and object types with proper type guards
  - Cleans up corrupted data automatically
  - Comprehensive error handling with try-catch blocks

### Changed
- **Code Organization**: Applied import organization style guide across all modified files
  - Proper categorization: types → core packages → components → utils
  - Lowercase category comments following CLAUDE.md guidelines
  - Consistent spacing between import sections
  - Removed non-standard category names

### Added
- **Documentation**: Created comprehensive documentation files
  - `ID_HANDLING.md`: Complete guide for ID format support (UUID, Nano ID, numeric, custom strings)
  - `FINAL_SUMMARY.md`: Detailed summary of all improvements and fixes

## [0.3.0] - 2025-01-15

### Added
- **Default Sort Configuration**: Added `defaultSortBy` and `defaultSortOrder` options to TableConfig
  - Configure initial sort column and direction via table configuration
  - Supports both snake_case and camelCase field names
  - Replaces hard-coded "created_at" default with configurable option
- **Enhanced Case Format Documentation**: Comprehensive documentation for snake_case and camelCase API support
  - Clear examples showing direct API integration without case conversion
  - Migration guide from complex case conversion systems
  - Best practices for case format consistency

### Changed
- **Simplified Default Sort Implementation**: Removed hard-coded default sort values in favor of configuration-driven approach
- **Updated README.md**: Added detailed "Default Sort Configuration" section with examples
- **Enhanced API Documentation**: Improved case format behavior documentation in "Filtering & Sorting" section

### Fixed
- **TypeScript Compatibility**: All type checking, linting, and build processes pass successfully
- **Backward Compatibility**: All existing implementations continue to work unchanged

## [0.2.0] - 2025-08-16

### Added
- Comprehensive onRowClick callback documentation (3f03cf8)
- TypeScript validation npm script (8019457)
- onRowClick callback support for data table rows (90f6c8d)
- Popover information for API response formats in user tables (f1174ea)

### Changed
- Updated titles and improved header consistency (a7b6604)

## [0.1.0] - 2025-08-16

### Added
- Initial release of the data table component
- Basic table functionality with sorting and filtering
- Export capabilities for data
- Responsive design
- TypeScript support
- Next.js integration
- Drizzle ORM integration