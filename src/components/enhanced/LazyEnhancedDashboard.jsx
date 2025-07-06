import React, { useState, useEffect, lazy, Suspense } from 'react';
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
  FaShareAlt,
  FaCopy,
  FaExpand,
  FaCompress,
  FaSync,
} from 'react-icons/fa';

// Core components that should load immediately
import PageWrapper from '../PageWrapper';
import ErrorBoundary from '../ErrorBoundary';
import MobileNavigation from '../MobileNavigation';
import PriceTicker from '../PriceTicker';
import { LoadingSpinner } from '../LazyLoader';

// Production data service
import { productionDataService } from '../../services/ProductionDataService';
import { contractService } from '../../services/ContractService';
import { useDashboardStore } from '../../stores/dashboardStore';

// Lazy load heavy components
const AdvancedDashboardOverview = lazy(() => import('./EnhancedDashboardOverview'));
const LevelVisualization = lazy(() => import('../LevelVisualization'));
const EarningsChart = lazy(() => import('../EarningsChart'));
const ReferralStats = lazy(() => import('../ReferralStats'));
const WithdrawalHistory = lazy(() => import('../WithdrawalHistory'));
const ActivityFeed = lazy(() => import('../ActivityFeed'));
const PerformanceMetrics = lazy(() => import('../PerformanceMetrics'));
const NotificationSystem = lazy(() => import('../NotificationSystem'));

// AI Components - lazy loaded
const AICoachingPanel = lazy(() => import('../AICoachingPanel'));
const AIEarningsPrediction = lazy(() => import('../AIEarningsPrediction'));
const AITransactionHelper = lazy(() => import('../AITransactionHelper'));
const AIMarketInsights = lazy(() => import('../AIMarketInsights'));
const AISuccessStories = lazy(() => import('../AISuccessStories'));
const AIEmotionTracker = lazy(() => import('../AIEmotionTracker'));
const UnifiedChatbot = lazy(() => import('../UnifiedChatbot'));
const GamificationSystem = lazy(() => import('../GamificationSystem'));

// Enhanced components - lazy loaded
const EnhancedKPICards = lazy(() => import('./EnhancedKPICards'));
const LiveNotifications = lazy(() => import('./LiveNotifications'));
const QuickActionsPanel = lazy(() => import('./QuickActionsPanel'));
const PortfolioValue = lazy(() => import('../PortfolioValue'));
const MarketSummaryCard = lazy(() => 
  import('../MarketDataWidget').then(module => ({ default: module.MarketSummaryCard }))
);
const EarningsDisplay = lazy(() => 
  import('../PortfolioValue').then(module => ({ default: module.EarningsDisplay }))
);

// Advanced components - lazy loaded on demand
const AdvancedDirectReferrals = lazy(() => import('./AdvancedDirectReferrals'));
const AdvancedUplineBonus = lazy(() => import('./AdvancedUplineBonus'));
const AdvancedPackageManagement = lazy(() => import('./AdvancedPackageManagement'));
const AdvancedLevelBonus = lazy(() => import('./AdvancedLevelBonus'));
const AdvancedLeaderPool = lazy(() => import('./AdvancedLeaderPool'));
const AdvancedHelpPool = lazy(() => import('./AdvancedHelpPool'));
const AdvancedCommunityTiers = lazy(() => import('./AdvancedCommunityTiers'));
const AdvancedMyTeam = lazy(() => import('./AdvancedMyTeam'));
const AdvancedAchievementsRewards = lazy(() => import('./AdvancedAchievementsRewards'));

// Styles - only import critical ones
import '../../styles/brandColors.css';
import './EnhancedDashboard.css';

// Component map for dynamic rendering
const componentMap = {
  overview: AdvancedDashboardOverview,
  earnings: EarningsChart,
  referrals: ReferralStats,
  withdrawals: WithdrawalHistory,
  activity: ActivityFeed,
  performance: PerformanceMetrics,
  directReferrals: AdvancedDirectReferrals,
  uplineBonus: AdvancedUplineBonus,
  packageManagement: AdvancedPackageManagement,
  levelBonus: AdvancedLevelBonus,
  leaderPool: AdvancedLeaderPool,
  helpPool: AdvancedHelpPool,
  communityTiers: AdvancedCommunityTiers,
  myTeam: AdvancedMyTeam,
  achievements: AdvancedAchievementsRewards,
  aiCoaching: AICoachingPanel,
  aiPrediction: AIEarningsPrediction,
  aiTransaction: AITransactionHelper,
  aiInsights: AIMarketInsights,
  aiSuccess: AISuccessStories,
  aiEmotion: AIEmotionTracker,
  gamification: GamificationSystem,
};

// Section loader with suspense
const SectionLoader = ({ section, ...props }) => {
  const Component = componentMap[section] || componentMap.overview;
  
  return (
    <Suspense fallback={
      <div className="section-loading">
        <LoadingSpinner />
        <p>Loading {section}...</p>
      </div>
    }>
      <Component {...props} />
    </Suspense>
  );
};

export default function LazyEnhancedDashboard({ account, provider, onDisconnect }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalEarnings: 0,
    directReferralEarnings: 0,
    levelBonusEarnings: 0,
    uplineBonusEarnings: 0,
    leaderPoolEarnings: 0,
    helpPoolEarnings: 0,
    teamSize: 0,
    directReferrals: 0,
    activeReferrals: 0,
    currentPackage: 0,
    maxEarnings: 0,
    packageProgress: 0,
    currentTier: 1,
    currentLevel: 1,
    leaderRank: 'none',
    dailyEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    pendingRewards: 0,
    withdrawalRatio: { withdraw: 70, reinvest: 30 },
    referralBasedRatio: true,
    helpPoolEligible: true,
    leaderPoolEligible: false,
    matrixEligible: true,
    conversionRate: 0,
    averagePackageValue: 0,
    retentionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState(null);

  // Preload adjacent sections on hover
  const preloadSection = (section) => {
    if (componentMap[section] && typeof componentMap[section].preload === 'function') {
      componentMap[section].preload();
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!account || !provider) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const data = await productionDataService.getDashboardData(account);
        if (data) {
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [account, provider, navigate]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const sectionMenu = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'earnings', label: 'Earnings', icon: FaDollarSign },
    { id: 'referrals', label: 'Referrals', icon: FaUsers },
    { id: 'directReferrals', label: 'Direct Referrals', icon: FaShareAlt },
    { id: 'myTeam', label: 'My Team', icon: FaNetworkWired },
    { id: 'packageManagement', label: 'Packages', icon: FaGift },
    { id: 'withdrawals', label: 'Withdrawals', icon: FaWallet },
    { id: 'helpPool', label: 'Help Pool', icon: FaRocket },
    { id: 'leaderPool', label: 'Leader Pool', icon: FaTrophy },
    { id: 'communityTiers', label: 'Community Tiers', icon: FaChartBar },
    { id: 'achievements', label: 'Achievements', icon: FaCheckCircle },
    { id: 'aiCoaching', label: 'AI Coaching', icon: FaRobot },
    { id: 'performance', label: 'Performance', icon: FaChartLine },
  ];

  return (
    <ErrorBoundary>
      <PageWrapper className={`enhanced-dashboard-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className={`enhanced-dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {/* Sidebar Navigation */}
          <aside className="dashboard-sidebar">
            <div className="sidebar-header">
              <h3>LeadFive</h3>
              <button
                className="sidebar-toggle"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <FaExpand /> : <FaCompress />}
              </button>
            </div>
            
            <nav className="sidebar-nav">
              {sectionMenu.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                  onMouseEnter={() => preloadSection(item.id)}
                >
                  <item.icon />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="dashboard-main">
            {/* Header */}
            <header className="dashboard-header">
              <div className="header-left">
                <h2>{sectionMenu.find(s => s.id === activeSection)?.label || 'Dashboard'}</h2>
                <PriceTicker />
              </div>
              
              <div className="header-right">
                <button onClick={toggleFullscreen} className="fullscreen-btn">
                  {isFullscreen ? <FaCompress /> : <FaExpand />}
                </button>
                <button onClick={() => setLiveMode(!liveMode)} className="live-mode-btn">
                  {liveMode ? <FaSync className="spinning" /> : <FaSync />}
                  {liveMode ? 'Live' : 'Paused'}
                </button>
                <Suspense fallback={null}>
                  <NotificationSystem />
                </Suspense>
              </div>
            </header>

            {/* Dynamic Section Content */}
            <div className="dashboard-content">
              {loading ? (
                <div className="loading-container">
                  <LoadingSpinner />
                  <p>Loading dashboard data...</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SectionLoader
                      section={activeSection}
                      account={account}
                      provider={provider}
                      dashboardData={dashboardData}
                      liveMode={liveMode}
                      aiInsights={aiInsights}
                    />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </main>

          {/* Mobile Navigation */}
          <MobileNavigation />
          
          {/* AI Chatbot - Lazy loaded */}
          <Suspense fallback={null}>
            <UnifiedChatbot 
              account={account}
              userContext={{
                earnings: dashboardData.totalEarnings,
                teamSize: dashboardData.teamSize,
                packageLevel: dashboardData.currentPackage,
              }}
            />
          </Suspense>
        </div>
      </PageWrapper>
    </ErrorBoundary>
  );
}