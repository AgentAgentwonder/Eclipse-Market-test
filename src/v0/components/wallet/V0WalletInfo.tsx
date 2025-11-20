import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';
import { loadV0Styles } from '../../styles';
import { useWalletStore } from '../../../store/walletStore';

export interface V0WalletInfoProps {
  className?: string;
  walletId?: string;
  showPerformance?: boolean;
  compact?: boolean;
}

export const V0WalletInfo: React.FC<V0WalletInfoProps> = ({
  className,
  walletId,
  showPerformance = true,
  compact = false,
}) => {
  React.useEffect(() => {
    loadV0Styles().catch(console.error);
  }, []);

  // Atomic selectors from existing wallet store
  const wallets = useWalletStore(state => state.wallets);
  const activeWalletId = useWalletStore(state => state.activeWalletId);

  const targetWalletId = walletId || activeWalletId;
  const wallet = wallets.find(w => w.id === targetWalletId);

  if (!wallet) {
    return (
      <div
        className={cn(
          'px-4 py-2 rounded-xl border',
          'bg-gray-500/10 border-gray-500/30 text-gray-400 text-sm',
          className
        )}
      >
        No wallet selected
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'bg-purple-500/20 border border-purple-500/30',
          className
        )}
      >
        <Wallet className="w-4 h-4" />
        <span className="font-mono text-sm">
          {wallet.publicKey.slice(0, 6)}...{wallet.publicKey.slice(-4)}
        </span>
        <span className="text-sm font-bold ml-auto">{wallet.balance.toFixed(4)} SOL</span>
      </div>
    );
  }

  const pnlPercentage =
    wallet.performance.totalTrades > 0
      ? (wallet.performance.realizedPnl / wallet.performance.totalVolume) * 100
      : 0;

  return (
    <div
      className={cn(
        'p-4 rounded-xl border space-y-4',
        'bg-slate-900/95 backdrop-blur-xl border-purple-500/20',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', 'bg-purple-500/20 border border-purple-500/30')}>
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium">{wallet.label}</h3>
            <p className="text-sm text-gray-400 font-mono">
              {wallet.publicKey.slice(0, 8)}...{wallet.publicKey.slice(-6)}
            </p>
          </div>
        </div>
        <div
          className={cn(
            'px-4 py-2 rounded-xl text-center',
            'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
          )}
        >
          <div className="text-xs text-gray-400">Balance</div>
          <div className="text-lg font-bold">{wallet.balance.toFixed(4)} SOL</div>
        </div>
      </div>

      {showPerformance && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={cn('p-3 rounded-lg', 'bg-blue-500/10 border border-blue-500/20')}>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Activity className="w-3 h-3" />
              Total Trades
            </div>
            <div className="text-lg font-bold">{wallet.performance.totalTrades}</div>
          </div>

          <div className={cn('p-3 rounded-lg', 'bg-green-500/10 border border-green-500/20')}>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <TrendingUp className="w-3 h-3" />
              Success Rate
            </div>
            <div className="text-lg font-bold">
              {wallet.performance.totalTrades > 0
                ? Math.round(
                    (wallet.performance.successfulTrades / wallet.performance.totalTrades) * 100
                  )
                : 0}
              %
            </div>
          </div>

          <div
            className={cn(
              'p-3 rounded-lg border',
              wallet.performance.realizedPnl >= 0
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-red-500/10 border-red-500/20'
            )}
          >
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              {wallet.performance.realizedPnl >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              Realized P&L
            </div>
            <div
              className={`text-lg font-bold ${
                wallet.performance.realizedPnl >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {wallet.performance.realizedPnl >= 0 ? '+' : ''}
              {wallet.performance.realizedPnl.toFixed(3)} SOL
            </div>
          </div>

          <div className={cn('p-3 rounded-lg', 'bg-purple-500/10 border border-purple-500/20')}>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Activity className="w-3 h-3" />
              Total Volume
            </div>
            <div className="text-lg font-bold">{wallet.performance.totalVolume.toFixed(1)}</div>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Network: {wallet.network}</span>
        <span>Type: {wallet.walletType.replace('_', ' ')}</span>
        {wallet.groupId && <span>Grouped</span>}
      </div>
    </div>
  );
};
