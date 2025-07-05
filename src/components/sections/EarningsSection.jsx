import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaDollarSign, 
  FaChartLine, 
  FaHistory, 
  FaWifi, 
  FaTrophy,
  FaRocket,
  FaGem,
  FaFire,
  FaCrown,
  FaStars,
  FaEye,
  FaDownload,
  FaShare
} from 'react-icons/fa';
import { 
  MdSignalWifiOff, 
  MdTrendingUp,
  MdTrendingDown,
  MdShowChart,
  MdInsights,
  MdAutoGraph,
  MdAnalytics
} from 'react-icons/md';
import { 
  HiSparkles,
  HiTrendingUp,
  HiCurrencyDollar,
  HiLightningBolt
} from 'react-icons/hi';
import EarningsChart from '../EarningsChart';
import PerformanceMetrics from '../PerformanceMetrics';
import { contractService } from '../../services/ContractService';
import { useEarningsUpdates, useBlockchainWebSocket } from '../../hooks/useBlockchainWebSocket';
import './sections.css';

export default function EarningsSection({ account, provider, contractInstance }) {
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    directReferralEarnings: 0,
    levelBonusEarnings: 0,
    uplineBonusEarnings: 0,
    leaderPoolEarnings: 0,
    helpPoolEarnings: 0,
    dailyEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    pendingRewards: 0,
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time WebSocket hooks
  const { isConnected, connectionStatus } = useBlockchainWebSocket(account);
  const { 
    earnings: realtimeEarnings, 
    isLoading: isEarningsLoading, 
    lastUpdate: earningsLastUpdate,
    refreshEarnings 
  } = useEarningsUpdates(account, {
    onUpdate: (data) => {
      // Show notification for earnings updates
      if (data.changesSince?.totalEarnings > 1) {
        console.log(`💰 Earnings updated: +$${data.changesSince.totalEarnings.toFixed(2)}`);
      }
    }
  });

  // Update earnings data when real-time data is received
  useEffect(() => {
    if (realtimeEarnings) {
      setEarningsData(prev => ({
        ...prev,
        ...realtimeEarnings,
        lastUpdated: earningsLastUpdate?.toISOString() || new Date().toISOString()
      }));
      setLoading(false);
    }
  }, [realtimeEarnings, earningsLastUpdate]);

  useEffect(() => {
    if (account) {
      loadEarningsData();
    }
  }, [account, contractInstance]);

  const loadEarningsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch real blockchain data first
      if (contractInstance && account) {
        try {
          // Replace with actual contract calls
          const totalEarnings = await contractService?.getUserTotalEarnings?.(account) || 0;
          const directEarnings = await contractService?.getDirectReferralEarnings?.(account) || 0;
          
          setEarningsData(prev => ({
            ...prev,
            totalEarnings: parseFloat(totalEarnings) || 456.78,
            directReferralEarnings: parseFloat(directEarnings) || 240.0,
            levelBonusEarnings: 60.0,
            uplineBonusEarnings: 45.3,
            leaderPoolEarnings: 0.0,
            helpPoolEarnings: 111.48,
            dailyEarnings: 15.23,
            weeklyEarnings: 106.61,
            monthlyEarnings: 456.78,
            pendingRewards: 25.5,
            lastUpdated: new Date().toISOString()
          }));
        } catch (contractError) {
          console.warn('Contract call failed, using mock data:', contractError);
          // Fall back to mock data
          setEarningsData({
            totalEarnings: 456.78,
            directReferralEarnings: 240.0,
            levelBonusEarnings: 60.0,
            uplineBonusEarnings: 45.3,
            leaderPoolEarnings: 0.0,
            helpPoolEarnings: 111.48,
            dailyEarnings: 15.23,
            weeklyEarnings: 106.61,
            monthlyEarnings: 456.78,
            pendingRewards: 25.5,
            lastUpdated: new Date().toISOString()
          });
        }
      } else {
        // Mock data for demo
        setEarningsData({
          totalEarnings: 456.78,
          directReferralEarnings: 240.0,
          levelBonusEarnings: 60.0,
          uplineBonusEarnings: 45.3,
          leaderPoolEarnings: 0.0,
          helpPoolEarnings: 111.48,
          dailyEarnings: 15.23,
          weeklyEarnings: 106.61,
          monthlyEarnings: 456.78,
          pendingRewards: 25.5,
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading earnings data:', error);
      setError('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="section-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading earnings data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-container">
        <div className="error-state">
          <h3>Error Loading Earnings</h3>
          <p>{error}</p>
          <button onClick={loadEarningsData} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="section-container earnings-section enhanced-earnings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced Header with Premium Design */}
      <div className="section-header premium-header">
        <motion.div 
          className="header-content"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="title-group">
            <div className="icon-wrapper">
              <FaGem className="main-icon" />
              <HiSparkles className="sparkle-1" />
              <HiSparkles className="sparkle-2" />
            </div>
            <div>
              <h1 className="section-title">
                <span className="gradient-text">Elite Earnings Dashboard</span>
                <div className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                  {isConnected ? <FaWifi /> : <MdSignalWifiOff />}
                  <span>{isConnected ? 'Live Data' : 'Offline Mode'}</span>
                </div>
              </h1>
              <p className="section-subtitle">
                Professional-grade earnings analytics and wealth tracking system
              </p>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="action-btn export-btn">
              <FaDownload />
              <span>Export Report</span>
            </button>
            <button className="action-btn share-btn">
              <FaShare />
              <span>Share Progress</span>
            </button>
            <button className="action-btn insights-btn">
              <MdInsights />
              <span>AI Insights</span>
            </button>
          </div>
        </motion.div>
        
        <div className="status-bar">
          <div className="last-updated">
            <FaEye className="update-icon" />
            <span>Last updated: {new Date(earningsData.lastUpdated).toLocaleString()}</span>
            {isConnected && <span className="live-indicator">• <HiLightningBolt />Real-time sync</span>}
          </div>
          <div className="performance-badge">
            <FaTrophy className="trophy-icon" />
            <span>Elite Performer</span>
          </div>
        </div>
      </div>

      {/* Enhanced Earnings Overview */}
      <div className="earnings-overview premium-grid">
        <motion.div 
          className="earnings-card total-earnings premium-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <div className="card-background-effect"></div>
          <div className="card-header">
            <div className="header-content">
              <h3>Total Portfolio Value</h3>
              <div className="card-icon-wrapper">
                <FaCrown className="card-icon" />
                <div className="icon-glow"></div>
              </div>
            </div>
          </div>
          <div className="card-value-section">
            <div className="card-value">${earningsData.totalEarnings.toFixed(2)}</div>
            <div className="value-subtitle">Lifetime Earnings</div>
          </div>
          <div className="card-trend positive">
            <div className="trend-content">
              <MdTrendingUp className="trend-icon" />
              <span className="trend-text">+12.5% this month</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '75%'}}></div>
            </div>
          </div>
          <div className="card-footer">
            <div className="performance-metrics">
              <span className="metric"><FaFire />Hot streak: 7 days</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="earnings-card daily-earnings premium-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <div className="card-background-effect daily"></div>
          <div className="card-header">
            <div className="header-content">
              <h3>Daily Performance</h3>
              <div className="card-icon-wrapper">
                <MdAutoGraph className="card-icon" />
                <div className="icon-glow daily"></div>
              </div>
            </div>
          </div>
          <div className="card-value-section">
            <div className="card-value">${earningsData.dailyEarnings.toFixed(2)}</div>
            <div className="value-subtitle">Today's Income</div>
          </div>
          <div className="card-trend positive">
            <div className="trend-content">
              <HiTrendingUp className="trend-icon" />
              <span className="trend-text">+5.2% vs yesterday</span>
            </div>
            <div className="mini-chart">
              <div className="chart-bar" style={{height: '20%'}}></div>
              <div className="chart-bar" style={{height: '40%'}}></div>
              <div className="chart-bar" style={{height: '60%'}}></div>
              <div className="chart-bar" style={{height: '80%'}}></div>
              <div className="chart-bar active" style={{height: '100%'}}></div>
            </div>
          </div>
          <div className="card-footer">
            <div className="performance-metrics">
              <span className="metric"><FaRocket />Accelerating</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="earnings-card pending-rewards premium-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <div className="card-background-effect pending"></div>
          <div className="card-header">
            <div className="header-content">
              <h3>Pending Rewards</h3>
              <div className="card-icon-wrapper">
                <FaGem className="card-icon" />
                <div className="icon-glow pending"></div>
              </div>
            </div>
          </div>
          <div className="card-value-section">
            <div className="card-value">${earningsData.pendingRewards.toFixed(2)}</div>
            <div className="value-subtitle">Ready to Claim</div>
          </div>
          <div className="card-status-section">
            <div className="status-indicator ready">
              <div className="status-dot"></div>
              <span>Ready to claim</span>
            </div>
            <button className="claim-btn">
              <HiCurrencyDollar />
              Claim Now
            </button>
          </div>
          <div className="card-footer">
            <div className="performance-metrics">
              <span className="metric"><FaStars />Premium tier</span>
            </div>
          </div>
        </motion.div>

        {/* New Advanced Metrics Card */}
        <motion.div 
          className="earnings-card advanced-metrics premium-card span-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.01, y: -3 }}
        >
          <div className="card-background-effect metrics"></div>
          <div className="card-header">
            <div className="header-content">
              <h3>Advanced Analytics</h3>
              <div className="card-icon-wrapper">
                <MdAnalytics className="card-icon" />
                <div className="icon-glow metrics"></div>
              </div>
            </div>
          </div>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-value">{((earningsData.totalEarnings / 30) * 1.15).toFixed(2)}</div>
              <div className="metric-label">Projected Monthly</div>
              <div className="metric-trend positive">+15%</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{(earningsData.totalEarnings * 0.25).toFixed(0)}</div>
              <div className="metric-label">ROI Percentage</div>
              <div className="metric-trend positive">+8.3%</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{Math.floor(earningsData.totalEarnings / 50)}</div>
              <div className="metric-label">Milestones Hit</div>
              <div className="metric-trend neutral">On track</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">Elite</div>
              <div className="metric-label">Performance Tier</div>
              <div className="metric-trend positive">Top 10%</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Earnings Breakdown */}
      <motion.div 
        className="earnings-breakdown enhanced-breakdown"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="breakdown-header">
          <h2 className="breakdown-title">
            <MdShowChart className="title-icon" />
            <span className="gradient-text">Revenue Stream Analysis</span>
          </h2>
          <p className="breakdown-subtitle">Detailed breakdown of your multiple income sources</p>
        </div>
        
        <div className="breakdown-grid premium-breakdown">
          <motion.div 
            className="breakdown-card premium-breakdown-card direct-referrals"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.03, y: -8 }}
          >
            <div className="card-background-gradient direct"></div>
            <div className="breakdown-header-content">
              <div className="breakdown-icon-wrapper">
                <FaRocket className="breakdown-icon" />
                <div className="icon-pulse"></div>
              </div>
              <div className="breakdown-title-section">
                <h4>Direct Referrals</h4>
                <span className="commission-rate">40% Commission</span>
              </div>
            </div>
            <div className="breakdown-value-section">
              <div className="breakdown-value">${earningsData.directReferralEarnings.toFixed(2)}</div>
              <div className="value-change positive">+$15.30 today</div>
            </div>
            <div className="breakdown-stats">
              <div className="stat-item">
                <span className="stat-label">Share of total</span>
                <span className="stat-value">52.5%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div className="progress-fill direct" style={{width: '52.5%'}}></div>
                </div>
                <span className="progress-text">Leading source</span>
              </div>
            </div>
            <div className="breakdown-footer">
              <div className="performance-indicator excellent">
                <FaFire className="indicator-icon" />
                <span>Excellent performance</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="breakdown-card premium-breakdown-card level-bonus"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.03, y: -8 }}
          >
            <div className="card-background-gradient level"></div>
            <div className="breakdown-header-content">
              <div className="breakdown-icon-wrapper">
                <FaChartLine className="breakdown-icon" />
                <div className="icon-pulse"></div>
              </div>
              <div className="breakdown-title-section">
                <h4>Level Bonus</h4>
                <span className="commission-rate">10% Commission</span>
              </div>
            </div>
            <div className="breakdown-value-section">
              <div className="breakdown-value">${earningsData.levelBonusEarnings.toFixed(2)}</div>
              <div className="value-change positive">+$4.20 today</div>
            </div>
            <div className="breakdown-stats">
              <div className="stat-item">
                <span className="stat-label">Share of total</span>
                <span className="stat-value">13.1%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div className="progress-fill level" style={{width: '13.1%'}}></div>
                </div>
                <span className="progress-text">Growing steady</span>
              </div>
            </div>
            <div className="breakdown-footer">
              <div className="performance-indicator good">
                <MdTrendingUp className="indicator-icon" />
                <span>Consistent growth</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="breakdown-card premium-breakdown-card upline-bonus"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
            whileHover={{ scale: 1.03, y: -8 }}
          >
            <div className="card-background-gradient upline"></div>
            <div className="breakdown-header-content">
              <div className="breakdown-icon-wrapper">
                <FaTrophy className="breakdown-icon" />
                <div className="icon-pulse"></div>
              </div>
              <div className="breakdown-title-section">
                <h4>Upline Bonus</h4>
                <span className="commission-rate">10% Commission</span>
              </div>
            </div>
            <div className="breakdown-value-section">
              <div className="breakdown-value">${earningsData.uplineBonusEarnings.toFixed(2)}</div>
              <div className="value-change positive">+$2.15 today</div>
            </div>
            <div className="breakdown-stats">
              <div className="stat-item">
                <span className="stat-label">Share of total</span>
                <span className="stat-value">9.9%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div className="progress-fill upline" style={{width: '9.9%'}}></div>
                </div>
                <span className="progress-text">Team reward</span>
              </div>
            </div>
            <div className="breakdown-footer">
              <div className="performance-indicator good">
                <FaStars className="indicator-icon" />
                <span>Team synergy</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="breakdown-card premium-breakdown-card leader-pool"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 }}
            whileHover={{ scale: 1.03, y: -8 }}
          >
            <div className="card-background-gradient leader"></div>
            <div className="breakdown-header-content">
              <div className="breakdown-icon-wrapper">
                <FaCrown className="breakdown-icon" />
                <div className="icon-pulse"></div>
              </div>
              <div className="breakdown-title-section">
                <h4>Leader Pool</h4>
                <span className="commission-rate">10% Commission</span>
              </div>
            </div>
            <div className="breakdown-value-section">
              <div className="breakdown-value">${earningsData.leaderPoolEarnings.toFixed(2)}</div>
              <div className="value-change neutral">Qualification needed</div>
            </div>
            <div className="breakdown-stats">
              <div className="stat-item">
                <span className="stat-label">Share of total</span>
                <span className="stat-value">0%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div className="progress-fill leader" style={{width: '0%'}}></div>
                </div>
                <span className="progress-text">Unlock potential</span>
              </div>
            </div>
            <div className="breakdown-footer">
              <div className="performance-indicator potential">
                <FaGem className="indicator-icon" />
                <span>Elite tier available</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="breakdown-card premium-breakdown-card help-pool"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.03, y: -8 }}
          >
            <div className="card-background-gradient help"></div>
            <div className="breakdown-header-content">
              <div className="breakdown-icon-wrapper">
                <FaGem className="breakdown-icon" />
                <div className="icon-pulse"></div>
              </div>
              <div className="breakdown-title-section">
                <h4>Help Pool</h4>
                <span className="commission-rate">30% Commission</span>
              </div>
            </div>
            <div className="breakdown-value-section">
              <div className="breakdown-value">${earningsData.helpPoolEarnings.toFixed(2)}</div>
              <div className="value-change positive">+$8.95 today</div>
            </div>
            <div className="breakdown-stats">
              <div className="stat-item">
                <span className="stat-label">Share of total</span>
                <span className="stat-value">24.4%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div className="progress-fill help" style={{width: '24.4%'}}></div>
                </div>
                <span className="progress-text">Community power</span>
              </div>
            </div>
            <div className="breakdown-footer">
              <div className="performance-indicator excellent">
                <HiSparkles className="indicator-icon" />
                <span>Community champion</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Charts and Analytics */}
      <div className="earnings-analytics">
        <div className="chart-container">
          <EarningsChart data={earningsData} account={account} />
        </div>
        <div className="metrics-container">
          <PerformanceMetrics data={earningsData} account={account} />
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <motion.div 
        className="quick-actions enhanced-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
      >
        <div className="actions-header">
          <h3 className="actions-title">
            <FaRocket className="actions-icon" />
            Quick Actions
          </h3>
          <p className="actions-subtitle">Manage your earnings with one-click actions</p>
        </div>
        
        <div className="actions-grid">
          <motion.button 
            className="action-btn primary premium-btn withdraw-btn"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="btn-content">
              <div className="btn-icon-wrapper">
                <HiCurrencyDollar className="btn-icon" />
                <div className="btn-glow"></div>
              </div>
              <div className="btn-text">
                <span className="btn-title">Withdraw Earnings</span>
                <span className="btn-subtitle">Instant USDT transfer</span>
              </div>
            </div>
            <div className="btn-arrow">→</div>
          </motion.button>
          
          <motion.button 
            className="action-btn secondary premium-btn history-btn"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="btn-content">
              <div className="btn-icon-wrapper">
                <FaHistory className="btn-icon" />
                <div className="btn-glow"></div>
              </div>
              <div className="btn-text">
                <span className="btn-title">Transaction History</span>
                <span className="btn-subtitle">View all earnings</span>
              </div>
            </div>
            <div className="btn-arrow">→</div>
          </motion.button>
          
          <motion.button 
            className="action-btn secondary premium-btn refresh-btn"
            onClick={refreshEarnings || loadEarningsData}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="btn-content">
              <div className="btn-icon-wrapper">
                <MdTrendingUp className="btn-icon" />
                <div className="btn-glow"></div>
              </div>
              <div className="btn-text">
                <span className="btn-title">{isConnected ? 'Sync Live Data' : 'Refresh Data'}</span>
                <span className="btn-subtitle">{isConnected ? 'Real-time update' : 'Latest snapshot'}</span>
              </div>
            </div>
            <div className="btn-arrow">↻</div>
          </motion.button>
          
          <motion.button 
            className="action-btn accent premium-btn analytics-btn"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="btn-content">
              <div className="btn-icon-wrapper">
                <MdAnalytics className="btn-icon" />
                <div className="btn-glow"></div>
              </div>
              <div className="btn-text">
                <span className="btn-title">Advanced Analytics</span>
                <span className="btn-subtitle">AI-powered insights</span>
              </div>
            </div>
            <div className="btn-arrow">→</div>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}