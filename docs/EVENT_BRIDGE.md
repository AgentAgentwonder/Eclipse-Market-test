# Trading Event Bridge

## Overview

The Trading Event Bridge (`useTradingEventBridge`) is a React hook that connects Tauri backend event streams to the frontend Zustand stores, enabling real-time updates for orders, transactions, and copy trading operations.

## Architecture

```
Rust Backend (Tauri)          Event Bridge Hook           Zustand Stores
━━━━━━━━━━━━━━━━━━━          ━━━━━━━━━━━━━━━━━          ━━━━━━━━━━━━━━
OrderManager.emit()      →    listen('order_update')  →    tradingStore.handleOrderUpdate()
OrderManager.emit()      →    listen('order_triggered') →   uiStore.addToast()
WalletMonitor.emit()     →    listen('transaction_update') → walletStore.handleTransactionUpdate()
CopyTradeManager.emit()  →    listen('copy_trade_execution') → walletStore.fetchBalances()
TradingState.emit()      →    listen('order_monitoring_stopped') → tradingStore.setError()
```

## Events

### 1. `order_update`

**Payload**: `Order` (full order object)

**Emitted**: When an order status changes (created, filled, cancelled, failed)

**Handler**: Updates `tradingStore` via `handleOrderUpdate()`:
- Moves filled/cancelled/failed orders to history
- Updates active orders in place for other statuses
- Records event in UI metrics

**Rust Source**: `src-tauri/src/trading/order_manager.rs:381`

```rust
fn emit_order_update(&self, order: &Order) {
    let _ = self.app_handle.emit("order_update", order);
}
```

### 2. `order_triggered`

**Payload**: `OrderTriggeredEvent`

```typescript
{
  orderId: string;
  orderType: OrderType;
  symbol: string;
  side: OrderSide;
  triggerPrice: number;
  amount: number;
}
```

**Emitted**: When a limit/stop/trailing order triggers for execution

**Handler**: Shows informational toast notification with trigger details

**Rust Source**: `src-tauri/src/trading/order_manager.rs:398`

### 3. `transaction_update`

**Payload**: `TransactionUpdate`

```typescript
{
  signature: string;
  slot: number;
  timestamp: number;
  typ?: string;
  amount?: number;
  symbol?: string;
  from?: string;
  to?: string;
}
```

**Emitted**: When a wallet transaction is detected via WebSocket monitoring

**Handler**: 
- Refreshes wallet balances for affected address via `walletStore.handleTransactionUpdate()`
- Shows toast with transaction details

**Rust Source**: `src-tauri/src/insiders/wallet_monitor.rs:85` (listen side)

### 4. `copy_trade_execution`

**Payload**: `CopyTradeExecutionEvent`

```typescript
{
  configId: string;
  name: string;
  sourceWallet: string;
  amount: number;
  symbol: string;
  status: string;
  txSignature?: string;
}
```

**Emitted**: When a copy trade is executed successfully or fails

**Handler**:
- Shows success/warning toast based on status
- Triggers wallet balance refresh

**Rust Source**: `src-tauri/src/trading/copy_trading.rs:824`

### 5. `order_monitoring_stopped`

**Payload**: `string` (error message)

**Emitted**: When the order monitoring background task exits unexpectedly

**Handler**:
- Sets error state in `tradingStore`
- Updates event bridge connection status to disconnected
- Shows persistent error toast (duration: 0)

**Rust Source**: `src-tauri/src/trading/limit_orders.rs:49`

## Usage

### Mounting the Hook

The hook should be mounted **once** at the app root level (e.g., in `ClientLayout`):

```tsx
import { useTradingEventBridge } from '@/hooks/useTradingEventBridge';

export default function ClientLayout({ children }: ClientLayoutProps) {
  // Mount event bridge once at app root
  useTradingEventBridge();

  return (
    <div className="app-layout">
      {children}
    </div>
  );
}
```

### Accessing Event Status

Use the `useEventBridgeStatus` hook to monitor connection health:

```tsx
import { useEventBridgeStatus } from '@/store/uiStore';

function StatusIndicator() {
  const status = useEventBridgeStatus();

  return (
    <div>
      <p>Connected: {status.isConnected ? 'Yes' : 'No'}</p>
      <p>Events Received: {status.eventsReceived}</p>
      <p>Last Event: {status.lastEventTime ? new Date(status.lastEventTime).toLocaleString() : 'Never'}</p>
      {status.lastError && <p>Error: {status.lastError}</p>}
    </div>
  );
}
```

### Visual Status Badge

A pre-built component is available:

```tsx
import { EventBridgeStatusBadge } from '@/components/EventBridgeStatusBadge';

<EventBridgeStatusBadge />
```

## Store Integration

### tradingStore

**Method**: `handleOrderUpdate(update: OrderUpdate)`

- Finds order by ID in `activeOrders`
- Updates status, filledAmount, txSignature, errorMessage
- Moves to `orderHistory` if status is terminal (filled/cancelled/failed)

### walletStore

**Method**: `handleTransactionUpdate(signature: string, walletAddress?: string)`

- Determines target address (explicit or active account)
- Calls `fetchBalances(address, forceRefresh: true)`
- Logs success/failure

### uiStore

**Methods**:
- `updateEventBridgeStatus(status: Partial<EventBridgeStatus>)`: Updates connection state
- `recordEventReceived()`: Increments event counter, updates timestamp
- `addToast(toast)`: Shows notification to user

## Lifecycle

1. **Mount**: Hook registers 5 event listeners via `listen()`
2. **Active**: Events flow from Rust → Hook → Stores
3. **Unmount**: All listeners are unregistered via `unlisten()`

The hook uses a ref (`isInitializedRef`) to prevent double-initialization during React strict mode.

## Error Handling

- Listener setup failures set `eventBridgeStatus.lastError`
- Individual event handler errors are logged but don't crash the app
- `order_monitoring_stopped` explicitly sets disconnected state

## Testing

See `tests/hooks/useTradingEventBridge.test.ts` for comprehensive test coverage:

```bash
npm run test -- tests/hooks/useTradingEventBridge.test.ts
```

Tests cover:
- Listener registration/cleanup
- Event-to-store dispatching
- Toast notifications
- Balance refresh triggers
- Error state handling
- Metrics tracking

## Performance

- Listeners are registered once and reused
- Store updates use Zustand's optimized set() mechanism
- No polling; purely event-driven
- Balance refreshes use `forceRefresh: true` to bypass cache

## Debugging

Enable event bridge logs:

```tsx
// In browser console:
window.__eventBridgeDebug = true;

// All events will log:
// [EventBridge] order_update: {...}
// [EventBridge] transaction_update: {...}
```

Or use the DevConsole (`Ctrl+Shift+D`) to see real-time logs.

## Troubleshooting

### Events not received

1. Check backend is initialized: `tradingStore.getState().initialize()`
2. Verify `order_monitoring_stopped` hasn't fired
3. Check `eventBridgeStatus.isConnected`
4. Look for setup errors in console

### Duplicate listeners

- Hook should only be mounted once at root level
- React strict mode may call effects twice in dev; handled internally

### Orders not updating

- Verify `order_update` event is emitted by backend
- Check that order exists in `activeOrders` before update
- Use `handleOrderUpdate` directly for testing:

```tsx
tradingStore.getState().handleOrderUpdate({
  orderId: 'test-order',
  status: 'filled',
  filledAmount: 10,
});
```

## Future Enhancements

- [ ] Reconnection logic for `order_monitoring_stopped`
- [ ] Event replay after reconnection
- [ ] Rate limiting for high-frequency events
- [ ] Event buffering for offline support
- [ ] WebSocket health checks
- [ ] Custom event subscriptions per page

## Related Files

- Hook: `src/hooks/useTradingEventBridge.ts`
- Types: `src/types/trading.ts`
- Stores: `src/store/tradingStore.ts`, `src/store/walletStore.ts`, `src/store/uiStore.ts`
- Tests: `tests/hooks/useTradingEventBridge.test.ts`
- Status Badge: `src/components/EventBridgeStatusBadge.tsx`
- Backend: `src-tauri/src/trading/order_manager.rs`, `src-tauri/src/trading/copy_trading.rs`
