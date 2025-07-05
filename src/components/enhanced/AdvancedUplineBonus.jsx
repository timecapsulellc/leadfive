/**
 * Advanced Upline Bonus Section - PhD-Level Enhancement
 * Features: Upline structure visualization, bonus distribution tracking,
 * genealogy path display, and performance analytics
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaNetworkWired,
  FaDollarSign,
  FaChartLine,
  FaUsers,
  FaTrophy,
  FaArrowUp,
  FaLayerGroup,
  FaCrown,
  FaGift,
  FaCalendarAlt,
  FaEye,
  FaShare,
  FaDownload,
  FaInfoCircle,
  FaChartBar,
} from 'react-icons/fa';
import './AdvancedUplineBonus.css';

const AdvancedUplineBonus = ({ data, account }) => {
  const [activeView, setActiveView] = useState('structure');
  const [uplineData] = useState({
    totalEarnings: data?.uplineBonusEarnings || 45.3,
    thisMonth: 15.2,
    avgMonthly: 22.65,
    uplinePosition: 3,
    totalUplineMembers: 8,
    activeUplineMembers: 6,
    uplineLevels: 5,
    nextDistribution: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    performance: 'excellent',
  });

  const [uplineStructure] = useState([
    {
      level: 1,
      name: 'David Wilson',
      address: '0x123a...891f',
      package: 200,
      contribution: 18.5,
      joinDate: '2024-05-10',
      status: 'active',
      performance: 'excellent',
      volume: 2400,
      directReferrals: 8,
    },
    {
      level: 2,
      name: 'Jennifer Lee',
      address: '0x456b...234c',
      package: 100,
      contribution: 12.8,
      joinDate: '2024-04-22',
      status: 'active',
      performance: 'good',
      volume: 1800,
      directReferrals: 5,
    },
    {
      level: 3,
      name: 'Michael Rodriguez',
      address: '0x789c...567d',
      package: 200,
      contribution: 8.2,
      joinDate: '2024-04-01',
      status: 'active',
      performance: 'good',
      volume: 1200,
      directReferrals: 3,
    },
    {
      level: 4,
      name: 'Sarah Thompson',
      address: '0x012d...890e',
      package: 100,
      contribution: 4.8,
      joinDate: '2024-03-15',
      status: 'active',
      performance: 'average',
      volume: 800,
      directReferrals: 2,
    },
    {
      level: 5,
      name: 'Robert Chen',
      address: '0x345e...123f',
      package: 50,
      contribution: 1.0,
      joinDate: '2024-02-28',
      status: 'inactive',
      performance: 'low',
      volume: 400,
      directReferrals: 1,
    },
  ]);

  const distributionStructure = [
    { level: 1, percentage: 5, color: '#4facfe' },
    { level: 2, percentage: 2, color: '#00c9ff' },
    { level: 3, percentage: 1.5, color: '#667eea' },
    { level: 4, percentage: 1, color: '#764ba2' },
    { level: 5, percentage: 0.5, color: '#a8edea' },
  ];

  const calculateDistributionAmount = (level, totalVolume = 1000) => {
    const levelData = distributionStructure.find(d => d.level === level);
    return (totalVolume * (levelData?.percentage || 0)) / 100;
  };

  const renderStructureView = () => (
    <div className="upline-structure">
      {/* Overview Cards */}
      <div className="structure-overview">
        <motion.div
          className="overview-card primary"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="card-icon">
            <FaDollarSign />
          </div>
          <div className="card-content">
            <h3>Total Upline Earnings</h3>
            <div className="card-value">
              ${uplineData.totalEarnings.toFixed(2)}
            </div>
            <div className="card-change positive">
              <FaArrowUp /> +${uplineData.thisMonth} this month
            </div>
          </div>
        </motion.div>

        <motion.div
          className="overview-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="card-icon">
            <FaLayerGroup />
          </div>
          <div className="card-content">
            <h3>Upline Position</h3>
            <div className="card-value">Level {uplineData.uplinePosition}</div>
            <div className="card-meta">
              {uplineData.uplineLevels} total levels
            </div>
          </div>
        </motion.div>

        <motion.div
          className="overview-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="card-icon">
            <FaUsers />
          </div>
          <div className="card-content">
            <h3>Upline Members</h3>
            <div className="card-value">
              {uplineData.activeUplineMembers}/{uplineData.totalUplineMembers}
            </div>
            <div className="card-meta">Active contributors</div>
          </div>
        </motion.div>

        <motion.div
          className="overview-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="card-icon">
            <FaChartLine />
          </div>
          <div className="card-content">
            <h3>Monthly Average</h3>
            <div className="card-value">
              ${uplineData.avgMonthly.toFixed(2)}
            </div>
            <div className="card-meta">Last 6 months</div>
          </div>
        </motion.div>
      </div>

      {/* Distribution Structure */}
      <div className="distribution-structure">
        <h3>💰 Upline Bonus Distribution (10% Total)</h3>
        <div className="distribution-grid">
          {distributionStructure.map(dist => (
            <motion.div
              key={dist.level}
              className="distribution-level"
              style={{ '--level-color': dist.color }}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="level-header">
                <span className="level-number">Level {dist.level}</span>
                <span className="level-percentage">{dist.percentage}%</span>
              </div>
              <div className="level-amount">
                ${calculateDistributionAmount(dist.level).toFixed(2)}
              </div>
              <div className="level-description">Per $1000 investment</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upline Member List */}
      <div className="upline-members">
        <h3>🌟 Your Upline Structure</h3>
        <div className="members-list">
          {uplineStructure.map(member => (
            <motion.div
              key={member.level}
              className={`member-card level-${member.level} ${member.status}`}
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="member-level">
                <span className="level-badge">L{member.level}</span>
              </div>

              <div className="member-info">
                <h4>{member.name}</h4>
                <span className="member-address">{member.address}</span>
                <div className="member-stats">
                  <span className="stat">
                    <FaDollarSign /> ${member.package} Package
                  </span>
                  <span className="stat">
                    <FaUsers /> {member.directReferrals} Referrals
                  </span>
                  <span className="stat">
                    <FaChartBar /> ${member.volume} Volume
                  </span>
                </div>
              </div>

              <div className="member-contribution">
                <div className="contribution-amount">
                  ${member.contribution.toFixed(2)}
                </div>
                <div className="contribution-label">Your earnings</div>
              </div>

              <div className="member-performance">
                <div className={`performance-indicator ${member.performance}`}>
                  {member.performance === 'excellent' && <FaTrophy />}
                  {member.performance === 'good' && <FaChartLine />}
                  {member.performance === 'average' && <FaUsers />}
                  {member.performance === 'low' && <FaInfoCircle />}
                  {member.performance}
                </div>
                <div className={`status-indicator ${member.status}`}>
                  {member.status}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalyticsView = () => (
    <div className="upline-analytics">
      <h3>📊 Upline Performance Analytics</h3>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h4>Monthly Earnings Trend</h4>
          <div className="chart-container">
            <div className="earnings-chart">
              <div className="chart-bars">
                <div className="bar" style={{ height: '60%' }}>
                  Jan<span>$18</span>
                </div>
                <div className="bar" style={{ height: '75%' }}>
                  Feb<span>$22</span>
                </div>
                <div className="bar" style={{ height: '90%' }}>
                  Mar<span>$28</span>
                </div>
                <div className="bar" style={{ height: '85%' }}>
                  Apr<span>$25</span>
                </div>
                <div className="bar" style={{ height: '100%' }}>
                  May<span>$32</span>
                </div>
                <div className="bar" style={{ height: '95%' }}>
                  Jun<span>$30</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h4>Level Contribution Breakdown</h4>
          <div className="contribution-breakdown">
            {uplineStructure.slice(0, 3).map(member => (
              <div key={member.level} className="contribution-item">
                <div className="item-info">
                  <span className="item-level">Level {member.level}</span>
                  <span className="item-name">{member.name}</span>
                </div>
                <div className="item-amount">
                  ${member.contribution.toFixed(2)}
                </div>
                <div className="item-percentage">
                  {(
                    (member.contribution / uplineData.totalEarnings) *
                    100
                  ).toFixed(1)}
                  %
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h4>Performance Metrics</h4>
          <div className="performance-metrics">
            <div className="metric-item">
              <span className="metric-label">Growth Rate</span>
              <span className="metric-value positive">+35%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Consistency Score</span>
              <span className="metric-value excellent">9.2/10</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Network Health</span>
              <span className="metric-value good">Strong</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Next Payout</span>
              <span className="metric-value">
                {uplineData.nextDistribution.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Projection Analysis */}
      <div className="projection-analysis">
        <h4>🔮 Earnings Projections</h4>
        <div className="projection-grid">
          <div className="projection-card">
            <div className="projection-title">Next Month</div>
            <div className="projection-amount">$28 - $35</div>
            <div className="projection-confidence">85% confidence</div>
          </div>
          <div className="projection-card">
            <div className="projection-title">Next Quarter</div>
            <div className="projection-amount">$95 - $120</div>
            <div className="projection-confidence">75% confidence</div>
          </div>
          <div className="projection-card">
            <div className="projection-title">Year End</div>
            <div className="projection-amount">$380 - $480</div>
            <div className="projection-confidence">70% confidence</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGenealogyView = () => (
    <div className="genealogy-view">
      <h3>🌳 Complete Genealogy Path</h3>

      <div className="genealogy-tree">
        <div className="tree-container">
          {uplineStructure.map((member, index) => (
            <React.Fragment key={member.level}>
              {index > 0 && <div className="tree-connector" />}
              <motion.div
                className={`tree-node ${member.status}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="node-level">L{member.level}</div>
                <div className="node-info">
                  <div className="node-name">{member.name}</div>
                  <div className="node-package">${member.package}</div>
                </div>
                <div className="node-contribution">
                  ${member.contribution.toFixed(2)}
                </div>
              </motion.div>
            </React.Fragment>
          ))}

          {/* Your Position */}
          <div className="tree-connector" />
          <motion.div
            className="tree-node current-user"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="node-level">YOU</div>
            <div className="node-info">
              <div className="node-name">Your Position</div>
              <div className="node-package">${data?.currentPackage || 100}</div>
            </div>
            <div className="node-earning">Receiving</div>
          </motion.div>
        </div>
      </div>

      <div className="genealogy-insights">
        <div className="insight-card">
          <h4>📈 Network Strength</h4>
          <p>
            Your upline shows strong performance with{' '}
            {uplineData.activeUplineMembers} active members contributing to your
            bonus earnings.
          </p>
        </div>
        <div className="insight-card">
          <h4>💡 Optimization Tips</h4>
          <p>
            Consider upgrading your package to maximize upline bonus eligibility
            and strengthen your position in the network.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="advanced-upline-bonus">
      <div className="section-header">
        <h2>🏗️ Upline Bonus Structure - 10% Distribution</h2>
        <p>
          Earn from your upline network's success with our multi-level bonus
          system
        </p>
      </div>

      <div className="section-tabs">
        <button
          className={`tab ${activeView === 'structure' ? 'active' : ''}`}
          onClick={() => setActiveView('structure')}
        >
          <FaNetworkWired /> Structure
        </button>
        <button
          className={`tab ${activeView === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveView('analytics')}
        >
          <FaChartLine /> Analytics
        </button>
        <button
          className={`tab ${activeView === 'genealogy' ? 'active' : ''}`}
          onClick={() => setActiveView('genealogy')}
        >
          <FaLayerGroup /> Genealogy
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
          {activeView === 'structure' && renderStructureView()}
          {activeView === 'analytics' && renderAnalyticsView()}
          {activeView === 'genealogy' && renderGenealogyView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdvancedUplineBonus;
