import { createJSONStorage, persist } from 'zustand/middleware';
import { getPersistentStorage } from './storage';
import { createBoundStore } from './createBoundStore';

export type Theme = 'dark' | 'light' | 'auto';

export interface PanelVisibility {
  sidebar: boolean;
  watchlist: boolean;
  orderBook: boolean;
  trades: boolean;
  chat: boolean;
  alerts: boolean;
}

interface UiStoreState {
  theme: Theme;
  panelVisibility: PanelVisibility;
  devConsoleVisible: boolean;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  compactMode: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  setPanelVisibility: (panel: keyof PanelVisibility, visible: boolean) => void;
  togglePanel: (panel: keyof PanelVisibility) => void;
  setDevConsoleVisible: (visible: boolean) => void;
  toggleDevConsole: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  reset: () => void;
}

const defaultPanelVisibility: PanelVisibility = {
  sidebar: true,
  watchlist: true,
  orderBook: true,
  trades: true,
  chat: false,
  alerts: true,
};

const initialState = {
  theme: 'dark' as Theme,
  panelVisibility: defaultPanelVisibility,
  devConsoleVisible: false,
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  notificationsEnabled: true,
  soundEnabled: true,
  animationsEnabled: true,
  compactMode: false,
};

const storeResult = createBoundStore<UiStoreState>((set, get) =>
  persist(
    {
      ...initialState,

      setTheme: theme => {
        if (get().theme === theme) return;
        set({ theme });
      },

      setPanelVisibility: (panel, visible) => {
        set(state => ({
          panelVisibility: {
            ...state.panelVisibility,
            [panel]: visible,
          },
        }));
      },

      togglePanel: panel => {
        set(state => ({
          panelVisibility: {
            ...state.panelVisibility,
            [panel]: !state.panelVisibility[panel],
          },
        }));
      },

      setDevConsoleVisible: visible => {
        if (get().devConsoleVisible === visible) return;
        set({ devConsoleVisible: visible });
      },

      toggleDevConsole: () => {
        set(state => ({ devConsoleVisible: !state.devConsoleVisible }));
      },

      setSidebarCollapsed: collapsed => {
        if (get().sidebarCollapsed === collapsed) return;
        set({ sidebarCollapsed: collapsed });
      },

      toggleSidebar: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setCommandPaletteOpen: open => {
        if (get().commandPaletteOpen === open) return;
        set({ commandPaletteOpen: open });
      },

      setNotificationsEnabled: enabled => {
        if (get().notificationsEnabled === enabled) return;
        set({ notificationsEnabled: enabled });
      },

      setSoundEnabled: enabled => {
        if (get().soundEnabled === enabled) return;
        set({ soundEnabled: enabled });
      },

      setAnimationsEnabled: enabled => {
        if (get().animationsEnabled === enabled) return;
        set({ animationsEnabled: enabled });
      },

      setCompactMode: compact => {
        if (get().compactMode === compact) return;
        set({ compactMode: compact });
      },

      reset: () => {
        set(initialState);
      },
    },
    {
      name: 'eclipse-ui-store',
      storage: createJSONStorage(getPersistentStorage),
      partialize: state => ({
        theme: state.theme,
        panelVisibility: state.panelVisibility,
        sidebarCollapsed: state.sidebarCollapsed,
        notificationsEnabled: state.notificationsEnabled,
        soundEnabled: state.soundEnabled,
        animationsEnabled: state.animationsEnabled,
        compactMode: state.compactMode,
      }),
    }
  )
);

export const useUiStore = storeResult.useStore;
export const uiStore = storeResult.store;

export const usePanelVisibility = (panel: keyof PanelVisibility) => {
  return useUiStore(state => state.panelVisibility[panel]);
};

export const useDevConsole = () => {
  return useUiStore(state => ({
    visible: state.devConsoleVisible,
    toggle: state.toggleDevConsole,
  }));
};
