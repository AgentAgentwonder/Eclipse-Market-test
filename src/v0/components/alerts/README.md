# V0 Alerts Components

This directory contains V0 (Version 0) alert components that integrate with the existing Eclipse Market Pro alert system.

## Components

### V0AlertNotification
Individual alert notification component that displays enhanced alert details including price information, conditions, transaction details, and similar opportunities.

**Props:**
- `notification: EnhancedAlertNotification` - The notification data to display
- `onDismiss: () => void` - Callback when dismiss button is clicked
- `onOpenChart?: (symbol: string, timestamp: string) => void` - Optional callback for chart navigation
- `className?: string` - Additional CSS classes

### V0AlertsList
List component for displaying price alerts with actions to enable/disable/delete them.

**Props:**
- `className?: string` - Additional CSS classes
- `onToggleAlert?: (alertId: string) => void` - Optional toggle callback
- `onDeleteAlert?: (alertId: string) => void` - Optional delete callback
- `maxItems?: number` - Maximum number of alerts to display (default: 5)
- `showEmptyState?: boolean` - Whether to show empty state (default: true)

### V0AlertNotificationContainer
Container component that positions and manages multiple alert notifications.

**Props:**
- `onOpenChart?: (symbol: string, timestamp: string) => void` - Optional chart navigation callback
- `className?: string` - Additional CSS classes
- `maxNotifications?: number` - Maximum notifications to display (default: 3)
- `position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'` - Position (default: 'bottom-right')

### V0AlertsBadge
Badge component showing alert count and notification indicators.

**Props:**
- `className?: string` - Additional CSS classes
- `showCount?: boolean` - Whether to show count badge (default: true)
- `showActiveOnly?: boolean` - Count only active alerts (default: false)
- `size?: 'sm' | 'md' | 'lg'` - Badge size (default: 'md')
- `variant?: 'default' | 'minimal' | 'prominent'` - Visual style (default: 'default')
- `onClick?: () => void` - Click callback

## Integration with Existing Alert System

All V0 alert components use atomic selectors from the existing `useAlertStore`:

```typescript
// Atomic selectors used
const alerts = useAlertStore(state => state.alerts);
const enhancedNotifications = useAlertStore(state => state.enhancedNotifications);
const dismissNotification = useAlertStore(state => state.dismissNotification);
const updateAlert = useAlertStore(state => state.updateAlert);
const deleteAlert = useAlertStore(state => state.deleteAlert);
```

This ensures:
- **Centralized state management**: All alert data flows through the existing Zustand store
- **Tauri command usage**: All backend interactions go through existing store actions
- **Consistency**: V0 components work alongside existing alert components without conflicts
- **Real-time updates**: Components automatically update when store state changes

## Usage Examples

### Basic Alert List
```tsx
import { V0AlertsList } from '@/v0/components/alerts';

function MyComponent() {
  return <V0AlertsList maxItems={10} showEmptyState={true} />;
}
```

### Notification Container
```tsx
import { V0AlertNotificationContainer } from '@/v0/components/alerts';

function MyComponent() {
  const handleChartOpen = (symbol: string, timestamp: string) => {
    // Navigate to chart with specific time focus
  };

  return (
    <V0AlertNotificationContainer 
      onOpenChart={handleChartOpen}
      position="bottom-right"
      maxNotifications={5}
    />
  );
}
```

### Alert Badge
```tsx
import { V0AlertsBadge } from '@/v0/components/alerts';

function MyComponent() {
  const handleBadgeClick = () => {
    // Open alert manager or navigate to alerts page
  };

  return (
    <V0AlertsBadge 
      onClick={handleBadgeClick}
      variant="prominent"
      size="lg"
      showActiveOnly={false}
    />
  );
}
```

## Styling

V0 components use the same design system as other V0 components:
- Consistent with `src/v0/styles/globals.css`
- Uses `cn()` utility for conditional classes
- Framer Motion animations for smooth transitions
- Responsive design with Tailwind CSS

## Testing

Comprehensive test coverage includes:
- Unit tests for each component
- Integration tests with alert store
- User interaction testing
- Edge case handling (loading, error, empty states)
- Compatibility tests with existing components

Run tests:
```bash
npm run test -- src/v0/components/alerts/__tests__/
npm run test -- src/__tests__/v0AlertsIntegration.test.tsx
```

## Compatibility

- ✅ Works with existing `useAlertStore`
- ✅ Compatible with `AlertNotificationContainer`
- ✅ Integrates with command palette shortcuts
- ✅ Maintains Tauri command usage patterns
- ✅ Supports all existing notification channels
- ✅ Handles all alert states (active, triggered, cooldown, disabled)