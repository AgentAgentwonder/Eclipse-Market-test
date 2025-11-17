import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { browserTracingIntegration } from '@sentry/browser';
import { ResponsiveRoot } from './ResponsiveRoot';
import { SolanaWalletProvider } from './providers/SolanaWalletProvider';
import { StreamProvider } from './contexts/StreamContext';
import { useThemeStore } from './store/themeStore';
import { useAccessibilityStore } from './store/accessibilityStore';
import { DiagnosticsProvider } from './providers/DiagnosticsProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Enhanced startup logging
const startupLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [STARTUP] ${message}`;
  console.log(logMessage, data || '');
  
  // Also write to a global variable for debugging
  if (typeof window !== 'undefined') {
    window.eclipseStartupLogs = window.eclipseStartupLogs || [];
    window.eclipseStartupLogs.push({ timestamp, message, data });
  }
};

const initializeApp = () => {
  try {
    startupLog('Starting app initialization');
    
    startupLog('Initializing theme store');
    const themeStore = useThemeStore.getState();
    startupLog('Theme store loaded', { theme: themeStore.currentTheme.name });
    
    startupLog('Applying theme colors');
    themeStore.applyThemeColors();
    
    startupLog('Initializing accessibility store');
    const accessibilityStore = useAccessibilityStore.getState();
    startupLog('Accessibility store loaded', { fontScale: accessibilityStore.fontScale });
    
    startupLog('Applying accessibility settings');
    accessibilityStore.applyAccessibilitySettings();
    
    startupLog('App initialization completed successfully');
  } catch (error) {
    startupLog('App initialization failed', error);
    console.error('Failed to initialize app:', error);
    
    // Show error on screen for debugging
    if (typeof document !== 'undefined') {
      document.body.innerHTML = `
        <div style="padding: 20px; font-family: monospace; background: #1a1a1a; color: #fff; min-height: 100vh;">
          <h1>Initialization Error</h1>
          <p>The app failed to initialize during startup.</p>
          <pre style="background: #2a2a2a; padding: 10px; border-radius: 5px; overflow: auto;">
            ${error instanceof Error ? error.stack : String(error)}
          </pre>
          <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #007acc; color: white; border: none; border-radius: 5px;">
            Reload
          </button>
        </div>
      `;
    }
  }
};

// Add startup error handler
window.addEventListener('error', (event) => {
  startupLog('Global error caught', { 
    message: event.message, 
    filename: event.filename, 
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  startupLog('Unhandled promise rejection', { 
    reason: event.reason 
  });
});

startupLog('Starting main.tsx execution');
initializeApp();

startupLog('Configuring Sentry');
const sentryIntegrations = import.meta.env.VITE_SENTRY_DSN
  ? [
      browserTracingIntegration({
        shouldCreateSpanForRequest: (url: string) => {
          return url.includes('localhost') || /^https:\/\//.test(url) || /^http:\/\//.test(url);
        },
      }),
    ]
  : [];

startupLog('Initializing Sentry');
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || undefined,
  integrations: sentryIntegrations,
  environment: import.meta.env.MODE,
  tracesSampleRate: import.meta.env.MODE === 'production' ? 0.2 : 0.0,
  enabled: Boolean(import.meta.env.VITE_SENTRY_DSN),
});

startupLog('Creating React root');
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

startupLog('Starting React render');
try {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <StartupLogger>
          <StreamProvider>
            <SolanaWalletProvider>
              <DiagnosticsProvider>
                <ResponsiveRoot />
              </DiagnosticsProvider>
            </SolanaWalletProvider>
          </StreamProvider>
        </StartupLogger>
      </ErrorBoundary>
    </React.StrictMode>
  );
  startupLog('React render completed successfully');
} catch (error) {
  startupLog('React render failed', error);
  throw error;
}
