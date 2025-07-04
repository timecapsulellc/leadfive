import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUsers, 
  FaChartLine, 
  FaDollarSign, 
  FaNetworkWired,
  FaWallet,
  FaHistory,
  FaCog,
  FaBell,
  FaUserCircle,
  FaShieldAlt,
  FaTrophy,
  FaRocket,
  FaChartBar,
  FaGift,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRobot,
  FaBrain,
  FaLightbulb,
  FaGamepad,
  FaEye,
  FaShare,
  FaCopy,
  FaExpand,
  FaCompress,
  FaRefresh
} from 'react-icons/fa';

// Import ALL your existing components - PRESERVED
import LevelVisualization from '../LevelVisualization';
import CommunityLevelsVisualization from '../CommunityLevelsVisualization';
import EarningsChart from '../EarningsChart';
import ReferralStats from '../ReferralStats';
import WithdrawalHistory from '../WithdrawalHistory';
import ActivityFeed from '../ActivityFeed';
import PerformanceMetrics from '../PerformanceMetrics';
import NotificationSystem from '../NotificationSystem';
import PageWrapper from '../PageWrapper';

// AI Components - PRESERVED
import AICoachingPanel from '../AICoachingPanel';
import AIEarningsPrediction from '../AIEarningsPrediction';
import AITransactionHelper from '../AITransactionHelper';
import AIMarketInsights from '../AIMarketInsights';
import AISuccessStories from '../AISuccessStories';
import AIEmotionTracker from '../AIEmotionTracker';
import ErrorBoundary from '../ErrorBoundary';
import MobileNavigation from '../MobileNavigation';
import UnifiedChatbot from '../UnifiedChatbot';
import GamificationSystem from '../GamificationSystem';

// Enhanced components (optional additions)
import EnhancedKPICards from './EnhancedKPICards';
import LiveNotifications from './LiveNotifications';
import QuickActionsPanel from './QuickActionsPanel';

import './EnhancedDashboard.css';

export default function EnhancedDashboard({ account, provider, onDisconnect }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  
  // PRESERVE all your existing dashboard data structure
  const [dashboardData, setDashboardData] = useState({
    totalEarnings: 0,
    directReferralEarnings: 0, // 40%
    levelBonusEarnings: 0, // 10%
    uplineBonusEarnings: 0, // 10%
    leaderPoolEarnings: 0, // 10%
    helpPoolEarnings: 0, // 30%
    teamSize: 0,
    directReferrals: 0,
    activeReferrals: 0,
    currentPackage: 0, // $30, $50, $100, $200
    maxEarnings: 0, // 4x package value
    currentTier: 1,
    currentLevel: 1,
    dailyEarnings: 0,
    pendingRewards: 0,
    withdrawalRatio: { withdraw: 70, reinvest: 30 }, // Based on referrals
    helpPoolEligible: true,
    leaderRank: 'none' // 'shining-star' or 'silver-star'
  });
  const [loading, setLoading] = useState(true);
  
  // AI Integration State - PRESERVED
  const [aiInsights, setAiInsights] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);
  const [audioNative, setAudioNative] = useState(null);

  useEffect(() => {
    if (!account) {
      navigate('/');
      return;
    }
    loadDashboardData();
  }, [account, navigate]);

  // PRESERVE your existing data loading function
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate loading Lead Five dashboard data
      setTimeout(() => {
        setDashboardData({
          totalEarnings: 456.78,
          directReferralEarnings: 240.00, // 40% of commissions
          levelBonusEarnings: 60.00, // 10% distributed across levels
          uplineBonusEarnings: 45.30, // 10% from upline structure
          leaderPoolEarnings: 0.00, // 10% - not qualified yet
          helpPoolEarnings: 111.48, // 30% from weekly distributions
          teamSize: 25,
          directReferrals: 3,
          activeReferrals: 2,
          currentPackage: 100, // $100 package
          maxEarnings: 400, // 4x $100 = $400
          currentTier: 1,
          currentLevel: 1,
          dailyEarnings: 15.23,
          pendingRewards: 25.50,
          withdrawalRatio: { withdraw: 70, reinvest: 30 }, // 0 referrals = 70/30
          helpPoolEligible: true,
          leaderRank: 'none' // Not qualified for leader status yet
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  // PRESERVE your existing menu items - EXACTLY THE SAME
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: FaChartLine },
    { id: 'earnings', label: 'My Earnings', icon: FaDollarSign },
    { id: 'direct-referrals', label: 'Direct Referrals (40%)', icon: FaUsers },
    { id: 'level-bonus', label: 'Level Bonus (10%)', icon: FaNetworkWired },
    { id: 'upline-bonus', label: 'Upline Bonus (10%)', icon: FaChartBar },
    { id: 'leader-pool', label: 'Leader Pool (10%)', icon: FaTrophy },
    { id: 'help-pool', label: 'Help Pool (30%)', icon: FaGift },
    { id: 'packages', label: 'Packages', icon: FaRocket },
    { id: 'community-tiers', label: 'Community Tiers', icon: FaShieldAlt },
    { id: 'withdrawals', label: 'Withdrawals', icon: FaWallet },
    { id: 'team-structure', label: 'My Team', icon: FaUsers },
    { id: 'gamification', label: 'Achievements & Rewards', icon: FaGamepad },
    { id: 'reports', label: 'Reports', icon: FaHistory },
    { id: 'ai-insights', label: 'AI Assistant', icon: FaRobot },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  // Enhanced Dashboard Overview with ALL your existing features PLUS enhancements
  const EnhancedDashboardOverview = ({ data, account }) => {
    return (
      <div className="enhanced-dashboard-section">
        {/* NEW: Enhanced KPI Cards on top of your existing welcome banner */}
        <EnhancedKPICards data={data} />
        
        {/* PRESERVED: Your existing welcome banner */}
        <div className="welcome-banner">
          <div className="welcome-content">
            <h2>Welcome to LeadFive!</h2>
            <p>Build your financial future with our proven 4x earning system</p>
          </div>
          <button className="welcome-cta-button">Get Started</button>
        </div>

        {/* PRESERVED: Your existing Quick Stats */}
        <div className="overview-stats">
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaDollarSign className="stat-icon" />
            <div className="stat-value">${data.totalEarnings.toFixed(2)}</div>
            <div className="stat-label">Total Earnings</div>
          </motion.div>
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaUsers className="stat-icon" />
            <div className="stat-value">{data.directReferrals}</div>
            <div className="stat-label">Direct Referrals</div>
          </motion.div>
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaNetworkWired className="stat-icon" />
            <div className="stat-value">{data.teamSize}</div>
            <div className="stat-label">Team Size</div>
          </motion.div>
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaRocket className="stat-icon" />
            <div className="stat-value">${data.currentPackage}</div>
            <div className="stat-label">Current Package</div>
          </motion.div>
        </div>

        {/* PRESERVED: Your existing Charts and Insights */}
        <div className="card-grid">
          <EarningsChart data={data} />
          <ActivityFeed />
        </div>

        <div className="card-grid">
          <LevelVisualization data={data} account={account} />
          <CommunityLevelsVisualization 
            userAddress={account}
            contractInstance={null}
            mode="enhanced"
            showControls={true}
            initialDepth={3}
          />
        </div>

        {/* NEW: Additional enhanced features */}
        <div className="enhancement-row">
          <LiveNotifications />
          <QuickActionsPanel data={data} />
        </div>
      </div>
    );
  };

  // PRESERVE ALL your existing section components - EXACTLY THE SAME
  const EarningsBreakdown = ({ data, account }) => {
    return (
      <div className="dashboard-section">
        <h2 className="section-title">Earnings Breakdown</h2>
        
        <div className="card-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Direct Referrals (40%)</h3>
              <FaUsers className="card-icon" />
            </div>
            <div className="card-value">${data.directReferralEarnings.toFixed(2)}</div>
            <div className="card-label">From {data.directReferrals} direct referrals</div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Level Bonus (10%)</h3>
              <FaNetworkWired className="card-icon" />
            </div>
            <div className="card-value">${data.levelBonusEarnings.toFixed(2)}</div>
            <div className="card-label">Multi-level commissions</div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Upline Bonus (10%)</h3>
              <FaChartBar className="card-icon" />
            </div>
            <div className="card-value">${data.uplineBonusEarnings.toFixed(2)}</div>
            <div className="card-label">From upline structure</div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Leader Pool (10%)</h3>
              <FaTrophy className="card-icon" />
            </div>
            <div className="card-value">${data.leaderPoolEarnings.toFixed(2)}</div>
            <div className="card-label">{data.leaderRank === 'none' ? 'Not qualified yet' : 'Leader qualified'}</div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Help Pool (30%)</h3>
              <FaGift className="card-icon" />
            </div>
            <div className="card-value">${data.helpPoolEarnings.toFixed(2)}</div>
            <div className="card-label">{data.helpPoolEligible ? 'Eligible' : 'Not eligible'}</div>
          </div>
        </div>

        <PerformanceMetrics data={data} account={account} />
      </div>
    );
  };

  // PRESERVE all your other existing section components
  const DirectReferralsSection = ({ data, account }) => {
    return (
      <div className="dashboard-section">
        <h2 className="section-title">Direct Referrals (40% Commission)</h2>
        <ReferralStats data={data} account={account} />
      </div>
    );
  };

  const LevelBonusSection = ({ data, account }) => {
    return (
      <div className="dashboard-section">
        <h2 className="section-title">Level Bonus (10% Commission)</h2>
        <LevelVisualization data={data} account={account} />
      </div>
    );
  };

  const UplineBonusSection = ({ data, account }) => {
    return (
      <div className="dashboard-section">
        <h2 className="section-title">Upline Bonus (10% Commission)</h2>
        <p>This section shows earnings from your upline structure.</p>
      </div>
    );
  };

  const LeaderPoolSection = ({ data, account }) => {
    return (
      <div className="dashboard-section">
        <h2 className="section-title">Leader Pool (10% Commission)</h2>
        <p>Qualify for leader status to access this pool.</p>
      </div>
    );
  };

  const HelpPoolSection = ({ data, account }) => {
    return (
      <div className="dashboard-section">
        <h2 className="section-title">Help Pool (30% Commission)</h2>
        <p>Weekly distributions from the community help pool.</p>
      </div>
    );
  };

  const PackagesSection = ({ data, account }) => {
    return (
      <div className="dashboard-section">
        <h2 className="section-title">Package Management</h2>
        <p>Current Package: ${data.currentPackage}</p>
        <p>Maximum Earnings: ${data.maxEarnings} (4x package value)</p>
      </div>
    );
  };

  const CommunityTiersSection = ({ data, account }) => {
    return (
      <div className="dashboard-section">
        <h2 className="section-title">Community Tiers</h2>
        <LevelVisualization data={data} account={account} />
      </div>
    );
  };

  const WithdrawalsSection = ({ data, account }) => {
    return (
      <div className="dashboard-section">
        <h2 className="section-title">Withdrawals</h2>
        <WithdrawalHistory data={data} account={account} />
      </div>
    );
  };

  const TeamStructureSection = ({ account }) => {
    return (
      <div className="dashboard-section">
        <h2 className="section-title">Team Structure</h2>
        <CommunityLevelsVisualization 
          userAddress={account}
          contractInstance={null}
          mode="standard"
          showControls={false}
          initialDepth={2}
        />
      </div>
    );
  };

  const GamificationSection = ({ data, account }) => {
    return (
      <div className="dashboard-section">
        <h2 className="section-title">Achievements & Rewards</h2>
        <GamificationSystem data={data} account={account} />
      </div>
    );
  };

  const ReportsSection = ({ account }) => {
    return (
      <div className="dashboard-section">
        <h2 className="section-title">Reports & Analytics</h2>
        <PerformanceMetrics account={account} />
      </div>
    );
  };

  const AIInsightsSection = ({ data, account }) => {
    return (
      <div className="dashboard-section">
        <h2 className="section-title">AI Assistant & Insights</h2>
        
        <div className="card-grid">
          <AICoachingPanel data={data} account={account} />
          <AIEarningsPrediction data={data} account={account} />
        </div>
        
        <div className="card-grid">
          <AITransactionHelper data={data} account={account} />
          <AIMarketInsights account={account} />
        </div>
        
        <div className="card-grid">
          <AISuccessStories account={account} />
          <AIEmotionTracker account={account} />
        </div>
      </div>
    );
  };

  const SettingsSection = ({ account, onDisconnect }) => {
    return (
      <div className="dashboard-section">
        <h2 className="section-title">Settings</h2>
        
        <div className="dashboard-card">
          <h3>Account Settings</h3>
          <p>Wallet: {account}</p>
          <div className="action-btns">
            <button className="dashboard-action-btn" onClick={onDisconnect}>
              Disconnect Wallet
            </button>
          </div>
        </div>
        
        <NotificationSystem />
      </div>
    );
  };

  // PRESERVE your exact renderContent function logic
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <EnhancedDashboardOverview data={dashboardData} account={account} />;
      case 'earnings':
        return <EarningsBreakdown data={dashboardData} account={account} />;
      case 'direct-referrals':
        return <DirectReferralsSection data={dashboardData} account={account} />;
      case 'level-bonus':
        return <LevelBonusSection data={dashboardData} account={account} />;
      case 'upline-bonus':
        return <UplineBonusSection data={dashboardData} account={account} />;
      case 'leader-pool':
        return <LeaderPoolSection data={dashboardData} account={account} />;
      case 'help-pool':
        return <HelpPoolSection data={dashboardData} account={account} />;
      case 'packages':
        return <PackagesSection data={dashboardData} account={account} />;
      case 'community-tiers':
        return <CommunityTiersSection data={dashboardData} account={account} />;
      case 'withdrawals':
        return <WithdrawalsSection data={dashboardData} account={account} />;
      case 'team-structure':
        return <TeamStructureSection account={account} />;
      case 'gamification':
        return <GamificationSection data={dashboardData} account={account} />;
      case 'reports':
        return <ReportsSection account={account} />;
      case 'ai-insights':
        return <AIInsightsSection data={dashboardData} account={account} />;
      case 'settings':
        return <SettingsSection account={account} onDisconnect={onDisconnect} />;
      default:
        return <EnhancedDashboardOverview data={dashboardData} account={account} />;
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your LeadFive dashboard...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className={`enhanced-dashboard-container ${isFullscreen ? 'fullscreen' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Enhanced Toolbar */}
        <div className="dashboard-toolbar">
          <div className="toolbar-left">
            <button 
              className="toolbar-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <FaExpand /> : <FaCompress />}
            </button>
            <button 
              className={`toolbar-btn ${liveMode ? 'active' : ''}`}
              onClick={() => setLiveMode(!liveMode)}
            >
              <FaRefresh />
              {liveMode ? 'Live' : 'Refresh'}
            </button>
          </div>
          
          <div className="toolbar-right">
            <button className="toolbar-btn">
              <FaEye />
              View Mode
            </button>
            <button className="toolbar-btn">
              <FaShare />
              Share
            </button>
            <button 
              className="toolbar-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
        </div>

        {/* PRESERVED: Your existing sidebar structure */}
        <div className="dashboard-sidebar">
          <div className="sidebar-header">
            <FaUserCircle className="user-avatar" />
            <div className="user-info">
              <h3>{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Guest'}</h3>
              <p>LeadFive Member</p>
              <span className="user-level">Level {dashboardData.currentLevel}</span>
            </div>
          </div>
          
          <div className="sidebar-menu">
            {menuItems.map(item => (
              <motion.button
                key={item.id}
                className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="menu-icon">
                  <item.icon />
                </div>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </motion.button>
            ))}
          </div>
        </div>

        {/* PRESERVED: Your existing main content structure */}
        <div className="dashboard-main">
          <div className="dashboard-header">
            <h1 className="dashboard-title">LeadFive Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome back to your financial freedom journey
            </p>
          </div>

          <ErrorBoundary>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </div>
      </div>

      {/* PRESERVED: Your existing AI Chatbot */}
      <UnifiedChatbot account={account} />
    </PageWrapper>
  );
}