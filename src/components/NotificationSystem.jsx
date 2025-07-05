import React from 'react';
import {
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from 'react-icons/fa';

const NotificationSystem = ({ notifications = [] }) => {
  // Mock notifications if none provided
  const mockNotifications = [
    {
      id: 1,
      type: 'success',
      message: 'Your direct referral earned you a 40% commission of $20.00',
      read: false,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      icon: FaCheckCircle,
    },
    {
      id: 2,
      type: 'warning',
      message: 'Your package is nearing its earning limit (80% reached)',
      read: false,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      icon: FaExclamationTriangle,
    },
    {
      id: 3,
      type: 'info',
      message: 'Weekly Help Pool distribution starts in 2 days',
      read: true,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      icon: FaInfoCircle,
    },
  ];

  const displayNotifications =
    notifications.length > 0 ? notifications : mockNotifications;
  const unreadCount = displayNotifications.filter(n => !n.read).length;

  // Format timestamp
  const formatTimestamp = timestamp => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="notification-system-container">
      <div className="notification-header">
        <h3 className="section-title">
          <FaBell /> Notifications
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </h3>

        <div className="notification-actions">
          <button className="mark-all-read-btn">Mark All Read</button>
        </div>
      </div>

      <div className="notification-list">
        {displayNotifications.length > 0 ? (
          displayNotifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}`}
            >
              <div className="notification-icon">
                {React.createElement(notification.icon)}
              </div>
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {formatTimestamp(notification.timestamp)}
                </span>
              </div>
              {!notification.read && <div className="unread-indicator"></div>}
            </div>
          ))
        ) : (
          <div className="no-notifications">
            <p>No notifications to display</p>
          </div>
        )}
      </div>

      <div className="notification-footer">
        <button className="view-all-notifications-btn">
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationSystem;
