import React, { useState, useEffect } from 'react';
import { 
  FaTrophy, 
  FaMedal, 
  FaCrown, 
  FaStar, 
  FaFire, 
  FaRocket,
  FaChartLine,
  FaUsers,
  FaGift,
  FaBolt,
  FaGem,
  FaShieldAlt,
  FaWallet,
  FaHandshake,
  FaCalendarAlt,
  FaBullseye,
  FaDollarSign
} from 'react-icons/fa';
import './GamificationSystem.css';

/**
 * 🎮 ENHANCED GAMIFICATION SYSTEM
 * Advanced gamification with real-time achievements, challenges,
 * leaderboards, and sophisticated progression tracking
 */
const GamificationSystem = ({ 
  wallet, 
  contract, 
  userStats, 
  account,
  onAchievementUnlock,
  onChallengeComplete 
}) => {
  const [activeTab, setActiveTab] = useState('achievements');
  const [userLevel, setUserLevel] = useState(1);
  const [currentXP, setCurrentXP] = useState(0);
  const [nextLevelXP, setNextLevelXP] = useState(100);
  const [achievements, setAchievements] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [dailyQuests, setDailyQuests] = useState([]);
  const [weeklyQuests, setWeeklyQuests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const [streaks, setStreaks] = useState({
    daily: 0,
    withdrawal: 0,
    referral: 0
  });
  const [userRank, setUserRank] = useState(0);
  const [totalXP, setTotalXP] = useState(0);

  const levels = {
    1: { name: 'Newcomer', icon: '🌱', color: '#27ae60', requiredXP: 0 },
    2: { name: 'Apprentice', icon: '📚', color: '#3498db', requiredXP: 100 },
    3: { name: 'Entrepreneur', icon: '💼', color: '#9b59b6', requiredXP: 300 },
    4: { name: 'Leader', icon: '👑', color: '#e67e22', requiredXP: 600 },
    5: { name: 'Master', icon: '🏆', color: '#f39c12', requiredXP: 1000 },
    6: { name: 'Visionary', icon: '🚀', color: '#e74c3c', requiredXP: 1500 },
    7: { name: 'Legend', icon: '💎', color: '#8e44ad', requiredXP: 2500 }
  };

  // Enhanced Achievement System with sophisticated tracking
  const ENHANCED_ACHIEVEMENTS = {
    earnings: {
      name: 'Earnings Mastery',
      icon: '💰',
      color: '#27ae60',
      achievements: [
        { 
          id: 'first_dollar', 
          name: 'First Step', 
          description: 'Earn your first $1', 
          reward: 50, 
          icon: FaDollarSign,
          requirement: { type: 'total_earnings', value: 1 },
          tier: 'bronze',
          badge: '💰'
        },
        { 
          id: 'hundred_club', 
          name: 'Hundred Club', 
          description: 'Earn $100 total', 
          reward: 100, 
          icon: FaTrophy,
          requirement: { type: 'total_earnings', value: 100 },
          tier: 'silver',
          badge: '💯'
        },
        { 
          id: 'thousand_master', 
          name: 'Thousand Master', 
          description: 'Earn $1,000 total', 
          reward: 250, 
          icon: FaCrown,
          requirement: { type: 'total_earnings', value: 1000 },
          tier: 'gold',
          badge: '👑'
        },
        { 
          id: 'five_k_legend', 
          name: 'Five K Legend', 
          description: 'Earn $5,000 total', 
          reward: 500, 
          icon: FaGem,
          requirement: { type: 'total_earnings', value: 5000 },
          tier: 'diamond',
          badge: '💎'
        },
        { 
          id: 'daily_earner', 
          name: 'Daily Grinder', 
          description: 'Earn money for 7 consecutive days', 
          reward: 200, 
          icon: FaFire,
          requirement: { type: 'daily_streak', value: 7 },
          tier: 'silver',
          badge: '🔥'
        }
      ]
    },
    
    team: {
      name: 'Team Building Excellence',
      icon: '👥',
      color: '#3498db',
      achievements: [
        { 
          id: 'first_referral', 
          name: 'Team Starter', 
          description: 'Get your first referral', 
          reward: 75, 
          icon: FaUsers,
          requirement: { type: 'direct_referrals', value: 1 },
          tier: 'bronze',
          badge: '👥'
        },
        { 
          id: 'team_builder', 
          name: 'Team Builder', 
          description: 'Build a team of 10 members', 
          reward: 200, 
          icon: FaRocket,
          requirement: { type: 'team_size', value: 10 },
          tier: 'silver',
          badge: '🚀'
        },
        { 
          id: 'network_master', 
          name: 'Network Master', 
          description: 'Build a team of 50 members', 
          reward: 400, 
          icon: FaShieldAlt,
          requirement: { type: 'team_size', value: 50 },
          tier: 'gold',
          badge: '🛡️'
        },
        { 
          id: 'empire_builder', 
          name: 'Empire Builder', 
          description: 'Build a team of 100 members', 
          reward: 750, 
          icon: FaCrown,
          requirement: { type: 'team_size', value: 100 },
          tier: 'diamond',
          badge: '🏰'
        },
        { 
          id: 'premium_attractor', 
          name: 'Premium Attractor', 
          description: 'Attract 5 premium package members', 
          reward: 300, 
          icon: FaGem,
          requirement: { type: 'premium_referrals', value: 5 },
          tier: 'gold',
          badge: '💎'
        }
      ]
    },

    engagement: {
      name: 'Platform Mastery',
      icon: '⚡',
      color: '#e74c3c',
      achievements: [
        { 
          id: 'daily_warrior', 
          name: 'Daily Warrior', 
          description: 'Login 30 days in a row', 
          reward: 300, 
          icon: FaFire,
          requirement: { type: 'login_streak', value: 30 },
          tier: 'gold',
          badge: '🔥'
        },
        { 
          id: 'withdrawal_master', 
          name: 'Withdrawal Master', 
          description: 'Complete 20 withdrawals', 
          reward: 250, 
          icon: FaWallet,
          requirement: { type: 'withdrawal_count', value: 20 },
          tier: 'silver',
          badge: '💳'
        },
        { 
          id: 'social_butterfly', 
          name: 'Social Butterfly', 
          description: 'Share referral link 50 times', 
          reward: 150, 
          icon: FaHandshake,
          requirement: { type: 'share_count', value: 50 },
          tier: 'bronze',
          badge: '🤝'
        },
        { 
          id: 'ai_explorer', 
          name: 'AI Explorer', 
          description: 'Use AI assistant 100 times', 
          reward: 200, 
          icon: FaBolt,
          requirement: { type: 'ai_interactions', value: 100 },
          tier: 'silver',
          badge: '🤖'
        }
      ]
    },

    investment: {
      name: 'Investment Wisdom',
      icon: '📈',
      color: '#9b59b6',
      achievements: [
        { 
          id: 'package_upgrader', 
          name: 'Package Upgrader', 
          description: 'Upgrade to $50 package', 
          reward: 150, 
          icon: FaRocket,
          requirement: { type: 'package_tier', value: 2 },
          tier: 'bronze',
          badge: '📦'
        },
        { 
          id: 'premium_investor', 
          name: 'Premium Investor', 
          description: 'Upgrade to $100 package', 
          reward: 300, 
          icon: FaStar,
          requirement: { type: 'package_tier', value: 3 },
          tier: 'silver',
          badge: '⭐'
        },
        { 
          id: 'elite_investor', 
          name: 'Elite Investor', 
          description: 'Upgrade to $200 package', 
          reward: 500, 
          icon: FaGem,
          requirement: { type: 'package_tier', value: 4 },
          tier: 'gold',
          badge: '💎'
        },
        { 
          id: 'roi_master', 
          name: 'ROI Master', 
          description: 'Achieve 2x ROI on any package', 
          reward: 400, 
          icon: FaChartLine,
          requirement: { type: 'roi_multiplier', value: 2 },
          tier: 'gold',
          badge: '📈'
        }
      ]
    }
  };

  // Enhanced Daily Challenges with dynamic rewards
  const ENHANCED_DAILY_CHALLENGES = [
    {
      id: 'daily_login',
      title: 'Daily Check-in',
      description: 'Login to your dashboard',
      reward: 15,
      completed: false,
      icon: FaCalendarAlt,
      category: 'engagement'
    },
    {
      id: 'earnings_check',
      title: 'Earnings Review',
      description: 'Check your earnings breakdown',
      reward: 20,
      completed: false,
      icon: FaChartLine,
      category: 'engagement'
    },
    {
      id: 'team_visit',
      title: 'Team Management',
      description: 'Visit your team section',
      reward: 25,
      completed: false,
      icon: FaUsers,
      category: 'team'
    },
    {
      id: 'share_link',
      title: 'Share Your Success',
      description: 'Share your referral link',
      reward: 30,
      completed: false,
      icon: FaHandshake,
      category: 'marketing'
    },
    {
      id: 'ai_interaction',
      title: 'AI Consultation',
      description: 'Ask the AI assistant a question',
      reward: 25,
      completed: false,
      icon: FaBolt,
      category: 'engagement'
    }
  ];

  // Weekly Challenges with higher rewards
  const ENHANCED_WEEKLY_CHALLENGES = [
    {
      id: 'weekly_earnings',
      title: 'Weekly Earner',
      description: 'Earn $100 this week',
      progress: 0,
      target: 100,
      reward: 200,
      completed: false,
      icon: FaTrophy,
      category: 'earnings'
    },
    {
      id: 'weekly_referrals',
      title: 'Team Expansion',
      description: 'Add 3 new team members this week',
      progress: 0,
      target: 3,
      reward: 300,
      completed: false,
      icon: FaUsers,
      category: 'team'
    },
    {
      id: 'weekly_engagement',
      title: 'Platform Explorer',
      description: 'Complete all daily challenges 5 days',
      progress: 0,
      target: 5,
      reward: 150,
      completed: false,
      icon: FaBullseye,
      category: 'engagement'
    },
    {
      id: 'weekly_social',
      title: 'Social Media Maven',
      description: 'Share your link 20 times this week',
      progress: 0,
      target: 20,
      reward: 100,
      completed: false,
      icon: FaHandshake,
      category: 'marketing'
    }
  ];

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
    
    Object.values(ENHANCED_ACHIEVEMENTS).forEach(category => {
      category.achievements.forEach(achievement => {
        if (!existingAchievements.includes(achievement.id)) {
          let shouldEarn = false;
          
          switch (achievement.id) {
            case 'first_dollar':
              shouldEarn = (stats?.totalEarnings || 0) >= 1;
              break;
            case 'hundred_club':
              shouldEarn = (stats?.totalEarnings || 0) >= 100;
              break;
            case 'thousand_master':
              shouldEarn = (stats?.totalEarnings || 0) >= 1000;
              break;
            case 'five_k_legend':
              shouldEarn = (stats?.totalEarnings || 0) >= 5000;
              break;
            case 'daily_earner':
              shouldEarn = (streaks.daily || 0) >= 7;
              break;
            case 'first_referral':
              shouldEarn = (stats?.totalReferrals || 0) >= 1;
              break;
            case 'team_builder':
              shouldEarn = (stats?.teamSize || 0) >= 10;
              break;
            case 'network_master':
              shouldEarn = (stats?.teamSize || 0) >= 50;
              break;
            case 'empire_builder':
              shouldEarn = (stats?.teamSize || 0) >= 100;
              break;
            case 'premium_attractor':
              shouldEarn = (stats?.premiumReferrals || 0) >= 5;
              break;
            case 'daily_warrior':
              shouldEarn = (streaks.daily || 0) >= 30;
              break;
            case 'withdrawal_master':
              shouldEarn = (stats?.withdrawalCount || 0) >= 20;
              break;
            case 'social_butterfly':
              shouldEarn = (stats?.shareCount || 0) >= 50;
              break;
            case 'ai_explorer':
              shouldEarn = (stats?.aiInteractions || 0) >= 100;
              break;
            case 'package_upgrader':
              shouldEarn = (stats?.packageTier || 0) >= 2;
              break;
            case 'premium_investor':
              shouldEarn = (stats?.packageTier || 0) >= 3;
              break;
            case 'elite_investor':
              shouldEarn = (stats?.packageTier || 0) >= 4;
              break;
            case 'roi_master':
              shouldEarn = (stats?.roiMultiplier || 1) >= 2;
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
            {Object.entries(ENHANCED_ACHIEVEMENTS).map(([key, category]) => (
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
    </div>
  );
};

export default GamificationSystem;
