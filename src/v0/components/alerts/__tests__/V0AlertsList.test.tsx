import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { motion } from 'framer-motion';
import V0AlertsList from '../V0AlertsList';
import { useAlertStore } from '../../../../store/alertStore';
import { PriceAlert, AlertState } from '../../../../store/alertStore';

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

describe('V0AlertsList', () => {
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
      notificationChannels: ['in_app', 'email'],
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
      state: 'triggered',
      lastTriggeredAt: '2024-01-01T11:30:00Z',
      createdAt: '2024-01-01T12:00:00Z',
      updatedAt: '2024-01-01T12:00:00Z',
    },
  ];

  const mockStore = {
    alerts: mockAlerts,
    isLoading: false,
    updateAlert: vi.fn(),
    deleteAlert: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAlertStore).mockImplementation(selector => selector(mockStore));
  });

  it('should render alerts list with alerts', () => {
    render(<V0AlertsList />);

    expect(screen.getByText('SOL Price Alert')).toBeInTheDocument();
    expect(screen.getByText('BTC Volume Alert')).toBeInTheDocument();
    expect(screen.getByText('SOL • So111111...')).toBeInTheDocument();
    expect(screen.getByText('BTC • 9n4nbM75...')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    vi.mocked(useAlertStore).mockImplementation(selector =>
      selector({ ...mockStore, isLoading: true })
    );

    render(<V0AlertsList />);

    // Check for skeleton loaders
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons).toHaveLength(3);
  });

  it('should render empty state when no alerts', () => {
    vi.mocked(useAlertStore).mockImplementation(selector => selector({ ...mockStore, alerts: [] }));

    render(<V0AlertsList showEmptyState={true} />);

    expect(screen.getByText('No alerts configured')).toBeInTheDocument();
    expect(screen.getByText('Create your first price alert to get started')).toBeInTheDocument();
  });

  it('should not render anything when no alerts and empty state disabled', () => {
    vi.mocked(useAlertStore).mockImplementation(selector => selector({ ...mockStore, alerts: [] }));

    const { container } = render(<V0AlertsList showEmptyState={false} />);

    expect(container.firstChild).toBeNull();
  });

  it('should limit number of alerts displayed', () => {
    render(<V0AlertsList maxItems={1} />);

    expect(screen.getByText('SOL Price Alert')).toBeInTheDocument();
    expect(screen.queryByText('BTC Volume Alert')).not.toBeInTheDocument();
  });

  it('should call onToggleAlert when toggle button is clicked', async () => {
    const onToggleAlert = vi.fn();
    render(<V0AlertsList onToggleAlert={onToggleAlert} />);

    const toggleButtons = screen.getAllByText('Disable');
    const toggleButton = toggleButtons[0]; // First disable button
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(onToggleAlert).toHaveBeenCalledWith('alert-1');
    });
  });

  it('should call store updateAlert when toggle button clicked without callback', async () => {
    render(<V0AlertsList />);

    const toggleButtons = screen.getAllByText('Disable');
    const toggleButton = toggleButtons[0]; // First disable button
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(mockStore.updateAlert).toHaveBeenCalledWith('alert-1', { state: 'disabled' });
    });
  });

  it('should call onDeleteAlert when delete button is clicked', async () => {
    const onDeleteAlert = vi.fn();
    render(<V0AlertsList onDeleteAlert={onDeleteAlert} />);

    const deleteButtons = screen.getAllByText('Delete');
    const deleteButton = deleteButtons[0]; // First delete button
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(onDeleteAlert).toHaveBeenCalledWith('alert-1');
    });
  });

  it('should call store deleteAlert when delete button clicked without callback', async () => {
    render(<V0AlertsList />);

    const deleteButtons = screen.getAllByText('Delete');
    const deleteButton = deleteButtons[0]; // First delete button
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockStore.deleteAlert).toHaveBeenCalledWith('alert-1');
    });
  });

  it('should show correct state colors and icons', () => {
    render(<V0AlertsList />);

    // Check active state
    const activeAlert = screen.getByText('SOL Price Alert').closest('[class*="bg-slate-800"]');
    expect(activeAlert).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();

    // Check triggered state
    expect(screen.getByText('triggered')).toBeInTheDocument();
  });

  it('should display notification channels correctly', () => {
    render(<V0AlertsList />);

    expect(screen.getByText('in app')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
    expect(screen.getByText('system')).toBeInTheDocument();
  });

  it('should truncate notification channels when more than 2', () => {
    const alertWithManyChannels: PriceAlert = {
      ...mockAlerts[0],
      notificationChannels: ['in_app', 'email', 'system', 'telegram'],
    };

    vi.mocked(useAlertStore).mockImplementation(selector =>
      selector({ ...mockStore, alerts: [alertWithManyChannels] })
    );

    render(<V0AlertsList />);

    expect(screen.getByText('in app')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument(); // +2 more channels
  });

  it('should display timestamps when available', () => {
    render(<V0AlertsList />);

    expect(screen.getByText(/Last triggered:/)).toBeInTheDocument();
    expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument();
  });

  it('should show enable button for disabled alerts', () => {
    const disabledAlert: PriceAlert = {
      ...mockAlerts[0],
      state: 'disabled',
    };

    vi.mocked(useAlertStore).mockImplementation(selector =>
      selector({ ...mockStore, alerts: [disabledAlert] })
    );

    render(<V0AlertsList />);

    expect(screen.getByText('Enable')).toBeInTheDocument();
  });

  it('should show correct condition text', () => {
    render(<V0AlertsList />);

    expect(screen.getByText('Price above $150')).toBeInTheDocument();
    expect(screen.getByText('Volume above $1000000')).toBeInTheDocument();
  });

  it('should handle compound conditions', () => {
    const compoundAlert: PriceAlert = {
      ...mockAlerts[0],
      compoundCondition: {
        conditions: [
          { conditionType: 'above', value: 150 },
          { conditionType: 'percent_change', value: 5 },
        ],
        operator: 'or',
      },
    };

    vi.mocked(useAlertStore).mockImplementation(selector =>
      selector({ ...mockStore, alerts: [compoundAlert] })
    );

    render(<V0AlertsList />);

    expect(screen.getByText('2 conditions (OR)')).toBeInTheDocument();
  });
});
