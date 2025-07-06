/**
 * Dynamic Import Utilities
 * Optimizes bundle size through lazy loading
 */

// Preload critical components after initial load
export const preloadCriticalComponents = () => {
  // Preload commonly used routes after 2 seconds
  setTimeout(() => {
    import('../pages/Dashboard');
    import('../pages/Referrals');
  }, 2000);
};

// Lazy load heavy components with loading states
export const lazyLoadComponent = (
  importFunc,
  options = { 
    fallback: null,
    preload: false,
    delay: 0 
  }
) => {
  const LazyComponent = React.lazy(() => {
    return new Promise(resolve => {
      if (options.delay > 0) {
        setTimeout(() => {
          resolve(importFunc());
        }, options.delay);
      } else {
        resolve(importFunc());
      }
    });
  });

  if (options.preload) {
    // Preload after component mount
    setTimeout(() => importFunc(), 1000);
  }

  return LazyComponent;
};

// Component-specific lazy loaders
export const LazyComponents = {
  // Heavy visualization components
  GenealogyTree: () => lazyLoadComponent(
    () => import('../components/enhanced/GenealogyTree'),
    { preload: true }
  ),
  
  NetworkTreeVisualization: () => lazyLoadComponent(
    () => import('../components/NetworkTreeVisualization')
  ),
  
  MatrixVisualization: () => lazyLoadComponent(
    () => import('../components/MatrixVisualization')
  ),
  
  // Chart components
  EarningsChart: () => lazyLoadComponent(
    () => import('../components/EarningsChart')
  ),
  
  PerformanceMetrics: () => lazyLoadComponent(
    () => import('../components/PerformanceMetrics')
  ),
  
  // AI components
  UnifiedChatbot: () => lazyLoadComponent(
    () => import('../components/UnifiedChatbot'),
    { delay: 500 } // Delay AI components
  ),
  
  AICoachingPanel: () => lazyLoadComponent(
    () => import('../components/AICoachingPanel')
  ),
  
  // Admin components
  AdminControlPanel: () => lazyLoadComponent(
    () => import('../components/AdminControlPanel')
  ),
  
  // Modal components
  UserProfileModal: () => lazyLoadComponent(
    () => import('../components/UserProfileModal')
  ),
  
  ExportModal: () => lazyLoadComponent(
    () => import('../components/ExportModal')
  )
};

// Prefetch on hover/focus
export const prefetchComponent = (componentName) => {
  if (LazyComponents[componentName]) {
    LazyComponents[componentName]();
  }
};

// Bundle analyzer helper
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle Analysis:');
    console.log('- Use "npm run build -- --analyze" to see bundle visualization');
    console.log('- Check Network tab for chunk loading');
  }
};