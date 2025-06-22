// Production monitoring and analytics system
class ProductionMonitor {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.analyticsQueue = [];
    this.metrics = {
      pageViews: 0,
      userActions: 0,
      errors: 0,
      performanceIssues: 0
    };
    this.sessionData = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      userId: null,
      userAgent: navigator.userAgent,
      viewport: this.getViewportSize()
    };

    this.init();
  }

  init() {
    if (this.isProduction) {
      this.initAnalytics();
      this.initErrorTracking();
      this.initPerformanceTracking();
      this.initUserBehaviorTracking();
    }
  }

  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getViewportSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  // Analytics Integration
  initAnalytics() {
    // Initialize Google Analytics 4 if available
    if (window.gtag) {
      window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
        session_id: this.sessionData.sessionId,
        custom_map: {
          custom_parameter_1: 'wallet_connected'
        }
      });
    }

    // Initialize custom analytics
    this.trackPageView(window.location.pathname);
  }

  // Error Tracking
  initErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        reason: event.reason,
        timestamp: Date.now()
      });
    });
  }

  // Performance Tracking
  initPerformanceTracking() {
    // Track Core Web Vitals
    this.trackCoreWebVitals();
    
    // Track custom performance metrics
    this.trackCustomPerformanceMetrics();
  }

  trackCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.startTime < 10000) { // Only consider LCP within first 10 seconds
          this.trackMetric('core_web_vitals', {
            metric: 'lcp',
            value: entry.startTime,
            rating: entry.startTime <= 2500 ? 'good' : entry.startTime <= 4000 ? 'needs_improvement' : 'poor'
          });
        }
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.trackMetric('core_web_vitals', {
          metric: 'fid',
          value: entry.processingStart - entry.startTime,
          rating: (entry.processingStart - entry.startTime) <= 100 ? 'good' : 
                  (entry.processingStart - entry.startTime) <= 300 ? 'needs_improvement' : 'poor'
        });
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      
      this.trackMetric('core_web_vitals', {
        metric: 'cls',
        value: clsValue,
        rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs_improvement' : 'poor'
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  trackCustomPerformanceMetrics() {
    // Track navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        
        this.trackMetric('performance', {
          metric: 'page_load_time',
          value: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          timeToInteractive: navigation.domInteractive - navigation.navigationStart
        });
      }, 0);
    });

    // Track resource loading
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.duration > 1000) { // Track slow resources
          this.trackMetric('performance', {
            metric: 'slow_resource',
            resource: entry.name,
            duration: entry.duration,
            size: entry.transferSize
          });
        }
      }
    }).observe({ entryTypes: ['resource'] });
  }

  // User Behavior Tracking
  initUserBehaviorTracking() {
    // Track clicks
    document.addEventListener('click', (event) => {
      this.trackUserAction('click', {
        element: event.target.tagName,
        className: event.target.className,
        id: event.target.id,
        text: event.target.textContent?.slice(0, 50)
      });
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', this.throttle(() => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        if (maxScrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          this.trackUserAction('scroll', { depth: maxScrollDepth });
        }
      }
    }, 100));

    // Track time on page
    let startTime = Date.now();
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - startTime;
      this.trackMetric('engagement', {
        metric: 'time_on_page',
        value: timeOnPage,
        page: window.location.pathname
      });
    });
  }

  // Tracking Methods
  trackPageView(path) {
    this.metrics.pageViews++;
    
    const event = {
      type: 'page_view',
      path,
      referrer: document.referrer,
      timestamp: Date.now(),
      sessionId: this.sessionData.sessionId
    };

    this.queueEvent(event);

    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_location: window.location.href,
        page_path: path
      });
    }
  }

  trackUserAction(action, data = {}) {
    this.metrics.userActions++;
    
    const event = {
      type: 'user_action',
      action,
      data,
      timestamp: Date.now(),
      sessionId: this.sessionData.sessionId
    };

    this.queueEvent(event);

    if (window.gtag) {
      window.gtag('event', action, {
        event_category: 'User Interaction',
        ...data
      });
    }
  }

  trackError(error) {
    this.metrics.errors++;
    
    const event = {
      type: 'error',
      error,
      timestamp: Date.now(),
      sessionId: this.sessionData.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.queueEvent(event);

    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }

    // Send critical errors immediately
    if (error.type === 'javascript_error' || error.type === 'unhandled_promise_rejection') {
      this.flushEvents();
    }
  }

  trackMetric(category, data) {
    const event = {
      type: 'metric',
      category,
      data,
      timestamp: Date.now(),
      sessionId: this.sessionData.sessionId
    };

    this.queueEvent(event);

    if (window.gtag && category === 'core_web_vitals') {
      window.gtag('event', data.metric, {
        event_category: 'Web Vitals',
        value: Math.round(data.value),
        metric_rating: data.rating
      });
    }
  }

  trackWalletAction(action, data = {}) {
    const event = {
      type: 'wallet_action',
      action,
      data,
      timestamp: Date.now(),
      sessionId: this.sessionData.sessionId
    };

    this.queueEvent(event);

    if (window.gtag) {
      window.gtag('event', 'wallet_action', {
        event_category: 'Blockchain',
        action_type: action,
        ...data
      });
    }
  }

  trackBusinessMetric(metric, value, metadata = {}) {
    const event = {
      type: 'business_metric',
      metric,
      value,
      metadata,
      timestamp: Date.now(),
      sessionId: this.sessionData.sessionId
    };

    this.queueEvent(event);

    if (window.gtag) {
      window.gtag('event', 'custom_business_metric', {
        event_category: 'Business',
        metric_name: metric,
        metric_value: value
      });
    }
  }

  // Event Queue Management
  queueEvent(event) {
    this.analyticsQueue.push(event);
    
    // Auto-flush queue when it gets large
    if (this.analyticsQueue.length >= 10) {
      this.flushEvents();
    }
  }

  flushEvents() {
    if (this.analyticsQueue.length === 0) return;

    const events = [...this.analyticsQueue];
    this.analyticsQueue = [];

    // Send to analytics endpoint
    this.sendToAnalytics(events);
  }

  async sendToAnalytics(events) {
    if (!this.isProduction) return;

    try {
      // Send to custom analytics endpoint
      if (process.env.REACT_APP_ANALYTICS_ENDPOINT) {
        await fetch(process.env.REACT_APP_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            events,
            session: this.sessionData
          })
        });
      }

      // Send to other analytics services
      await this.sendToThirdPartyServices(events);
    } catch (error) {
      console.warn('Analytics sending failed:', error);
      // Re-queue events for retry
      this.analyticsQueue.unshift(...events.slice(-5)); // Keep last 5 events
    }
  }

  async sendToThirdPartyServices(events) {
    // Example: Send to Mixpanel, Amplitude, etc.
    if (window.mixpanel) {
      events.forEach(event => {
        window.mixpanel.track(event.type, event);
      });
    }
  }

  // Utility Methods
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Public API
  setUserId(userId) {
    this.sessionData.userId = userId;
    
    if (window.gtag) {
      window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
        user_id: userId
      });
    }
  }

  getSessionMetrics() {
    return {
      ...this.metrics,
      sessionDuration: Date.now() - this.sessionData.startTime,
      queueSize: this.analyticsQueue.length
    };
  }

  // Cleanup
  destroy() {
    this.flushEvents();
    
    // Remove event listeners
    // (In a real implementation, you'd track and remove all listeners)
  }
}

// React Hook for production monitoring
export const useProductionMonitor = () => {
  const [monitor] = React.useState(() => new ProductionMonitor());

  React.useEffect(() => {
    return () => monitor.destroy();
  }, [monitor]);

  return {
    trackPageView: (path) => monitor.trackPageView(path),
    trackUserAction: (action, data) => monitor.trackUserAction(action, data),
    trackError: (error) => monitor.trackError(error),
    trackMetric: (category, data) => monitor.trackMetric(category, data),
    trackWalletAction: (action, data) => monitor.trackWalletAction(action, data),
    trackBusinessMetric: (metric, value, metadata) => monitor.trackBusinessMetric(metric, value, metadata),
    setUserId: (userId) => monitor.setUserId(userId),
    getMetrics: () => monitor.getSessionMetrics()
  };
};

// Singleton instance
const productionMonitor = new ProductionMonitor();

export default productionMonitor;
