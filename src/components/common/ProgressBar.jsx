import React from 'react';

const ProgressBar = ({ 
  progress = 0, 
  value, 
  max = 100, 
  color = '#00D4FF', 
  backgroundColor = '#2a2d3f',
  height = 8,
  showPercentage = false,
  animated = true,
  className = ''
}) => {
  // Support both progress (0-100) and value/max props
  const percentage = progress || (value / max) * 100;
  const clampedProgress = Math.max(0, Math.min(100, percentage));
  
  return (
    <div className={`progress-bar-container ${className}`}>
      <div 
        className="progress-bar" 
        style={{ 
          height: `${height}px`,
          backgroundColor,
          borderRadius: `${height / 2}px`,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div 
          className={`progress-bar-fill ${animated ? 'animated' : ''}`}
          style={{ 
            width: `${clampedProgress}%`,
            height: '100%',
            background: color,
            borderRadius: `${height / 2}px`,
            transition: animated ? 'width 0.5s ease-in-out' : 'none',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {animated && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                animation: clampedProgress > 0 ? 'shimmer 2s infinite' : 'none'
              }}
            />
          )}
        </div>
      </div>
      {showPercentage && (
        <div 
          style={{ 
            textAlign: 'center', 
            marginTop: '4px', 
            fontSize: '0.9rem',
            color: 'var(--text-secondary, #b0b3c1)'
          }}
        >
          {clampedProgress.toFixed(1)}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
