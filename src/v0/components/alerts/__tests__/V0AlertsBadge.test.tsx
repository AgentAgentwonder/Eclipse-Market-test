import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { motion } from 'framer-motion';
import V0AlertsBadge from '../V0AlertsBadge';
import { useAlertStore } from '../../../../store/alertStore';
import { PriceAlert } from '../../../../store/alertStore';

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

// Mock the alert store
vi.mock('../../../../store/alertStore', () => ({
  useAlertStore: vi.fn(),
}));

describe('V0AlertsBadge', () => {
  const mockAlerts: PriceAlert[] = [
    {
      id: 'alert-1',
      name: 'SOL Price Alert',
      symbol: 'SOL',
      mint: 'So11111111111111111111111111111111111111112',
      compoundCondition: {
        conditions: [{ conditionType: 'above', value: 150 }],
        operator: 'and',
      },
      notificationChannels: ['in_app'],
      cooldownMinutes: 5,
      state: 'active',
      createdAt: '2024-01-01T12:00:00Z',
      updatedAt: '2024-01-01T12:00:00Z',
    },
    {
      id: 'alert-2',
      name: 'BTC Volume Alert',
      symbol: 'BTC',
      mint: '9n4nbM75f5UiLZ9zNLCH1FXBI2f8wpbKCqX44upzvQa',
      compoundCondition: {
        conditions: [{ conditionType: 'volume_spike', value: 1000000 }],
        operator: 'and',
      },
      notificationChannels: ['system'],
      cooldownMinutes: 10,
      state: 'disabled',
      createdAt: '2024-01-01T12:00:00Z',
      updatedAt: '2024-01-01T12:00:00Z',
    },
  ];

  const mockStore = {
    alerts: mockAlerts,
    enhancedNotifications: [],
    lastTriggerEvent: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAlertStore).mockImplementation((selector) => selector(mockStore));
  });

  it('should render badge with alert count', () => {
    render(<V0AlertsBadge />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should show only active alerts when showActiveOnly is true', () => {
    render(<V0AlertsBadge showActiveOnly={true} />);

    expect(screen.getByText('1')).toBeInTheDocument(); // Only 1 active alert
  });

  it('should not render when no alerts and not minimal variant', () => {
    vi.mocked(useAlertStore).mockImplementation((selector) => 
      selector({ ...mockStore, alerts: [] })
    );

    const { container } = render(<V0AlertsBadge />);

    expect(container.firstChild).toBeNull();
  });

  it('should render in minimal variant even with no alerts', () => {
    vi.mocked(useAlertStore).mockImplementation((selector) => 
      selector({ ...mockStore, alerts: [] })
    );

    render(<V0AlertsBadge variant="minimal" />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should show pending notification indicator', () => {
    vi.mocked(useAlertStore).mockImplementation((selector) => 
      selector({
        ...mockStore,
        enhancedNotifications: [
          {
            alertId: 'notif-1',
            alertName: 'Test Notification',
            symbol: 'SOL',
            currentPrice: 150,
            conditionsMet: 'Test condition',
            triggeredAt: new Date().toISOString(),
          },
        ],
      })
    );

    render(<V0AlertsBadge />);

    // Should show red dot for pending notifications
    const redDot = document.querySelector('.bg-red-500.rounded-full');
    expect(redDot).toBeInTheDocument();
  });

  it('should show recent trigger indicator', () => {
    const recentTime = new Date(Date.now() - 2 * 60 * 1000).toISOString(); // 2 minutes ago
    
    vi.mocked(useAlertStore).mockImplementation((selector) => 
      selector({
        ...mockStore,
        lastTriggerEvent: {
          alertId: 'alert-1',
          alertName: 'Test Alert',
          symbol: 'SOL',
          currentPrice: 150,
          conditionsMet: 'Test condition',
          triggeredAt: recentTime,
        },
      })
    );

    render(<V0AlertsBadge />);

    // Should show yellow warning icon for recent trigger
    const warningIcon = document.querySelector('.text-yellow-400');
    expect(warningIcon).toBeInTheDocument();
  });

  it('should not show recent trigger indicator for old events', () => {
    const oldTime = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
    
    vi.mocked(useAlertStore).mockImplementation((selector) => 
      selector({
        ...mockStore,
        lastTriggerEvent: {
          alertId: 'alert-1',
          alertName: 'Test Alert',
          symbol: 'SOL',
          currentPrice: 150,
          conditionsMet: 'Test condition',
          triggeredAt: oldTime,
        },
      })
    );

    render(<V0AlertsBadge />);

    // Should not show warning icon for old events
    const warningIcon = document.querySelector('.text-yellow-400');
    expect(warningIcon).not.toBeInTheDocument();
  });

  it('should truncate count when > 99', () => {
    const manyAlerts = Array.from({ length: 150 }, (_, i) => ({
      ...mockAlerts[0],
      id: `alert-${i}`,
      name: `Alert ${i}`,
    }));

    vi.mocked(useAlertStore).mockImplementation((selector) => 
      selector({ ...mockStore, alerts: manyAlerts })
    );

    render(<V0AlertsBadge />);

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<V0AlertsBadge onClick={onClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should apply size classes correctly', () => {
    const { container: smallContainer } = render(<V0AlertsBadge size="sm" />);
    const { container: mediumContainer } = render(<V0AlertsBadge size="md" />);
    const { container: largeContainer } = render(<V0AlertsBadge size="lg" />);

    expect(smallContainer.firstChild).toHaveClass('w-6', 'h-6', 'text-xs');
    expect(mediumContainer.firstChild).toHaveClass('w-8', 'h-8', 'text-sm');
    expect(largeContainer.firstChild).toHaveClass('w-10', 'h-10', 'text-base');
  });

  it('should apply variant classes correctly', () => {
    const { container: defaultContainer } = render(<V0AlertsBadge variant="default" />);
    const { container: minimalContainer } = render(<V0AlertsBadge variant="minimal" />);
    const { container: prominentContainer } = render(<V0AlertsBadge variant="prominent" />);

    expect(defaultContainer.firstChild).toHaveClass('bg-slate-800/60', 'border-slate-600/50');
    expect(minimalContainer.firstChild).toHaveClass('text-slate-400');
    expect(prominentContainer.firstChild).toHaveClass('bg-purple-500/20', 'border-purple-500/30');
  });

  it('should not show count when showCount is false', () => {
    render(<V0AlertsBadge showCount={false} />);

    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<V0AlertsBadge className="custom-class" />);

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('custom-class');
  });

  it('should show correct icon colors based on state', () => {
    // Test with pending notifications (red)
    vi.mocked(useAlertStore).mockImplementation((selector) => 
      selector({
        ...mockStore,
        enhancedNotifications: [{ alertId: 'notif-1', alertName: 'Test', symbol: 'SOL', currentPrice: 150, conditionsMet: 'Test', triggeredAt: new Date().toISOString() }],
      })
    );

    const { container: redContainer } = render(<V0AlertsBadge variant="minimal" />);
    expect(redContainer.querySelector('.text-red-400')).toBeInTheDocument();

    // Test with active alerts only (green)
    vi.mocked(useAlertStore).mockImplementation((selector) => 
      selector({ ...mockStore, enhancedNotifications: [] })
    );

    const { container: greenContainer } = render(<V0AlertsBadge variant="minimal" />);
    expect(greenContainer.querySelector('.text-emerald-400')).toBeInTheDocument();
  });
});