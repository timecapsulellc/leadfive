/**
 * Bundle Analysis and Performance Monitoring
 * Tools for analyzing bundle size and runtime performance
 */

// ============ BUNDLE SIZE ANALYSIS ============
class BundleAnalyzer {
  constructor() {
    this.chunks = new Map();
    this.loadTimes = new Map();
    this.errors = [];
    this.startTime = performance.now();
  }

  // Track chunk loading
  trackChunkLoad(chunkName, size, loadTime) {
    this.chunks.set(chunkName, {
      size,
      loadTime,
      timestamp: Date.now(),
    });

    // Chunk loading tracked - console.log removed for production
  }

  // Analyze total bundle size
  getTotalBundleSize() {
    let totalSize = 0;
    for (const [name, info] of this.chunks) {
      totalSize += info.size;
    }
    return totalSize;
  }

  // Get largest chunks
  getLargestChunks(limit = 5) {
    return Array.from(this.chunks.entries())
      .sort(([, a], [, b]) => b.size - a.size)
      .slice(0, limit)
      .map(([name, info]) => ({
        name,
        size: info.size,
        formattedSize: this.formatBytes(info.size),
        loadTime: info.loadTime,
      }));
  }

  // Get slowest loading chunks
  getSlowestChunks(limit = 5) {
    return Array.from(this.chunks.entries())
      .sort(([, a], [, b]) => b.loadTime - a.loadTime)
      .slice(0, limit)
      .map(([name, info]) => ({
        name,
        size: info.size,
        loadTime: info.loadTime,
      }));
  }

  // Format bytes to human readable
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate bundle report
  generateReport() {
    const totalSize = this.getTotalBundleSize();
    const largestChunks = this.getLargestChunks();
    const slowestChunks = this.getSlowestChunks();

    return {
      summary: {
        totalChunks: this.chunks.size,
        totalSize,
        formattedTotalSize: this.formatBytes(totalSize),
        analysisTime: performance.now() - this.startTime,
      },
      largestChunks,
      slowestChunks,
      recommendations: this.generateRecommendations(totalSize, largestChunks),
    };
  }

  // Generate optimization recommendations
  generateRecommendations(totalSize, largestChunks) {
    const recommendations = [];

    if (totalSize > 2000000) {
      // 2MB
      recommendations.push({
        type: 'warning',
        message: 'Bundle size exceeds 2MB. Consider code splitting.',
        action: 'Implement route-based code splitting',
      });
    }

    largestChunks.forEach(chunk => {
      if (chunk.size > 500000) {
        // 500KB
        recommendations.push({
          type: 'warning',
          message: `Chunk "${chunk.name}" is very large (${chunk.formattedSize})`,
          action: 'Consider splitting this chunk further',
        });
      }
    });

    if (largestChunks.some(chunk => chunk.loadTime > 1000)) {
      recommendations.push({
        type: 'error',
        message: 'Some chunks take over 1 second to load',
        action: 'Optimize chunk loading or reduce chunk size',
      });
    }

    return recommendations;
  }
}

// ============ PERFORMANCE MONITORING ============
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.startTime = performance.now();
    this.setupObservers();
  }

  // Setup performance observers
  setupObservers() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime);
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        // LCP observer not supported - warning removed for production
      }

      // First Input Delay
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        // FID observer not supported - warning removed for production
      }

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.recordMetric('CLS', clsValue);
          }
        });
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        // CLS observer not supported - warning removed for production
      }
    }
  }

  // Record a performance metric
  recordMetric(name, value, tags = {}) {
    const timestamp = performance.now();

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name).push({
      value,
      timestamp,
      tags,
    });

    // Log important metrics
    if (['LCP', 'FID', 'CLS'].includes(name)) {
      // Performance metric tracked - console.log removed for production
    }
  }

  // Get metric unit
  getMetricUnit(metric) {
    switch (metric) {
      case 'LCP':
      case 'FID':
        return 'ms';
      case 'CLS':
        return '';
      default:
        return '';
    }
  }

  // Get Core Web Vitals
  getCoreWebVitals() {
    const lcp = this.getLatestMetric('LCP');
    const fid = this.getLatestMetric('FID');
    const cls = this.getLatestMetric('CLS');

    return {
      LCP: {
        value: lcp?.value || 0,
        status: this.getLCPStatus(lcp?.value || 0),
        threshold: 2500,
      },
      FID: {
        value: fid?.value || 0,
        status: this.getFIDStatus(fid?.value || 0),
        threshold: 100,
      },
      CLS: {
        value: cls?.value || 0,
        status: this.getCLSStatus(cls?.value || 0),
        threshold: 0.1,
      },
    };
  }

  // Get latest metric value
  getLatestMetric(name) {
    const metrics = this.metrics.get(name);
    return metrics ? metrics[metrics.length - 1] : null;
  }

  // Performance status helpers
  getLCPStatus(value) {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  getFIDStatus(value) {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  getCLSStatus(value) {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  // Memory usage monitoring
  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        usagePercentage:
          (performance.memory.usedJSHeapSize /
            performance.memory.jsHeapSizeLimit) *
          100,
      };
    }
    return null;
  }

  // Resource timing analysis
  getResourceTimings() {
    const resources = performance.getEntriesByType('resource');

    return resources
      .map(resource => ({
        name: resource.name,
        type: this.getResourceType(resource.name),
        size: resource.transferSize || 0,
        duration: resource.duration,
        startTime: resource.startTime,
      }))
      .sort((a, b) => b.duration - a.duration);
  }

  // Get resource type from URL
  getResourceType(url) {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) return 'image';
    if (url.includes('.woff')) return 'font';
    return 'other';
  }

  // Navigation timing
  getNavigationTiming() {
    const nav = performance.getEntriesByType('navigation')[0];
    if (!nav) return null;

    return {
      dns: nav.domainLookupEnd - nav.domainLookupStart,
      tcp: nav.connectEnd - nav.connectStart,
      ssl:
        nav.secureConnectionStart > 0
          ? nav.connectEnd - nav.secureConnectionStart
          : 0,
      ttfb: nav.responseStart - nav.requestStart,
      download: nav.responseEnd - nav.responseStart,
      domParse: nav.domContentLoadedEventStart - nav.responseEnd,
      domReady: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
      load: nav.loadEventEnd - nav.loadEventStart,
      total: nav.loadEventEnd - nav.navigationStart,
    };
  }

  // Generate performance report
  generateReport() {
    const coreWebVitals = this.getCoreWebVitals();
    const memoryUsage = this.getMemoryUsage();
    const resourceTimings = this.getResourceTimings();
    const navigationTiming = this.getNavigationTiming();

    return {
      coreWebVitals,
      memoryUsage,
      navigationTiming,
      resourceTimings: resourceTimings.slice(0, 10), // Top 10 slowest resources
      recommendations: this.generatePerformanceRecommendations(
        coreWebVitals,
        memoryUsage
      ),
    };
  }

  // Generate performance recommendations
  generatePerformanceRecommendations(coreWebVitals, memoryUsage) {
    const recommendations = [];

    if (coreWebVitals.LCP.status === 'poor') {
      recommendations.push({
        type: 'error',
        metric: 'LCP',
        message: `LCP is ${coreWebVitals.LCP.value}ms (should be < 2500ms)`,
        action:
          'Optimize largest contentful paint by optimizing images and fonts',
      });
    }

    if (coreWebVitals.FID.status === 'poor') {
      recommendations.push({
        type: 'error',
        metric: 'FID',
        message: `FID is ${coreWebVitals.FID.value}ms (should be < 100ms)`,
        action: 'Reduce JavaScript execution time and optimize event handlers',
      });
    }

    if (coreWebVitals.CLS.status === 'poor') {
      recommendations.push({
        type: 'error',
        metric: 'CLS',
        message: `CLS is ${coreWebVitals.CLS.value} (should be < 0.1)`,
        action: 'Set explicit dimensions for images and avoid layout shifts',
      });
    }

    if (memoryUsage && memoryUsage.usagePercentage > 80) {
      recommendations.push({
        type: 'warning',
        metric: 'Memory',
        message: `Memory usage is ${memoryUsage.usagePercentage.toFixed(1)}%`,
        action: 'Optimize memory usage and check for memory leaks',
      });
    }

    return recommendations;
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// ============ RUNTIME PERFORMANCE TRACKER ============
class RuntimePerformanceTracker {
  constructor() {
    this.componentRenderTimes = new Map();
    this.apiCallTimes = new Map();
    this.userInteractionTimes = new Map();
  }

  // Track component render time
  trackComponentRender(componentName, renderTime) {
    if (!this.componentRenderTimes.has(componentName)) {
      this.componentRenderTimes.set(componentName, []);
    }

    this.componentRenderTimes.get(componentName).push({
      time: renderTime,
      timestamp: Date.now(),
    });
  }

  // Track API call performance
  trackAPICall(endpoint, duration, status) {
    if (!this.apiCallTimes.has(endpoint)) {
      this.apiCallTimes.set(endpoint, []);
    }

    this.apiCallTimes.get(endpoint).push({
      duration,
      status,
      timestamp: Date.now(),
    });
  }

  // Track user interaction performance
  trackUserInteraction(action, duration) {
    if (!this.userInteractionTimes.has(action)) {
      this.userInteractionTimes.set(action, []);
    }

    this.userInteractionTimes.get(action).push({
      duration,
      timestamp: Date.now(),
    });
  }

  // Get component performance summary
  getComponentPerformance() {
    const summary = [];

    this.componentRenderTimes.forEach((times, componentName) => {
      const avgTime =
        times.reduce((sum, entry) => sum + entry.time, 0) / times.length;
      const maxTime = Math.max(...times.map(entry => entry.time));

      summary.push({
        component: componentName,
        avgRenderTime: avgTime,
        maxRenderTime: maxTime,
        renderCount: times.length,
      });
    });

    return summary.sort((a, b) => b.avgRenderTime - a.avgRenderTime);
  }

  // Generate runtime report
  generateRuntimeReport() {
    return {
      componentPerformance: this.getComponentPerformance(),
      apiPerformance: Array.from(this.apiCallTimes.entries()).map(
        ([endpoint, calls]) => ({
          endpoint,
          avgDuration:
            calls.reduce((sum, call) => sum + call.duration, 0) / calls.length,
          callCount: calls.length,
          errorRate:
            calls.filter(call => call.status >= 400).length / calls.length,
        })
      ),
      interactionPerformance: Array.from(
        this.userInteractionTimes.entries()
      ).map(([action, interactions]) => ({
        action,
        avgDuration:
          interactions.reduce(
            (sum, interaction) => sum + interaction.duration,
            0
          ) / interactions.length,
        count: interactions.length,
      })),
    };
  }
}

// ============ EXPORTS ============
export const bundleAnalyzer = new BundleAnalyzer();
export const performanceMonitor = new PerformanceMonitor();
export const runtimeTracker = new RuntimePerformanceTracker();

// Utility functions
export const measureComponentRender = (componentName, renderFn) => {
  const start = performance.now();
  const result = renderFn();
  const end = performance.now();

  runtimeTracker.trackComponentRender(componentName, end - start);
  return result;
};

export const measureAPICall = async (endpoint, apiFn) => {
  const start = performance.now();
  let status = 200;

  try {
    const result = await apiFn();
    const end = performance.now();

    runtimeTracker.trackAPICall(endpoint, end - start, status);
    return result;
  } catch (error) {
    const end = performance.now();
    status = error.status || 500;

    runtimeTracker.trackAPICall(endpoint, end - start, status);
    throw error;
  }
};

export const measureUserInteraction = (action, interactionFn) => {
  const start = performance.now();
  const result = interactionFn();
  const end = performance.now();

  runtimeTracker.trackUserInteraction(action, end - start);
  return result;
};

// Global performance logger
export const logPerformanceReport = () => {
  // Performance report generated - console output removed for production

  const bundleReport = bundleAnalyzer.generateReport();
  const performanceReport = performanceMonitor.generateReport();
  const runtimeReport = runtimeTracker.generateRuntimeReport();

  // All metrics are tracked internally and can be accessed via the return value
  return { bundleReport, performanceReport, runtimeReport };
};

// Auto-log performance report in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    logPerformanceReport();
  }, 5000);
}
