import React from 'react';
import { useWallet as useAdapterWallet } from '@solana/wallet-adapter-react';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { Wallet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { loadV0Styles } from '../../styles';
import { useWalletStore, WalletStatus } from '../../../store/walletStore';

export interface V0WalletConnectProps {
  className?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

function getErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error';
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return JSON.stringify(error);
}

export const V0WalletConnect: React.FC<V0WalletConnectProps> = ({
  className,
  onConnect,
  onDisconnect,
}) => {
  React.useEffect(() => {
    loadV0Styles().catch(console.error);
  }, []);

  // Atomic selectors from existing wallet store
  const status = useWalletStore(state => state.status);
  const publicKey = useWalletStore(state => state.publicKey);
  const balance = useWalletStore(state => state.balance);
  const error = useWalletStore(state => state.error);
  const setStatus = useWalletStore(state => state.setStatus);
  const setError = useWalletStore(state => state.setError);
  const reset = useWalletStore(state => state.reset);

  const {
    connected,
    connecting,
    connect,
    disconnect,
    wallet,
    readyState,
  } = useAdapterWallet();

  React.useEffect(() => {
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

  const handleConnect = React.useCallback(async () => {
    if (!wallet) {
      setError('Wallet not available in this environment');
      setStatus('error');
      return;
    }

    if (readyState === WalletReadyState.Unsupported) {
      setError('Wallet is not installed');
      setStatus('error');
      return;
    }

    try {
      setStatus('connecting');
      setError(null);
      await connect();
      onConnect?.();
    } catch (err) {
      const message = getErrorMessage(err);
      console.error('Failed to connect wallet:', err);
      setError(message.includes('User rejected') ? 'Connection rejected' : message);
      setStatus('error');
    }
  }, [wallet, readyState, connect, setError, setStatus, onConnect]);

  const handleDisconnect = React.useCallback(async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
    }
    reset();
    onDisconnect?.();
  }, [disconnect, reset, onDisconnect]);

  const renderStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-lg text-sm",
            "bg-green-500/20 border border-green-500/30 text-green-400"
          )}>
            <CheckCircle className="w-4 h-4" />
            <span>Connected</span>
          </div>
        );
      case 'connecting':
        return (
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-lg text-sm",
            "bg-blue-500/20 border border-blue-500/30 text-blue-400"
          )}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Connecting...</span>
          </div>
        );
      case 'error':
        return (
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-lg text-sm",
            "bg-red-500/20 border border-red-500/30 text-red-400"
          )}>
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
      <div className={cn("flex items-center gap-3", className)}>
        <div className={cn(
          "px-4 py-2 rounded-xl flex items-center gap-2",
          "bg-purple-500/20 border border-purple-500/30"
        )}>
          <Wallet className="w-4 h-4" />
          <span className="font-mono text-sm">
            {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
          </span>
        </div>
        <div className={cn(
          "px-4 py-2 rounded-xl font-bold",
          "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
        )}>
          {balance.toFixed(4)} SOL
        </div>
        <button
          onClick={handleDisconnect}
          className={cn(
            "px-4 py-2 rounded-xl border-2 text-sm transition-all",
            "border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10"
          )}
        >
          Disconnect
        </button>
        {renderStatusBadge()}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        onClick={handleConnect}
        disabled={status === 'connecting'}
        className={cn(
          "px-6 py-2 rounded-xl font-medium transition-all shadow-lg",
          status === 'connecting'
            ? 'bg-gray-500/50 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-purple-500/30'
        )}
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
        <div className={cn(
          "px-4 py-2 rounded-xl text-sm max-w-xs truncate",
          "bg-red-500/10 border border-red-500/30 text-red-400"
        )}>
          {error}
        </div>
      )}
    </div>
  );
};