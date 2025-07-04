import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaBolt, 
  FaUsers, 
  FaDollarSign,
  FaNetworkWired,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaRedo,
  FaEye
} from 'react-icons/fa';

const RealTimeStats = ({ dashboardData, userStats, className = '' }) => {
  const [realTimeData, setRealTimeData] = useState({
    networkActivity: 94,
    activeMembers: dashboardData?.daoParticipants || 0,
    transactionsToday: Math.floor(Math.random() * 150) + 50,
    volumeToday: Math.floor(Math.random() * 50000) + 25000,
    newRegistrations: Math.floor(Math.random() * 20) + 5,
    packageUpgrades: Math.floor(Math.random() * 15) + 3,
    withdrawalsProcessed: Math.floor(Math.random() * 30) + 10,
    teamGrowthRate: 12.5,
    earningsVelocity: 284,
    networkHealth: dashboardData?.protocolHealth || 95
  });

  const [performanceMetrics, setPerformanceMetrics] = useState({
    dailyGrowth: 3.2,
    weeklyGrowth: 18.7,
    monthlyGrowth: 42.3,
    teamActivity: 96,
    conversionRate: 8.4,
    retentionRate: 91.2
  });

  const [liveUpdates, setLiveUpdates] = useState([
    { id: 1, type: 'registration', message: 'New member joined Package Level 3', time: '2 min ago', trend: 'up' },
    { id: 2, type: 'upgrade', message: 'Member upgraded to Package Level 5', time: '5 min ago', trend: 'up' },
    { id: 3, type: 'withdrawal', message: 'Withdrawal processed: $234.50', time: '8 min ago', trend: 'neutral' },
    { id: 4, type: 'team', message: 'Your team gained 3 new members', time: '12 min ago', trend: 'up' }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update metrics with slight variations
      setRealTimeData(prev => ({
        ...prev,
        networkActivity: Math.max(85, Math.min(100, prev.networkActivity + (Math.random() - 0.5) * 4)),
        transactionsToday: prev.transactionsToday + Math.floor(Math.random() * 3),
        volumeToday: prev.volumeToday + Math.floor(Math.random() * 1000),
        newRegistrations: prev.newRegistrations + (Math.random() > 0.7 ? 1 : 0),
        packageUpgrades: prev.packageUpgrades + (Math.random() > 0.8 ? 1 : 0),
        withdrawalsProcessed: prev.withdrawalsProcessed + (Math.random() > 0.9 ? 1 : 0),
        earningsVelocity: Math.max(200, Math.min(400, prev.earningsVelocity + (Math.random() - 0.5) * 20))
      }));

      setPerformanceMetrics(prev => ({
        ...prev,
        teamActivity: Math.max(90, Math.min(100, prev.teamActivity + (Math.random() - 0.5) * 2)),
        conversionRate: Math.max(5, Math.min(15, prev.conversionRate + (Math.random() - 0.5) * 0.5))
      }));

      // Add new live update occasionally
      if (Math.random() > 0.6) {
        const updates = [
          { type: 'registration', message: 'New member joined the network', trend: 'up' },
          { type: 'upgrade', message: 'Package upgrade completed', trend: 'up' },
          { type: 'withdrawal', message: `Withdrawal processed: $${(Math.random() * 500 + 100).toFixed(2)}`, trend: 'neutral' },
          { type: 'team', message: 'Team structure updated', trend: 'up' },
          { type: 'bonus', message: 'Binary commission earned', trend: 'up' }
        ];
        
        const newUpdate = updates[Math.floor(Math.random() * updates.length)];
        setLiveUpdates(prev => [
          {
            id: Date.now(),
            ...newUpdate,
            time: 'Just now'
          },
          ...prev.slice(0, 4) // Keep only 5 most recent
        ]);
      }
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <FaArrowUp className="trend-up" />;
      case 'down': return <FaArrowDown className="trend-down" />;
      default: return <FaEquals className="trend-neutral" />;
    }
  };

  const getUpdateTypeIcon = (type) => {
    switch (type) {
      case 'registration': return <FaUsers />;
      case 'upgrade': return <FaArrowUp />;
      case 'withdrawal': return <FaDollarSign />;
      case 'team': return <FaNetworkWired />;
      case 'bonus': return <FaBolt />;
      default: return <FaEye />;
    }
  };

  return (
    <div className={`real-time-stats ${className}`}>
      <div className="stats-header">
        <div className="header-info">
          <FaChartLine className="header-icon" />
          <div>
            <h3>Real-Time Network Statistics</h3>
            <span className="update-indicator">Live Updates • Every 15s</span>
          </div>
        </div>
        <div className="stats-controls">
          <div className="activity-pulse">
            <div className="pulse-dot"></div>
            <span>Live</span>
          </div>
        </div>
      </div>

      <div className="stats-content">
        {/* Key Metrics Grid */}
        <div className="key-metrics-grid">
          <div className="metric-card">
            <div className="metric-icon network">
              <FaNetworkWired />
            </div>
            <div className="metric-info">
              <span className="metric-label">Network Activity</span>
              <span className="metric-value">{realTimeData.networkActivity.toFixed(1)}%</span>
              <span className="metric-trend positive">
                <FaArrowUp /> +2.3%
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon members">
              <FaUsers />
            </div>
            <div className="metric-info">
              <span className="metric-label">Active Members</span>
              <span className="metric-value">{(realTimeData.activeMembers || 0).toLocaleString()}</span>
              <span className="metric-trend positive">
                <FaArrowUp /> Online
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon transactions">
              <FaBolt />
            </div>
            <div className="metric-info">
              <span className="metric-label">Today's Transactions</span>
              <span className="metric-value">{realTimeData.transactionsToday}</span>
              <span className="metric-trend positive">
                <FaArrowUp /> +{Math.floor(Math.random() * 5) + 1}
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon volume">
              <FaDollarSign />
            </div>
            <div className="metric-info">
              <span className="metric-label">Volume Today</span>
              <span className="metric-value">${(realTimeData.volumeToday || 0).toLocaleString()}</span>
              <span className="metric-trend positive">
                <FaArrowUp /> +12.4%
              </span>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="performance-section">
          <h4>Performance Indicators</h4>
          <div className="performance-grid">
            <div className="performance-item">
              <span className="perf-label">Team Growth Rate</span>
              <div className="perf-bar">
                <div className="perf-fill" style={{ width: `${Math.min(100, realTimeData.teamGrowthRate * 8)}%` }}></div>
              </div>
              <span className="perf-value">{realTimeData.teamGrowthRate.toFixed(1)}%</span>
            </div>

            <div className="performance-item">
              <span className="perf-label">Earnings Velocity</span>
              <div className="perf-bar">
                <div className="perf-fill" style={{ width: `${Math.min(100, (realTimeData.earningsVelocity / 400) * 100)}%` }}></div>
              </div>
              <span className="perf-value">{realTimeData.earningsVelocity}</span>
            </div>

            <div className="performance-item">
              <span className="perf-label">Network Health</span>
              <div className="perf-bar">
                <div className="perf-fill health" style={{ width: `${realTimeData.networkHealth}%` }}></div>
              </div>
              <span className="perf-value">{realTimeData.networkHealth}%</span>
            </div>
          </div>
        </div>

        {/* Today's Highlights */}
        <div className="daily-highlights">
          <h4>Today's Highlights</h4>
          <div className="highlights-grid">
            <div className="highlight-item">
              <FaUsers className="highlight-icon registrations" />
              <div className="highlight-info">
                <span className="highlight-number">{realTimeData.newRegistrations}</span>
                <span className="highlight-label">New Registrations</span>
              </div>
            </div>

            <div className="highlight-item">
              <FaArrowUp className="highlight-icon upgrades" />
              <div className="highlight-info">
                <span className="highlight-number">{realTimeData.packageUpgrades}</span>
                <span className="highlight-label">Package Upgrades</span>
              </div>
            </div>

            <div className="highlight-item">
              <FaDollarSign className="highlight-icon withdrawals" />
              <div className="highlight-info">
                <span className="highlight-number">{realTimeData.withdrawalsProcessed}</span>
                <span className="highlight-label">Withdrawals Processed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="live-activity">
          <div className="activity-header">
            <h4>Live Activity Feed</h4>
            <div className="activity-status">
              <div className="status-dot live"></div>
              <span>Live</span>
            </div>
          </div>
          
          <div className="activity-feed">
            {(liveUpdates || []).map((update) => (
              <div key={update.id} className="activity-item">
                <div className="activity-icon">
                  {getUpdateTypeIcon(update.type)}
                </div>
                <div className="activity-content">
                  <span className="activity-message">{update.message}</span>
                  <span className="activity-time">
                    <FaClock />
                    {update.time}
                  </span>
                </div>
                <div className="activity-trend">
                  {getTrendIcon(update.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeStats;
