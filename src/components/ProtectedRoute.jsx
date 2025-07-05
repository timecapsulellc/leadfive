import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { contractService } from '../services/ContractService';

/**
 * ProtectedRoute Component
 *
 * Protects routes that require wallet connection and authentication.
 * Redirects unauthorized users to the home page with connection prompt.
 *
 * Security Features:
 * - Validates wallet connection state
 * - Preserves intended destination for post-login redirect
 * - Provides loading state during connection checks
 * - Implements role-based access control (admin routes)
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected component to render
 * @param {string} props.account - Connected wallet account address
 * @param {boolean} props.isConnecting - Whether wallet connection is in progress
 * @param {string} props.requiredRole - Optional role requirement ('admin', 'user')
 * @param {Object} props.userRoles - User's roles (for role-based access)
 * @param {string} props.redirectTo - Custom redirect path (default: '/home')
 */
const ProtectedRoute = ({
  children,
  account,
  isConnecting,
  requiredRole = null,
  userRoles = {},
  redirectTo = '/home',
  requireContractAccess = false,
}) => {
  const location = useLocation();
  const [isValidatingUser, setIsValidatingUser] = useState(false);
  const [userValidation, setUserValidation] = useState({ 
    isValid: true, 
    isBlacklisted: false,
    errorMessage: null 
  });

  // Validate user on contract when account changes
  useEffect(() => {
    if (account && requireContractAccess) {
      validateUserOnContract(account);
    }
  }, [account, requireContractAccess]);

  // Validate session activity (security feature) - MOVED HERE to avoid Rules of Hooks violation
  useEffect(() => {
    const lastActivity = localStorage.getItem('lastActivity');
    const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    
    if (lastActivity && Date.now() - parseInt(lastActivity) > sessionTimeout) {
      console.warn('Session expired due to inactivity');
      localStorage.removeItem('lastActivity');
      // Could force disconnect here if needed
    } else {
      localStorage.setItem('lastActivity', Date.now().toString());
    }

    // Update activity on user interaction
    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  const validateUserOnContract = async (userAddress) => {
    try {
      setIsValidatingUser(true);
      
      if (contractService.isAvailable()) {
        const userInfo = await contractService.getUserInfo(userAddress);
        
        // Check if user is blacklisted
        if (userInfo.isBlacklisted) {
          setUserValidation({
            isValid: false,
            isBlacklisted: true,
            errorMessage: 'Account has been suspended. Please contact support.'
          });
          return;
        }

        // Check if user is registered (for certain routes)
        if (requireContractAccess && !userInfo.isRegistered) {
          setUserValidation({
            isValid: false,
            isBlacklisted: false,
            errorMessage: 'Please register your account before accessing this feature.'
          });
          return;
        }

        setUserValidation({ isValid: true, isBlacklisted: false, errorMessage: null });
      } else {
        // Contract not available, allow access but log warning
        console.warn('Contract not available for user validation');
        setUserValidation({ isValid: true, isBlacklisted: false, errorMessage: null });
      }
    } catch (error) {
      console.error('User validation failed:', error);
      // Allow access on validation failure to prevent blocking users
      setUserValidation({ isValid: true, isBlacklisted: false, errorMessage: null });
    } finally {
      setIsValidatingUser(false);
    }
  };

  // Show loading state during connection process
  if (isConnecting || isValidatingUser) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{isConnecting ? 'Connecting wallet...' : 'Validating account...'}</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated (wallet connected)
  if (!account) {
    // Store the attempted location for redirect after login
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    );
  }

  // Check if user validation failed
  if (!userValidation.isValid) {
    if (userValidation.isBlacklisted) {
      return (
        <div className="protected-route-error">
          <div className="error-content">
            <h3>Account Suspended</h3>
            <p>{userValidation.errorMessage}</p>
            <button onClick={() => window.location.href = '/contact'}>
              Contact Support
            </button>
          </div>
        </div>
      );
    }

    // Redirect to registration if not registered
    return (
      <Navigate 
        to="/register" 
        state={{ 
          from: location.pathname,
          message: userValidation.errorMessage 
        }} 
        replace 
      />
    );
  }

  // Check role-based access if required
  if (requiredRole) {
    const hasRequiredRole = userRoles[requiredRole] === true;

    if (!hasRequiredRole) {
      // Redirect to unauthorized page or dashboard based on role
      const unauthorizedRedirect =
        requiredRole === 'admin' ? '/dashboard' : '/home';
      return (
        <Navigate
          to={unauthorizedRedirect}
          state={{
            error: `Access denied. ${requiredRole} role required.`,
            from: location.pathname,
          }}
          replace
        />
      );
    }
  }


  // User is authenticated and authorized - render the protected component
  return children;
};

// Higher-order component for admin-only routes
export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="admin" {...props}>
    {children}
  </ProtectedRoute>
);

// Higher-order component for user routes (basic authentication only)
export const UserRoute = ({ children, ...props }) => (
  <ProtectedRoute {...props}>{children}</ProtectedRoute>
);

export default ProtectedRoute;
