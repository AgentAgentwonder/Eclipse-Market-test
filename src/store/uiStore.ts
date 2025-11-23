import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getPersistentStorage } from './storage';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface LoadingState {
  id: string;
  message?: string;
  progress?: number;
}

export interface UIStoreState {
  // Global loading states
  loadingStates: LoadingState[];
  setLoading: (id: string, loading: boolean, message?: string, progress?: number) => void;
  clearLoading: (id: string) => void;
  clearAllLoading: () => void;
  isLoading: (id?: string) => boolean;

  // Toast notifications
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Error handling
  globalError: Error | null;
  setGlobalError: (error: Error | null) => void;
  clearGlobalError: () => void;

  // Dev console state
  devConsoleOpen: boolean;
  setDevConsoleOpen: (open: boolean) => void;

  // App-wide loading overlay
  isAppLoading: boolean;
  appLoadingMessage?: string;
  setAppLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIStoreState>()(
  persist(
    (set, get) => ({
      // Loading states
      loadingStates: [],
      setLoading: (id, loading, message, progress) =>
        set(state => {
          const existingIndex = state.loadingStates.findIndex(s => s.id === id);
          if (loading) {
            const newState = { id, message, progress };
            if (existingIndex >= 0) {
              return {
                loadingStates: state.loadingStates.map((s, i) =>
                  i === existingIndex ? newState : s
                ),
              };
            } else {
              return {
                loadingStates: [...state.loadingStates, newState],
              };
            }
          } else {
            return {
              loadingStates: state.loadingStates.filter(s => s.id !== id),
            };
          }
        }),
      clearLoading: id =>
        set(state => ({
          loadingStates: state.loadingStates.filter(s => s.id !== id),
        })),
      clearAllLoading: () => set({ loadingStates: [] }),
      isLoading: id => {
        const states = get().loadingStates;
        return id ? states.some(s => s.id === id) : states.length > 0;
      },

      // Toast notifications
      toasts: [],
      addToast: toast => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const newToast: ToastMessage = { ...toast, id };
        set(state => ({
          toasts: [...state.toasts, newToast],
        }));

        // Auto-remove toast after duration (default 5 seconds)
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, duration);
        }

        return id;
      },
      removeToast: id =>
        set(state => ({
          toasts: state.toasts.filter(t => t.id !== id),
        })),
      clearToasts: () => set({ toasts: [] }),

      // Error handling
      globalError: null,
      setGlobalError: error => set({ globalError: error }),
      clearGlobalError: () => set({ globalError: null }),

      // Dev console
      devConsoleOpen: false,
      setDevConsoleOpen: open => set({ devConsoleOpen: open }),

      // App loading overlay
      isAppLoading: false,
      appLoadingMessage: undefined,
      setAppLoading: (loading, message) =>
        set({
          isAppLoading: loading,
          appLoadingMessage: loading ? message : undefined,
        }),
    }),
    {
      name: 'eclipse-ui-store',
      storage: createJSONStorage(getPersistentStorage),
      partialize: state => ({
        devConsoleOpen: state.devConsoleOpen,
      }),
    }
  )
);
