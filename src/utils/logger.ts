/**
 * Professional Logging System for Eclipse Market Pro
 *
 * Features:
 * - Structured logging with different levels
 * - Performance monitoring
 * - Error tracking integration
 * - Local storage persistence
 * - Production vs development modes
 * - Remote logging capabilities
 *
 * @version 2.0.0
 * @author Eclipse Market Pro Team
 */

import { invoke } from '@tauri-apps/api/tauri';

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  module?: string;
  userId?: string;
  sessionId?: string;
  performance?: {
    duration?: number;
    memory?: number;
    operation?: string;
  };
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  maxLogSize: number;
  remoteEndpoint?: string;
  apiKey?: string;
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
}

class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private sessionId: string;
  private performanceMarks: Map<string, number> = new Map();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.config = this.getDefaultConfig();
    this.initializeLogger();
  }

  private getDefaultConfig(): LoggerConfig {
    const isDev = import.meta.env.DEV;

    return {
      level: isDev ? LogLevel.TRACE : LogLevel.INFO,
      enableConsole: isDev,
      enableFile: !isDev,
      enableRemote: !isDev,
      maxLogSize: 1000,
      enablePerformanceMonitoring: true,
      enableErrorTracking: true,
      remoteEndpoint: import.meta.env.VITE_LOG_ENDPOINT,
      apiKey: import.meta.env.VITE_LOG_API_KEY,
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeLogger(): void {
    // Setup global error handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }

    // Cleanup old logs periodically
    setInterval(() => {
      this.cleanupOldLogs();
    }, 60000); // Every minute
  }

  private handleGlobalError(event: ErrorEvent): void {
    this.error('Global Error', {
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.message,
      },
      error: {
        name: 'GlobalError',
        message: event.message,
        stack: event.error?.stack,
      },
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    this.error('Unhandled Promise Rejection', {
      context: {
        reason: event.reason,
      },
      error: {
        name: 'UnhandledRejection',
        message: String(event.reason),
      },
    });
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    module?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      module,
      sessionId: this.sessionId,
    };
  }

  private async processLogEntry(entry: LogEntry): Promise<void> {
    // Add to buffer
    this.logBuffer.push(entry);

    // Console output
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // File storage (via Tauri)
    if (this.config.enableFile) {
      try {
        await invoke('store_log_entry', { entry });
      } catch (error) {
        console.error('Failed to store log entry:', error);
      }
    }

    // Remote logging
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.sendToRemote(entry);
    }

    // Cleanup buffer if too large
    if (this.logBuffer.length > this.config.maxLogSize) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxLogSize);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp;
    const module = entry.module ? `[${entry.module}]` : '';
    const message = `${timestamp} ${module} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.TRACE:
        console.trace(message, entry.context);
        break;
      case LogLevel.DEBUG:
        console.debug(message, entry.context);
        break;
      case LogLevel.INFO:
        console.info(message, entry.context);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.context);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, entry.context);
        break;
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint || !this.config.apiKey) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fail silently for remote logging to avoid infinite loops
      console.debug('Failed to send log to remote endpoint:', error);
    }
  }

  private cleanupOldLogs(): void {
    // Keep only logs from the last 24 hours
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.logBuffer = this.logBuffer.filter(
      entry => new Date(entry.timestamp).getTime() > twentyFourHoursAgo
    );
  }

  // Public logging methods
  public trace(message: string, context?: Record<string, any>, module?: string): void {
    if (this.config.level <= LogLevel.TRACE) {
      const entry = this.createLogEntry(LogLevel.TRACE, message, context, module);
      this.processLogEntry(entry);
    }
  }

  public debug(message: string, context?: Record<string, any>, module?: string): void {
    if (this.config.level <= LogLevel.DEBUG) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, context, module);
      this.processLogEntry(entry);
    }
  }

  public info(message: string, context?: Record<string, any>, module?: string): void {
    if (this.config.level <= LogLevel.INFO) {
      const entry = this.createLogEntry(LogLevel.INFO, message, context, module);
      this.processLogEntry(entry);
    }
  }

  public warn(message: string, context?: Record<string, any>, module?: string): void {
    if (this.config.level <= LogLevel.WARN) {
      const entry = this.createLogEntry(LogLevel.WARN, message, context, module);
      this.processLogEntry(entry);
    }
  }

  public error(message: string, context?: Record<string, any>, module?: string): void {
    if (this.config.level <= LogLevel.ERROR) {
      const entry = this.createLogEntry(LogLevel.ERROR, message, context, module);
      this.processLogEntry(entry);
    }
  }

  public fatal(message: string, context?: Record<string, any>, module?: string): void {
    if (this.config.level <= LogLevel.FATAL) {
      const entry = this.createLogEntry(LogLevel.FATAL, message, context, module);
      this.processLogEntry(entry);
    }
  }

  // Performance monitoring
  public startPerformanceTimer(operation: string): void {
    if (this.config.enablePerformanceMonitoring) {
      this.performanceMarks.set(operation, performance.now());
    }
  }

  public endPerformanceTimer(operation: string, context?: Record<string, any>): void {
    if (!this.config.enablePerformanceMonitoring) return;

    const startTime = this.performanceMarks.get(operation);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.performanceMarks.delete(operation);

      this.info(
        `Performance: ${operation}`,
        {
          ...context,
          performance: {
            duration: Math.round(duration * 100) / 100,
            operation,
          },
        },
        'Performance'
      );
    }
  }

  // Memory monitoring
  public logMemoryUsage(context?: Record<string, any>): void {
    if (this.config.enablePerformanceMonitoring && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.info(
        'Memory Usage',
        {
          ...context,
          performance: {
            memory: {
              used: Math.round((memory.usedJSHeapSize / 1024 / 1024) * 100) / 100,
              total: Math.round((memory.totalJSHeapSize / 1024 / 1024) * 100) / 100,
              limit: Math.round((memory.jsHeapSizeLimit / 1024 / 1024) * 100) / 100,
            },
          },
        },
        'Memory'
      );
    }
  }

  // Trading specific logging
  public logTrade(order: any, result: any, executionTime: number): void {
    this.info(
      'Trade Executed',
      {
        orderId: order.id,
        symbol: order.symbol,
        side: order.side,
        amount: order.amount,
        price: result.price,
        executionTime,
      },
      'Trading'
    );
  }

  public logAPIError(endpoint: string, error: any, context?: Record<string, any>): void {
    this.error(
      `API Error: ${endpoint}`,
      {
        ...context,
        error: {
          name: error.name || 'APIError',
          message: error.message,
          stack: error.stack,
        },
        endpoint,
      },
      'API'
    );
  }

  public logSecurityEvent(event: string, context: Record<string, any>): void {
    this.warn(`Security Event: ${event}`, context, 'Security');
  }

  // Utility methods
  public getConfig(): LoggerConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getLogs(level?: LogLevel, module?: string, limit?: number): LogEntry[] {
    let filteredLogs = this.logBuffer;

    if (level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= level);
    }

    if (module) {
      filteredLogs = filteredLogs.filter(log => log.module === module);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs;
  }

  public exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }

  public clearLogs(): void {
    this.logBuffer = [];
  }
}

// Create singleton instance
const logger = new Logger();

// Export convenience functions for different modules
export const logTrace = (message: string, context?: Record<string, any>, module?: string) =>
  logger.trace(message, context, module);

export const logDebug = (message: string, context?: Record<string, any>, module?: string) =>
  logger.debug(message, context, module);

export const logInfo = (message: string, context?: Record<string, any>, module?: string) =>
  logger.info(message, context, module);

export const logWarn = (message: string, context?: Record<string, any>, module?: string) =>
  logger.warn(message, context, module);

export const logError = (message: string, context?: Record<string, any>, module?: string) =>
  logger.error(message, context, module);

export const logFatal = (message: string, context?: Record<string, any>, module?: string) =>
  logger.fatal(message, context, module);

// Performance logging helpers
export const startTimer = (operation: string) => logger.startPerformanceTimer(operation);
export const endTimer = (operation: string, context?: Record<string, any>) =>
  logger.endPerformanceTimer(operation, context);

// Memory logging
export const logMemory = (context?: Record<string, any>) => logger.logMemoryUsage(context);

// Trading specific helpers
export const logTrade = (order: any, result: any, executionTime: number) =>
  logger.logTrade(order, result, executionTime);

export const logAPIError = (endpoint: string, error: any, context?: Record<string, any>) =>
  logger.logAPIError(endpoint, error, context);

export const logSecurityEvent = (event: string, context: Record<string, any>) =>
  logger.logSecurityEvent(event, context);

// React hook for automatic module logging
export const useLogger = (moduleName: string) => {
  return {
    trace: (message: string, context?: Record<string, any>) =>
      logger.trace(message, context, moduleName),
    debug: (message: string, context?: Record<string, any>) =>
      logger.debug(message, context, moduleName),
    info: (message: string, context?: Record<string, any>) =>
      logger.info(message, context, moduleName),
    warn: (message: string, context?: Record<string, any>) =>
      logger.warn(message, context, moduleName),
    error: (message: string, context?: Record<string, any>) =>
      logger.error(message, context, moduleName),
    fatal: (message: string, context?: Record<string, any>) =>
      logger.fatal(message, context, moduleName),
    startTimer: (operation: string) => logger.startPerformanceTimer(`${moduleName}:${operation}`),
    endTimer: (operation: string, context?: Record<string, any>) =>
      logger.endPerformanceTimer(`${moduleName}:${operation}`, context),
  };
};

export default logger;
