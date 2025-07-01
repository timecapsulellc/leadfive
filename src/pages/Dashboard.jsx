import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaGamepad // Add gamification icon
} from 'react-icons/fa';
import LevelVisualization from '../components/LevelVisualization';
import NetworkTreeVisualization from '../components/NetworkTreeVisualization';
import EarningsChart from '../components/EarningsChart';
import ReferralStats from '../components/ReferralStats';
import WithdrawalHistory from '../components/WithdrawalHistory';
import ActivityFeed from '../components/ActivityFeed';
import PerformanceMetrics from '../components/PerformanceMetrics';
import NotificationSystem from '../components/NotificationSystem';
import PageWrapper from '../components/PageWrapper';
// AI Components
import AICoachingPanel from '../components/AICoachingPanel';
import AIEarningsPrediction from '../components/AIEarningsPrediction';
import AITransactionHelper from '../components/AITransactionHelper';
import AIMarketInsights from '../components/AIMarketInsights';
import AISuccessStories from '../components/AISuccessStories';
import AIEmotionTracker from '../components/AIEmotionTracker';
import ErrorBoundary from '../components/ErrorBoundary';
import MobileNavigation from '../components/MobileNavigation';
import UnifiedChatbot from '../components/UnifiedChatbot';
// Gamification System
import GamificationSystem from '../components/GamificationSystem';
// AI Services
import { elevenLabsService } from '../services/ElevenLabsOnlyService';
import './Dashboard.css';
import '../styles/dashboard-alignment-fixes.css';
import '../styles/mobile-first-optimization.css';
import '../styles/expert-dashboard-redesign.css';
import '../styles/voice-assistant.css';
import '../styles/dashboard-layout-fix.css';
import '../styles/lead-five-dashboard-sections.css';

export default function Dashboard({ account, provider, onDisconnect }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
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
  
  // AI Integration State
  const [aiInsights, setAiInsights] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);
  const [audioNative, setAudioNative] = useState(null);

  // Debug AI component imports
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 Dashboard AI Component Status:');
    console.log('AICoachingPanel:', typeof AICoachingPanel, AICoachingPanel);
    console.log('AIEarningsPrediction:', typeof AIEarningsPrediction, AIEarningsPrediction);
    console.log('AITransactionHelper:', typeof AITransactionHelper, AITransactionHelper);
    console.log('AIMarketInsights:', typeof AIMarketInsights, AIMarketInsights);
    console.log('AISuccessStories:', typeof AISuccessStories, AISuccessStories);
    console.log('AIEmotionTracker:', typeof AIEmotionTracker, AIEmotionTracker);
  }

  useEffect(() => {
    if (!account) {
      navigate('/');
      return;
    }
    loadDashboardData();
  }, [account, navigate]);


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

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview data={dashboardData} account={account} />;
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
        return <DashboardOverview data={dashboardData} account={account} />;
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading Dashboard...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="dashboard-container">
        <div className="dashboard-sidebar">
          <div className="sidebar-header">
            <FaUserCircle className="user-avatar" />
            <div className="user-info">
              <h3>Welcome to Lead Five!</h3>
              <p>{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'User'}</p>
              <span className="user-tier">Tier {dashboardData.currentTier}</span>
              <span className="user-package">${dashboardData.currentPackage} Package</span>
            </div>
          </div>

          <nav className="sidebar-menu">
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon className="menu-icon" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="earnings-cap-tracker">
              <FaShieldAlt className="cap-icon" />
              <div>
                <p>4X Earnings Cap</p>
                <div className="cap-progress-bar">
                  <div 
                    className="cap-progress" 
                    style={{ width: `${(dashboardData.totalEarnings / dashboardData.maxEarnings) * 100}%` }}
                  ></div>
                </div>
                <span>${dashboardData.totalEarnings} / ${dashboardData.maxEarnings}</span>
              </div>
            </div>
            <div className="bsc-badge">
              <span>🔗 Powered by Binance Smart Chain</span>
            </div>
          </div>
        </div>

        <div className="dashboard-main">
          <div className="dashboard-header">
            <h1>{menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}</h1>
            <div className="header-actions">
              <NotificationSystem account={account} provider={provider} />
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/packages')}
              >
                <FaRocket />
                Upgrade Package
              </button>
            </div>
          </div>

          <div className="dashboard-content">
            {renderContent()}
          </div>
        </div>

        {/* AIRA Unified Chatbot - Main AI Chat Interface */}
        <ErrorBoundary>
          <UnifiedChatbot 
            userStats={{
              earnings: dashboardData.totalEarnings,
              teamSize: dashboardData.teamSize,
              currentLevel: dashboardData.currentLevel,
              dailyEarnings: dashboardData.dailyEarnings
            }}
            account={account}
            userInfo={{
              directCount: dashboardData.directReferrals,
              teamSize: dashboardData.teamSize,
              tier: dashboardData.currentTier,
              package: dashboardData.currentPackage
            }}
          />
        </ErrorBoundary>

      </div>
    </PageWrapper>
  );
}

// Earnings Breakdown Component
function EarningsBreakdown({ data, account }) {
  const earningsBreakdown = [
    { label: 'Direct Referrals (40%)', amount: data.directReferralEarnings, color: '#FF6B35' },
    { label: 'Level Bonus (10%)', amount: data.levelBonusEarnings, color: '#4ECDC4' },
    { label: 'Upline Bonus (10%)', amount: data.uplineBonusEarnings, color: '#45B7D1' },
    { label: 'Leader Pool (10%)', amount: data.leaderPoolEarnings, color: '#FFA726' },
    { label: 'Help Pool (30%)', amount: data.helpPoolEarnings, color: '#66BB6A' }
  ];

  return (
    <div className="earnings-breakdown">
      <div className="earnings-overview">
        <div className="total-earnings-card">
          <h2>Total Earnings</h2>
          <h1>${data.totalEarnings.toFixed(2)}</h1>
          <div className="earnings-cap">
            <span>Cap Progress: ${data.totalEarnings} / ${data.maxEarnings}</span>
            <div className="cap-bar">
              <div 
                className="cap-fill"
                style={{ width: `${(data.totalEarnings / data.maxEarnings) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="earnings-distribution">
        <h3>Earnings Distribution</h3>
        <div className="earnings-grid">
          {earningsBreakdown.map((item, index) => (
            <div key={index} className="earnings-item" style={{ borderLeft: `4px solid ${item.color}` }}>
              <h4>{item.label}</h4>
              <p>${item.amount.toFixed(2)}</p>
              <span>{((item.amount / data.totalEarnings) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="earnings-chart">
        <h3>Monthly Earnings Trend</h3>
        <EarningsChart data={earningsBreakdown} />
      </div>
    </div>
  );
}

// Direct Referrals Section
function DirectReferralsSection({ data, account }) {
  const referralStats = {
    totalReferrals: data.directReferrals,
    activeReferrals: Math.floor(data.directReferrals * 0.8),
    earningsFromReferrals: data.directReferralEarnings,
    referralCommission: 40 // 40% commission
  };

  return (
    <div className="direct-referrals-section">
      <div className="referrals-stats">
        <div className="stat-card">
          <FaUsers className="stat-icon" />
          <h3>{referralStats.totalReferrals}</h3>
          <p>Total Direct Referrals</p>
        </div>
        <div className="stat-card">
          <FaCheckCircle className="stat-icon" />
          <h3>{referralStats.activeReferrals}</h3>
          <p>Active Referrals</p>
        </div>
        <div className="stat-card">
          <FaDollarSign className="stat-icon" />
          <h3>${referralStats.earningsFromReferrals.toFixed(2)}</h3>
          <p>Referral Earnings (40%)</p>
        </div>
      </div>

      <div className="referral-program-info">
        <h3>Direct Referral Program</h3>
        <div className="program-details">
          <div className="detail-item">
            <strong>Commission Rate:</strong> 40% of package value
          </div>
          <div className="detail-item">
            <strong>Package Values:</strong> $30, $50, $100, $200
          </div>
          <div className="detail-item">
            <strong>Your Referral Link:</strong>
            <div className="referral-link">
              <input 
                type="text" 
                value={`https://leadfive.com/ref/${account && typeof account === 'string' ? account.slice(0, 8) : 'guest'}`}
                readOnly 
              />
              <button className="copy-btn">Copy</button>
            </div>
          </div>
        </div>
      </div>

      <div className="referral-list">
        <h3>Your Direct Referrals</h3>
        <ReferralStats account={account} />
      </div>
    </div>
  );
}

// Level Bonus Section
function LevelBonusSection({ data, account }) {
  const levelStructure = [
    { level: 1, percentage: 3, earnings: data.levelBonusEarnings * 0.3 },
    { level: 2, percentage: 2, earnings: data.levelBonusEarnings * 0.2 },
    { level: 3, percentage: 2, earnings: data.levelBonusEarnings * 0.2 },
    { level: 4, percentage: 1.5, earnings: data.levelBonusEarnings * 0.15 },
    { level: 5, percentage: 1.5, earnings: data.levelBonusEarnings * 0.15 }
  ];

  return (
    <div className="level-bonus-section">
      <div className="level-bonus-overview">
        <h3>Level Bonus Structure (10% Total)</h3>
        <p>Earn from your team's success across 5 levels deep</p>
      </div>

      <div className="level-structure">
        {levelStructure.map((level, index) => (
          <div key={index} className="level-item">
            <div className="level-number">Level {level.level}</div>
            <div className="level-percentage">{level.percentage}%</div>
            <div className="level-earnings">${level.earnings.toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="level-visualization">
        <h3>Your Network Levels</h3>
        <LevelVisualization />
      </div>

      <div className="level-requirements">
        <h3>Level Bonus Requirements</h3>
        <ul>
          <li>Must have an active package to earn level bonuses</li>
          <li>Bonuses are distributed from each level's new package purchases</li>
          <li>5-level deep compensation plan</li>
          <li>Weekly payouts on Fridays</li>
        </ul>
      </div>
    </div>
  );
}

// Upline Bonus Section
function UplineBonusSection({ data, account }) {
  return (
    <div className="upline-bonus-section">
      <div className="upline-overview">
        <h3>Upline Bonus (10%)</h3>
        <p>Receive bonuses from your upline's network growth</p>
        <div className="upline-earnings">
          <h2>${data.uplineBonusEarnings.toFixed(2)}</h2>
          <span>Total Upline Bonus Earned</span>
        </div>
      </div>

      <div className="upline-structure">
        <h3>How Upline Bonuses Work</h3>
        <div className="upline-explanation">
          <div className="explanation-item">
            <FaNetworkWired className="icon" />
            <div>
              <h4>Shared Success</h4>
              <p>When your upline grows their network, you benefit from the expansion</p>
            </div>
          </div>
          <div className="explanation-item">
            <FaChartLine className="icon" />
            <div>
              <h4>Passive Income</h4>
              <p>Earn automatically as your upline's team grows and succeeds</p>
            </div>
          </div>
          <div className="explanation-item">
            <FaDollarSign className="icon" />
            <div>
              <h4>10% Distribution</h4>
              <p>10% of the total compensation pool is distributed to upline bonuses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="upline-activity">
        <h3>Recent Upline Activity</h3>
        <ActivityFeed account={account} />
      </div>
    </div>
  );
}

// Leader Pool Section
function LeaderPoolSection({ data, account }) {
  const isQualified = data.leaderRank !== 'none';
  const qualificationRequirements = {
    'shining-star': { directReferrals: 5, teamSize: 25, monthlyVolume: 1000 },
    'silver-star': { directReferrals: 10, teamSize: 100, monthlyVolume: 5000 }
  };

  return (
    <div className="leader-pool-section">
      <div className="leader-status">
        <div className={`status-card ${isQualified ? 'qualified' : 'not-qualified'}`}>
          <FaTrophy className="trophy-icon" />
          <h3>Leader Pool Status</h3>
          <p className="status">{isQualified ? `${data.leaderRank} Leader` : 'Not Qualified'}</p>
          <div className="earnings">
            <h2>${data.leaderPoolEarnings.toFixed(2)}</h2>
            <span>Leader Pool Earnings</span>
          </div>
        </div>
      </div>

      <div className="qualification-progress">
        <h3>Qualification Requirements</h3>
        <div className="requirements-grid">
          <div className="requirement-item">
            <h4>Shining Star Leader</h4>
            <ul>
              <li>5+ Direct Referrals ({data.directReferrals}/5)</li>
              <li>25+ Team Members ({data.teamSize}/25)</li>
              <li>$1,000 Monthly Volume</li>
            </ul>
          </div>
          <div className="requirement-item">
            <h4>Silver Star Leader</h4>
            <ul>
              <li>10+ Direct Referrals ({data.directReferrals}/10)</li>
              <li>100+ Team Members ({data.teamSize}/100)</li>
              <li>$5,000 Monthly Volume</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="leader-benefits">
        <h3>Leader Pool Benefits</h3>
        <div className="benefits-grid">
          <div className="benefit-item">
            <FaDollarSign className="icon" />
            <div>
              <h4>10% Pool Share</h4>
              <p>Share in 10% of the total compensation pool</p>
            </div>
          </div>
          <div className="benefit-item">
            <FaTrophy className="icon" />
            <div>
              <h4>Leadership Recognition</h4>
              <p>Special badge and recognition in the community</p>
            </div>
          </div>
          <div className="benefit-item">
            <FaGift className="icon" />
            <div>
              <h4>Bonus Rewards</h4>
              <p>Monthly bonus rewards and incentives</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Help Pool Section
function HelpPoolSection({ data, account }) {
  const weeklyDistribution = data.helpPoolEarnings / 4; // Assuming monthly shown

  return (
    <div className="help-pool-section">
      <div className="help-pool-overview">
        <h3>Help Pool (30%)</h3>
        <p>The largest portion of rewards - distributed weekly to all active members</p>
        <div className="pool-stats">
          <div className="stat-item">
            <h2>${data.helpPoolEarnings.toFixed(2)}</h2>
            <span>Total Help Pool Earnings</span>
          </div>
          <div className="stat-item">
            <h2>${weeklyDistribution.toFixed(2)}</h2>
            <span>Average Weekly Distribution</span>
          </div>
        </div>
      </div>

      <div className="help-pool-eligibility">
        <h3>Eligibility Status</h3>
        <div className={`eligibility-card ${data.helpPoolEligible ? 'eligible' : 'not-eligible'}`}>
          {data.helpPoolEligible ? (
            <>
              <FaCheckCircle className="status-icon" />
              <h4>You're Eligible!</h4>
              <p>You're receiving Help Pool distributions</p>
            </>
          ) : (
            <>
              <FaExclamationTriangle className="status-icon" />
              <h4>Not Eligible</h4>
              <p>Purchase a package to become eligible</p>
            </>
          )}
        </div>
      </div>

      <div className="distribution-schedule">
        <h3>Distribution Schedule</h3>
        <div className="schedule-item">
          <FaClock className="icon" />
          <div>
            <h4>Weekly Payouts</h4>
            <p>Every Friday at 12:00 PM UTC</p>
          </div>
        </div>
        <div className="schedule-item">
          <FaDollarSign className="icon" />
          <div>
            <h4>30% Pool Share</h4>
            <p>30% of all revenue goes to Help Pool</p>
          </div>
        </div>
        <div className="schedule-item">
          <FaUsers className="icon" />
          <div>
            <h4>Fair Distribution</h4>
            <p>Distributed equally among all eligible members</p>
          </div>
        </div>
      </div>

      <div className="help-pool-history">
        <h3>Distribution History</h3>
        <WithdrawalHistory account={account} />
      </div>
    </div>
  );
}

// Packages Section
function PackagesSection({ data, account }) {
  const packages = [
    { value: 30, features: ['Basic Level Access', 'Help Pool Eligible', '4X ROI Cap ($120)'] },
    { value: 50, features: ['Enhanced Access', 'Help Pool Eligible', '4X ROI Cap ($200)'], popular: false },
    { value: 100, features: ['Premium Access', 'Help Pool Eligible', '4X ROI Cap ($400)'], popular: true },
    { value: 200, features: ['VIP Access', 'Help Pool Eligible', '4X ROI Cap ($800)'] }
  ];

  return (
    <div className="packages-section">
      <div className="current-package">
        <h3>Your Current Package</h3>
        <div className="package-card current">
          <h2>${data.currentPackage}</h2>
          <p>Maximum Earnings: ${data.maxEarnings}</p>
          <div className="package-progress">
            <span>Progress: ${data.totalEarnings} / ${data.maxEarnings}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(data.totalEarnings / data.maxEarnings) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="available-packages">
        <h3>Available Packages</h3>
        <div className="packages-grid">
          {packages.map((pkg, index) => (
            <div key={index} className={`package-card ${pkg.popular ? 'popular' : ''} ${data.currentPackage === pkg.value ? 'current' : ''}`}>
              {pkg.popular && <div className="popular-badge">Most Popular</div>}
              <h2>${pkg.value}</h2>
              <p className="roi-cap">4X ROI Cap: ${pkg.value * 4}</p>
              <ul className="features">
                {pkg.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              <button 
                className={`package-btn ${data.currentPackage === pkg.value ? 'current' : ''}`}
                disabled={data.currentPackage === pkg.value}
              >
                {data.currentPackage === pkg.value ? 'Current Package' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="package-benefits">
        <h3>Package Benefits</h3>
        <div className="benefits-list">
          <div className="benefit-item">
            <FaShieldAlt className="icon" />
            <div>
              <h4>4X ROI Protection</h4>
              <p>Your earnings are capped at 4 times your package value for guaranteed ROI</p>
            </div>
          </div>
          <div className="benefit-item">
            <FaGift className="icon" />
            <div>
              <h4>Help Pool Access</h4>
              <p>All packages include access to the 30% Help Pool distributions</p>
            </div>
          </div>
          <div className="benefit-item">
            <FaNetworkWired className="icon" />
            <div>
              <h4>Full Compensation Plan</h4>
              <p>Access to all 5 income streams in the Lead Five compensation plan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Community Tiers Section
function CommunityTiersSection({ data, account }) {
  const tiers = [
    { tier: 1, name: 'Starter', requirements: 'Active Package', withdrawRatio: { withdraw: 70, reinvest: 30 } },
    { tier: 2, name: 'Builder', requirements: '2+ Direct Referrals', withdrawRatio: { withdraw: 80, reinvest: 20 } },
    { tier: 3, name: 'Leader', requirements: '5+ Direct Referrals', withdrawRatio: { withdraw: 90, reinvest: 10 } },
    { tier: 4, name: 'Elite', requirements: '10+ Direct Referrals', withdrawRatio: { withdraw: 100, reinvest: 0 } }
  ];

  return (
    <div className="community-tiers-section">
      <div className="current-tier">
        <h3>Your Current Tier</h3>
        <div className="tier-card current">
          <h2>Tier {data.currentTier}</h2>
          <h3>{tiers[data.currentTier - 1]?.name}</h3>
          <div className="withdrawal-ratio">
            <h4>Withdrawal Ratio</h4>
            <div className="ratio-display">
              <div className="ratio-item withdraw">
                <span>{data.withdrawalRatio.withdraw}%</span>
                <p>Withdraw</p>
              </div>
              <div className="ratio-item reinvest">
                <span>{data.withdrawalRatio.reinvest}%</span>
                <p>Reinvest</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tier-progression">
        <h3>Tier Progression</h3>
        <div className="tiers-list">
          {tiers.map((tier, index) => (
            <div key={index} className={`tier-item ${data.currentTier === tier.tier ? 'current' : ''} ${data.currentTier > tier.tier ? 'completed' : ''}`}>
              <div className="tier-number">{tier.tier}</div>
              <div className="tier-info">
                <h4>{tier.name}</h4>
                <p>{tier.requirements}</p>
                <div className="tier-ratio">
                  {tier.withdrawRatio.withdraw}% Withdraw / {tier.withdrawRatio.reinvest}% Reinvest
                </div>
              </div>
              {data.currentTier >= tier.tier && <FaCheckCircle className="completed-icon" />}
            </div>
          ))}
        </div>
      </div>

      <div className="tier-benefits">
        <h3>Tier Benefits</h3>
        <div className="benefits-explanation">
          <div className="benefit-item">
            <FaWallet className="icon" />
            <div>
              <h4>Improved Withdrawal Ratios</h4>
              <p>Higher tiers allow you to withdraw more and reinvest less</p>
            </div>
          </div>
          <div className="benefit-item">
            <FaUsers className="icon" />
            <div>
              <h4>Referral-Based Progression</h4>
              <p>Advance tiers by building your direct referral network</p>
            </div>
          </div>
          <div className="benefit-item">
            <FaTrophy className="icon" />
            <div>
              <h4>Elite Status</h4>
              <p>Tier 4 Elite members can withdraw 100% of earnings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Withdrawals Section
function WithdrawalsSection({ data, account }) {
  const availableForWithdrawal = data.totalEarnings * (data.withdrawalRatio.withdraw / 100);
  const mustReinvest = data.totalEarnings * (data.withdrawalRatio.reinvest / 100);

  return (
    <div className="withdrawals-section">
      <div className="withdrawal-overview">
        <div className="withdrawal-stats">
          <div className="stat-card">
            <h3>Available to Withdraw</h3>
            <h2>${availableForWithdrawal.toFixed(2)}</h2>
            <span>{data.withdrawalRatio.withdraw}% of earnings</span>
          </div>
          <div className="stat-card">
            <h3>Must Reinvest</h3>
            <h2>${mustReinvest.toFixed(2)}</h2>
            <span>{data.withdrawalRatio.reinvest}% of earnings</span>
          </div>
        </div>
      </div>

      <div className="withdrawal-form">
        <h3>Request Withdrawal</h3>
        <div className="form-group">
          <label>Amount (USDT)</label>
          <input 
            type="number" 
            max={availableForWithdrawal.toFixed(2)}
            placeholder="Enter amount"
          />
          <small>Maximum: ${availableForWithdrawal.toFixed(2)} USDT</small>
        </div>
        <button className="withdrawal-btn">Request Withdrawal</button>
      </div>

      <div className="withdrawal-info">
        <h3>Withdrawal Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <FaClock className="icon" />
            <div>
              <h4>Processing Time</h4>
              <p>Withdrawals are processed within 24-48 hours</p>
            </div>
          </div>
          <div className="info-item">
            <FaShieldAlt className="icon" />
            <div>
              <h4>Minimum Amount</h4>
              <p>Minimum withdrawal: $10 USDT</p>
            </div>
          </div>
          <div className="info-item">
            <FaNetworkWired className="icon" />
            <div>
              <h4>Network</h4>
              <p>Binance Smart Chain (BSC) - USDT BEP-20</p>
            </div>
          </div>
        </div>
      </div>

      <div className="withdrawal-history">
        <h3>Withdrawal History</h3>
        <WithdrawalHistory account={account} />
      </div>
    </div>
  );
}

// Team Structure Section
function TeamStructureSection({ account }) {
  const navigate = useNavigate();
  
  return (
    <div className="team-structure-section">
      <div className="team-overview">
        <div className="section-header">
          <div className="header-content">
            <h3>My Team Structure</h3>
            <p>Visualize your network and team growth</p>
          </div>
          <button 
            className="full-genealogy-btn"
            onClick={() => navigate('/genealogy')}
            title="Open Full Network Genealogy View"
          >
            <FaNetworkWired />
            Full Genealogy View
          </button>
        </div>
      </div>

      <div className="team-visualization">
        <NetworkTreeVisualization 
          account={account} 
          compact={true}
          maxDepth={3}
          showControls={false}
          style={{ maxHeight: '400px' }}
        />
      </div>

      <div className="team-stats">
        <h3>Team Statistics</h3>
        <PerformanceMetrics account={account} />
      </div>
      
      <div className="genealogy-teaser">
        <div className="teaser-content">
          <FaNetworkWired className="teaser-icon" />
          <div className="teaser-text">
            <h4>Want to see your complete network?</h4>
            <p>View your full genealogy tree with advanced controls, search, and analytics</p>
          </div>
          <button 
            className="teaser-btn"
            onClick={() => navigate('/genealogy')}
          >
            Explore Full Tree
          </button>
        </div>
      </div>
    </div>
  );
}

// Reports Section
function ReportsSection({ account }) {
  return (
    <div className="reports-section">
      <div className="reports-header">
        <h3>Performance Reports</h3>
        <p>Detailed analytics and insights</p>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <h4>Earnings Report</h4>
          <EarningsChart />
        </div>
        <div className="report-card">
          <h4>Team Growth</h4>
          <PerformanceMetrics account={account} />
        </div>
        <div className="report-card">
          <h4>Activity Feed</h4>
          <ActivityFeed account={account} />
        </div>
      </div>
    </div>
  );
}

// AI Insights Section
function AIInsightsSection({ data, account }) {
  return (
    <div className="ai-insights-section">
      <div className="ai-coaching-panel">
        <ErrorBoundary>
          <AICoachingPanel 
            userStats={{
              totalEarnings: data.totalEarnings,
              teamSize: data.teamSize,
              directReferrals: data.directReferrals,
              currentTier: data.currentTier
            }}
            account={account}
          />
        </ErrorBoundary>
      </div>

      <div className="ai-predictions">
        <ErrorBoundary>
          <AIEarningsPrediction 
            currentEarnings={data.totalEarnings}
            teamSize={data.teamSize}
            account={account}
          />
        </ErrorBoundary>
      </div>

      <div className="ai-market-insights">
        <ErrorBoundary>
          <AIMarketInsights account={account} />
        </ErrorBoundary>
      </div>

      <div className="ai-success-stories">
        <ErrorBoundary>
          <AISuccessStories account={account} />
        </ErrorBoundary>
      </div>
    </div>
  );
}

// Dashboard Overview Component with AI Integration
function DashboardOverview({ data, account }) {
  const stats = [
    {
      icon: FaDollarSign,
      label: 'Total Earnings',
      value: `$${data.totalEarnings.toFixed(2)}`,
      change: '+12.5%',
      positive: true
    },
    {
      icon: FaUsers,
      label: 'Direct Referrals',
      value: data.directReferrals,
      change: '+2',
      positive: true
    },
    {
      icon: FaNetworkWired,
      label: 'Team Size',
      value: data.teamSize,
      change: '+5',
      positive: true
    },
    {
      icon: FaGift,
      label: 'Pending Rewards',
      value: `$${data.pendingRewards.toFixed(2)}`,
      change: 'Ready to claim',
      positive: true
    }
  ];

  return (
    <div className="overview-section">
      {/* AI Coaching Panel at the top */}
      <ErrorBoundary>
        <AICoachingPanel 
          userStats={{
            totalEarnings: data.totalEarnings,
            teamSize: data.teamSize,
            currentLevel: data.currentLevel,
            dailyEarnings: data.dailyEarnings,
            packageLevel: data.currentLevel * 30,
            daysSinceLastLogin: 0,
            teamGrowthRate: 12.5,
            loginStreak: 7,
            monthlyGoal: 5000,
            daysSinceLastReferral: 2,
            voiceEnabled: true
          }}
          account={account}
        />
      </ErrorBoundary>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">
              <stat.icon />
            </div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <h3 className="stat-value">{stat.value}</h3>
              <span className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="overview-grid">
        <div className="overview-card">
          <h3><FaChartBar /> Earnings Overview</h3>
          <EarningsChart />
        </div>

        <div className="overview-card">
          <h3><FaClock /> Recent Activity</h3>
          <ActivityFeed limit={5} />
        </div>

        <div className="overview-card">
          <h3><FaTrophy /> Achievements & Progress</h3>
          <div className="achievements-preview">
            <div className="achievement-summary">
              <div className="achievement-count">
                <span className="count">{JSON.parse(localStorage.getItem('leadfive_achievements') || '[]').length}</span>
                <span className="label">Achievements Earned</span>
              </div>
              <div className="level-display">
                <span className="level">Level {data.currentLevel}</span>
                <div className="level-progress-mini">
                  <div className="progress-bar-mini">
                    <div 
                      className="progress-fill-mini" 
                      style={{ width: `${(data.totalEarnings / (data.currentLevel * 1000)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="recent-achievement">
              <div className="achievement-icon">🏆</div>
              <div className="achievement-text">
                <span>Recent: Network Builder</span>
                <small>Reached {data.teamSize}+ team members</small>
              </div>
            </div>
            <button 
              className="view-all-btn"
              onClick={() => setActiveSection('gamification')}
            >
              View All Achievements
            </button>
          </div>
        </div>

        <div className="overview-card">
          <h3><FaCheckCircle /> Quick Actions</h3>
          <div className="quick-actions">
            <button className="quick-btn">Claim Rewards</button>
            <button className="quick-btn">Invite Member</button>
            <button className="quick-btn">View Reports</button>
            <button className="quick-btn">Withdraw Funds</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Network Section Component with Error Handling
function NetworkSection({ account }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('tree');
  const [treeError, setTreeError] = useState(false);

  // Add error handler
  useEffect(() => {
    const handleError = (error) => {
      console.error('Network section error:', error);
      setTreeError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Error boundary for tree component
  const renderTree = () => {
    if (treeError) {
      return (
        <div className="tree-error-container">
          <div className="error-message">
            <h4>⚠️ Network Visualization Temporarily Unavailable</h4>
            <p>We're experiencing issues loading the network tree. Please try refreshing or use the full network view.</p>
            <div className="error-actions">
              <button 
                onClick={() => {
                  setTreeError(false);
                  window.location.reload();
                }}
                className="refresh-btn"
              >
                🔄 Refresh Page
              </button>
              <button 
                onClick={() => navigate('/genealogy')}
                className="full-view-btn"
              >
                🌐 Open Full Network View
              </button>
            </div>
          </div>
        </div>
      );
    }

    try {
      if (viewMode === 'tree') {
        return <NetworkTreeVisualization address={account} />;
      } else {
        return <LevelVisualization userAddress={account} />;
      }
    } catch (error) {
      console.error('Tree rendering error:', error);
      setTreeError(true);
      return null;
    }
  };

  return (
    <div className="network-section">
      <div className="section-header">
        <h2>Your Network Structure</h2>
        <div className="view-toggle">
          <button 
            className={viewMode === 'tree' ? 'active' : ''}
            onClick={() => setViewMode('tree')}
          >
            Tree View
          </button>
          <button 
            className={viewMode === 'level' ? 'active' : ''}
            onClick={() => setViewMode('level')}
          >
            Grid View
          </button>
        </div>
        <div className="section-actions">
          <button 
            className="full-view-btn"
            onClick={() => navigate('/genealogy')}
          >
            <FaNetworkWired />
            Full Network View
          </button>
        </div>
      </div>

      {renderTree()}
    </div>
  );
}

// Earnings Section Component with AI Integration
function EarningsSection({ data, account }) {
  return (
    <div className="earnings-section">
      <div className="earnings-summary">
        <div className="summary-card">
          <h3>Today's Earnings</h3>
          <p className="amount">${data.dailyEarnings.toFixed(2)}</p>
          <span className="trend positive">+15.2%</span>
        </div>
        <div className="summary-card">
          <h3>This Week</h3>
          <p className="amount">${(data.dailyEarnings * 7).toFixed(2)}</p>
          <span className="trend positive">+8.7%</span>
        </div>
        <div className="summary-card">
          <h3>This Month</h3>
          <p className="amount">${(data.dailyEarnings * 30).toFixed(2)}</p>
          <span className="trend positive">+22.1%</span>
        </div>
      </div>

      {/* AI Earnings Prediction */}
      <ErrorBoundary>
        <AIEarningsPrediction 
          userStats={{
            totalEarnings: data.totalEarnings,
            teamSize: data.teamSize,
            currentLevel: data.currentLevel,
            dailyEarnings: data.dailyEarnings,
            monthlyEarnings: data.dailyEarnings * 30,
            packageLevel: data.currentLevel * 30,
            activeReferrals: data.activeReferrals
          }}
        />
      </ErrorBoundary>

      <div className="earnings-chart-container">
        <h3>Earnings History</h3>
        <EarningsChart detailed={true} />
      </div>

      <div className="earnings-breakdown">
        <h3>Income Sources</h3>
        <div className="breakdown-list">
          <div className="breakdown-item">
            <span>Direct Referrals</span>
            <span>$1,234.56</span>
          </div>
          <div className="breakdown-item">
            <span>Team Bonuses</span>
            <span>$2,456.78</span>
          </div>
          <div className="breakdown-item">
            <span>Level Bonuses</span>
            <span>$567.89</span>
          </div>
          <div className="breakdown-item">
            <span>Performance Rewards</span>
            <span>$308.66</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Referrals Section Component
function ReferralsSection({ account }) {
  return (
    <div className="referrals-section">
      <ReferralStats account={account} />
      
      <div className="referral-tools">
        <h3>Referral Tools</h3>
        <div className="tools-grid">
          <div className="tool-card">
            <FaUsers />
            <h4>Invite Link</h4>
            <p>Share your unique referral link</p>
            <button>Copy Link</button>
          </div>
          <div className="tool-card">
            <FaChartLine />
            <h4>Track Progress</h4>
            <p>Monitor your referral performance</p>
            <button>View Stats</button>
          </div>
          <div className="tool-card">
            <FaGift />
            <h4>Bonus Tracker</h4>
            <p>See your referral bonuses</p>
            <button>View Bonuses</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Activity Section Component
function ActivitySection({ account }) {
  return (
    <div className="activity-section">
      <h3>Recent Activity</h3>
      <ActivityFeed />
    </div>
  );
}

// Performance Section Component
function PerformanceSection({ data }) {
  return (
    <div className="performance-section">
      <h3>Your Performance</h3>
      <PerformanceMetrics detailed={true} />
      
      <div className="achievements">
        <h3>Recent Achievements</h3>
        <div className="achievement-list">
          <div className="achievement-item">
            <FaTrophy className="gold" />
            <div>
              <h4>Network Builder</h4>
              <p>Reached {data.teamSize}+ team members</p>
              <small>+100 XP earned</small>
            </div>
          </div>
          <div className="achievement-item">
            <FaTrophy className="silver" />
            <div>
              <h4>Consistent Earner</h4>
              <p>30 days of continuous earnings</p>
              <small>+75 XP earned</small>
            </div>
          </div>
          <div className="achievement-item">
            <FaTrophy className="bronze" />
            <div>
              <h4>Quick Starter</h4>
              <p>{data.directReferrals} referrals in first week</p>
              <small>+50 XP earned</small>
            </div>
          </div>
        </div>
        
        <div className="achievement-progress">
          <h4>🎯 Next Achievement</h4>
          <div className="next-achievement">
            <div className="achievement-target">
              <span className="target-icon">👑</span>
              <div className="target-info">
                <h5>Leader Status</h5>
                <p>Reach 10 direct referrals</p>
                <div className="target-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(data.directReferrals / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span>{data.directReferrals}/10 referrals</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Voice Assistant Section Component
function VoiceAssistantSection({ data, account }) {
  return (
    <div className="voice-assistant-section">
      <div className="voice-assistant-header">
        <h2><FaBrain /> AI Chat & Voice Assistant</h2>
        <p>Experience natural conversations with AI-powered assistance for your LeadFive journey. Use the floating AI button in the bottom right corner to start chatting!</p>
      </div>

      <div className="voice-assistant-info">
        <div className="info-card">
          <FaRobot className="info-icon" />
          <h3>Smart AI Chat</h3>
          <p>Click the AI button (💬) in the bottom right corner to open the chat interface. Ask questions about your earnings, team, or get strategic advice.</p>
        </div>
        
        <div className="info-card">
          <FaBrain className="info-icon" />
          <h3>Voice Recognition</h3>
          <p>Use the microphone feature within the chat to speak your questions. The AI will respond with both text and voice.</p>
        </div>
      </div>

      <div className="voice-features-grid">
        <div className="voice-feature-card">
          <FaLightbulb className="feature-icon" />
          <h3>Smart Coaching</h3>
          <p>Get personalized advice and strategies based on your performance data</p>
        </div>
        
        <div className="voice-feature-card">
          <FaChartLine className="feature-icon" />
          <h3>Performance Analysis</h3>
          <p>Ask about your earnings, team growth, and get detailed insights</p>
        </div>
        
        <div className="voice-feature-card">
          <FaUsers className="feature-icon" />
          <h3>Team Management</h3>
          <p>Discuss team strategies and get recommendations for growth</p>
        </div>
        
        <div className="voice-feature-card">
          <FaRocket className="feature-icon" />
          <h3>Goal Setting</h3>
          <p>Set and track your goals with AI-powered guidance</p>
        </div>
      </div>

      <div className="voice-tips">
        <h3>💡 Voice Assistant Tips</h3>
        <ul>
          <li>🎤 <strong>Ask about your performance:</strong> "How are my earnings this month?"</li>
          <li>📈 <strong>Get growth advice:</strong> "What strategies can help me grow my team?"</li>
          <li>💰 <strong>Discuss earnings:</strong> "When should I expect my next payout?"</li>
          <li>🎯 <strong>Set goals:</strong> "Help me set a realistic monthly earning goal"</li>
          <li>👥 <strong>Team insights:</strong> "How is my team performing compared to others?"</li>
        </ul>
      </div>
    </div>
  );
}

// Settings Section Component
function SettingsSection({ account, onDisconnect }) {
  return (
    <div className="settings-section">
      <h3>Account Settings</h3>
      
      <div className="settings-group">
        <h4>Wallet Connection</h4>
        <div className="wallet-info">
          <p>Connected: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected'}</p>
          <button onClick={onDisconnect} className="disconnect-btn">
            Disconnect Wallet
          </button>
        </div>
      </div>

      <div className="settings-group">
        <h4>AI Features</h4>
        <label className="toggle-setting">
          <input type="checkbox" defaultChecked />
          <span>AI Coaching</span>
        </label>
        <label className="toggle-setting">
          <input type="checkbox" defaultChecked />
          <span>AI Earnings Predictions</span>
        </label>
        <label className="toggle-setting">
          <input type="checkbox" defaultChecked />
          <span>AI Transaction Helper</span>
        </label>
        <label className="toggle-setting">
          <input type="checkbox" defaultChecked />
          <span>Voice Assistant</span>
        </label>
      </div>

      <div className="settings-group">
        <h4>Notifications</h4>
        <label className="toggle-setting">
          <input type="checkbox" defaultChecked />
          <span>Email notifications</span>
        </label>
        <label className="toggle-setting">
          <input type="checkbox" defaultChecked />
          <span>Browser notifications</span>
        </label>
      </div>

      <div className="settings-group">
        <h4>Security</h4>
        <button className="security-btn">Enable 2FA</button>
        <button className="security-btn">Change Password</button>
      </div>

      <div className="settings-group">
        <h4>Gamification</h4>
        <label className="toggle-setting">
          <input type="checkbox" defaultChecked />
          <span>Enable Achievement Notifications</span>
        </label>
        <label className="toggle-setting">
          <input type="checkbox" defaultChecked />
          <span>Show Progress Animations</span>
        </label>
        <label className="toggle-setting">
          <input type="checkbox" defaultChecked />
          <span>Daily Quest Reminders</span>
        </label>
      </div>
    </div>
  );
}

// Gamification Section Component
function GamificationSection({ data, account }) {
  const userStats = {
    totalEarnings: data.totalEarnings,
    totalReferrals: data.directReferrals,
    teamSize: data.teamSize,
    matrixLevel: data.currentLevel,
    completedCycles: Math.floor(data.totalEarnings / (data.currentPackage * 4)) || 0,
    daysSinceJoining: 30, // Mock data
    monthlyEarnings: data.dailyEarnings * 30,
    weeklyEarnings: data.dailyEarnings * 7,
    activeReferrals: data.activeReferrals,
    packageLevel: data.currentPackage
  };

  return (
    <div className="gamification-section">
      <div className="gamification-header">
        <h2>🎮 Achievements & Rewards Center</h2>
        <p>Track your progress, earn achievements, and climb the leaderboards!</p>
      </div>

      <ErrorBoundary>
        <GamificationSystem 
          wallet={{ account }}
          contract={null}
          userStats={userStats}
        />
      </ErrorBoundary>

      <div className="gamification-benefits">
        <h3>🏆 Why Achievements Matter</h3>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">🎯</div>
            <h4>Goal Setting</h4>
            <p>Achievements help you set and reach meaningful milestones in your Lead Five journey</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">⚡</div>
            <h4>Motivation</h4>
            <p>Daily quests and challenges keep you engaged and motivated to grow your business</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🏅</div>
            <h4>Recognition</h4>
            <p>Show off your achievements and compete with other top performers on the leaderboard</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">💎</div>
            <h4>Rewards</h4>
            <p>Earn XP points and unlock special badges for completing achievements and challenges</p>
          </div>
        </div>
      </div>

      <div className="progress-overview">
        <h3>📊 Your Progress Overview</h3>
        <div className="progress-stats">
          <div className="progress-stat">
            <h4>Total Achievements</h4>
            <div className="stat-value">{JSON.parse(localStorage.getItem('leadfive_achievements') || '[]').length}</div>
            <span>out of 16 available</span>
          </div>
          <div className="progress-stat">
            <h4>Current Level</h4>
            <div className="stat-value">{data.currentLevel}</div>
            <span>Keep growing!</span>
          </div>
          <div className="progress-stat">
            <h4>Team Members</h4>
            <div className="stat-value">{data.teamSize}</div>
            <span>in your network</span>
          </div>
          <div className="progress-stat">
            <h4>Total Earnings</h4>
            <div className="stat-value">${data.totalEarnings.toFixed(0)}</div>
            <span>lifetime earnings</span>
          </div>
        </div>
      </div>
    </div>
  );
}
