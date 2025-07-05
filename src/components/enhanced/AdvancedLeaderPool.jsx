/**
 * Advanced Leader Pool Section - PhD-Level Enhancement
 * Features: Qualification tracking, leadership journey, elite benefits,
 * community ranking, and leadership development tools
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTrophy,
  FaCrown,
  FaStar,
  FaShieldAlt,
  FaUsers,
  FaDollarSign,
  FaChartLine,
  FaCalendarAlt,
  FaBullseye,
  FaRocket,
  FaGem,
  FaFire,
  FaArrowUp,
  FaCheckCircle,
  FaLock,
  FaGift,
  FaMedal,
  FaGlobe,
} from 'react-icons/fa';
import './AdvancedLeaderPool.css';

const AdvancedLeaderPool = ({ data, account }) => {
  const [activeTab, setActiveTab] = useState('qualification');
  const [selectedRank, setSelectedRank] = useState('silver-star');

  const leadershipRanks = [
    {
      id: 'bronze',
      name: 'Bronze Leader',
      requirements: {
        directReferrals: 3,
        teamVolume: 1000,
        personalVolume: 100,
        activeTeam: 5,
      },
      benefits: {
        poolShare: 2,
        monthlyBonus: 50,
        exclusiveEvents: false,
        prioritySupport: false,
      },
      color: '#cd7f32',
      icon: FaMedal,
      unlocked: true,
    },
    {
      id: 'silver-star',
      name: 'Silver Star',
      requirements: {
        directReferrals: 5,
        teamVolume: 2500,
        personalVolume: 200,
        activeTeam: 10,
      },
      benefits: {
        poolShare: 5,
        monthlyBonus: 150,
        exclusiveEvents: true,
        prioritySupport: true,
      },
      color: '#c0c0c0',
      icon: FaStar,
      unlocked: true,
      current: true,
    },
    {
      id: 'gold-crown',
      name: 'Gold Crown',
      requirements: {
        directReferrals: 10,
        teamVolume: 5000,
        personalVolume: 500,
        activeTeam: 25,
      },
      benefits: {
        poolShare: 10,
        monthlyBonus: 300,
        exclusiveEvents: true,
        prioritySupport: true,
        mentorshipProgram: true,
      },
      color: '#ffd700',
      icon: FaCrown,
      unlocked: false,
    },
    {
      id: 'platinum-elite',
      name: 'Platinum Elite',
      requirements: {
        directReferrals: 20,
        teamVolume: 10000,
        personalVolume: 1000,
        activeTeam: 50,
      },
      benefits: {
        poolShare: 20,
        monthlyBonus: 750,
        exclusiveEvents: true,
        prioritySupport: true,
        mentorshipProgram: true,
        revenueSplitter: true,
      },
      color: '#e5e4e2',
      icon: FaGem,
      unlocked: false,
    },
    {
      id: 'diamond-legend',
      name: 'Diamond Legend',
      requirements: {
        directReferrals: 50,
        teamVolume: 25000,
        personalVolume: 2000,
        activeTeam: 100,
      },
      benefits: {
        poolShare: 35,
        monthlyBonus: 1500,
        exclusiveEvents: true,
        prioritySupport: true,
        mentorshipProgram: true,
        revenueSplitter: true,
        boardAdvisor: true,
      },
      color: '#b9f2ff',
      icon: FaGem,
      unlocked: false,
    },
  ];

  const currentStats = {
    directReferrals: 3,
    teamVolume: 2400,
    personalVolume: 200,
    activeTeam: 8,
    currentRank: 'silver-star',
    poolEarnings: 45.3,
    monthlyDistribution: 1200,
    ranking: 156,
    totalLeaders: 892,
  };

  const leaderboard = [
    {
      rank: 1,
      name: 'Alexandra Chen',
      earnings: 2400,
      team: 150,
      badge: 'diamond-legend',
    },
    {
      rank: 2,
      name: 'Marcus Rodriguez',
      earnings: 2100,
      team: 125,
      badge: 'platinum-elite',
    },
    {
      rank: 3,
      name: 'Sarah Johnson',
      earnings: 1800,
      team: 98,
      badge: 'platinum-elite',
    },
    {
      rank: 4,
      name: 'David Kim',
      earnings: 1650,
      team: 85,
      badge: 'gold-crown',
    },
    {
      rank: 5,
      name: 'Emily Davis',
      earnings: 1500,
      team: 72,
      badge: 'gold-crown',
    },
    {
      rank: 156,
      name: 'You',
      earnings: 45,
      team: 8,
      badge: 'silver-star',
      highlight: true,
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Leadership Mastery Workshop',
      date: '2024-07-15',
      type: 'Workshop',
      exclusive: true,
      participants: 45,
    },
    {
      id: 2,
      title: 'Elite Strategy Summit',
      date: '2024-07-22',
      type: 'Summit',
      exclusive: true,
      participants: 25,
    },
    {
      id: 3,
      title: 'Monthly Leaders Call',
      date: '2024-07-30',
      type: 'Call',
      exclusive: false,
      participants: 200,
    },
  ];

  const calculateProgress = (requirement, current) => {
    return Math.min((current / requirement) * 100, 100);
  };

  const getNextRank = () => {
    const currentIndex = leadershipRanks.findIndex(rank => rank.current);
    return currentIndex < leadershipRanks.length - 1
      ? leadershipRanks[currentIndex + 1]
      : null;
  };

  const renderQualificationTab = () => {
    const nextRank = getNextRank();

    return (
      <div className="qualification-section">
        {/* Current Status */}
        <div className="current-status">
          <motion.div
            className="status-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="status-header">
              <div className="rank-badge current">
                <FaStar />
                <span>Silver Star Leader</span>
              </div>
              <div className="status-metrics">
                <div className="metric">
                  <span className="metric-value">
                    ${currentStats.poolEarnings.toFixed(2)}
                  </span>
                  <span className="metric-label">Monthly Earnings</span>
                </div>
                <div className="metric">
                  <span className="metric-value">#{currentStats.ranking}</span>
                  <span className="metric-label">Global Ranking</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Requirements Progress */}
        <div className="requirements-progress">
          <h3>🎯 Current Rank Requirements</h3>
          <div className="requirements-grid">
            {Object.entries(
              leadershipRanks.find(r => r.current).requirements
            ).map(([key, requirement]) => {
              const current = currentStats[key] || 0;
              const progress = calculateProgress(requirement, current);

              return (
                <motion.div
                  key={key}
                  className="requirement-card"
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="requirement-header">
                    <h4>
                      {key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())}
                    </h4>
                    <div
                      className={`requirement-status ${progress >= 100 ? 'completed' : 'in-progress'}`}
                    >
                      {progress >= 100 ? <FaCheckCircle /> : <FaBullseye />}
                    </div>
                  </div>

                  <div className="requirement-progress">
                    <div className="progress-numbers">
                      <span className="current">{current}</span>
                      <span className="separator">/</span>
                      <span className="required">{requirement}</span>
                    </div>

                    <div className="progress-bar">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>

                    <div className="progress-percentage">
                      {progress.toFixed(1)}%
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Next Rank Preview */}
        {nextRank && (
          <div className="next-rank-preview">
            <h3>🚀 Next Rank: {nextRank.name}</h3>
            <div className="next-rank-card">
              <div className="rank-header">
                <div className="rank-icon" style={{ color: nextRank.color }}>
                  <nextRank.icon />
                </div>
                <div className="rank-info">
                  <h4>{nextRank.name}</h4>
                  <p>Unlock exclusive benefits and higher earnings</p>
                </div>
              </div>

              <div className="rank-benefits">
                <h5>Benefits You'll Unlock:</h5>
                <div className="benefits-list">
                  <div className="benefit">
                    <FaDollarSign />
                    <span>{nextRank.benefits.poolShare}% Pool Share</span>
                  </div>
                  <div className="benefit">
                    <FaGift />
                    <span>${nextRank.benefits.monthlyBonus} Monthly Bonus</span>
                  </div>
                  {nextRank.benefits.mentorshipProgram && (
                    <div className="benefit">
                      <FaUsers />
                      <span>Mentorship Program Access</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rank-requirements">
                <h5>Requirements to Achieve:</h5>
                <div className="requirements-summary">
                  {Object.entries(nextRank.requirements).map(
                    ([key, requirement]) => {
                      const current = currentStats[key] || 0;
                      const needed = Math.max(0, requirement - current);

                      return (
                        <div key={key} className="requirement-summary">
                          <span className="req-label">
                            {key
                              .replace(/([A-Z])/g, ' $1')
                              .replace(/^./, str => str.toUpperCase())}
                            :
                          </span>
                          <span
                            className={`req-value ${needed === 0 ? 'completed' : 'pending'}`}
                          >
                            {needed === 0
                              ? '✅ Complete'
                              : `${needed} more needed`}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLeaderboardTab = () => (
    <div className="leaderboard-section">
      <div className="leaderboard-header">
        <h3>🏆 Global Leadership Leaderboard</h3>
        <div className="leaderboard-stats">
          <div className="stat">
            <span className="stat-value">{currentStats.ranking}</span>
            <span className="stat-label">Your Rank</span>
          </div>
          <div className="stat">
            <span className="stat-value">{currentStats.totalLeaders}</span>
            <span className="stat-label">Total Leaders</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              ${currentStats.monthlyDistribution}
            </span>
            <span className="stat-label">Monthly Pool</span>
          </div>
        </div>
      </div>

      <div className="leaderboard-table">
        <div className="table-header">
          <span>Rank</span>
          <span>Leader</span>
          <span>Monthly Earnings</span>
          <span>Team Size</span>
          <span>Badge</span>
        </div>

        <div className="table-body">
          {leaderboard.map((leader, index) => (
            <motion.div
              key={leader.rank}
              className={`table-row ${leader.highlight ? 'highlight' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="rank-cell">
                <span
                  className={`rank-number ${leader.rank <= 3 ? 'top-three' : ''}`}
                >
                  #{leader.rank}
                </span>
                {leader.rank === 1 && <FaTrophy className="trophy gold" />}
                {leader.rank === 2 && <FaTrophy className="trophy silver" />}
                {leader.rank === 3 && <FaTrophy className="trophy bronze" />}
              </div>

              <div className="leader-cell">
                <div className="leader-info">
                  <span className="leader-name">{leader.name}</span>
                  {leader.highlight && <span className="you-badge">YOU</span>}
                </div>
              </div>

              <div className="earnings-cell">
                <span className="earnings-amount">${leader.earnings}</span>
              </div>

              <div className="team-cell">
                <span className="team-size">{leader.team} members</span>
              </div>

              <div className="badge-cell">
                <div className={`leader-badge ${leader.badge}`}>
                  {leadershipRanks.find(r => r.id === leader.badge)?.name}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="ranking-insights">
        <h4>📈 Ranking Insights</h4>
        <div className="insights-grid">
          <div className="insight-card">
            <h5>Performance Analysis</h5>
            <p>
              You're in the top 18% of all leaders. Increasing your team by 2
              active members could move you up 50+ positions.
            </p>
          </div>
          <div className="insight-card">
            <h5>Growth Opportunity</h5>
            <p>
              Leaders ranked 100-150 average $85/month. You're 47% of the way to
              breaking into this tier.
            </p>
          </div>
          <div className="insight-card">
            <h5>Next Milestone</h5>
            <p>
              Reaching rank #100 would put you in the top 12% and increase
              monthly earnings by an estimated $40.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBenefitsTab = () => (
    <div className="benefits-section">
      <h3>👑 Leadership Benefits & Privileges</h3>

      {/* Current Benefits */}
      <div className="current-benefits">
        <h4>Your Current Benefits (Silver Star)</h4>
        <div className="benefits-grid">
          <div className="benefit-card active">
            <div className="benefit-icon">
              <FaDollarSign />
            </div>
            <h5>5% Pool Share</h5>
            <p>Earn 5% of the monthly leader pool distribution</p>
            <div className="benefit-value">Current: $45.30/month</div>
          </div>

          <div className="benefit-card active">
            <div className="benefit-icon">
              <FaGift />
            </div>
            <h5>Monthly Bonus</h5>
            <p>Receive $150 monthly leadership bonus</p>
            <div className="benefit-value">Next payout: July 1st</div>
          </div>

          <div className="benefit-card active">
            <div className="benefit-icon">
              <FaCalendarAlt />
            </div>
            <h5>Exclusive Events</h5>
            <p>Access to leadership workshops and networking events</p>
            <div className="benefit-value">3 events this month</div>
          </div>

          <div className="benefit-card active">
            <div className="benefit-icon">
              <FaShieldAlt />
            </div>
            <h5>Priority Support</h5>
            <p>24/7 dedicated support channel for leaders</p>
            <div className="benefit-value">Response time: &lt;2 hours</div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="upcoming-events">
        <h4>🎯 Exclusive Leadership Events</h4>
        <div className="events-list">
          {upcomingEvents.map(event => (
            <motion.div
              key={event.id}
              className={`event-card ${event.exclusive ? 'exclusive' : 'general'}`}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="event-header">
                <h5>{event.title}</h5>
                {event.exclusive && (
                  <span className="exclusive-badge">Exclusive</span>
                )}
              </div>

              <div className="event-details">
                <div className="event-meta">
                  <span className="event-date">
                    <FaCalendarAlt />
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  <span className="event-type">{event.type}</span>
                  <span className="event-participants">
                    <FaUsers />
                    {event.participants} attending
                  </span>
                </div>
              </div>

              <div className="event-action">
                <button className="event-btn">
                  {event.exclusive ? 'Reserved Spot' : 'Register Now'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rank Comparison */}
      <div className="rank-comparison">
        <h4>🏅 All Leadership Ranks</h4>
        <div className="ranks-grid">
          {leadershipRanks.map(rank => (
            <motion.div
              key={rank.id}
              className={`rank-card ${rank.current ? 'current' : ''} ${rank.unlocked ? 'unlocked' : 'locked'}`}
              style={{ '--rank-color': rank.color }}
              whileHover={{ scale: rank.unlocked ? 1.02 : 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="rank-header">
                <div className="rank-icon">
                  <rank.icon />
                </div>
                <h5>{rank.name}</h5>
                {rank.current && <span className="current-badge">Current</span>}
                {!rank.unlocked && <FaLock className="lock-icon" />}
              </div>

              <div className="rank-benefits">
                <div className="benefit-item">
                  <FaDollarSign />
                  <span>{rank.benefits.poolShare}% Pool Share</span>
                </div>
                <div className="benefit-item">
                  <FaGift />
                  <span>${rank.benefits.monthlyBonus} Monthly</span>
                </div>
                {rank.benefits.mentorshipProgram && (
                  <div className="benefit-item">
                    <FaUsers />
                    <span>Mentorship Program</span>
                  </div>
                )}
                {rank.benefits.revenueSplitter && (
                  <div className="benefit-item">
                    <FaChartLine />
                    <span>Revenue Splitter</span>
                  </div>
                )}
              </div>

              <div className="rank-requirements">
                <div className="req-item">
                  <span>
                    Direct Referrals: {rank.requirements.directReferrals}
                  </span>
                </div>
                <div className="req-item">
                  <span>Team Volume: ${rank.requirements.teamVolume}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="advanced-leader-pool">
      <div className="section-header">
        <h2>👑 Leader Pool - Elite Leadership Program</h2>
        <p>
          Join the elite circle of leaders and unlock exclusive benefits and
          higher earnings
        </p>
      </div>

      <div className="section-tabs">
        <button
          className={`tab ${activeTab === 'qualification' ? 'active' : ''}`}
          onClick={() => setActiveTab('qualification')}
        >
          <FaBullseye /> Qualification
        </button>
        <button
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <FaTrophy /> Leaderboard
        </button>
        <button
          className={`tab ${activeTab === 'benefits' ? 'active' : ''}`}
          onClick={() => setActiveTab('benefits')}
        >
          <FaCrown /> Benefits
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
          {activeTab === 'qualification' && renderQualificationTab()}
          {activeTab === 'leaderboard' && renderLeaderboardTab()}
          {activeTab === 'benefits' && renderBenefitsTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdvancedLeaderPool;
