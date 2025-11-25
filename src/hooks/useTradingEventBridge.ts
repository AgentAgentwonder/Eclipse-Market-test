import { useEffect, useRef } from 'react';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { tradingStore } from '@/store/tradingStore';
import { walletStore } from '@/store/walletStore';
import { uiStore } from '@/store/uiStore';
import type {
  Order,
  OrderTriggeredEvent,
  TransactionUpdate,
  CopyTradeExecutionEvent,
} from '@/types';

/**
 * Hook that bridges Tauri event streams to Zustand stores for real-time updates.
 *
 * Listens to:
 * - order_update: Full order updates from backend
 * - order_triggered: Notifications when limit/stop orders trigger
 * - transaction_update: Wallet transaction notifications
 * - copy_trade_execution: Copy trading execution events
 * - order_monitoring_stopped: Order monitoring service stopped
 */
export function useTradingEventBridge() {
  const unlistenersRef = useRef<UnlistenFn[]>([]);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) {
      return;
    }

    isInitializedRef.current = true;
    const unlisteners: UnlistenFn[] = [];

    const setupListeners = async () => {
      console.log('[EventBridge] Setting up Tauri event listeners...');

      try {
        // Listen for order updates (order_update)
        const orderUpdateUnlisten = await listen<Order>('order_update', event => {
          console.log('[EventBridge] order_update:', event.payload);
          uiStore.getState().recordEventReceived();

          const order = event.payload;
          // Convert Order to OrderUpdate format
          tradingStore.getState().handleOrderUpdate({
            orderId: order.id,
            status: order.status,
            filledAmount: order.filledAmount,
            txSignature: order.txSignature,
            errorMessage: order.errorMessage,
          });
        });
        unlisteners.push(orderUpdateUnlisten);

        // Listen for order triggered events (order_triggered)
        const orderTriggeredUnlisten = await listen<OrderTriggeredEvent>(
          'order_triggered',
          event => {
            console.log('[EventBridge] order_triggered:', event.payload);
            uiStore.getState().recordEventReceived();

            const triggered = event.payload;
            uiStore.getState().addToast({
              type: 'info',
              title: 'Order Triggered',
              message: `${triggered.side.toUpperCase()} ${triggered.amount} ${triggered.symbol} at ${triggered.triggerPrice}`,
              duration: 5000,
            });
          }
        );
        unlisteners.push(orderTriggeredUnlisten);

        // Listen for transaction updates (transaction_update)
        const transactionUpdateUnlisten = await listen<TransactionUpdate>(
          'transaction_update',
          event => {
            console.log('[EventBridge] transaction_update:', event.payload);
            uiStore.getState().recordEventReceived();

            const tx = event.payload;
            // Refresh wallet balances for the affected address
            const targetAddress = tx.from || tx.to;
            if (targetAddress) {
              walletStore.getState().handleTransactionUpdate(tx.signature, targetAddress);
            } else {
              // Refresh active account if no specific address
              walletStore.getState().handleTransactionUpdate(tx.signature);
            }

            // Show notification if amount is available
            if (tx.amount && tx.symbol) {
              uiStore.getState().addToast({
                type: 'info',
                title: 'Transaction Update',
                message: `${tx.typ || 'Transaction'}: ${tx.amount} ${tx.symbol}`,
                duration: 4000,
              });
            }
          }
        );
        unlisteners.push(transactionUpdateUnlisten);

        // Listen for copy trade execution events (copy_trade_execution)
        const copyTradeUnlisten = await listen<CopyTradeExecutionEvent>(
          'copy_trade_execution',
          event => {
            console.log('[EventBridge] copy_trade_execution:', event.payload);
            uiStore.getState().recordEventReceived();

            const execution = event.payload;
            const isSuccess = execution.status === 'success';

            uiStore.getState().addToast({
              type: isSuccess ? 'success' : 'warning',
              title: 'Copy Trade Executed',
              message: `${execution.name}: ${execution.amount} ${execution.symbol}`,
              duration: 5000,
            });

            // Refresh wallet balances after copy trade
            walletStore
              .getState()
              .handleTransactionUpdate(execution.txSignature || 'copy_trade', undefined);
          }
        );
        unlisteners.push(copyTradeUnlisten);

        // Listen for order monitoring stopped event (order_monitoring_stopped)
        const monitoringStoppedUnlisten = await listen<string>(
          'order_monitoring_stopped',
          event => {
            console.error('[EventBridge] order_monitoring_stopped:', event.payload);
            uiStore.getState().recordEventReceived();

            const message = event.payload;
            tradingStore.getState().setError('Order monitoring stopped: ' + message);

            uiStore.getState().addToast({
              type: 'error',
              title: 'Order Monitoring Stopped',
              message: message,
              duration: 0, // Don't auto-dismiss
            });

            uiStore.getState().updateEventBridgeStatus({
              lastError: 'Order monitoring stopped',
              isConnected: false,
            });
          }
        );
        unlisteners.push(monitoringStoppedUnlisten);

        console.log('[EventBridge] All listeners registered successfully');
        uiStore.getState().updateEventBridgeStatus({
          isConnected: true,
          lastError: null,
        });

        unlistenersRef.current = unlisteners;
      } catch (error) {
        console.error('[EventBridge] Failed to setup listeners:', error);
        uiStore.getState().updateEventBridgeStatus({
          isConnected: false,
          lastError: String(error),
        });
      }
    };

    setupListeners();

    // Cleanup function
    return () => {
      console.log('[EventBridge] Cleaning up event listeners...');
      unlistenersRef.current.forEach(unlisten => {
        try {
          unlisten();
        } catch (error) {
          console.error('[EventBridge] Error during cleanup:', error);
        }
      });
      unlistenersRef.current = [];
      isInitializedRef.current = false;

      uiStore.getState().updateEventBridgeStatus({
        isConnected: false,
      });
    };
  }, []);
}
