# Hooks

Custom React hooks for Eclipse Market Pro.

## Event Bridge Hook

### `useTradingEventBridge`

**Purpose**: Bridges Tauri backend event streams to frontend Zustand stores for real-time updates.

**Usage**: Mount once at app root (e.g., `ClientLayout`).

```tsx
import { useTradingEventBridge } from '@/hooks/useTradingEventBridge';

export default function ClientLayout({ children }) {
  useTradingEventBridge();
  return <div>{children}</div>;
}
```

**Listens to**:
- `order_update` → Updates trading store
- `order_triggered` → Shows notification
- `transaction_update` → Refreshes wallet balances
- `copy_trade_execution` → Triggers balance refresh
- `order_monitoring_stopped` → Sets error state

**See**: [Full Documentation](../../docs/EVENT_BRIDGE.md)

## Tauri Command Hooks

### `useTauriCommand`

Execute Tauri commands with loading/error states:

```tsx
const { data, loading, error, execute } = useTauriCommand('get_balance', {
  address: walletAddress
});
```

### `useStreamingCommand`

Handle streaming responses from Tauri (e.g., AI chat):

```tsx
const { content, isStreaming, error, start } = useAIChatStream();

await start({ message: 'Hello AI' });
```

## Callback Hooks

### `useStableCallback`

Create stable callback references to avoid unnecessary re-renders:

```tsx
const handleSubmit = useStableCallback((data) => {
  // This function identity remains stable across renders
  submitForm(data);
});
```

Also includes:
- `useLatestCallback`: Always uses latest closure values
- `useDebouncedCallback`: Debounce function calls
- `useThrottledCallback`: Throttle function calls

## Developer Hooks

### `useDevConsole`

Access the developer console:

```tsx
const { visible, toggle } = useDevConsole();

<button onClick={toggle}>Toggle DevConsole</button>
```

### `useDevConsoleShortcuts`

Automatically set up DevConsole keyboard shortcuts (`Ctrl+Shift+D`).

### `useDevConsoleAutoSetup`

One-line DevConsole setup with shortcuts and error logging.

## Toast Hooks

### `useToast`

Show toast notifications:

```tsx
const { toast } = useToast();

toast({
  title: 'Success',
  description: 'Order created',
  variant: 'default',
});
```

## Mobile Hooks

### `useMobile`

Detect if the app is running on mobile:

```tsx
const isMobile = useMobile();

return isMobile ? <MobileLayout /> : <DesktopLayout />;
```

## Best Practices

1. **Event Bridge**: Mount once at root, never conditionally
2. **Tauri Commands**: Use for one-off backend calls with loading states
3. **Streaming**: Use for long-running operations (AI chat, large data)
4. **Callbacks**: Use stable variants when passing to child components
5. **DevConsole**: Use auto-setup in `App.tsx` for global availability

## Testing

All hooks have corresponding test files in `tests/hooks/`:

```bash
npm run test -- tests/hooks/useTradingEventBridge.test.ts
```

## Adding New Hooks

1. Create hook file: `src/hooks/useMyHook.ts`
2. Export from `src/hooks/index.ts`
3. Add tests: `tests/hooks/useMyHook.test.ts`
4. Document here and in code comments
5. Follow naming convention: `use[PascalCase]`
