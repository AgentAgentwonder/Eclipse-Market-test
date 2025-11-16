import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useV0PaperTradingData } from '../../hooks/useV0Trading';

interface V0PaperTradingOverviewProps {
  className?: string;
}

export const V0PaperTradingOverview: React.FC<V0PaperTradingOverviewProps> = ({
  className,
}) => {
  const {
    isPaperMode,
    virtualBalance,
    totalPnL,
    totalPnLPercent,
    winRate,
    positions,
  } = useV0PaperTradingData();

  const isProfitable = totalPnL >= 0;

  return (
    <div className={cn('space-y-4', className)}>
      {isPaperMode && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
          <p className="text-sm text-orange-400 font-medium">📝 Paper Trading Mode Active</p>
          <p className="text-xs text-orange-400/70 mt-1">
            All trades are simulated with virtual balance
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Account Balance */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Virtual Balance</span>
            <Wallet className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${virtualBalance.toFixed(2)}
          </div>
        </div>

        {/* Total P&L */}
        <div className={cn(
          'rounded-lg p-4 border',
          isProfitable
            ? 'bg-green-500/10 border-green-500/20'
            : 'bg-red-500/10 border-red-500/20'
        )}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Total P&L</span>
            {isProfitable ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div className={cn(
            'text-2xl font-bold',
            isProfitable ? 'text-green-400' : 'text-red-400'
          )}>
            {isProfitable ? '+' : ''}${totalPnL.toFixed(2)}
          </div>
          <div className={cn(
            'text-sm mt-2',
            isProfitable ? 'text-green-400/70' : 'text-red-400/70'
          )}>
            {isProfitable ? '+' : ''}{totalPnLPercent.toFixed(2)}%
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Win Rate</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {winRate.toFixed(1)}%
          </div>
        </div>

        {/* Open Positions */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Open Positions</span>
            <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
              {positions.length}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {positions.length > 0 ? '✓ Active' : '— None'}
          </div>
        </div>
      </div>

      {/* Positions List */}
      {positions.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-200 mb-3">Open Positions</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {positions.map(pos => (
              <div key={pos.token} className="flex items-center justify-between text-sm p-2 bg-gray-700/50 rounded">
                <div>
                  <span className="font-medium text-white">{pos.token}</span>
                  <span className="text-gray-400 text-xs ml-2">{pos.amount.toFixed(6)}</span>
                </div>
                <div className={pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
