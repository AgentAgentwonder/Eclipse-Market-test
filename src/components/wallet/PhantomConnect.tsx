import { useCallback, useEffect, useMemo, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useWallet as useAdapterWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Wallet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { shallow } from 'zustand/shallow';

import { useWalletStore, PhantomSession, WalletStatus } from '../../store/walletStore';

function getErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error';
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return JSON.stringify(error);
}

export function PhantomConnect() {
  const {
    status,
    setStatus,
    publicKey,
    setPublicKey,
    balance,
    setBalance,
    error,
    setError,
    autoReconnect,
    attemptedAutoConnect,
    lastConnected,
    setAttemptedAutoConnect,
    setLastConnected,
    setSession,
    reset,
    network,
  } = useWalletStore(
    state => ({
      status: state.status,
      setStatus: state.setStatus,
      publicKey: state.publicKey,
      setPublicKey: state.setPublicKey,
      balance: state.balance,
      setBalance: state.setBalance,
      error: state.error,
      setError: state.setError,
      autoReconnect: state.autoReconnect,
      attemptedAutoConnect: state.attemptedAutoConnect,
      lastConnected: state.lastConnected,
      setAttemptedAutoConnect: state.setAttemptedAutoConnect,
      setLastConnected: state.setLastConnected,
      setSession: state.setSession,
      reset: state.reset,
      network: state.network,
    }),
    shallow
  );

  const { connection } = useConnection();
  const {
    publicKey: adapterPublicKey,
    connected,
    connecting,
    connect,
    disconnect,
    wallet,
    readyState,
  } = useAdapterWallet();

  const base58Key = useMemo(() => adapterPublicKey?.toBase58() ?? null, [adapterPublicKey]);

  // Refs to track last synced values to prevent redundant updates
  const lastSyncedKey = useRef<string | null>(null);
  const lastSyncedSessionId = useRef<string | null>(null);

  useEffect(() => {
    let nextStatus: WalletStatus;
    if (connecting) {
      nextStatus = 'connecting';
    } else if (connected) {
      nextStatus = 'connected';
    } else if (status !== 'error') {
      nextStatus = 'disconnected';
    } else {
      nextStatus = status;
    }

    if (nextStatus !== status) {
      setStatus(nextStatus);
    }
  }, [connecting, connected, status, setStatus]);

  useEffect(() => {
    if (!connected || !base58Key) {
      return;
    }

    // Only update state if values actually changed
    if (publicKey !== base58Key) {
      setPublicKey(base58Key);
      setLastConnected(new Date().toISOString());
    }
    if (error !== null) {
      setError(null);
    }

    // Update refs to current values
    lastSyncedKey.current = base58Key;

    let cancelled = false;

    const syncSession = async () => {
      try {
        const session = await invoke<PhantomSession>('phantom_connect', {
          payload: {
            publicKey: base58Key,
            network,
            label: wallet?.adapter.name ?? 'Phantom',
          },
        });
        if (!cancelled) {
          // Only update session if it's different (compare by a unique identifier)
          const sessionId = `${session.publicKey}-${session.network}-${session.connected}`;
          if (lastSyncedSessionId.current !== sessionId) {
            setSession(session);
            lastSyncedSessionId.current = sessionId;
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('phantom_connect command not available or failed:', err);
        }
      }
    };

    const loadBalance = async () => {
      try {
        const bal = await invoke<number>('phantom_balance', { address: base58Key });
        if (!cancelled && balance !== bal) {
          setBalance(bal);
        }
      } catch (err) {
        console.warn('phantom_balance command failed, attempting connection fallback', err);
        if (!cancelled && adapterPublicKey) {
          try {
            const lamports = await connection.getBalance(adapterPublicKey, {
              commitment: 'confirmed',
            });
            const newBalance = lamports / LAMPORTS_PER_SOL;
            if (balance !== newBalance) {
              setBalance(newBalance);
            }
          } catch (fallbackErr) {
            console.warn('Failed to fetch balance from connection fallback:', fallbackErr);
          }
        }
      }
    };

    syncSession();
    loadBalance();

    const interval = setInterval(() => {
      if (cancelled || !base58Key) return;
      loadBalance();
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [
    connected,
    base58Key,
    publicKey,
    balance,
    error,
    setPublicKey,
    setLastConnected,
    setError,
    setBalance,
    setSession,
    network,
    wallet,
    adapterPublicKey,
    connection,
  ]);

  useEffect(() => {
    if (attemptedAutoConnect || !autoReconnect) {
      return;
    }

    setAttemptedAutoConnect(true);

    const attemptRestore = async () => {
      try {
        const session = await invoke<PhantomSession | null>('phantom_session');
        if (session) {
          // Only update if values are different
          if (session.publicKey !== publicKey) {
            setSession(session);
            setPublicKey(session.publicKey);
          }
          if ((session.lastConnected ?? null) !== lastConnected) {
            setLastConnected(session.lastConnected ?? null);
          }

          if (
            !connected &&
            wallet &&
            (readyState === WalletReadyState.Installed || readyState === WalletReadyState.Loadable)
          ) {
            try {
              await connect();
            } catch (err) {
              console.log('Auto-connect skipped or rejected:', err);
            }
          }
        }
      } catch (err) {
        console.warn('phantom_session command not available or failed:', err);
      }
    };

    attemptRestore();
  }, [
    attemptedAutoConnect,
    autoReconnect,
    publicKey,
    lastConnected,
    setAttemptedAutoConnect,
    setSession,
    setPublicKey,
    setLastConnected,
    connected,
    wallet,
    readyState,
    connect,
  ]);

  const handleConnect = useCallback(async () => {
    if (!wallet) {
      setError('Phantom wallet not available in this environment');
      setStatus('error');
      return;
    }

    if (readyState === WalletReadyState.Unsupported) {
      setError('Phantom wallet is not installed. Install it from https://phantom.app/');
      setStatus('error');
      return;
    }

    try {
      setStatus('connecting');
      setError(null);
      await connect();
    } catch (err) {
      const message = getErrorMessage(err);
      console.error('Failed to connect Phantom wallet:', err);
      setError(message.includes('User rejected') ? 'Connection rejected' : message);
      setStatus('error');
    }
  }, [wallet, readyState, connect, setError, setStatus]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error('Failed to disconnect Phantom wallet:', err);
    }
    try {
      await invoke('phantom_disconnect');
    } catch (err) {
      console.warn('phantom_disconnect command not available or failed:', err);
    }
    reset();
  }, [disconnect, reset]);

  const renderStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Connected</span>
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Connecting...</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Error</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          <span className="font-mono text-sm">
            {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
          </span>
        </div>
        <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 font-bold">
          {balance.toFixed(4)} SOL
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 rounded-xl border-2 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 transition-all text-sm"
        >
          Disconnect
        </button>
        {renderStatusBadge()}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleConnect}
        disabled={status === 'connecting'}
        className={`px-6 py-2 rounded-xl font-medium transition-all shadow-lg ${
          status === 'connecting'
            ? 'bg-gray-500/50 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-purple-500/30'
        }`}
      >
        {status === 'connecting' ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Connecting...
          </span>
        ) : (
          'Connect Wallet'
        )}
      </button>
      {renderStatusBadge()}
      {error && (
        <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm max-w-xs truncate">
          {error}
        </div>
      )}
    </div>
  );
}
