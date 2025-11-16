import { useState, useEffect } from 'react';

export interface V0MediaQueryOptions {
  fallback?: boolean;
}

// Replacing Next.js-style media query hooks with React/Vite equivalent
export function useV0MediaQuery(
  query: string,
  { fallback = false }: V0MediaQueryOptions = {}
): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') {
      return fallback;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener('change', listener);
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}

export function useV0Breakpoint() {
  const isMobile = useV0MediaQuery('(max-width: 768px)');
  const isTablet = useV0MediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useV0MediaQuery('(min-width: 1025px)');

  return {
    isMobile,
    isTablet,
    isDesktop,
  };
}
