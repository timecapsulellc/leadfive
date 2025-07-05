import React from 'react';

/**
 * LiveStatsWidget - Displays live TVL, user count, and average deposit
 * Props: liveStats, wsConnected, deviceInfo
 */
function LiveStatsWidget({ liveStats, wsConnected, deviceInfo }) {
  return (
    <div className="live-stats-widget">
      <h3>Live Stats</h3>
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-label">TVL</span>
          <span className="stat-value">${liveStats.tvl.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Users</span>
          <span className="stat-value">{liveStats.userCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Avg Deposit</span>
          <span className="stat-value">${liveStats.avgDeposit.toFixed(2)}</span>
        </div>
      </div>
      <div
        className={`live-indicator ${wsConnected ? 'connected' : 'disconnected'}`}
      ></div>
      <div className="last-updated">
        Last updated: {new Date(liveStats.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}

export default LiveStatsWidget;
