# Event Bridge Integration Examples

## Quick Start

The event bridge is already mounted in `ClientLayout` and ready to use. Here are common integration patterns:

## 1. Showing Connection Status

Add the status badge to any page header:

```tsx
import { EventBridgeStatusBadge } from '@/components/EventBridgeStatusBadge';

export default function Dashboard() {
  return (
    <div>
      <header className="flex items-center justify-between">
        <h1>Dashboard</h1>
        <EventBridgeStatusBadge />
      </header>
      {/* rest of dashboard */}
    </div>
  );
}
```

## 2. Reacting to Order Updates

Orders update automatically via the bridge. Just subscribe to the store:

```tsx
import { useActiveOrders } from '@/store/tradingStore';

export function OrderBlotter() {
  // This will automatically update when order_update events arrive
  const orders = useActiveOrders();

  return (
    <table>
      {orders.map(order => (
        <tr key={order.id}>
          <td>{order.status}</td>
          <td>{order.filledAmount}</td>
        </tr>
      ))}
    </table>
  );
}
```

## 3. Displaying Real-Time Balances

Wallet balances refresh automatically on transaction_update events:

```tsx
import { useWalletBalances, useActiveAccount } from '@/store/walletStore';

export function BalanceDisplay() {
  const activeAccount = useActiveAccount();
  const balances = useWalletBalances(activeAccount?.publicKey);

  // Balances automatically update when transactions occur
  return (
    <div>
      {balances?.map(token => (
        <div key={token.mint}>
          {token.symbol}: {token.balance}
        </div>
      ))}
    </div>
  );
}
```

## 4. Handling Connection Errors

Show a banner when the bridge disconnects:

```tsx
import { useEventBridgeStatus } from '@/store/uiStore';
import { AlertTriangle } from 'lucide-react';

export function ConnectionBanner() {
  const status = useEventBridgeStatus();

  if (status.isConnected && !status.lastError) {
    return null;
  }

  return (
    <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        <div>
          <p className="font-semibold">Event Bridge Disconnected</p>
          <p className="text-sm text-muted-foreground">
            Real-time updates may be delayed. {status.lastError}
          </p>
        </div>
      </div>
    </div>
  );
}
```

## 5. Toast Notifications

Toasts are automatically shown for events. Access them via:

```tsx
import { useToasts } from '@/store/uiStore';

export function ToastContainer() {
  const toasts = useToasts();

  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      {toasts.map(toast => (
        <div key={toast.id} className={`alert-${toast.type}`}>
          <h4>{toast.title}</h4>
          <p>{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
```

## 6. Dashboard Integration (Full Example)

```tsx
import { useCallback } from 'react';
import { useActiveOrders, useTradingStore } from '@/store/tradingStore';
import { useWalletBalances, useActiveAccount } from '@/store/walletStore';
import { useEventBridgeStatus } from '@/store/uiStore';
import { useShallow } from '@/store/createBoundStore';
import { EventBridgeStatusBadge } from '@/components/EventBridgeStatusBadge';
import { AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const activeAccount = useActiveAccount();
  const balances = useWalletBalances(activeAccount?.publicKey);
  const orders = useActiveOrders();
  const bridgeStatus = useEventBridgeStatus();

  const tradingSelector = useCallback(
    (state) => ({
      isLoading: state.isLoading,
      error: state.error,
    }),
    []
  );
  const { isLoading, error } = useTradingStore(tradingSelector, useShallow);

  return (
    <div className="p-6 space-y-6">
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <EventBridgeStatusBadge />
      </div>

      {/* Connection warning */}
      {!bridgeStatus.isConnected && (
        <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <p className="text-sm">
              Event bridge disconnected. Real-time updates paused.
            </p>
          </div>
        </div>
      )}

      {/* Trading error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Balances - Auto-updates via transaction_update events */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Balance</h3>
          <p className="text-2xl font-bold">
            ${balances?.reduce((sum, b) => sum + b.usdValue, 0).toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="bg-card rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Active Orders</h3>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>

        <div className="bg-card rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Events Received</h3>
          <p className="text-2xl font-bold">{bridgeStatus.eventsReceived}</p>
        </div>
      </div>

      {/* Active Orders - Auto-updates via order_update events */}
      <div className="bg-card rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground">No active orders</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Symbol</th>
                <th className="text-left py-2">Side</th>
                <th className="text-left py-2">Type</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-right py-2">Filled</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b">
                  <td className="py-2">{order.outputSymbol}</td>
                  <td className="py-2">
                    <span className={order.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
                      {order.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2">{order.orderType}</td>
                  <td className="text-right py-2">{order.amount}</td>
                  <td className="text-right py-2">{order.filledAmount}</td>
                  <td className="py-2">
                    <span className={`badge-${order.status}`}>{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

## 7. Testing Event Flow

For development/testing, you can manually trigger store updates:

```tsx
import { tradingStore } from '@/store/tradingStore';
import { walletStore } from '@/store/walletStore';

// Simulate an order update
tradingStore.getState().handleOrderUpdate({
  orderId: 'test-order-123',
  status: 'filled',
  filledAmount: 10,
  txSignature: 'test-sig',
});

// Simulate a transaction
walletStore.getState().handleTransactionUpdate('test-tx-sig', 'wallet-address');
```

## 8. Monitoring in DevTools

In the browser console:

```javascript
// Check event bridge status
window.__uiStore = useUiStore.getState();
console.log(window.__uiStore.eventBridgeStatus);

// Monitor events in real-time
useUiStore.subscribe(
  state => state.eventBridgeStatus.eventsReceived,
  (count) => console.log('Events received:', count)
);
```

## Best Practices

1. **Don't** re-mount `useTradingEventBridge` - it's already in `ClientLayout`
2. **Do** use store selectors to automatically react to updates
3. **Do** show connection status on critical pages (Trading, Dashboard)
4. **Don't** poll for data - let events drive updates
5. **Do** handle the `order_monitoring_stopped` error gracefully
6. **Do** provide visual feedback during disconnection

## Performance Tips

- Use `useShallow` for object selectors to prevent unnecessary re-renders
- Memoize selectors with `useCallback`
- Only subscribe to the specific store slices you need
- Avoid deriving expensive computations in render - use `useMemo`

Example:

```tsx
const mySelector = useCallback(
  (state) => ({
    orders: state.activeOrders,
    error: state.error,
  }),
  []
);
const { orders, error } = useTradingStore(mySelector, useShallow);
```

## Troubleshooting

### "Orders not updating"
- Check `bridgeStatus.isConnected` is `true`
- Verify order exists in `activeOrders` before update
- Check console for `[EventBridge]` logs

### "Balance not refreshing"
- Ensure `activeAccount` is set in `walletStore`
- Check `transaction_update` events are arriving
- Verify `handleTransactionUpdate` is called (check logs)

### "Multiple event listeners"
- Ensure `useTradingEventBridge` is only mounted once
- Check React DevTools for duplicate `ClientLayout` mounts
- React strict mode is handled internally

## See Also

- [Full Event Bridge Documentation](./EVENT_BRIDGE.md)
- [Store Architecture](../src/store/README.md)
- [Hooks Guide](../src/hooks/README.md)
