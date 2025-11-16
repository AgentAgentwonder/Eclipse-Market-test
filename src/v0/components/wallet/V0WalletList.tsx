import React, { useEffect } from 'react';
import { Wallet, Plus, Settings as SettingsIcon, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import { loadV0Styles } from '../../styles';
import { useWalletStore } from '../../../store/walletStore';

export interface V0WalletListProps {
  className?: string;
  onWalletSelect?: (walletId: string) => void;
  onWalletSettings?: (walletId: string) => void;
  onAddWallet?: () => void;
  showBalances?: boolean;
  showPerformance?: boolean;
  compact?: boolean;
}

export const V0WalletList: React.FC<V0WalletListProps> = ({
  className,
  onWalletSelect,
  onWalletSettings,
  onAddWallet,
  showBalances = true,
  showPerformance = false,
  compact = false,
}) => {
  const [hideBalances, setHideBalances] = React.useState(false);

  // Atomic selectors from existing wallet store
  const wallets = useWalletStore(state => state.wallets);
  const activeWalletId = useWalletStore(state => state.activeWalletId);
  const aggregatedPortfolio = useWalletStore(state => state.aggregatedPortfolio);
  const setActiveWallet = useWalletStore(state => state.setActiveWallet);
  const listWallets = useWalletStore(state => state.listWallets);
  const getAggregatedPortfolio = useWalletStore(state => state.getAggregatedPortfolio);

  useEffect(() => {
    loadV0Styles().catch(console.error);
  }, []);

  useEffect(() => {
    listWallets();
    getAggregatedPortfolio();
  }, [listWallets, getAggregatedPortfolio]);

  const handleWalletSelect = async (walletId: string) => {
    try {
      await setActiveWallet(walletId);
      onWalletSelect?.(walletId);
    } catch (error) {
      console.error('Failed to switch wallet:', error);
    }
  };

  const formatBalance = (balance: number) => {
    if (hideBalances) return '****';
    return `${balance.toFixed(4)} SOL`;
  };

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        {wallets.map(wallet => (
          <button
            key={wallet.id}
            onClick={() => handleWalletSelect(wallet.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left",
              wallet.id === activeWalletId
                ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-500/50"
                : "hover:bg-white/5 border border-transparent"
            )}
          >
            <Wallet className="w-4 h-4" />
            <div className="flex-1">
              <div className="text-sm font-medium">{wallet.label}</div>
              <div className="text-xs text-gray-400 font-mono">
                {wallet.publicKey.slice(0, 6)}...{wallet.publicKey.slice(-4)}
              </div>
            </div>
            {showBalances && (
              <div className="text-sm font-bold">
                {formatBalance(wallet.balance)}
              </div>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with totals */}
      {aggregatedPortfolio && (
        <div className={cn(
          "p-4 rounded-xl border",
          "bg-slate-900/95 backdrop-blur-xl border-purple-500/20"
        )}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Portfolio Overview</h3>
            {showBalances && (
              <button
                onClick={() => setHideBalances(!hideBalances)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  "hover:bg-white/10"
                )}
              >
                {hideBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={cn("p-3 rounded-lg text-center", "bg-purple-500/10")}>
              <div className="text-xs text-gray-400">Total Balance</div>
              <div className="text-lg font-bold">
                {hideBalances ? '****' : aggregatedPortfolio.totalBalance.toFixed(4)} SOL
              </div>
            </div>
            <div className={cn("p-3 rounded-lg text-center", "bg-blue-500/10")}>
              <div className="text-xs text-gray-400">Wallets</div>
              <div className="text-lg font-bold">{aggregatedPortfolio.totalWallets}</div>
            </div>
            <div className={cn("p-3 rounded-lg text-center", "bg-green-500/10")}>
              <div className="text-xs text-gray-400">Realized P&L</div>
              <div className={`text-lg font-bold ${
                aggregatedPortfolio.totalRealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {hideBalances ? '****' : (
                  <>
                    {aggregatedPortfolio.totalRealizedPnl >= 0 ? '+' : ''}
                    {aggregatedPortfolio.totalRealizedPnl.toFixed(2)}
                  </>
                )}
              </div>
            </div>
            <div className={cn("p-3 rounded-lg text-center", "bg-orange-500/10")}>
              <div className="text-xs text-gray-400">Total Volume</div>
              <div className="text-lg font-bold">
                {hideBalances ? '****' : aggregatedPortfolio.totalVolume.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Wallets</h3>
          {onAddWallet && (
            <button
              onClick={onAddWallet}
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-all",
                "bg-purple-500/20 hover:bg-purple-500/30"
              )}
            >
              <Plus className="w-3 h-3" />
              Add Wallet
            </button>
          )}
        </div>
        
        {wallets.length === 0 ? (
          <div className={cn(
            "p-8 rounded-xl border text-center",
            "bg-gray-500/10 border-gray-500/30"
          )}>
            <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-400">No wallets connected</p>
            {onAddWallet && (
              <button
                onClick={onAddWallet}
                className={cn(
                  "mt-3 px-4 py-2 rounded-lg text-sm transition-all",
                  "bg-purple-500/20 hover:bg-purple-500/30"
                )}
              >
                Add Your First Wallet
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {wallets.map(wallet => (
              <div
                key={wallet.id}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  wallet.id === activeWalletId
                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50"
                    : "bg-slate-900/95 backdrop-blur-xl border-purple-500/20 hover:border-purple-500/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleWalletSelect(wallet.id)}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        wallet.id === activeWalletId
                          ? "bg-purple-500/30 border border-purple-500/50"
                          : "bg-purple-500/10 hover:bg-purple-500/20"
                      )}
                    >
                      <Wallet className="w-5 h-5" />
                    </button>
                    <div>
                      <div className="font-medium">{wallet.label}</div>
                      <div className="text-sm text-gray-400 font-mono">
                        {wallet.publicKey.slice(0, 8)}...{wallet.publicKey.slice(-6)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {wallet.walletType.replace('_', ' • ')} • {wallet.network}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {showBalances && (
                      <div className="text-right">
                        <div className="font-bold">
                          {formatBalance(wallet.balance)}
                        </div>
                        {showPerformance && wallet.performance.totalTrades > 0 && (
                          <div className={`text-xs ${
                            wallet.performance.realizedPnl >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            P&L: {wallet.performance.realizedPnl >= 0 ? '+' : ''}
                            {wallet.performance.realizedPnl.toFixed(3)} SOL
                          </div>
                        )}
                      </div>
                    )}
                    
                    {onWalletSettings && (
                      <button
                        onClick={() => onWalletSettings(wallet.id)}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          "hover:bg-white/10"
                        )}
                      >
                        <SettingsIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};