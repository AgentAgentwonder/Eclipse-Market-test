import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { V0WalletInfo } from '../V0WalletInfo';
import { useWalletStore } from '../../../../store/walletStore';

// Mock wallet store
vi.mock('../../../../store/walletStore', () => ({
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

describe('V0WalletInfo', () => {
  const mockWallets = [
    {
      id: 'wallet1',
      label: 'Main Wallet',
      publicKey: 'abc123def456',
      balance: 1.5,
      network: 'mainnet',
      walletType: 'phantom' as const,
      preferences: {
        tradingEnabled: true,
        notificationsEnabled: true,
        isolationMode: false,
      },
      performance: {
        totalTrades: 25,
        successfulTrades: 20,
        totalVolume: 150.5,
        realizedPnl: 2.3,
        unrealizedPnl: 0.5,
      },
    },
  ];

  const mockStoreState = {
    wallets: mockWallets,
    activeWalletId: 'wallet1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useWalletStore as any).mockImplementation((selector) => selector(mockStoreState));
  });

  it('renders wallet information', () => {
    render(<V0WalletInfo />);
    
    expect(screen.getByText('Main Wallet')).toBeInTheDocument();
    expect(screen.getByText('abc12...ef456')).toBeInTheDocument();
    expect(screen.getByText('1.5000 SOL')).toBeInTheDocument();
  });

  it('shows performance metrics when enabled', () => {
    render(<V0WalletInfo showPerformance={true} />);
    
    expect(screen.getByText('Total Trades')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument(); // 20/25 = 80%
    expect(screen.getByText('Realized P&L')).toBeInTheDocument();
    expect(screen.getByText('+2.300 SOL')).toBeInTheDocument();
    expect(screen.getByText('Total Volume')).toBeInTheDocument();
    expect(screen.getByText('150.5')).toBeInTheDocument();
  });

  it('hides performance metrics when disabled', () => {
    render(<V0WalletInfo showPerformance={false} />);
    
    expect(screen.queryByText('Total Trades')).not.toBeInTheDocument();
    expect(screen.queryByText('Success Rate')).not.toBeInTheDocument();
    expect(screen.queryByText('Realized P&L')).not.toBeInTheDocument();
    expect(screen.queryByText('Total Volume')).not.toBeInTheDocument();
  });

  it('renders compact view', () => {
    render(<V0WalletInfo compact={true} />);
    
    expect(screen.getByText('abc123...f456')).toBeInTheDocument();
    expect(screen.getByText('1.5000 SOL')).toBeInTheDocument();
    expect(screen.queryByText('Main Wallet')).not.toBeInTheDocument();
    expect(screen.queryByText('Balance')).not.toBeInTheDocument();
  });

  it('displays no wallet selected when no active wallet', () => {
    const emptyState = {
      wallets: [],
      activeWalletId: null,
    };
    
    (useWalletStore as any).mockImplementation((selector) => selector(emptyState));
    
    render(<V0WalletInfo />);
    
    expect(screen.getByText('No wallet selected')).toBeInTheDocument();
  });

  it('uses specific wallet ID when provided', () => {
    const multipleWalletsState = {
      wallets: [
        ...mockWallets,
        {
          id: 'wallet2',
          label: 'Trading Wallet',
          publicKey: 'xyz789uvw012',
          balance: 0.75,
          network: 'devnet',
          walletType: 'hardware_ledger' as const,
          preferences: {
            tradingEnabled: false,
            notificationsEnabled: true,
            isolationMode: true,
          },
          performance: {
            totalTrades: 10,
            successfulTrades: 8,
            totalVolume: 50.25,
            realizedPnl: -0.5,
            unrealizedPnl: 0.1,
          },
        },
      ],
      activeWalletId: 'wallet1',
    };
    
    (useWalletStore as any).mockImplementation((selector) => selector(multipleWalletsState));
    
    render(<V0WalletInfo walletId="wallet2" />);
    
    expect(screen.getByText('Trading Wallet')).toBeInTheDocument();
    expect(screen.getByText('xyz78...w012')).toBeInTheDocument();
    expect(screen.getByText('0.7500 SOL')).toBeInTheDocument();
    expect(screen.getByText('devnet')).toBeInTheDocument();
    expect(screen.getByText('hardware • ledger')).toBeInTheDocument();
  });

  it('displays negative P&L correctly', () => {
    const negativePnLWallet = {
      ...mockWallets[0],
      performance: {
        ...mockWallets[0].performance,
        realizedPnl: -1.2,
      },
    };
    
    const negativePnLState = {
      wallets: [negativePnLWallet],
      activeWalletId: 'wallet1',
    };
    
    (useWalletStore as any).mockImplementation((selector) => selector(negativePnLState));
    
    render(<V0WalletInfo showPerformance={true} />);
    
    const pnlElement = screen.getByText('-1.200 SOL');
    expect(pnlElement).toBeInTheDocument();
    expect(pnlElement).toHaveClass('text-red-400');
  });

  it('shows grouped status when wallet is in a group', () => {
    const groupedWallet = {
      ...mockWallets[0],
      groupId: 'group1',
    };
    
    const groupedState = {
      wallets: [groupedWallet],
      activeWalletId: 'wallet1',
    };
    
    (useWalletStore as any).mockImplementation((selector) => selector(groupedState));
    
    render(<V0WalletInfo />);
    
    expect(screen.getByText('Grouped')).toBeInTheDocument();
  });
});