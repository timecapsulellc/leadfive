/**
 * Comprehensive Error Handling and Logging System
 * Advanced error management with logging, reporting, and recovery
 */

// ============ ERROR TYPES ============
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  WALLET: 'WALLET_ERROR',
  CONTRACT: 'CONTRACT_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
  USER_REJECTED: 'USER_REJECTED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  GAS_ESTIMATION: 'GAS_ESTIMATION_ERROR',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
};

export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// ============ CUSTOM ERROR CLASSES ============
class BaseError extends Error {
  constructor(
    message,
    type = ERROR_TYPES.UNKNOWN,
    severity = ERROR_SEVERITY.MEDIUM,
    context = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.severity = severity;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.id = this.generateErrorId();

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

export class NetworkError extends BaseError {
  constructor(message, context = {}) {
    super(message, ERROR_TYPES.NETWORK, ERROR_SEVERITY.HIGH, context);
  }
}

export class WalletError extends BaseError {
  constructor(message, context = {}) {
    super(message, ERROR_TYPES.WALLET, ERROR_SEVERITY.HIGH, context);
  }
}

export class ContractError extends BaseError {
  constructor(message, context = {}) {
    super(message, ERROR_TYPES.CONTRACT, ERROR_SEVERITY.HIGH, context);
  }
}

export class ValidationError extends BaseError {
  constructor(message, context = {}) {
    super(message, ERROR_TYPES.VALIDATION, ERROR_SEVERITY.MEDIUM, context);
  }
}

export class AuthenticationError extends BaseError {
  constructor(message, context = {}) {
    super(message, ERROR_TYPES.AUTHENTICATION, ERROR_SEVERITY.HIGH, context);
  }
}

export class PermissionError extends BaseError {
  constructor(message, context = {}) {
    super(message, ERROR_TYPES.PERMISSION, ERROR_SEVERITY.HIGH, context);
  }
}

export class RateLimitError extends BaseError {
  constructor(message, context = {}) {
    super(message, ERROR_TYPES.RATE_LIMIT, ERROR_SEVERITY.MEDIUM, context);
  }
}

export class TimeoutError extends BaseError {
  constructor(message, context = {}) {
    super(message, ERROR_TYPES.TIMEOUT, ERROR_SEVERITY.MEDIUM, context);
  }
}

// ============ ERROR LOGGER ============
class ErrorLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
    this.endpoints = {
      local: '/api/errors',
      remote: process.env.REACT_APP_ERROR_REPORTING_URL,
    };
    this.batchSize = 10;
    this.batchTimeout = 5000;
    this.pendingLogs = [];
    this.setupBatchLogging();
  }

  // Log error with context
  log(error, additionalContext = {}) {
    const logEntry = {
      id: error.id || this.generateLogId(),
      timestamp: new Date().toISOString(),
      level: this.mapSeverityToLevel(error.severity),
      message: error.message,
      type: error.type || ERROR_TYPES.UNKNOWN,
      severity: error.severity || ERROR_SEVERITY.MEDIUM,
      stack: error.stack,
      context: {
        ...error.context,
        ...additionalContext,
        userAgent: navigator.userAgent,
        url: window.location.href,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: Date.now(),
      },
    };

    // Add to local logs
    this.logs.push(logEntry);

    // Enforce max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs.splice(0, this.logs.length - this.maxLogs);
    }

    // Add to pending batch
    this.pendingLogs.push(logEntry);

    // Console logging based on severity
    this.consoleLog(logEntry);

    // Send immediately for critical errors
    if (error.severity === ERROR_SEVERITY.CRITICAL) {
      this.sendLog(logEntry);
    }

    return logEntry.id;
  }

  // Generate log ID
  generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Map severity to log level
  mapSeverityToLevel(severity) {
    const mapping = {
      [ERROR_SEVERITY.LOW]: 'info',
      [ERROR_SEVERITY.MEDIUM]: 'warn',
      [ERROR_SEVERITY.HIGH]: 'error',
      [ERROR_SEVERITY.CRITICAL]: 'fatal',
    };
    return mapping[severity] || 'error';
  }

  // Console logging with appropriate method
  consoleLog(logEntry) {
    const method =
      logEntry.level === 'error' || logEntry.level === 'fatal'
        ? 'error'
        : logEntry.level === 'warn'
          ? 'warn'
          : 'log';

    console[method](`[${logEntry.level.toUpperCase()}] ${logEntry.message}`, {
      id: logEntry.id,
      type: logEntry.type,
      context: logEntry.context,
    });
  }

  // Setup batch logging
  setupBatchLogging() {
    setInterval(() => {
      if (this.pendingLogs.length > 0) {
        this.sendBatch();
      }
    }, this.batchTimeout);
  }

  // Send batch of logs
  async sendBatch() {
    if (this.pendingLogs.length === 0) return;

    const batch = this.pendingLogs.splice(0, this.batchSize);

    try {
      await this.sendLogs(batch);
    } catch (error) {
      console.error('Failed to send log batch:', error);
      // Re-add to pending if failed
      this.pendingLogs.unshift(...batch);
    }
  }

  // Send single log
  async sendLog(logEntry) {
    try {
      await this.sendLogs([logEntry]);
    } catch (error) {
      console.error('Failed to send log:', error);
    }
  }

  // Send logs to endpoints
  async sendLogs(logs) {
    const promises = [];

    // Send to local endpoint if available
    if (this.endpoints.local) {
      promises.push(this.sendToEndpoint(this.endpoints.local, logs));
    }

    // Send to remote endpoint if available
    if (this.endpoints.remote) {
      promises.push(this.sendToEndpoint(this.endpoints.remote, logs));
    }

    // Wait for at least one to succeed
    if (promises.length > 0) {
      await Promise.race(promises);
    }
  }

  // Send to specific endpoint
  async sendToEndpoint(endpoint, logs) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        logs,
        metadata: {
          timestamp: Date.now(),
          source: 'frontend',
          version: process.env.REACT_APP_VERSION || '1.0.0',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Logging endpoint responded with ${response.status}`);
    }

    return response.json();
  }

  // Get recent logs
  getRecentLogs(limit = 50) {
    return this.logs.slice(-limit);
  }

  // Get logs by severity
  getLogsBySeverity(severity) {
    return this.logs.filter(log => log.severity === severity);
  }

  // Get logs by type
  getLogsByType(type) {
    return this.logs.filter(log => log.type === type);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.pendingLogs = [];
  }

  // Export logs
  exportLogs() {
    const data = {
      logs: this.logs,
      metadata: {
        exportDate: new Date().toISOString(),
        totalLogs: this.logs.length,
        version: process.env.REACT_APP_VERSION || '1.0.0',
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }
}

// ============ ERROR HANDLER ============
class ErrorHandler {
  constructor() {
    this.logger = new ErrorLogger();
    this.recoveryStrategies = new Map();
    this.retryConfigs = new Map();
    this.errorBoundaries = new Set();
    this.setupGlobalHandlers();
    this.setupRecoveryStrategies();
  }

  // Setup global error handlers
  setupGlobalHandlers() {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      const error = this.normalizeError(event.reason);
      this.handleError(error, { source: 'unhandledrejection' });
    });

    // Global JavaScript errors
    window.addEventListener('error', event => {
      const error = this.normalizeError(
        event.error || new Error(event.message)
      );
      this.handleError(error, {
        source: 'global',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Resource loading errors
    window.addEventListener(
      'error',
      event => {
        if (event.target !== window) {
          const error = new NetworkError('Resource loading failed', {
            resource: event.target.src || event.target.href,
            tagName: event.target.tagName,
          });
          this.handleError(error, { source: 'resource' });
        }
      },
      true
    );
  }

  // Normalize different error types
  normalizeError(error) {
    if (error instanceof BaseError) {
      return error;
    }

    if (error instanceof Error) {
      return new BaseError(
        error.message,
        ERROR_TYPES.UNKNOWN,
        ERROR_SEVERITY.MEDIUM,
        {
          originalName: error.name,
          originalStack: error.stack,
        }
      );
    }

    if (typeof error === 'string') {
      return new BaseError(error);
    }

    if (error && typeof error === 'object') {
      return new BaseError(
        error.message || 'Unknown error',
        ERROR_TYPES.UNKNOWN,
        ERROR_SEVERITY.MEDIUM,
        error
      );
    }

    return new BaseError('Unknown error occurred');
  }

  // Main error handling method
  async handleError(error, context = {}) {
    const normalizedError = this.normalizeError(error);

    // Log the error
    const logId = this.logger.log(normalizedError, context);

    // Attempt recovery if strategy exists
    const recovered = await this.attemptRecovery(normalizedError, context);

    // Notify error boundaries
    this.notifyErrorBoundaries(normalizedError, context, recovered);

    return {
      error: normalizedError,
      logId,
      recovered,
      context,
    };
  }

  // Setup recovery strategies
  setupRecoveryStrategies() {
    // Network error recovery
    this.recoveryStrategies.set(ERROR_TYPES.NETWORK, async (error, context) => {
      const retryConfig = this.retryConfigs.get(context.operation) || {
        maxRetries: 3,
        delay: 1000,
      };

      for (let i = 0; i < retryConfig.maxRetries; i++) {
        await new Promise(resolve =>
          setTimeout(resolve, retryConfig.delay * Math.pow(2, i))
        );

        try {
          if (context.retry && typeof context.retry === 'function') {
            const result = await context.retry();
            return { success: true, result };
          }
        } catch (retryError) {
          if (i === retryConfig.maxRetries - 1) {
            throw retryError;
          }
        }
      }

      return { success: false };
    });

    // Wallet error recovery
    this.recoveryStrategies.set(ERROR_TYPES.WALLET, async (error, context) => {
      // Attempt to reconnect wallet
      if (
        context.reconnectWallet &&
        typeof context.reconnectWallet === 'function'
      ) {
        try {
          await context.reconnectWallet();
          return { success: true, action: 'reconnected' };
        } catch (reconnectError) {
          return { success: false, error: reconnectError };
        }
      }

      return { success: false };
    });

    // Contract error recovery
    this.recoveryStrategies.set(
      ERROR_TYPES.CONTRACT,
      async (error, context) => {
        // Try with different gas settings
        if (
          context.retryWithGas &&
          typeof context.retryWithGas === 'function'
        ) {
          try {
            const result = await context.retryWithGas();
            return { success: true, result };
          } catch (gasError) {
            return { success: false, error: gasError };
          }
        }

        return { success: false };
      }
    );
  }

  // Attempt error recovery
  async attemptRecovery(error, context) {
    const strategy = this.recoveryStrategies.get(error.type);

    if (!strategy) {
      return { success: false, reason: 'No recovery strategy available' };
    }

    try {
      const result = await strategy(error, context);

      if (result.success) {
        this.logger.log(
          new BaseError(
            `Recovery successful for ${error.type}`,
            ERROR_TYPES.UNKNOWN,
            ERROR_SEVERITY.LOW
          ),
          {
            originalError: error.id,
            recoveryAction: result.action || 'unknown',
          }
        );
      }

      return result;
    } catch (recoveryError) {
      this.logger.log(
        new BaseError(
          `Recovery failed for ${error.type}`,
          ERROR_TYPES.UNKNOWN,
          ERROR_SEVERITY.HIGH
        ),
        {
          originalError: error.id,
          recoveryError: recoveryError.message,
        }
      );

      return { success: false, error: recoveryError };
    }
  }

  // Register error boundary
  registerErrorBoundary(boundary) {
    this.errorBoundaries.add(boundary);
  }

  // Unregister error boundary
  unregisterErrorBoundary(boundary) {
    this.errorBoundaries.delete(boundary);
  }

  // Notify error boundaries
  notifyErrorBoundaries(error, context, recovery) {
    this.errorBoundaries.forEach(boundary => {
      if (boundary.onError && typeof boundary.onError === 'function') {
        try {
          boundary.onError(error, context, recovery);
        } catch (boundaryError) {
          console.error('Error boundary notification failed:', boundaryError);
        }
      }
    });
  }

  // Set retry configuration
  setRetryConfig(operation, config) {
    this.retryConfigs.set(operation, config);
  }

  // Add recovery strategy
  addRecoveryStrategy(errorType, strategy) {
    this.recoveryStrategies.set(errorType, strategy);
  }

  // Get error statistics
  getErrorStats() {
    const logs = this.logger.getRecentLogs();
    const stats = {
      total: logs.length,
      bySeverity: {},
      byType: {},
      last24Hours: 0,
      criticalErrors: 0,
    };

    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    logs.forEach(log => {
      // Count by severity
      stats.bySeverity[log.severity] =
        (stats.bySeverity[log.severity] || 0) + 1;

      // Count by type
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;

      // Count last 24 hours
      if (new Date(log.timestamp).getTime() > dayAgo) {
        stats.last24Hours++;
      }

      // Count critical errors
      if (log.severity === ERROR_SEVERITY.CRITICAL) {
        stats.criticalErrors++;
      }
    });

    return stats;
  }
}

// ============ UTILITY FUNCTIONS ============
export const createErrorBoundary = onError => {
  const boundary = { onError };
  errorHandler.registerErrorBoundary(boundary);
  return boundary;
};

export const withErrorHandling = (fn, context = {}) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const result = await errorHandler.handleError(error, {
        ...context,
        operation: fn.name || 'anonymous',
        arguments: args,
      });

      // Re-throw if not recovered
      if (!result.recovered?.success) {
        throw result.error;
      }

      return result.recovered.result;
    }
  };
};

export const handleAsyncError = (promise, context = {}) => {
  return promise.catch(error => errorHandler.handleError(error, context));
};

export const createTimeoutWrapper = (fn, timeout = 30000) => {
  return withErrorHandling(async (...args) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () =>
          reject(new TimeoutError(`Operation timed out after ${timeout}ms`)),
        timeout
      );
    });

    return Promise.race([fn(...args), timeoutPromise]);
  });
};

// ============ EXPORTS ============
export const errorHandler = new ErrorHandler();
export const errorLogger = errorHandler.logger;

export {
  BaseError,
  NetworkError,
  WalletError,
  ContractError,
  ValidationError,
  AuthenticationError,
  PermissionError,
  RateLimitError,
  TimeoutError,
};

export default errorHandler;
