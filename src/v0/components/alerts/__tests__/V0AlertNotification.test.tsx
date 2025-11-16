import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { motion } from 'framer-motion';
import V0AlertNotification from '../V0AlertNotification';
import { EnhancedAlertNotification } from '../../../../types/alertNotifications';

// Mock the framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock the styles loader
vi.mock('../../../styles', () => ({
  loadV0Styles: vi.fn().mockResolvedValue(undefined),
}));

// Mock utils
vi.mock('../../../lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('V0AlertNotification', () => {
  const mockNotification: EnhancedAlertNotification = {
    alertId: 'test-alert-1',
    alertName: 'Test Alert',
    symbol: 'SOL',
    currentPrice: 150.5,
    priceChange24h: 5.2,
    conditionsMet: 'Price above $150',
    triggeredAt: '2024-01-01T12:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render alert notification with basic information', () => {
    render(<V0AlertNotification notification={mockNotification} onDismiss={vi.fn()} />);

    expect(screen.getByText('Test Alert')).toBeInTheDocument();
    expect(screen.getByText('SOL • $150.50')).toBeInTheDocument();
    expect(screen.getByText('Price above $150')).toBeInTheDocument();
    expect(screen.getByText('+5.20%')).toBeInTheDocument();
  });

  it('should render with negative price change', () => {
    const negativeNotification = {
      ...mockNotification,
      priceChange24h: -2.5,
    };

    render(<V0AlertNotification notification={negativeNotification} onDismiss={vi.fn()} />);

    expect(screen.getByText('-2.50%')).toBeInTheDocument();
    expect(screen.getByText('-2.50%')).toHaveClass('text-red-400');
  });

  it('should call onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<V0AlertNotification notification={mockNotification} onDismiss={onDismiss} />);

    const dismissButton = screen.getByRole('button');
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should render transaction details when provided', () => {
    const notificationWithTransaction: EnhancedAlertNotification = {
      ...mockNotification,
      transaction: {
        signature: 'test-signature',
        timestamp: '2024-01-01T12:00:00Z',
        blockTime: 1704110400,
        tokenSymbol: 'SOL',
        tokenMint: 'So11111111111111111111111111111111111111112',
        amount: 10,
        usdValue: 1505,
        fee: 0.000005,
        fromAddress: '7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi',
        toAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      },
    };

    render(<V0AlertNotification notification={notificationWithTransaction} onDismiss={vi.fn()} />);

    expect(screen.getByText('Amount:')).toBeInTheDocument();
    expect(screen.getByText('10 SOL')).toBeInTheDocument();
    expect(screen.getByText('USD Value:')).toBeInTheDocument();
    expect(screen.getByText('$1,505')).toBeInTheDocument();
  });

  it('should render similar opportunities when provided', () => {
    const notificationWithOpportunities: EnhancedAlertNotification = {
      ...mockNotification,
      similarOpportunities: [
        {
          symbol: 'USDC',
          mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          currentPrice: 1.0,
          priceChange24h: 0.1,
          matchReason: 'Similar volume pattern',
        },
        {
          symbol: 'USDT',
          mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
          currentPrice: 1.0,
          priceChange24h: -0.05,
          matchReason: 'Correlated movement',
        },
      ],
    };

    render(<V0AlertNotification notification={notificationWithOpportunities} onDismiss={vi.fn()} />);

    expect(screen.getByText('Similar opportunities:')).toBeInTheDocument();
    expect(screen.getByText('USDC')).toBeInTheDocument();
    expect(screen.getByText('USDT')).toBeInTheDocument();
    expect(screen.getByText('+0.10%')).toBeInTheDocument();
    expect(screen.getByText('-0.05%')).toBeInTheDocument();
  });

  it('should call onOpenChart when View Chart button is clicked', () => {
    const onOpenChart = vi.fn();
    render(
      <V0AlertNotification
        notification={mockNotification}
        onDismiss={vi.fn()}
        onOpenChart={onOpenChart}
      />
    );

    const chartButton = screen.getByText('View Chart');
    fireEvent.click(chartButton);

    expect(onOpenChart).toHaveBeenCalledWith('SOL', '2024-01-01T12:00:00Z');
  });

  it('should render context message when provided', () => {
    const notificationWithContext: EnhancedAlertNotification = {
      ...mockNotification,
      contextMessage: 'Large SOL transfer from known whale to exchange',
    };

    render(<V0AlertNotification notification={notificationWithContext} onDismiss={vi.fn()} />);

    expect(screen.getByText('Large SOL transfer from known whale to exchange')).toBeInTheDocument();
  });

  it('should render execution price when provided in transaction', () => {
    const notificationWithExecution: EnhancedAlertNotification = {
      ...mockNotification,
      transaction: {
        signature: 'test-signature',
        timestamp: '2024-01-01T12:00:00Z',
        blockTime: 1704110400,
        tokenSymbol: 'SOL',
        tokenMint: 'So11111111111111111111111111111111111111112',
        amount: 10,
        usdValue: 1505,
        fee: 0.000005,
        executionPrice: 150.5,
        fromAddress: '7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi',
        toAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      },
    };

    render(<V0AlertNotification notification={notificationWithExecution} onDismiss={vi.fn()} />);

    expect(screen.getByText('Price:')).toBeInTheDocument();
    expect(screen.getByText('$150.5000')).toBeInTheDocument();
  });
});