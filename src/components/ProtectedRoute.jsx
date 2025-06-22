import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

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
  redirectTo = '/home'
}) => {
  const location = useLocation();

  // Show loading state during connection process
  if (isConnecting) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Connecting wallet...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated (wallet connected)
  if (!account) {
    // Store the attempted location for redirect after login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access if required
  if (requiredRole) {
    const hasRequiredRole = userRoles[requiredRole] === true;
    
    if (!hasRequiredRole) {
      // Redirect to unauthorized page or dashboard based on role
      const unauthorizedRedirect = requiredRole === 'admin' ? '/dashboard' : '/home';
      return (
        <Navigate 
          to={unauthorizedRedirect} 
          state={{ 
            error: `Access denied. ${requiredRole} role required.`,
            from: location.pathname 
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
  <ProtectedRoute {...props}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
