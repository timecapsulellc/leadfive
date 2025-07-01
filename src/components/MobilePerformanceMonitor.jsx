import { useEffect, useRef } from 'react';

const MobilePerformanceMonitor = () => {
  const metricsRef = useRef({});

  useEffect(() => {
    // Monitor Core Web Vitals on mobile
    const observePerformance = () => {
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          metricsRef.current.lcp = lastEntry.startTime;
          
          // Log poor LCP performance on mobile
          if (lastEntry.startTime > 2500) {
            console.warn('Poor LCP performance detected:', lastEntry.startTime);
          }
        });
        
        try {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.log('LCP observer not supported');
        }

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            metricsRef.current.fid = entry.processingStart - entry.startTime;
            
            // Log poor FID performance
            if (entry.processingStart - entry.startTime > 100) {
              console.warn('Poor FID performance detected:', entry.processingStart - entry.startTime);
            }
          });
        });
        
        try {
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          console.log('FID observer not supported');
        }

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          metricsRef.current.cls = clsValue;
          
          // Log poor CLS performance
          if (clsValue > 0.1) {
            console.warn('Poor CLS performance detected:', clsValue);
          }
        });
        
        try {
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.log('CLS observer not supported');
        }
      }

      // Memory monitoring for mobile devices
      if ('memory' in performance) {
        const checkMemory = () => {
          const memInfo = performance.memory;
          const memoryUsage = {
            used: Math.round(memInfo.usedJSHeapSize / 1048576), // MB
            total: Math.round(memInfo.totalJSHeapSize / 1048576), // MB
            limit: Math.round(memInfo.jsHeapSizeLimit / 1048576) // MB
          };
          
          metricsRef.current.memory = memoryUsage;
          
          // Warn if memory usage is high on mobile
          const isMobile = window.innerWidth <= 768;
          if (isMobile && memoryUsage.used > 100) { // More than 100MB on mobile
            console.warn('High memory usage on mobile device:', memoryUsage);
          }
        };
        
        checkMemory();
        setInterval(checkMemory, 30000); // Check every 30 seconds
      }

      // Network monitoring
      if ('connection' in navigator) {
        const connection = navigator.connection;
        const networkInfo = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
        
        metricsRef.current.network = networkInfo;
        
        // Optimize for slow connections
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          console.log('Slow network detected, enabling optimizations');
          document.documentElement.classList.add('slow-network');
        }
        
        if (connection.saveData) {
          console.log('Data saver mode detected');
          document.documentElement.classList.add('data-saver');
        }
      }

      // Touch event latency monitoring
      let touchStartTime = 0;
      
      const handleTouchStart = () => {
        touchStartTime = performance.now();
      };
      
      const handleTouchEnd = () => {
        if (touchStartTime) {
          const touchLatency = performance.now() - touchStartTime;
          metricsRef.current.touchLatency = touchLatency;
          
          // Log high touch latency
          if (touchLatency > 50) {
            console.warn('High touch latency detected:', touchLatency);
          }
        }
      };
      
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    };

    const cleanup = observePerformance();

    // Report metrics after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Mobile Performance Metrics:', metricsRef.current);
        }
        
        // Send metrics to analytics if needed
        // Analytics.track('mobile_performance', metricsRef.current);
      }, 5000);
    });

    return cleanup;
  }, []);

  // Add viewport height fix for mobile browsers
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--mobile-vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);

  // Touch event optimization
  useEffect(() => {
    // Prevent zoom on double tap for better UX
    let lastTouchEnd = 0;
    
    const preventZoom = (e) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };
    
    document.addEventListener('touchend', preventZoom, { passive: false });
    
    // Add touch-device class for CSS targeting
    document.documentElement.classList.add('touch-device');
    
    return () => {
      document.removeEventListener('touchend', preventZoom);
    };
  }, []);

  return null; // This is a utility component with no UI
};

export default MobilePerformanceMonitor;
