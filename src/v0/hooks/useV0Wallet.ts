import { useCallback } from 'react';
import { useWalletStore } from '../../store/walletStore';

/**
 * Hook for accessing wallet data with atomic selectors
 * Provides optimized selectors for common wallet operations
 */
export function useV0WalletData() {
  // Basic wallet state
  const status = useWalletStore(state => state.status);
  const publicKey = useWalletStore(state => state.publicKey);
  const balance = useWalletStore(state => state.balance);
  const error = useWalletStore(state => state.error);
  
  // Multi-wallet state
  const wallets = useWalletStore(state => state.wallets);
  const activeWalletId = useWalletStore(state => state.activeWalletId);
  const aggregatedPortfolio = useWalletStore(state => state.aggregatedPortfolio);
  const multiWalletLoading = useWalletStore(state => state.multiWalletLoading);
  const multiWalletError = useWalletStore(state => state.multiWalletError);
  
  // Store actions
  const setActiveWallet = useWalletStore(state => state.setActiveWallet);
  const listWallets = useWalletStore(state => state.listWallets);
  const getAggregatedPortfolio = useWalletStore(state => state.getAggregatedPortfolio);
  const refreshMultiWallet = useWalletStore(state => state.refreshMultiWallet);

  // Computed values
  const activeWallet = wallets.find(w => w.id === activeWalletId);
  const isConnected = status === 'connected' && !!publicKey;
  const isLoading = status === 'connecting' || multiWalletLoading;

  const refreshWalletData = useCallback(async () => {
    try {
      await refreshMultiWallet();
    } catch (error) {
      console.error('Failed to refresh wallet data:', error);
    }
  }, [refreshMultiWallet]);

  return {
    // Basic state
    status,
    publicKey,
    balance,
    error,
    isConnected,
    isLoading,
    
    // Multi-wallet state
    wallets,
    activeWallet,
    activeWalletId,
    aggregatedPortfolio,
    multiWalletError,
    
    // Actions
    setActiveWallet,
    listWallets,
    getAggregatedPortfolio,
    refreshWalletData,
  };
}

/**
 * Hook for wallet operations that require Tauri commands
 * Wraps store methods with error handling
 */
export function useV0WalletActions() {
  const addWallet = useWalletStore(state => state.addWallet);
  const updateWallet = useWalletStore(state => state.updateWallet);
  const removeWallet = useWalletStore(state => state.removeWallet);
  const updateWalletBalance = useWalletStore(state => state.updateWalletBalance);
  const updatePerformanceMetrics = useWalletStore(state => state.updatePerformanceMetrics);

  const createGroup = useWalletStore(state => state.createGroup);
  const updateGroup = useWalletStore(state => state.updateGroup);
  const deleteGroup = useWalletStore(state => state.deleteGroup);
  const listGroups = useWalletStore(state => state.listGroups);

  const handleAddWallet = useCallback(async (request: any) => {
    try {
      return await addWallet(request);
    } catch (error) {
      console.error('Failed to add wallet:', error);
      throw error;
    }
  }, [addWallet]);

  const handleUpdateWallet = useCallback(async (request: any) => {
    try {
      return await updateWallet(request);
    } catch (error) {
      console.error('Failed to update wallet:', error);
      throw error;
    }
  }, [updateWallet]);

  const handleRemoveWallet = useCallback(async (walletId: string) => {
    try {
      await removeWallet(walletId);
    } catch (error) {
      console.error('Failed to remove wallet:', error);
      throw error;
    }
  }, [removeWallet]);

  const handleUpdateBalance = useCallback(async (walletId: string, balance: number) => {
    try {
      await updateWalletBalance(walletId, balance);
    } catch (error) {
      console.error('Failed to update wallet balance:', error);
      throw error;
    }
  }, [updateWalletBalance]);

  return {
    addWallet: handleAddWallet,
    updateWallet: handleUpdateWallet,
    removeWallet: handleRemoveWallet,
    updateWalletBalance: handleUpdateBalance,
    updatePerformanceMetrics,
    createGroup,
    updateGroup,
    deleteGroup,
    listGroups,
  };
}

/**
 * Hook for wallet preferences and settings
 */
export function useV0WalletPreferences() {
  const wallets = useWalletStore(state => state.wallets);
  const activeWalletId = useWalletStore(state => state.activeWalletId);
  
  const activeWallet = wallets.find(w => w.id === activeWalletId);
  
  return {
    preferences: activeWallet?.preferences,
    tradingEnabled: activeWallet?.preferences?.tradingEnabled ?? false,
    autoApproveLimit: activeWallet?.preferences?.autoApproveLimit,
    maxSlippage: activeWallet?.preferences?.maxSlippage,
    defaultPriorityFee: activeWallet?.preferences?.defaultPriorityFee,
    notificationsEnabled: activeWallet?.preferences?.notificationsEnabled ?? true,
    isolationMode: activeWallet?.preferences?.isolationMode ?? false,
  };
}