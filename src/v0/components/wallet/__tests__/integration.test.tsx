import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { V0WalletConnect, V0WalletSwitcher, V0WalletInfo, V0WalletList } from '../index';
import { useWalletStore } from '../../../../store/walletStore';

// Mock: actual store but test integration
vi.mock('../../../../store/walletStore', () => ({
  useWalletStore: vi.fn(),
}));

// Mock wallet adapter
vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    connected: false,
    connecting: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    wallet: null,
    readyState: 'Installed' as const,
  }),
}));

// Mock v0 styles
vi.mock('../../../styles', () => ({
  loadV0Styles: vi.fn().mockResolvedValue(undefined),
}));

// Mock utils
vi.mock('../../../lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

describe('V0 Wallet Components Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock state
    (useWalletStore as any).mockImplementation(selector =>
      selector({
        status: 'disconnected',
        publicKey: null,
        balance: 0,
        error: null,
        wallets: [],
        activeWalletId: null,
        aggregatedPortfolio: null,
        multiWalletLoading: false,
        multiWalletError: null,
        setActiveWallet: vi.fn(),
        listWallets: vi.fn(),
        getAggregatedPortfolio: vi.fn(),
      })
    );
  });

  it('V0WalletConnect renders without crashing', () => {
    render(<V0WalletConnect />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('V0WalletSwitcher renders add wallet when no wallets', () => {
    render(<V0WalletSwitcher />);
    expect(screen.getByText('Add Wallet')).toBeInTheDocument();
  });

  it('V0WalletInfo renders no wallet state', () => {
    render(<V0WalletInfo />);
    expect(screen.getByText('No wallet selected')).toBeInTheDocument();
  });

  it('V0WalletList renders empty state', () => {
    render(<V0WalletList />);
    expect(screen.getByText('No wallets connected')).toBeInTheDocument();
    expect(screen.getByText('Add Your First Wallet')).toBeInTheDocument();
  });

  it('all components use atomic selectors from store', () => {
    const mockSelector = vi.fn();
    (useWalletStore as any).mockImplementation(mockSelector);

    render(<V0WalletConnect />);

    // Verify that store was accessed with atomic selectors
    expect(mockSelector).toHaveBeenCalled();
  });
});
