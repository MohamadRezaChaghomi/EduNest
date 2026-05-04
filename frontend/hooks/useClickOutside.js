// hooks/useClickOutside.js
import { useEffect, useRef } from 'react';

/**
 * Detect clicks outside a given element.
 * @param {function} handler - Callback when outside click occurs
 * @returns {React.RefObject} Ref to attach to the target element
 */
export function useClickOutside(handler) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler(event);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handler]);

  return ref;
}