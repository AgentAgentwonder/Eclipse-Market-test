// Global type declarations for debugging
declare global {
  interface Window {
    eclipseStartupLogs?: Array<{
      timestamp: string;
      message: string;
      data?: any;
      source?: string;
    }>;
  }
}

export {};
