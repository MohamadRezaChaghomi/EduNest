// hooks/useAsyncEffect.js
import { useEffect, useRef } from 'react';

/**
 * A custom hook to safely run async effects without causing the
 * "Calling setState synchronously within an effect" warning.
 *
 * @param {Function} asyncFunction - Async function that performs the effect.
 * @param {Array} deps - Dependencies array (same as useEffect).
 */
export function useAsyncEffect(asyncFunction, deps = []) {
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const execute = async () => {
      await asyncFunction(isMounted);
    };
    execute();

    return () => {
      isMounted.current = false;
    };
  }, deps);
}