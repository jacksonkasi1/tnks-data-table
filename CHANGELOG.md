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