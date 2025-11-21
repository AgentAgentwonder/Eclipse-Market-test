import React from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Bell, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { loadV0Styles } from '../../styles';
import { EnhancedAlertNotification } from '../../../types/alertNotifications';

export interface V0AlertNotificationProps {
  notification: EnhancedAlertNotification;
  onDismiss: () => void;
  onOpenChart?: (symbol: string, timestamp: string) => void;
  className?: string;
}

const V0AlertNotification: React.FC<V0AlertNotificationProps> = ({
  notification,
  onDismiss,
  onOpenChart,
  className,
}) => {
  React.useEffect(() => {
    loadV0Styles().catch(console.error);
  }, []);

  const getPriceIcon = () => {
    if (notification.priceChange24h === undefined) return <Bell className="w-4 h-4" />;
    return notification.priceChange24h >= 0 ? (
      <ArrowUpRight className="w-4 h-4 text-green-400" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-400" />
    );
  };

  const getPriceColor = () => {
    if (notification.priceChange24h === undefined) return 'text-gray-400';
    return notification.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <motion.div
      className={cn(
        'relative bg-slate-900/95 border border-purple-500/20 rounded-2xl p-4 backdrop-blur-sm shadow-xl max-w-sm',
        'hover:border-purple-500/40 transition-all duration-200',
        className
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      layout
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {getPriceIcon()}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white text-sm truncate">{notification.alertName}</h4>
            <p className="text-xs text-gray-400">
              {notification.symbol} • ${notification.currentPrice.toFixed(2)}
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* Alert Details */}
      <div className="space-y-2 mb-3">
        <p className="text-xs text-purple-300">{notification.conditionsMet}</p>

        {notification.priceChange24h !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">24h:</span>
            <span className={cn('text-xs font-medium', getPriceColor())}>
              {notification.priceChange24h >= 0 ? '+' : ''}
              {notification.priceChange24h.toFixed(2)}%
            </span>
          </div>
        )}

        {notification.contextMessage && (
          <p className="text-xs text-gray-300 italic">{notification.contextMessage}</p>
        )}
      </div>

      {/* Transaction Details */}
      {notification.transaction && (
        <div className="bg-slate-800/50 rounded-lg p-2 mb-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Amount:</span>
            <span className="text-xs text-white font-mono">
              {notification.transaction.amount} {notification.transaction.tokenSymbol}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">USD Value:</span>
            <span className="text-xs text-white font-mono">
              ${notification.transaction.usdValue.toLocaleString()}
            </span>
          </div>
          {notification.transaction.executionPrice && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Price:</span>
              <span className="text-xs text-white font-mono">
                ${notification.transaction.executionPrice.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Similar Opportunities */}
      {notification.similarOpportunities && notification.similarOpportunities.length > 0 && (
        <div className="border-t border-slate-700 pt-2">
          <p className="text-xs text-gray-400 mb-2">Similar opportunities:</p>
          <div className="space-y-1">
            {notification.similarOpportunities.slice(0, 2).map((opp, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-purple-300">{opp.symbol}</span>
                <span className={cn('font-mono', getPriceColor())}>
                  {opp.priceChange24h >= 0 ? '+' : ''}
                  {opp.priceChange24h.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700">
        {onOpenChart && (
          <button
            onClick={() => onOpenChart(notification.symbol, notification.triggeredAt)}
            className="flex-1 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs font-medium transition-colors"
          >
            View Chart
          </button>
        )}
        <div className="text-xs text-gray-500">
          {new Date(notification.triggeredAt).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
};

export default V0AlertNotification;
