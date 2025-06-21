import React from 'react';
import { 
  FaUserPlus, 
  FaDollarSign, 
  FaLevelUpAlt, 
  FaGift,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';
import './ActivityFeed.css';

export default function ActivityFeed({ limit = 10 }) {
  const activities = [
    {
      id: 1,
      type: 'referral',
      icon: FaUserPlus,
      title: 'New Referral',
      description: 'User 0x456...def joined your network',
      time: '2 minutes ago',
      amount: null
    },
    {
      id: 2,
      type: 'earning',
      icon: FaDollarSign,
      title: 'Commission Earned',
      description: 'Referral bonus from direct invite',
      time: '15 minutes ago',
      amount: '$45.50'
    },
    {
      id: 3,
      type: 'levelup',
      icon: FaLevelUpAlt,
      title: 'Level Upgrade',
      description: 'Congratulations! You reached Level 7',
      time: '1 hour ago',
      amount: null
    },
    {
      id: 4,
      type: 'reward',
      icon: FaGift,
      title: 'Reward Unlocked',
      description: 'Team building bonus achieved',
      time: '3 hours ago',
      amount: '$100.00'
    },
    {
      id: 5,
      type: 'earning',
      icon: FaDollarSign,
      title: 'Level Bonus',
      description: 'Level 2 commission from team member',
      time: '5 hours ago',
      amount: '$22.75'
    },
    {
      id: 6,
      type: 'referral',
      icon: FaUserPlus,
      title: 'Network Growth',
      description: 'Your team member invited a new user',
      time: '8 hours ago',
      amount: null
    },
    {
      id: 7,
      type: 'earning',
      icon: FaDollarSign,
      title: 'Withdrawal Completed',
      description: 'Successfully withdrawn to your wallet',
      time: '1 day ago',
      amount: '$500.00'
    },
    {
      id: 8,
      type: 'achievement',
      icon: FaCheckCircle,
      title: 'Achievement Unlocked',
      description: 'Top Recruiter badge earned',
      time: '2 days ago',
      amount: null
    }
  ];

  const limitedActivities = activities.slice(0, limit);

  const getActivityColor = (type) => {
    switch (type) {
      case 'referral':
        return '#00D4FF';
      case 'earning':
        return '#7B2CBF';
      case 'levelup':
        return '#FF6B35';
      case 'reward':
        return '#FFD700';
      case 'achievement':
        return '#00FF88';
      default:
        return '#B8C5D1';
    }
  };

  return (
    <div className="activity-feed">
      <div className="activity-list">
        {limitedActivities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div 
              className="activity-icon"
              style={{ 
                background: `linear-gradient(45deg, ${getActivityColor(activity.type)}22, ${getActivityColor(activity.type)}44)` 
              }}
            >
              <activity.icon style={{ color: getActivityColor(activity.type) }} />
            </div>
            <div className="activity-content">
              <div className="activity-header">
                <h4 className="activity-title">{activity.title}</h4>
                <span className="activity-time">{activity.time}</span>
              </div>
              <p className="activity-description">{activity.description}</p>
              {activity.amount && (
                <span className="activity-amount">{activity.amount}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {activities.length === 0 && (
        <div className="no-activity">
          <FaClock className="no-activity-icon" />
          <p>No recent activity</p>
        </div>
      )}
    </div>
  );
}
