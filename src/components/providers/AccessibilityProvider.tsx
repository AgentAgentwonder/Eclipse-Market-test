import type { ReactNode } from 'react';
import { useCallback, useEffect } from 'react';
import { useAccessibilityStore, type AccessibilityState } from '@/store/accessibilityStore';
import { useShallow } from 'zustand/react/shallow';

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const selector = useCallback(
    (state: AccessibilityState) => ({
      fontScale: state.fontScale,
      highContrastMode: state.highContrastMode,
      reducedMotion: state.reducedMotion,
    }),
    []
  );

  const { fontScale, highContrastMode, reducedMotion } = useAccessibilityStore(useShallow(selector));

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--font-scale', fontScale.toString());
    root.style.fontSize = `${16 * fontScale}px`;
  }, [fontScale]);

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrastMode);
  }, [highContrastMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', reducedMotion);
  }, [reducedMotion]);

  return <>{children}</>;
}
