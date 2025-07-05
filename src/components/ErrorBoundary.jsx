import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use fallback component if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Use custom fallback render function if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent(
          this.state.error,
          this.state.errorInfo
        );
      }

      const isProduction = process.env.NODE_ENV === 'production';

      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">
              <AlertTriangle size={64} />
            </div>

            <div className="error-content">
              <h1>Oops! Something went wrong</h1>
              <p className="error-message">
                We encountered an unexpected error. Our team has been notified
                and is working on a fix.
              </p>

              <div className="error-actions">
                <button onClick={this.handleRetry} className="retry-btn">
                  <RefreshCw size={20} />
                  Try Again
                </button>

                <button onClick={this.handleGoHome} className="home-btn">
                  <Home size={20} />
                  Go Home
                </button>
              </div>

              {!isProduction && this.state.error && (
                <details className="error-details">
                  <summary>Error Details (Development Mode)</summary>
                  <div className="error-stack">
                    <h3>Error:</h3>
                    <pre>{this.state.error && this.state.error.toString()}</pre>

                    <h3>Component Stack:</h3>
                    <pre>{this.state.errorInfo.componentStack}</pre>

                    <h3>Error Stack:</h3>
                    <pre>{this.state.error.stack}</pre>
                  </div>
                </details>
              )}
            </div>
          </div>

          <div className="error-suggestions">
            <h3>What you can try:</h3>
            <ul>
              <li>Refresh the page</li>
              <li>Check your internet connection</li>
              <li>Clear your browser cache</li>
              <li>Try a different browser</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for modern React patterns
export const withErrorBoundary = (WrappedComponent, fallback) => {
  return class extends React.Component {
    render() {
      return (
        <ErrorBoundary fallback={fallback}>
          <WrappedComponent {...this.props} />
        </ErrorBoundary>
      );
    }
  };
};

// Hook for handling async errors in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback(error => {
    console.error('Captured error:', error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

export default ErrorBoundary;
