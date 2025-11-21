import React from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { loadV0Styles } from '../../styles';
import { useAlertStore } from '../../../store/alertStore';

export interface V0AlertsBadgeProps {
  className?: string;
  showCount?: boolean;
  showActiveOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'prominent';
  onClick?: () => void;
}

const V0AlertsBadge: React.FC<V0AlertsBadgeProps> = ({
  className,
  showCount = true,
  showActiveOnly = false,
  size = 'md',
  variant = 'default',
  onClick,
}) => {
  React.useEffect(() => {
    loadV0Styles().catch(console.error);
  }, []);

  // Atomic selectors from existing alert store
  const alerts = useAlertStore(state => state.alerts);
  const enhancedNotifications = useAlertStore(state => state.enhancedNotifications);
  const lastTriggerEvent = useAlertStore(state => state.lastTriggerEvent);

  // Calculate counts
  const activeAlertsCount = alerts.filter(alert => alert.state === 'active').length;
  const totalAlertsCount = alerts.length;
  const pendingNotificationsCount = enhancedNotifications.length;
  const hasRecentTrigger =
    lastTriggerEvent &&
    new Date(lastTriggerEvent.triggeredAt).getTime() > Date.now() - 5 * 60 * 1000; // Last 5 minutes

  const displayCount = showActiveOnly ? activeAlertsCount : totalAlertsCount;
  const hasAlerts = displayCount > 0 || pendingNotificationsCount > 0;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6 text-xs';
      case 'md':
        return 'w-8 h-8 text-sm';
      case 'lg':
        return 'w-10 h-10 text-base';
      default:
        return 'w-8 h-8 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'text-slate-400 hover:text-white';
      case 'prominent':
        return 'bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 hover:border-purple-500/50';
      default:
        return 'bg-slate-800/60 border border-slate-600/50 text-slate-300 hover:bg-slate-700/60 hover:border-slate-500/50';
    }
  };

  const getIconColor = () => {
    if (pendingNotificationsCount > 0) return 'text-red-400';
    if (hasRecentTrigger) return 'text-yellow-400';
    if (activeAlertsCount > 0) return 'text-emerald-400';
    return 'text-slate-400';
  };

  const getBadgeColor = () => {
    if (pendingNotificationsCount > 0) return 'bg-red-500';
    if (hasRecentTrigger) return 'bg-yellow-500';
    return 'bg-purple-500';
  };

  if (!hasAlerts && variant !== 'minimal') {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center rounded-lg transition-all duration-200',
        getSizeClasses(),
        getVariantClasses(),
        onClick && 'cursor-pointer hover:scale-105',
        className
      )}
    >
      {/* Icon */}
      <Bell className={cn('w-4 h-4', getIconColor())} />

      {/* Notification indicator */}
      {pendingNotificationsCount > 0 && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Count badge */}
      {showCount && displayCount > 0 && (
        <div
          className={cn(
            'absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full text-xs font-medium text-white flex items-center justify-center',
            getBadgeColor()
          )}
        >
          {displayCount > 99 ? '99+' : displayCount}
        </div>
      )}

      {/* Recent trigger indicator */}
      {hasRecentTrigger && pendingNotificationsCount === 0 && (
        <div className="absolute -bottom-1 -right-1">
          <AlertTriangle className="w-3 h-3 text-yellow-400" />
        </div>
      )}
    </button>
  );
};

export default V0AlertsBadge;
