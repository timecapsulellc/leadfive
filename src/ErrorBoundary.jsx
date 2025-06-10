// ErrorBoundary.jsx - Enhanced error boundary (copied from docs/components)
// ...existing code from /docs/components/ErrorBoundary.jsx...

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("🚨 ErrorBoundary caught error:", error, errorInfo);
    this.setState({ errorInfo });
    // Example: logErrorToMyService(error, errorInfo);
  }

  render() {
    console.log('🛡️ ErrorBoundary render - hasError:', this.state.hasError);
    
    if (this.state.hasError) {
      console.log('❌ ErrorBoundary showing fallback UI');
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{ padding: '20px', textAlign: 'center', border: '1px solid red', margin: '10px' }}>
          <h2>Something went wrong.</h2>
          <p>We're sorry, an unexpected error occurred.</p>
          {this.state.error && <p><strong>Error:</strong> {this.state.error.toString()}</p>}
          {this.state.errorInfo && (
            <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', marginTop: '10px' }}>
              <summary>Error Details</summary>
              {this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }

    console.log('✅ ErrorBoundary rendering children');
    return this.props.children;
  }
}

export default ErrorBoundary;
