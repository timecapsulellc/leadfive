import React from 'react';

const OrphiChainLogo = () => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#7B2CBF" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path
        d="M16 2L4 9V23L16 30L28 23V9L16 2Z"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        fill="none"
        filter="url(#glow)"
      />
      <path
        d="M16 2L4 9L16 16L28 9L16 2Z"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        fill="none"
        filter="url(#glow)"
      />
      <path
        d="M16 16L4 23L16 30L28 23L16 16Z"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        fill="none"
        filter="url(#glow)"
      />
      <circle
        cx="16"
        cy="16"
        r="4"
        fill="url(#logoGradient)"
        filter="url(#glow)"
      />
    </svg>
  );
};

export default OrphiChainLogo; 