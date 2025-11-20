import React from 'react';
import {
  V0AlertNotification,
  V0AlertsList,
  V0AlertNotificationContainer,
  V0AlertsBadge,
} from '../v0/components/alerts';
import { useAlertStore } from '../store/alertStore';

/**
 * Demo component showing V0 alert components working with existing alert store
 * This demonstrates that V0 components can coexist with current alert system
 */
export const V0AlertsDemo: React.FC = () => {
  // Use atomic selectors from existing alert store
  const alerts = useAlertStore(state => state.alerts);
  const enhancedNotifications = useAlertStore(state => state.enhancedNotifications);
  const isLoading = useAlertStore(state => state.isLoading);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-900 rounded-xl p-6 border border-purple-500/20">
        <h2 className="text-xl font-bold text-white mb-4">V0 Alerts Integration Demo</h2>

        {/* Alert Badge */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Alert Badge</h3>
          <V0AlertsBadge onClick={() => console.log('Badge clicked')} />
        </div>

        {/* Alert List */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Alerts List</h3>
          <V0AlertsList maxItems={3} />
        </div>

        {/* Notification Container */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Notifications</h3>
          <V0AlertNotificationContainer
            onOpenChart={(symbol, timestamp) => {
              console.log(`Open chart for ${symbol} at ${timestamp}`);
            }}
          />
        </div>

        {/* Status */}
        <div className="mt-6 p-4 bg-slate-800 rounded-lg">
          <p className="text-sm text-slate-300">
            <span className="font-semibold">Status:</span> {isLoading ? 'Loading...' : 'Ready'}
          </p>
          <p className="text-sm text-slate-300">
            <span className="font-semibold">Total Alerts:</span> {alerts.length}
          </p>
          <p className="text-sm text-slate-300">
            <span className="font-semibold">Pending Notifications:</span>{' '}
            {enhancedNotifications.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default V0AlertsDemo;
