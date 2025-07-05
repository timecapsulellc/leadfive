// Performance monitoring and optimization utilities
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      loadTimes: [],
      interactionTimes: [],
      memoryUsage: [],
      errors: [],
    };
    this.observers = {};
    this.init();
  }

  init() {
    // Initialize performance observers
    this.initNavigationObserver();
    this.initResourceObserver();
    this.initLongTaskObserver();
    this.initMemoryObserver();
  }

  initNavigationObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          this.recordNavigationMetrics(entry);
        }
      });

      try {
        observer.observe({ entryTypes: ['navigation'] });
        this.observers.navigation = observer;
      } catch (e) {
        console.warn('Navigation timing not supported');
      }
    }
  }

  initResourceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          this.recordResourceMetrics(entry);
        }
      });

      try {
        observer.observe({ entryTypes: ['resource'] });
        this.observers.resource = observer;
      } catch (e) {
        console.warn('Resource timing not supported');
      }
    }
  }

  initLongTaskObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          this.recordLongTask(entry);
        }
      });

      try {
        observer.observe({ entryTypes: ['longtask'] });
        this.observers.longtask = observer;
      } catch (e) {
        console.warn('Long task timing not supported');
      }
    }
  }

  initMemoryObserver() {
    // Monitor memory usage periodically
    this.memoryInterval = setInterval(() => {
      this.recordMemoryUsage();
    }, 30000); // Every 30 seconds
  }

  recordNavigationMetrics(entry) {
    const metrics = {
      timestamp: Date.now(),
      loadTime: entry.loadEventEnd - entry.loadEventStart,
      domContentLoaded:
        entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      firstPaint: this.getFirstPaintTime(),
      firstContentfulPaint: this.getFirstContentfulPaintTime(),
      largestContentfulPaint: this.getLargestContentfulPaintTime(),
    };

    this.metrics.loadTimes.push(metrics);
    this.reportMetrics('navigation', metrics);
  }

  recordResourceMetrics(entry) {
    const metrics = {
      timestamp: Date.now(),
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize || 0,
      type: this.getResourceType(entry.name),
    };

    // Track slow resources
    if (metrics.duration > 1000) {
      this.reportMetrics('slow-resource', metrics);
    }
  }

  recordLongTask(entry) {
    const metrics = {
      timestamp: Date.now(),
      duration: entry.duration,
      startTime: entry.startTime,
    };

    this.reportMetrics('long-task', metrics);
  }

  recordMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      const metrics = {
        timestamp: Date.now(),
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };

      this.metrics.memoryUsage.push(metrics);

      // Alert if memory usage is high
      if (metrics.usagePercentage > 80) {
        this.reportMetrics('high-memory', metrics);
      }
    }
  }

  getFirstPaintTime() {
    const paintTiming = performance.getEntriesByType('paint');
    const firstPaint = paintTiming.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  getFirstContentfulPaintTime() {
    const paintTiming = performance.getEntriesByType('paint');
    const fcp = paintTiming.find(
      entry => entry.name === 'first-contentful-paint'
    );
    return fcp ? fcp.startTime : null;
  }

  getLargestContentfulPaintTime() {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    return lcpEntries.length > 0
      ? lcpEntries[lcpEntries.length - 1].startTime
      : null;
  }

  getResourceType(url) {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'style';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    return 'other';
  }

  // Measure component render time
  measureComponentRender(componentName, renderFunction) {
    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();

    const metrics = {
      timestamp: Date.now(),
      component: componentName,
      renderTime: endTime - startTime,
    };

    if (metrics.renderTime > 16) {
      // Slower than 60fps
      this.reportMetrics('slow-render', metrics);
    }

    return result;
  }

  // Measure async operation time
  async measureAsyncOperation(operationName, asyncFunction) {
    const startTime = performance.now();
    try {
      const result = await asyncFunction();
      const endTime = performance.now();

      this.reportMetrics('async-operation', {
        timestamp: Date.now(),
        operation: operationName,
        duration: endTime - startTime,
        success: true,
      });

      return result;
    } catch (error) {
      const endTime = performance.now();

      this.reportMetrics('async-operation', {
        timestamp: Date.now(),
        operation: operationName,
        duration: endTime - startTime,
        success: false,
        error: error.message,
      });

      throw error;
    }
  }

  // Get performance summary
  getPerformanceSummary() {
    const summary = {
      averageLoadTime: this.calculateAverage(
        this.metrics.loadTimes,
        'loadTime'
      ),
      memoryUsage: this.getLatestMemoryUsage(),
      slowResources: this.getSlowResources(),
      errorCount: this.metrics.errors.length,
      recommendations: this.getPerformanceRecommendations(),
    };

    return summary;
  }

  calculateAverage(array, property) {
    if (array.length === 0) return 0;
    const sum = array.reduce((acc, item) => acc + (item[property] || 0), 0);
    return sum / array.length;
  }

  getLatestMemoryUsage() {
    return this.metrics.memoryUsage.length > 0
      ? this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1]
      : null;
  }

  getSlowResources() {
    // This would be populated by the resource observer
    return [];
  }

  getPerformanceRecommendations() {
    const recommendations = [];
    const memoryUsage = this.getLatestMemoryUsage();

    if (memoryUsage && memoryUsage.usagePercentage > 70) {
      recommendations.push(
        'High memory usage detected. Consider implementing virtual scrolling or pagination.'
      );
    }

    const avgLoadTime = this.calculateAverage(
      this.metrics.loadTimes,
      'loadTime'
    );
    if (avgLoadTime > 3000) {
      recommendations.push(
        'Slow load times detected. Consider code splitting and lazy loading.'
      );
    }

    return recommendations;
  }

  reportMetrics(type, data) {
    // Send metrics to monitoring service or log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${type}:`, data);
    }

    // In production, send to analytics service
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        event_category: 'Performance',
        event_label: type,
        value: data.duration || data.renderTime || 0,
      });
    }
  }

  // Error tracking
  recordError(error, context = {}) {
    const errorInfo = {
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.metrics.errors.push(errorInfo);
    this.reportMetrics('error', errorInfo);
  }

  // Clean up
  dispose() {
    Object.values(this.observers).forEach(observer => observer.disconnect());
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  return {
    measureRender: (componentName, renderFn) =>
      performanceMonitor.measureComponentRender(componentName, renderFn),
    measureAsync: (operationName, asyncFn) =>
      performanceMonitor.measureAsyncOperation(operationName, asyncFn),
    recordError: (error, context) =>
      performanceMonitor.recordError(error, context),
    getSummary: () => performanceMonitor.getPerformanceSummary(),
  };
};

export default performanceMonitor;
