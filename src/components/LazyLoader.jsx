import React, { Suspense } from 'react';
import { motion } from 'framer-motion';

// Reusable loading spinner component
const LoadingSpinner = ({ size = "medium", message = "Loading..." }) => {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-8 h-8", 
    large: "w-12 h-12"
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[200px] p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mb-4`}></div>
      <p className="text-gray-600 animate-pulse">{message}</p>
    </motion.div>
  );
};

// Error boundary for lazy components
class LazyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy component loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div 
          className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.346 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Error</h3>
          <p className="text-gray-600 mb-4">Failed to load component. Please try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for lazy loading with enhanced features
export const withLazyLoading = (
  Component, 
  { 
    fallback = <LoadingSpinner />, 
    errorFallback = null,
    preload = false,
    timeout = 10000 
  } = {}
) => {
  // Preload component if requested
  if (preload && typeof Component === 'function') {
    Component();
  }

  const LazyComponent = React.forwardRef((props, ref) => (
    <LazyErrorBoundary>
      <Suspense fallback={fallback}>
        <Component {...props} ref={ref} />
      </Suspense>
    </LazyErrorBoundary>
  ));

  LazyComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  
  return LazyComponent;
};

// Preloader utility for critical routes
export const preloadComponent = (componentImport) => {
  const componentImportPromise = componentImport();
  return componentImportPromise;
};

// Batch preloader for multiple components
export const preloadComponents = (componentImports) => {
  return Promise.all(componentImports.map(preloadComponent));
};

export { LoadingSpinner, LazyErrorBoundary };
