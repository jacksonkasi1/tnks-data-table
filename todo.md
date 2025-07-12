# Data Table Component Fixes

## 🔴 High Priority Critical Issues

### 1. Fix Memory Leaks in Debounce Timers
- **File**: `src/components/data-table/hooks/use-table-column-resize.ts:7-21`
- **Issue**: useDebounce creates timeouts without proper cleanup
- **Fix**: Add useRef to track timeouts and ensure cleanup on unmount
- **Status**: Pending

### 2. Secure JSON Parsing with Error Handling
- **File**: `src/components/data-table/utils/url-state.ts:69,168`
- **Issue**: JSON.parse without proper error boundaries
- **Fix**: Wrap JSON.parse in try-catch with fallback values
- **Status**: Pending

### 3. Improve Input Sanitization for XSS Protection
- **File**: `src/components/data-table/utils/search.ts:23`
- **Issue**: Basic sanitization only removes `<>` but allows other dangerous chars
- **Fix**: Comprehensive HTML entity encoding and script tag removal
- **Status**: Pending

### 4. Fix Race Conditions in URL State Management
- **File**: `src/components/data-table/utils/url-state.ts:6-7,254-350`
- **Issue**: Global mutable state causes race conditions
- **Fix**: Replace global state with proper state management pattern
- **Status**: Pending

## 🟡 Medium Priority Performance Issues

### 5. Optimize Performance Bottlenecks and Re-renders
- **Files**: 
  - `src/components/data-table/data-table.tsx:182-196,520-552`
  - `src/components/data-table/utils/deep-utils.ts:55-72,119-140`
- **Issue**: Excessive re-renders and inefficient deep comparisons
- **Fix**: Improve memoization, optimize comparison algorithms
- **Status**: Pending

### 6. Improve Error Handling and Type Safety
- **Files**: 
  - `src/components/data-table/utils/table-state-handlers.ts:4`
  - `src/components/data-table/data-export.tsx:51-65`
  - `src/components/data-table/pagination.tsx:58-71`
- **Issue**: Loose typing and missing error validation
- **Fix**: Stricter types, input validation, error boundaries
- **Status**: Pending

## 🔧 Verification

### 7. Run Type Check and Lint Verification
- **Action**: Ensure all fixes pass TypeScript and ESLint checks
- **Requirement**: No UI/design changes, maintain exact same functionality
- **Status**: Pending

### 8. New issue rised in github:
**Support for Camel Case and Customizable Case Formatting in Table Keys #16**
Currently, the table only supports **snake\_case** formatting for keys. However, in many use cases—especially when working with APIs or backends expecting **camelCase**—this limitation causes integration issues.

**Problem:**
When the frontend is using camelCase by default, the table component continues to pass values in snake\_case, leading to data mismatch or errors when interfacing with camelCase-based backend systems.

**Proposed Enhancement:**

* Add support for **camelCase** formatting.
* Provide a way to **customize** the key format (e.g., snake\_case, camelCase, PascalCase).
* Possibly allow a mapping or formatter function that developers can hook into.

**Why this is important:**
This enhancement will:

* Prevent backend integration issues caused by inconsistent key formatting.
* Improve developer experience by aligning with project-specific naming conventions.
* Make the component more flexible and production-ready for a broader range of applications.

---

## Implementation Notes

- ✅ **No design changes** - UI must remain exactly the same
- ✅ **Type safety** - All fixes must pass TypeScript compilation
- ✅ **Lint compliance** - All fixes must pass ESLint checks
- ✅ **Functionality preserved** - No behavioral changes visible to users

## Priority Order

1. Memory leaks (immediate impact)
2. Security vulnerabilities (XSS, JSON parsing)
3. Race conditions (data consistency)
4. Performance optimizations
5. Type safety improvements
6. Final verification