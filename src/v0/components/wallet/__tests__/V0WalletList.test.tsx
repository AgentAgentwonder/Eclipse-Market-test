import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { V0WalletList } from '../V0WalletList';
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

describe('V0WalletList', () => {
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
    {
      id: 'wallet2',
      label: 'Trading Wallet',
      publicKey: 'xyz789uvw012',
      balance: 0.75,
      network: 'mainnet',
      walletType: 'hardware_ledger' as const,
      preferences: {
        tradingEnabled: true,
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
  ];

  const mockAggregatedPortfolio = {
    totalBalance: 2.25,
    totalWallets: 2,
    totalGroups: 0,
    totalTrades: 35,
    totalVolume: 200.75,
    totalRealizedPnl: 1.8,
    totalUnrealizedPnl: 0.6,
    wallets: mockWallets,
  };

  const mockStoreState = {
    wallets: mockWallets,
    activeWalletId: 'wallet1',
    aggregatedPortfolio: mockAggregatedPortfolio,
    setActiveWallet: vi.fn().mockResolvedValue(undefined),
    listWallets: vi.fn().mockResolvedValue(undefined),
    getAggregatedPortfolio: vi.fn().mockResolvedValue(mockAggregatedPortfolio),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useWalletStore as any).mockImplementation((selector) => selector(mockStoreState));
  });

  it('renders wallet list with portfolio overview', () => {
    render(<V0WalletList />);
    
    expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText('2.2500 SOL')).toBeInTheDocument();
    expect(screen.getByText('Wallets')).toBeInTheDocument();
    expect(screen.getByText('Main Wallet')).toBeInTheDocument();
    expect(screen.getByText('Trading Wallet')).toBeInTheDocument();
  });

  it('renders compact view', () => {
    render(<V0WalletList compact={true} />);
    
    expect(screen.queryByText('Portfolio Overview')).not.toBeInTheDocument();
    expect(screen.getByText('Main Wallet')).toBeInTheDocument();
    expect(screen.getByText('abc123...f456')).toBeInTheDocument();
    expect(screen.getByText('1.5000')).toBeInTheDocument();
  });

  it('calls setActiveWallet when wallet is selected', async () => {
    render(<V0WalletList />);
    
    const walletButton = screen.getByText('Trading Wallet').closest('button');
    fireEvent.click(walletButton!);
    
    await waitFor(() => {
      expect(mockStoreState.setActiveWallet).toHaveBeenCalledWith('wallet2');
    });
  });

  it('renders empty state when no wallets', () => {
    const emptyState = {
      ...mockStoreState,
      wallets: [],
      activeWalletId: null,
      aggregatedPortfolio: null,
    };
    
    (useWalletStore as any).mockImplementation((selector) => selector(emptyState));
    
    render(<V0WalletList />);
    
    expect(screen.getByText('No wallets connected')).toBeInTheDocument();
    expect(screen.getByText('Add Your First Wallet')).toBeInTheDocument();
  });

  it('calls onAddWallet when add wallet is clicked', () => {
    const emptyState = {
      ...mockStoreState,
      wallets: [],
      activeWalletId: null,
      aggregatedPortfolio: null,
    };
    
    (useWalletStore as any).mockImplementation((selector) => selector(emptyState));
    
    const onAddWallet = vi.fn();
    render(<V0WalletList onAddWallet={onAddWallet} />);
    
    const addButton = screen.getByText('Add Your First Wallet');
    fireEvent.click(addButton);
    
    expect(onAddWallet).toHaveBeenCalled();
  });

  it('calls onWalletSettings when settings is clicked', () => {
    const onWalletSettings = vi.fn();
    render(<V0WalletList onWalletSettings={onWalletSettings} />);
    
    const settingsButtons = screen.getAllByRole('button');
    const settingsButton = settingsButtons.find(btn => 
      btn.querySelector('svg') && !btn.textContent
    );
    
    if (settingsButton) {
      fireEvent.click(settingsButton);
      expect(onWalletSettings).toHaveBeenCalled();
    }
  });

  it('hides balances when hideBalances is toggled', async () => {
    render(<V0WalletList />);
    
    // Initially shows balances
    expect(screen.getByText('2.2500 SOL')).toBeInTheDocument();
    expect(screen.getByText('1.5000 SOL')).toBeInTheDocument();
    
    // Click hide balances button
    const hideButton = screen.getByRole('button').querySelector('svg');
    if (hideButton) {
      fireEvent.click(hideButton.closest('button')!);
      
      await waitFor(() => {
        expect(screen.getByText('****')).toBeInTheDocument();
        expect(screen.queryByText('2.2500 SOL')).not.toBeInTheDocument();
      });
    }
  });

  it('hides performance when showPerformance is false', () => {
    render(<V0WalletList showPerformance={false} />);
    
    expect(screen.queryByText('P&L:')).not.toBeInTheDocument();
  });

  it('shows performance when showPerformance is true', () => {
    render(<V0WalletList showPerformance={true} />);
    
    expect(screen.getByText('P&L: +2.300 SOL')).toBeInTheDocument();
    expect(screen.getByText('P&L: -0.500 SOL')).toBeInTheDocument();
  });

  it('displays wallet type and network information', () => {
    render(<V0WalletList />);
    
    expect(screen.getByText('phantom • mainnet')).toBeInTheDocument();
    expect(screen.getByText('hardware • ledger • mainnet')).toBeInTheDocument();
  });

  it('highlights active wallet', () => {
    render(<V0WalletList />);
    
    const activeWalletButton = screen.getByText('Main Wallet').closest('button');
    const inactiveWalletButton = screen.getByText('Trading Wallet').closest('button');
    
    expect(activeWalletButton?.className).toContain('border-purple-500/50');
    expect(inactiveWalletButton?.className).not.toContain('border-purple-500/50');
  });

  it('calls onWalletSelect when wallet is selected via callback', async () => {
    const onWalletSelect = vi.fn();
    render(<V0WalletList onWalletSelect={onWalletSelect} />);
    
    // Click on the wallet icon button inside the Trading Wallet card
    const tradingWalletText = screen.getByText('Trading Wallet');
    const tradingWalletCard = tradingWalletText.closest('.p-4'); // Get the parent card
    const walletButton = tradingWalletCard?.querySelector('button'); // Get the first button (wallet icon)
    
    if (walletButton) {
      fireEvent.click(walletButton);
    }
    
    await waitFor(() => {
      expect(onWalletSelect).toHaveBeenCalledWith('wallet2');
    }, { timeout: 3000 });
  });
});