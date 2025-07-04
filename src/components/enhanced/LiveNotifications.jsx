import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBell, 
  FaDollarSign, 
  FaUsers, 
  FaGift, 
  FaTrophy,
  FaTrash,
  FaEye,
  FaCog
} from 'react-icons/fa';
import './LiveNotifications.css';

const LiveNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [filter, setFilter] = useState('all');

  // Simulate real-time notifications
  useEffect(() => {
    if (!isLive) return;

    const notificationTypes = [
      {
        type: 'earning',
        icon: FaDollarSign,
        messages: [
          'New referral commission: +$25.50',
          'Matrix spillover received: +$12.75',
          'Level bonus earned: +$8.20',
          'Help pool distribution: +$15.30'
        ],
        color: '#22c55e'
      },
      {
        type: 'referral',
        icon: FaUsers,
        messages: [
          'New team member joined',
          'Direct referral activated',
          'Team member upgraded package',
          'Network milestone reached'
        ],
        color: '#3b82f6'
      },
      {
        type: 'achievement',
        icon: FaTrophy,
        messages: [
          'Achievement unlocked: Team Builder',
          'New rank achieved: Silver Star',
          'Milestone reached: 50 referrals',
          'Bonus eligibility unlocked'
        ],
        color: '#f59e0b'
      },
      {
        type: 'pool',
        icon: FaGift,
        messages: [
          'Help pool distribution started',
          'Leader pool qualification earned',
          'Club pool rewards available',
          'Weekly distribution processed'
        ],
        color: '#8b5cf6'
      }
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance of new notification
        const typeData = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const message = typeData.messages[Math.floor(Math.random() * typeData.messages.length)];
        
        const newNotification = {
          id: Date.now() + Math.random(),
          type: typeData.type,
          icon: typeData.icon,
          message: message,
          amount: typeData.type === 'earning' ? (Math.random() * 50 + 5).toFixed(2) : null,
          timestamp: new Date(),
          color: typeData.color,
          read: false
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep last 20
      }
    }, 3000 + Math.random() * 4000); // Random interval 3-7 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.type === filter;
  });

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="live-notifications">
      <div className="notifications-header">
        <div className="header-left">
          <h3>
            <FaBell />
            Live Activity
            {isLive && <span className="live-indicator">🔴</span>}
          </h3>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        
        <div className="header-controls">
          <button 
            className={`control-btn ${isLive ? 'active' : ''}`}
            onClick={() => setIsLive(!isLive)}
            title={isLive ? 'Pause notifications' : 'Resume notifications'}
          >
            {isLive ? 'Live' : 'Paused'}
          </button>
          
          <button 
            className="control-btn"
            onClick={clearAll}
            title="Clear all notifications"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      <div className="notifications-filters">
        {[
          { key: 'all', label: 'All', icon: FaBell },
          { key: 'earning', label: 'Earnings', icon: FaDollarSign },
          { key: 'referral', label: 'Team', icon: FaUsers },
          { key: 'achievement', label: 'Achievements', icon: FaTrophy },
          { key: 'pool', label: 'Pools', icon: FaGift }
        ].map(filterOption => (
          <button
            key={filterOption.key}
            className={`filter-btn ${filter === filterOption.key ? 'active' : ''}`}
            onClick={() => setFilter(filterOption.key)}
          >
            <filterOption.icon />
            {filterOption.label}
          </button>
        ))}
      </div>

      <div className="notifications-list">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length === 0 ? (
            <motion.div
              className="no-notifications"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FaBell />
              <p>No notifications yet</p>
              <small>Activity will appear here in real-time</small>
            </motion.div>
          ) : (
            filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                className={`notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}`}
                initial={{ opacity: 0, x: -20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300
                }}
                whileHover={{ scale: 1.02 }}
                onClick={() => markAsRead(notification.id)}
              >
                <div 
                  className="notification-icon"
                  style={{ backgroundColor: notification.color }}
                >
                  <notification.icon />
                </div>
                
                <div className="notification-content">
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-time">
                    {notification.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                
                {notification.amount && (
                  <div className="notification-amount">
                    +${notification.amount}
                  </div>
                )}

                {!notification.read && (
                  <div className="unread-indicator"></div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {filteredNotifications.length > 10 && (
        <div className="notifications-footer">
          <button className="view-all-btn">
            <FaEye />
            View All ({notifications.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveNotifications;