/**
 * Performance Optimization Utilities
 * Bundle splitting, memoization, and caching strategies
 */

import {
  lazy,
  memo,
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from 'react';

// ============ ADVANCED LAZY LOADING ============
class ComponentCache {
  constructor() {
    this.cache = new Map();
    this.preloadQueue = new Set();
    this.loadingPromises = new Map();
  }

  // Enhanced lazy loading with priority and caching
  createLazyComponent(importFunction, options = {}) {
    const {
      priority = 'normal', // 'high', 'normal', 'low'
      preload = false,
      fallback = null,
      timeout = 10000,
    } = options;

    const cacheKey = importFunction.toString();

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const lazyComponent = lazy(async () => {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Component load timeout')), timeout)
      );

      try {
        const componentModule = await Promise.race([
          importFunction(),
          timeoutPromise,
        ]);

        return componentModule;
      } catch (error) {
        // Component load failed - error logged internally

        // Return fallback component on error
        if (fallback) {
          return { default: fallback };
        }
        throw error;
      }
    });

    // Add metadata for debugging
    lazyComponent._importFunction = importFunction;
    lazyComponent._priority = priority;
    lazyComponent._preload = preload;

    this.cache.set(cacheKey, lazyComponent);

    // Auto-preload high priority components
    if (priority === 'high' || preload) {
      this.schedulePreload(importFunction);
    }

    return lazyComponent;
  }

  // Intelligent preloading based on user behavior
  schedulePreload(importFunction, delay = 0) {
    const key = importFunction.toString();

    if (this.preloadQueue.has(key) || this.loadingPromises.has(key)) {
      return;
    }

    this.preloadQueue.add(key);

    // Use requestIdleCallback for non-blocking preloading
    const scheduleLoad = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => this.executePreload(importFunction, key), {
          timeout: 5000,
        });
      } else {
        setTimeout(() => this.executePreload(importFunction, key), delay);
      }
    };

    if (delay > 0) {
      setTimeout(scheduleLoad, delay);
    } else {
      scheduleLoad();
    }
  }

  async executePreload(importFunction, key) {
    try {
      if (this.loadingPromises.has(key)) {
        return this.loadingPromises.get(key);
      }

      const loadPromise = importFunction();
      this.loadingPromises.set(key, loadPromise);

      await loadPromise;
      // Component preloaded successfully - console.log removed for production
    } catch (error) {
      // Component preload failed - warning removed for production
    } finally {
      this.preloadQueue.delete(key);
      this.loadingPromises.delete(key);
    }
  }

  // Preload components based on route patterns
  preloadRouteGroup(routeGroup) {
    const routeGroups = {
      dashboard: [
        () => import('../pages/Dashboard'),
        () => import('../components/enhanced/EnhancedDashboard'),
        () => import('../components/PerformanceMetrics'),
      ],
      trading: [
        () => import('../pages/Packages'),
        () => import('../pages/Withdrawals'),
        () => import('../components/TradingInterface'),
      ],
      social: [
        () => import('../pages/Referrals'),
        () => import('../pages/Genealogy'),
        () => import('../components/GamificationSystem'),
      ],
      auth: [
        () => import('../pages/Register'),
        () => import('../pages/Security'),
        () => import('../components/WalletConnect'),
      ],
    };

    const components = routeGroups[routeGroup];
    if (components) {
      components.forEach(importFn => this.schedulePreload(importFn, 1000));
    }
  }

  // Clear cache when memory pressure is high
  clearCache() {
    this.cache.clear();
    this.preloadQueue.clear();
    this.loadingPromises.clear();
  }
}

export const componentCache = new ComponentCache();

// ============ MEMOIZATION UTILITIES ============
export const createMemoizedComponent = (Component, propsAreEqual) => {
  return memo(Component, propsAreEqual);
};

// Smart memoization for expensive calculations
export const useMemoizedCalculation = (
  calculateFn,
  dependencies,
  options = {}
) => {
  const {
    ttl = 60000, // Cache for 1 minute by default
    maxCacheSize = 10,
  } = options;

  const cacheRef = useRef(new Map());
  const timestampsRef = useRef(new Map());

  return useMemo(() => {
    const key = JSON.stringify(dependencies);
    const now = Date.now();
    const cache = cacheRef.current;
    const timestamps = timestampsRef.current;

    // Check if we have a valid cached result
    if (cache.has(key)) {
      const timestamp = timestamps.get(key);
      if (timestamp && now - timestamp < ttl) {
        return cache.get(key);
      }
    }

    // Clean old entries if cache is too large
    if (cache.size >= maxCacheSize) {
      const oldestKey = [...timestamps.entries()].sort(
        ([, a], [, b]) => a - b
      )[0]?.[0];
      if (oldestKey) {
        cache.delete(oldestKey);
        timestamps.delete(oldestKey);
      }
    }

    // Calculate new result
    const result = calculateFn();
    cache.set(key, result);
    timestamps.set(key, now);

    return result;
  }, dependencies);
};

// Debounced callback for performance
export const useDebouncedCallback = (callback, delay, dependencies = []) => {
  const timeoutRef = useRef();

  return useCallback((...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, dependencies);
};

// Throttled callback for performance
export const useThrottledCallback = (callback, delay, dependencies = []) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, dependencies);
};

// ============ VIRTUAL SCROLLING ============
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);

  const visibleItems = items.slice(startIndex, endIndex).map((item, index) => ({
    ...item,
    index: startIndex + index,
    offsetY: (startIndex + index) * itemHeight,
  }));

  const handleScroll = useCallback(e => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    startIndex,
    endIndex,
  };
};

// Virtual list component
export const VirtualList = memo(
  ({
    items,
    itemHeight,
    containerHeight,
    renderItem,
    className = '',
    overscan = 5,
  }) => {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef();

    const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const endIndex = Math.min(startIndex + visibleCount, items.length);

    const visibleItems = [];
    for (let i = startIndex; i < endIndex; i++) {
      visibleItems.push({
        item: items[i],
        index: i,
        offsetY: i * itemHeight,
      });
    }

    const handleScroll = useThrottledCallback(e => {
      setScrollTop(e.target.scrollTop);
    }, 16); // ~60fps

    return (
      <div
        ref={containerRef}
        className={`virtual-list ${className}`}
        style={{ height: containerHeight, overflow: 'auto' }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map(({ item, index, offsetY }) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: offsetY,
                left: 0,
                right: 0,
                height: itemHeight,
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

// ============ IMAGE OPTIMIZATION ============
export const LazyImage = memo(
  ({
    src,
    alt,
    className = '',
    placeholder = null,
    onLoad = () => {},
    onError = () => {},
    ...props
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef();

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }, []);

    const handleLoad = useCallback(() => {
      setIsLoaded(true);
      onLoad();
    }, [onLoad]);

    const handleError = useCallback(() => {
      setHasError(true);
      onError();
    }, [onError]);

    return (
      <div ref={imgRef} className={`lazy-image ${className}`} {...props}>
        {isInView && !hasError && (
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />
        )}
        {(!isInView || !isLoaded || hasError) && placeholder}
      </div>
    );
  }
);

// ============ BUNDLE ANALYSIS HELPERS ============
export const measurePerformance = (name, fn) => {
  return (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();

    // Performance timing tracked - console.log removed for production

    // Report to analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_measure', {
        custom_parameter_1: name,
        custom_parameter_2: end - start,
      });
    }

    return result;
  };
};

// Resource loading optimization
export const prefetchResource = (url, type = 'fetch') => {
  const link = document.createElement('link');
  link.rel = type === 'script' ? 'preload' : 'prefetch';
  link.href = url;
  if (type === 'script') {
    link.as = 'script';
  }
  document.head.appendChild(link);
};

// Memory usage monitoring
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        setMemoryInfo({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        });
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

// ============ CACHING STRATEGIES ============
class APICache {
  constructor(maxSize = 100, ttl = 300000) {
    // 5 minutes default TTL
    this.cache = new Map();
    this.timestamps = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key) {
    const data = this.cache.get(key);
    const timestamp = this.timestamps.get(key);

    if (data && timestamp) {
      if (Date.now() - timestamp < this.ttl) {
        return data;
      } else {
        this.delete(key);
      }
    }

    return null;
  }

  set(key, value) {
    // Clean up old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = [...this.timestamps.entries()].sort(
        ([, a], [, b]) => a - b
      )[0]?.[0];
      if (oldestKey) {
        this.delete(oldestKey);
      }
    }

    this.cache.set(key, value);
    this.timestamps.set(key, Date.now());
  }

  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now - timestamp >= this.ttl) {
        this.delete(key);
      }
    }
  }
}

export const apiCache = new APICache();

// Cached fetch with automatic retry
export const cachedFetch = async (url, options = {}) => {
  const {
    cache: useCache = true,
    retry = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  const cacheKey = `${url}_${JSON.stringify(fetchOptions)}`;

  // Return cached result if available
  if (useCache) {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Fetch with retry logic
  let lastError;
  for (let attempt = 1; attempt <= retry; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful results
      if (useCache) {
        apiCache.set(cacheKey, data);
      }

      return data;
    } catch (error) {
      lastError = error;

      if (attempt < retry) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }

  throw lastError;
};

// Export all utilities
export default {
  componentCache,
  createMemoizedComponent,
  useMemoizedCalculation,
  useDebouncedCallback,
  useThrottledCallback,
  useVirtualScroll,
  VirtualList,
  LazyImage,
  measurePerformance,
  prefetchResource,
  useMemoryMonitor,
  apiCache,
  cachedFetch,
};
