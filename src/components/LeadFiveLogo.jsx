import React from 'react';

const LeadFiveLogo = ({ 
  width = 40, 
  height = 40, 
  className = '',
  showText = false,
  textSize = '1.5rem'
}) => {
  return (
    <div className={`leadfive-logo-container ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="leadfive-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#00D4FF', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#7B2CBF', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#FF6B35', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="leadfive-grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#7B2CBF', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#00D4FF', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        <g transform="translate(50, 50)">
          {/* Outer hexagon */}
          <path 
            d="M0,-35 L30,-17.5 L30,17.5 L0,35 L-30,17.5 L-30,-17.5 Z" 
            fill="url(#leadfive-grad1)" 
            opacity="0.9"
          />
          {/* Inner dark hexagon */}
          <path 
            d="M0,-25 L21.5,-12.5 L21.5,12.5 L0,25 L-21.5,12.5 L-21.5,-12.5 Z" 
            fill="#1A1A2E"
          />
          {/* Center glowing hexagon */}
          <path 
            d="M0,-18 L15.5,-9 L15.5,9 L0,18 L-15.5,9 L-15.5,-9 Z" 
            fill="url(#leadfive-grad2)"
          />
          {/* Inner core */}
          <circle cx="0" cy="0" r="8" fill="#00D4FF" opacity="0.8" />
        </g>
      </svg>
      
      {showText && (
        <span 
          style={{ 
            fontSize: textSize,
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #00D4FF, #7B2CBF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          LeadFive
        </span>
      )}
    </div>
  );
};

export default LeadFiveLogo;
