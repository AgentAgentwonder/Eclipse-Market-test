import React, { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { V0PaperTradingOverview } from './V0PaperTradingOverview';
import { V0TradingSettings } from './V0TradingSettings';
import { V0QuickOrder } from './V0QuickOrder';
import { useV0PaperTradingData, useV0TradingSettingsData } from '../../hooks/useV0Trading';

interface V0TradingPageProps {
  className?: string;
  walletAddress?: string;
  onTradeCompleted?: () => void;
}

const DEFAULT_TOKENS = [
  { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
  { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
];

export const V0TradingPage: React.FC<V0TradingPageProps> = ({
  className,
  walletAddress,
  onTradeCompleted,
}) => {
  const { isPaperMode } = useV0PaperTradingData();
  const { shouldBlockTrade } = useV0TradingSettingsData();

  useEffect(() => {
    const initTrading = async () => {
      try {
        await invoke('trading_init');
      } catch (err) {
        console.error('Failed to initialize trading module:', err);
      }
    };

    initTrading();
  }, []);

  const tradingDisabled = !isPaperMode && !walletAddress;

  return (
    <div className={cn('space-y-6 p-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Trading</h1>
        <p className="text-gray-400">Manage your trades and trading settings</p>
      </div>

      {/* Alerts */}
      {tradingDisabled && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-400">
              <p className="font-medium mb-1">Live Trading Disabled</p>
              <p>Please connect your wallet to execute live trades</p>
            </div>
          </div>
        </div>
      )}

      {isPaperMode && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-400">
              <p className="font-medium mb-1">Paper Trading Mode</p>
              <p>All trades are simulated with virtual balance</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Overview */}
        <div className="lg:col-span-1">
          <V0PaperTradingOverview />
        </div>

        {/* Right Column: Trading Tools */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Orders */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Orders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <V0QuickOrder
                fromToken={DEFAULT_TOKENS[0]}
                toToken={DEFAULT_TOKENS[1]}
                side="buy"
                walletAddress={walletAddress}
                onOrderPlaced={onTradeCompleted}
              />
              <V0QuickOrder
                fromToken={DEFAULT_TOKENS[1]}
                toToken={DEFAULT_TOKENS[0]}
                side="sell"
                walletAddress={walletAddress}
                onOrderPlaced={onTradeCompleted}
              />
            </div>
          </div>

          {/* Trading Settings */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4">Settings</h2>
            <V0TradingSettings />
          </div>
        </div>
      </div>
    </div>
  );
};
