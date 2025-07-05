/**
 * React Hook for Sentry Error Tracking
 * Provides easy integration with Sentry throughout the application
 */

import { useCallback, useEffect } from 'react';
import SentryService from '../services/SentryService';

export const useSentry = () => {
  // Set user context
  const setUser = useCallback(userInfo => {
    SentryService.setUser(userInfo);
  }, []);

  // Add custom tags
  const setTags = useCallback(tags => {
    SentryService.setTags(tags);
  }, []);

  // Add breadcrumb for user actions
  const addBreadcrumb = useCallback(
    (message, category = 'user', level = 'info', data = {}) => {
      SentryService.addBreadcrumb(message, category, level, data);
    },
    []
  );

  // Capture custom error with context
  const captureError = useCallback((error, context = {}) => {
    SentryService.captureError(error, context);
  }, []);

  // Capture custom message
  const captureMessage = useCallback(
    (message, level = 'info', context = {}) => {
      SentryService.captureMessage(message, level, context);
    },
    []
  );

  // Start performance transaction
  const startTransaction = useCallback((name, op = 'navigation') => {
    return SentryService.startTransaction(name, op);
  }, []);

  // Capture Web3/blockchain specific errors
  const captureWeb3Error = useCallback(
    (error, action, contractAddress = null, userAddress = null) => {
      SentryService.captureWeb3Error(
        error,
        action,
        contractAddress,
        userAddress
      );
    },
    []
  );

  // Track page views
  const trackPageView = useCallback(
    (pageName, additionalData = {}) => {
      addBreadcrumb(`Navigated to ${pageName}`, 'navigation', 'info', {
        page: pageName,
        timestamp: new Date().toISOString(),
        ...additionalData,
      });

      setTags({
        current_page: pageName,
      });
    },
    [addBreadcrumb, setTags]
  );

  // Track user actions
  const trackAction = useCallback(
    (action, category = 'user', data = {}) => {
      addBreadcrumb(`User action: ${action}`, category, 'info', {
        action,
        timestamp: new Date().toISOString(),
        ...data,
      });
    },
    [addBreadcrumb]
  );

  // Track Web3 transactions
  const trackTransaction = useCallback(
    (txHash, type, amount = null, status = 'pending') => {
      addBreadcrumb(`Web3 transaction: ${type}`, 'transaction', 'info', {
        tx_hash: txHash,
        tx_type: type,
        amount,
        status,
        timestamp: new Date().toISOString(),
      });

      setTags({
        last_transaction_type: type,
        last_transaction_status: status,
      });
    },
    [addBreadcrumb, setTags]
  );

  // Track wallet connections
  const trackWalletConnection = useCallback(
    (walletType, address, status = 'connected') => {
      addBreadcrumb(`Wallet ${status}: ${walletType}`, 'wallet', 'info', {
        wallet_type: walletType,
        wallet_address: address
          ? `${address.slice(0, 6)}...${address.slice(-4)}`
          : null,
        status,
        timestamp: new Date().toISOString(),
      });

      setTags({
        wallet_type: walletType,
        wallet_status: status,
      });
    },
    [addBreadcrumb, setTags]
  );

  // Track API calls
  const trackApiCall = useCallback(
    (endpoint, method = 'GET', status = 'success', duration = null) => {
      addBreadcrumb(
        `API call: ${method} ${endpoint}`,
        'api',
        status === 'success' ? 'info' : 'warning',
        {
          endpoint,
          method,
          status,
          duration,
          timestamp: new Date().toISOString(),
        }
      );
    },
    [addBreadcrumb]
  );

  // Track errors with automatic context
  const trackError = useCallback(
    (error, context = {}) => {
      const errorContext = {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        ...context,
      };

      captureError(error, errorContext);
    },
    [captureError]
  );

  // Performance monitoring wrapper
  const measurePerformance = useCallback(
    (name, operation) => {
      return async (...args) => {
        const transaction = startTransaction(name, 'function');
        const startTime = performance.now();

        try {
          const result = await operation(...args);
          const duration = performance.now() - startTime;

          addBreadcrumb(
            `Performance: ${name} completed`,
            'performance',
            'info',
            { duration: `${duration.toFixed(2)}ms` }
          );

          return result;
        } catch (error) {
          const duration = performance.now() - startTime;

          trackError(error, {
            performance: {
              operation: name,
              duration: `${duration.toFixed(2)}ms`,
              failed: true,
            },
          });

          throw error;
        } finally {
          if (transaction) {
            transaction.finish();
          }
        }
      };
    },
    [startTransaction, addBreadcrumb, trackError]
  );

  // Get Sentry status
  const getSentryStatus = useCallback(() => {
    return SentryService.getStatus();
  }, []);

  return {
    // User context
    setUser,
    setTags,

    // Basic tracking
    addBreadcrumb,
    captureError,
    captureMessage,

    // Web3 specific
    captureWeb3Error,
    trackTransaction,
    trackWalletConnection,

    // Application tracking
    trackPageView,
    trackAction,
    trackApiCall,
    trackError,

    // Performance
    startTransaction,
    measurePerformance,

    // Utilities
    getSentryStatus,
  };
};

// Hook for component-level error tracking
export const useSentryErrorTracking = componentName => {
  const { addBreadcrumb, trackError, setTags } = useSentry();

  useEffect(() => {
    // Set component context
    setTags({ current_component: componentName });

    // Add breadcrumb for component mount
    addBreadcrumb(`Component mounted: ${componentName}`, 'component', 'info', {
      component: componentName,
    });

    // Cleanup function
    return () => {
      addBreadcrumb(
        `Component unmounted: ${componentName}`,
        'component',
        'info',
        { component: componentName }
      );
    };
  }, [componentName, addBreadcrumb, setTags]);

  // Error handler specifically for this component
  const handleComponentError = useCallback(
    (error, errorInfo = {}) => {
      trackError(error, {
        component: componentName,
        error_boundary: false,
        ...errorInfo,
      });
    },
    [componentName, trackError]
  );

  return {
    trackError: handleComponentError,
    addBreadcrumb,
    componentName,
  };
};
