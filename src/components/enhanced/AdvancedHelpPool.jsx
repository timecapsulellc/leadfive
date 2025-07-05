/**
 * Advanced Help Pool Section - PhD-Level Enhancement
 * Features: Community visualization, distribution timeline, impact tracking,
 * helping statistics, and social responsibility dashboard
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHandsHelping,
  FaHeart,
  FaGlobe,
  FaUsers,
  FaDollarSign,
  FaCalendarAlt,
  FaChartPie,
  FaGift,
  FaHandHoldingUsd,
  FaBullseye,
  FaRocket,
  FaClock,
  FaCheckCircle,
  FaArrowUp,
  FaStar,
  FaShieldAlt,
  FaLeaf,
  FaSmile,
} from 'react-icons/fa';
import './AdvancedHelpPool.css';

const AdvancedHelpPool = ({ data, account }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');

  const helpPoolData = {
    totalDistributed: 15420.5,
    yourEarnings: 111.48,
    thisWeekDistribution: 2840.75,
    nextDistribution: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    eligibleMembers: 1247,
    yourEligibility: 'qualified',
    communityImpact: {
      familiesHelped: 892,
      educationSupport: 156,
      emergencyAid: 67,
      businessGrants: 23,
    },
    weeklyGrowth: 15.3,
    participationRate: 78.5,
  };

  const distributionHistory = [
    { week: 'Week 1', amount: 2650.3, recipients: 1156, yourShare: 28.45 },
    { week: 'Week 2', amount: 2780.15, recipients: 1189, yourShare: 29.8 },
    { week: 'Week 3', amount: 2920.45, recipients: 1223, yourShare: 31.25 },
    { week: 'Week 4', amount: 2840.75, recipients: 1247, yourShare: 30.98 },
  ];

  const impactStories = [
    {
      id: 1,
      title: "Maria's Education Fund",
      description:
        'Helped fund university tuition for a single mother in Brazil',
      amount: 2500,
      category: 'education',
      impact: 'Changed life trajectory',
      date: '2024-06-20',
    },
    {
      id: 2,
      title: 'Small Business Recovery',
      description: 'Emergency support for flood-damaged family restaurant',
      amount: 3200,
      category: 'business',
      impact: '12 jobs saved',
      date: '2024-06-15',
    },
    {
      id: 3,
      title: 'Medical Emergency Aid',
      description: 'Critical surgery funding for community member',
      amount: 4800,
      category: 'medical',
      impact: 'Life saved',
      date: '2024-06-10',
    },
  ];

  const eligibilityCriteria = [
    {
      criterion: 'Active Account',
      status: 'met',
      description: 'Account active for 30+ days',
    },
    {
      criterion: 'Minimum Investment',
      status: 'met',
      description: '$50+ total investment',
    },
    {
      criterion: 'Community Participation',
      status: 'met',
      description: 'Regular platform engagement',
    },
    {
      criterion: 'Good Standing',
      status: 'met',
      description: 'No violations or penalties',
    },
  ];

  const globalImpact = {
    countries: 47,
    continents: 6,
    totalBeneficiaries: 15420,
    categories: {
      education: 35,
      healthcare: 25,
      business: 20,
      emergency: 15,
      community: 5,
    },
  };

  const renderOverviewTab = () => (
    <div className="help-pool-overview">
      {/* Hero Metrics */}
      <div className="hero-metrics">
        <motion.div
          className="metric-card primary"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="metric-icon">
            <FaHandsHelping />
          </div>
          <div className="metric-content">
            <h3>Your Help Pool Earnings</h3>
            <div className="metric-value">
              ${helpPoolData.yourEarnings.toFixed(2)}
            </div>
            <div className="metric-change positive">
              <FaArrowUp /> +$12.50 this week
            </div>
          </div>
          <div className="metric-badge qualified">
            <FaCheckCircle /> Qualified
          </div>
        </motion.div>

        <motion.div
          className="metric-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="metric-icon">
            <FaDollarSign />
          </div>
          <div className="metric-content">
            <h3>This Week's Pool</h3>
            <div className="metric-value">
              ${helpPoolData.thisWeekDistribution.toFixed(2)}
            </div>
            <div className="metric-meta">
              {helpPoolData.eligibleMembers} eligible members
            </div>
          </div>
        </motion.div>

        <motion.div
          className="metric-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="metric-icon">
            <FaGlobe />
          </div>
          <div className="metric-content">
            <h3>Community Impact</h3>
            <div className="metric-value">
              {helpPoolData.communityImpact.familiesHelped}
            </div>
            <div className="metric-meta">Families helped this month</div>
          </div>
        </motion.div>

        <motion.div
          className="metric-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="metric-icon">
            <FaClock />
          </div>
          <div className="metric-content">
            <h3>Next Distribution</h3>
            <div className="metric-value">
              {Math.ceil(
                (helpPoolData.nextDistribution - new Date()) /
                  (1000 * 60 * 60 * 24)
              )}{' '}
              days
            </div>
            <div className="metric-meta">
              {helpPoolData.nextDistribution.toLocaleDateString()}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Eligibility Status */}
      <div className="eligibility-status">
        <h3>✅ Your Eligibility Status</h3>
        <div className="eligibility-grid">
          {eligibilityCriteria.map((criterion, index) => (
            <motion.div
              key={index}
              className={`eligibility-card ${criterion.status}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="criterion-header">
                <span className="criterion-name">{criterion.criterion}</span>
                <div className={`status-indicator ${criterion.status}`}>
                  {criterion.status === 'met' ? <FaCheckCircle /> : <FaClock />}
                </div>
              </div>
              <p className="criterion-description">{criterion.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Distribution Breakdown */}
      <div className="distribution-breakdown">
        <h3>💰 30% Pool Distribution Breakdown</h3>
        <div className="breakdown-visual">
          <div className="pool-chart">
            <div className="chart-center">
              <span className="pool-percentage">30%</span>
              <span className="pool-label">Help Pool</span>
            </div>
            <div className="chart-segments">
              <div
                className="segment education"
                style={{ '--percentage': '35%' }}
              >
                <span>Education 35%</span>
              </div>
              <div
                className="segment healthcare"
                style={{ '--percentage': '25%' }}
              >
                <span>Healthcare 25%</span>
              </div>
              <div
                className="segment business"
                style={{ '--percentage': '20%' }}
              >
                <span>Business 20%</span>
              </div>
              <div
                className="segment emergency"
                style={{ '--percentage': '15%' }}
              >
                <span>Emergency 15%</span>
              </div>
              <div
                className="segment community"
                style={{ '--percentage': '5%' }}
              >
                <span>Community 5%</span>
              </div>
            </div>
          </div>

          <div className="breakdown-details">
            <div className="detail-item education">
              <div className="detail-icon">
                <FaGift />
              </div>
              <div className="detail-content">
                <h4>Education Support</h4>
                <p>Scholarships, tuition assistance, and learning resources</p>
                <span className="detail-amount">
                  ${(helpPoolData.thisWeekDistribution * 0.35).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="detail-item healthcare">
              <div className="detail-icon">
                <FaHeart />
              </div>
              <div className="detail-content">
                <h4>Healthcare Aid</h4>
                <p>
                  Medical expenses, emergency treatments, and wellness programs
                </p>
                <span className="detail-amount">
                  ${(helpPoolData.thisWeekDistribution * 0.25).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="detail-item business">
              <div className="detail-icon">
                <FaRocket />
              </div>
              <div className="detail-content">
                <h4>Business Grants</h4>
                <p>
                  Startup funding, equipment purchases, and business development
                </p>
                <span className="detail-amount">
                  ${(helpPoolData.thisWeekDistribution * 0.2).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Impact Stories */}
      <div className="impact-stories">
        <h3>❤️ Recent Impact Stories</h3>
        <div className="stories-grid">
          {impactStories.map(story => (
            <motion.div
              key={story.id}
              className={`story-card ${story.category}`}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="story-header">
                <h4>{story.title}</h4>
                <span className={`category-badge ${story.category}`}>
                  {story.category}
                </span>
              </div>

              <p className="story-description">{story.description}</p>

              <div className="story-metrics">
                <div className="story-amount">${story.amount}</div>
                <div className="story-impact">{story.impact}</div>
              </div>

              <div className="story-date">
                <FaCalendarAlt />
                <span>{new Date(story.date).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDistributionTab = () => (
    <div className="distribution-timeline">
      <div className="timeline-controls">
        <h3>📅 Distribution Timeline</h3>
        <div className="period-selector">
          <button
            className={selectedPeriod === 'weekly' ? 'active' : ''}
            onClick={() => setSelectedPeriod('weekly')}
          >
            Weekly
          </button>
          <button
            className={selectedPeriod === 'monthly' ? 'active' : ''}
            onClick={() => setSelectedPeriod('monthly')}
          >
            Monthly
          </button>
          <button
            className={selectedPeriod === 'yearly' ? 'active' : ''}
            onClick={() => setSelectedPeriod('yearly')}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Distribution History Chart */}
      <div className="distribution-chart">
        <h4>Distribution History</h4>
        <div className="chart-container">
          <div className="chart-bars">
            {distributionHistory.map((week, index) => (
              <motion.div
                key={week.week}
                className="chart-bar"
                initial={{ height: 0 }}
                animate={{ height: `${(week.amount / 3000) * 100}%` }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="bar-value">${week.amount.toFixed(0)}</div>
                <div className="bar-label">{week.week}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Distribution Table */}
      <div className="distribution-table">
        <h4>Your Distribution History</h4>
        <div className="table-container">
          <div className="table-header">
            <span>Period</span>
            <span>Pool Total</span>
            <span>Recipients</span>
            <span>Your Share</span>
            <span>Status</span>
          </div>

          <div className="table-body">
            {distributionHistory.map((period, index) => (
              <motion.div
                key={period.week}
                className="table-row"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="period-cell">{period.week}</span>
                <span className="total-cell">${period.amount.toFixed(2)}</span>
                <span className="recipients-cell">{period.recipients}</span>
                <span className="share-cell">
                  ${period.yourShare.toFixed(2)}
                </span>
                <span className="status-cell">
                  <div className="status-badge completed">
                    <FaCheckCircle /> Distributed
                  </div>
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Distribution Countdown */}
      <div className="next-distribution">
        <h4>⏰ Next Distribution Countdown</h4>
        <div className="countdown-card">
          <div className="countdown-timer">
            <div className="timer-segment">
              <span className="timer-value">3</span>
              <span className="timer-label">Days</span>
            </div>
            <div className="timer-segment">
              <span className="timer-value">14</span>
              <span className="timer-label">Hours</span>
            </div>
            <div className="timer-segment">
              <span className="timer-value">32</span>
              <span className="timer-label">Minutes</span>
            </div>
          </div>

          <div className="distribution-preview">
            <h5>Estimated Next Distribution</h5>
            <div className="preview-metrics">
              <div className="preview-metric">
                <span>Pool Size</span>
                <span className="value">$3,200 - $3,400</span>
              </div>
              <div className="preview-metric">
                <span>Your Estimated Share</span>
                <span className="value">$32 - $35</span>
              </div>
              <div className="preview-metric">
                <span>Recipients</span>
                <span className="value">~1,280 members</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderImpactTab = () => (
    <div className="global-impact">
      <h3>🌍 Global Community Impact</h3>

      {/* Global Statistics */}
      <div className="global-stats">
        <div className="stats-grid">
          <motion.div
            className="stat-card countries"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="stat-icon">
              <FaGlobe />
            </div>
            <div className="stat-value">{globalImpact.countries}</div>
            <div className="stat-label">Countries Reached</div>
          </motion.div>

          <motion.div
            className="stat-card beneficiaries"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-value">
              {globalImpact.totalBeneficiaries.toLocaleString()}
            </div>
            <div className="stat-label">Lives Impacted</div>
          </motion.div>

          <motion.div
            className="stat-card distributed"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="stat-icon">
              <FaDollarSign />
            </div>
            <div className="stat-value">
              ${helpPoolData.totalDistributed.toLocaleString()}
            </div>
            <div className="stat-label">Total Distributed</div>
          </motion.div>

          <motion.div
            className="stat-card growth"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="stat-icon">
              <FaArrowUp />
            </div>
            <div className="stat-value">{helpPoolData.weeklyGrowth}%</div>
            <div className="stat-label">Weekly Growth</div>
          </motion.div>
        </div>
      </div>

      {/* Impact Categories */}
      <div className="impact-categories">
        <h4>📊 Impact by Category</h4>
        <div className="categories-grid">
          {Object.entries(globalImpact.categories).map(
            ([category, percentage]) => (
              <div key={category} className={`category-card ${category}`}>
                <div className="category-header">
                  <div className="category-icon">
                    {category === 'education' && <FaGift />}
                    {category === 'healthcare' && <FaHeart />}
                    {category === 'business' && <FaRocket />}
                    {category === 'emergency' && <FaShieldAlt />}
                    {category === 'community' && <FaUsers />}
                  </div>
                  <h5>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h5>
                </div>

                <div className="category-percentage">
                  <span className="percentage-value">{percentage}%</span>
                  <div className="percentage-bar">
                    <div
                      className="percentage-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="category-impact">
                  <span>
                    $
                    {(
                      (helpPoolData.totalDistributed * percentage) /
                      100
                    ).toFixed(0)}{' '}
                    distributed
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Success Metrics */}
      <div className="success-metrics">
        <h4>🏆 Success Metrics</h4>
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-icon">
              <FaStar />
            </div>
            <div className="metric-content">
              <h5>Success Rate</h5>
              <div className="metric-value">94.7%</div>
              <p>of funded projects achieved their goals</p>
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-icon">
              <FaSmile />
            </div>
            <div className="metric-content">
              <h5>Satisfaction Score</h5>
              <div className="metric-value">9.2/10</div>
              <p>average recipient satisfaction rating</p>
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-icon">
              <FaLeaf />
            </div>
            <div className="metric-content">
              <h5>Sustainability</h5>
              <div className="metric-value">87%</div>
              <p>of business grants still active after 1 year</p>
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-icon">
              <FaBullseye />
            </div>
            <div className="metric-content">
              <h5>Efficiency</h5>
              <div className="metric-value">96.2%</div>
              <p>of funds reach intended beneficiaries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Your Impact Contribution */}
      <div className="your-contribution">
        <h4>💝 Your Impact Contribution</h4>
        <div className="contribution-card">
          <div className="contribution-header">
            <h5>Your Help Pool Participation</h5>
            <span className="participation-badge excellent">Excellent</span>
          </div>

          <div className="contribution-stats">
            <div className="contrib-stat">
              <span className="stat-label">Total Received</span>
              <span className="stat-value">
                ${helpPoolData.yourEarnings.toFixed(2)}
              </span>
            </div>
            <div className="contrib-stat">
              <span className="stat-label">Weeks Participated</span>
              <span className="stat-value">16</span>
            </div>
            <div className="contrib-stat">
              <span className="stat-label">Community Rank</span>
              <span className="stat-value">#342</span>
            </div>
            <div className="contrib-stat">
              <span className="stat-label">Impact Score</span>
              <span className="stat-value">8.7/10</span>
            </div>
          </div>

          <div className="contribution-message">
            <p>
              Through your participation, you've helped contribute to{' '}
              {Math.floor(helpPoolData.yourEarnings / 10)}
              different impact projects. Your involvement makes a real
              difference in building a stronger, more supportive global
              community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="advanced-help-pool">
      <div className="section-header">
        <h2>🤝 Help Pool - Community Support System</h2>
        <p>
          Join our global community in making a positive impact while earning
          from the 30% help pool
        </p>
      </div>

      <div className="section-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaHandsHelping /> Overview
        </button>
        <button
          className={`tab ${activeTab === 'distribution' ? 'active' : ''}`}
          onClick={() => setActiveTab('distribution')}
        >
          <FaCalendarAlt /> Distribution
        </button>
        <button
          className={`tab ${activeTab === 'impact' ? 'active' : ''}`}
          onClick={() => setActiveTab('impact')}
        >
          <FaGlobe /> Global Impact
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
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'distribution' && renderDistributionTab()}
          {activeTab === 'impact' && renderImpactTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdvancedHelpPool;
