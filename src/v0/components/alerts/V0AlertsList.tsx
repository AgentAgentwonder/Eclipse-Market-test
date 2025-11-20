import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Play, Pause, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { loadV0Styles } from '../../styles';
import { useAlertStore, PriceAlert, AlertState } from '../../../store/alertStore';

export interface V0AlertsListProps {
  className?: string;
  onToggleAlert?: (alertId: string) => void;
  onDeleteAlert?: (alertId: string) => void;
  maxItems?: number;
  showEmptyState?: boolean;
}

const V0AlertsList: React.FC<V0AlertsListProps> = ({
  className,
  onToggleAlert,
  onDeleteAlert,
  maxItems = 5,
  showEmptyState = true,
}) => {
  React.useEffect(() => {
    loadV0Styles().catch(console.error);
  }, []);

  // Atomic selectors from existing alert store
  const alerts = useAlertStore(state => state.alerts.slice(0, maxItems));
  const isLoading = useAlertStore(state => state.isLoading);
  const updateAlert = useAlertStore(state => state.updateAlert);
  const deleteAlert = useAlertStore(state => state.deleteAlert);

  const handleToggleAlert = React.useCallback(
    async (alert: PriceAlert) => {
      if (onToggleAlert) {
        onToggleAlert(alert.id);
        return;
      }

      try {
        const newState = alert.state === 'active' ? 'disabled' : 'active';
        await updateAlert(alert.id, { state: newState });
      } catch (error) {
        console.error('Failed to toggle alert:', error);
      }
    },
    [onToggleAlert, updateAlert]
  );

  const handleDeleteAlert = React.useCallback(
    async (alertId: string) => {
      if (onDeleteAlert) {
        onDeleteAlert(alertId);
        return;
      }

      try {
        await deleteAlert(alertId);
      } catch (error) {
        console.error('Failed to delete alert:', error);
      }
    },
    [onDeleteAlert, deleteAlert]
  );

  const getStateIcon = (state: AlertState) => {
    switch (state) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'triggered':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'cooldown':
        return <Bell className="w-4 h-4 text-blue-400" />;
      case 'disabled':
        return <Pause className="w-4 h-4 text-slate-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStateColor = (state: AlertState) => {
    switch (state) {
      case 'active':
        return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
      case 'triggered':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'cooldown':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      case 'disabled':
        return 'bg-slate-500/20 border-slate-500/30 text-slate-400';
      default:
        return 'bg-slate-500/20 border-slate-500/30 text-slate-400';
    }
  };

  const getConditionText = (alert: PriceAlert) => {
    const { conditions, operator } = alert.compoundCondition;
    if (conditions.length === 1) {
      const c = conditions[0];
      switch (c.conditionType) {
        case 'above':
          return `Price above $${c.value}`;
        case 'below':
          return `Price below $${c.value}`;
        case 'percent_change':
          return `Price change ±${c.value}%`;
        case 'volume_spike':
          return `Volume above $${c.value}`;
        default:
          return 'Custom condition';
      }
    }
    return `${conditions.length} conditions (${operator.toUpperCase()})`;
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 animate-pulse"
          >
            <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (alerts.length === 0 && showEmptyState) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Bell className="w-12 h-12 mx-auto mb-4 text-slate-600" />
        <p className="text-slate-400 text-sm mb-2">No alerts configured</p>
        <p className="text-slate-500 text-xs">Create your first price alert to get started</p>
      </div>
    );
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {alerts.map((alert, index) => (
        <motion.div
          key={alert.id}
          className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-purple-500/30 transition-all duration-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white text-sm truncate">{alert.name}</h3>
                <div
                  className={cn(
                    'flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium',
                    getStateColor(alert.state)
                  )}
                >
                  {getStateIcon(alert.state)}
                  <span>{alert.state}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                {alert.symbol} • {alert.mint.slice(0, 8)}...
              </p>
              <p className="text-xs text-purple-300">{getConditionText(alert)}</p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-3">
            <div>
              <p className="text-slate-400 mb-1">Channels</p>
              <div className="flex gap-1 flex-wrap">
                {alert.notificationChannels.slice(0, 2).map(channel => (
                  <span
                    key={channel}
                    className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs"
                  >
                    {channel.replace('_', ' ')}
                  </span>
                ))}
                {alert.notificationChannels.length > 2 && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-600/30 text-slate-400 text-xs">
                    +{alert.notificationChannels.length - 2}
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Cooldown</p>
              <p className="text-white">{alert.cooldownMinutes}m</p>
            </div>
          </div>

          {/* Timestamps */}
          {(alert.lastTriggeredAt || alert.cooldownUntil) && (
            <div className="text-xs text-slate-400 mb-3 space-y-1">
              {alert.lastTriggeredAt && (
                <p>Last triggered: {new Date(alert.lastTriggeredAt).toLocaleString()}</p>
              )}
              {alert.cooldownUntil && (
                <p>Cooldown until: {new Date(alert.cooldownUntil).toLocaleString()}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
            <button
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                alert.state === 'active'
                  ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
              )}
              onClick={() => handleToggleAlert(alert)}
            >
              {alert.state === 'active' ? (
                <>
                  <Pause className="w-3 h-3" /> Disable
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" /> Enable
                </>
              )}
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
              onClick={() => handleDeleteAlert(alert.id)}
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default V0AlertsList;
