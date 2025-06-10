import React from 'react';

const LoadingSpinner = ({ size = 32 }) => (
  <div className="loading-spinner" style={{ width: size, height: size }}>
    <svg viewBox="0 0 50 50" style={{ width: '100%', height: '100%' }}>
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="#00D4FF"
        strokeWidth="5"
        strokeDasharray="90,150"
        strokeLinecap="round"
        style={{ animation: 'spin 1s linear infinite' }}
      />
    </svg>
  </div>
);

export default LoadingSpinner;
