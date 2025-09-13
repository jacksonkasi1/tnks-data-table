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