/**
 * Advanced My Team Section - PhD-Level Enhancement
 * Features: Network visualization, team analytics, growth tracking,
 * performance insights, and team management tools
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers,
  FaNetworkWired,
  FaChartLine,
  FaDollarSign,
  FaTrophy,
  FaRocket,
  FaEye,
  FaSearch,
  FaFilter,
  FaDownload,
  FaShareAlt,
  FaUserPlus,
  FaChartPie,
  FaBullseye,
  FaArrowUp,
  FaFire,
  FaStar,
  FaSitemap,
  FaMoneyBillWave,
} from 'react-icons/fa';
// CleanBinaryTree removed - using navigation-only approach
import './AdvancedMyTeam.css';

const AdvancedMyTeam = ({ data, account, navigate, treeData }) => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [teamFilter, setTeamFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const teamStats = {
    totalSize: data?.team?.teamSize || 0,
    directReferrals: data?.referrals?.directReferrals || 0,
    activeMembers: data?.team?.activeMembers || 0,
    totalVolume: data?.team?.totalVolume || 0,
    thisMonthGrowth: data?.team?.growth || 0,
    avgMemberValue: data?.team?.avgValue || 0,
    teamLevels: data?.team?.levels || 0,
    topPerformers: data?.team?.topPerformers || 0,
  };

  const teamMembers = data?.team?.members || [];

  const performanceMetrics = [
    { label: 'Active Rate', value: 72, target: 80, status: 'warning' },
    {
      label: 'Avg Volume/Member',
      value: 500,
      target: 400,
      status: 'excellent',
    },
    { label: 'Growth Rate', value: 15.3, target: 12, status: 'excellent' },
    { label: 'Retention Rate', value: 85, target: 75, status: 'excellent' },
  ];

  const growthHistory = data?.team?.growthHistory || [];

  const countryDistribution = [
    { country: 'United States', members: 12, percentage: 48 },
    { country: 'Canada', members: 5, percentage: 20 },
    { country: 'United Kingdom', members: 3, percentage: 12 },
    { country: 'Australia', members: 3, percentage: 12 },
    { country: 'Others', members: 2, percentage: 8 },
  ];

  const renderOverviewTab = () => (
    <div className="team-overview">
      {/* Key Metrics Dashboard */}
      <div className="metrics-dashboard">
        <motion.div
          className="metric-card primary"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="metric-icon">
            <FaUsers />
          </div>
          <div className="metric-content">
            <h3>Total Team Size</h3>
            <div className="metric-value">{teamStats.totalSize}</div>
            <div className="metric-change positive">
              <FaArrowUp /> +
              {Math.floor(
                (teamStats.totalSize * teamStats.thisMonthGrowth) / 100
              )}{' '}
              this month
            </div>
          </div>
          <div className="metric-breakdown">
            <span>
              {teamStats.activeMembers} active •{' '}
              {teamStats.totalSize - teamStats.activeMembers} inactive
            </span>
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
            <h3>Team Volume</h3>
            <div className="metric-value">
              ${teamStats.totalVolume.toLocaleString()}
            </div>
            <div className="metric-change positive">
              <FaFire /> ${teamStats.avgMemberValue} avg per member
            </div>
          </div>
        </motion.div>

        <motion.div
          className="metric-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="metric-icon">
            <FaRocket />
          </div>
          <div className="metric-content">
            <h3>Growth Rate</h3>
            <div className="metric-value">{teamStats.thisMonthGrowth}%</div>
            <div className="metric-change excellent">Above target (12%)</div>
          </div>
        </motion.div>

        <motion.div
          className="metric-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="metric-icon">
            <FaTrophy />
          </div>
          <div className="metric-content">
            <h3>Top Performers</h3>
            <div className="metric-value">{teamStats.topPerformers}</div>
            <div className="metric-meta">20% of team excelling</div>
          </div>
        </motion.div>
      </div>

      {/* Performance Overview */}
      <div className="performance-overview">
        <h3>📊 Team Performance Overview</h3>
        <div className="performance-grid">
          {performanceMetrics.map((metric, index) => (
            <motion.div
              key={index}
              className={`performance-card ${metric.status}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="performance-header">
                <h4>{metric.label}</h4>
                <div className={`status-indicator ${metric.status}`}>
                  {metric.status === 'excellent' && <FaStar />}
                  {metric.status === 'warning' && <FaBullseye />}
                </div>
              </div>

              <div className="performance-value">
                {metric.label.includes('Rate') ||
                metric.label.includes('Growth')
                  ? `${metric.value}%`
                  : metric.value}
              </div>

              <div className="performance-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                    }}
                  />
                </div>
                <span className="target-label">
                  Target: {metric.target}
                  {metric.label.includes('Rate') ||
                  metric.label.includes('Growth')
                    ? '%'
                    : ''}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Growth Chart */}
      <div className="growth-chart">
        <h3>📈 Team Growth Timeline</h3>
        <div className="chart-container">
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color members"></span>
              <span>Team Members</span>
            </div>
            <div className="legend-item">
              <span className="legend-color volume"></span>
              <span>Total Volume</span>
            </div>
          </div>

          <div className="dual-chart">
            <div className="chart-bars">
              {growthHistory.map((data, index) => (
                <motion.div
                  key={data.month}
                  className="chart-month"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bars-container">
                    <div
                      className="bar members"
                      style={{ height: `${(data.members / 25) * 100}%` }}
                    >
                      <span className="bar-value">{data.members}</span>
                    </div>
                    <div
                      className="bar volume"
                      style={{ height: `${(data.volume / 12500) * 100}%` }}
                    >
                      <span className="bar-value">
                        ${(data.volume / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>
                  <span className="month-label">{data.month}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="geographic-distribution">
        <h3>🌍 Geographic Distribution</h3>
        <div className="distribution-list">
          {countryDistribution.map((country, index) => (
            <motion.div
              key={country.country}
              className="country-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="country-info">
                <span className="country-name">{country.country}</span>
                <span className="country-members">
                  {country.members} members
                </span>
              </div>

              <div className="country-bar">
                <div
                  className="country-fill"
                  style={{ width: `${country.percentage}%` }}
                />
              </div>

              <span className="country-percentage">{country.percentage}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMembersTab = () => (
    <div className="team-members">
      {/* Controls and Filters */}
      <div className="members-controls">
        <div className="controls-left">
          <h3>👥 Team Members ({teamMembers.length})</h3>
        </div>

        <div className="controls-right">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
          >
            <option value="all">All Members</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="level1">Level 1</option>
            <option value="level2">Level 2+</option>
          </select>

          <button className="action-btn">
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {/* Members Grid */}
      <div className="members-grid">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.id}
            className={`member-card ${member.status} ${member.performance}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -3 }}
          >
            <div className="member-header">
              <div className="member-avatar">{member.name.charAt(0)}</div>

              <div className="member-info">
                <h4>{member.name}</h4>
                <span className="member-email">{member.email}</span>
                <span className={`member-status ${member.status}`}>
                  {member.status}
                </span>
              </div>

              <div className={`performance-badge ${member.performance}`}>
                {member.performance === 'excellent' && <FaStar />}
                {member.performance === 'good' && <FaRocket />}
                {member.performance === 'needs-attention' && <FaBullseye />}
                {member.performance.replace('-', ' ')}
              </div>
            </div>

            <div className="member-metrics">
              <div className="metric-row">
                <div className="metric">
                  <span className="metric-label">Level</span>
                  <span className="metric-value">{member.level}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Package</span>
                  <span className="metric-value">${member.package}</span>
                </div>
              </div>

              <div className="metric-row">
                <div className="metric">
                  <span className="metric-label">Volume</span>
                  <span className="metric-value">${member.volume}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Referrals</span>
                  <span className="metric-value">{member.referrals}</span>
                </div>
              </div>
            </div>

            <div className="member-details">
              <div className="detail-item">
                <span>
                  Joined: {new Date(member.joinDate).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-item">
                <span>Country: {member.country}</span>
              </div>
              <div className="detail-item">
                <span>
                  Last Active:{' '}
                  {new Date(member.lastActive).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="member-actions">
              <button className="action-btn view">
                <FaEye /> View Profile
              </button>
              <button className="action-btn message">
                <FaShareAlt /> Message
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h4>⚡ Quick Actions</h4>
        <div className="actions-grid">
          <button className="quick-action-btn">
            <FaUserPlus />
            <span>Invite New Members</span>
          </button>
          <button className="quick-action-btn">
            <FaChartLine />
            <span>Team Performance Report</span>
          </button>
          <button className="quick-action-btn">
            <FaNetworkWired />
            <span>View Genealogy Tree</span>
          </button>
          <button className="quick-action-btn">
            <FaTrophy />
            <span>Recognition Program</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="team-analytics">
      <h3>📊 Advanced Team Analytics</h3>

      {/* Performance Insights */}
      <div className="performance-insights">
        <h4>🔍 Performance Insights</h4>
        <div className="insights-grid">
          <div className="insight-card trend-up">
            <div className="insight-icon">
              <FaArrowUp />
            </div>
            <div className="insight-content">
              <h5>Growth Acceleration</h5>
              <p>
                Your team growth rate increased by 23% this month, indicating
                strong momentum.
              </p>
              <div className="insight-metric">+23% growth rate</div>
            </div>
          </div>

          <div className="insight-card warning">
            <div className="insight-icon">
              <FaBullseye />
            </div>
            <div className="insight-content">
              <h5>Activation Opportunity</h5>
              <p>
                7 members haven't been active in 2+ weeks. Consider reaching out
                with support.
              </p>
              <div className="insight-metric">28% inactive rate</div>
            </div>
          </div>

          <div className="insight-card success">
            <div className="insight-icon">
              <FaStar />
            </div>
            <div className="insight-content">
              <h5>Top Performer Recognition</h5>
              <p>
                Alice Chen generated 40% of total team volume. Consider
                featuring her success story.
              </p>
              <div className="insight-metric">$4,800 individual volume</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Composition Analysis */}
      <div className="composition-analysis">
        <h4>📈 Team Composition Analysis</h4>
        <div className="composition-charts">
          <div className="chart-section">
            <h5>By Package Level</h5>
            <div className="pie-chart package-chart">
              <div className="chart-segments">
                <div
                  className="segment"
                  style={{ '--percentage': '40%', '--color': '#4facfe' }}
                >
                  <span>$200 Package (40%)</span>
                </div>
                <div
                  className="segment"
                  style={{ '--percentage': '35%', '--color': '#00c9ff' }}
                >
                  <span>$100 Package (35%)</span>
                </div>
                <div
                  className="segment"
                  style={{ '--percentage': '25%', '--color': '#667eea' }}
                >
                  <span>$50 Package (25%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-section">
            <h5>By Performance Level</h5>
            <div className="performance-breakdown">
              <div className="perf-item excellent">
                <span className="perf-label">Excellent</span>
                <div className="perf-bar">
                  <div className="perf-fill" style={{ width: '20%' }}></div>
                </div>
                <span className="perf-count">5 members</span>
              </div>
              <div className="perf-item good">
                <span className="perf-label">Good</span>
                <div className="perf-bar">
                  <div className="perf-fill" style={{ width: '52%' }}></div>
                </div>
                <span className="perf-count">13 members</span>
              </div>
              <div className="perf-item needs-attention">
                <span className="perf-label">Needs Attention</span>
                <div className="perf-bar">
                  <div className="perf-fill" style={{ width: '28%' }}></div>
                </div>
                <span className="perf-count">7 members</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Predictive Analytics */}
      <div className="predictive-analytics">
        <h4>🔮 Predictive Analytics</h4>
        <div className="predictions-grid">
          <div className="prediction-card">
            <h5>30-Day Projection</h5>
            <div className="prediction-metrics">
              <div className="pred-metric">
                <span>Expected New Members</span>
                <span className="value">3-5</span>
              </div>
              <div className="pred-metric">
                <span>Projected Volume Growth</span>
                <span className="value">$2,000-3,500</span>
              </div>
              <div className="pred-metric">
                <span>Confidence Level</span>
                <span className="value">85%</span>
              </div>
            </div>
          </div>

          <div className="prediction-card">
            <h5>Growth Optimization</h5>
            <div className="optimization-tips">
              <div className="tip">
                <FaBullseye />
                <span>
                  Focus on reactivating 3 specific inactive members for 15%
                  boost
                </span>
              </div>
              <div className="tip">
                <FaRocket />
                <span>
                  Encourage Alice and Bob to recruit 1 more each for 25% growth
                </span>
              </div>
              <div className="tip">
                <FaTrophy />
                <span>
                  Launch team contest to increase average package size by $50
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTreeTab = () => (
    <div className="genealogy-tree-section">
      <div className="tree-header">
        <h3>🌳 Interactive Genealogy Tree</h3>
        <p>
          Visualize your team structure and earning flows with our interactive
          D3 tree
        </p>
      </div>

      <div className="tree-container">
        <div className="tree-navigation-card">
          <div className="navigation-content">
            <FaNetworkWired className="navigation-icon" />
            <h4>Interactive Genealogy Tree</h4>
            <p>Visualize your complete team structure with our advanced D3 tree visualization</p>
            
            <div className="tree-preview-stats">
              <div className="preview-stat">
                <span className="stat-value">8</span>
                <span className="stat-label">Levels Deep</span>
              </div>
              <div className="preview-stat">
                <span className="stat-value">25</span>
                <span className="stat-label">Team Members</span>
              </div>
              <div className="preview-stat">
                <span className="stat-value">85%</span>
                <span className="stat-label">Active Rate</span>
              </div>
            </div>
            
            <button 
              className="navigate-tree-btn"
              onClick={() => navigate('/genealogy')}
            >
              <FaEye /> Open Full Genealogy Tree
            </button>
          </div>
        </div>
      </div>

      <div className="tree-insights">
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">
              <FaNetworkWired />
            </div>
            <div className="insight-content">
              <h4>Network Depth</h4>
              <div className="insight-value">8 Levels</div>
              <p>Your network spans 8 levels deep with consistent growth</p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">
              <FaUsers />
            </div>
            <div className="insight-content">
              <h4>Active Branches</h4>
              <div className="insight-value">85%</div>
              <p>
                Most of your network branches are actively generating volume
              </p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">
              <FaDollarSign />
            </div>
            <div className="insight-content">
              <h4>Total Network Value</h4>
              <div className="insight-value">$12,500</div>
              <p>Combined package value across your entire network</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEarningsTab = () => (
    <div className="earnings-breakdown">
      <div className="earnings-header">
        <h3>💰 Detailed Earnings Breakdown</h3>
        <p>
          Comprehensive analysis of your team earnings and commission structure
        </p>
      </div>

      {/* Earnings Summary */}
      <div className="earnings-summary">
        <div className="summary-cards">
          <div className="summary-card total">
            <div className="card-icon">
              <FaDollarSign />
            </div>
            <div className="card-content">
              <h4>Total Team Earnings</h4>
              <div className="card-value">$3,650</div>
              <div className="card-change positive">+15.3% this month</div>
            </div>
          </div>

          <div className="summary-card direct">
            <div className="card-icon">
              <FaUsers />
            </div>
            <div className="card-content">
              <h4>Direct Commissions</h4>
              <div className="card-value">$1,200</div>
              <div className="card-breakdown">
                40% commission (3 direct referrals)
              </div>
            </div>
          </div>

          <div className="summary-card level">
            <div className="card-icon">
              <FaNetworkWired />
            </div>
            <div className="card-content">
              <h4>Level Bonuses</h4>
              <div className="card-value">$850</div>
              <div className="card-breakdown">10% bonus across 8 levels</div>
            </div>
          </div>

          <div className="summary-card leadership">
            <div className="card-icon">
              <FaTrophy />
            </div>
            <div className="card-content">
              <h4>Leadership Pool</h4>
              <div className="card-value">$45.30</div>
              <div className="card-breakdown">5% pool share (Silver Star)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings by Level */}
      <div className="earnings-by-level">
        <h4>📊 Earnings by Level</h4>
        <div className="level-breakdown">
          {[
            {
              level: 1,
              members: 3,
              volume: 550,
              commission: 55,
              percentage: 10,
            },
            {
              level: 2,
              members: 5,
              volume: 750,
              commission: 75,
              percentage: 10,
            },
            {
              level: 3,
              members: 8,
              volume: 1200,
              commission: 120,
              percentage: 10,
            },
            {
              level: 4,
              members: 4,
              volume: 600,
              commission: 60,
              percentage: 10,
            },
            {
              level: 5,
              members: 3,
              volume: 450,
              commission: 45,
              percentage: 10,
            },
            {
              level: 6,
              members: 2,
              volume: 300,
              commission: 30,
              percentage: 10,
            },
            {
              level: 7,
              members: 1,
              volume: 200,
              commission: 20,
              percentage: 10,
            },
            {
              level: 8,
              members: 1,
              volume: 150,
              commission: 15,
              percentage: 10,
            },
          ].map((levelData, index) => (
            <div key={levelData.level} className="level-row">
              <div className="level-info">
                <span className="level-number">Level {levelData.level}</span>
                <span className="level-members">
                  {levelData.members} members
                </span>
              </div>

              <div className="level-volume">
                <span className="volume-amount">${levelData.volume}</span>
                <span className="volume-label">Volume</span>
              </div>

              <div className="level-commission">
                <span className="commission-amount">
                  ${levelData.commission}
                </span>
                <span className="commission-rate">{levelData.percentage}%</span>
              </div>

              <div className="level-visual">
                <div className="volume-bar">
                  <div
                    className="volume-fill"
                    style={{ width: `${(levelData.volume / 1200) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Earnings Trend */}
      <div className="earnings-trend">
        <h4>📈 Monthly Earnings Trend</h4>
        <div className="trend-chart">
          <div className="chart-container">
            {[
              { month: 'Jan', amount: 2800 },
              { month: 'Feb', amount: 3100 },
              { month: 'Mar', amount: 3400 },
              { month: 'Apr', amount: 3650 },
              { month: 'May', amount: 3200 },
              { month: 'Jun', amount: 3650 },
            ].map((data, index) => (
              <div key={data.month} className="trend-month">
                <div className="trend-bar-container">
                  <div
                    className="trend-bar"
                    style={{ height: `${(data.amount / 3650) * 100}%` }}
                  >
                    <span className="bar-value">
                      ${(data.amount / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
                <span className="trend-month-label">{data.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projected Earnings */}
      <div className="projected-earnings">
        <h4>🔮 Projected Earnings (Next 3 Months)</h4>
        <div className="projection-cards">
          <div className="projection-card conservative">
            <h5>Conservative</h5>
            <div className="projection-value">$3,800 - $4,200</div>
            <div className="projection-details">
              <div>+5-15% growth</div>
              <div>Current trend continues</div>
            </div>
          </div>

          <div className="projection-card optimistic">
            <h5>Optimistic</h5>
            <div className="projection-value">$4,500 - $5,200</div>
            <div className="projection-details">
              <div>+25-45% growth</div>
              <div>2-3 new active members</div>
            </div>
          </div>

          <div className="projection-card aggressive">
            <h5>Aggressive</h5>
            <div className="projection-value">$5,800 - $6,500</div>
            <div className="projection-details">
              <div>+60-80% growth</div>
              <div>Team expansion strategy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="advanced-my-team">
      <div className="section-header">
        <h2>🚀 My Team - Network Management Hub</h2>
        <p>
          Manage, analyze, and grow your team with advanced insights and
          powerful tools
        </p>
      </div>

      <div className="section-tabs">
        <button
          className={`tab ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          <FaChartLine /> Overview
        </button>
        <button
          className={`tab ${activeView === 'members' ? 'active' : ''}`}
          onClick={() => setActiveView('members')}
        >
          <FaUsers /> Members
        </button>
        <button
          className={`tab ${activeView === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveView('analytics')}
        >
          <FaChartPie /> Analytics
        </button>
        <button
          className={`tab ${activeView === 'tree' ? 'active' : ''}`}
          onClick={() => setActiveView('tree')}
        >
          <FaSitemap /> Genealogy Tree
        </button>
        <button
          className={`tab ${activeView === 'earnings' ? 'active' : ''}`}
          onClick={() => setActiveView('earnings')}
        >
          <FaMoneyBillWave /> Earnings Breakdown
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
          {activeView === 'overview' && renderOverviewTab()}
          {activeView === 'members' && renderMembersTab()}
          {activeView === 'analytics' && renderAnalyticsTab()}
          {activeView === 'tree' && renderTreeTab()}
          {activeView === 'earnings' && renderEarningsTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdvancedMyTeam;
