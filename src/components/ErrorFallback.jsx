import React from 'react';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="error-fallback" style={{
      padding: '2rem',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: 'white',
      minHeight: '50vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h2 style={{ color: '#00D4FF', marginBottom: '1rem' }}>
        Component Loading Error
      </h2>
      <p style={{ marginBottom: '1rem', opacity: 0.8 }}>
        This component failed to load. This might be due to network issues or dependency problems.
      </p>
      {error && (
        <details style={{ marginBottom: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>
          <summary>Error Details</summary>
          <pre style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
            {error.message}
          </pre>
        </details>
      )}
      <button 
        onClick={() => window.location.reload()}
        style={{
          background: 'linear-gradient(135deg, #00D4FF, #45B7D1)',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem 1.5rem',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '600'
        }}
      >
        Reload Page
      </button>
    </div>
  );
};

export default ErrorFallback;
