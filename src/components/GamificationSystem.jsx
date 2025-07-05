import React from 'react';
import {
  FaGamepad,
  FaTrophy,
  FaMedal,
  FaStar,
  FaGem,
  FaAward,
  FaRocket,
  FaUsers,
  FaHandHoldingHeart,
  FaCalendarCheck,
  FaCheckCircle,
} from 'react-icons/fa';

const GamificationSystem = ({ account, data }) => {
  // Mock gamification data
  const gamificationData = {
    level: 3,
    experience: 720,
    nextLevelAt: 1000,
    achievements: [
      {
        id: 1,
        name: 'Fast Starter',
        description: 'Refer 3 active members within your first month',
        completed: true,
        reward: '10% boost to Direct Referral commission for 30 days',
        icon: FaRocket,
      },
      {
        id: 2,
        name: 'Team Builder',
        description: 'Build a team of 10 members',
        completed: true,
        reward: 'Unlock Level 2 Community privileges',
        icon: FaUsers,
      },
      {
        id: 3,
        name: 'Help Pool Hero',
        description: 'Maintain Help Pool eligibility for 60 consecutive days',
        completed: false,
        progress: 70,
        reward: 'Increased Help Pool share by 5%',
        icon: FaHandHoldingHeart,
      },
      {
        id: 4,
        name: 'Consistency King',
        description: 'Log in and engage with your team for 30 consecutive days',
        completed: false,
        progress: 22,
        reward: 'Special badge and leadership board visibility',
        icon: FaCalendarCheck,
      },
    ],
    badges: [
      { id: 1, name: 'Founding Member', rarity: 'legendary', earned: true },
      { id: 2, name: 'Team Mentor', rarity: 'rare', earned: true },
      { id: 3, name: 'Community Leader', rarity: 'epic', earned: false },
    ],
    leaderboard: {
      rank: 127,
      totalParticipants: 1542,
      category: 'Team Growth Rate',
      percentile: 8,
    },
  };

  // Helper function to render achievement icon
  const renderAchievementIcon = icon => {
    if (icon) {
      return React.createElement(icon);
    }
    return <FaTrophy />;
  };

  // Helper function to render badge icon based on rarity
  const renderBadgeIcon = rarity => {
    switch (rarity) {
      case 'legendary':
        return <FaGem className="legendary-badge" />;
      case 'epic':
        return <FaStar className="epic-badge" />;
      case 'rare':
        return <FaMedal className="rare-badge" />;
      default:
        return <FaAward className="common-badge" />;
    }
  };

  return (
    <div className="gamification-system">
      <div className="gamification-header">
        <h3 className="section-title">
          <FaGamepad /> Achievements & Rewards
        </h3>
      </div>

      <div className="level-progress-container">
        <div className="level-info">
          <span className="level-badge">Level {gamificationData.level}</span>
          <div className="experience-points">
            <span>
              {gamificationData.experience} / {gamificationData.nextLevelAt} XP
            </span>
          </div>
        </div>
        <div className="level-progress-bar">
          <div
            className="level-progress-fill"
            style={{
              width: `${(gamificationData.experience / gamificationData.nextLevelAt) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      <div className="achievements-container">
        <h4>Your Achievements</h4>
        <div className="achievements-grid">
          {gamificationData.achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`achievement-card ${achievement.completed ? 'completed' : 'in-progress'}`}
            >
              <div className="achievement-icon">
                {renderAchievementIcon(achievement.icon)}
              </div>
              <div className="achievement-details">
                <h5 className="achievement-name">{achievement.name}</h5>
                <p className="achievement-description">
                  {achievement.description}
                </p>
                {!achievement.completed && achievement.progress && (
                  <div className="achievement-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {achievement.progress}%
                    </span>
                  </div>
                )}
                <div className="achievement-reward">
                  <strong>Reward:</strong> {achievement.reward}
                </div>
              </div>
              {achievement.completed && (
                <div className="completed-badge">
                  <FaCheckCircle />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="badges-container">
        <h4>Your Badges</h4>
        <div className="badges-grid">
          {gamificationData.badges.map(badge => (
            <div
              key={badge.id}
              className={`badge-item ${badge.earned ? 'earned' : 'locked'} ${badge.rarity}`}
            >
              <div className="badge-icon">{renderBadgeIcon(badge.rarity)}</div>
              <div className="badge-name">{badge.name}</div>
              <div className="badge-rarity">{badge.rarity}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="leaderboard-preview">
        <h4>Leaderboard Standing</h4>
        <div className="leaderboard-stats">
          <div className="leaderboard-rank">
            <span className="rank-number">
              #{gamificationData.leaderboard.rank}
            </span>
            <span className="rank-label">Current Rank</span>
          </div>
          <div className="leaderboard-percentile">
            <span className="percentile-number">
              Top {gamificationData.leaderboard.percentile}%
            </span>
            <span className="percentile-label">
              {gamificationData.leaderboard.category}
            </span>
          </div>
        </div>
        <button className="view-leaderboard-btn">View Full Leaderboard</button>
      </div>
    </div>
  );
};

export default GamificationSystem;
