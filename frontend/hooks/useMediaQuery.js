// hooks/useMediaQuery.js
import { useEffect, useState } from 'react';

/**
 * Track whether a CSS media query matches.
 * Useful for responsive design decisions in JavaScript.
 * @param {string} query - Media query string, e.g. '(min-width: 768px)'
 * @returns {boolean} Whether the query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}