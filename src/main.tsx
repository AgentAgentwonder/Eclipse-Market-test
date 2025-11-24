import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DevErrorDisplay } from './components/DevErrorDisplay';
import { errorLogger } from './utils/errorLogger';
import './styles/globals.css';

// Set up global error handler for unhandled errors
window.addEventListener('error', (event: ErrorEvent) => {
  errorLogger.error(event.message, 'Global Error Handler', event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

// Set up global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  if (reason instanceof Error) {
    errorLogger.error(
      `Unhandled Promise Rejection: ${reason.message}`,
      'Global Promise Handler',
      reason
    );
  } else {
    errorLogger.error(`Unhandled Promise Rejection: ${String(reason)}`, 'Global Promise Handler');
  }
});

// Log app initialization start
errorLogger.info('Application initializing', 'main.tsx');

try {
  errorLogger.info('Creating React root', 'main.tsx');
  const root = document.getElementById('root');

  if (!root) {
    throw new Error('Root element not found in DOM');
  }

  errorLogger.info('Root element found, creating ReactDOM root', 'main.tsx');

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <DevErrorDisplay>
        <App />
      </DevErrorDisplay>
    </React.StrictMode>
  );

  errorLogger.info('React app mounted successfully', 'main.tsx');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  errorLogger.error(
    `Failed to mount React app: ${errorMessage}`,
    'main.tsx',
    error instanceof Error ? error : undefined
  );

  // Display error on screen
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background-color: #0a0e27;
        color: #ffffff;
        padding: 20px;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="
          max-width: 600px;
          background-color: #1a1f3a;
          border: 1px solid #ff6b6b;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
        ">
          <h1 style="margin: 0 0 10px 0; color: #ff6b6b;">Application Failed to Start</h1>
          <p style="margin: 0 0 20px 0; color: #cccccc;">${errorMessage}</p>
          <pre style="
            background-color: #0a0e27;
            border: 1px solid #444;
            border-radius: 4px;
            padding: 10px;
            text-align: left;
            overflow-x: auto;
            max-height: 200px;
            color: #888;
            font-size: 12px;
            margin: 0;
          ">${error instanceof Error ? error.stack || '' : String(error)}</pre>
          <p style="margin-top: 20px; color: #888; font-size: 12px;">
            Please check the browser console (F12) for more details.
          </p>
          <button onclick="location.reload()" style="
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #6bcf7f;
            color: #000;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
          ">Retry</button>
        </div>
      </div>
    `;
  }
}
