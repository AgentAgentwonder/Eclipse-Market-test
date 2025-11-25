import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTradingEventBridge } from '../../src/hooks/useTradingEventBridge';
import { tradingStore } from '../../src/store/tradingStore';
import { walletStore } from '../../src/store/walletStore';
import { uiStore } from '../../src/store/uiStore';
import type {
  Order,
  OrderTriggeredEvent,
  TransactionUpdate,
  CopyTradeExecutionEvent,
} from '../../src/types';

// Mock Tauri event API
const mockListeners = new Map<string, (event: any) => void>();
let mockUnlistenCallCount = 0;

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(async (eventName: string, handler: (event: any) => void) => {
    mockListeners.set(eventName, handler);
    const unlisten = () => {
      mockListeners.delete(eventName);
      mockUnlistenCallCount++;
    };
    return unlisten;
  }),
}));

// Helper to emit mock events
function emitMockEvent<T>(eventName: string, payload: T) {
  const handler = mockListeners.get(eventName);
  if (handler) {
    handler({ payload });
  }
}

describe('useTradingEventBridge', () => {
  beforeEach(() => {
    mockListeners.clear();
    mockUnlistenCallCount = 0;
    vi.clearAllMocks();

    // Reset stores
    tradingStore.getState().reset();
    walletStore.getState().reset();
    uiStore.getState().reset();
  });

  afterEach(() => {
    mockListeners.clear();
  });

  it('should register all event listeners on mount', async () => {
    const { unmount } = renderHook(() => useTradingEventBridge());

    await waitFor(() => {
      expect(mockListeners.size).toBe(5);
    });

    expect(mockListeners.has('order_update')).toBe(true);
    expect(mockListeners.has('order_triggered')).toBe(true);
    expect(mockListeners.has('transaction_update')).toBe(true);
    expect(mockListeners.has('copy_trade_execution')).toBe(true);
    expect(mockListeners.has('order_monitoring_stopped')).toBe(true);

    unmount();
  });

  it('should update event bridge status on successful setup', async () => {
    renderHook(() => useTradingEventBridge());

    await waitFor(() => {
      const status = uiStore.getState().eventBridgeStatus;
      expect(status.isConnected).toBe(true);
      expect(status.lastError).toBeNull();
    });
  });

  it('should handle order_update event and update trading store', async () => {
    renderHook(() => useTradingEventBridge());

    await waitFor(() => expect(mockListeners.size).toBe(5));

    // Add a mock order to the store first
    const mockOrder: Order = {
      id: 'order-123',
      orderType: 'limit',
      side: 'buy',
      status: 'pending',
      inputMint: 'SOL',
      outputMint: 'USDC',
      inputSymbol: 'SOL',
      outputSymbol: 'USDC',
      amount: 10,
      filledAmount: 0,
      slippageBps: 50,
      priorityFeeMicroLamports: 1000,
      walletAddress: 'test-wallet',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tradingStore.setState({ activeOrders: [mockOrder] });

    // Emit order update with filled status
    const updatedOrder: Order = {
      ...mockOrder,
      status: 'filled',
      filledAmount: 10,
      txSignature: 'tx-signature-123',
    };

    emitMockEvent('order_update', updatedOrder);

    await waitFor(() => {
      const status = uiStore.getState().eventBridgeStatus;
      expect(status.eventsReceived).toBeGreaterThan(0);
      expect(status.lastEventTime).not.toBeNull();
    });

    // Check that order was moved to history
    await waitFor(() => {
      expect(tradingStore.getState().activeOrders.length).toBe(0);
      expect(tradingStore.getState().orderHistory.length).toBe(1);
      expect(tradingStore.getState().orderHistory[0].status).toBe('filled');
    });
  });

  it('should handle order_triggered event and show toast', async () => {
    renderHook(() => useTradingEventBridge());

    await waitFor(() => expect(mockListeners.size).toBe(5));

    const triggeredEvent: OrderTriggeredEvent = {
      orderId: 'order-456',
      orderType: 'limit',
      symbol: 'SOL',
      side: 'buy',
      triggerPrice: 150.5,
      amount: 5,
    };

    emitMockEvent('order_triggered', triggeredEvent);

    await waitFor(() => {
      const toasts = uiStore.getState().toasts;
      expect(toasts.length).toBeGreaterThan(0);
      expect(toasts[0].title).toBe('Order Triggered');
      expect(toasts[0].type).toBe('info');
    });
  });

  it('should handle transaction_update event and refresh balances', async () => {
    renderHook(() => useTradingEventBridge());

    await waitFor(() => expect(mockListeners.size).toBe(5));

    // Set up active account
    walletStore.setState({
      activeAccount: {
        publicKey: 'test-wallet-address',
        balance: 100,
        network: 'devnet',
      },
    });

    const txUpdate: TransactionUpdate = {
      signature: 'tx-789',
      slot: 12345,
      timestamp: Date.now(),
      typ: 'transfer',
      amount: 0.5,
      symbol: 'SOL',
      from: 'test-wallet-address',
      to: 'recipient-address',
    };

    // Mock fetchBalances to prevent actual API call
    const fetchBalancesSpy = vi.spyOn(walletStore.getState(), 'fetchBalances');
    fetchBalancesSpy.mockResolvedValue(undefined);

    emitMockEvent('transaction_update', txUpdate);

    await waitFor(() => {
      expect(fetchBalancesSpy).toHaveBeenCalledWith('test-wallet-address', true);
    });

    await waitFor(() => {
      const toasts = uiStore.getState().toasts;
      expect(toasts.some(t => t.title === 'Transaction Update')).toBe(true);
    });

    fetchBalancesSpy.mockRestore();
  });

  it('should handle copy_trade_execution event', async () => {
    renderHook(() => useTradingEventBridge());

    await waitFor(() => expect(mockListeners.size).toBe(5));

    const copyTradeEvent: CopyTradeExecutionEvent = {
      configId: 'config-1',
      name: 'Follow Whale',
      sourceWallet: 'whale-wallet',
      amount: 100,
      symbol: 'BONK',
      status: 'success',
      txSignature: 'copy-tx-123',
    };

    // Mock fetchBalances to prevent actual API call
    const fetchBalancesSpy = vi.spyOn(walletStore.getState(), 'fetchBalances');
    fetchBalancesSpy.mockResolvedValue(undefined);

    emitMockEvent('copy_trade_execution', copyTradeEvent);

    await waitFor(() => {
      const toasts = uiStore.getState().toasts;
      expect(toasts.some(t => t.title === 'Copy Trade Executed')).toBe(true);
      expect(toasts.some(t => t.type === 'success')).toBe(true);
    });

    fetchBalancesSpy.mockRestore();
  });

  it('should handle order_monitoring_stopped event and set error state', async () => {
    renderHook(() => useTradingEventBridge());

    await waitFor(() => expect(mockListeners.size).toBe(5));

    const errorMessage = 'Database connection lost';
    emitMockEvent('order_monitoring_stopped', errorMessage);

    await waitFor(() => {
      const tradingError = tradingStore.getState().error;
      expect(tradingError).toContain('Order monitoring stopped');
      expect(tradingError).toContain(errorMessage);
    });

    await waitFor(() => {
      const status = uiStore.getState().eventBridgeStatus;
      expect(status.isConnected).toBe(false);
      expect(status.lastError).toBe('Order monitoring stopped');
    });

    await waitFor(() => {
      const toasts = uiStore.getState().toasts;
      expect(toasts.some(t => t.type === 'error' && t.title === 'Order Monitoring Stopped')).toBe(
        true
      );
    });
  });

  it('should cleanup all listeners on unmount', async () => {
    const { unmount } = renderHook(() => useTradingEventBridge());

    await waitFor(() => {
      expect(mockListeners.size).toBe(5);
    });

    const initialUnlistenCount = mockUnlistenCallCount;

    unmount();

    await waitFor(() => {
      expect(mockListeners.size).toBe(0);
      expect(mockUnlistenCallCount).toBe(initialUnlistenCount + 5);
    });

    // Verify connection status is updated
    await waitFor(() => {
      const status = uiStore.getState().eventBridgeStatus;
      expect(status.isConnected).toBe(false);
    });
  });

  it('should only initialize once even with multiple renders', async () => {
    const { rerender } = renderHook(() => useTradingEventBridge());

    await waitFor(() => expect(mockListeners.size).toBe(5));

    const initialListenerCount = mockListeners.size;

    // Rerender multiple times
    rerender();
    rerender();
    rerender();

    // Should still have the same number of listeners
    expect(mockListeners.size).toBe(initialListenerCount);
  });

  it('should record event metrics correctly', async () => {
    renderHook(() => useTradingEventBridge());

    await waitFor(() => expect(mockListeners.size).toBe(5));

    const initialStatus = uiStore.getState().eventBridgeStatus;
    expect(initialStatus.eventsReceived).toBe(0);

    // Emit multiple events
    emitMockEvent('order_update', {
      id: 'order-1',
      status: 'pending',
    } as Order);

    const triggeredEvent: OrderTriggeredEvent = {
      orderId: 'order-2',
      orderType: 'limit',
      symbol: 'SOL',
      side: 'buy',
      triggerPrice: 100,
      amount: 1,
    };
    emitMockEvent('order_triggered', triggeredEvent);

    await waitFor(() => {
      const status = uiStore.getState().eventBridgeStatus;
      expect(status.eventsReceived).toBeGreaterThanOrEqual(2);
      expect(status.lastEventTime).not.toBeNull();
      expect(status.isConnected).toBe(true);
    });
  });
});
