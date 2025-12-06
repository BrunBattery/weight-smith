import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for persisting state to localStorage.
 * Handles JSON serialization/deserialization and error handling.
 * 
 * @param key - The localStorage key
 * @param defaultValue - The default value if nothing is stored
 * @returns A tuple of [value, setValue] similar to useState
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state with value from localStorage or default
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) {
        return defaultValue;
      }
      const parsed = JSON.parse(saved);
      // Validate parsed value matches expected type
      if (typeof parsed === typeof defaultValue || 
          (Array.isArray(defaultValue) && Array.isArray(parsed))) {
        return parsed;
      }
      return defaultValue;
    } catch {
      return defaultValue;
    }
  });

  // Sync to localStorage whenever value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to save ${key} to localStorage:`, e);
    }
  }, [key, value]);

  // Wrapper to allow functional updates like useState
  const setValueWrapper = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const resolved = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prev) 
        : newValue;
      return resolved;
    });
  }, []);

  return [value, setValueWrapper];
}

/**
 * Variant that stores numbers directly (not JSON) for backwards compatibility.
 * Use this for weight/reps which were stored as raw strings.
 */
export function useLocalStorageNumber(
  key: string,
  defaultValue: number
): [number, (value: number) => void] {
  const [value, setValue] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) {
        return defaultValue;
      }
      const parsed = parseFloat(saved);
      return isNaN(parsed) ? defaultValue : parsed;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, value.toString());
    } catch (e) {
      console.error(`Failed to save ${key} to localStorage:`, e);
    }
  }, [key, value]);

  return [value, setValue];
}

/**
 * Variant that stores strings directly for backwards compatibility.
 */
export function useLocalStorageString(
  key: string,
  defaultValue: string
): [string, (value: string) => void] {
  const [value, setValue] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ?? defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(`Failed to save ${key} to localStorage:`, e);
    }
  }, [key, value]);

  return [value, setValue];
}

