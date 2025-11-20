import React, { useEffect, useMemo, useState } from 'react';
import App from './App';
import { MobileApp } from './mobile/MobileApp';

const startupLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [RESPONSIVE] ${message}`;
  console.log(logMessage, data || '');

  if (typeof window !== 'undefined') {
    window.eclipseStartupLogs = window.eclipseStartupLogs || [];
    window.eclipseStartupLogs.push({ timestamp, message, data, source: 'responsive' });
  }
};

const MOBILE_BREAKPOINT = 768;

const isMobileViewport = () => {
  try {
    if (typeof window === 'undefined') {
      startupLog('Window not available, assuming desktop');
      return false;
    }

    const userAgent = window.navigator.userAgent || '';
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );
    const isSmallViewport = window.innerWidth <= MOBILE_BREAKPOINT;
    const searchParams = new URLSearchParams(window.location.search);
    const forceMobile = searchParams.get('mobile') === '1';
    const forceDesktop = searchParams.get('desktop') === '1';

    const result = forceDesktop ? false : forceMobile ? true : isMobileUserAgent || isSmallViewport;

    startupLog('Mobile viewport detection', {
      userAgent: userAgent.substring(0, 50),
      isMobileUserAgent,
      isSmallViewport,
      forceMobile,
      forceDesktop,
      result,
    });

    return result;
  } catch (error) {
    startupLog('Error in mobile viewport detection', error);
    return false;
  }
};

export const ResponsiveRoot: React.FC = () => {
  startupLog('ResponsiveRoot component starting');

  const [mobile, setMobile] = useState<boolean>(() => {
    const initialMobile = isMobileViewport();
    startupLog('Initial mobile state', { mobile: initialMobile });
    return initialMobile;
  });

  useEffect(() => {
    startupLog('Setting up resize listener');

    const handleResize = () => {
      const newMobile = isMobileViewport();
      startupLog('Resize detected', { newMobile, oldMobile: mobile });
      setMobile(newMobile);
    };

    try {
      window.addEventListener('resize', handleResize);
      startupLog('Resize listener added successfully');

      return () => {
        startupLog('Cleaning up resize listener');
        window.removeEventListener('resize', handleResize);
      };
    } catch (error) {
      startupLog('Failed to setup resize listener', error);
    }
  }, [mobile]);

  const content = useMemo(() => {
    try {
      startupLog('Determining content to render', { mobile });

      if (mobile) {
        startupLog('Rendering MobileApp');
        return <MobileApp />;
      }

      startupLog('Rendering main App');
      return <App />;
    } catch (error) {
      startupLog('Error in content determination', error);
      return (
        <div
          style={{
            padding: '20px',
            fontFamily: 'monospace',
            background: '#1a1a1a',
            color: '#fff',
            minHeight: '100vh',
          }}
        >
          <h1>Component Loading Error</h1>
          <p>Failed to load the application component:</p>
          <pre style={{ background: '#2a2a2a', padding: '10px', borderRadius: '5px' }}>
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      );
    }
  }, [mobile]);

  startupLog('ResponsiveRoot rendering content');
  return content;
};
