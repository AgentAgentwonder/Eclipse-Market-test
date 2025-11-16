import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnimatePresence } from 'framer-motion';
import V0AlertNotificationContainer from '../V0AlertNotificationContainer';
import { useAlertStore } from '../../../../store/alertStore';
import { EnhancedAlertNotification } from '../../../../types/alertNotifications';

// Mock the framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the alert store
vi.mock('../../../../store/alertStore', () => ({
  useAlertStore: vi.fn(),
}));

describe('V0AlertNotificationContainer', () => {
  const mockNotifications: EnhancedAlertNotification[] = [
    {
      alertId: 'alert-1',
      alertName: 'Test Alert 1',
      symbol: 'SOL',
      currentPrice: 150.5,
      conditionsMet: 'Price above $150',
      triggeredAt: '2024-01-01T12:00:00Z',
    },
    {
      alertId: 'alert-2',
      alertName: 'Test Alert 2',
      symbol: 'BTC',
      currentPrice: 45000,
      conditionsMet: 'Volume spike detected',
      triggeredAt: '2024-01-01T11:30:00Z',
    },
  ];

  const mockStore = {
    enhancedNotifications: mockNotifications,
    dismissNotification: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAlertStore).mockImplementation((selector) => selector(mockStore));
  });

  it('should render notifications when present', () => {
    render(<V0AlertNotificationContainer />);

    expect(screen.getByText('Test Alert 1')).toBeInTheDocument();
    expect(screen.getByText('Test Alert 2')).toBeInTheDocument();
    expect(screen.getByText('SOL • $150.50')).toBeInTheDocument();
    expect(screen.getByText('BTC • $45000.00')).toBeInTheDocument();
  });

  it('should render nothing when no notifications', () => {
    vi.mocked(useAlertStore).mockImplementation((selector) => 
      selector({ ...mockStore, enhancedNotifications: [] })
    );

    const { container } = render(<V0AlertNotificationContainer />);

    expect(container.firstChild).toBeNull();
  });

  it('should limit notifications to maxNotifications prop', () => {
    render(<V0AlertNotificationContainer maxNotifications={1} />);

    expect(screen.getByText('Test Alert 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Alert 2')).not.toBeInTheDocument();
  });

  it('should call dismissNotification when dismiss is clicked', () => {
    render(<V0AlertNotificationContainer />);

    const dismissButtons = screen.getAllByRole('button');
    fireEvent.click(dismissButtons[0]); // Click first dismiss button

    expect(mockStore.dismissNotification).toHaveBeenCalledWith('alert-1');
  });

  it('should call onOpenChart when View Chart is clicked', () => {
    const onOpenChart = vi.fn();
    render(<V0AlertNotificationContainer onOpenChart={onOpenChart} />);

    const chartButtons = screen.getAllByText('View Chart');
    fireEvent.click(chartButtons[0]);

    expect(onOpenChart).toHaveBeenCalledWith('SOL', '2024-01-01T12:00:00Z');
  });

  it('should apply position classes correctly', () => {
    const { container } = render(<V0AlertNotificationContainer position="top-left" />);

    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('fixed', 'top-4', 'left-4');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <V0AlertNotificationContainer className="custom-class" />
    );

    const innerDiv = container.querySelector('.max-w-md');
    expect(innerDiv).toHaveClass('custom-class');
  });

  it('should render in bottom-right by default', () => {
    const { container } = render(<V0AlertNotificationContainer />);

    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('fixed', 'bottom-4', 'right-4');
  });

  it('should render notifications in correct order', () => {
    render(<V0AlertNotificationContainer />);

    const notifications = screen.getAllByRole('button');
    expect(notifications).toHaveLength(2); // 2 dismiss buttons

    // First notification should be alert-1
    const firstAlert = screen.getByText('Test Alert 1');
    const secondAlert = screen.getByText('Test Alert 2');

    expect(firstAlert.compareDocumentPosition(secondAlert) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('should handle onOpenChart being undefined', () => {
    render(<V0AlertNotificationContainer />);

    // Should not crash when onOpenChart is not provided
    expect(screen.getByText('Test Alert 1')).toBeInTheDocument();
  });
});