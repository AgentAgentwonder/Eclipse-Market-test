import React, { useState } from 'react';
import { AlertCircle, Settings, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useV0TradingSettingsData, useV0TradingSettingsActions } from '../../hooks/useV0Trading';

interface V0TradingSettingsProps {
  className?: string;
}

export const V0TradingSettings: React.FC<V0TradingSettingsProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'slippage' | 'gas' | 'mev'>('slippage');

  // Data hooks
  const {
    slippageTolerance,
    slippageAutoAdjust,
    slippageMaxTolerance,
    slippageRejectAboveThreshold,
    priorityFeePreset,
    congestionLevel,
    mevProtectionEnabled,
    jitoEnabled,
    privateRPCEnabled,
  } = useV0TradingSettingsData();

  // Action hooks
  const {
    setSlippageTolerance,
    setSlippageAutoAdjust,
    setSlippageMaxTolerance,
    setSlippageRejectAbove,
    setPriorityFeePreset,
    toggleMEVProtection,
    setJitoEnabled,
    setPrivateRPCEnabled,
  } = useV0TradingSettingsActions();

  const handleSlippageChange = (value: number) => {
    setSlippageTolerance(value);
  };

  const handleMaxToleranceChange = (value: number) => {
    setSlippageMaxTolerance(value);
  };

  const handlePriorityFeeChange = (preset: 'slow' | 'normal' | 'fast') => {
    setPriorityFeePreset(preset);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-700">
        {(['slippage', 'gas', 'mev'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2',
              activeTab === tab
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            )}
          >
            {tab === 'slippage' && '📊 Slippage'}
            {tab === 'gas' && '⚡ Gas'}
            {tab === 'mev' && '🛡️ MEV Protection'}
          </button>
        ))}
      </div>

      {/* Slippage Settings */}
      {activeTab === 'slippage' && (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <label className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={slippageAutoAdjust}
                onChange={e => setSlippageAutoAdjust(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-white">Auto-adjust for volatility</span>
            </label>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Slippage Tolerance: {(slippageTolerance / 100).toFixed(2)}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  step="1"
                  value={slippageTolerance}
                  onChange={e => handleSlippageChange(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Currently: {(slippageTolerance / 100).toFixed(2)}% (
                  {slippageTolerance} bps)
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Max Tolerance: {(slippageMaxTolerance / 100).toFixed(2)}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  step="1"
                  value={slippageMaxTolerance}
                  onChange={e => handleMaxToleranceChange(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={slippageRejectAboveThreshold}
                  onChange={e => setSlippageRejectAbove(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-400">
                  Reject trades exceeding max tolerance
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Gas Settings */}
      {activeTab === 'gas' && (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Priority Fee Preset
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['slow', 'normal', 'fast'] as const).map(preset => (
                  <button
                    key={preset}
                    onClick={() => handlePriorityFeeChange(preset)}
                    className={cn(
                      'px-4 py-2 rounded text-sm font-medium transition-colors',
                      priorityFeePreset === preset
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    )}
                  >
                    {preset === 'slow' && '🐢 Slow'}
                    {preset === 'normal' && '⚡ Normal'}
                    {preset === 'fast' && '🚀 Fast'}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-700/50 p-3 rounded">
              <p className="text-sm text-gray-400">
                <span className="font-medium">Network Congestion:</span>
              </p>
              <p className="text-lg font-bold mt-1">
                {congestionLevel === 'low' && '✓ Low'}
                {congestionLevel === 'medium' && '⚠️ Medium'}
                {congestionLevel === 'high' && '⛔ High'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MEV Protection Settings */}
      {activeTab === 'mev' && (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <label className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={mevProtectionEnabled}
                onChange={e => toggleMEVProtection(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-white">
                  Enable MEV Protection
                </span>
              </div>
            </label>

            {mevProtectionEnabled && (
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={jitoEnabled}
                    onChange={e => setJitoEnabled(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-400">Use Jito Bundle Submission</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={privateRPCEnabled}
                    onChange={e => setPrivateRPCEnabled(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-400">Use Private RPC Endpoints</span>
                </label>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 text-sm text-yellow-600 flex gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    MEV protection may increase transaction costs but reduces sandwich attack risk
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
