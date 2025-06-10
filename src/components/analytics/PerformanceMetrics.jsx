import React from 'react';

/**
 * PerformanceMetrics - Shows analytics charts and performance data
 * Props: teamData, compensationData, analyticsData, chartData, deviceInfo
 */
function PerformanceMetrics({ teamData, compensationData, analyticsData, chartData, deviceInfo }) {
  // For demo, just show summary stats and chart placeholders
  return (
    <div className="performance-metrics">
      <h3>Performance Metrics</h3>
      <div className="metrics-summary">
        <span>Team Growth: <b>{teamData.totalMembers}</b></span>
        <span>Total Earnings: <b>${compensationData.totalEarnings.toLocaleString()}</b></span>
        <span>Efficiency: <b>{Math.round((compensationData.totalEarnings / (teamData.totalVolume || 1)) * 100)}%</b></span>
      </div>
      <div className="chart-placeholder">[Team Growth Chart]</div>
      <div className="chart-placeholder">[Performance Chart]</div>
      <div className="chart-placeholder">[Earnings Chart]</div>
    </div>
  );
}

export default PerformanceMetrics;
