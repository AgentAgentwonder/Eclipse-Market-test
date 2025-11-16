import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useV0WalletData, useV0WalletActions, useV0WalletPreferences } from '../../../hooks/useV0Wallet';
import { useWalletStore } from '../../../../store/walletStore';

// Mock wallet store
vi.mock('../../../../store/walletStore', () => ({
  useWalletStore: vi.fn(),
}));

describe('useV0WalletData', () => {
  const mockStoreState = {
    status: 'connected' as const,
    publicKey: 'abc123def456',
    balance: 1.5,
    error: null,
    wallets: [
      {
        id: 'wallet1',
        label: 'Main Wallet',
        publicKey: 'abc123def456',
        balance: 1.5,
        network: 'mainnet',
        walletType: 'phantom' as const,
      },
    ],
    activeWalletId: 'wallet1',
    aggregatedPortfolio: {
      totalBalance: 1.5,
      totalWallets: 1,
      totalGroups: 0,
      totalTrades: 0,
      totalVolume: 0,
      totalRealizedPnl: 0,
      totalUnrealizedPnl: 0,
      wallets: [],
    },
    multiWalletLoading: false,
    multiWalletError: null,
    setActiveWallet: vi.fn(),
    listWallets: vi.fn(),
    getAggregatedPortfolio: vi.fn(),
    refreshMultiWallet: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useWalletStore as any).mockImplementation((selector) => selector(mockStoreState));
  });

  it('returns wallet data correctly', () => {
    const { result } = renderHook(() => useV0WalletData());

    expect(result.current.status).toBe('connected');
    expect(result.current.publicKey).toBe('abc123def456');
    expect(result.current.balance).toBe(1.5);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('computes active wallet correctly', () => {
    const { result } = renderHook(() => useV0WalletData());

    expect(result.current.activeWallet).toEqual(mockStoreState.wallets[0]);
  });

  it('returns correct loading state', () => {
    const loadingState = {
      ...mockStoreState,
      status: 'connecting' as const,
      multiWalletLoading: true,
    };

    (useWalletStore as any).mockImplementation((selector) => selector(loadingState));

    const { result } = renderHook(() => useV0WalletData());

    expect(result.current.isLoading).toBe(true);
  });

  it('provides refresh function', async () => {
    const { result } = renderHook(() => useV0WalletData());

    await result.current.refreshWalletData();

    expect(mockStoreState.refreshMultiWallet).toHaveBeenCalled();
  });
});

describe('useV0WalletActions', () => {
  const mockStoreState = {
    addWallet: vi.fn().mockResolvedValue({ id: 'new-wallet' }),
    updateWallet: vi.fn().mockResolvedValue({ id: 'updated-wallet' }),
    removeWallet: vi.fn().mockResolvedValue(undefined),
    updateWalletBalance: vi.fn().mockResolvedValue(undefined),
    updatePerformanceMetrics: vi.fn().mockResolvedValue(undefined),
    createGroup: vi.fn().mockResolvedValue({ id: 'new-group' }),
    updateGroup: vi.fn().mockResolvedValue({ id: 'updated-group' }),
    deleteGroup: vi.fn().mockResolvedValue(undefined),
    listGroups: vi.fn().mockResolvedValue([]),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useWalletStore as any).mockImplementation((selector) => selector(mockStoreState));
  });

  it('provides wallet action functions', () => {
    const { result } = renderHook(() => useV0WalletActions());

    expect(typeof result.current.addWallet).toBe('function');
    expect(typeof result.current.updateWallet).toBe('function');
    expect(typeof result.current.removeWallet).toBe('function');
    expect(typeof result.current.updateWalletBalance).toBe('function');
    expect(typeof result.current.createGroup).toBe('function');
    expect(typeof result.current.updateGroup).toBe('function');
    expect(typeof result.current.deleteGroup).toBe('function');
  });

  it('handles add wallet with error handling', async () => {
    const { result } = renderHook(() => useV0WalletActions());

    const request = { publicKey: 'test', label: 'Test', network: 'mainnet', walletType: 'phantom' as const };
    await result.current.addWallet(request);

    expect(mockStoreState.addWallet).toHaveBeenCalledWith(request);
  });

  it('handles remove wallet with error handling', async () => {
    const { result } = renderHook(() => useV0WalletActions());

    await result.current.removeWallet('wallet1');

    expect(mockStoreState.removeWallet).toHaveBeenCalledWith('wallet1');
  });

  it('handles update balance with error handling', async () => {
    const { result } = renderHook(() => useV0WalletActions());

    await result.current.updateWalletBalance('wallet1', 2.0);

    expect(mockStoreState.updateWalletBalance).toHaveBeenCalledWith('wallet1', 2.0);
  });
});

describe('useV0WalletPreferences', () => {
  const mockStoreState = {
    wallets: [
      {
        id: 'wallet1',
        label: 'Main Wallet',
        publicKey: 'abc123def456',
        balance: 1.5,
        network: 'mainnet',
        walletType: 'phantom' as const,
        preferences: {
          tradingEnabled: true,
          autoApproveLimit: 100,
          maxSlippage: 2.5,
          defaultPriorityFee: 0.001,
          notificationsEnabled: false,
          isolationMode: true,
        },
      },
    ],
    activeWalletId: 'wallet1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useWalletStore as any).mockImplementation((selector) => selector(mockStoreState));
  });

  it('returns wallet preferences', () => {
    const { result } = renderHook(() => useV0WalletPreferences());

    expect(result.current.preferences).toEqual(mockStoreState.wallets[0].preferences);
    expect(result.current.tradingEnabled).toBe(true);
    expect(result.current.autoApproveLimit).toBe(100);
    expect(result.current.maxSlippage).toBe(2.5);
    expect(result.current.defaultPriorityFee).toBe(0.001);
    expect(result.current.notificationsEnabled).toBe(false);
    expect(result.current.isolationMode).toBe(true);
  });

  it('returns default values when no active wallet', () => {
    const emptyState = {
      wallets: [],
      activeWalletId: null,
    };

    (useWalletStore as any).mockImplementation((selector) => selector(emptyState));

    const { result } = renderHook(() => useV0WalletPreferences());

    expect(result.current.preferences).toBeUndefined();
    expect(result.current.tradingEnabled).toBe(false);
    expect(result.current.notificationsEnabled).toBe(true);
    expect(result.current.isolationMode).toBe(false);
  });

  it('returns default values when preferences are missing', () => {
    const stateWithoutPreferences = {
      wallets: [
        {
          id: 'wallet1',
          label: 'Main Wallet',
          publicKey: 'abc123def456',
          balance: 1.5,
          network: 'mainnet',
          walletType: 'phantom' as const,
          preferences: undefined,
        },
      ],
      activeWalletId: 'wallet1',
    };

    (useWalletStore as any).mockImplementation((selector) => selector(stateWithoutPreferences));

    const { result } = renderHook(() => useV0WalletPreferences());

    expect(result.current.tradingEnabled).toBe(false);
    expect(result.current.notificationsEnabled).toBe(true);
    expect(result.current.isolationMode).toBe(false);
  });
});