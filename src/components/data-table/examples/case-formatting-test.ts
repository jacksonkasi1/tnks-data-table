/**
 * Test example to demonstrate flexible case formatting
 * 
 * This file shows how the case conversion works with real examples
 */

import { 
  toSnakeCase, 
  toCamelCase, 
  toPascalCase, 
  toKebabCase, 
  convertCase,
  convertObjectKeys,
  createParameterMapping,
  createCustomParameterMapping
} from '../utils/case-conversion';

// Test data representing typical API parameters
const testParameters = {
  page: 1,
  limit: 10,
  search: "john doe",
  sortBy: "created_at",
  sortOrder: "desc",
  fromDate: "2023-01-01",
  toDate: "2023-12-31"
};

console.log('=== Case Formatting Test Examples ===\n');

// Test 1: Individual string conversions
console.log('1. Individual String Conversions:');
console.log('   sortBy -> snake_case:', toSnakeCase("sortBy"));
console.log('   sort_by -> camelCase:', toCamelCase("sort_by"));
console.log('   sortBy -> PascalCase:', toPascalCase("sortBy"));
console.log('   sortBy -> kebab-case:', toKebabCase("sortBy"));
console.log('');

// Test 2: Object key conversions
console.log('2. Object Key Conversions:');
console.log('   Original:', testParameters);
console.log('   Snake case:', convertObjectKeys(testParameters, 'snake_case'));
console.log('   Camel case:', convertObjectKeys(testParameters, 'camelCase'));
console.log('   Pascal case:', convertObjectKeys(testParameters, 'PascalCase'));
console.log('   Kebab case:', convertObjectKeys(testParameters, 'kebab-case'));
console.log('');

// Test 3: Parameter mapping functions
console.log('3. Parameter Mapping Functions:');

const snakeCaseMapper = createParameterMapping('snake_case');
const camelCaseMapper = createParameterMapping('camelCase');
const kebabCaseMapper = createParameterMapping('kebab-case');

console.log('   Snake case mapping:', snakeCaseMapper(testParameters));
console.log('   Camel case mapping:', camelCaseMapper(testParameters));
console.log('   Kebab case mapping:', kebabCaseMapper(testParameters));
console.log('');

// Test 4: Custom parameter mapping
console.log('4. Custom Parameter Mapping:');

const customMapper = createCustomParameterMapping({
  page: 'currentPage',
  limit: 'itemsPerPage',
  search: 'searchTerm',
  sortBy: 'orderBy',
  sortOrder: 'orderDirection',
  fromDate: 'startDate',
  toDate: 'endDate'
});

console.log('   Custom mapping:', customMapper(testParameters));
console.log('');

// Test 5: Real-world API scenarios
console.log('5. Real-world API Scenarios:');

// GraphQL API example
const graphqlMapper = createCustomParameterMapping({
  limit: 'first',
  search: 'filter',
  sortBy: 'orderBy.field',
  sortOrder: 'orderBy.direction'
});

console.log('   GraphQL parameters:', graphqlMapper(testParameters));

// REST API with different conventions
const restApiMapper = createParameterMapping('camelCase');
console.log('   REST API (camelCase):', restApiMapper(testParameters));

// Legacy API with custom names
const legacyMapper = createCustomParameterMapping({
  page: 'pageNumber',
  limit: 'recordsPerPage',
  search: 'query',
  sortBy: 'sortField',
  sortOrder: 'sortDirection',
  fromDate: 'dateFrom',
  toDate: 'dateTo'
});

console.log('   Legacy API:', legacyMapper(testParameters));

console.log('\n=== Test completed successfully! ===');

// Export for potential use in actual tests
export {
  testParameters,
  snakeCaseMapper,
  camelCaseMapper,
  kebabCaseMapper,
  customMapper,
  graphqlMapper,
  restApiMapper,
  legacyMapper
};