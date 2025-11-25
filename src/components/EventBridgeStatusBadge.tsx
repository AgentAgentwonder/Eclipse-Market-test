import { useEventBridgeStatus } from '@/store/uiStore';
import { CheckCircle2, XCircle, Activity } from 'lucide-react';

/**
 * Visual indicator showing the status of the Tauri event bridge connection.
 * Useful for debugging and monitoring real-time event updates.
 */
export function EventBridgeStatusBadge() {
  const status = useEventBridgeStatus();

  const getStatusColor = () => {
    if (!status.isConnected) return 'text-red-500';
    if (status.lastError) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getIcon = () => {
    if (!status.isConnected) return <XCircle className="h-4 w-4" />;
    if (status.lastError) return <Activity className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!status.isConnected) return 'Disconnected';
    if (status.lastError) return 'Warning';
    return 'Connected';
  };

  const formatLastEvent = () => {
    if (!status.lastEventTime) return 'Never';
    const elapsed = Date.now() - status.lastEventTime;
    if (elapsed < 1000) return 'Just now';
    if (elapsed < 60000) return `${Math.floor(elapsed / 1000)}s ago`;
    return `${Math.floor(elapsed / 60000)}m ago`;
  };

  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs">
      <div className={`flex items-center gap-1.5 ${getStatusColor()}`}>
        {getIcon()}
        <span className="font-medium">{getStatusText()}</span>
      </div>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-3 text-muted-foreground">
        <span>
          Events: <span className="font-mono">{status.eventsReceived}</span>
        </span>
        <span>Last: {formatLastEvent()}</span>
      </div>
      {status.lastError && (
        <>
          <div className="h-4 w-px bg-border" />
          <span className="text-yellow-500" title={status.lastError}>
            ⚠ {status.lastError.slice(0, 30)}...
          </span>
        </>
      )}
    </div>
  );
}
