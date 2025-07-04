<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import './GamificationSystem.css';

const GamificationSystem = ({ wallet, contract, userStats }) => {
  const [userLevel, setUserLevel] = useState(1);
  const [currentXP, setCurrentXP] = useState(0);
  const [nextLevelXP, setNextLevelXP] = useState(100);
  const [achievements, setAchievements] = useState([]);
  const [dailyQuests, setDailyQuests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);

  const levels = {
    1: { name: 'Newcomer', icon: '🌱', color: '#27ae60', requiredXP: 0 },
    2: { name: 'Apprentice', icon: '📚', color: '#3498db', requiredXP: 100 },
    3: { name: 'Entrepreneur', icon: '💼', color: '#9b59b6', requiredXP: 300 },
    4: { name: 'Leader', icon: '👑', color: '#e67e22', requiredXP: 600 },
    5: { name: 'Master', icon: '🏆', color: '#f39c12', requiredXP: 1000 },
    6: { name: 'Visionary', icon: '🚀', color: '#e74c3c', requiredXP: 1500 },
    7: { name: 'Legend', icon: '💎', color: '#8e44ad', requiredXP: 2500 }
  };

  const achievementCategories = {
    earnings: {
      name: 'Earnings Milestones',
      icon: '💰',
      achievements: [
        { id: 'first_earning', name: 'First Blood', description: 'Earn your first $1', reward: 50, icon: '🎯' },
        { id: 'hundred_club', name: 'Hundred Club', description: 'Earn $100 total', reward: 100, icon: '💯' },
        { id: 'thousand_club', name: 'Thousand Club', description: 'Earn $1,000 total', reward: 200, icon: '🎖️' },
        { id: 'ten_k_club', name: 'Elite Earner', description: 'Earn $10,000 total', reward: 500, icon: '👑' }
      ]
    },
    referrals: {
      name: 'Network Building',
      icon: '🤝',
      achievements: [
        { id: 'first_referral', name: 'Connector', description: 'Get your first referral', reward: 75, icon: '🔗' },
        { id: 'ten_referrals', name: 'Team Builder', description: 'Get 10 referrals', reward: 150, icon: '🏗️' },
        { id: 'fifty_referrals', name: 'Network Master', description: 'Get 50 referrals', reward: 300, icon: '🕸️' },
        { id: 'hundred_referrals', name: 'Empire Builder', description: 'Get 100 referrals', reward: 600, icon: '🏰' }
      ]
    },
    matrix: {
      name: 'Matrix Mastery',
      icon: '🌳',
      achievements: [
        { id: 'first_cycle', name: 'Cycle Starter', description: 'Complete first matrix cycle', reward: 100, icon: '♻️' },
        { id: 'level_climber', name: 'Level Climber', description: 'Reach matrix level 3', reward: 150, icon: '🧗' },
        { id: 'recycling_pro', name: 'Recycling Pro', description: 'Complete 5 recycling cycles', reward: 250, icon: '🔄' },
        { id: 'matrix_master', name: 'Matrix Master', description: 'Reach matrix level 6', reward: 500, icon: '🎯' }
      ]
    },
    engagement: {
      name: 'Platform Engagement',
      icon: '⚡',
      achievements: [
        { id: 'daily_login', name: 'Consistency', description: 'Login 7 days in a row', reward: 50, icon: '📅' },
        { id: 'social_sharer', name: 'Social Butterfly', description: 'Share LeadFive 10 times', reward: 100, icon: '📢' },
        { id: 'early_adopter', name: 'Early Bird', description: 'Join in the first month', reward: 200, icon: '🐦' },
        { id: 'platform_expert', name: 'Platform Expert', description: 'Use all dashboard features', reward: 150, icon: '🎛️' }
      ]
    }
  };

  useEffect(() => {
    initializeGamification();
    generateDailyQuests();
    loadLeaderboard();
  }, [wallet?.account, userStats]);

  const initializeGamification = () => {
    // Calculate level based on total activities and earnings
    const baseXP = (userStats?.totalEarnings || 0) / 10; // 1 XP per $10 earned
    const referralXP = (userStats?.totalReferrals || 0) * 25; // 25 XP per referral
    const matrixXP = (userStats?.matrixLevel || 1) * 50; // 50 XP per matrix level
    const totalXP = Math.floor(baseXP + referralXP + matrixXP);

    setCurrentXP(totalXP);
    
    // Calculate current level
    let level = 1;
    let remainingXP = totalXP;
    
    Object.entries(levels).forEach(([levelNum, levelData]) => {
      if (totalXP >= levelData.requiredXP) {
        level = parseInt(levelNum);
      }
    });

    setUserLevel(level);
    
    const nextLevel = level + 1;
    const nextLevelData = levels[nextLevel];
    if (nextLevelData) {
      setNextLevelXP(nextLevelData.requiredXP - totalXP);
    }

    // Check for new achievements
    checkAchievements(userStats);
  };

  const checkAchievements = (stats) => {
    const earned = [];
    const existingAchievements = JSON.parse(localStorage.getItem('leadfive_achievements') || '[]');
    
    Object.values(achievementCategories).forEach(category => {
      category.achievements.forEach(achievement => {
        if (!existingAchievements.includes(achievement.id)) {
          let shouldEarn = false;
          
          switch (achievement.id) {
            case 'first_earning':
              shouldEarn = (stats?.totalEarnings || 0) >= 1;
              break;
            case 'hundred_club':
              shouldEarn = (stats?.totalEarnings || 0) >= 100;
              break;
            case 'thousand_club':
              shouldEarn = (stats?.totalEarnings || 0) >= 1000;
              break;
            case 'ten_k_club':
              shouldEarn = (stats?.totalEarnings || 0) >= 10000;
              break;
            case 'first_referral':
              shouldEarn = (stats?.totalReferrals || 0) >= 1;
              break;
            case 'ten_referrals':
              shouldEarn = (stats?.totalReferrals || 0) >= 10;
              break;
            case 'fifty_referrals':
              shouldEarn = (stats?.totalReferrals || 0) >= 50;
              break;
            case 'hundred_referrals':
              shouldEarn = (stats?.totalReferrals || 0) >= 100;
              break;
            case 'first_cycle':
              shouldEarn = (stats?.completedCycles || 0) >= 1;
              break;
            case 'level_climber':
              shouldEarn = (stats?.matrixLevel || 1) >= 3;
              break;
            case 'recycling_pro':
              shouldEarn = (stats?.completedCycles || 0) >= 5;
              break;
            case 'matrix_master':
              shouldEarn = (stats?.matrixLevel || 1) >= 6;
              break;
            default:
              break;
          }
          
          if (shouldEarn) {
            earned.push(achievement);
            existingAchievements.push(achievement.id);
          }
        }
      });
    });

    if (earned.length > 0) {
      localStorage.setItem('leadfive_achievements', JSON.stringify(existingAchievements));
      setNewAchievement(earned[0]); // Show first new achievement
      setShowAchievementModal(true);
    }

    setAchievements(existingAchievements);
  };

  const generateDailyQuests = () => {
    const quests = [
      {
        id: 'daily_login',
        title: 'Daily Check-in',
        description: 'Visit your dashboard',
        progress: 1,
        target: 1,
        reward: 25,
        icon: '📅',
        completed: true
      },
      {
        id: 'check_earnings',
        title: 'Review Earnings',
        description: 'Check your earnings analytics',
        progress: 0,
        target: 1,
        reward: 20,
        icon: '📊',
        completed: false
      },
      {
        id: 'share_link',
        title: 'Share the Opportunity',
        description: 'Share your referral link with 3 people',
        progress: 1,
        target: 3,
        reward: 50,
        icon: '🔗',
        completed: false
      },
      {
        id: 'network_activity',
        title: 'Network Engagement',
        description: 'View your team genealogy',
        progress: 0,
        target: 1,
        reward: 30,
        icon: '👥',
        completed: false
      }
    ];

    setDailyQuests(quests);
  };

  const loadLeaderboard = () => {
    // Mock leaderboard data
    const mockLeaderboard = [
      { rank: 1, address: '0x1234...5678', earnings: 25420.50, level: 7, icon: '👑' },
      { rank: 2, address: '0x2345...6789', earnings: 18750.25, level: 6, icon: '🥈' },
      { rank: 3, address: '0x3456...7890', earnings: 15230.75, level: 6, icon: '🥉' },
      { rank: 4, address: wallet?.account || '0x4567...8901', earnings: 12850.00, level: 5, icon: '🏆' },
      { rank: 5, address: '0x5678...9012', earnings: 9420.30, level: 4, icon: '⭐' }
    ];

    setLeaderboard(mockLeaderboard);
  };

  const formatAddress = (address) => {
    return `${address?.slice(0, 6)}...${address?.slice(-4)}`;
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const currentLevelData = levels[userLevel];
  const progressToNext = nextLevelXP > 0 ? ((currentXP - (currentLevelData?.requiredXP || 0)) / nextLevelXP) * 100 : 100;

  return (
    <div className="gamification-system card">
      <div className="gamification-header">
        <h2>🎮 Gamification Center</h2>
        <div className="user-level-display">
          <div className="level-icon">{currentLevelData?.icon}</div>
          <div className="level-info">
            <div className="level-name">{currentLevelData?.name}</div>
            <div className="level-number">Level {userLevel}</div>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <div className="xp-progress">
          <div className="progress-header">
            <span>Experience Points: {currentXP.toLocaleString()}</span>
            <span>Next Level: {nextLevelXP > 0 ? nextLevelXP : 'MAX'} XP</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${progressToNext}%`,
                background: currentLevelData?.color 
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="gamification-content">
        <div className="section daily-quests">
          <h3>📋 Daily Quests</h3>
          <div className="quests-list">
            {dailyQuests.map(quest => (
              <div key={quest.id} className={`quest-item ${quest.completed ? 'completed' : ''}`}>
                <div className="quest-icon">{quest.icon}</div>
                <div className="quest-info">
                  <div className="quest-title">{quest.title}</div>
                  <div className="quest-description">{quest.description}</div>
                  <div className="quest-progress">
                    <div className="progress-bar small">
                      <div 
                        className="progress-fill"
                        style={{ width: `${getProgressPercentage(quest.progress, quest.target)}%` }}
                      ></div>
                    </div>
                    <span>{quest.progress}/{quest.target}</span>
                  </div>
                </div>
                <div className="quest-reward">
                  +{quest.reward} XP
                  {quest.completed && <span className="completed-check">✅</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section achievements">
          <h3>🏆 Achievements</h3>
          <div className="achievement-categories">
            {Object.entries(achievementCategories).map(([key, category]) => (
              <div key={key} className="achievement-category">
                <h4>{category.icon} {category.name}</h4>
                <div className="achievements-grid">
                  {category.achievements.map(achievement => (
                    <div 
                      key={achievement.id} 
                      className={`achievement-card ${achievements.includes(achievement.id) ? 'earned' : 'locked'}`}
                    >
                      <div className="achievement-icon">{achievement.icon}</div>
                      <div className="achievement-info">
                        <div className="achievement-name">{achievement.name}</div>
                        <div className="achievement-description">{achievement.description}</div>
                        <div className="achievement-reward">+{achievement.reward} XP</div>
                      </div>
                      {achievements.includes(achievement.id) && (
                        <div className="earned-badge">✅</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section leaderboard">
          <h3>🏆 Leaderboard</h3>
          <div className="leaderboard-list">
            {leaderboard.map(entry => (
              <div 
                key={entry.rank} 
                className={`leaderboard-entry ${entry.address === wallet?.account ? 'current-user' : ''}`}
              >
                <div className="rank">
                  <span className="rank-number">#{entry.rank}</span>
                  <span className="rank-icon">{entry.icon}</span>
                </div>
                <div className="user-info">
                  <div className="user-address">{formatAddress(entry.address)}</div>
                  <div className="user-level">
                    {levels[entry.level]?.icon} Level {entry.level}
                  </div>
                </div>
                <div className="user-earnings">
                  ${entry.earnings.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievement Modal */}
      {showAchievementModal && newAchievement && (
        <div className="achievement-modal-overlay">
          <div className="achievement-modal">
            <div className="modal-content">
              <h2>🎉 Achievement Unlocked!</h2>
              <div className="achievement-showcase">
                <div className="big-icon">{newAchievement.icon}</div>
                <h3>{newAchievement.name}</h3>
                <p>{newAchievement.description}</p>
                <div className="reward-display">
                  +{newAchievement.reward} XP
                </div>
              </div>
              <button 
                className="claim-button"
                onClick={() => setShowAchievementModal(false)}
              >
                Awesome! 🚀
              </button>
            </div>
          </div>
        </div>
      )}
=======
import React from 'react';
import { FaGamepad, FaTrophy, FaMedal, FaStar, FaGem, FaAward, FaRocket, FaUsers, FaHandHoldingHeart, FaCalendarCheck, FaCheckCircle } from 'react-icons/fa';

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
        icon: FaRocket
      },
      { 
        id: 2, 
        name: 'Team Builder', 
        description: 'Build a team of 10 members', 
        completed: true,
        reward: 'Unlock Level 2 Community privileges',
        icon: FaUsers
      },
      { 
        id: 3, 
        name: 'Help Pool Hero', 
        description: 'Maintain Help Pool eligibility for 60 consecutive days', 
        completed: false,
        progress: 70,
        reward: 'Increased Help Pool share by 5%',
        icon: FaHandHoldingHeart
      },
      { 
        id: 4, 
        name: 'Consistency King', 
        description: 'Log in and engage with your team for 30 consecutive days', 
        completed: false,
        progress: 22,
        reward: 'Special badge and leadership board visibility',
        icon: FaCalendarCheck
      }
    ],
    badges: [
      { id: 1, name: 'Founding Member', rarity: 'legendary', earned: true },
      { id: 2, name: 'Team Mentor', rarity: 'rare', earned: true },
      { id: 3, name: 'Community Leader', rarity: 'epic', earned: false }
    ],
    leaderboard: {
      rank: 127,
      totalParticipants: 1542,
      category: 'Team Growth Rate',
      percentile: 8
    }
  };
  
  // Helper function to render achievement icon
  const renderAchievementIcon = (icon) => {
    if (icon) {
      return React.createElement(icon);
    }
    return <FaTrophy />;
  };
  
  // Helper function to render badge icon based on rarity
  const renderBadgeIcon = (rarity) => {
    switch(rarity) {
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
            <span>{gamificationData.experience} / {gamificationData.nextLevelAt} XP</span>
          </div>
        </div>
        <div className="level-progress-bar">
          <div 
            className="level-progress-fill"
            style={{ width: `${(gamificationData.experience / gamificationData.nextLevelAt) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="achievements-container">
        <h4>Your Achievements</h4>
        <div className="achievements-grid">
          {gamificationData.achievements.map(achievement => (
            <div key={achievement.id} className={`achievement-card ${achievement.completed ? 'completed' : 'in-progress'}`}>
              <div className="achievement-icon">
                {renderAchievementIcon(achievement.icon)}
              </div>
              <div className="achievement-details">
                <h5 className="achievement-name">{achievement.name}</h5>
                <p className="achievement-description">{achievement.description}</p>
                {!achievement.completed && achievement.progress && (
                  <div className="achievement-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{achievement.progress}%</span>
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
            <div key={badge.id} className={`badge-item ${badge.earned ? 'earned' : 'locked'} ${badge.rarity}`}>
              <div className="badge-icon">
                {renderBadgeIcon(badge.rarity)}
              </div>
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
            <span className="rank-number">#{gamificationData.leaderboard.rank}</span>
            <span className="rank-label">Current Rank</span>
          </div>
          <div className="leaderboard-percentile">
            <span className="percentile-number">Top {gamificationData.leaderboard.percentile}%</span>
            <span className="percentile-label">{gamificationData.leaderboard.category}</span>
          </div>
        </div>
        <button className="view-leaderboard-btn">View Full Leaderboard</button>
      </div>
>>>>>>> 4e21071 (🔐 Complete dashboard implementation with Trezor security integration)
    </div>
  );
};

export default GamificationSystem;
