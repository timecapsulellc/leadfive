/**
 * Mobile Performance Optimizer
 * Optimizes app performance for mobile devices
 */

import React, { useEffect, useState, Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';

// Mobile detection and optimization utilities
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const getDeviceInfo = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return {
    isMobile: isMobileDevice(),
    isIOS: /iphone|ipad|ipod/.test(userAgent),
    isAndroid: /android/.test(userAgent),
    isLowEnd: navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2,
    supportsWebGL: !!window.WebGLRenderingContext,
    supportsTouchEvents: 'ontouchstart' in window,
  };
};

// Fallback component for errors
const ErrorFallback = () => (
  <div className="mobile-error-fallback" style={{
    padding: '2rem',
    textAlign: 'center',
    background: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    borderRadius: '12px',
    margin: '1rem',
    color: 'white'
  }}>
    <h3>⚠️ Something went wrong</h3>
    <p>The app encountered an error on your mobile device.</p>
    <button 
      onClick={() => window.location.reload()}
      style={{
        padding: '0.75rem 1.5rem',
        background: '#00d4ff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600'
      }}
    >
      Reload Page
    </button>
  </div>
);

// Loading component optimized for mobile
const MobileLoader = ({ message = "Loading..." }) => (
  <div className="mobile-loader" style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    textAlign: 'center',
    minHeight: '200px'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid rgba(255, 255, 255, 0.3)',
      borderTop: '3px solid #00d4ff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '1rem'
    }}></div>
    <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>{message}</p>
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Performance monitoring hook
const usePerformanceMonitor = () => {
  const [performanceData, setPerformanceData] = useState({
    isLowMemory: false,
    loadTime: 0,
    connectionType: 'unknown'
  });

  useEffect(() => {
    // Monitor memory usage
    if (navigator.deviceMemory) {
      setPerformanceData(prev => ({
        ...prev,
        isLowMemory: navigator.deviceMemory <= 2
      }));
    }

    // Monitor connection type
    if (navigator.connection) {
      setPerformanceData(prev => ({
        ...prev,
        connectionType: navigator.connection.effectiveType || 'unknown'
      }));
    }

    // Monitor load time
    if (performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setPerformanceData(prev => ({
        ...prev,
        loadTime
      }));
    }

    // Listen for memory pressure
    const handleMemoryWarning = () => {
      setPerformanceData(prev => ({
        ...prev,
        isLowMemory: true
      }));
    };

    window.addEventListener('devicememory', handleMemoryWarning);
    return () => window.removeEventListener('devicememory', handleMemoryWarning);
  }, []);

  return performanceData;
};

// Main mobile optimizer component
const MobileOptimizer = ({ children }) => {
  const [deviceInfo] = useState(getDeviceInfo());
  const [isOptimized, setIsOptimized] = useState(false);
  const performance = usePerformanceMonitor();

  useEffect(() => {
    if (!deviceInfo.isMobile) {
      setIsOptimized(true);
      return;
    }

    // Apply mobile optimizations
    const optimizations = [];

    // 1. Disable heavy animations on low-end devices
    if (deviceInfo.isLowEnd || performance.isLowMemory) {
      document.body.classList.add('reduce-motion');
      optimizations.push('Reduced animations for better performance');
    }

    // 2. Optimize viewport for mobile
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
      optimizations.push('Optimized viewport for mobile');
    }

    // 3. Prevent zoom on input focus (iOS)
    if (deviceInfo.isIOS) {
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        input.style.fontSize = '16px'; // Prevents zoom on iOS
      });
      optimizations.push('Prevented input zoom on iOS');
    }

    // 4. Optimize touch events
    if (deviceInfo.supportsTouchEvents) {
      document.addEventListener('touchstart', () => {}, { passive: true });
      document.addEventListener('touchmove', () => {}, { passive: true });
      optimizations.push('Optimized touch event handling');
    }

    // 5. Optimize for slow connections
    if (performance.connectionType === 'slow-2g' || performance.connectionType === '2g') {
      document.body.classList.add('slow-connection');
      optimizations.push('Optimized for slow connection');
    }

    // 6. Memory management
    if (performance.isLowMemory) {
      // Disable heavy features
      document.body.classList.add('low-memory');
      optimizations.push('Enabled low-memory mode');
    }

    // 7. Safe area handling for notched devices
    if (deviceInfo.isIOS) {
      const root = document.documentElement;
      root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
      root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
      root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
      root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
      optimizations.push('Configured safe area insets');
    }

    console.log('Mobile optimizations applied:', optimizations);
    setIsOptimized(true);

    // Cleanup
    return () => {
      document.body.classList.remove('reduce-motion', 'slow-connection', 'low-memory');
    };
  }, [deviceInfo, performance]);

  // Show loading while optimizations are being applied
  if (!isOptimized) {
    return <MobileLoader message="Optimizing for your device..." />;
  }

  // Wrap children with error boundary and suspense
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<MobileLoader />}>
        <div className="mobile-optimized-app">
          {children}
          
          {/* Add mobile-specific CSS */}
          <style jsx global>{`
            /* Mobile optimization styles */
            .reduce-motion * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
            
            .slow-connection img,
            .slow-connection video {
              filter: blur(0.5px);
              transition: filter 0.3s ease;
            }
            
            .slow-connection img:hover,
            .slow-connection video:hover {
              filter: none;
            }
            
            .low-memory .heavy-component {
              display: none;
            }
            
            .low-memory .chart-container {
              height: 200px !important;
            }
            
            /* Touch optimization */
            .mobile-optimized-app button,
            .mobile-optimized-app a,
            .mobile-optimized-app [role="button"] {
              min-height: 48px;
              min-width: 48px;
              touch-action: manipulation;
            }
            
            /* iOS safe area support */
            .mobile-optimized-app {
              padding-top: var(--safe-area-inset-top, 0);
              padding-bottom: var(--safe-area-inset-bottom, 0);
              padding-left: var(--safe-area-inset-left, 0);
              padding-right: var(--safe-area-inset-right, 0);
            }
            
            /* Prevent overscroll bounce on iOS */
            .mobile-optimized-app {
              overscroll-behavior: none;
              -webkit-overflow-scrolling: touch;
            }
            
            /* Optimize text rendering */
            .mobile-optimized-app {
              -webkit-text-size-adjust: 100%;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeSpeed;
            }
            
            /* Mobile input optimization */
            .mobile-optimized-app input,
            .mobile-optimized-app select,
            .mobile-optimized-app textarea {
              font-size: 16px !important; /* Prevents zoom on iOS */
              border-radius: 0; /* Removes iOS default styling */
              -webkit-appearance: none;
            }
            
            /* Fix for mobile keyboard issues */
            .mobile-optimized-app input:focus,
            .mobile-optimized-app textarea:focus {
              transform: translateZ(0); /* Forces hardware acceleration */
            }
            
            /* Mobile loading optimization */
            .mobile-optimized-app .loading-heavy {
              display: none;
            }
            
            .mobile-optimized-app .loading-light {
              display: block;
            }
            
            /* Reduce paint on mobile */
            .mobile-optimized-app .expensive-shadow {
              box-shadow: none !important;
            }
            
            .mobile-optimized-app .expensive-gradient {
              background: #1a1a2e !important;
            }
            
            /* Mobile gesture optimization */
            .mobile-optimized-app {
              -webkit-tap-highlight-color: transparent;
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              user-select: none;
            }
            
            .mobile-optimized-app input,
            .mobile-optimized-app textarea {
              -webkit-user-select: text;
              user-select: text;
            }
          `}</style>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default MobileOptimizer;