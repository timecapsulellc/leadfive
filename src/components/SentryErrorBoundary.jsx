/**
 * Sentry-Enhanced Error Boundary
 * Catches React errors and reports them to Sentry with context
 */

import React from 'react';
import * as Sentry from '@sentry/react';
import SentryService from '../services/SentryService';
import './SentryErrorBoundary.css';

const SentryErrorBoundary = ({ children, fallback, showDialog = false }) => {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError, eventId }) => (
        <ErrorFallback
          error={error}
          resetError={resetError}
          eventId={eventId}
          customFallback={fallback}
          showDialog={showDialog}
        />
      )}
      beforeCapture={(scope, error, errorInfo) => {
        // Add additional context before sending to Sentry
        scope.setTag('errorBoundary', true);
        scope.setContext('errorInfo', {
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        });

        // Add breadcrumb
        SentryService.addBreadcrumb(
          'React Error Boundary caught error',
          'error',
          'error',
          {
            error_name: error.name,
            error_message: error.message,
          }
        );
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

const ErrorFallback = ({
  error,
  resetError,
  eventId,
  customFallback,
  showDialog,
}) => {
  // If custom fallback is provided, use it
  if (customFallback) {
    return customFallback;
  }

  const handleReload = () => {
    window.location.reload();
  };

  const handleReportFeedback = () => {
    if (showDialog && eventId) {
      Sentry.showReportDialog({ eventId });
    }
  };

  return (
    <div className="sentry-error-boundary">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h2>Something went wrong</h2>
        <p>
          We're sorry, but something unexpected happened. Our team has been
          notified.
        </p>

        {import.meta.env.VITE_DEBUG_MODE === 'true' && (
          <details className="error-details">
            <summary>Technical Details (Debug Mode)</summary>
            <pre className="error-stack">
              <strong>Error:</strong> {error.name}: {error.message}
              {error.stack && (
                <>
                  <br />
                  <br />
                  <strong>Stack Trace:</strong>
                  <br />
                  {error.stack}
                </>
              )}
            </pre>
            {eventId && (
              <p className="event-id">
                <strong>Event ID:</strong> {eventId}
              </p>
            )}
          </details>
        )}

        <div className="error-actions">
          <button className="retry-btn" onClick={resetError}>
            Try Again
          </button>

          <button className="reload-btn" onClick={handleReload}>
            Reload Page
          </button>

          {showDialog && eventId && (
            <button className="feedback-btn" onClick={handleReportFeedback}>
              Report Issue
            </button>
          )}
        </div>

        <div className="error-support">
          <p>
            If this problem persists, please contact our support team with the
            event ID above.
          </p>
        </div>
      </div>
    </div>
  );
};

// Higher-order component for wrapping components with error boundary
export const withSentryErrorBoundary = (Component, options = {}) => {
  const WrappedComponent = props => (
    <SentryErrorBoundary {...options}>
      <Component {...props} />
    </SentryErrorBoundary>
  );

  WrappedComponent.displayName = `withSentryErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export default SentryErrorBoundary;
