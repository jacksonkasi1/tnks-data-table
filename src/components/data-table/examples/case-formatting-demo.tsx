/**
 * Demo component showing case formatting in action
 */

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Simulate different API endpoints with different case expectations
const mockApiEndpoints = {
  snakeCase: async (params: any) => {
    console.log('Snake case API received:', params);
    return {
      success: true,
      data: [],
      pagination: { page: params.page, limit: params.limit, total_pages: 1, total_items: 0 },
      receivedParams: params
    };
  },
  
  camelCase: async (params: any) => {
    console.log('Camel case API received:', params);
    return {
      success: true,
      data: [],
      pagination: { page: params.page, limit: params.limit, total_pages: 1, total_items: 0 },
      receivedParams: params
    };
  },
  
  kebabCase: async (params: any) => {
    console.log('Kebab case API received:', params);
    return {
      success: true,
      data: [],
      pagination: { page: params.page, limit: params.limit, total_pages: 1, total_items: 0 },
      receivedParams: params
    };
  },
  
  customFormat: async (params: any) => {
    console.log('Custom format API received:', params);
    return {
      success: true,
      data: [],
      pagination: { page: params.currentPage, limit: params.itemsPerPage, total_pages: 1, total_items: 0 },
      receivedParams: params
    };
  }
};

// Configuration examples for different case formats
const caseFormatConfigs = {
  snakeCase: {
    title: "Snake Case (Default)",
    description: "Traditional snake_case format for backward compatibility",
    config: {
      // No configuration needed - snake_case is default
    },
    expectedParams: {
      page: 1,
      limit: 10,
      search: "test",
      sort_by: "created_at",
      sort_order: "desc",
      from_date: "2023-01-01",
      to_date: "2023-12-31"
    }
  },
  
  camelCase: {
    title: "Camel Case",
    description: "Modern JavaScript/JSON API format",
    config: {
      parameterFormat: 'camelCase' as const
    },
    expectedParams: {
      page: 1,
      limit: 10,
      search: "test",
      sortBy: "created_at",
      sortOrder: "desc",
      fromDate: "2023-01-01",
      toDate: "2023-12-31"
    }
  },
  
  kebabCase: {
    title: "Kebab Case",
    description: "URL-friendly kebab-case format",
    config: {
      parameterFormat: 'kebab-case' as const
    },
    expectedParams: {
      page: 1,
      limit: 10,
      search: "test",
      "sort-by": "created_at",
      "sort-order": "desc",
      "from-date": "2023-01-01",
      "to-date": "2023-12-31"
    }
  },
  
  customFormat: {
    title: "Custom Mapping",
    description: "Custom parameter names for specific API requirements",
    config: {
      parameterMapping: (params: any) => ({
        currentPage: params.page,
        itemsPerPage: params.limit,
        searchTerm: params.search,
        orderBy: params.sort_by,
        orderDirection: params.sort_order,
        startDate: params.from_date,
        endDate: params.to_date
      })
    },
    expectedParams: {
      currentPage: 1,
      itemsPerPage: 10,
      searchTerm: "test",
      orderBy: "created_at",
      orderDirection: "desc",
      startDate: "2023-01-01",
      endDate: "2023-12-31"
    }
  }
};

export function CaseFormattingDemo() {
  const [lastApiCall, setLastApiCall] = useState<any>(null);
  const [activeDemo, setActiveDemo] = useState<string>('snakeCase');

  const simulateApiCall = async (format: keyof typeof caseFormatConfigs) => {
    const config = caseFormatConfigs[format];
    const mockParams = {
      page: 1,
      limit: 10,
      search: "test search",
      sort_by: "created_at",
      sort_order: "desc",
      from_date: "2023-01-01",
      to_date: "2023-12-31"
    };

    // Apply the same transformation that DataTable would apply
    let transformedParams = mockParams;
    
    if (config.config.parameterMapping) {
      transformedParams = config.config.parameterMapping(mockParams);
    } else if (config.config.parameterFormat) {
      // Simulate case conversion (simplified)
      const { createParameterMapping } = await import('../utils/case-conversion');
      const mapper = createParameterMapping(config.config.parameterFormat);
      transformedParams = mapper(mockParams);
    }

    // Call the appropriate mock API
    const apiFunction = mockApiEndpoints[format as keyof typeof mockApiEndpoints] || mockApiEndpoints.snakeCase;
    const result = await apiFunction(transformedParams);
    
    setLastApiCall({
      format,
      originalParams: mockParams,
      transformedParams,
      apiResponse: result
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Case Formatting Demo</CardTitle>
          <CardDescription>
            Demonstrate how the DataTable component can adapt to different API parameter formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeDemo} onValueChange={setActiveDemo}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="snakeCase">Snake Case</TabsTrigger>
              <TabsTrigger value="camelCase">Camel Case</TabsTrigger>
              <TabsTrigger value="kebabCase">Kebab Case</TabsTrigger>
              <TabsTrigger value="customFormat">Custom</TabsTrigger>
            </TabsList>
            
            {Object.entries(caseFormatConfigs).map(([key, config]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {config.title}
                      <Badge variant="outline">{key}</Badge>
                    </CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Configuration:</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                        {JSON.stringify(config.config, null, 2)}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Expected API Parameters:</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                        {JSON.stringify(config.expectedParams, null, 2)}
                      </pre>
                    </div>
                    
                    <Button onClick={() => simulateApiCall(key as keyof typeof caseFormatConfigs)}>
                      Simulate API Call
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
          
          {lastApiCall && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Last API Call Result</CardTitle>
                <CardDescription>
                  Format: <Badge>{lastApiCall.format}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Original Parameters (Internal):</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(lastApiCall.originalParams, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Transformed Parameters (Sent to API):</h4>
                  <pre className="bg-blue-50 p-3 rounded text-sm overflow-x-auto border-l-4 border-blue-500">
                    {JSON.stringify(lastApiCall.transformedParams, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">API Response:</h4>
                  <pre className="bg-green-50 p-3 rounded text-sm overflow-x-auto border-l-4 border-green-500">
                    {JSON.stringify(lastApiCall.apiResponse, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}