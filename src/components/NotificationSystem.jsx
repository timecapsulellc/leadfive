import React, { useState, useEffect } from 'react';
import './NotificationSystem.css';

const NotificationSystem = ({ account, provider }) => {
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Mock notifications - replace with real data
  const mockNotifications = [
    {
      id: 1,
      type: 'earning',
      title: 'New Referral Bonus',
      message: 'You earned $25 from a new referral!',
      timestamp: new Date().toISOString(),
      read: false,
      icon: '💰'
    },
    {
      id: 2,
      type: 'system',
      title: 'Smart Contract Update',
      message: 'LeadFive contract has been upgraded with new features.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      icon: '🔄'
    },
    {
      id: 3,
      type: 'referral',
      title: 'Team Growth',
      message: 'Your team has grown to 156 members!',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true,
      icon: '👥'
    },
    {
      id: 4,
      type: 'withdrawal',
      title: 'Withdrawal Processed',
      message: 'Your withdrawal of $500 USDT has been completed.',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      read: true,
      icon: '✅'
    }
  ];

  useEffect(() => {
    if (account) {
      setNotifications(mockNotifications);
    }
  }, [account]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'earning': return 'notification-earning';
      case 'system': return 'notification-system';
      case 'referral': return 'notification-referral';
      case 'withdrawal': return 'notification-withdrawal';
      default: return 'notification-default';
    }
  };

  if (!account) return null;

  return (
    <div className="notification-system">
      <button 
        className={`notification-trigger ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsVisible(!isVisible)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isVisible && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button 
                  className="action-btn mark-all"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </button>
              )}
              <button 
                className="action-btn clear-all"
                onClick={clearNotifications}
                title="Clear all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
              <button 
                className="action-btn close"
                onClick={() => setIsVisible(false)}
                title="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <span className="no-notif-icon">🔔</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-item ${getNotificationStyle(notification.type)} ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {notification.icon}
                  </div>
                  <div className="notification-content">
                    <h4 className="notification-title">{notification.title}</h4>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{formatTime(notification.timestamp)}</span>
                  </div>
                  {!notification.read && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
