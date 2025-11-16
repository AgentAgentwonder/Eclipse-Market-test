import { useCallback } from 'react';
import { usePaperTradingStore, PaperTrade } from '../../store/paperTradingStore';
import { useTradingSettingsStore, PriorityFeePreset } from '../../store/tradingSettingsStore';
import { useAutoTradingStore } from '../../store/autoTradingStore';

/**
 * Hook for accessing paper trading data with atomic selectors
 * Provides optimized selectors for common paper trading operations
 */
export function useV0PaperTradingData() {
  // Paper trading state
  const isPaperMode = usePaperTradingStore(state => state.isPaperMode);
  const virtualBalance = usePaperTradingStore(state => state.virtualBalance);
  const trades = usePaperTradingStore(state => state.trades);
  const positions = usePaperTradingStore(state => state.positions);
  const hasSeenTutorial = usePaperTradingStore(state => state.hasSeenTutorial);

  // Store actions
  const togglePaperMode = usePaperTradingStore(state => state.togglePaperMode);
  const updatePosition = usePaperTradingStore(state => state.updatePosition);

  // Computed values
  const totalPnL = usePaperTradingStore(state => state.getTotalPnL());
  const totalPnLPercent = usePaperTradingStore(state => state.getTotalPnLPercent());
  const bestTrade = usePaperTradingStore(state => state.getBestTrade());
  const worstTrade = usePaperTradingStore(state => state.getWorstTrade());
  const winRate = usePaperTradingStore(state => state.getWinRate());
  const balanceHistory = usePaperTradingStore(state => state.getBalanceHistory());

  return {
    // State
    isPaperMode,
    virtualBalance,
    trades,
    positions,
    hasSeenTutorial,

    // Computed metrics
    totalPnL,
    totalPnLPercent,
    bestTrade,
    worstTrade,
    winRate,
    balanceHistory,

    // Actions
    togglePaperMode,
    updatePosition,
  };
}

/**
 * Hook for paper trading operations
 */
export function useV0PaperTradingActions() {
  const executePaperTrade = usePaperTradingStore(state => state.executePaperTrade);
  const resetAccount = usePaperTradingStore(state => state.resetAccount);
  const setHasSeenTutorial = usePaperTradingStore(state => state.setHasSeenTutorial);

  const handleExecuteTrade = useCallback(
    (trade: Omit<PaperTrade, 'id' | 'timestamp' | 'status'>) => {
      try {
        executePaperTrade(trade);
      } catch (error) {
        console.error('Failed to execute paper trade:', error);
        throw error;
      }
    },
    [executePaperTrade]
  );

  const handleResetAccount = useCallback(async () => {
    try {
      resetAccount();
    } catch (error) {
      console.error('Failed to reset paper trading account:', error);
      throw error;
    }
  }, [resetAccount]);

  return {
    executePaperTrade: handleExecuteTrade,
    resetAccount: handleResetAccount,
    setHasSeenTutorial,
  };
}

/**
 * Hook for accessing trading settings with atomic selectors
 */
export function useV0TradingSettingsData() {
  // Slippage config
  const slippageTolerance = useTradingSettingsStore(state => state.slippage.tolerance);
  const slippageAutoAdjust = useTradingSettingsStore(state => state.slippage.autoAdjust);
  const slippageMaxTolerance = useTradingSettingsStore(state => state.slippage.maxTolerance);
  const slippageRejectAboveThreshold = useTradingSettingsStore(
    state => state.slippage.rejectAboveThreshold
  );

  // MEV protection
  const mevProtectionEnabled = useTradingSettingsStore(
    state => state.mevProtection.enabled
  );
  const jitoEnabled = useTradingSettingsStore(state => state.mevProtection.useJito);
  const privateRPCEnabled = useTradingSettingsStore(
    state => state.mevProtection.usePrivateRPC
  );
  const protectedTrades = useTradingSettingsStore(
    state => state.mevProtection.protectedTrades
  );
  const estimatedMevSavings = useTradingSettingsStore(
    state => state.mevProtection.estimatedSavings
  );

  // Gas optimization
  const priorityFeePreset = useTradingSettingsStore(
    state => state.gasOptimization.priorityFeePreset
  );
  const congestionLevel = useTradingSettingsStore(
    state => state.gasOptimization.historicalData.congestionLevel
  );

  // Trade history and filters
  const tradeHistory = useTradingSettingsStore(state => state.tradeHistory);
  const tradeFilters = useTradingSettingsStore(state => state.tradeFilters);
  const tradePagination = useTradingSettingsStore(state => state.tradePagination);
  const timezone = useTradingSettingsStore(state => state.timezone);

  // Store actions
  const setSlippageTolerance = useTradingSettingsStore(
    state => state.setSlippageTolerance
  );
  const setSlippageAutoAdjust = useTradingSettingsStore(
    state => state.setSlippageAutoAdjust
  );
  const setPriorityFeePreset = useTradingSettingsStore(
    state => state.setPriorityFeePreset
  );
  const getRecommendedSlippage = useTradingSettingsStore(
    state => state.getRecommendedSlippage
  );
  const getPriorityFeeForPreset = useTradingSettingsStore(
    state => state.getPriorityFeeForPreset
  );
  const shouldBlockTrade = useTradingSettingsStore(state => state.shouldBlockTrade);

  return {
    // Slippage config
    slippageTolerance,
    slippageAutoAdjust,
    slippageMaxTolerance,
    slippageRejectAboveThreshold,

    // MEV protection
    mevProtectionEnabled,
    jitoEnabled,
    privateRPCEnabled,
    protectedTrades,
    estimatedMevSavings,

    // Gas optimization
    priorityFeePreset,
    congestionLevel,

    // Trade history and filters
    tradeHistory,
    tradeFilters,
    tradePagination,
    timezone,

    // Actions
    setSlippageTolerance,
    setSlippageAutoAdjust,
    setPriorityFeePreset,
    getRecommendedSlippage,
    getPriorityFeeForPreset,
    shouldBlockTrade,
  };
}

/**
 * Hook for trading settings operations
 */
export function useV0TradingSettingsActions() {
  const setSlippageTolerance = useTradingSettingsStore(
    state => state.setSlippageTolerance
  );
  const setSlippageAutoAdjust = useTradingSettingsStore(
    state => state.setSlippageAutoAdjust
  );
  const setSlippageMaxTolerance = useTradingSettingsStore(
    state => state.setSlippageMaxTolerance
  );
  const setSlippageRejectAbove = useTradingSettingsStore(
    state => state.setSlippageRejectAbove
  );
  const toggleMEVProtection = useTradingSettingsStore(
    state => state.toggleMEVProtection
  );
  const setJitoEnabled = useTradingSettingsStore(state => state.setJitoEnabled);
  const setPrivateRPCEnabled = useTradingSettingsStore(
    state => state.setPrivateRPCEnabled
  );
  const setPriorityFeePreset = useTradingSettingsStore(
    state => state.setPriorityFeePreset
  );
  const setCustomPriorityFee = useTradingSettingsStore(
    state => state.setCustomPriorityFee
  );
  const updateCongestionData = useTradingSettingsStore(
    state => state.updateCongestionData
  );
  const addTradeToHistory = useTradingSettingsStore(state => state.addTradeToHistory);
  const updateTradeInHistory = useTradingSettingsStore(
    state => state.updateTradeInHistory
  );
  const setTradeFilters = useTradingSettingsStore(state => state.setTradeFilters);
  const resetTradeFilters = useTradingSettingsStore(state => state.resetTradeFilters);
  const setTradePagination = useTradingSettingsStore(
    state => state.setTradePagination
  );

  const handleSetSlippageTolerance = useCallback(
    (tolerance: number) => {
      try {
        setSlippageTolerance(tolerance);
      } catch (error) {
        console.error('Failed to set slippage tolerance:', error);
        throw error;
      }
    },
    [setSlippageTolerance]
  );

  const handleSetPriorityFeePreset = useCallback(
    (preset: PriorityFeePreset) => {
      try {
        setPriorityFeePreset(preset);
      } catch (error) {
        console.error('Failed to set priority fee preset:', error);
        throw error;
      }
    },
    [setPriorityFeePreset]
  );

  return {
    setSlippageTolerance: handleSetSlippageTolerance,
    setSlippageAutoAdjust,
    setSlippageMaxTolerance,
    setSlippageRejectAbove,
    toggleMEVProtection,
    setJitoEnabled,
    setPrivateRPCEnabled,
    setPriorityFeePreset: handleSetPriorityFeePreset,
    setCustomPriorityFee,
    updateCongestionData,
    addTradeToHistory,
    updateTradeInHistory,
    setTradeFilters,
    resetTradeFilters,
    setTradePagination,
  };
}

/**
 * Hook for accessing auto trading data with atomic selectors
 */
export function useV0AutoTradingData() {
  const strategies = useAutoTradingStore(state => state.strategies);
  const executions = useAutoTradingStore(state => state.executions);
  const backtestResults = useAutoTradingStore(state => state.backtestResults);
  const optimizationRuns = useAutoTradingStore(state => state.optimizationRuns);
  const isKillSwitchActive = useAutoTradingStore(state => state.isKillSwitchActive);

  return {
    strategies,
    executions,
    backtestResults,
    optimizationRuns,
    isKillSwitchActive,
  };
}

/**
 * Hook for auto trading operations
 */
export function useV0AutoTradingActions() {
  const addStrategy = useAutoTradingStore(state => state.addStrategy);
  const updateStrategy = useAutoTradingStore(state => state.updateStrategy);
  const deleteStrategy = useAutoTradingStore(state => state.deleteStrategy);
  const toggleStrategy = useAutoTradingStore(state => state.toggleStrategy);
  const startStrategy = useAutoTradingStore(state => state.startStrategy);
  const stopStrategy = useAutoTradingStore(state => state.stopStrategy);
  const pauseStrategy = useAutoTradingStore(state => state.pauseStrategy);
  const activateKillSwitch = useAutoTradingStore(state => state.activateKillSwitch);
  const deactivateKillSwitch = useAutoTradingStore(
    state => state.deactivateKillSwitch
  );

  const handleAddStrategy = useCallback(
    async (strategy: any) => {
      try {
        return await addStrategy(strategy);
      } catch (error) {
        console.error('Failed to add strategy:', error);
        throw error;
      }
    },
    [addStrategy]
  );

  const handleStartStrategy = useCallback(
    async (strategyId: string) => {
      try {
        await startStrategy(strategyId);
      } catch (error) {
        console.error('Failed to start strategy:', error);
        throw error;
      }
    },
    [startStrategy]
  );

  const handleStopStrategy = useCallback(
    async (strategyId: string) => {
      try {
        await stopStrategy(strategyId);
      } catch (error) {
        console.error('Failed to stop strategy:', error);
        throw error;
      }
    },
    [stopStrategy]
  );

  return {
    addStrategy: handleAddStrategy,
    updateStrategy,
    deleteStrategy,
    toggleStrategy,
    startStrategy: handleStartStrategy,
    stopStrategy: handleStopStrategy,
    pauseStrategy,
    activateKillSwitch,
    deactivateKillSwitch,
  };
}
