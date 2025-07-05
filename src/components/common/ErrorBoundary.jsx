import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you could send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      console.error('Production error caught:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, showDetails = false } = this.props;

      // Use custom fallback if provided
      if (Fallback) {
        return (
          <Fallback
            error={this.state.error}
            resetError={() =>
              this.setState({ hasError: false, error: null, errorInfo: null })
            }
          />
        );
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h2>Oops! Something went wrong</h2>
            <p>
              We're sorry, but something unexpected happened. Please try
              refreshing the page.
            </p>

            <div className="error-actions">
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
              <button
                className="btn btn-secondary"
                onClick={() =>
                  this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                  })
                }
              >
                Try Again
              </button>
            </div>

            {showDetails && process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre>{this.state.error && this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Dashboard-specific error boundary
export const DashboardErrorBoundary = ({ children }) => (
  <ErrorBoundary
    fallback={({ error, resetError }) => (
      <div className="dashboard-error">
        <div className="error-content">
          <h3>Dashboard Error</h3>
          <p>
            Unable to load dashboard data. This might be a temporary network
            issue.
          </p>
          <div className="error-actions">
            <button className="btn btn-primary" onClick={resetError}>
              Retry
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => (window.location.href = '/')}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
);

// Component-specific error boundary for smaller sections
export const SectionErrorBoundary = ({ children, sectionName = 'section' }) => (
  <ErrorBoundary
    fallback={({ resetError }) => (
      <div className="section-error">
        <p>Failed to load {sectionName}</p>
        <button className="btn btn-sm" onClick={resetError}>
          Retry
        </button>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;
