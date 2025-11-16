import { useState, useEffect } from 'react';

export interface V0LocalStorageOptions<T> {
  key: string;
  defaultValue: T;
  serializer?: {
    read: (value: string) => T;
    write: (value: T) => string;
  };
}

// Replacing Next.js-style localStorage hooks with React/Vite equivalent
export function useV0LocalStorage<T>({
  key,
  defaultValue,
  serializer = {
    read: (v: string) => {
      try {
        return JSON.parse(v);
      } catch {
        return defaultValue;
      }
    },
    write: (v: T) => JSON.stringify(v),
  },
}: V0LocalStorageOptions<T>) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? serializer.read(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, serializer.write(state));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state, serializer]);

  return [state, setState] as const;
}
