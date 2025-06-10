import React from 'react';

const OrphiChainLogo = ({ className = '', size = 'medium', variant = 'default' }) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32 };
      case 'large':
        return { width: 64, height: 64 };
      default:
        return { width: 48, height: 48 };
    }
  };

  const { width, height } = getSize();

  return (
    <div className={`orphi-logo ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="50%" stopColor="#7B2CBF" />
            <stop offset="100%" stopColor="#FF6B35" />
          </linearGradient>
        </defs>
        
        {/* Main Circle */}
        <circle
          cx="24"
          cy="24"
          r="22"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Inner Hexagon */}
        <path
          d="M24 4L42 16V32L24 44L6 32V16L24 4Z"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Matrix Nodes */}
        <circle cx="24" cy="24" r="4" fill="url(#logoGradient)" />
        <circle cx="24" cy="12" r="2" fill="url(#logoGradient)" />
        <circle cx="24" cy="36" r="2" fill="url(#logoGradient)" />
        <circle cx="12" cy="24" r="2" fill="url(#logoGradient)" />
        <circle cx="36" cy="24" r="2" fill="url(#logoGradient)" />
        
        {/* Connecting Lines */}
        <line
          x1="24"
          y1="14"
          x2="24"
          y2="22"
          stroke="url(#logoGradient)"
          strokeWidth="1"
        />
        <line
          x1="24"
          y1="26"
          x2="24"
          y2="34"
          stroke="url(#logoGradient)"
          strokeWidth="1"
        />
        <line
          x1="14"
          y1="24"
          x2="22"
          y2="24"
          stroke="url(#logoGradient)"
          strokeWidth="1"
        />
        <line
          x1="26"
          y1="24"
          x2="34"
          y2="24"
          stroke="url(#logoGradient)"
          strokeWidth="1"
        />
      </svg>
      
      {variant === 'full' && (
        <span className="logo-text">OrphiChain</span>
      )}
    </div>
  );
};

export default OrphiChainLogo;
