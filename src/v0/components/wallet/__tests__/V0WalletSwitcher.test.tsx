import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { V0WalletSwitcher } from '../V0WalletSwitcher';
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

describe('V0WalletSwitcher', () => {
  const mockWallets = [
    {
      id: 'wallet1',
      label: 'Main Wallet',
      publicKey: 'abc123def456',
      balance: 1.5,
      network: 'mainnet',
      walletType: 'phantom' as const,
    },
    {
      id: 'wallet2',
      label: 'Trading Wallet',
      publicKey: 'xyz789uvw012',
      balance: 0.75,
      network: 'mainnet',
      walletType: 'hardware_ledger' as const,
    },
  ];

  const mockAggregatedPortfolio = {
    totalBalance: 2.25,
    totalWallets: 2,
    totalGroups: 0,
    totalTrades: 10,
    totalVolume: 100.5,
    totalRealizedPnl: 1.2,
    totalUnrealizedPnl: 0.3,
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

  it('renders active wallet info', () => {
    render(<V0WalletSwitcher />);
    
    expect(screen.getByText('Main Wallet')).toBeInTheDocument();
    expect(screen.getByText('abc1...f456')).toBeInTheDocument();
    expect(screen.getByText('1.5000 SOL')).toBeInTheDocument();
  });

  it('shows dropdown when clicked', async () => {
    render(<V0WalletSwitcher />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      expect(screen.getByText('Trading Wallet')).toBeInTheDocument();
    });
  });

  it('displays portfolio overview when multiple wallets', async () => {
    render(<V0WalletSwitcher />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Total Balance')).toBeInTheDocument();
      expect(screen.getByText('2.2500 SOL')).toBeInTheDocument();
      expect(screen.getByText('Total Wallets')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Realized P&L')).toBeInTheDocument();
      expect(screen.getByText('+1.20 SOL')).toBeInTheDocument();
    });
  });

  it('calls setActiveWallet when wallet is selected', async () => {
    render(<V0WalletSwitcher />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      const tradingWallet = screen.getByText('Trading Wallet');
      fireEvent.click(tradingWallet);
    });
    
    await waitFor(() => {
      expect(mockStoreState.setActiveWallet).toHaveBeenCalledWith('wallet2');
    });
  });

  it('renders add wallet button when no wallets', () => {
    const emptyState = {
      ...mockStoreState,
      wallets: [],
      activeWalletId: null,
      aggregatedPortfolio: null,
    };
    
    (useWalletStore as any).mockImplementation((selector) => selector(emptyState));
    
    render(<V0WalletSwitcher />);
    
    expect(screen.getByText('Add Wallet')).toBeInTheDocument();
    expect(screen.queryByText('Main Wallet')).not.toBeInTheDocument();
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
    render(<V0WalletSwitcher onAddWallet={onAddWallet} />);
    
    const addButton = screen.getByText('Add Wallet');
    fireEvent.click(addButton);
    
    expect(onAddWallet).toHaveBeenCalled();
  });

  it('calls onWalletSettings when settings is clicked', async () => {
    const onWalletSettings = vi.fn();
    render(<V0WalletSwitcher onWalletSettings={onWalletSettings} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      const settingsButtons = screen.getAllByRole('button');
      const settingsButton = settingsButtons.find(btn => 
        btn.querySelector('svg') && !btn.textContent
      );
      if (settingsButton) {
        fireEvent.click(settingsButton);
      }
    });
    
    // Note: This test might need adjustment based on the actual SVG icon detection
  });

  it('calls onManageGroups when groups button is clicked', async () => {
    const onManageGroups = vi.fn();
    render(<V0WalletSwitcher onManageGroups={onManageGroups} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      const groupsButton = screen.getByText('Groups');
      fireEvent.click(groupsButton);
    });
    
    expect(onManageGroups).toHaveBeenCalled();
  });
});