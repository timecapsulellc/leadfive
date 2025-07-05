/**
 * Advanced Skeleton Loading Component
 * Professional loading states for better UX
 */

import React from 'react';
import PropTypes from 'prop-types';
import './AdvancedSkeleton.css';

// Base Skeleton Element
const SkeletonElement = ({
  width = '100%',
  height = '16px',
  borderRadius = '4px',
  className = '',
  animate = true,
}) => (
  <div
    className={`skeleton-element ${animate ? 'skeleton-animate' : ''} ${className}`}
    style={{
      width,
      height,
      borderRadius,
    }}
  />
);

// Dashboard Skeleton
const DashboardSkeleton = () => (
  <div className="skeleton-dashboard">
    {/* Header */}
    <div className="skeleton-header">
      <SkeletonElement width="200px" height="32px" borderRadius="8px" />
      <div className="skeleton-header-actions">
        <SkeletonElement width="80px" height="24px" borderRadius="12px" />
        <SkeletonElement width="60px" height="24px" borderRadius="12px" />
      </div>
    </div>

    {/* Stats Cards */}
    <div className="skeleton-stats-grid">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-card-header">
            <SkeletonElement width="24px" height="24px" borderRadius="6px" />
            <SkeletonElement width="120px" height="16px" />
          </div>
          <SkeletonElement width="80px" height="32px" borderRadius="8px" />
          <SkeletonElement width="100px" height="14px" />
        </div>
      ))}
    </div>

    {/* Chart Area */}
    <div className="skeleton-chart-section">
      <div className="skeleton-chart-header">
        <SkeletonElement width="150px" height="24px" />
        <SkeletonElement width="100px" height="32px" borderRadius="16px" />
      </div>
      <div className="skeleton-chart">
        <SkeletonElement width="100%" height="300px" borderRadius="12px" />
      </div>
    </div>

    {/* Table/List */}
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonElement key={i} width="100px" height="16px" />
        ))}
      </div>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="skeleton-table-row">
          {Array.from({ length: 4 }, (_, j) => (
            <SkeletonElement key={j} width="80px" height="16px" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Chart Skeleton
const ChartSkeleton = ({ height = '300px' }) => (
  <div className="skeleton-chart-container">
    <div className="skeleton-chart-header">
      <SkeletonElement width="200px" height="24px" />
      <div className="skeleton-chart-controls">
        <SkeletonElement width="80px" height="32px" borderRadius="16px" />
        <SkeletonElement width="100px" height="32px" borderRadius="16px" />
      </div>
    </div>
    <div className="skeleton-chart-area">
      {/* Y-axis labels */}
      <div className="skeleton-y-axis">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonElement key={i} width="40px" height="12px" />
        ))}
      </div>
      {/* Chart bars/lines */}
      <div className="skeleton-chart-content" style={{ height }}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="skeleton-bar">
            <SkeletonElement
              width="20px"
              height={`${Math.random() * 80 + 20}%`}
              borderRadius="4px 4px 0 0"
            />
          </div>
        ))}
      </div>
    </div>
    {/* X-axis labels */}
    <div className="skeleton-x-axis">
      {Array.from({ length: 12 }, (_, i) => (
        <SkeletonElement key={i} width="30px" height="12px" />
      ))}
    </div>
  </div>
);

// List Skeleton
const ListSkeleton = ({ items = 5, showAvatar = false }) => (
  <div className="skeleton-list">
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="skeleton-list-item">
        {showAvatar && (
          <SkeletonElement width="40px" height="40px" borderRadius="50%" />
        )}
        <div className="skeleton-list-content">
          <SkeletonElement width="60%" height="16px" />
          <SkeletonElement width="40%" height="14px" />
        </div>
        <SkeletonElement width="80px" height="32px" borderRadius="16px" />
      </div>
    ))}
  </div>
);

// Card Skeleton
const CardSkeleton = ({ hasImage = false, hasActions = true }) => (
  <div className="skeleton-card">
    {hasImage && (
      <SkeletonElement
        width="100%"
        height="160px"
        borderRadius="12px 12px 0 0"
      />
    )}
    <div className="skeleton-card-content">
      <SkeletonElement width="80%" height="20px" />
      <SkeletonElement width="100%" height="14px" />
      <SkeletonElement width="60%" height="14px" />
      {hasActions && (
        <div className="skeleton-card-actions">
          <SkeletonElement width="80px" height="32px" borderRadius="16px" />
          <SkeletonElement width="100px" height="32px" borderRadius="16px" />
        </div>
      )}
    </div>
  </div>
);

// Table Skeleton
const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="skeleton-table">
    <div className="skeleton-table-header">
      {Array.from({ length: columns }, (_, i) => (
        <SkeletonElement key={i} width="120px" height="16px" />
      ))}
    </div>
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="skeleton-table-row">
        {Array.from({ length: columns }, (_, j) => (
          <SkeletonElement key={j} width="100px" height="16px" />
        ))}
      </div>
    ))}
  </div>
);

// Navigation Skeleton
const NavigationSkeleton = () => (
  <div className="skeleton-navigation">
    <div className="skeleton-nav-brand">
      <SkeletonElement width="120px" height="32px" borderRadius="8px" />
    </div>
    <div className="skeleton-nav-items">
      {Array.from({ length: 5 }, (_, i) => (
        <SkeletonElement key={i} width="80px" height="16px" />
      ))}
    </div>
    <div className="skeleton-nav-user">
      <SkeletonElement width="32px" height="32px" borderRadius="50%" />
      <SkeletonElement width="60px" height="16px" />
    </div>
  </div>
);

// Main AdvancedSkeleton Component
const AdvancedSkeleton = ({
  variant = 'dashboard',
  animated = true,
  className = '',
  ...props
}) => {
  const variants = {
    dashboard: <DashboardSkeleton {...props} />,
    chart: <ChartSkeleton {...props} />,
    list: <ListSkeleton {...props} />,
    card: <CardSkeleton {...props} />,
    table: <TableSkeleton {...props} />,
    navigation: <NavigationSkeleton {...props} />,
  };

  return (
    <div
      className={`skeleton-container ${animated ? 'skeleton-animated' : ''} ${className}`}
    >
      {variants[variant] || variants.dashboard}
    </div>
  );
};

AdvancedSkeleton.propTypes = {
  variant: PropTypes.oneOf([
    'dashboard',
    'chart',
    'list',
    'card',
    'table',
    'navigation',
  ]),
  animated: PropTypes.bool,
  className: PropTypes.string,
};

// Export individual components for flexibility
export {
  SkeletonElement,
  DashboardSkeleton,
  ChartSkeleton,
  ListSkeleton,
  CardSkeleton,
  TableSkeleton,
  NavigationSkeleton,
};

export default AdvancedSkeleton;
