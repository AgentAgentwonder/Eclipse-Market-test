/**
 * Global error logging utility
 * Provides centralized error tracking and logging for the entire app
 */

export interface ErrorLog {
  timestamp: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  source: string;
  stack?: string;
  context?: Record<string, unknown>;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private readonly MAX_LOGS = 100;

  log(
    message: string,
    type: 'error' | 'warning' | 'info' = 'error',
    source: string = 'Unknown',
    stack?: string,
    context?: Record<string, unknown>
  ): void {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      message,
      type,
      source,
      stack,
      context,
    };

    this.logs.push(errorLog);

    // Keep only recent logs to prevent memory leak
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const style = `color: ${
        type === 'error' ? '#ff6b6b' : type === 'warning' ? '#ffd93d' : '#6bcf7f'
      }; font-weight: bold;`;
      console.log(`%c[${type.toUpperCase()}] ${source}`, style, message);
      if (stack) {
        console.log('%cStack Trace:', 'color: #888; font-style: italic;');
        console.log(stack);
      }
      if (context) {
        console.log('%cContext:', 'color: #888; font-style: italic;', context);
      }
    }
  }

  error(
    message: string,
    source: string = 'Unknown',
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    this.log(message, 'error', source, error?.stack, context);
  }

  warning(message: string, source: string = 'Unknown', context?: Record<string, unknown>): void {
    this.log(message, 'warning', source, undefined, context);
  }

  info(message: string, source: string = 'Unknown', context?: Record<string, unknown>): void {
    this.log(message, 'info', source, undefined, context);
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  getRecentLogs(count: number = 10): ErrorLog[] {
    return this.logs.slice(-count);
  }

  clear(): void {
    this.logs = [];
  }

  getErrorReport(): string {
    return this.logs
      .map(
        log =>
          `[${log.timestamp}] ${log.type.toUpperCase()} - ${log.source}: ${log.message}${
            log.stack ? '\n' + log.stack : ''
          }`
      )
      .join('\n\n');
  }
}

export const errorLogger = new ErrorLogger();

// Make it globally accessible in development
if (process.env.NODE_ENV === 'development') {
  (window as any).__errorLogger = errorLogger;
}
