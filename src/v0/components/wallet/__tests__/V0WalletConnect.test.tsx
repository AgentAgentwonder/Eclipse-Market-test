import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { V0WalletConnect } from '../V0WalletConnect';
import { useWalletStore } from '../../../../store/walletStore';

// Mock the wallet adapter
vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    connected: false,
    connecting: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    wallet: { adapter: { name: 'Phantom' } },
    readyState: 'Installed' as const,
  }),
}));

// Mock the wallet store
vi.mock('@/store/walletStore', () => ({
  useWalletStore: vi.fn(),
}));

// Mock v0 styles
vi.mock('../../../styles', () => ({
  loadV0Styles: vi.fn().mockResolvedValue(undefined),
}));

// Mock utils
vi.mock('../../../lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

describe('V0WalletConnect', () => {
  const mockStoreState = {
    status: 'disconnected' as const,
    publicKey: null,
    balance: 0,
    error: null,
    setStatus: vi.fn(),
    setError: vi.fn(),
    reset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useWalletStore as any).mockImplementation((selector) => selector(mockStoreState));
  });

  it('renders connect button when disconnected', () => {
    render(<V0WalletConnect />);
    
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    expect(screen.queryByText('Disconnect')).not.toBeInTheDocument();
  });

  it('renders wallet info when connected', () => {
    const connectedState = {
      ...mockStoreState,
      status: 'connected' as const,
      publicKey: 'abc123def456',
      balance: 1.5,
    };
    
    (useWalletStore as any).mockImplementation((selector) => selector(connectedState));
    
    render(<V0WalletConnect />);
    
    expect(screen.getByText('abc1...f456')).toBeInTheDocument();
    expect(screen.getByText('1.5000 SOL')).toBeInTheDocument();
    expect(screen.getByText('Disconnect')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('shows loading state when connecting', () => {
    const connectingState = {
      ...mockStoreState,
      status: 'connecting' as const,
    };
    
    (useWalletStore as any).mockImplementation((selector) => selector(connectingState));
    
    render(<V0WalletConnect />);
    
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
    expect(screen.getByText('Connect Wallet')).toBeDisabled();
  });

  it('displays error message', () => {
    const errorState = {
      ...mockStoreState,
      status: 'error' as const,
      error: 'Connection failed',
    };
    
    (useWalletStore as any).mockImplementation((selector) => selector(errorState));
    
    render(<V0WalletConnect />);
    
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('calls onConnect callback when connected', async () => {
    const onConnect = vi.fn();
    const { useWallet } = await import('@solana/wallet-adapter-react');
    const mockConnect = vi.fn().mockResolvedValue(undefined);
    
    (useWallet as any).mockReturnValue({
      connected: true,
      connecting: false,
      connect: mockConnect,
      disconnect: vi.fn(),
      wallet: { adapter: { name: 'Phantom' } },
      readyState: 'Installed' as const,
    });
    
    render(<V0WalletConnect onConnect={onConnect} />);
    
    const connectButton = screen.getByText('Connect Wallet');
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalled();
    });
  });

  it('calls onDisconnect callback when disconnected', async () => {
    const onDisconnect = vi.fn();
    const connectedState = {
      ...mockStoreState,
      status: 'connected' as const,
      publicKey: 'abc123def456',
      balance: 1.5,
    };
    
    (useWalletStore as any).mockImplementation((selector) => selector(connectedState));
    
    render(<V0WalletConnect onDisconnect={onDisconnect} />);
    
    const disconnectButton = screen.getByText('Disconnect');
    fireEvent.click(disconnectButton);
    
    await waitFor(() => {
      expect(onDisconnect).toHaveBeenCalled();
    });
  });
});