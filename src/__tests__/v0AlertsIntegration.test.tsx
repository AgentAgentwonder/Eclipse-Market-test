import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAlertStore, PriceAlert } from '../store/alertStore';
import { EnhancedAlertNotification } from '../types/alertNotifications';
import V0AlertNotification from '../v0/components/alerts/V0AlertNotification';
import V0AlertsList from '../v0/components/alerts/V0AlertsList';
import V0AlertNotificationContainer from '../v0/components/alerts/V0AlertNotificationContainer';
import V0AlertsBadge from '../v0/components/alerts/V0AlertsBadge';

// Mock the alert store
const mockStore = {
  alerts: [],
  enhancedNotifications: [],
  isLoading: false,
  error: null,
  lastTriggerEvent: null,
  createAlert: vi.fn(),
  deleteAlert: vi.fn(),
  updateAlert: vi.fn(),
  dismissNotification: vi.fn(),
  fetchAlerts: vi.fn(),
  testAlert: vi.fn(),
  setLastTriggerEvent: vi.fn(),
  addEnhancedNotification: vi.fn(),
};

vi.mock('../store/alertStore', () => ({
  useAlertStore: vi.fn((selector) => selector(mockStore)),
}));

describe('V0 Alerts Integration Tests', () => {
  const mockAlert: PriceAlert = {
    id: 'test-alert-1',
    name: 'Test Alert',
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
  };

  const mockNotification: EnhancedAlertNotification = {
    alertId: 'test-alert-1',
    alertName: 'Test Alert',
    symbol: 'SOL',
    currentPrice: 155.5,
    priceChange24h: 3.5,
    conditionsMet: 'Price above $150',
    triggeredAt: '2024-01-01T12:30:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to initial state
    Object.assign(mockStore, {
      alerts: [],
      enhancedNotifications: [],
      isLoading: false,
      error: null,
      lastTriggerEvent: null,
    });
  });

  describe('Store Integration', () => {
    it('should render V0AlertsList with store data', () => {
      mockStore.alerts = [mockAlert];
      
      render(<V0AlertsList />);
      
      expect(screen.getByText('Test Alert')).toBeInTheDocument();
      expect(screen.getByText('SOL • So111111...')).toBeInTheDocument();
      expect(screen.getByText('Price above $150')).toBeInTheDocument();
    });

    it('should render V0AlertNotificationContainer with notifications', () => {
      mockStore.alerts = [mockAlert];
      mockStore.enhancedNotifications = [mockNotification];
      
      render(<V0AlertNotificationContainer />);
      
      expect(screen.getByText('Test Alert')).toBeInTheDocument();
      expect(screen.getByText('SOL • $155.50')).toBeInTheDocument();
      expect(screen.getByText('Price above $150')).toBeInTheDocument();
    });

    it('should render V0AlertsBadge with correct count', () => {
      mockStore.alerts = [mockAlert, { ...mockAlert, id: 'alert-2' }];
      
      render(<V0AlertsBadge />);
      
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should call store methods when users interact', async () => {
      mockStore.alerts = [mockAlert];
      mockStore.enhancedNotifications = [mockNotification];
      
      render(<V0AlertNotificationContainer />);
      
      const dismissButton = screen.getAllByRole('button')[0];
      fireEvent.click(dismissButton);
      
      expect(mockStore.dismissNotification).toHaveBeenCalledWith('test-alert-1');
    });

    it('should handle empty states correctly', () => {
      mockStore.alerts = [];
      mockStore.enhancedNotifications = [];
      
      const { container: listContainer } = render(<V0AlertsList showEmptyState={true} />);
      const { container: notificationContainer } = render(<V0AlertNotificationContainer />);
      
      expect(listContainer).toHaveTextContent('No alerts configured');
      expect(notificationContainer.firstChild).toBeNull();
    });

    it('should show notification indicators correctly', () => {
      mockStore.alerts = [mockAlert];
      mockStore.enhancedNotifications = [mockNotification];
      
      render(<V0AlertsBadge />);
      
      // Should show count badge
      expect(screen.getByText('1')).toBeInTheDocument();
      
      // Should show red dot for pending notifications
      const redDot = document.querySelector('.bg-red-500.rounded-full');
      expect(redDot).toBeInTheDocument();
    });

    it('should handle loading states', () => {
      mockStore.isLoading = true;
      
      render(<V0AlertsList />);
      
      // Should show loading skeletons
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should handle error states gracefully', () => {
      mockStore.error = 'Failed to fetch alerts';
      
      // Components should not crash
      expect(() => {
        render(<V0AlertsList showEmptyState={true} />);
        render(<V0AlertsBadge variant="minimal" />);
      }).not.toThrow();
    });
  });

  describe('Real-world Scenario', () => {
    it('should handle complete alert lifecycle', async () => {
      // Step 1: Start with empty state
      render(<V0AlertsList showEmptyState={true} />);
      expect(screen.getByText('No alerts configured')).toBeInTheDocument();
      
      // Step 2: Add alert to store
      mockStore.alerts = [mockAlert];
      
      // Step 3: Alert triggers (notification appears)
      mockStore.enhancedNotifications = [mockNotification];
      render(<V0AlertNotificationContainer />);
      expect(screen.getByText('Test Alert')).toBeInTheDocument();
      
      // Step 4: Dismiss notification
      const dismissButton = screen.getAllByRole('button')[0];
      fireEvent.click(dismissButton);
      
      expect(mockStore.dismissNotification).toHaveBeenCalledWith('test-alert-1');
    });

    it('should demonstrate V0 and existing component compatibility', () => {
      mockStore.alerts = [mockAlert];
      mockStore.enhancedNotifications = [mockNotification];
      
      render(
        <div>
          <V0AlertsList />
          <V0AlertNotificationContainer />
          <V0AlertsBadge />
        </div>
      );
      
      // All components should render without conflicts
      expect(screen.getAllByText('Test Alert')).toHaveLength(2); // One in list, one in notification
      expect(screen.getByText('1')).toBeInTheDocument();
      
      // Should show both list item and notification
      const alertsListText = screen.getAllByText('Test Alert');
      expect(alertsListText.length).toBeGreaterThanOrEqual(1);
    });
  });
});