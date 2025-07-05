/**
 * Advanced Achievements & Rewards Section - PhD-Level Enhancement
 * Features: Gamification system, reward tracking, milestone celebrations,
 * achievement progress, leaderboards, and motivation tools
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTrophy,
  FaMedal,
  FaStar,
  FaGift,
  FaCrown,
  FaFire,
  FaGem,
  FaRocket,
  FaBullseye,
  FaChartLine,
  FaUsers,
  FaDollarSign,
  FaCalendarAlt,
  FaBolt,
  FaShieldAlt,
  FaHeart,
  FaGamepad,
} from 'react-icons/fa';
import './AdvancedAchievementsRewards.css';

const AdvancedAchievementsRewards = ({ data, account }) => {
  const [activeTab, setActiveTab] = useState('achievements');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [celebratingAchievement, setCelebratingAchievement] = useState(null);

  const userProgress = {
    totalPoints: 15420,
    level: 12,
    nextLevelPoints: 18000,
    streak: 15,
    completedAchievements: 28,
    totalAchievements: 45,
    rewardsEarned: 8,
    lifetimeRewards: 2450,
  };

  const achievements = [
    {
      id: 'first-steps',
      title: 'First Steps',
      description: 'Complete your first investment',
      category: 'beginner',
      points: 100,
      rarity: 'common',
      icon: FaRocket,
      completed: true,
      completedDate: '2024-06-15',
      progress: 100,
    },
    {
      id: 'team-builder',
      title: 'Team Builder',
      description: 'Recruit your first 5 team members',
      category: 'team',
      points: 500,
      rarity: 'uncommon',
      icon: FaUsers,
      completed: true,
      completedDate: '2024-06-25',
      progress: 100,
    },
    {
      id: 'volume-master',
      title: 'Volume Master',
      description: 'Generate $10,000 in team volume',
      category: 'volume',
      points: 750,
      rarity: 'rare',
      icon: FaDollarSign,
      completed: false,
      progress: 75,
      currentValue: 7500,
      targetValue: 10000,
    },
    {
      id: 'streak-champion',
      title: 'Streak Champion',
      description: 'Maintain 30-day active streak',
      category: 'engagement',
      points: 300,
      rarity: 'uncommon',
      icon: FaFire,
      completed: false,
      progress: 50,
      currentValue: 15,
      targetValue: 30,
    },
    {
      id: 'mentor',
      title: 'Mentor',
      description: 'Help 10 team members achieve success',
      category: 'leadership',
      points: 1000,
      rarity: 'epic',
      icon: FaHeart,
      completed: false,
      progress: 30,
      currentValue: 3,
      targetValue: 10,
    },
    {
      id: 'legend',
      title: 'Legend',
      description: 'Reach the highest community tier',
      category: 'prestige',
      points: 2500,
      rarity: 'legendary',
      icon: FaCrown,
      completed: false,
      progress: 25,
      currentValue: 'Tier 3',
      targetValue: 'Tier 6',
    },
  ];

  const rewards = [
    {
      id: 'bonus-100',
      title: '$100 Achievement Bonus',
      description: 'Earned for completing 10 achievements',
      type: 'monetary',
      value: 100,
      claimed: true,
      claimedDate: '2024-06-20',
      icon: FaDollarSign,
    },
    {
      id: 'exclusive-badge',
      title: 'Team Builder Badge',
      description: 'Special recognition for outstanding team building',
      type: 'badge',
      value: 'Team Builder',
      claimed: true,
      claimedDate: '2024-06-25',
      icon: FaMedal,
    },
    {
      id: 'vip-access',
      title: 'VIP Event Access',
      description: 'Exclusive access to leadership events',
      type: 'access',
      value: 'VIP Status',
      claimed: false,
      requirement: 'Complete 5 more achievements',
      icon: FaCrown,
    },
    {
      id: 'mentor-tools',
      title: 'Advanced Mentor Tools',
      description: 'Unlock advanced team management features',
      type: 'feature',
      value: 'Mentor Suite',
      claimed: false,
      requirement: 'Achieve Mentor status',
      icon: FaShieldAlt,
    },
  ];

  const leaderboard = [
    {
      rank: 1,
      name: 'Alexandra Chen',
      points: 28500,
      achievements: 42,
      badge: 'Legend',
    },
    {
      rank: 2,
      name: 'Marcus Rodriguez',
      points: 26200,
      achievements: 39,
      badge: 'Master',
    },
    {
      rank: 3,
      name: 'Sarah Johnson',
      points: 24800,
      achievements: 37,
      badge: 'Master',
    },
    {
      rank: 4,
      name: 'David Kim',
      points: 22100,
      achievements: 35,
      badge: 'Expert',
    },
    {
      rank: 5,
      name: 'Emily Davis',
      points: 20300,
      achievements: 33,
      badge: 'Expert',
    },
    {
      rank: 47,
      name: 'You',
      points: 15420,
      achievements: 28,
      badge: 'Achiever',
      highlight: true,
    },
  ];

  const streakMilestones = [
    { days: 7, reward: '$25 Bonus', completed: true },
    { days: 15, reward: 'Special Badge', completed: true },
    { days: 30, reward: '$100 Bonus', completed: false, current: true },
    { days: 60, reward: 'VIP Access', completed: false },
    { days: 100, reward: '$500 Bonus', completed: false },
  ];

  const categories = [
    { id: 'all', name: 'All', icon: FaStar },
    { id: 'beginner', name: 'Beginner', icon: FaRocket },
    { id: 'team', name: 'Team', icon: FaUsers },
    { id: 'volume', name: 'Volume', icon: FaDollarSign },
    { id: 'engagement', name: 'Engagement', icon: FaFire },
    { id: 'leadership', name: 'Leadership', icon: FaCrown },
    { id: 'prestige', name: 'Prestige', icon: FaGem },
  ];

  const renderAchievementsTab = () => (
    <div className="achievements-section">
      {/* Progress Overview */}
      <div className="progress-overview">
        <motion.div
          className="progress-card level"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="progress-icon">
            <FaTrophy />
          </div>
          <div className="progress-content">
            <h3>Achievement Level</h3>
            <div className="progress-value">Level {userProgress.level}</div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(userProgress.totalPoints / userProgress.nextLevelPoints) * 100}%`,
                }}
              />
            </div>
            <div className="progress-meta">
              {userProgress.nextLevelPoints - userProgress.totalPoints} points
              to Level {userProgress.level + 1}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="progress-card points"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="progress-icon">
            <FaStar />
          </div>
          <div className="progress-content">
            <h3>Total Points</h3>
            <div className="progress-value">
              {userProgress.totalPoints.toLocaleString()}
            </div>
            <div className="progress-meta">
              Earned from {userProgress.completedAchievements} achievements
            </div>
          </div>
        </motion.div>

        <motion.div
          className="progress-card streak"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="progress-icon">
            <FaFire />
          </div>
          <div className="progress-content">
            <h3>Current Streak</h3>
            <div className="progress-value">{userProgress.streak} days</div>
            <div className="progress-meta">
              Keep going for milestone rewards!
            </div>
          </div>
        </motion.div>

        <motion.div
          className="progress-card completion"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="progress-icon">
            <FaBullseye />
          </div>
          <div className="progress-content">
            <h3>Completion Rate</h3>
            <div className="progress-value">
              {Math.round(
                (userProgress.completedAchievements /
                  userProgress.totalAchievements) *
                  100
              )}
              %
            </div>
            <div className="progress-meta">
              {userProgress.completedAchievements}/
              {userProgress.totalAchievements} completed
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <h3>🎯 Achievement Categories</h3>
        <div className="categories-list">
          {categories.map(category => (
            <motion.button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <category.icon />
              <span>{category.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="achievements-grid">
        {achievements
          .filter(
            achievement =>
              selectedCategory === 'all' ||
              achievement.category === selectedCategory
          )
          .map((achievement, index) => (
            <motion.div
              key={achievement.id}
              className={`achievement-card ${achievement.rarity} ${achievement.completed ? 'completed' : 'in-progress'}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="achievement-header">
                <div
                  className={`achievement-icon ${achievement.completed ? 'completed' : 'locked'}`}
                >
                  <achievement.icon />
                  {achievement.completed && (
                    <motion.div
                      className="completion-sparkle"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <FaStar />
                    </motion.div>
                  )}
                </div>

                <div className={`rarity-badge ${achievement.rarity}`}>
                  {achievement.rarity}
                </div>
              </div>

              <div className="achievement-content">
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>

                <div className="achievement-points">
                  <FaStar />
                  <span>{achievement.points} points</span>
                </div>

                {achievement.completed ? (
                  <div className="completed-info">
                    <div className="completed-badge">
                      <FaTrophy />
                      <span>Completed!</span>
                    </div>
                    <div className="completed-date">
                      {new Date(achievement.completedDate).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="progress-info">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                    <div className="progress-text">
                      {achievement.currentValue && achievement.targetValue ? (
                        <span>
                          {achievement.currentValue} / {achievement.targetValue}
                        </span>
                      ) : (
                        <span>{achievement.progress}% complete</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );

  const renderRewardsTab = () => (
    <div className="rewards-section">
      <div className="rewards-overview">
        <h3>🎁 Your Rewards Summary</h3>
        <div className="rewards-stats">
          <div className="reward-stat">
            <div className="stat-value">{userProgress.rewardsEarned}</div>
            <div className="stat-label">Rewards Earned</div>
          </div>
          <div className="reward-stat">
            <div className="stat-value">${userProgress.lifetimeRewards}</div>
            <div className="stat-label">Lifetime Value</div>
          </div>
          <div className="reward-stat">
            <div className="stat-value">3</div>
            <div className="stat-label">Available to Claim</div>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="rewards-grid">
        {rewards.map((reward, index) => (
          <motion.div
            key={reward.id}
            className={`reward-card ${reward.type} ${reward.claimed ? 'claimed' : 'available'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="reward-header">
              <div className="reward-icon">
                <reward.icon />
              </div>
              <div className={`reward-type-badge ${reward.type}`}>
                {reward.type}
              </div>
            </div>

            <div className="reward-content">
              <h4>{reward.title}</h4>
              <p>{reward.description}</p>

              <div className="reward-value">
                {reward.type === 'monetary' && `$${reward.value}`}
                {reward.type === 'badge' && reward.value}
                {reward.type === 'access' && reward.value}
                {reward.type === 'feature' && reward.value}
              </div>

              {reward.claimed ? (
                <div className="claimed-info">
                  <div className="claimed-badge">
                    <FaTrophy />
                    <span>Claimed</span>
                  </div>
                  <div className="claimed-date">
                    {new Date(reward.claimedDate).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="claim-info">
                  {reward.requirement ? (
                    <div className="requirement">
                      <FaBullseye />
                      <span>{reward.requirement}</span>
                    </div>
                  ) : (
                    <button className="claim-btn">
                      <FaGift />
                      Claim Reward
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Streak Rewards */}
      <div className="streak-rewards">
        <h4>🔥 Daily Streak Rewards</h4>
        <div className="streak-timeline">
          {streakMilestones.map((milestone, index) => (
            <motion.div
              key={milestone.days}
              className={`streak-milestone ${milestone.completed ? 'completed' : ''} ${milestone.current ? 'current' : ''}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="milestone-marker">
                {milestone.completed ? <FaTrophy /> : <FaBullseye />}
              </div>

              <div className="milestone-content">
                <div className="milestone-days">{milestone.days} days</div>
                <div className="milestone-reward">{milestone.reward}</div>
                {milestone.current && (
                  <div className="current-progress">
                    {userProgress.streak}/{milestone.days} days
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLeaderboardTab = () => (
    <div className="leaderboard-section">
      <div className="leaderboard-header">
        <h3>🏆 Achievement Leaderboard</h3>
        <div className="leaderboard-stats">
          <div className="stat">
            <span className="stat-value">
              #{leaderboard.find(l => l.highlight)?.rank}
            </span>
            <span className="stat-label">Your Rank</span>
          </div>
          <div className="stat">
            <span className="stat-value">{userProgress.totalPoints}</span>
            <span className="stat-label">Your Points</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {userProgress.completedAchievements}
            </span>
            <span className="stat-label">Achievements</span>
          </div>
        </div>
      </div>

      <div className="leaderboard-table">
        <div className="table-header">
          <span>Rank</span>
          <span>Player</span>
          <span>Points</span>
          <span>Achievements</span>
          <span>Badge</span>
        </div>

        <div className="table-body">
          {leaderboard.map((player, index) => (
            <motion.div
              key={player.rank}
              className={`table-row ${player.highlight ? 'highlight' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="rank-cell">
                <span
                  className={`rank-number ${player.rank <= 3 ? 'top-three' : ''}`}
                >
                  #{player.rank}
                </span>
                {player.rank === 1 && <FaTrophy className="trophy gold" />}
                {player.rank === 2 && <FaTrophy className="trophy silver" />}
                {player.rank === 3 && <FaTrophy className="trophy bronze" />}
              </div>

              <div className="player-cell">
                <span className="player-name">{player.name}</span>
                {player.highlight && <span className="you-badge">YOU</span>}
              </div>

              <div className="points-cell">
                <span className="points-amount">
                  {player.points.toLocaleString()}
                </span>
              </div>

              <div className="achievements-cell">
                <span className="achievements-count">
                  {player.achievements}
                </span>
              </div>

              <div className="badge-cell">
                <div className={`player-badge ${player.badge.toLowerCase()}`}>
                  {player.badge}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Seasonal Events */}
      <div className="seasonal-events">
        <h4>🎪 Seasonal Events & Competitions</h4>
        <div className="events-list">
          <div className="event-card active">
            <div className="event-header">
              <FaGamepad />
              <h5>Summer Achievement Challenge</h5>
              <span className="event-status active">Active</span>
            </div>
            <p>Complete 10 achievements in July to win exclusive rewards!</p>
            <div className="event-progress">
              <span>Progress: 6/10 achievements</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '60%' }} />
              </div>
            </div>
            <div className="event-reward">
              <FaGift />
              <span>Reward: $500 bonus + exclusive badge</span>
            </div>
          </div>

          <div className="event-card upcoming">
            <div className="event-header">
              <FaTrophy />
              <h5>Team Building Championship</h5>
              <span className="event-status upcoming">Upcoming</span>
            </div>
            <p>August team-building competition with massive prizes!</p>
            <div className="event-dates">
              <FaCalendarAlt />
              <span>August 1-31, 2024</span>
            </div>
            <div className="event-reward">
              <FaCrown />
              <span>Grand Prize: $2,000 + Legend status</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="advanced-achievements-rewards">
      <div className="section-header">
        <h2>🎮 Achievements & Rewards - Gamification Hub</h2>
        <p>
          Level up your LeadFive journey with achievements, rewards, and
          exclusive recognition
        </p>
      </div>

      <div className="section-tabs">
        <button
          className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <FaTrophy /> Achievements
        </button>
        <button
          className={`tab ${activeTab === 'rewards' ? 'active' : ''}`}
          onClick={() => setActiveTab('rewards')}
        >
          <FaGift /> Rewards
        </button>
        <button
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <FaMedal /> Leaderboard
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="tab-content"
        >
          {activeTab === 'achievements' && renderAchievementsTab()}
          {activeTab === 'rewards' && renderRewardsTab()}
          {activeTab === 'leaderboard' && renderLeaderboardTab()}
        </motion.div>
      </AnimatePresence>

      {/* Achievement Celebration Modal */}
      <AnimatePresence>
        {celebratingAchievement && (
          <motion.div
            className="celebration-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="celebration-modal"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="celebration-header">
                <FaTrophy />
                <h2>Achievement Unlocked!</h2>
              </div>
              <div className="celebration-content">
                <div className="achievement-display">
                  <celebratingAchievement.icon />
                  <h3>{celebratingAchievement.title}</h3>
                  <p>{celebratingAchievement.description}</p>
                  <div className="points-earned">
                    +{celebratingAchievement.points} points
                  </div>
                </div>
              </div>
              <button
                className="celebration-close"
                onClick={() => setCelebratingAchievement(null)}
              >
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedAchievementsRewards;
