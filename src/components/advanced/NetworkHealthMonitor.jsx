import React, { useState, useEffect } from 'react';
import {
  FaHeartbeat,
  FaShieldAlt,
  FaNetworkWired,
  FaServer,
  FaGlobe,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaChartLine,
  FaClock,
  FaRedo,
  FaInfoCircle,
} from 'react-icons/fa';

const NetworkHealthMonitor = ({ dashboardData, className = '' }) => {
  const [healthMetrics, setHealthMetrics] = useState({
    overall: dashboardData?.protocolHealth || 96,
    contractStatus: 'Operational',
    networkLatency: '45ms',
    transactionSuccess: 98.7,
    nodeUptime: 99.9,
    gasEfficiency: 94.2,
    securityScore: 98.5,
    lastUpdate: new Date(),
  });

  const [systemComponents, setSystemComponents] = useState([
    {
      name: 'Smart Contract',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: '120ms',
      description: 'LeadFive main contract operations',
    },
    {
      name: 'BSC Network',
      status: 'healthy',
      uptime: '99.8%',
      responseTime: '45ms',
      description: 'Binance Smart Chain connectivity',
    },
    {
      name: 'USDT Contract',
      status: 'healthy',
      uptime: '100%',
      responseTime: '89ms',
      description: 'USDT token contract status',
    },
    {
      name: 'Referral System',
      status: 'healthy',
      uptime: '99.7%',
      responseTime: '67ms',
      description: 'Referral tracking & rewards',
    },
    {
      name: 'Binary Tree',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: '156ms',
      description: 'Binary commission calculations',
    },
    {
      name: 'Withdrawal System',
      status: 'warning',
      uptime: '98.2%',
      responseTime: '234ms',
      description: 'Automated withdrawal processing',
    },
  ]);

  const [networkStats, setNetworkStats] = useState({
    totalNodes: 1247,
    activeNodes: 1198,
    totalTransactions: 45692,
    blocksProcessed: 2847,
    averageBlockTime: '3.2s',
    networkFees: '$0.08',
    congestionLevel: 'Low',
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'info',
      title: 'Network Optimization Complete',
      message: 'Gas efficiency improved by 4.2% over the last 24 hours',
      timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
      resolved: false,
    },
    {
      id: 2,
      type: 'warning',
      title: 'High Withdrawal Volume',
      message:
        'Withdrawal processing may take slightly longer due to high demand',
      timestamp: new Date(Date.now() - 120 * 60000), // 2 hours ago
      resolved: false,
    },
  ]);

  // Simulate real-time health monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthMetrics(prev => ({
        ...prev,
        overall: Math.max(
          92,
          Math.min(100, prev.overall + (Math.random() - 0.5) * 2)
        ),
        transactionSuccess: Math.max(
          95,
          Math.min(100, prev.transactionSuccess + (Math.random() - 0.5) * 0.5)
        ),
        nodeUptime: Math.max(
          98,
          Math.min(100, prev.nodeUptime + (Math.random() - 0.5) * 0.1)
        ),
        gasEfficiency: Math.max(
          85,
          Math.min(100, prev.gasEfficiency + (Math.random() - 0.5) * 1)
        ),
        securityScore: Math.max(
          95,
          Math.min(100, prev.securityScore + (Math.random() - 0.5) * 0.3)
        ),
        lastUpdate: new Date(),
      }));

      // Occasionally update system components
      if (Math.random() > 0.7) {
        setSystemComponents(prev =>
          (prev || []).map(component => ({
            ...component,
            responseTime: `${Math.floor(Math.random() * 150 + 50)}ms`,
            uptime: `${(99 + Math.random()).toFixed(1)}%`,
          }))
        );
      }

      // Update network stats
      setNetworkStats(prev => ({
        ...prev,
        totalTransactions:
          prev.totalTransactions + Math.floor(Math.random() * 5),
        activeNodes: Math.max(
          1150,
          Math.min(1250, prev.activeNodes + Math.floor(Math.random() * 6 - 3))
        ),
        averageBlockTime: `${(3 + Math.random() * 0.5).toFixed(1)}s`,
        networkFees: `$${(0.05 + Math.random() * 0.1).toFixed(3)}`,
      }));
    }, 20000); // Update every 20 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = status => {
    switch (status) {
      case 'healthy':
        return <FaCheckCircle className="status-healthy" />;
      case 'warning':
        return <FaExclamationTriangle className="status-warning" />;
      case 'error':
        return <FaTimesCircle className="status-error" />;
      default:
        return <FaInfoCircle className="status-info" />;
    }
  };

  const getAlertIcon = type => {
    switch (type) {
      case 'error':
        return <FaTimesCircle className="alert-error" />;
      case 'warning':
        return <FaExclamationTriangle className="alert-warning" />;
      case 'info':
        return <FaInfoCircle className="alert-info" />;
      default:
        return <FaCheckCircle className="alert-success" />;
    }
  };

  const getHealthColor = score => {
    if (score >= 95) return 'excellent';
    if (score >= 90) return 'good';
    if (score >= 80) return 'fair';
    return 'poor';
  };

  return (
    <div className={`network-health-monitor ${className}`}>
      <div className="health-header">
        <div className="header-info">
          <FaHeartbeat className="header-icon" />
          <div>
            <h3>Network Health Monitor</h3>
            <span className="last-update">
              Last updated:{' '}
              {(healthMetrics.lastUpdate || new Date()).toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div className="health-score">
          <div
            className={`score-circle ${getHealthColor(healthMetrics.overall)}`}
          >
            <span className="score-number">
              {healthMetrics.overall.toFixed(1)}%
            </span>
            <span className="score-label">Overall Health</span>
          </div>
        </div>
      </div>

      <div className="health-content">
        {/* Key Health Metrics */}
        <div className="health-metrics-grid">
          <div className="health-metric">
            <div className="metric-icon security">
              <FaShieldAlt />
            </div>
            <div className="metric-info">
              <span className="metric-label">Security Score</span>
              <span className="metric-value">
                {healthMetrics.securityScore.toFixed(1)}%
              </span>
              <div className="metric-bar">
                <div
                  className="metric-fill security"
                  style={{ width: `${healthMetrics.securityScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="health-metric">
            <div className="metric-icon performance">
              <FaChartLine />
            </div>
            <div className="metric-info">
              <span className="metric-label">Transaction Success</span>
              <span className="metric-value">
                {healthMetrics.transactionSuccess.toFixed(1)}%
              </span>
              <div className="metric-bar">
                <div
                  className="metric-fill performance"
                  style={{ width: `${healthMetrics.transactionSuccess}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="health-metric">
            <div className="metric-icon uptime">
              <FaClock />
            </div>
            <div className="metric-info">
              <span className="metric-label">Node Uptime</span>
              <span className="metric-value">
                {healthMetrics.nodeUptime.toFixed(1)}%
              </span>
              <div className="metric-bar">
                <div
                  className="metric-fill uptime"
                  style={{ width: `${healthMetrics.nodeUptime}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="health-metric">
            <div className="metric-icon efficiency">
              <FaRedo />
            </div>
            <div className="metric-info">
              <span className="metric-label">Gas Efficiency</span>
              <span className="metric-value">
                {healthMetrics.gasEfficiency.toFixed(1)}%
              </span>
              <div className="metric-bar">
                <div
                  className="metric-fill efficiency"
                  style={{ width: `${healthMetrics.gasEfficiency}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* System Components Status */}
        <div className="system-components">
          <h4>System Components Status</h4>
          <div className="components-grid">
            {(systemComponents || []).map((component, index) => (
              <div key={index} className="component-card">
                <div className="component-header">
                  <div className="component-status">
                    {getStatusIcon(component.status)}
                    <span className="component-name">{component.name}</span>
                  </div>
                  <span className="component-uptime">{component.uptime}</span>
                </div>
                <div className="component-details">
                  <div className="component-metric">
                    <span className="metric-label">Response Time:</span>
                    <span className="metric-value">
                      {component.responseTime}
                    </span>
                  </div>
                  <p className="component-description">
                    {component.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Network Statistics */}
        <div className="network-statistics">
          <h4>Network Statistics</h4>
          <div className="network-stats-grid">
            <div className="stat-item">
              <FaServer className="stat-icon" />
              <div className="stat-info">
                <span className="stat-label">Active Nodes</span>
                <span className="stat-value">
                  {networkStats.activeNodes} / {networkStats.totalNodes}
                </span>
              </div>
            </div>

            <div className="stat-item">
              <FaNetworkWired className="stat-icon" />
              <div className="stat-info">
                <span className="stat-label">Total Transactions</span>
                <span className="stat-value">
                  {(networkStats.totalTransactions || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="stat-item">
              <FaClock className="stat-icon" />
              <div className="stat-info">
                <span className="stat-label">Avg Block Time</span>
                <span className="stat-value">
                  {networkStats.averageBlockTime}
                </span>
              </div>
            </div>

            <div className="stat-item">
              <FaGlobe className="stat-icon" />
              <div className="stat-info">
                <span className="stat-label">Network Fees</span>
                <span className="stat-value">{networkStats.networkFees}</span>
              </div>
            </div>
          </div>

          <div className="congestion-indicator">
            <span className="congestion-label">Network Congestion:</span>
            <span
              className={`congestion-status ${networkStats.congestionLevel.toLowerCase()}`}
            >
              {networkStats.congestionLevel}
            </span>
          </div>
        </div>

        {/* System Alerts */}
        {alerts.length > 0 && (
          <div className="system-alerts">
            <h4>System Alerts</h4>
            <div className="alerts-list">
              {(alerts || []).map(alert => (
                <div key={alert.id} className={`alert-item ${alert.type}`}>
                  <div className="alert-icon">{getAlertIcon(alert.type)}</div>
                  <div className="alert-content">
                    <div className="alert-header">
                      <span className="alert-title">{alert.title}</span>
                      <span className="alert-time">
                        {Math.floor((Date.now() - alert.timestamp) / 60000)}m
                        ago
                      </span>
                    </div>
                    <p className="alert-message">{alert.message}</p>
                  </div>
                  {!alert.resolved && (
                    <div className="alert-status">
                      <span className="status-badge active">Active</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkHealthMonitor;
