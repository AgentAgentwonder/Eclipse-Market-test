import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { useStream } from '../contexts/StreamContext';

function setStateIfChanged<T>(setState: Dispatch<SetStateAction<T>>, next: T) {
  setState(prev => (Object.is(prev, next) ? prev : next));
}

export interface TransactionUpdate {
  signature: string;
  slot: number;
  timestamp: number;
  typ: string | null;
  amount: number | null;
  symbol: string | null;
  from: string | null;
  to: string | null;
}

interface UseWalletStreamOptions {
  filterTypes?: string[];
  historySize?: number;
}

export function useWalletStream(addresses: string[], options?: UseWalletStreamOptions) {
  const [transactions, setTransactions] = useState<TransactionUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscribeWallets, unsubscribeWallets, preferences } = useStream();

  const subscriptionKey = useMemo(() => {
    if (addresses.length === 0) {
      return '';
    }
    const unique = Array.from(new Set(addresses));
    unique.sort();
    return unique.join('|');
  }, [addresses]);

  const normalizedAddresses = useMemo(() => {
    if (!subscriptionKey) {
      return [] as string[];
    }
    return subscriptionKey.split('|');
  }, [subscriptionKey]);

  const filterKey = useMemo(() => {
    const types = options?.filterTypes;
    if (!types || types.length === 0) {
      return '';
    }
    const unique = Array.from(new Set(types));
    unique.sort();
    return unique.join('|');
  }, [options?.filterTypes]);

  const filterTypes = useMemo(() => {
    if (!filterKey) {
      return [] as string[];
    }
    return filterKey.split('|');
  }, [filterKey]);

  const filterSet = useMemo(() => new Set(filterTypes), [filterKey]);
  const historySize = options?.historySize ?? 100;
  const subscribedKeyRef = useRef<string>('');

  useEffect(() => {
    if (normalizedAddresses.length === 0 || !preferences.enableWalletStream) {
      setStateIfChanged(setLoading, false);
      subscribedKeyRef.current = '';
      return;
    }

    let mounted = true;
    let didSubscribe = false;
    let unlisten: UnlistenFn | undefined;

    const subscribe = async () => {
      try {
        await subscribeWallets(normalizedAddresses);
        subscribedKeyRef.current = subscriptionKey;
        didSubscribe = true;
        if (mounted) {
          setStateIfChanged(setLoading, false);
          setStateIfChanged(setError, null);
        }

        unlisten = await listen<TransactionUpdate>('transaction_update', event => {
          if (!mounted) return;
          const payload = event.payload;

          if (filterSet.size > 0 && payload.typ && !filterSet.has(payload.typ)) {
            return;
          }

          setTransactions(prev => {
            if (prev.length > 0) {
              const latest = prev[0];
              if (
                latest.signature === payload.signature &&
                latest.slot === payload.slot &&
                latest.timestamp === payload.timestamp &&
                latest.typ === payload.typ &&
                latest.amount === payload.amount &&
                latest.symbol === payload.symbol &&
                latest.from === payload.from &&
                latest.to === payload.to
              ) {
                return prev;
              }
            }

            const updated = [payload, ...prev];
            return updated.slice(0, historySize);
          });
        });
      } catch (err) {
        console.error('Failed to subscribe to wallet stream:', err);
        if (mounted) {
          setStateIfChanged(setError, err instanceof Error ? err.message : String(err));
          setStateIfChanged(setLoading, false);
        }
      }
    };

    subscribe();

    return () => {
      mounted = false;
      if (unlisten) {
        unlisten();
      }
      if (didSubscribe) {
        unsubscribeWallets(normalizedAddresses).catch(err => {
          console.error('Failed to unsubscribe from wallet stream:', err);
        });
      }
      subscribedKeyRef.current = '';
    };
  }, [
    subscriptionKey,
    filterKey,
    historySize,
    subscribeWallets,
    unsubscribeWallets,
    preferences.enableWalletStream,
  ]);

  return {
    transactions,
    loading,
    error,
  };
}
