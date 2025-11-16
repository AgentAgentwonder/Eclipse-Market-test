import { useState, useEffect } from 'react';

export interface V0AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Replacing Next.js-style async data fetching with React/Vite equivalent
export function useV0Async<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
): V0AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<V0AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await asyncFn();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchDataWithCleanup = async () => {
      if (!isMounted) return;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const data = await asyncFn();
        if (isMounted) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
          });
        }
      }
    };

    fetchDataWithCleanup();

    return () => {
      isMounted = false;
    };
  }, [deps, asyncFn]);

  return { ...state, refetch: fetchData };
}
