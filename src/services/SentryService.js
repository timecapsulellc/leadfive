/**
 * Sentry Error Tracking and Performance Monitoring Service
 * Production-grade error tracking with context-aware reporting
 *
 * Features:
 * - Automatic error capture and reporting
 * - Performance monitoring
 * - User context tracking
 * - Custom tags and metadata
 * - Sensitive data filtering
 * - Environment-based configuration
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

class SentryService {
  constructor() {
    this.isInitialized = false;
    this.environment = import.meta.env.VITE_APP_ENV || 'development';
    this.dsn = import.meta.env.VITE_SENTRY_DSN;
    this.debug = import.meta.env.VITE_DEBUG_MODE === 'true';
  }

  /**
   * Initialize Sentry with production configuration
   */
  init() {
    // Only initialize in production or if DSN is provided
    if (this.environment === 'development' && !this.dsn) {
      console.log(
        '🚫 Sentry: Skipped initialization in development (no DSN provided)'
      );
      return false;
    }

    if (!this.dsn) {
      console.warn('⚠️ Sentry: No DSN provided, error tracking disabled');
      return false;
    }

    try {
      Sentry.init({
        dsn: this.dsn,
        environment: this.environment,
        debug: this.debug,

        // Performance monitoring
        integrations: [
          new BrowserTracing({
            // Set up automatic route change tracking for React Router
            routingInstrumentation: Sentry.reactRouterV6Instrumentation(
              React.useEffect,
              window.location,
              window.history
            ),
          }),
        ],

        // Performance monitoring sample rate
        tracesSampleRate: this.environment === 'production' ? 0.1 : 1.0,

        // Error sampling (capture all errors in production)
        sampleRate: 1.0,

        // Release tracking
        release: `leadfive@${import.meta.env.VITE_APP_VERSION || 'unknown'}`,

        // Filter out sensitive data
        beforeSend: (event, hint) => {
          return this.filterSensitiveData(event, hint);
        },

        // Set default tags
        initialScope: {
          tags: {
            component: 'frontend',
            project: 'leadfive',
            blockchain: 'bsc',
          },
        },

        // Ignore common non-critical errors
        ignoreErrors: [
          // Network errors that aren't actionable
          'Network Error',
          'NetworkError',
          'fetch',

          // Browser extension errors
          'top.GLOBALS',
          'originalCreateNotification',
          'canvas.contentDocument',
          'MyApp_RemoveAllHighlights',
          'http://tt.epicplay.com',
          "Can't find variable: ZiteReader",
          'jigsaw is not defined',
          'ComboSearch is not defined',
          'atomicFindClose',
          'fb_xd_fragment',
          'bmi_SafeAddOnload',
          'EBCallBackMessageReceived',
          'conduitPage',

          // MetaMask/wallet errors that are user-initiated
          'User rejected the request',
          'User denied transaction signature',
          'User cancelled',

          // Common Web3 errors that aren't bugs
          'execution reverted',
          'insufficient funds',
        ],

        // Allowed URLs (only capture errors from our domain)
        allowUrls: [
          /https?:\/\/(.+\.)?leadfive\.(com|today)/,
          /https?:\/\/localhost/,
          /https?:\/\/127\.0\.0\.1/,
        ],
      });

      // Set user context for better error tracking
      this.setInitialContext();

      this.isInitialized = true;
      console.log('✅ Sentry: Initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Sentry: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Filter sensitive data from error reports
   */
  filterSensitiveData(event, hint) {
    // Remove sensitive data from error context
    if (event.user) {
      // Keep only non-sensitive user data
      event.user = {
        id: event.user.id,
        // Remove wallet addresses, private keys, etc.
        username: event.user.username,
      };
    }

    // Filter sensitive data from request/response
    if (event.request && event.request.data) {
      event.request.data = this.sanitizeData(event.request.data);
    }

    // Filter breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.data) {
          breadcrumb.data = this.sanitizeData(breadcrumb.data);
        }
        return breadcrumb;
      });
    }

    // Filter extra context
    if (event.extra) {
      event.extra = this.sanitizeData(event.extra);
    }

    return event;
  }

  /**
   * Sanitize data by removing sensitive fields
   */
  sanitizeData(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveKeys = [
      'password',
      'token',
      'key',
      'secret',
      'private',
      'mnemonic',
      'privateKey',
      'apiKey',
      'accessToken',
      'refreshToken',
      'sessionToken',
      'wallet',
      'seed',
      'phrase',
      'signature',
      'auth',
      'authorization',
    ];

    const sanitized = { ...data };

    Object.keys(sanitized).forEach(key => {
      const lowerKey = key.toLowerCase();

      // Remove sensitive keys
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[FILTERED]';
      }

      // Recursively sanitize nested objects
      else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }

      // Filter out potential wallet addresses (42 char hex strings starting with 0x)
      else if (
        typeof sanitized[key] === 'string' &&
        /^0x[a-fA-F0-9]{40}$/.test(sanitized[key])
      ) {
        sanitized[key] =
          `${sanitized[key].slice(0, 6)}...${sanitized[key].slice(-4)}`;
      }
    });

    return sanitized;
  }

  /**
   * Set initial context for error tracking
   */
  setInitialContext() {
    Sentry.setContext('app', {
      name: 'LeadFive DApp',
      version: import.meta.env.VITE_APP_VERSION || 'unknown',
      environment: this.environment,
      blockchain: 'BSC Mainnet',
      build_time: new Date().toISOString(),
    });

    Sentry.setContext('browser', {
      name: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
    });
  }

  /**
   * Set user context for error tracking
   */
  setUser(userInfo) {
    if (!this.isInitialized) return;

    Sentry.setUser({
      id: userInfo.wallet
        ? `${userInfo.wallet.slice(0, 8)}...${userInfo.wallet.slice(-4)}`
        : 'anonymous',
      email: userInfo.email,
      username: userInfo.username,
      wallet_type: userInfo.walletType || 'unknown',
      package_type: userInfo.packageType,
      registration_date: userInfo.registrationDate,
    });
  }

  /**
   * Add custom tags for better error categorization
   */
  setTags(tags) {
    if (!this.isInitialized) return;

    Object.entries(tags).forEach(([key, value]) => {
      Sentry.setTag(key, value);
    });
  }

  /**
   * Add breadcrumb for user actions
   */
  addBreadcrumb(message, category = 'user', level = 'info', data = {}) {
    if (!this.isInitialized) return;

    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data: this.sanitizeData(data),
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Capture custom error with context
   */
  captureError(error, context = {}) {
    if (!this.isInitialized) {
      console.error('Sentry not initialized, logging error:', error);
      return;
    }

    Sentry.withScope(scope => {
      // Add custom context
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, this.sanitizeData(value));
      });

      // Capture the error
      Sentry.captureException(error);
    });
  }

  /**
   * Capture custom message
   */
  captureMessage(message, level = 'info', context = {}) {
    if (!this.isInitialized) {
      console.log('Sentry not initialized, logging message:', message);
      return;
    }

    Sentry.withScope(scope => {
      scope.setLevel(level);

      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, this.sanitizeData(value));
      });

      Sentry.captureMessage(message);
    });
  }

  /**
   * Start performance transaction
   */
  startTransaction(name, op = 'navigation') {
    if (!this.isInitialized) return null;

    return Sentry.startTransaction({
      name,
      op,
      tags: {
        component: 'frontend',
      },
    });
  }

  /**
   * Capture Web3/blockchain specific errors
   */
  captureWeb3Error(error, action, contractAddress = null, userAddress = null) {
    if (!this.isInitialized) return;

    this.captureError(error, {
      web3: {
        action,
        contract_address: contractAddress,
        user_address: userAddress
          ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
          : null,
        network: 'BSC Mainnet',
        error_type: error.name || 'UnknownWeb3Error',
      },
    });
  }

  /**
   * Get Sentry status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      environment: this.environment,
      dsn_configured: !!this.dsn,
      debug: this.debug,
    };
  }
}

// Export singleton instance
export default new SentryService();
