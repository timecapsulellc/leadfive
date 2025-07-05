/**
 * Advanced Community Tiers Section - PhD-Level Enhancement
 * Features: Tier progression system, achievement tracking, community status,
 * exclusive benefits showcase, and social networking features
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCrown,
  FaGem,
  FaStar,
  FaShieldAlt,
  FaTrophy,
  FaRocket,
  FaUsers,
  FaDollarSign,
  FaGift,
  FaCalendarAlt,
  FaChartLine,
  FaLock,
  FaCheckCircle,
  FaArrowUp,
  FaFire,
  FaBolt,
  FaHeart,
  FaGlobe,
} from 'react-icons/fa';
import './AdvancedCommunityTiers.css';

const AdvancedCommunityTiers = ({ data, account }) => {
  const [activeView, setActiveView] = useState('progression');
  const [selectedTier, setSelectedTier] = useState('tier-3');

  const communityTiers = [
    {
      id: 'tier-1',
      name: 'Explorer',
      level: 1,
      requirements: {
        investment: 30,
        referrals: 0,
        teamVolume: 0,
        timeActive: 0,
      },
      benefits: {
        commissionRate: 40,
        levelAccess: 3,
        supportLevel: 'Basic',
        exclusiveFeatures: ['Basic dashboard', 'Community access'],
        monthlyReward: 0,
        specialEvents: false,
      },
      population: 2847,
      color: '#4facfe',
      icon: FaRocket,
      status: 'completed',
    },
    {
      id: 'tier-2',
      name: 'Builder',
      level: 2,
      requirements: {
        investment: 100,
        referrals: 2,
        teamVolume: 300,
        timeActive: 30,
      },
      benefits: {
        commissionRate: 40,
        levelAccess: 5,
        supportLevel: 'Standard',
        exclusiveFeatures: [
          'Enhanced dashboard',
          'Level visualization',
          'Basic analytics',
        ],
        monthlyReward: 25,
        specialEvents: false,
      },
      population: 1456,
      color: '#00c9ff',
      icon: FaUsers,
      status: 'completed',
    },
    {
      id: 'tier-3',
      name: 'Achiever',
      level: 3,
      requirements: {
        investment: 200,
        referrals: 5,
        teamVolume: 1000,
        timeActive: 60,
      },
      benefits: {
        commissionRate: 40,
        levelAccess: 7,
        supportLevel: 'Priority',
        exclusiveFeatures: [
          'Advanced analytics',
          'Strategy tools',
          'Performance insights',
        ],
        monthlyReward: 75,
        specialEvents: true,
      },
      population: 723,
      color: '#667eea',
      icon: FaTrophy,
      status: 'current',
    },
    {
      id: 'tier-4',
      name: 'Leader',
      level: 4,
      requirements: {
        investment: 500,
        referrals: 10,
        teamVolume: 2500,
        timeActive: 90,
      },
      benefits: {
        commissionRate: 45,
        levelAccess: 10,
        supportLevel: 'VIP',
        exclusiveFeatures: [
          'Leadership tools',
          'Mentorship program',
          'Advanced strategies',
        ],
        monthlyReward: 200,
        specialEvents: true,
      },
      population: 234,
      color: '#764ba2',
      icon: FaCrown,
      status: 'next',
    },
    {
      id: 'tier-5',
      name: 'Elite',
      level: 5,
      requirements: {
        investment: 1000,
        referrals: 25,
        teamVolume: 10000,
        timeActive: 180,
      },
      benefits: {
        commissionRate: 50,
        levelAccess: 15,
        supportLevel: 'Platinum',
        exclusiveFeatures: [
          'Elite networking',
          'Revenue sharing',
          'Board participation',
        ],
        monthlyReward: 500,
        specialEvents: true,
      },
      population: 67,
      color: '#ffd700',
      icon: FaGem,
      status: 'locked',
    },
    {
      id: 'tier-6',
      name: 'Legend',
      level: 6,
      requirements: {
        investment: 2000,
        referrals: 50,
        teamVolume: 25000,
        timeActive: 365,
      },
      benefits: {
        commissionRate: 55,
        levelAccess: 20,
        supportLevel: 'Diamond',
        exclusiveFeatures: [
          'Legend status',
          'Platform influence',
          'Special recognition',
        ],
        monthlyReward: 1000,
        specialEvents: true,
      },
      population: 12,
      color: '#e6e6fa',
      icon: FaStar,
      status: 'locked',
    },
  ];

  const currentUserStats = {
    currentTier: 'tier-3',
    investment: 200,
    referrals: 3,
    teamVolume: 2400,
    timeActive: 45,
    tierPoints: 3240,
    nextTierPoints: 5000,
    achievements: 12,
    communityRank: 234,
  };

  const achievements = [
    {
      id: 'first-referral',
      name: 'First Referral',
      description: 'Successfully refer your first team member',
      icon: FaUsers,
      earned: true,
      points: 100,
      rarity: 'common',
    },
    {
      id: 'team-builder',
      name: 'Team Builder',
      description: 'Build a team of 10+ active members',
      icon: FaRocket,
      earned: false,
      points: 500,
      rarity: 'rare',
      progress: 30,
    },
    {
      id: 'volume-master',
      name: 'Volume Master',
      description: 'Generate $5000+ in team volume',
      icon: FaDollarSign,
      earned: false,
      points: 750,
      rarity: 'epic',
      progress: 48,
    },
    {
      id: 'community-champion',
      name: 'Community Champion',
      description: 'Help 100+ community members succeed',
      icon: FaHeart,
      earned: false,
      points: 1000,
      rarity: 'legendary',
      progress: 12,
    },
  ];

  const exclusiveEvents = [
    {
      id: 1,
      name: 'Achiever Strategy Workshop',
      date: '2024-07-20',
      tier: 'tier-3',
      attendees: 145,
      type: 'workshop',
    },
    {
      id: 2,
      name: 'Leader Networking Summit',
      date: '2024-07-25',
      tier: 'tier-4',
      attendees: 67,
      type: 'summit',
    },
    {
      id: 3,
      name: 'Elite Mastermind',
      date: '2024-08-01',
      tier: 'tier-5',
      attendees: 23,
      type: 'mastermind',
    },
  ];

  const calculateProgress = (current, required) => {
    return Math.min((current / required) * 100, 100);
  };

  const renderProgressionView = () => {
    const currentTier = communityTiers.find(
      t => t.id === currentUserStats.currentTier
    );
    const nextTier = communityTiers.find(
      t => t.level === currentTier.level + 1
    );

    return (
      <div className="tier-progression">
        {/* Current Status Overview */}
        <div className="current-status">
          <motion.div
            className="status-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="status-header">
              <div
                className="tier-badge"
                style={{ background: currentTier.color }}
              >
                <currentTier.icon />
                <span>
                  Tier {currentTier.level}: {currentTier.name}
                </span>
              </div>
              <div className="tier-population">
                {currentTier.population} members
              </div>
            </div>

            <div className="status-metrics">
              <div className="metric">
                <span className="metric-value">
                  {currentUserStats.tierPoints}
                </span>
                <span className="metric-label">Tier Points</span>
              </div>
              <div className="metric">
                <span className="metric-value">
                  #{currentUserStats.communityRank}
                </span>
                <span className="metric-label">Community Rank</span>
              </div>
              <div className="metric">
                <span className="metric-value">
                  {currentUserStats.achievements}
                </span>
                <span className="metric-label">Achievements</span>
              </div>
            </div>

            <div className="current-benefits">
              <h4>Your Current Benefits</h4>
              <div className="benefits-grid">
                <div className="benefit">
                  <FaCheckCircle />
                  <span>
                    {currentTier.benefits.commissionRate}% Commission Rate
                  </span>
                </div>
                <div className="benefit">
                  <FaCheckCircle />
                  <span>Level {currentTier.benefits.levelAccess} Access</span>
                </div>
                <div className="benefit">
                  <FaCheckCircle />
                  <span>{currentTier.benefits.supportLevel} Support</span>
                </div>
                <div className="benefit">
                  <FaCheckCircle />
                  <span>
                    ${currentTier.benefits.monthlyReward} Monthly Reward
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tier Progression Map */}
        <div className="progression-map">
          <h3>🎯 Your Tier Journey</h3>
          <div className="tiers-timeline">
            {communityTiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                className={`timeline-tier ${tier.status}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="tier-connector">
                  {index < communityTiers.length - 1 && (
                    <div
                      className={`connector-line ${tier.status === 'completed' ? 'completed' : ''}`}
                    />
                  )}
                </div>

                <div className="tier-node" style={{ background: tier.color }}>
                  <tier.icon />
                  {tier.status === 'completed' && (
                    <FaCheckCircle className="completion-check" />
                  )}
                  {tier.status === 'current' && (
                    <FaFire className="current-indicator" />
                  )}
                  {tier.status === 'locked' && (
                    <FaLock className="lock-indicator" />
                  )}
                </div>

                <div className="tier-info">
                  <h4>
                    Tier {tier.level}: {tier.name}
                  </h4>
                  <div className="tier-requirements">
                    <div className="req-item">
                      <span>Investment: ${tier.requirements.investment}</span>
                    </div>
                    <div className="req-item">
                      <span>Referrals: {tier.requirements.referrals}</span>
                    </div>
                    <div className="req-item">
                      <span>Team Volume: ${tier.requirements.teamVolume}</span>
                    </div>
                  </div>
                  <div className="tier-population">
                    {tier.population} members
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Next Tier Progress */}
        {nextTier && (
          <div className="next-tier-progress">
            <h3>🚀 Progress to {nextTier.name}</h3>
            <div className="progress-grid">
              {Object.entries(nextTier.requirements).map(([key, required]) => {
                const current = currentUserStats[key] || 0;
                const progress = calculateProgress(current, required);
                const isCompleted = progress >= 100;

                return (
                  <motion.div
                    key={key}
                    className={`progress-card ${isCompleted ? 'completed' : ''}`}
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="progress-header">
                      <h4>
                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())}
                      </h4>
                      <div
                        className={`progress-status ${isCompleted ? 'completed' : 'in-progress'}`}
                      >
                        {isCompleted ? <FaCheckCircle /> : <FaBolt />}
                      </div>
                    </div>

                    <div className="progress-metrics">
                      <div className="current-vs-required">
                        <span className="current">{current}</span>
                        <span className="separator">/</span>
                        <span className="required">{required}</span>
                      </div>

                      <div className="progress-bar">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>

                      <div className="progress-percentage">
                        {progress.toFixed(1)}%
                      </div>
                    </div>

                    {!isCompleted && (
                      <div className="remaining-needed">
                        {required - current} more needed
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBenefitsView = () => (
    <div className="tier-benefits">
      <h3>💎 Tier Benefits Comparison</h3>

      <div className="benefits-comparison">
        <div className="comparison-table">
          <div className="table-header">
            <div className="feature-column">Features</div>
            {communityTiers.slice(0, 4).map(tier => (
              <div
                key={tier.id}
                className="tier-column"
                style={{
                  background: `linear-gradient(135deg, ${tier.color}20, ${tier.color}40)`,
                }}
              >
                <tier.icon />
                <span>{tier.name}</span>
              </div>
            ))}
          </div>

          <div className="table-body">
            <div className="feature-row">
              <div className="feature-name">Commission Rate</div>
              {communityTiers.slice(0, 4).map(tier => (
                <div key={tier.id} className="feature-value">
                  {tier.benefits.commissionRate}%
                </div>
              ))}
            </div>

            <div className="feature-row">
              <div className="feature-name">Level Access</div>
              {communityTiers.slice(0, 4).map(tier => (
                <div key={tier.id} className="feature-value">
                  Level {tier.benefits.levelAccess}
                </div>
              ))}
            </div>

            <div className="feature-row">
              <div className="feature-name">Monthly Reward</div>
              {communityTiers.slice(0, 4).map(tier => (
                <div key={tier.id} className="feature-value">
                  ${tier.benefits.monthlyReward}
                </div>
              ))}
            </div>

            <div className="feature-row">
              <div className="feature-name">Support Level</div>
              {communityTiers.slice(0, 4).map(tier => (
                <div key={tier.id} className="feature-value">
                  {tier.benefits.supportLevel}
                </div>
              ))}
            </div>

            <div className="feature-row">
              <div className="feature-name">Special Events</div>
              {communityTiers.slice(0, 4).map(tier => (
                <div key={tier.id} className="feature-value">
                  {tier.benefits.specialEvents ? (
                    <FaCheckCircle className="check" />
                  ) : (
                    '—'
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exclusive Features Showcase */}
      <div className="exclusive-features">
        <h4>🌟 Exclusive Features by Tier</h4>
        <div className="features-grid">
          {communityTiers.map(tier => (
            <motion.div
              key={tier.id}
              className={`feature-showcase ${tier.status}`}
              style={{ '--tier-color': tier.color }}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="showcase-header">
                <tier.icon />
                <h5>{tier.name}</h5>
                {tier.status === 'current' && (
                  <span className="current-badge">Current</span>
                )}
                {tier.status === 'locked' && <FaLock className="locked-icon" />}
              </div>

              <div className="exclusive-list">
                {tier.benefits.exclusiveFeatures.map((feature, index) => (
                  <div key={index} className="exclusive-item">
                    <FaStar />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="tier-population">
                <FaUsers />
                <span>{tier.population} members</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="tier-events">
        <h4>📅 Exclusive Tier Events</h4>
        <div className="events-list">
          {exclusiveEvents.map(event => {
            const tierInfo = communityTiers.find(t => t.id === event.tier);
            const isAccessible =
              currentUserStats.currentTier === event.tier ||
              communityTiers.find(t => t.id === currentUserStats.currentTier)
                .level >= tierInfo.level;

            return (
              <motion.div
                key={event.id}
                className={`event-card ${isAccessible ? 'accessible' : 'locked'}`}
                whileHover={{ x: isAccessible ? 5 : 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div
                  className="event-tier-badge"
                  style={{ background: tierInfo.color }}
                >
                  <tierInfo.icon />
                  <span>{tierInfo.name} Only</span>
                </div>

                <div className="event-info">
                  <h5>{event.name}</h5>
                  <div className="event-meta">
                    <span className="event-date">
                      <FaCalendarAlt />
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span className="event-attendees">
                      <FaUsers />
                      {event.attendees} attending
                    </span>
                  </div>
                </div>

                <div className="event-action">
                  {isAccessible ? (
                    <button className="event-btn accessible">Join Event</button>
                  ) : (
                    <button className="event-btn locked" disabled>
                      <FaLock /> Upgrade to Access
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderAchievementsView = () => (
    <div className="achievements-system">
      <h3>🏆 Achievement System</h3>

      {/* Achievement Progress Overview */}
      <div className="achievement-overview">
        <div className="overview-stats">
          <div className="stat-card">
            <div className="stat-value">
              {achievements.filter(a => a.earned).length}
            </div>
            <div className="stat-label">Earned</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{achievements.length}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{currentUserStats.tierPoints}</div>
            <div className="stat-label">Tier Points</div>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="achievements-grid">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            className={`achievement-card ${achievement.rarity} ${achievement.earned ? 'earned' : 'locked'}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div className="achievement-header">
              <div
                className={`achievement-icon ${achievement.earned ? 'earned' : 'locked'}`}
              >
                <achievement.icon />
              </div>
              <div className={`rarity-badge ${achievement.rarity}`}>
                {achievement.rarity}
              </div>
            </div>

            <div className="achievement-content">
              <h4>{achievement.name}</h4>
              <p>{achievement.description}</p>

              <div className="achievement-points">
                <FaStar />
                <span>{achievement.points} points</span>
              </div>

              {!achievement.earned && achievement.progress && (
                <div className="achievement-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    {achievement.progress}% complete
                  </span>
                </div>
              )}

              {achievement.earned && (
                <div className="earned-badge">
                  <FaCheckCircle />
                  <span>Earned!</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tier Point System */}
      <div className="tier-point-system">
        <h4>⭐ Tier Point System</h4>
        <div className="point-breakdown">
          <div className="point-source">
            <div className="source-icon">
              <FaUsers />
            </div>
            <div className="source-info">
              <h5>Direct Referrals</h5>
              <span>100 points per referral</span>
            </div>
            <div className="source-earned">300 points</div>
          </div>

          <div className="point-source">
            <div className="source-icon">
              <FaDollarSign />
            </div>
            <div className="source-info">
              <h5>Team Volume</h5>
              <span>1 point per $1 volume</span>
            </div>
            <div className="source-earned">2400 points</div>
          </div>

          <div className="point-source">
            <div className="source-icon">
              <FaTrophy />
            </div>
            <div className="source-info">
              <h5>Achievements</h5>
              <span>Variable points</span>
            </div>
            <div className="source-earned">540 points</div>
          </div>

          <div className="point-source">
            <div className="source-icon">
              <FaCalendarAlt />
            </div>
            <div className="source-info">
              <h5>Time Active</h5>
              <span>10 points per day</span>
            </div>
            <div className="source-earned">450 points</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="advanced-community-tiers">
      <div className="section-header">
        <h2>🏛️ Community Tiers - Prestige & Recognition</h2>
        <p>
          Advance through exclusive tiers and unlock premium benefits as you
          grow your LeadFive empire
        </p>
      </div>

      <div className="section-tabs">
        <button
          className={`tab ${activeView === 'progression' ? 'active' : ''}`}
          onClick={() => setActiveView('progression')}
        >
          <FaChartLine /> Progression
        </button>
        <button
          className={`tab ${activeView === 'benefits' ? 'active' : ''}`}
          onClick={() => setActiveView('benefits')}
        >
          <FaGift /> Benefits
        </button>
        <button
          className={`tab ${activeView === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveView('achievements')}
        >
          <FaTrophy /> Achievements
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="tab-content"
        >
          {activeView === 'progression' && renderProgressionView()}
          {activeView === 'benefits' && renderBenefitsView()}
          {activeView === 'achievements' && renderAchievementsView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdvancedCommunityTiers;
