import React, { useState, useEffect } from 'react';
import wsService from '../services/WebSocketService';
import './RealtimeStatus.css';

// Unique ID generator to prevent duplicate keys
let notificationCounter = 0;
const generateUniqueId = () => {
  return `${Date.now()}_${++notificationCounter}`;
};

const RealtimeStatus = ({ onUpdate }) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen to connection events
    const handleConnected = () => {
      setConnectionStatus('connected');
    };

    const handleDisconnected = () => {
      setConnectionStatus('disconnected');
    };

    const handleError = (error) => {
      setConnectionStatus('error');
      console.error('WebSocket error:', error);
    };

    // Listen to data updates
    const handleUserUpdate = (data) => {
      setLastUpdate({ type: 'User Update', time: new Date(), data });
      setUpdateCount(prev => prev + 1);
      addNotification('User data updated', 'info');
      if (onUpdate) onUpdate('user_updated', data);
    };

    const handleTreeUpdate = (data) => {
      setLastUpdate({ type: 'Tree Update', time: new Date(), data });
      setUpdateCount(prev => prev + 1);
      addNotification('Network tree updated', 'info');
      if (onUpdate) onUpdate('tree_updated', data);
    };

    const handleEarningsUpdate = (data) => {
      setLastUpdate({ type: 'Earnings Update', time: new Date(), data });
      setUpdateCount(prev => prev + 1);
      addNotification(`Earnings updated: $${data.earnings?.totalEarned?.toFixed(2) || '0.00'}`, 'success');
      if (onUpdate) onUpdate('earnings_updated', data);
    };

    const handleNewReferral = (data) => {
      setLastUpdate({ type: 'New Referral', time: new Date(), data });
      setUpdateCount(prev => prev + 1);
      addNotification(`New referral from ${data.sponsor?.substring(0, 8)}...`, 'success');
      if (onUpdate) onUpdate('new_referral', data);
    };

    const handleNetworkStats = (data) => {
      setLastUpdate({ type: 'Network Stats', time: new Date(), data });
      setUpdateCount(prev => prev + 1);
      if (onUpdate) onUpdate('network_stats', data);
    };

    // Add event listeners
    wsService.on(wsService.events.CONNECTED, handleConnected);
    wsService.on(wsService.events.DISCONNECTED, handleDisconnected);
    wsService.on(wsService.events.ERROR, handleError);
    wsService.on(wsService.events.USER_UPDATED, handleUserUpdate);
    wsService.on(wsService.events.TREE_UPDATED, handleTreeUpdate);
    wsService.on(wsService.events.EARNINGS_UPDATED, handleEarningsUpdate);
    wsService.on(wsService.events.NEW_REFERRAL, handleNewReferral);
    wsService.on(wsService.events.NETWORK_STATS, handleNetworkStats);

    // Start demo updates if in development
    if (process.env.NODE_ENV === 'development' && wsService.simulateUpdates) {
      wsService.simulateUpdates();
    }

    // Cleanup
    return () => {
      wsService.removeListener(wsService.events.CONNECTED, handleConnected);
      wsService.removeListener(wsService.events.DISCONNECTED, handleDisconnected);
      wsService.removeListener(wsService.events.ERROR, handleError);
      wsService.removeListener(wsService.events.USER_UPDATED, handleUserUpdate);
      wsService.removeListener(wsService.events.TREE_UPDATED, handleTreeUpdate);
      wsService.removeListener(wsService.events.EARNINGS_UPDATED, handleEarningsUpdate);
      wsService.removeListener(wsService.events.NEW_REFERRAL, handleNewReferral);
      wsService.removeListener(wsService.events.NETWORK_STATS, handleNetworkStats);
    };
  }, [onUpdate]);

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: generateUniqueId(),
      message,
      type,
      timestamp: new Date()
    };

    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 notifications

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        );
      case 'disconnected':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        );
      case 'error':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          </svg>
        );
      default:
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        );
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live Updates Active';
      case 'disconnected':
        return 'Real-time Disconnected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Connecting...';
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <>
      <div className={`realtime-status ${connectionStatus}`}>
        <div className="status-indicator">
          <div className="status-icon">
            {getStatusIcon()}
          </div>
          <div className="status-text">
            <span className="status-label">{getStatusText()}</span>
            {lastUpdate && (
              <span className="last-update">
                Last: {formatTime(lastUpdate.time)}
              </span>
            )}
          </div>
        </div>
        
        {updateCount > 0 && (
          <div className="update-counter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
            </svg>
            <span>{updateCount}</span>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      <div className="notification-container">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification ${notification.type}`}
          >
            <div className="notification-content">
              <span className="notification-message">{notification.message}</span>
              <span className="notification-time">{formatTime(notification.timestamp)}</span>
            </div>
            <button 
              className="notification-close"
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default RealtimeStatus;
