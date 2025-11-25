import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { createBoundStoreWithMiddleware } from './createBoundStore';
import { getPersistentStorage } from './storage';

export type LLMProvider = 'claude' | 'gpt4';
export type AppTheme = 'eclipse' | 'midnight' | 'cyber' | 'lunar';

export interface PhantomWalletState {
  connected: boolean;
  address: string;
}

export interface SettingsState {
  databaseUrl: string;
  sentrySdn: string;
  claudeApiKey: string;
  openaiApiKey: string;
  llmProvider: LLMProvider;
  twitterBearerToken: string;
  paperTradingEnabled: boolean;
  paperTradingBalance: number;
  selectedCrypto: string;
  buyInAmounts: number[];
  defaultBuyInAmount: number;
  minMarketCap: number;
  theme: AppTheme;
  phantomWallet: PhantomWalletState;

  // Actions
  updateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => void;
  togglePaperTrading: () => void;
  setPaperTradingBalance: (balance: number) => void;
  resetPaperTradingBalance: () => void;
  addBuyInPreset: (amount: number) => boolean;
  removeBuyInPreset: (amount: number) => void;
  setDefaultBuyIn: (amount: number) => void;
  setTheme: (theme: AppTheme) => void;
  setLLMProvider: (provider: LLMProvider) => void;
  setSelectedCrypto: (crypto: string) => void;
  connectPhantom: (address: string) => void;
  disconnectPhantom: () => void;
  updateAPIKey: (key: 'databaseUrl' | 'sentrySdn' | 'claudeApiKey' | 'openaiApiKey' | 'twitterBearerToken', value: string) => void;
  clearAllSettings: () => void;
  reset: () => void;
}

const DEFAULT_BUY_IN_AMOUNTS = [10, 25, 50, 100];
const DEFAULT_PAPER_TRADING_BALANCE = 10000;

const initialState = {
  databaseUrl: '',
  sentrySdn: '',
  claudeApiKey: '',
  openaiApiKey: '',
  llmProvider: 'claude' as LLMProvider,
  twitterBearerToken: '',
  paperTradingEnabled: false,
  paperTradingBalance: DEFAULT_PAPER_TRADING_BALANCE,
  selectedCrypto: 'SOL',
  buyInAmounts: DEFAULT_BUY_IN_AMOUNTS,
  defaultBuyInAmount: 50,
  minMarketCap: 25000000,
  theme: 'eclipse' as AppTheme,
  phantomWallet: {
    connected: false,
    address: '',
  },
};

const storeResult = createBoundStoreWithMiddleware<SettingsState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        updateSetting: (key, value) => {
          set({ [key]: value });
        },

        togglePaperTrading: () => {
          set(state => ({ paperTradingEnabled: !state.paperTradingEnabled }));
        },

        setPaperTradingBalance: (balance: number) => {
          if (balance < 0) return;
          set({ paperTradingBalance: balance });
        },

        resetPaperTradingBalance: () => {
          set({ paperTradingBalance: DEFAULT_PAPER_TRADING_BALANCE });
        },

        addBuyInPreset: (amount: number) => {
          const state = get();
          if (amount <= 0) return false;
          if (state.buyInAmounts.includes(amount)) return false;

          const updated = [...state.buyInAmounts, amount].sort((a, b) => a - b);
          set({ buyInAmounts: updated });
          return true;
        },

        removeBuyInPreset: (amount: number) => {
          const state = get();
          const updated = state.buyInAmounts.filter(a => a !== amount);
          set({ buyInAmounts: updated });

          if (state.defaultBuyInAmount === amount) {
            set({ defaultBuyInAmount: updated[0] || 50 });
          }
        },

        setDefaultBuyIn: (amount: number) => {
          set({ defaultBuyInAmount: amount });
        },

        setTheme: (theme: AppTheme) => {
          set({ theme });
        },

        setLLMProvider: (provider: LLMProvider) => {
          set({ llmProvider: provider });
        },

        setSelectedCrypto: (crypto: string) => {
          set({ selectedCrypto: crypto });
        },

        connectPhantom: (address: string) => {
          set({
            phantomWallet: {
              connected: true,
              address,
            },
          });
        },

        disconnectPhantom: () => {
          set({
            phantomWallet: {
              connected: false,
              address: '',
            },
          });
        },

        updateAPIKey: (key, value) => {
          set({ [key]: value });
        },

        clearAllSettings: () => {
          set(initialState);
        },

        reset: () => {
          set(initialState);
        },
      }),
      {
        name: 'eclipse-settings-store',
        storage: createJSONStorage(getPersistentStorage),
        partialize: state => ({
          databaseUrl: state.databaseUrl,
          sentrySdn: state.sentrySdn,
          claudeApiKey: state.claudeApiKey,
          openaiApiKey: state.openaiApiKey,
          llmProvider: state.llmProvider,
          twitterBearerToken: state.twitterBearerToken,
          paperTradingEnabled: state.paperTradingEnabled,
          paperTradingBalance: state.paperTradingBalance,
          selectedCrypto: state.selectedCrypto,
          buyInAmounts: state.buyInAmounts,
          defaultBuyInAmount: state.defaultBuyInAmount,
          minMarketCap: state.minMarketCap,
          theme: state.theme,
          phantomWallet: state.phantomWallet,
        }),
      }
    )
  )
);

export const useSettingsStore = storeResult.useStore;
export const settingsStore = storeResult.store;

// Convenience selector hooks
export const usePaperTrading = () => {
  return useSettingsStore(state => ({
    enabled: state.paperTradingEnabled,
    balance: state.paperTradingBalance,
    toggle: state.togglePaperTrading,
    setBalance: state.setPaperTradingBalance,
    reset: state.resetPaperTradingBalance,
  }));
};

export const useQuickBuys = () => {
  return useSettingsStore(state => ({
    amounts: state.buyInAmounts,
    defaultAmount: state.defaultBuyInAmount,
    add: state.addBuyInPreset,
    remove: state.removeBuyInPreset,
    setDefault: state.setDefaultBuyIn,
  }));
};

export const useAPIKeys = () => {
  return useSettingsStore(state => ({
    databaseUrl: state.databaseUrl,
    sentrySdn: state.sentrySdn,
    claudeApiKey: state.claudeApiKey,
    openaiApiKey: state.openaiApiKey,
    llmProvider: state.llmProvider,
    twitterBearerToken: state.twitterBearerToken,
    updateAPIKey: state.updateAPIKey,
  }));
};

export const usePhantomWallet = () => {
  return useSettingsStore(state => ({
    wallet: state.phantomWallet,
    connect: state.connectPhantom,
    disconnect: state.disconnectPhantom,
  }));
};

export const useSelectedCrypto = () => {
  return useSettingsStore(state => ({
    selectedCrypto: state.selectedCrypto,
    setSelectedCrypto: state.setSelectedCrypto,
  }));
};

export const useAppTheme = () => {
  return useSettingsStore(state => ({
    theme: state.theme,
    setTheme: state.setTheme,
  }));
};
