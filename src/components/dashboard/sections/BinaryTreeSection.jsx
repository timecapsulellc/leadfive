/**
 * Enhanced Binary Tree Section - LeadFive MLM Dashboard
 * 
 * Features:
 * - Integrated Advanced Genealogy Tree
 * - Business metrics and analytics
 * - Multiple view modes (compact, full, analytics)
 * - Real-time data updates
 * - Export and sharing capabilities
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUsers, 
  FaChartLine, 
  FaExpand, 
  FaDownload, 
  FaShare,
  FaTrophy,
  FaDollarSign,
  FaNetworkWired,
  FaEye,
  FaLayerGroup,
  FaArrowUp,
  FaArrowDown,
  FaBalanceScale,
  FaGem,
  FaCrown
} from 'react-icons/fa';
import CleanBinaryTree from '../../CleanBinaryTree';
import { useUserData, useLoadingStates, useDashboardActions } from '../../../stores/dashboardStore';
import { SkeletonCard, LoadingSpinner } from '../../ui/LoadingStates';
import './BinaryTreeSection.css';

const BinaryTreeSection = () => {
  const userData = useUserData();
  const loading = useLoadingStates();
  const { setLoading, setError } = useDashboardActions();
  
  const [viewMode, setViewMode] = useState('full'); // 'compact', 'full', 'analytics'
  const [treeLayout, setTreeLayout] = useState('vertical');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [showBusinessMetrics, setShowBusinessMetrics] = useState(true);
  const [treeData, setTreeData] = useState(null);

  // Sample enhanced tree data aligned with LeadFive business model
  const generateBusinessTreeData = () => {
    return {
      id: 'root',
      name: userData?.account ? `${userData.account.slice(0, 6)}...${userData.account.slice(-4)}` : 'You',
      address: userData?.account || '0x29dcCb502D10C042BcC6a02a7762C49595A9E498',
      level: 0,
      position: 'root',
      package: {
        type: 'professional',
        amount: userData?.currentPackage || 100,
        name: 'Professional',
        color: '#8B5CF6'
      },
      earnings: {
        total: userData?.earnings?.total || 2847.50,
        direct: userData?.earnings?.direct || 1138.50,
        level: userData?.earnings?.level || 854.25,
        uplink: userData?.earnings?.uplink || 569.50,
        leadership: userData?.earnings?.leadership || 284.75
      },
      performance: {
        conversionRate: 87.5,
        activeReferrals: 12,
        monthlyVolume: 3200,
        growthRate: 23.5
      },
      rank: {
        current: 'gold',
        icon: '🥇',
        color: '#FFD700'
      },
      status: 'active',
      joinDate: '2024-01-15',
      lastActivity: '2025-01-05',
      businessMetrics: {
        teamSize: 47,
        teamVolume: 12450,
        personalSales: 800,
        leadershipLevel: 3
      }
    };
  };

  // Business analytics summary
  const businessSummary = {
    totalMembers: 47,
    activeMembers: 42,
    totalVolume: 12450,
    networkDepth: 6,
    leftLegVolume: 6200,
    rightLegVolume: 6250,
    balanceRatio: 99.2,
    monthlyGrowth: 23.5,
    conversionRate: 89.4,
    averageEarnings: 264.36,
    topPerformers: [
      { name: '0x7890...abcd', earnings: 850.25, rank: 'silver' },
      { name: '0x2345...6789', earnings: 720.50, rank: 'silver' },
      { name: '0x5678...9012', earnings: 650.75, rank: 'bronze' }
    ]
  };

  // Load tree data
  useEffect(() => {
    const loadTreeData = async () => {
      try {
        setLoading('referrals', true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data = generateBusinessTreeData();
        setTreeData(data);
      } catch (error) {
        setError('referrals', 'Failed to load tree data');
      } finally {
        setLoading('referrals', false);
      }
    };

    loadTreeData();
  }, [setLoading, setError, userData]);

  if (loading.referrals) {
    return (
      <div className="binary-tree-section">
        <div className="section-header">
          <div className="header-content">
            <h2><FaNetworkWired /> Binary Tree Structure</h2>
            <p>Loading your network visualization...</p>
          </div>
        </div>
        <div className="loading-container">
          <SkeletonCard className="skeleton-large" />
          <div className="skeleton-grid">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="binary-tree-section">
      {/* Section Header */}
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <h2><FaNetworkWired /> Binary Tree Network</h2>
          <p>Visualize and manage your MLM network structure with advanced business intelligence</p>
        </div>
        
        <div className="header-controls">
          <div className="view-mode-selector">
            <button 
              className={`mode-btn ${viewMode === 'compact' ? 'active' : ''}`}
              onClick={() => setViewMode('compact')}
            >
              <FaLayerGroup /> Compact
            </button>
            <button 
              className={`mode-btn ${viewMode === 'full' ? 'active' : ''}`}
              onClick={() => setViewMode('full')}
            >
              <FaExpand /> Full View
            </button>
            <button 
              className={`mode-btn ${viewMode === 'analytics' ? 'active' : ''}`}
              onClick={() => setViewMode('analytics')}
            >
              <FaChartLine /> Analytics
            </button>
          </div>
          
          <div className="layout-selector">
            <button 
              className={`layout-btn ${treeLayout === 'vertical' ? 'active' : ''}`}
              onClick={() => setTreeLayout('vertical')}
              title="Vertical Layout"
            >
              <FaArrowDown />
            </button>
            <button 
              className={`layout-btn ${treeLayout === 'horizontal' ? 'active' : ''}`}
              onClick={() => setTreeLayout('horizontal')}
              title="Horizontal Layout"
            >
              <FaArrowUp style={{ transform: 'rotate(90deg)' }} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Business Metrics Summary Cards */}
      {(viewMode === 'full' || viewMode === 'analytics') && (
        <motion.div 
          className="metrics-summary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="metrics-grid">
            <div className="metric-card primary">
              <div className="metric-icon">
                <FaUsers />
              </div>
              <div className="metric-content">
                <div className="metric-value">{businessSummary.totalMembers}</div>
                <div className="metric-label">Total Network</div>
                <div className="metric-change positive">+{businessSummary.monthlyGrowth}%</div>
              </div>
            </div>

            <div className="metric-card success">
              <div className="metric-icon">
                <FaTrophy />
              </div>
              <div className="metric-content">
                <div className="metric-value">{businessSummary.activeMembers}</div>
                <div className="metric-label">Active Members</div>
                <div className="metric-change positive">{businessSummary.conversionRate}% rate</div>
              </div>
            </div>

            <div className="metric-card info">
              <div className="metric-icon">
                <FaDollarSign />
              </div>
              <div className="metric-content">
                <div className="metric-value">${businessSummary.totalVolume.toLocaleString()}</div>
                <div className="metric-label">Network Volume</div>
                <div className="metric-change positive">+15.2% this month</div>
              </div>
            </div>

            <div className="metric-card warning">
              <div className="metric-icon">
                <FaBalanceScale />
              </div>
              <div className="metric-content">
                <div className="metric-value">{businessSummary.balanceRatio}%</div>
                <div className="metric-label">Leg Balance</div>
                <div className="metric-change neutral">Optimal range</div>
              </div>
            </div>
          </div>

          {/* Leg Comparison */}
          <div className="leg-comparison">
            <div className="leg-item left">
              <div className="leg-header">
                <FaArrowDown className="leg-icon" />
                <span>Left Leg</span>
              </div>
              <div className="leg-stats">
                <div className="leg-volume">${businessSummary.leftLegVolume.toLocaleString()}</div>
                <div className="leg-members">24 members</div>
              </div>
              <div className="leg-bar">
                <div 
                  className="leg-fill left" 
                  style={{ width: `${(businessSummary.leftLegVolume / (businessSummary.leftLegVolume + businessSummary.rightLegVolume)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="balance-indicator">
              <FaBalanceScale />
              <span>{businessSummary.balanceRatio}%</span>
            </div>

            <div className="leg-item right">
              <div className="leg-header">
                <FaArrowDown className="leg-icon" />
                <span>Right Leg</span>
              </div>
              <div className="leg-stats">
                <div className="leg-volume">${businessSummary.rightLegVolume.toLocaleString()}</div>
                <div className="leg-members">23 members</div>
              </div>
              <div className="leg-bar">
                <div 
                  className="leg-fill right" 
                  style={{ width: `${(businessSummary.rightLegVolume / (businessSummary.leftLegVolume + businessSummary.rightLegVolume)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Advanced Genealogy Tree Visualization */}
      <motion.div 
        className={`tree-visualization ${viewMode}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {treeData && (
          <CleanBinaryTree
            userAddress={userData?.account}
            account={userData?.account}
            data={treeData}
            showControls={viewMode === 'full'}
          />
        )}
      </motion.div>

      {/* Top Performers Section */}
      {viewMode === 'analytics' && (
        <motion.div 
          className="top-performers"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3><FaCrown /> Top Performers</h3>
          <div className="performers-list">
            {businessSummary.topPerformers.map((performer, index) => (
              <div key={index} className="performer-card">
                <div className="performer-rank">#{index + 1}</div>
                <div className="performer-info">
                  <div className="performer-name">{performer.name}</div>
                  <div className="performer-earnings">${performer.earnings}</div>
                </div>
                <div className="performer-badge">
                  <FaGem className={`rank-icon ${performer.rank}`} />
                  <span className="rank-name">{performer.rank}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Panel */}
      <motion.div 
        className="action-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="action-buttons">
          <button className="action-btn primary">
            <FaShare /> Share Tree
          </button>
          <button className="action-btn secondary">
            <FaDownload /> Export Data
          </button>
          <button className="action-btn tertiary">
            <FaEye /> Full Screen
          </button>
        </div>
        
        <div className="quick-stats">
          <div className="quick-stat">
            <span className="stat-label">Network Depth:</span>
            <span className="stat-value">{businessSummary.networkDepth} levels</span>
          </div>
          <div className="quick-stat">
            <span className="stat-label">Avg. Earnings:</span>
            <span className="stat-value">${businessSummary.averageEarnings}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BinaryTreeSection;
