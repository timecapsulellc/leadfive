/**
 * Offline Indicator Component
 * Shows network status and offline capabilities
 */

import React, { useState, useEffect } from 'react';
import PWAManager from '../services/PWAManager';
import './OfflineIndicator.css';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDetails, setShowDetails] = useState(false);
  const [pwaStatus, setPwaStatus] = useState({});

  useEffect(() => {
    // Listen to PWA manager events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    PWAManager.on('online', handleOnline);
    PWAManager.on('offline', handleOffline);

    // Get initial PWA status
    PWAManager.getStatus().then(setPwaStatus);

    return () => {
      PWAManager.off('online', handleOnline);
      PWAManager.off('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleInstall = () => {
    PWAManager.promptInstall();
  };

  const handleUpdate = () => {
    PWAManager.applyUpdate();
  };

  if (isOnline && !pwaStatus.updateAvailable && !pwaStatus.canInstall) {
    return null; // Don't show when online and no actions needed
  }

  return (
    <div className={`offline-indicator ${isOnline ? 'online' : 'offline'}`}>
      <div className="indicator-main" onClick={() => setShowDetails(!showDetails)}>
        <div className="status-icon">
          {isOnline ? '🌐' : '📡'}
        </div>
        <div className="status-text">
          {isOnline ? 'Online' : 'Offline'}
        </div>
        {(pwaStatus.updateAvailable || pwaStatus.canInstall) && (
          <div className="notification-badge">!</div>
        )}
      </div>

      {showDetails && (
        <div className="indicator-details">
          <div className="detail-header">
            <h4>Connection Status</h4>
            <button 
              className="close-details"
              onClick={() => setShowDetails(false)}
            >
              ×
            </button>
          </div>

          <div className="status-info">
            <div className="info-row">
              <span className="info-label">Network:</span>
              <span className={`info-value ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Offline Mode:</span>
              <span className="info-value">
                {pwaStatus.serviceWorkerRegistered ? 'Available' : 'Unavailable'}
              </span>
            </div>

            {pwaStatus.isStandalone && (
              <div className="info-row">
                <span className="info-label">App Mode:</span>
                <span className="info-value">Installed</span>
              </div>
            )}
          </div>

          <div className="action-buttons">
            {!isOnline && (
              <button className="action-btn retry" onClick={handleRefresh}>
                🔄 Retry Connection
              </button>
            )}

            {pwaStatus.canInstall && (
              <button className="action-btn install" onClick={handleInstall}>
                📱 Install App
              </button>
            )}

            {pwaStatus.updateAvailable && (
              <button className="action-btn update" onClick={handleUpdate}>
                ⬆️ Update Available
              </button>
            )}
          </div>

          {!isOnline && (
            <div className="offline-features">
              <h5>Available Offline:</h5>
              <ul>
                <li>✓ View cached dashboard data</li>
                <li>✓ Browse referral information</li>
                <li>✓ Access help and documentation</li>
                <li>⚠️ Limited: Real-time data updates</li>
                <li>⚠️ Limited: New transactions</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;