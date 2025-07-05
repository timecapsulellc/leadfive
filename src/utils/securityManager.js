/* global process */
/**
 * Security Manager
 * Comprehensive security utilities for API protection, validation, and encryption
 */

import CryptoJS from 'crypto-js';

// ============ API KEY SECURITY ============
class APIKeyManager {
  constructor() {
    this.keyRotationInterval = 24 * 60 * 60 * 1000; // 24 hours
    this.encryptionKey = this.generateEncryptionKey();
    this.apiKeys = new Map();
    this.keyHistory = [];
    this.setupKeyRotation();
  }

  // Generate secure encryption key
  generateEncryptionKey() {
    const browserFingerprint = this.getBrowserFingerprint();
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36);
    return CryptoJS.SHA256(browserFingerprint + timestamp + random).toString();
  }

  // Get browser fingerprint for key derivation
  getBrowserFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);

    return btoa(
      JSON.stringify({
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        canvas: canvas.toDataURL(),
      })
    );
  }

  // Encrypt API key
  encryptAPIKey(key) {
    if (!key) return null;
    try {
      return CryptoJS.AES.encrypt(key, this.encryptionKey).toString();
    } catch (error) {
      console.error('API key encryption failed:', error);
      return null;
    }
  }

  // Decrypt API key
  decryptAPIKey(encryptedKey) {
    if (!encryptedKey) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedKey, this.encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('API key decryption failed:', error);
      return null;
    }
  }

  // Store API key securely
  storeAPIKey(service, key) {
    const encryptedKey = this.encryptAPIKey(key);
    if (encryptedKey) {
      this.apiKeys.set(service, {
        encrypted: encryptedKey,
        timestamp: Date.now(),
        usage: 0,
      });
      // Don't store in localStorage for security
      return true;
    }
    return false;
  }

  // Retrieve API key
  getAPIKey(service) {
    const keyData = this.apiKeys.get(service);
    if (!keyData) return null;

    // Update usage tracking
    keyData.usage++;
    keyData.lastUsed = Date.now();

    return this.decryptAPIKey(keyData.encrypted);
  }

  // Setup automatic key rotation
  setupKeyRotation() {
    setInterval(() => {
      this.rotateEncryptionKey();
    }, this.keyRotationInterval);
  }

  // Rotate encryption key
  rotateEncryptionKey() {
    const oldKey = this.encryptionKey;
    this.keyHistory.push({
      key: oldKey,
      rotatedAt: Date.now(),
    });

    // Keep only last 3 keys for decryption fallback
    if (this.keyHistory.length > 3) {
      this.keyHistory.shift();
    }

    this.encryptionKey = this.generateEncryptionKey();

    // Re-encrypt all stored keys with new encryption key
    this.reencryptStoredKeys(oldKey);
  }

  // Re-encrypt stored keys with new encryption key
  reencryptStoredKeys(oldKey) {
    for (const [service, keyData] of this.apiKeys.entries()) {
      try {
        const decrypted = CryptoJS.AES.decrypt(
          keyData.encrypted,
          oldKey
        ).toString(CryptoJS.enc.Utf8);
        keyData.encrypted = this.encryptAPIKey(decrypted);
      } catch (error) {
        console.error(`Failed to re-encrypt key for ${service}:`, error);
      }
    }
  }

  // Clear all API keys
  clearKeys() {
    this.apiKeys.clear();
    this.keyHistory = [];
  }
}

// ============ INPUT VALIDATION ============
class InputValidator {
  constructor() {
    this.patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      walletAddress: /^0x[a-fA-F0-9]{40}$/,
      amount: /^\d+(\.\d{1,18})?$/,
      alphanumeric: /^[a-zA-Z0-9]+$/,
      username: /^[a-zA-Z0-9_]{3,20}$/,
      password:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      hex: /^[a-fA-F0-9]+$/,
      base64: /^[A-Za-z0-9+/]*={0,2}$/,
    };

    this.maxLengths = {
      username: 20,
      email: 254,
      password: 128,
      description: 1000,
      url: 2048,
    };
  }

  // Sanitize input to prevent XSS
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/script/gi, '') // Remove script tags
      .trim();
  }

  // Validate email
  validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email is required' };
    }

    if (email.length > this.maxLengths.email) {
      return { isValid: false, error: 'Email is too long' };
    }

    if (!this.patterns.email.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
  }

  // Validate wallet address
  validateWalletAddress(address) {
    if (!address || typeof address !== 'string') {
      return { isValid: false, error: 'Wallet address is required' };
    }

    if (!this.patterns.walletAddress.test(address)) {
      return { isValid: false, error: 'Invalid wallet address format' };
    }

    return { isValid: true };
  }

  // Validate amount
  validateAmount(amount, min = 0, max = Infinity) {
    if (amount === null || amount === undefined || amount === '') {
      return { isValid: false, error: 'Amount is required' };
    }

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount)) {
      return { isValid: false, error: 'Amount must be a valid number' };
    }

    if (numAmount < min) {
      return { isValid: false, error: `Amount must be at least ${min}` };
    }

    if (numAmount > max) {
      return { isValid: false, error: `Amount cannot exceed ${max}` };
    }

    if (!this.patterns.amount.test(amount.toString())) {
      return { isValid: false, error: 'Invalid amount format' };
    }

    return { isValid: true, value: numAmount };
  }

  // Validate password strength
  validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return { isValid: false, error: 'Password is required' };
    }

    if (password.length < 8) {
      return {
        isValid: false,
        error: 'Password must be at least 8 characters',
      };
    }

    if (password.length > this.maxLengths.password) {
      return { isValid: false, error: 'Password is too long' };
    }

    if (!this.patterns.password.test(password)) {
      return {
        isValid: false,
        error:
          'Password must contain uppercase, lowercase, number, and special character',
      };
    }

    return { isValid: true };
  }

  // Validate URL
  validateURL(url) {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'URL is required' };
    }

    if (url.length > this.maxLengths.url) {
      return { isValid: false, error: 'URL is too long' };
    }

    if (!this.patterns.url.test(url)) {
      return { isValid: false, error: 'Invalid URL format' };
    }

    return { isValid: true };
  }

  // Generic validation
  validate(value, rules) {
    const errors = [];

    // Required check
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push('This field is required');
    }

    if (!value) return { isValid: errors.length === 0, errors };

    // Type check
    if (rules.type && typeof value !== rules.type) {
      errors.push(`Value must be of type ${rules.type}`);
    }

    // Length checks
    if (rules.minLength && value.toString().length < rules.minLength) {
      errors.push(`Minimum length is ${rules.minLength}`);
    }

    if (rules.maxLength && value.toString().length > rules.maxLength) {
      errors.push(`Maximum length is ${rules.maxLength}`);
    }

    // Pattern check
    if (rules.pattern && !rules.pattern.test(value.toString())) {
      errors.push(rules.patternError || 'Invalid format');
    }

    // Custom validation
    if (rules.custom && typeof rules.custom === 'function') {
      const customResult = rules.custom(value);
      if (customResult !== true) {
        errors.push(customResult);
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  // Batch validation
  validateForm(formData, rules) {
    const results = {};
    let isFormValid = true;

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = formData[field];
      const result = this.validate(value, fieldRules);
      results[field] = result;

      if (!result.isValid) {
        isFormValid = false;
      }
    }

    return { isValid: isFormValid, fields: results };
  }
}

// ============ CSRF PROTECTION ============
class CSRFProtection {
  constructor() {
    this.token = this.generateToken();
    this.tokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes
    this.setupTokenRotation();
  }

  // Generate CSRF token
  generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(
      ''
    );
  }

  // Get current CSRF token
  getToken() {
    if (Date.now() > this.tokenExpiry) {
      this.rotateToken();
    }
    return this.token;
  }

  // Validate CSRF token
  validateToken(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }

    if (Date.now() > this.tokenExpiry) {
      return false;
    }

    return token === this.token;
  }

  // Rotate CSRF token
  rotateToken() {
    this.token = this.generateToken();
    this.tokenExpiry = Date.now() + 30 * 60 * 1000;

    // Update meta tag if exists
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      metaTag.setAttribute('content', this.token);
    }
  }

  // Setup automatic token rotation
  setupTokenRotation() {
    setInterval(
      () => {
        this.rotateToken();
      },
      25 * 60 * 1000
    ); // Rotate every 25 minutes
  }

  // Add CSRF token to request headers
  addTokenToHeaders(headers = {}) {
    return {
      ...headers,
      'X-CSRF-Token': this.getToken(),
    };
  }
}

// ============ RATE LIMITING ============
class RateLimiter {
  constructor(options = {}) {
    this.windowSize = options.windowSize || 60000; // 1 minute
    this.maxRequests = options.maxRequests || 100;
    this.requests = new Map();
    this.blockedIPs = new Set();
    this.setupCleanup();
  }

  // Check if request is allowed
  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowSize;

    // Check if identifier is blocked
    if (this.blockedIPs.has(identifier)) {
      return { allowed: false, reason: 'IP blocked' };
    }

    // Get or create request history for identifier
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const requestHistory = this.requests.get(identifier);

    // Remove old requests outside the window
    const validRequests = requestHistory.filter(
      timestamp => timestamp > windowStart
    );
    this.requests.set(identifier, validRequests);

    // Check if under limit
    if (validRequests.length >= this.maxRequests) {
      // Block IP if consistently hitting limits
      this.handleRateLimit(identifier, validRequests);
      return {
        allowed: false,
        reason: 'Rate limit exceeded',
        retryAfter: Math.ceil(
          (validRequests[0] + this.windowSize - now) / 1000
        ),
      };
    }

    // Add current request
    validRequests.push(now);

    return {
      allowed: true,
      remaining: this.maxRequests - validRequests.length,
      resetTime: windowStart + this.windowSize,
    };
  }

  // Handle rate limiting violations
  handleRateLimit(identifier, requestHistory) {
    const recentViolations = requestHistory.filter(
      timestamp => timestamp > Date.now() - 5 * 60 * 1000 // Last 5 minutes
    );

    // Block if too many violations
    if (recentViolations.length >= this.maxRequests * 0.8) {
      this.blockIP(identifier, 15 * 60 * 1000); // Block for 15 minutes
    }
  }

  // Block IP address
  blockIP(identifier, duration = 60000) {
    this.blockedIPs.add(identifier);
    setTimeout(() => {
      this.blockedIPs.delete(identifier);
    }, duration);
  }

  // Setup periodic cleanup
  setupCleanup() {
    setInterval(() => {
      this.cleanup();
    }, this.windowSize);
  }

  // Clean up old request data
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowSize;

    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(
        timestamp => timestamp > windowStart
      );
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }

  // Get statistics
  getStats() {
    return {
      activeIdentifiers: this.requests.size,
      blockedIPs: this.blockedIPs.size,
      windowSize: this.windowSize,
      maxRequests: this.maxRequests,
    };
  }
}

// ============ SECURITY HEADERS ============
class SecurityHeaders {
  constructor() {
    this.cspNonce = this.generateNonce();
    this.headers = this.getDefaultHeaders();
  }

  // Generate nonce for CSP
  generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  // Get default security headers
  getDefaultHeaders() {
    return {
      'Content-Security-Policy': this.buildCSP(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Strict-Transport-Security':
        'max-age=31536000; includeSubDomains; preload',
    };
  }

  // Build Content Security Policy
  buildCSP() {
    const policies = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${this.cspNonce}' 'unsafe-eval'`, // unsafe-eval needed for React dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.coingecko.com https://api.coinmarketcap.com wss:",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];

    if (process.env.NODE_ENV === 'development') {
      // Allow webpack dev server in development
      policies[1] = `script-src 'self' 'nonce-${this.cspNonce}' 'unsafe-eval' 'unsafe-inline'`;
      policies.push(
        "connect-src 'self' ws://localhost:* http://localhost:* https://api.coingecko.com https://api.coinmarketcap.com wss:"
      );
    }

    return policies.join('; ');
  }

  // Apply headers to request
  applyHeaders(requestInit = {}) {
    return {
      ...requestInit,
      headers: {
        ...this.headers,
        ...requestInit.headers,
      },
    };
  }

  // Get CSP nonce for inline scripts
  getNonce() {
    return this.cspNonce;
  }

  // Update CSP nonce
  rotateNonce() {
    this.cspNonce = this.generateNonce();
    this.headers['Content-Security-Policy'] = this.buildCSP();
  }
}

// ============ EXPORTS ============
export const apiKeyManager = new APIKeyManager();
export const inputValidator = new InputValidator();
export const csrfProtection = new CSRFProtection();
export const rateLimiter = new RateLimiter();
export const securityHeaders = new SecurityHeaders();

// Utility functions
export const sanitizeAndValidate = (input, rules) => {
  const sanitized = inputValidator.sanitizeInput(input);
  const validation = inputValidator.validate(sanitized, rules);
  return { sanitized, validation };
};

export const secureAPICall = async (url, options = {}) => {
  // Check rate limiting
  const rateLimitResult = rateLimiter.isAllowed(url);
  if (!rateLimitResult.allowed) {
    throw new Error(`Rate limit exceeded: ${rateLimitResult.reason}`);
  }

  // Add CSRF token and security headers
  const secureOptions = securityHeaders.applyHeaders({
    ...options,
    headers: csrfProtection.addTokenToHeaders(options.headers),
  });

  return fetch(url, secureOptions);
};

export default {
  apiKeyManager,
  inputValidator,
  csrfProtection,
  rateLimiter,
  securityHeaders,
  sanitizeAndValidate,
  secureAPICall,
};
