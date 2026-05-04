// hooks/useDebounce.js
import { useEffect, useState } from 'react';

/**
 * Debounce a value to delay updates until after a specified delay.
 * Useful for search inputs, filter fields, etc.
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default 500)
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}