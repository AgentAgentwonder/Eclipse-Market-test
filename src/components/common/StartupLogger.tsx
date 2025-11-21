import React, { useEffect } from 'react';

const startupLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [REACT] ${message}`;
  console.log(logMessage, data || '');

  if (typeof window !== 'undefined') {
    window.eclipseStartupLogs = window.eclipseStartupLogs || [];
    window.eclipseStartupLogs.push({ timestamp, message, data, source: 'react' });
  }
};

interface StartupLoggerProps {
  children: React.ReactNode;
}

export const StartupLogger: React.FC<StartupLoggerProps> = ({ children }) => {
  useEffect(() => {
    startupLog('StartupLogger component mounted');

    // Test basic functionality
    try {
      startupLog('Testing basic React functionality');

      // Test if we can access DOM
      const rootElement = document.getElementById('root');
      startupLog('Root element accessible', { exists: !!rootElement });

      // Test if we can create elements
      const testDiv = document.createElement('div');
      testDiv.textContent = 'Test';
      startupLog('DOM element creation works');

      startupLog('Basic functionality tests passed');
    } catch (error) {
      startupLog('Basic functionality test failed', error);
    }

    return () => {
      startupLog('StartupLogger component unmounting');
    };
  }, []);

  return <>{children}</>;
};
