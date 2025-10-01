import { useState, useMemo, useCallback } from "react";
import { useUrlState } from "./url-state";

/**
 * Type for the setState function that might return a Promise
 */
type SetStateWithPromise<T> = (value: T | ((prevValue: T) => T)) => Promise<URLSearchParams> | undefined;

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
  ): readonly [T, SetStateWithPromise<T>] {
    // Always call both hooks to satisfy React hooks rules
    const [regularState, setRegularState] = useState<T>(defaultValue);
    const [urlState, setUrlState] = useUrlState<T>(key, defaultValue, options);
    
    // Create a compatible setState function for regular state that matches the SetStateWithPromise signature
    const setRegularStateWrapper = useCallback((valueOrUpdater: T | ((prevValue: T) => T)) => {
      setRegularState(valueOrUpdater);
      return undefined; // Return undefined instead of void to match the type
    }, []);
    
    // Return the appropriate state and setter based on config
    return useMemo(() => {
      if (enableUrlState) {
        return [urlState, setUrlState] as const;
      }
      
      return [regularState, setRegularStateWrapper] as const;
    }, [enableUrlState, regularState, urlState, setUrlState, setRegularStateWrapper]);
  };
} 