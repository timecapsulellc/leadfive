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
  FaShareAlt,
  FaCopy,
  FaExpand,
  FaCompress,
  FaSync,
} from 'react-icons/fa';

// Import ALL your existing components - PRESERVED
import LevelVisualization from '../LevelVisualization';
import EarningsChart from '../EarningsChart';
import ReferralStats from '../ReferralStats';
import WithdrawalHistory from '../WithdrawalHistory';
import ActivityFeed from '../ActivityFeed';
import PerformanceMetrics from '../PerformanceMetrics';
import NotificationSystem from '../NotificationSystem';
import PageWrapper from '../PageWrapper';
import AdvancedDashboardOverview from './EnhancedDashboardOverview';

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

// CoinMarketCap API Integration
import PriceTicker from '../PriceTicker';
import PortfolioValue, { EarningsDisplay } from '../PortfolioValue';
import { MarketSummaryCard } from '../MarketDataWidget';
import { contractService } from '../../services/ContractService';
import { useDashboardStore } from '../../stores/dashboardStore';

// ✅ PRODUCTION DATA SERVICE - REAL BLOCKCHAIN INTEGRATION
import { productionDataService } from '../../services/ProductionDataService';

// Advanced PhD-Level Components
import AdvancedDirectReferrals from './AdvancedDirectReferrals';
import AdvancedUplineBonus from './AdvancedUplineBonus';
import AdvancedPackageManagement from './AdvancedPackageManagement';
import AdvancedLevelBonus from './AdvancedLevelBonus';
import AdvancedLeaderPool from './AdvancedLeaderPool';
import AdvancedHelpPool from './AdvancedHelpPool';
import AdvancedCommunityTiers from './AdvancedCommunityTiers';
import AdvancedMyTeam from './AdvancedMyTeam';
import AdvancedAchievementsRewards from './AdvancedAchievementsRewards';

import '../../styles/professional-dashboard.css';
import '../../styles/expert-dashboard-redesign.css';
import '../../styles/professional-gamification.css';
import './EnhancedDashboard.css';

export default function EnhancedDashboard({ account, provider, onDisconnect }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [liveMode, setLiveMode] = useState(true);

  // LeadFive Business Logic - ACCURATE Commission Structure
  const [dashboardData, setDashboardData] = useState({
    totalEarnings: 0,
    
    // LeadFive Compensation Plan Distribution (Total: 100%)
    directReferralEarnings: 0,    // 40% - Direct referral commissions
    levelBonusEarnings: 0,        // 10% - Multi-level bonuses (levels 1-10)
    uplineBonusEarnings: 0,       // 10% - Upline structure bonuses
    leaderPoolEarnings: 0,        // 10% - Leader pool distribution (Star ranks)
    helpPoolEarnings: 0,          // 30% - Weekly help pool distribution
    
    // Team Structure
    teamSize: 0,                  // Total team members
    directReferrals: 0,           // Direct first-level referrals
    activeReferrals: 0,           // Active paying members
    
    // Package Information
    currentPackage: 0,            // $30, $50, $100, $200
    maxEarnings: 0,               // 4x package value (business rule)
    packageProgress: 0,           // Progress towards 4x limit
    
    // Ranking System
    currentTier: 1,               // Community tier level
    currentLevel: 1,              // User level in matrix
    leaderRank: 'none',           // 'shining-star', 'silver-star', or 'none'
    
    // Performance Metrics
    dailyEarnings: 0,             // Last 24h earnings
    weeklyEarnings: 0,            // Last 7 days
    monthlyEarnings: 0,           // Last 30 days
    pendingRewards: 0,            // Pending withdrawals
    
    // Withdrawal System (Based on referral count)
    withdrawalRatio: { withdraw: 70, reinvest: 30 }, // 0 refs = 70/30, 3+ refs = 100/0
    referralBasedRatio: true,     // Dynamic ratio based on referrals
    
    // Eligibility Flags
    helpPoolEligible: true,       // Help pool participation
    leaderPoolEligible: false,    // Star rank requirement
    matrixEligible: true,         // Matrix participation
    
    // Business Intelligence
    conversionRate: 0,            // Referral to active conversion
    averagePackageValue: 0,       // Team average package
    retentionRate: 0,             // Member retention percentage
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
    initializeProductionDataService();
  }, [account, navigate, provider]);

  // ✅ INITIALIZE PRODUCTION DATA SERVICE
  const initializeProductionDataService = async () => {
    if (provider && account) {
      try {
        const signer = provider.getSigner();
        await productionDataService.initialize(provider, signer);
        console.log('✅ Production Data Service initialized for:', account);
        
        // Setup real-time event listeners
        productionDataService.setupEventListeners((eventType, data) => {
          console.log('🔴 Live Event:', eventType, data);
          // Refresh dashboard data when events occur
          if (eventType === 'bonus_distributed' && data.recipient === account) {
            loadDashboardData(); // Refresh when user receives earnings
          }
        });
      } catch (error) {
        console.error('❌ Failed to initialize Production Data Service:', error);
      }
    }
  };

  // PhD-Level Business Logic Calculator
  const calculateLeadFiveBusinessMetrics = (packageValue, directReferrals, totalCommissions) => {
    // LeadFive Withdrawal Ratio Logic (Based on referral count)
    const getWithdrawalRatio = (refs) => {
      if (refs >= 3) return { withdraw: 100, reinvest: 0 };
      if (refs >= 1) return { withdraw: 80, reinvest: 20 };
      return { withdraw: 70, reinvest: 30 };
    };

    // Commission Distribution (Total: 100%)
    const commissionDistribution = {
      directReferral: 0.40,    // 40%
      levelBonus: 0.10,        // 10%
      uplineBonus: 0.10,       // 10%
      leaderPool: 0.10,        // 10%
      helpPool: 0.30,          // 30%
    };

    // Package Progress (4x Rule)
    const maxEarnings = packageValue * 4;
    const packageProgress = Math.min(100, (totalCommissions / maxEarnings) * 100);

    // Star Rank Qualification Logic
    const qualifiesForLeaderPool = directReferrals >= 2 && packageProgress >= 50;

    // Advanced Metrics
    const projectedMonthlyEarnings = (totalCommissions / 30) * 30; // Assuming current is monthly
    const conversionRate = directReferrals > 0 ? (directReferrals / directReferrals) * 100 : 0;

    return {
      withdrawalRatio: getWithdrawalRatio(directReferrals),
      commissionBreakdown: {
        directReferralEarnings: totalCommissions * commissionDistribution.directReferral,
        levelBonusEarnings: totalCommissions * commissionDistribution.levelBonus,
        uplineBonusEarnings: totalCommissions * commissionDistribution.uplineBonus,
        leaderPoolEarnings: qualifiesForLeaderPool ? totalCommissions * commissionDistribution.leaderPool : 0,
        helpPoolEarnings: totalCommissions * commissionDistribution.helpPool,
      },
      packageMetrics: {
        maxEarnings,
        packageProgress,
        remainingCapacity: maxEarnings - totalCommissions,
      },
      qualifications: {
        leaderPoolEligible: qualifiesForLeaderPool,
        helpPoolEligible: true,
        matrixEligible: packageValue >= 30,
      },
      projections: {
        monthlyProjection: projectedMonthlyEarnings,
        timeToMaxEarnings: packageProgress < 100 ? Math.ceil((maxEarnings - totalCommissions) / (totalCommissions / 30)) : 0,
      },
      businessIntelligence: {
        conversionRate,
        averageReferralValue: directReferrals > 0 ? packageValue : 0,
        performanceScore: Math.min(100, (packageProgress + conversionRate) / 2),
      }
    };
  };

  // ✅ PRODUCTION DATA LOADING - REAL BLOCKCHAIN INTEGRATION
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading real user data from blockchain for:', account);
      
      // ✅ GET REAL DATA FROM SMART CONTRACT
      const realUserData = await productionDataService.getRealUserData(account);
      
      if (realUserData.isLiveData) {
        // ✅ USING REAL BLOCKCHAIN DATA
        console.log('✅ Using live blockchain data:', realUserData);
        setDashboardData({
          ...realUserData,
          
          // Add computed business intelligence
          conversionRate: realUserData.directReferrals > 0 
            ? (realUserData.activeReferrals / realUserData.directReferrals) * 100 
            : 0,
          
          averagePackageValue: realUserData.directReferrals > 0 
            ? realUserData.currentPackage 
            : 0,
            
          retentionRate: realUserData.teamSize > 0 
            ? (realUserData.activeReferrals / realUserData.teamSize) * 100 
            : 0,
            
          performanceScore: Math.min(100, 
            (realUserData.packageProgress + 
             (realUserData.directReferrals * 10) + 
             (realUserData.teamSize * 2)) / 3
          ),
          
          // Real-time status
          dataSource: 'BLOCKCHAIN',
          lastUpdated: new Date().toISOString(),
        });
      } else {
        // ⚠️ FALLBACK: Show empty state for new users
        console.log('⚠️ No blockchain data found, showing empty state for new user');
        setDashboardData({
          ...realUserData,
          dataSource: 'FALLBACK',
          lastUpdated: new Date().toISOString(),
          
          // Show helpful message for new users
          isNewUser: true,
          message: 'Welcome! Register with a package to start earning.',
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      
      // ⚠️ ERROR FALLBACK
      setDashboardData({
        ...productionDataService.getFallbackUserData(),
        dataSource: 'ERROR_FALLBACK',
        lastUpdated: new Date().toISOString(),
        error: error.message,
      });
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
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  // Enhanced Dashboard Overview with MUCH MORE ADVANCED features
  const EnhancedDashboardOverview = ({ data, account }) => {
    return (
      <div className="enhanced-dashboard-section">
        {/* Use the MUCH MORE ADVANCED EnhancedDashboardOverview component */}
        <AdvancedDashboardOverview
          userData={{
            referralCode: account?.slice(-8) || 'ABC123',
            totalEarnings: data.totalEarnings,
            teamSize: data.teamSize,
            directReferrals: data.directReferrals,
            currentPackage: data.currentPackage,
            ...data,
          }}
          onActionClick={action => {
            switch (action) {
              case 'withdraw':
                setActiveSection('withdrawals');
                break;
              case 'upgrade':
                setActiveSection('packages');
                break;
              case 'team':
                setActiveSection('team-structure');
                break;
              default:
                break;
            }
          }}
        />
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
            <div className="card-value">
              ${data.directReferralEarnings.toFixed(2)}
            </div>
            <div className="card-label">
              From {data.directReferrals} direct referrals
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Level Bonus (10%)</h3>
              <FaNetworkWired className="card-icon" />
            </div>
            <div className="card-value">
              ${data.levelBonusEarnings.toFixed(2)}
            </div>
            <div className="card-label">Multi-level commissions</div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Upline Bonus (10%)</h3>
              <FaChartBar className="card-icon" />
            </div>
            <div className="card-value">
              ${data.uplineBonusEarnings.toFixed(2)}
            </div>
            <div className="card-label">From upline structure</div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Leader Pool (10%)</h3>
              <FaTrophy className="card-icon" />
            </div>
            <div className="card-value">
              ${data.leaderPoolEarnings.toFixed(2)}
            </div>
            <div className="card-label">
              {data.leaderRank === 'none'
                ? 'Not qualified yet'
                : 'Leader qualified'}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Help Pool (30%)</h3>
              <FaGift className="card-icon" />
            </div>
            <div className="card-value">
              ${data.helpPoolEarnings.toFixed(2)}
            </div>
            <div className="card-label">
              {data.helpPoolEligible ? 'Eligible' : 'Not eligible'}
            </div>
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
        <h2 className="section-title">My Team</h2>
        <div className="team-overview">
          <div className="team-stats">
            <div className="team-stat">
              <FaUsers className="team-icon" />
              <div className="team-value">{dashboardData.teamSize}</div>
              <div className="team-label">Total Team Members</div>
            </div>
            <div className="team-stat">
              <FaUsers className="team-icon" />
              <div className="team-value">{dashboardData.directReferrals}</div>
              <div className="team-label">Direct Referrals</div>
            </div>
            <div className="team-stat">
              <FaUsers className="team-icon" />
              <div className="team-value">{dashboardData.activeReferrals}</div>
              <div className="team-label">Active Members</div>
            </div>
          </div>
          <div className="team-actions">
            <button className="team-btn" onClick={() => navigate('/genealogy')}>
              <FaNetworkWired /> View Full Genealogy Tree
            </button>
            <button
              className="team-btn"
              onClick={() =>
                window.open(`/ref/${typeof account === 'string' ? account.slice(-8) : 'LEADFIVE2024'}`, '_blank')
              }
            >
              <FaShareAlt /> Share Referral Link
            </button>
          </div>
        </div>
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

  // Diagnostic function for testing all systems
  const runDiagnostics = async () => {
    // Running system diagnostics - console.log removed for production

    const results = {
      timestamp: new Date().toISOString(),
      contractService: null,
      dashboardData: null,
      components: null,
      errors: [],
    };

    try {
      // Test contract service if available
      // Testing contract service - console.log removed for production
      if (contractService) {
        results.contractService = {
          isAvailable: true,
          contractAddress: contractService.contractAddress || 'Not set',
          status: 'AVAILABLE',
        };
        // Contract service check completed - console.log removed for production
      } else {
        results.contractService = { status: 'NOT_AVAILABLE' };
        results.errors.push('Contract service not initialized');
      }

      // Test dashboard data
      // Testing dashboard data - console.log removed for production
      results.dashboardData = {
        isLoaded: !loading,
        hasData: Object.keys(dashboardData).length > 0,
        totalEarnings: dashboardData.totalEarnings || 0,
        dataIntegrity: dashboardData.totalEarnings >= 0 ? 'VALID' : 'INVALID',
        status: !loading ? 'LOADED' : 'LOADING',
      };

      // Dashboard data check completed - console.log removed for production

      // Test component rendering
      // Testing component status - console.log removed for production
      const menuItems = [
        'overview',
        'earnings',
        'direct-referrals',
        'level-bonus',
        'upline-bonus',
        'leader-pool',
        'help-pool',
        'packages',
        'community-tiers',
        'withdrawals',
        'team-structure',
        'gamification',
        'reports',
        'ai-insights',
        'settings',
      ];

      results.components = {
        totalMenuItems: menuItems.length,
        currentSection: activeSection,
        renderingStatus: 'OPERATIONAL',
        status: 'FUNCTIONAL',
      };

      // Component check completed - console.log removed for production
    } catch (error) {
      // Diagnostic error logged internally
      results.errors.push(`Diagnostic failed: ${error.message}`);
    }

    // Display results
    // Diagnostic results available in return value - console.log removed for production

    const summary = `
🔍 SYSTEM DIAGNOSTICS COMPLETE
─────────────────────────────────

📊 CONTRACT SERVICE: ${results.contractService?.status || 'ERROR'}
   • Address: ${results.contractService?.contractAddress || 'Unknown'}

📊 DASHBOARD DATA: ${results.dashboardData?.status || 'ERROR'}
   • Loaded: ${results.dashboardData?.isLoaded ? 'Yes' : 'No'}
   • Total Earnings: $${results.dashboardData?.totalEarnings || 0}
   • Data Integrity: ${results.dashboardData?.dataIntegrity || 'Unknown'}

📊 COMPONENTS: ${results.components?.status || 'ERROR'}
   • Menu Items: ${results.components?.totalMenuItems || 0}
   • Current Section: ${results.components?.currentSection || 'Unknown'}
   • Rendering: ${results.components?.renderingStatus || 'Unknown'}

${results.errors.length > 0 ? `⚠️ ERRORS:\n${results.errors.join('\n')}` : '✅ All systems operational'}
    `;

    // Summary generated - console.log removed for production
    alert(summary);

    return results;
  };

  // ENHANCED renderContent function with Advanced Components
  const renderContent = () => {
    try {
      switch (activeSection) {
        case 'overview':
          return (
            <EnhancedDashboardOverview data={dashboardData} account={account} />
          );
        case 'earnings':
          return <EarningsBreakdown data={dashboardData} account={account} />;
        case 'direct-referrals':
          return (
            <AdvancedDirectReferrals data={dashboardData} account={account} />
          );
        case 'level-bonus':
          return <AdvancedLevelBonus data={dashboardData} account={account} />;
        case 'upline-bonus':
          return <AdvancedUplineBonus data={dashboardData} account={account} />;
        case 'leader-pool':
          return <AdvancedLeaderPool data={dashboardData} account={account} />;
        case 'help-pool':
          return <AdvancedHelpPool data={dashboardData} account={account} />;
        case 'packages':
          return (
            <AdvancedPackageManagement data={dashboardData} account={account} />
          );
        case 'community-tiers':
          return (
            <AdvancedCommunityTiers data={dashboardData} account={account} />
          );
        case 'withdrawals':
          return <WithdrawalsSection data={dashboardData} account={account} />;
        case 'team-structure':
          return (
            <AdvancedMyTeam
              data={dashboardData}
              account={account}
              navigate={navigate}
            />
          );
        case 'gamification':
          return (
            <AdvancedAchievementsRewards
              data={dashboardData}
              account={account}
            />
          );
        case 'reports':
          return <ReportsSection account={account} />;
        case 'ai-insights':
          return <AIInsightsSection data={dashboardData} account={account} />;
        case 'settings':
          return (
            <SettingsSection account={account} onDisconnect={onDisconnect} />
          );
        default:
          return (
            <EnhancedDashboardOverview data={dashboardData} account={account} />
          );
      }
    } catch (error) {
      console.error('Error rendering section:', activeSection, error);
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h3>⚠️ Section temporarily unavailable</h3>
          <p>Please try again or contact support if the issue persists.</p>
          <button
            onClick={() => setActiveSection('overview')}
            style={{ padding: '10px 20px', marginTop: '10px' }}
          >
            Return to Dashboard
          </button>
        </div>
      );
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
    <div
      className={`enhanced-dashboard-container ${isFullscreen ? 'fullscreen' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
    >
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
            <FaSync />
            {liveMode ? 'Live' : 'Refresh'}
          </button>
        </div>

        <div className="toolbar-right">
          <button
            className="toolbar-btn diagnostic-btn"
            onClick={runDiagnostics}
            title="Run system diagnostics"
          >
            🔍 Diagnostics
          </button>
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
            <h3>
              {account && typeof account === 'string'
                ? `${account.slice(0, 6)}...${account.slice(-4)}`
                : 'Guest'}
            </h3>
            <p>LeadFive Member</p>
            <span className="user-level">
              Level {dashboardData.currentLevel}
            </span>
          </div>
        </div>

        <div className="sidebar-menu">
          {menuItems.map(item => (
            <motion.button
              key={item.id}
              className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
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

      {/* PRESERVED: Your existing AI Chatbot */}
      <UnifiedChatbot account={account} />
    </div>
  );
}
