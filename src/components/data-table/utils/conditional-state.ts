import { useState } from "react";
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
    // For non-URL state, use regular React state
    const [state, setStateInternal] = useState<T>(defaultValue);
    
    // Only use URL state if enabled in config
    if (enableUrlState) {
      return useUrlState<T>(key, defaultValue, options);
    }

    // Create a compatible setState function that matches the SetStateWithPromise signature
    const setState: SetStateWithPromise<T> = (valueOrUpdater) => {
      setStateInternal(valueOrUpdater);
      return undefined; // Return undefined instead of void to match the type
    };

    // Otherwise use regular React state with the compatible wrapper
    return [state, setState] as const;
  };
} 