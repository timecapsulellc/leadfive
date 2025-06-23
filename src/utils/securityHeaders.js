/**
 * Mobile Security Headers Utility
 * 
 * Implements comprehensive security headers for mobile browsers and PWA security.
 * Provides protection against XSS, CSRF, clickjacking, and other mobile-specific attacks.
 * 
 * Security Features:
 * - Content Security Policy (CSP) for XSS protection
 * - X-Frame-Options for clickjacking protection
 * - HTTPS enforcement and security transport
 * - Mobile browser specific security headers
 * - PWA security configurations
 */

/**
 * Content Security Policy configuration
 * Tailored for Web3 DApp with mobile considerations
 */
const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-eval'", // Required for ethers.js and Web3 libraries
    "'unsafe-inline'", // Required for React inline styles (consider removing in production)
    'https://cdn.jsdelivr.net', // For CDN resources
    'https://unpkg.com', // For package CDN
    'blob:', // For Web3 blob URLs
  ],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net', 'https://use.fontawesome.com', 'https://maxcdn.bootstrapcdn.com', 'https://unpkg.com'], // style-src directive includes cdn.jsdelivr.net
  'img-src': [
    "'self'",
    'data:', // For base64 images
    'blob:', // For generated images
    'https:', // For external images (HTTPS only)
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:' // For base64 fonts
  ],
  'connect-src': [
    "'self'",
    'https:', // HTTPS connections only
    'wss:', // WebSocket Secure only
    'https://*.bsc.org', // BSC RPC endpoints
    'https://*.binance.org', // Binance API endpoints
    'https://api.coingecko.com', // Price data
    'https://*.infura.io', // Infura endpoints
    'https://*.alchemy.com', // Alchemy endpoints
    'https://api.elevenlabs.io', // ElevenLabs API
    'https://api.openai.com', // OpenAI API
    'blob:', // For Web3 blob connections
  ],
  'media-src': [
    "'self'",
    'blob:', // For audio blobs from ElevenLabs and speech synthesis
    'data:', // For base64 audio
    'https:', // For external audio (HTTPS only)
  ],
  'frame-ancestors': ["'none'"], // Prevent embedding in frames
  'form-action': ["'self'"], // Restrict form submissions
  'base-uri': ["'self'"], // Restrict base tag URLs
  'object-src': ["'none'"], // Block object/embed/applet
  'worker-src': ["'self'", 'blob:'], // Service worker restrictions
  'manifest-src': ["'self'"], // PWA manifest restrictions
};

/**
 * Generate Content Security Policy header value
 */
export const generateCSPHeader = () => {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

/**
 * Security headers configuration for mobile browsers
 */
export const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': generateCSPHeader(),
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  'frame-ancestors': 'none',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // XSS Protection (legacy but still useful)
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer Policy for privacy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // HTTPS enforcement
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Permissions Policy (Feature Policy)
  'Permissions-Policy': [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=(self)',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'encrypted-media=()',
    'fullscreen=(self)',
    'picture-in-picture=()'
  ].join(', '),
  
  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  
  // Cache control for security-sensitive pages
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
  'Expires': '0',
};

/**
 * Mobile-specific security headers
 */
export const MOBILE_SECURITY_HEADERS = {
  // Prevent mobile browser address bar spoofing
  'X-Permitted-Cross-Domain-Policies': 'none',
  
  // Mobile viewport security
  'X-UA-Compatible': 'IE=edge',
  
  // Prevent auto-detection of phone numbers, emails, etc.
  'format-detection': 'telephone=no, email=no, address=no',
  
  // Mobile app integration security
  'apple-mobile-web-app-capable': 'yes',
  'apple-mobile-web-app-status-bar-style': 'black-translucent',
  'mobile-web-app-capable': 'yes',
  
  // Prevent mobile browser caching of sensitive data
  'Vary': 'User-Agent, Accept-Encoding',
};

/**
 * Apply security headers to document
 * For client-side header simulation (actual headers should be set server-side)
 */
export const applyClientSideSecurityMeta = () => {
  try {
    // Add CSP meta tag if not already present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const cspMeta = document.createElement('meta');
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
      cspMeta.setAttribute('content', generateCSPHeader());
      document.head.appendChild(cspMeta);
    }

    // Add X-Frame-Options equivalent
    if (!document.querySelector('meta[http-equiv="X-Frame-Options"]')) {
      const frameMeta = document.createElement('meta');
      frameMeta.setAttribute('http-equiv', 'X-Frame-Options');
      frameMeta.setAttribute('content', 'DENY');
      document.head.appendChild(frameMeta);
    }

    // Add referrer policy
    if (!document.querySelector('meta[name="referrer"]')) {
      const referrerMeta = document.createElement('meta');
      referrerMeta.setAttribute('name', 'referrer');
      referrerMeta.setAttribute('content', 'strict-origin-when-cross-origin');
      document.head.appendChild(referrerMeta);
    }

    // Mobile-specific meta tags
    const mobileMetaTags = [
      { name: 'format-detection', content: 'telephone=no, email=no, address=no' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'mobile-web-app-capable', content: 'yes' },
    ];

    mobileMetaTags.forEach(({ name, content }) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    });

    return true;
  } catch (error) {
    console.error('Error applying client-side security meta tags:', error);
    return false;
  }
};

/**
 * Validate current page security headers
 * For development and monitoring purposes
 */
export const validateSecurityHeaders = async () => {
  try {
    const response = await fetch(window.location.href, { method: 'HEAD' });
    const headers = {};
    
    for (const [key, value] of response.headers.entries()) {
      headers[key] = value;
    }

    const securityScore = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: [],
      recommendations: []
    };

    const criticalHeaders = [
      'content-security-policy',
      'x-frame-options',
      'x-content-type-options',
      'strict-transport-security'
    ];

    criticalHeaders.forEach(header => {
      securityScore.total++;
      if (headers[header]) {
        securityScore.passed++;
      } else {
        securityScore.failed++;
        securityScore.warnings.push(`Missing critical header: ${header}`);
      }
    });

    // Check HTTPS enforcement
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      securityScore.warnings.push('Page not served over HTTPS');
      securityScore.recommendations.push('Enforce HTTPS for production deployment');
    }

    // Check for mixed content
    const mixedContentElements = document.querySelectorAll('img[src^="http:"], script[src^="http:"], link[href^="http:"]');
    if (mixedContentElements.length > 0) {
      securityScore.warnings.push(`${mixedContentElements.length} mixed content resources found`);
      securityScore.recommendations.push('Update all resources to use HTTPS');
    }

    const score = Math.round((securityScore.passed / securityScore.total) * 100);
    
    return {
      score,
      grade: score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'F',
      details: securityScore,
      headers
    };
  } catch (error) {
    console.error('Error validating security headers:', error);
    return null;
  }
};

/**
 * Initialize mobile security on app load
 */
export const initializeMobileSecurity = () => {
  try {
    // Apply client-side security meta tags
    applyClientSideSecurityMeta();

    // Disable right-click context menu on mobile (optional security measure)
    if (window.innerWidth <= 768) {
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
    }

    // Prevent text selection on sensitive elements (optional)
    const sensitiveSelectors = [
      '.private-key',
      '.seed-phrase',
      '.wallet-address',
      '.balance-amount'
    ];

    sensitiveSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.style.userSelect = 'none';
        element.style.webkitUserSelect = 'none';
        element.style.mozUserSelect = 'none';
        element.style.msUserSelect = 'none';
      });
    });

    // Add security event listeners
    window.addEventListener('beforeunload', () => {
      // Clear sensitive data from memory before page unload
      if (window.ethereum && window.ethereum.selectedAddress) {
        // Clear any cached sensitive data
        sessionStorage.clear();
      }
    });

    console.log('Mobile security measures initialized');
    return true;
  } catch (error) {
    console.error('Error initializing mobile security:', error);
    return false;
  }
};

/**
 * Security monitoring and reporting
 */
export const reportSecurityEvent = (eventType, details) => {
  try {
    const securityEvent = {
      type: eventType,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      details: details || {}
    };

    // Log to console for development
    console.warn('Security Event:', securityEvent);

    // In production, send to security monitoring service
    // Example: await fetch('/api/security/events', { method: 'POST', body: JSON.stringify(securityEvent) });

    return true;
  } catch (error) {
    console.error('Error reporting security event:', error);
    return false;
  }
};
