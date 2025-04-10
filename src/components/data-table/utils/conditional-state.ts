import { useState, Dispatch, SetStateAction } from "react";
import { useUrlState } from "./url-state";

/**
 * Creates a state hook that can conditionally use URL state or regular React state
 * based on a configuration flag
 * 
 * @param enableUrlState - Whether to use URL state (true) or regular React state (false)
 * @returns A hook function that behaves like useState but with conditional URL persistence
 */
export function createConditionalStateHook(enableUrlState: boolean) {
  return function useConditionalState<T>(
    key: string, 
    defaultValue: T, 
    options = {}
  ): readonly [T, Dispatch<SetStateAction<T>>] {
    // For non-URL state, use regular React state
    const [state, setState] = useState<T>(defaultValue);
    
    // Only use URL state if enabled in config
    if (enableUrlState) {
      return useUrlState<T>(key, defaultValue, options);
    }
    
    // Otherwise use regular React state
    return [state, setState] as const;
  };
} 