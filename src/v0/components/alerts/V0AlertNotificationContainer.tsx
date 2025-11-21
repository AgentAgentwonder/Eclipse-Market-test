import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAlertStore } from '../../../store/alertStore';
import V0AlertNotification from './V0AlertNotification';

export interface V0AlertNotificationContainerProps {
  onOpenChart?: (symbol: string, timestamp: string) => void;
  className?: string;
  maxNotifications?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const V0AlertNotificationContainer: React.FC<V0AlertNotificationContainerProps> = ({
  onOpenChart,
  className,
  maxNotifications = 3,
  position = 'bottom-right',
}) => {
  // Atomic selectors from existing alert store
  const enhancedNotifications = useAlertStore(state =>
    state.enhancedNotifications.slice(0, maxNotifications)
  );
  const dismissNotification = useAlertStore(state => state.dismissNotification);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'fixed bottom-4 right-4';
      case 'bottom-left':
        return 'fixed bottom-4 left-4';
      case 'top-right':
        return 'fixed top-4 right-4';
      case 'top-left':
        return 'fixed top-4 left-4';
      default:
        return 'fixed bottom-4 right-4';
    }
  };

  if (enhancedNotifications.length === 0) {
    return null;
  }

  return (
    <div className={getPositionClasses()}>
      <div className={`w-full max-w-md space-y-3 z-50 pointer-events-none ${className || ''}`}>
        <div className="space-y-3 pointer-events-auto">
          <AnimatePresence>
            {enhancedNotifications.map(notification => (
              <V0AlertNotification
                key={notification.alertId}
                notification={notification}
                onDismiss={() => dismissNotification(notification.alertId)}
                onOpenChart={onOpenChart}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default V0AlertNotificationContainer;
