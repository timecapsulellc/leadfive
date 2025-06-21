import React from 'react';
import './PageWrapper.css';

const PageWrapper = ({ children, className = '' }) => {
  return (
    <div className={`page-wrapper ${className}`}>
      <div className="page-background">
        <div className="animated-bg"></div>
        <div className="gradient-overlay"></div>
        <div className="grid-pattern"></div>
      </div>
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
