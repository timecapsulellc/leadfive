/**
 * Provider Health Monitor Component
 * Displays real-time status of all RPC providers for monitoring and debugging
 */

import React, { useState, useEffect } from 'react';
import { useMultiProviderWeb3 } from '../hooks/useMultiProviderWeb3';
import './ProviderHealthMonitor.css';

const ProviderHealthMonitor = ({ compact = false }) => {
  const { providerHealth, checkProviderHealth, isConnected } =
    useMultiProviderWeb3();
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        await checkProviderHealth();
        setLastUpdate(Date.now());
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, checkProviderHealth]);

  const handleManualRefresh = async () => {
    try {
      await checkProviderHealth();
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Manual health check failed:', error);
    }
  };

  const formatResponseTime = time => {
    if (!time) return 'N/A';
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };

  const formatLastChecked = timestamp => {
    if (!timestamp) return 'Never';
    const ago = Date.now() - timestamp;
    if (ago < 60000) return `${Math.floor(ago / 1000)}s ago`;
    if (ago < 3600000) return `${Math.floor(ago / 60000)}m ago`;
    return `${Math.floor(ago / 3600000)}h ago`;
  };

  const getHealthColor = (healthy, errorCount) => {
    if (!healthy) return '#ef4444'; // Red
    if (errorCount > 2) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  const getOverallHealthStatus = () => {
    if (!providerHealth) return 'unknown';
    const { healthyCount, totalCount } = providerHealth;
    if (healthyCount === 0) return 'critical';
    if (healthyCount < totalCount / 2) return 'warning';
    if (healthyCount === totalCount) return 'excellent';
    return 'good';
  };

  const getOverallHealthColor = () => {
    const status = getOverallHealthStatus();
    switch (status) {
      case 'excellent':
        return '#10b981';
      case 'good':
        return '#06b6d4';
      case 'warning':
        return '#f59e0b';
      case 'critical':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (compact) {
    return (
      <div className="provider-health-compact">
        <div
          className="health-indicator"
          style={{ backgroundColor: getOverallHealthColor() }}
          title={`Provider Health: ${getOverallHealthStatus().toUpperCase()}`}
        >
          <span className="health-text">
            {providerHealth
              ? `${providerHealth.healthyCount}/${providerHealth.totalCount}`
              : '?/?'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-health-monitor">
      <div className="health-header">
        <div className="health-title">
          <h3>🌐 RPC Provider Health Status</h3>
          <div className="connection-status">
            <span
              className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}
            ></span>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        <div className="health-controls">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <button
            className="refresh-btn"
            onClick={handleManualRefresh}
            title="Refresh provider health"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {providerHealth && (
        <div className="health-overview">
          <div className="overview-stat">
            <span className="stat-label">Healthy Providers:</span>
            <span className="stat-value">
              {providerHealth.healthyCount}/{providerHealth.totalCount}
            </span>
          </div>
          <div className="overview-stat">
            <span className="stat-label">Overall Status:</span>
            <span
              className="stat-value"
              style={{ color: getOverallHealthColor() }}
            >
              {getOverallHealthStatus().toUpperCase()}
            </span>
          </div>
          <div className="overview-stat">
            <span className="stat-label">Last Updated:</span>
            <span className="stat-value">{formatLastChecked(lastUpdate)}</span>
          </div>
        </div>
      )}

      <div className="providers-list">
        {providerHealth?.providers.map((provider, index) => (
          <div
            key={index}
            className={`provider-card ${provider.healthy ? 'healthy' : 'unhealthy'}`}
          >
            <div className="provider-header">
              <div className="provider-name">
                <div
                  className="health-dot"
                  style={{
                    backgroundColor: getHealthColor(
                      provider.healthy,
                      provider.errorCount
                    ),
                  }}
                ></div>
                <span className="name">{provider.name}</span>
              </div>
              <div className="provider-status">
                {provider.healthy ? '✅ Healthy' : '❌ Unhealthy'}
              </div>
            </div>

            <div className="provider-metrics">
              <div className="metric">
                <span className="metric-label">Response Time:</span>
                <span className="metric-value">
                  {formatResponseTime(provider.responseTime)}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Error Count:</span>
                <span className="metric-value">{provider.errorCount}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Last Checked:</span>
                <span className="metric-value">
                  {formatLastChecked(provider.lastChecked)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!providerHealth || providerHealth.providers.length === 0) && (
        <div className="no-providers">
          <p>No provider data available. Initializing...</p>
        </div>
      )}
    </div>
  );
};

export default ProviderHealthMonitor;
