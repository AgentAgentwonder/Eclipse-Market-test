import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Zap, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  useV0PaperTradingData,
  useV0PaperTradingActions,
  useV0TradingSettingsData,
} from '../../hooks/useV0Trading';

interface V0QuickOrderProps {
  className?: string;
  fromToken?: {
    symbol: string;
    mint: string;
    decimals: number;
  };
  toToken?: {
    symbol: string;
    mint: string;
    decimals: number;
  };
  side?: 'buy' | 'sell';
  walletAddress?: string;
  onOrderPlaced?: () => void;
}

const DEFAULT_TOKENS = {
  from: { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
  to: { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
};

export const V0QuickOrder: React.FC<V0QuickOrderProps> = ({
  className,
  fromToken = DEFAULT_TOKENS.from,
  toToken = DEFAULT_TOKENS.to,
  side = 'buy',
  walletAddress,
  onOrderPlaced,
}) => {
  const [amount, setAmount] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Data hooks
  const { isPaperMode, virtualBalance } = useV0PaperTradingData();
  const { slippageTolerance, getPriorityFeeForPreset, priorityFeePreset } =
    useV0TradingSettingsData();

  // Action hooks
  const { executePaperTrade } = useV0PaperTradingActions();

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (isPaperMode) {
      handlePaperTrade();
    } else {
      handleLiveTrade();
    }
  };

  const handlePaperTrade = () => {
    const amountNum = parseFloat(amount);

    try {
      setLoading(true);
      setError(null);
      setStatus('idle');

      const tradeInput = {
        side,
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        fromAmount: side === 'buy' ? amountNum : amountNum * 100, // Simple mock price
        toAmount: side === 'buy' ? amountNum * 100 : amountNum,
        price: 100, // Mock price
        slippage: slippageTolerance,
        fees: amountNum * 0.001, // 0.1% fee
      };

      executePaperTrade(tradeInput);

      setStatus('success');
      setAmount('');
      setTimeout(() => {
        setIsOpen(false);
        onOrderPlaced?.();
      }, 2000);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to execute paper trade');
    } finally {
      setLoading(false);
    }
  };

  const handleLiveTrade = async () => {
    if (!walletAddress) {
      setError('Wallet not connected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStatus('idle');

      const priorityFee = getPriorityFeeForPreset(priorityFeePreset);

      await invoke('create_order', {
        request: {
          orderType: 'market',
          side,
          inputMint: fromToken.mint,
          outputMint: toToken.mint,
          inputSymbol: fromToken.symbol,
          outputSymbol: toToken.symbol,
          amount: parseFloat(amount),
          limitPrice: null,
          stopPrice: null,
          trailingPercent: null,
          linkedOrderId: null,
          slippageBps: slippageTolerance,
          priorityFeeMicroLamports: priorityFee.microLamports,
          walletAddress,
        },
      });

      setStatus('success');
      setAmount('');
      setTimeout(() => {
        setIsOpen(false);
        onOrderPlaced?.();
      }, 2000);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const amountNum = parseFloat(amount) || 0;
  const canAfford = isPaperMode ? amountNum <= virtualBalance : true;

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
          'bg-purple-600 hover:bg-purple-700 text-white'
        )}
      >
        <Zap className="w-4 h-4" />
        Quick {side === 'buy' ? 'Buy' : 'Sell'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              Quick {side === 'buy' ? 'Buy' : 'Sell'} {toToken.symbol}
            </h2>

            {status === 'idle' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Amount ({fromToken.symbol})
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.0"
                    step="any"
                    className="w-full bg-gray-700 px-4 py-2 rounded-lg"
                  />
                  {isPaperMode && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available: ${virtualBalance.toFixed(2)}
                    </p>
                  )}
                </div>

                {!canAfford && isPaperMode && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded text-sm text-red-400 flex gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>Insufficient virtual balance</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded text-sm text-red-400 flex gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="bg-gray-700/50 p-3 rounded space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mode:</span>
                    <span className="font-medium">{isPaperMode ? 'Paper Trading' : 'Live'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Slippage:</span>
                    <span className="font-medium">{(slippageTolerance / 100).toFixed(2)}%</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setError(null);
                      setAmount('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || amountNum <= 0 || !canAfford}
                    className={cn(
                      'flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2',
                      loading || amountNum <= 0 || !canAfford
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    )}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      'Confirm'
                    )}
                  </button>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-bold mb-2">Order Placed!</h3>
                <p className="text-gray-400 text-sm">
                  {isPaperMode ? 'Paper trade' : 'Order'} executed successfully
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-6">
                <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-bold mb-2">Order Failed</h3>
                <p className="text-gray-400 text-sm mb-4">{error}</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
