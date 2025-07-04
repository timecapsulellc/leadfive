import React, { useState, useEffect } from 'react';
import { 
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaTable,
  FaDownload,
  FaCalendarAlt,
  FaFilter,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaEye,
  FaUsers,
  FaDollarSign,
  FaNetworkWired,
  FaGift
} from 'react-icons/fa';

const AdvancedAnalytics = ({ dashboardData, userStats, className = '' }) => {
  const [activeTab, setActiveTab] = useState('earnings');
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('line');

  const [analyticsData, setAnalyticsData] = useState({
    earnings: {
      total: dashboardData?.totalEarnings || 0,
      directBonus: Math.floor((dashboardData?.totalEarnings || 0) * 0.25),
      binaryBonus: Math.floor((dashboardData?.totalEarnings || 0) * 0.45),
      infinityBonus: Math.floor((dashboardData?.totalEarnings || 0) * 0.20),
      globalPool: Math.floor((dashboardData?.totalEarnings || 0) * 0.10),
      growth: 23.7,
      trend: 'up'
    },
    team: {
      totalMembers: dashboardData?.daoParticipants || 0,
      directReferrals: Math.floor((dashboardData?.daoParticipants || 0) * 0.3),
      leftLeg: Math.floor((dashboardData?.daoParticipants || 0) * 0.35),
      rightLeg: Math.floor((dashboardData?.daoParticipants || 0) * 0.35),
      activeMembers: Math.floor((dashboardData?.daoParticipants || 0) * 0.8),
      newThisMonth: Math.floor((dashboardData?.daoParticipants || 0) * 0.15),
      retentionRate: 89.5
    },
    performance: {
      rankAdvancement: 2,
      packageDistribution: {
        level1: 45,
        level2: 30,
        level3: 15,
        level4: 7,
        level5: 3
      },
      conversionRate: 12.4,
      averagePackageValue: 285,
      teamVolume: 45620
    }
  });

  const [timeSeriesData, setTimeSeriesData] = useState({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    earnings: [1200, 1850, 2340, 2890],
    teamGrowth: [45, 67, 89, 112],
    volume: [8500, 12300, 18700, 24500]
  });

  const [comparisonData, setComparisonData] = useState({
    vsLastMonth: {
      earnings: 18.5,
      team: 24.2,
      volume: 31.7,
      rank: 2
    },
    vsAverage: {
      earnings: 145,
      team: 132,
      volume: 167,
      rank: 'Above Average'
    }
  });

  const [topPerformers, setTopPerformers] = useState([
    { id: 1, name: 'Team Alpha', volume: 12450, growth: 34.5, level: 5 },
    { id: 2, name: 'Team Beta', volume: 9870, growth: 28.2, level: 4 },
    { id: 3, name: 'Team Gamma', volume: 8650, growth: 22.8, level: 4 },
    { id: 4, name: 'Team Delta', volume: 7320, growth: 19.4, level: 3 },
    { id: 5, name: 'Team Epsilon', volume: 6890, growth: 16.7, level: 3 }
  ]);

  const tabs = [
    { id: 'earnings', label: 'Earnings Analysis', icon: FaDollarSign },
    { id: 'team', label: 'Team Analytics', icon: FaUsers },
    { id: 'performance', label: 'Performance', icon: FaChartLine },
    { id: 'comparison', label: 'Comparisons', icon: FaChartBar }
  ];

  const timeRanges = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <FaArrowUp className="trend-up" />;
      case 'down': return <FaArrowDown className="trend-down" />;
      default: return <FaEquals className="trend-neutral" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderEarningsAnalysis = () => (
    <div className="analytics-section">
      <div className="section-header">
        <h4>Earnings Breakdown</h4>
        <div className="total-earnings">
          <span className="total-label">Total Earnings:</span>
          <span className="total-amount">{formatCurrency(analyticsData.earnings.total)}</span>
          <span className="total-growth">
            {getTrendIcon(analyticsData.earnings.trend)}
            +{analyticsData.earnings.growth}%
          </span>
        </div>
      </div>

      <div className="earnings-breakdown">
        <div className="breakdown-chart">
          <div className="chart-placeholder">
            <FaChartPie className="chart-icon" />
            <p>Earnings Distribution Chart</p>
          </div>
        </div>

        <div className="breakdown-details">
          <div className="breakdown-item">
            <div className="breakdown-color direct"></div>
            <div className="breakdown-info">
              <span className="breakdown-label">Direct Sponsor Bonus</span>
              <span className="breakdown-amount">{formatCurrency(analyticsData.earnings.directBonus)}</span>
              <span className="breakdown-percentage">25%</span>
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-color binary"></div>
            <div className="breakdown-info">
              <span className="breakdown-label">Binary Commission</span>
              <span className="breakdown-amount">{formatCurrency(analyticsData.earnings.binaryBonus)}</span>
              <span className="breakdown-percentage">45%</span>
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-color infinity"></div>
            <div className="breakdown-info">
              <span className="breakdown-label">Infinity Bonus</span>
              <span className="breakdown-amount">{formatCurrency(analyticsData.earnings.infinityBonus)}</span>
              <span className="breakdown-percentage">20%</span>
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-color global"></div>
            <div className="breakdown-info">
              <span className="breakdown-label">Global Pool</span>
              <span className="breakdown-amount">{formatCurrency(analyticsData.earnings.globalPool)}</span>
              <span className="breakdown-percentage">10%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="earnings-timeline">
        <h5>Earnings Timeline</h5>
        <div className="timeline-chart">
          <div className="chart-placeholder">
            <FaChartLine className="chart-icon" />
            <p>Earnings progression over time</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeamAnalytics = () => (
    <div className="analytics-section">
      <div className="team-overview">
        <div className="team-stats-grid">
          <div className="team-stat">
            <FaUsers className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">{analyticsData.team.totalMembers}</span>
              <span className="stat-label">Total Team Members</span>
            </div>
          </div>

          <div className="team-stat">
            <FaNetworkWired className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">{analyticsData.team.directReferrals}</span>
              <span className="stat-label">Direct Referrals</span>
            </div>
          </div>

          <div className="team-stat">
            <FaArrowUp className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">{analyticsData.team.newThisMonth}</span>
              <span className="stat-label">New This Month</span>
            </div>
          </div>

          <div className="team-stat">
            <FaChartLine className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">{analyticsData.team.retentionRate}%</span>
              <span className="stat-label">Retention Rate</span>
            </div>
          </div>
        </div>
      </div>

      <div className="binary-structure">
        <h5>Binary Team Structure</h5>
        <div className="binary-visualization">
          <div className="binary-leg left">
            <div className="leg-header">
              <span className="leg-title">Left Leg</span>
              <span className="leg-count">{analyticsData.team.leftLeg} members</span>
            </div>
            <div className="leg-bar">
              <div className="leg-fill" style={{ width: '65%' }}></div>
            </div>
          </div>

          <div className="binary-center">
            <div className="user-node">
              <FaUsers />
              <span>You</span>
            </div>
          </div>

          <div className="binary-leg right">
            <div className="leg-header">
              <span className="leg-title">Right Leg</span>
              <span className="leg-count">{analyticsData.team.rightLeg} members</span>
            </div>
            <div className="leg-bar">
              <div className="leg-fill" style={{ width: '58%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="top-performers">
        <h5>Top Performing Teams</h5>
        <div className="performers-list">
          {(topPerformers || []).map((performer, index) => (
            <div key={performer.id} className="performer-item">
              <div className="performer-rank">#{index + 1}</div>
              <div className="performer-info">
                <span className="performer-name">{performer.name}</span>
                <span className="performer-level">Level {performer.level}</span>
              </div>
              <div className="performer-stats">
                <span className="performer-volume">{formatCurrency(performer.volume)}</span>
                <span className="performer-growth">+{performer.growth}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformanceAnalysis = () => (
    <div className="analytics-section">
      <div className="performance-metrics">
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Conversion Rate</span>
              <FaChartLine className="metric-icon" />
            </div>
            <div className="metric-value">{analyticsData.performance.conversionRate}%</div>
            <div className="metric-trend positive">
              <FaArrowUp /> +2.3% from last month
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Avg Package Value</span>
              <FaDollarSign className="metric-icon" />
            </div>
            <div className="metric-value">{formatCurrency(analyticsData.performance.averagePackageValue)}</div>
            <div className="metric-trend positive">
              <FaArrowUp /> +12.4% from last month
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Team Volume</span>
              <FaNetworkWired className="metric-icon" />
            </div>
            <div className="metric-value">{formatCurrency(analyticsData.performance.teamVolume)}</div>
            <div className="metric-trend positive">
              <FaArrowUp /> +18.7% from last month
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Rank Advancement</span>
              <FaArrowUp className="metric-icon" />
            </div>
            <div className="metric-value">+{analyticsData.performance.rankAdvancement}</div>
            <div className="metric-trend positive">
              <FaArrowUp /> Levels this quarter
            </div>
          </div>
        </div>
      </div>

      <div className="package-distribution">
        <h5>Package Level Distribution</h5>
        <div className="distribution-chart">
          {Object.entries(analyticsData.performance.packageDistribution || {}).map(([level, count]) => (
            <div key={level} className="distribution-item">
              <span className="distribution-label">Level {level.slice(-1)}</span>
              <div className="distribution-bar">
                <div 
                  className="distribution-fill" 
                  style={{ width: `${(count / 100) * 100}%` }}
                ></div>
              </div>
              <span className="distribution-count">{count}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderComparison = () => (
    <div className="analytics-section">
      <div className="comparison-grid">
        <div className="comparison-card">
          <h5>vs Last Month</h5>
          <div className="comparison-metrics">
            <div className="comparison-metric">
              <span className="comparison-label">Earnings</span>
              <span className="comparison-value positive">+{comparisonData.vsLastMonth.earnings}%</span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Team Growth</span>
              <span className="comparison-value positive">+{comparisonData.vsLastMonth.team}%</span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Volume</span>
              <span className="comparison-value positive">+{comparisonData.vsLastMonth.volume}%</span>
            </div>
          </div>
        </div>

        <div className="comparison-card">
          <h5>vs Network Average</h5>
          <div className="comparison-metrics">
            <div className="comparison-metric">
              <span className="comparison-label">Earnings</span>
              <span className="comparison-value positive">{comparisonData.vsAverage.earnings}%</span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Team Size</span>
              <span className="comparison-value positive">{comparisonData.vsAverage.team}%</span>
            </div>
            <div className="comparison-metric">
              <span className="comparison-label">Volume</span>
              <span className="comparison-value positive">{comparisonData.vsAverage.volume}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'earnings':
        return renderEarningsAnalysis();
      case 'team':
        return renderTeamAnalytics();
      case 'performance':
        return renderPerformanceAnalysis();
      case 'comparison':
        return renderComparison();
      default:
        return renderEarningsAnalysis();
    }
  };

  return (
    <div className={`advanced-analytics ${className}`}>
      <div className="analytics-header">
        <div className="header-info">
          <FaChartBar className="header-icon" />
          <div>
            <h3>Advanced Analytics</h3>
            <span className="analytics-subtitle">Comprehensive performance insights</span>
          </div>
        </div>
        
        <div className="analytics-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            {(timeRanges || []).map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          <button className="export-btn">
            <FaDownload />
            Export
          </button>
        </div>
      </div>

      <div className="analytics-tabs">
        {(tabs || []).map(tab => (
          <button
            key={tab.id}
            className={`analytics-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="analytics-content">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
