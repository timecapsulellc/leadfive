/**
 * Web3 Status Panel Component
 * Shows connection status and provider health information
 * Can be added to dashboard or admin panel
 */

import React, { useState } from 'react';
import { useMultiProviderWeb3 } from '../hooks/useMultiProviderWeb3';
import ProviderHealthMonitor from './ProviderHealthMonitor';
import './Web3StatusPanel.css';

const Web3StatusPanel = ({ showFullDetails = false }) => {
  const {
    isConnected,
    isLoading,
    error,
    account,
    providerHealth,
    connectWallet,
    disconnectWallet,
    checkProviderHealth,
  } = useMultiProviderWeb3();

  const [showDetails, setShowDetails] = useState(showFullDetails);

  const formatAccount = address => {
    if (!address) return 'Not connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getConnectionStatusColor = () => {
    if (isLoading) return '#f59e0b'; // Yellow
    if (error) return '#ef4444'; // Red
    if (isConnected) return '#10b981'; // Green
    return '#6b7280'; // Gray
  };

  const getConnectionStatusText = () => {
    if (isLoading) return 'Connecting...';
    if (error) return 'Connection Error';
    if (isConnected) return 'Connected';
    return 'Disconnected';
  };

  return (
    <div className="web3-status-panel">
      <div className="status-header">
        <div className="status-main">
          <div className="connection-indicator">
            <div
              className="status-dot"
              style={{ backgroundColor: getConnectionStatusColor() }}
            ></div>
            <div className="status-info">
              <span className="status-text">{getConnectionStatusText()}</span>
              <span className="account-text">{formatAccount(account)}</span>
            </div>
          </div>

          {providerHealth && (
            <div className="provider-summary">
              <span className="providers-healthy">
                {providerHealth.healthyCount}/{providerHealth.totalCount}{' '}
                Providers Healthy
              </span>
            </div>
          )}
        </div>

        <div className="status-actions">
          {!isConnected && !isLoading && (
            <button
              className="connect-btn"
              onClick={connectWallet}
              disabled={isLoading}
            >
              Connect Wallet
            </button>
          )}

          {isConnected && account && (
            <button className="disconnect-btn" onClick={disconnectWallet}>
              Disconnect
            </button>
          )}

          <button
            className="details-toggle"
            onClick={() => setShowDetails(!showDetails)}
            title={showDetails ? 'Hide Details' : 'Show Details'}
          >
            {showDetails ? '🔼' : '🔽'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
          <button className="retry-btn" onClick={checkProviderHealth}>
            Retry
          </button>
        </div>
      )}

      {showDetails && (
        <div className="status-details">
          <ProviderHealthMonitor compact={false} />
        </div>
      )}
    </div>
  );
};

export default Web3StatusPanel;
