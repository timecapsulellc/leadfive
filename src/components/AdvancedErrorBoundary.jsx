import React from 'react';
import performanceMonitor from '../utils/performanceMonitor';

// Advanced Error Boundary with detailed reporting
class AdvancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state to trigger error UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error,
      errorInfo
    });

    // Report to performance monitor
    performanceMonitor.recordError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || 'AdvancedErrorBoundary',
      props: this.props,
      timestamp: new Date().toISOString()
    });

    // Report to external service (if configured)
    this.reportToExternalService(error, errorInfo);
  }

  reportToExternalService(error, errorInfo) {
    // Example: Send to error tracking service
    try {
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: error.message,
          fatal: true,
          error_id: this.state.errorId
        });
      }

      // Could integrate with Sentry, LogRocket, etc.
      if (process.env.REACT_APP_SENTRY_DSN) {
        // Sentry integration would go here
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent } = this.props;

      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onReload={this.handleReload}
          />
        );
      }

      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details (Development Mode)</summary>
                <div className="error-info">
                  <h4>Error: {this.state.error?.message}</h4>
                  <pre>{this.state.error?.stack}</pre>
                  <h4>Component Stack:</h4>
                  <pre>{this.state.errorInfo?.componentStack}</pre>
                </div>
              </details>
            )}
            
            <div className="error-actions">
              <button onClick={this.handleRetry} className="retry-button">
                Try Again
              </button>
              <button onClick={this.handleReload} className="reload-button">
                Reload Page
              </button>
            </div>
            
            <div className="error-id">
              Error ID: {this.state.errorId}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handler for unhandled errors
class GlobalErrorHandler {
  constructor() {
    this.init();
  }

  init() {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', this.handleError.bind(this));
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    
    // Handle resource loading errors
    window.addEventListener('error', this.handleResourceError.bind(this), true);
  }

  handleError(event) {
    const error = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    };

    performanceMonitor.recordError(error, {
      type: 'unhandled-error',
      timestamp: new Date().toISOString()
    });
  }

  handlePromiseRejection(event) {
    const error = {
      message: event.reason?.message || 'Unhandled Promise Rejection',
      reason: event.reason
    };

    performanceMonitor.recordError(error, {
      type: 'unhandled-promise-rejection',
      timestamp: new Date().toISOString()
    });

    // Prevent the default browser handling
    event.preventDefault();
  }

  handleResourceError(event) {
    if (event.target !== window) {
      const error = {
        message: `Failed to load resource: ${event.target.src || event.target.href}`,
        element: event.target.tagName,
        source: event.target.src || event.target.href
      };

      performanceMonitor.recordError(error, {
        type: 'resource-error',
        timestamp: new Date().toISOString()
      });
    }
  }
}

// Initialize global error handler
const globalErrorHandler = new GlobalErrorHandler();

// Higher-order component for error boundaries
export const withErrorBoundary = (Component, options = {}) => {
  const WrappedComponent = React.forwardRef((props, ref) => (
    <AdvancedErrorBoundary
      name={options.name || Component.displayName || Component.name}
      fallback={options.fallback}
    >
      <Component {...props} ref={ref} />
    </AdvancedErrorBoundary>
  ));

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Custom error fallback components
export const DefaultErrorFallback = ({ error, onRetry, onReload }) => (
  <div className="default-error-fallback">
    <h3>Oops! Something went wrong</h3>
    <p>We're experiencing a technical issue. Please try again.</p>
    <div className="error-actions">
      <button onClick={onRetry}>Try Again</button>
      <button onClick={onReload}>Reload Page</button>
    </div>
  </div>
);

export const MinimalErrorFallback = ({ onRetry }) => (
  <div className="minimal-error-fallback">
    <p>Something went wrong.</p>
    <button onClick={onRetry}>Retry</button>
  </div>
);

export default AdvancedErrorBoundary;
