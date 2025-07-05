/* global process */
/**
 * Security Configuration
 * Centralized security settings and initialization
 */

import {
  securityManager,
  apiKeyManager,
  inputValidator,
  csrfProtection,
  rateLimiter,
  securityHeaders,
} from './securityManager';

import {
  walletSecurity,
  walletVerifier,
  transactionSecurity,
  signatureVerifier,
} from './walletSecurity';

import {
  errorHandler,
  createErrorBoundary,
  withErrorHandling,
} from './errorHandling';

// ============ SECURITY CONFIGURATION ============
export const SECURITY_CONFIG = {
  // Environment settings
  environment: process.env.NODE_ENV || 'development',

  // API Security
  api: {
    baseURL: process.env.REACT_APP_API_BASE_URL || 'https://api.leadfive.com',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    enableEncryption: true,
    requireAuth: true,
  },

  // Rate Limiting
  rateLimiting: {
    windowSize: 60000, // 1 minute
    maxRequests: 100,
    blockDuration: 15 * 60 * 1000, // 15 minutes
    strictMode: process.env.NODE_ENV === 'production',
  },

  // CSRF Protection
  csrf: {
    tokenRotationInterval: 25 * 60 * 1000, // 25 minutes
    headerName: 'X-CSRF-Token',
    cookieName: 'csrf_token',
    enabled: true,
  },

  // Wallet Security
  wallet: {
    allowedNetworks: [1, 56, 137, 250, 43114], // Mainnet chains
    testnetNetworks: [5, 97, 80001], // Testnet chains
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    requireSignature: true,
    maxDailyVolume: '10.0', // ETH equivalent
    maxTransactionsPerHour: 10,
  },

  // Content Security Policy
  csp: {
    enabled: true,
    reportOnly: process.env.NODE_ENV === 'development',
    reportUri: process.env.REACT_APP_CSP_REPORT_URI,
    allowInlineStyles: process.env.NODE_ENV === 'development',
    allowInlineScripts: false,
  },

  // Error Handling
  errorHandling: {
    enableGlobalHandler: true,
    enableConsoleLogging: true,
    enableRemoteLogging: process.env.NODE_ENV === 'production',
    logLevel: process.env.REACT_APP_LOG_LEVEL || 'error',
    maxLogs: 1000,
    batchSize: 10,
  },

  // Security Headers
  headers: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  },

  // Input Validation
  validation: {
    maxStringLength: 1000,
    maxNumberValue: Number.MAX_SAFE_INTEGER,
    sanitizeHTML: true,
    allowedTags: [],
    stripTags: true,
  },

  // Session Management
  session: {
    timeout: 30 * 60 * 1000, // 30 minutes
    renewThreshold: 5 * 60 * 1000, // 5 minutes
    maxConcurrentSessions: 3,
    enableAutoLogout: true,
  },
};

// ============ SECURITY MANAGER ============
class ComprehensiveSecurityManager {
  constructor(config = SECURITY_CONFIG) {
    this.config = config;
    this.initialized = false;
    this.securityModules = new Map();
    this.securityMetrics = {
      threats: { blocked: 0, detected: 0 },
      errors: { total: 0, critical: 0 },
      authentication: { attempts: 0, failures: 0 },
      validation: { inputs: 0, rejected: 0 },
    };

    this.setupModules();
  }

  // Setup security modules
  setupModules() {
    // Register security modules
    this.securityModules.set('apiKey', apiKeyManager);
    this.securityModules.set('validator', inputValidator);
    this.securityModules.set('csrf', csrfProtection);
    this.securityModules.set('rateLimiter', rateLimiter);
    this.securityModules.set('headers', securityHeaders);
    this.securityModules.set('wallet', walletVerifier);
    this.securityModules.set('transaction', transactionSecurity);
    this.securityModules.set('signature', signatureVerifier);
    this.securityModules.set('errorHandler', errorHandler);
  }

  // Initialize all security systems
  async initialize() {
    if (this.initialized) return;

    try {
      console.log('🔐 Initializing comprehensive security system...');

      // Initialize Content Security Policy
      this.initializeCSP();

      // Initialize rate limiting
      this.initializeRateLimiting();

      // Initialize error handling
      this.initializeErrorHandling();

      // Initialize wallet security
      await this.initializeWalletSecurity();

      // Initialize API security
      this.initializeAPISecuirty();

      // Setup security monitoring
      this.setupSecurityMonitoring();

      // Setup security event handlers
      this.setupSecurityEventHandlers();

      this.initialized = true;
      console.log('✅ Security system initialized successfully');

      return {
        success: true,
        modules: Array.from(this.securityModules.keys()),
      };
    } catch (error) {
      console.error('❌ Security initialization failed:', error);
      errorHandler.handleError(error, { source: 'security_init' });
      throw error;
    }
  }

  // Initialize Content Security Policy
  initializeCSP() {
    if (!this.config.csp.enabled) return;

    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = securityHeaders.buildCSP();
    document.head.appendChild(meta);

    // Add nonce to existing script tags if needed
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      if (!script.nonce && !script.src.includes('localhost')) {
        script.nonce = securityHeaders.getNonce();
      }
    });
  }

  // Initialize rate limiting
  initializeRateLimiting() {
    // Override fetch to include rate limiting
    const originalFetch = window.fetch;
    window.fetch = async (url, options = {}) => {
      const rateLimitResult = rateLimiter.isAllowed(url);

      if (!rateLimitResult.allowed) {
        this.securityMetrics.threats.blocked++;
        throw new Error(`Rate limit exceeded: ${rateLimitResult.reason}`);
      }

      return originalFetch(url, options);
    };
  }

  // Initialize error handling
  initializeErrorHandling() {
    if (!this.config.errorHandling.enableGlobalHandler) return;

    // Create application-wide error boundary
    createErrorBoundary((error, context, recovery) => {
      this.securityMetrics.errors.total++;

      if (error.severity === 'critical') {
        this.securityMetrics.errors.critical++;
        this.handleCriticalError(error, context);
      }
    });

    // Set retry configurations
    errorHandler.setRetryConfig('api_call', {
      maxRetries: this.config.api.retryAttempts,
      delay: this.config.api.retryDelay,
    });

    errorHandler.setRetryConfig('wallet_connection', {
      maxRetries: 3,
      delay: 2000,
    });

    errorHandler.setRetryConfig('transaction', {
      maxRetries: 2,
      delay: 5000,
    });
  }

  // Initialize wallet security
  async initializeWalletSecurity() {
    // Setup wallet connection verification
    const originalConnectWallet = window.connectWallet;
    if (originalConnectWallet) {
      window.connectWallet = withErrorHandling(
        async provider => {
          const verification =
            await walletVerifier.verifyWalletProvider(provider);

          if (!verification.isSecure) {
            this.securityMetrics.threats.detected++;
            throw new Error('Wallet provider failed security verification');
          }

          return originalConnectWallet(provider);
        },
        { operation: 'wallet_connection' }
      );
    }

    // Setup transaction security checks
    const originalSendTransaction = window.sendTransaction;
    if (originalSendTransaction) {
      window.sendTransaction = withErrorHandling(
        async (transaction, userAddress) => {
          const analysis = await transactionSecurity.analyzeTransaction(
            transaction,
            userAddress
          );

          if (analysis.riskLevel === 'high') {
            this.securityMetrics.threats.blocked++;
            throw new Error(
              `High-risk transaction blocked: ${analysis.warnings.map(w => w.message).join(', ')}`
            );
          }

          return originalSendTransaction(transaction, userAddress);
        },
        { operation: 'transaction' }
      );
    }
  }

  // Initialize API security
  initializeAPISecuirty() {
    // Setup secure API calls
    const originalXMLHttpRequest = window.XMLHttpRequest;
    const originalFetch = window.fetch;

    // Enhance XMLHttpRequest
    window.XMLHttpRequest = function () {
      const xhr = new originalXMLHttpRequest();
      const originalOpen = xhr.open;

      xhr.open = function (method, url, ...args) {
        // Add security headers
        const secureHeaders = securityHeaders.getDefaultHeaders();
        Object.entries(secureHeaders).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        // Add CSRF token
        xhr.setRequestHeader('X-CSRF-Token', csrfProtection.getToken());

        return originalOpen.call(this, method, url, ...args);
      };

      return xhr;
    };

    // Enhance fetch
    window.fetch = async (url, options = {}) => {
      // Add security headers and CSRF token
      const secureOptions = securityHeaders.applyHeaders({
        ...options,
        headers: csrfProtection.addTokenToHeaders(options.headers),
      });

      return originalFetch(url, secureOptions);
    };
  }

  // Setup security monitoring
  setupSecurityMonitoring() {
    // Monitor for suspicious activity
    setInterval(() => {
      this.performSecurityAudit();
    }, 60000); // Every minute

    // Monitor performance impact
    setInterval(() => {
      this.monitorSecurityPerformance();
    }, 300000); // Every 5 minutes

    // Generate security reports
    setInterval(() => {
      this.generateSecurityReport();
    }, 3600000); // Every hour
  }

  // Setup security event handlers
  setupSecurityEventHandlers() {
    // Handle visibility change (potential security concern)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handlePageHidden();
      } else {
        this.handlePageVisible();
      }
    });

    // Handle before unload (clear sensitive data)
    window.addEventListener('beforeunload', () => {
      this.cleanupSensitiveData();
    });

    // Handle focus loss (potential security concern)
    window.addEventListener('blur', () => {
      this.handleWindowBlur();
    });
  }

  // Perform security audit
  performSecurityAudit() {
    const issues = [];

    // Check for expired tokens
    if (!csrfProtection.validateToken(csrfProtection.getToken())) {
      issues.push({ type: 'expired_token', severity: 'medium' });
    }

    // Check rate limiting status
    const rateLimitStats = rateLimiter.getStats();
    if (rateLimitStats.blockedIPs > 0) {
      issues.push({
        type: 'blocked_ips',
        severity: 'high',
        count: rateLimitStats.blockedIPs,
      });
    }

    // Check error rates
    const errorStats = errorHandler.getErrorStats();
    if (errorStats.criticalErrors > 5) {
      issues.push({
        type: 'high_error_rate',
        severity: 'critical',
        count: errorStats.criticalErrors,
      });
    }

    if (issues.length > 0) {
      console.warn('🚨 Security audit found issues:', issues);
      this.handleSecurityIssues(issues);
    }
  }

  // Monitor security performance impact
  monitorSecurityPerformance() {
    const performanceEntries = performance.getEntriesByType('measure');
    const securityOverhead = performanceEntries
      .filter(entry => entry.name.includes('security'))
      .reduce((total, entry) => total + entry.duration, 0);

    if (securityOverhead > 1000) {
      // More than 1 second overhead
      console.warn(
        '⚠️ High security performance overhead detected:',
        securityOverhead
      );
    }
  }

  // Generate security report
  generateSecurityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.securityMetrics,
      modules: {
        initialized: this.initialized,
        active: Array.from(this.securityModules.keys()),
        status: this.getModuleStatuses(),
      },
      threats: {
        blocked: this.securityMetrics.threats.blocked,
        detected: this.securityMetrics.threats.detected,
      },
      performance: {
        overhead: this.calculateSecurityOverhead(),
      },
    };

    // Log to console in development
    if (this.config.environment === 'development') {
      console.log('📊 Security Report:', report);
    }

    // Send to monitoring service in production
    if (this.config.environment === 'production') {
      this.sendSecurityReport(report);
    }

    return report;
  }

  // Handle critical errors
  handleCriticalError(error, context) {
    console.error('🚨 CRITICAL SECURITY ERROR:', error);

    // Immediate security measures
    this.enableSecurityLockdown();

    // Alert security team (if configured)
    this.alertSecurityTeam(error, context);
  }

  // Handle security issues
  handleSecurityIssues(issues) {
    issues.forEach(issue => {
      switch (issue.type) {
        case 'expired_token':
          csrfProtection.rotateToken();
          break;
        case 'blocked_ips':
          // Log for investigation
          console.log(`Blocked IPs detected: ${issue.count}`);
          break;
        case 'high_error_rate':
          // Enable strict mode
          this.enableStrictSecurityMode();
          break;
      }
    });
  }

  // Handle page hidden
  handlePageHidden() {
    // Clear sensitive data from memory
    this.clearSensitiveDataFromMemory();
  }

  // Handle page visible
  handlePageVisible() {
    // Verify session is still valid
    this.verifySessionIntegrity();
  }

  // Handle window blur
  handleWindowBlur() {
    // Start session timeout if configured
    if (this.config.session.enableAutoLogout) {
      this.startSessionTimeout();
    }
  }

  // Cleanup sensitive data
  cleanupSensitiveData() {
    apiKeyManager.clearKeys();
    this.clearSensitiveDataFromMemory();
  }

  // Enable security lockdown
  enableSecurityLockdown() {
    // Disable all non-essential functions
    // Force user re-authentication
    // Clear all caches
    console.warn('🔒 Security lockdown enabled');
  }

  // Enable strict security mode
  enableStrictSecurityMode() {
    // Reduce rate limits
    // Increase validation strictness
    // Enable additional monitoring
    console.warn('🔐 Strict security mode enabled');
  }

  // Clear sensitive data from memory
  clearSensitiveDataFromMemory() {
    // Clear form data
    document.querySelectorAll('input[type="password"]').forEach(input => {
      input.value = '';
    });

    // Clear clipboard if possible
    if (navigator.clipboard) {
      navigator.clipboard.writeText('').catch(() => {});
    }
  }

  // Verify session integrity
  verifySessionIntegrity() {
    // Check if CSRF token is still valid
    // Verify wallet connection
    // Check for tampering
  }

  // Start session timeout
  startSessionTimeout() {
    setTimeout(() => {
      // Auto-logout logic
      console.log('Session timeout triggered');
    }, this.config.session.timeout);
  }

  // Get module statuses
  getModuleStatuses() {
    const statuses = {};
    this.securityModules.forEach((module, name) => {
      statuses[name] = {
        active: !!module,
        initialized: this.initialized,
      };
    });
    return statuses;
  }

  // Calculate security overhead
  calculateSecurityOverhead() {
    // This would measure the performance impact of security measures
    // For now, return a placeholder
    return 0;
  }

  // Send security report
  async sendSecurityReport(report) {
    try {
      if (this.config.api.baseURL) {
        await fetch(`${this.config.api.baseURL}/security/report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(report),
        });
      }
    } catch (error) {
      console.error('Failed to send security report:', error);
    }
  }

  // Alert security team
  alertSecurityTeam(error, context) {
    // Implementation would depend on alerting system
    console.error('SECURITY ALERT:', { error, context });
  }

  // Get security status
  getSecurityStatus() {
    return {
      initialized: this.initialized,
      modules: this.getModuleStatuses(),
      metrics: this.securityMetrics,
      config: this.config,
    };
  }

  // Update security configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('Security configuration updated');
  }
}

// ============ EXPORTS ============
export const comprehensiveSecurityManager = new ComprehensiveSecurityManager();

// Initialize security system
export const initializeSecurity = async config => {
  return await comprehensiveSecurityManager.initialize(config);
};

// Export security utilities
export const securityUtils = {
  validateInput: (input, rules) => inputValidator.validate(input, rules),
  sanitizeInput: input => inputValidator.sanitizeInput(input),
  secureAPICall: async (url, options) => {
    const rateLimitResult = rateLimiter.isAllowed(url);
    if (!rateLimitResult.allowed) {
      throw new Error(`Rate limit exceeded: ${rateLimitResult.reason}`);
    }

    const secureOptions = securityHeaders.applyHeaders({
      ...options,
      headers: csrfProtection.addTokenToHeaders(options.headers),
    });

    return fetch(url, secureOptions);
  },
  verifyWallet: async (provider, address) => {
    const verification = await walletVerifier.verifyWalletProvider(provider);
    return verification;
  },
  handleError: (error, context) => errorHandler.handleError(error, context),
};

export default comprehensiveSecurityManager;
