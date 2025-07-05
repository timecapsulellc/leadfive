import React from 'react';

const LoadingSpinner = ({
  size = 32,
  color = '#00D4FF',
  text = '',
  className = '',
  variant = 'spinner', // 'spinner', 'pulse', 'skeleton'
}) => {
  if (variant === 'pulse') {
    return (
      <div
        className={`loading-pulse ${className}`}
        style={{ width: size, height: size }}
      >
        <div
          className="pulse-circle"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: color,
            opacity: 0.6,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        {text && <span className="loading-text">{text}</span>}
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div
        className={`loading-skeleton ${className}`}
        style={{ width: size, height: size / 4 }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f0f0f0',
            background:
              'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`loading-spinner ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 50 50" style={{ width: '100%', height: '100%' }}>
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray="90,150"
          strokeLinecap="round"
          style={{ animation: 'spin 1s linear infinite' }}
        />
      </svg>
      {text && (
        <span className="loading-text" style={{ color, marginLeft: '8px' }}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
