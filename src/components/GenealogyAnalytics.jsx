import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Target,
  Award,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import './GenealogyAnalytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

const GenealogyAnalytics = ({ treeData, account, provider, onExport }) => {
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y, all
  const [loading, setLoading] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState({
    networkGrowth: true,
    earningsAnalysis: true,
    packageDistribution: true,
    levelPerformance: true,
    topPerformers: true,
    activityHeatmap: true
  });
  const [analyticsData, setAnalyticsData] = useState(null);

  // Calculate comprehensive analytics from tree data
  const calculateAnalytics = useMemo(() => {
    if (!treeData) return null;

    const flattenTree = (node, level = 0, path = []) => {
      const nodes = [{
        ...node.attributes,
        name: node.name,
        level,
        path: [...path, node.name],
        nodeId: node.attributes?.id || node.name
      }];

      if (node.children) {
        node.children.forEach((child, index) => {
          nodes.push(...flattenTree(child, level + 1, [...path, node.name]));
        });
      }

      return nodes;
    };

    const allNodes = flattenTree(treeData);
    const now = new Date();
    const timeRanges = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      'all': new Date(0)
    };

    // Network Overview
    const totalNodes = allNodes.length;
    const maxLevel = Math.max(...allNodes.map(node => node.level));
    const totalEarnings = allNodes.reduce((sum, node) => sum + (parseFloat(node.earnings?.replace('$', '')) || 0), 0);
    const totalWithdrawable = allNodes.reduce((sum, node) => sum + (parseFloat(node.withdrawable?.replace('$', '')) || 0), 0);

    // Level Distribution
    const levelDistribution = {};
    allNodes.forEach(node => {
      levelDistribution[node.level] = (levelDistribution[node.level] || 0) + 1;
    });

    // Package Distribution
    const packageDistribution = {};
    allNodes.forEach(node => {
      const pkg = node.package || 'Unknown';
      packageDistribution[pkg] = (packageDistribution[pkg] || 0) + 1;
    });

    // Top Performers (by earnings)
    const topPerformers = allNodes
      .filter(node => node.earnings && parseFloat(node.earnings.replace('$', '')) > 0)
      .sort((a, b) => parseFloat(b.earnings.replace('$', '')) - parseFloat(a.earnings.replace('$', '')))
      .slice(0, 10);

    // Growth simulation (mock data for demonstration)
    const growthData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        newMembers: Math.floor(Math.random() * 5) + 1,
        totalMembers: Math.max(10, totalNodes - Math.floor(Math.random() * 20)),
        earnings: Math.random() * 1000 + 500
      };
    });

    // Cumulative growth
    let cumulativeMembers = Math.max(10, totalNodes - 100);
    growthData.forEach(day => {
      cumulativeMembers += day.newMembers;
      day.totalMembers = cumulativeMembers;
    });

    return {
      overview: {
        totalNodes,
        maxLevel,
        totalEarnings,
        totalWithdrawable,
        avgEarningsPerNode: totalEarnings / totalNodes || 0,
        activeNodes: allNodes.filter(node => parseFloat(node.earnings?.replace('$', '') || '0') > 0).length
      },
      levelDistribution,
      packageDistribution,
      topPerformers,
      growthData,
      allNodes
    };
  }, [treeData, timeRange]);

  // Generate chart data
  const chartData = useMemo(() => {
    if (!calculateAnalytics) return {};

    const { levelDistribution, packageDistribution, growthData, overview } = calculateAnalytics;

    // Network Growth Chart
    const networkGrowthChart = {
      labels: growthData.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Total Members',
          data: growthData.map(d => d.totalMembers),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'New Members',
          data: growthData.map(d => d.newMembers),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          type: 'bar',
          yAxisID: 'y1'
        }
      ]
    };

    // Earnings Analysis Chart
    const earningsChart = {
      labels: growthData.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Daily Earnings ($)',
          data: growthData.map(d => d.earnings),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    // Level Distribution Chart
    const levelChart = {
      labels: Object.keys(levelDistribution).map(level => `Level ${level}`),
      datasets: [
        {
          label: 'Members per Level',
          data: Object.values(levelDistribution),
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(20, 184, 166, 0.8)',
            'rgba(244, 63, 94, 0.8)'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };

    // Package Distribution Chart
    const packageChart = {
      labels: Object.keys(packageDistribution),
      datasets: [
        {
          data: Object.values(packageDistribution),
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',   // Emerald
            'rgba(59, 130, 246, 0.8)',  // Blue
            'rgba(168, 85, 247, 0.8)',  // Purple
            'rgba(245, 158, 11, 0.8)',  // Amber
            'rgba(239, 68, 68, 0.8)',   // Red
            'rgba(20, 184, 166, 0.8)'   // Teal
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };

    return {
      networkGrowthChart,
      earningsChart,
      levelChart,
      packageChart
    };
  }, [calculateAnalytics]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#64748b',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#64748b', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#64748b', font: { size: 11 } }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: '#64748b', font: { size: 11 } }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#64748b',
          font: { size: 12 },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleExportAnalytics = () => {
    if (onExport) {
      onExport({
        type: 'analytics',
        data: calculateAnalytics,
        charts: chartData,
        timestamp: new Date().toISOString()
      });
    }
  };

  const toggleMetric = (metric) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  if (!treeData || !calculateAnalytics) {
    return (
      <div className="genealogy-analytics">
        <div className="analytics-header">
          <h2>Team Analytics</h2>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  const { overview, topPerformers } = calculateAnalytics;

  return (
    <div className="genealogy-analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h2>Team Performance Analytics</h2>
          <p>Comprehensive insights into your network growth and performance</p>
        </div>
        <div className="header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
          <button onClick={handleExportAnalytics} className="export-btn">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="metrics-overview">
        <div className="metric-card">
          <div className="metric-icon">
            <Users size={24} />
          </div>
          <div className="metric-content">
            <h3>{formatNumber(overview.totalNodes)}</h3>
            <p>Total Network Size</p>
            <span className="metric-change positive">
              <TrendingUp size={14} />
              +12.5%
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <DollarSign size={24} />
          </div>
          <div className="metric-content">
            <h3>{formatCurrency(overview.totalEarnings)}</h3>
            <p>Total Earnings</p>
            <span className="metric-change positive">
              <TrendingUp size={14} />
              +8.3%
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Target size={24} />
          </div>
          <div className="metric-content">
            <h3>{overview.maxLevel + 1}</h3>
            <p>Network Depth</p>
            <span className="metric-change neutral">
              <TrendingUp size={14} />
              +1 level
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Award size={24} />
          </div>
          <div className="metric-content">
            <h3>{formatNumber(overview.activeNodes)}</h3>
            <p>Active Members</p>
            <span className="metric-change positive">
              <TrendingUp size={14} />
              +15.2%
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Toggle */}
      <div className="metrics-toggle">
        <h3>Analytics Sections</h3>
        <div className="toggle-buttons">
          {Object.entries(selectedMetrics).map(([key, enabled]) => (
            <button
              key={key}
              onClick={() => toggleMetric(key)}
              className={`toggle-btn ${enabled ? 'enabled' : 'disabled'}`}
            >
              {enabled ? <Eye size={16} /> : <EyeOff size={16} />}
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {selectedMetrics.networkGrowth && (
          <div className="chart-container large">
            <div className="chart-header">
              <h3>Network Growth Trend</h3>
              <p>Member acquisition and total network size over time</p>
            </div>
            <div className="chart-content">
              <Line data={chartData.networkGrowthChart} options={chartOptions} />
            </div>
          </div>
        )}

        {selectedMetrics.earningsAnalysis && (
          <div className="chart-container large">
            <div className="chart-header">
              <h3>Earnings Analysis</h3>
              <p>Daily earnings performance and trends</p>
            </div>
            <div className="chart-content">
              <Line data={chartData.earningsChart} options={chartOptions} />
            </div>
          </div>
        )}

        {selectedMetrics.levelPerformance && (
          <div className="chart-container medium">
            <div className="chart-header">
              <h3>Level Distribution</h3>
              <p>Member distribution across network levels</p>
            </div>
            <div className="chart-content">
              <Bar data={chartData.levelChart} options={chartOptions} />
            </div>
          </div>
        )}

        {selectedMetrics.packageDistribution && (
          <div className="chart-container medium">
            <div className="chart-header">
              <h3>Package Distribution</h3>
              <p>Distribution of members across package tiers</p>
            </div>
            <div className="chart-content">
              <Doughnut data={chartData.packageChart} options={pieOptions} />
            </div>
          </div>
        )}

        {selectedMetrics.topPerformers && (
          <div className="chart-container full">
            <div className="chart-header">
              <h3>Top Performers</h3>
              <p>Highest earning members in your network</p>
            </div>
            <div className="top-performers-grid">
              {topPerformers.slice(0, 6).map((performer, index) => (
                <div key={performer.nodeId} className="performer-card">
                  <div className="performer-rank">#{index + 1}</div>
                  <div className="performer-info">
                    <h4>{performer.name}</h4>
                    <p>Level {performer.level} • {performer.package}</p>
                    <div className="performer-earnings">
                      {formatCurrency(parseFloat(performer.earnings.replace('$', '')))}
                    </div>
                    <div className="performer-network">
                      {performer.directReferrals || 0} direct referrals
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Statistics */}
      <div className="detailed-stats">
        <div className="stats-section">
          <h3>Network Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Average Earnings per Member</span>
              <span className="stat-value">{formatCurrency(overview.avgEarningsPerNode)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Withdrawable</span>
              <span className="stat-value">{formatCurrency(overview.totalWithdrawable)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Member Ratio</span>
              <span className="stat-value">
                {((overview.activeNodes / overview.totalNodes) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Network Depth</span>
              <span className="stat-value">{overview.maxLevel + 1} levels</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenealogyAnalytics;
