import React from 'react';
import { 
  FaHistory, 
  FaUserPlus, 
  FaDollarSign, 
  FaExchangeAlt, 
  FaTrophy, 
  FaGift 
} from 'react-icons/fa';

const ActivityFeed = ({ activities = [] }) => {
  // Mock activities if none provided
  const mockActivities = [
    {
      id: 1,
      type: 'referral',
      description: 'New user 0x123...4567 joined your direct referrals',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      icon: FaUserPlus,
      amount: null
    },
    {
      id: 2,
      type: 'commission',
      description: 'You received a direct referral commission',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      icon: FaDollarSign,
      amount: 20.00
    },
    {
      id: 3,
      type: 'withdrawal',
      description: 'Withdrawal processed successfully',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      icon: FaExchangeAlt,
      amount: 150.00
    },
    {
      id: 4,
      type: 'achievement',
      description: 'You reached Community Level 2!',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      icon: FaTrophy,
      amount: null
    },
    {
      id: 5,
      type: 'bonus',
      description: 'Help Pool distribution completed',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      icon: FaGift,
      amount: 35.25
    }
  ];
  
  const displayActivities = activities.length > 0 ? activities : mockActivities;
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
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
    <div className="activity-feed-container">
      <h3 className="section-title">
        <FaHistory /> Recent Activity
      </h3>
      
      <div className="activity-list">
        {displayActivities.map(activity => (
          <div key={activity.id} className={`activity-item ${activity.type}`}>
            <div className="activity-icon">
              {React.createElement(activity.icon)}
            </div>
            <div className="activity-details">
              <p className="activity-description">{activity.description}</p>
              <div className="activity-meta">
                <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
                {activity.amount !== null && (
                  <span className="activity-amount">${activity.amount.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="activity-actions">
        <button className="view-all-btn">View All Activity</button>
      </div>
    </div>
  );
};

export default ActivityFeed;
