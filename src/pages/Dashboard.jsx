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
  FaLightbulb
} from 'react-icons/fa';
import MatrixVisualization from '../components/MatrixVisualization';
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
import ExtraordinaryAIAssistant from '../components/ExtraordinaryAIAssistant';
// AI Services
import { elevenLabsService } from '../services/ElevenLabsOnlyService';
import './Dashboard.css';
import '../styles/dashboard-alignment-fixes.css';
import '../styles/mobile-first-optimization.css';
import '../styles/expert-dashboard-redesign.css';
import '../styles/voice-assistant.css';
import '../styles/dashboard-layout-fix.css';

export default function Dashboard({ account, provider, onDisconnect }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    totalEarnings: 0,
    activeReferrals: 0,
    teamSize: 0,
    pendingRewards: 0,
    totalWithdrawn: 0,
    currentLevel: 1,
    networkHealth: 100,
    dailyEarnings: 0
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
      // Simulate loading dashboard data
      setTimeout(() => {
        setDashboardData({
          totalEarnings: 4567.89,
          activeReferrals: 156,
          teamSize: 892,
          pendingRewards: 234.56,
          totalWithdrawn: 3234.56,
          currentLevel: 7,
          networkHealth: 94,
          dailyEarnings: 123.45
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'ai-insights', label: 'AI Insights', icon: FaRobot },
    { id: 'voice-assistant', label: 'Voice Assistant', icon: FaBrain },
    { id: 'network', label: 'Network Tree', icon: FaNetworkWired },
    { id: 'earnings', label: 'Earnings', icon: FaDollarSign },
    { id: 'referrals', label: 'Referrals', icon: FaUsers },
    { id: 'withdrawals', label: 'Withdrawals', icon: FaWallet },
    { id: 'activity', label: 'Activity', icon: FaHistory },
    { id: 'performance', label: 'Performance', icon: FaTrophy },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview data={dashboardData} account={account} />;
      case 'ai-insights':
        return <AIInsightsSection data={dashboardData} account={account} />;
      case 'voice-assistant':
        return <VoiceAssistantSection data={dashboardData} account={account} />;
      case 'network':
        return <NetworkSection account={account} />;
      case 'earnings':
        return <EarningsSection data={dashboardData} account={account} />;
      case 'referrals':
        return <ReferralsSection account={account} />;
      case 'withdrawals':
        return <WithdrawalsSection account={account} />;
      case 'activity':
        return <ActivitySection account={account} />;
      case 'performance':
        return <PerformanceSection data={dashboardData} />;
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
              <h3>Welcome Back!</h3>
              <p>{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'User'}</p>
              <span className="user-level">Level {dashboardData.currentLevel}</span>
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
            <div className="network-health">
              <FaShieldAlt className="health-icon" />
              <div>
                <p>Network Health</p>
                <div className="health-bar">
                  <div 
                    className="health-progress" 
                    style={{ width: `${dashboardData.networkHealth}%` }}
                  ></div>
                </div>
                <span>{dashboardData.networkHealth}%</span>
              </div>
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

        {/* Extraordinary AI Assistant - Fixed position chat assistant */}
        {activeSection !== 'voice-assistant' && (
          <ExtraordinaryAIAssistant 
            userStats={{
              totalEarnings: dashboardData.totalEarnings,
              teamSize: dashboardData.teamSize,
              currentLevel: dashboardData.currentLevel,
              dailyEarnings: dashboardData.dailyEarnings,
              activeReferrals: dashboardData.activeReferrals
            }}
            account={account}
          />
        )}

      </div>
    </PageWrapper>
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
      label: 'Active Referrals',
      value: data.activeReferrals,
      change: '+8',
      positive: true
    },
    {
      icon: FaNetworkWired,
      label: 'Team Size',
      value: data.teamSize,
      change: '+45',
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
          <h3><FaTrophy /> Performance Metrics</h3>
          <PerformanceMetrics />
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

// New AI Insights Section
function AIInsightsSection({ data, account }) {
  return (
    <div className="ai-insights-section">
      <div className="ai-insights-header">
        <h2><FaRobot /> AI-Powered Insights</h2>
        <p>Get personalized recommendations and predictions powered by artificial intelligence</p>
      </div>

      <div className="ai-insights-grid">
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

        <ErrorBoundary>
          <AIMarketInsights />
        </ErrorBoundary>

        <ErrorBoundary>
          <AISuccessStories />
        </ErrorBoundary>

        <ErrorBoundary>
          <AIEmotionTracker 
            userActivity={{
              totalEarnings: data.totalEarnings,
              teamGrowth: 12.5,
              recentActivity: 'high',
              mood: 'positive'
            }}
          />
        </ErrorBoundary>
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
        return <MatrixVisualization userAddress={account} />;
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
            className={viewMode === 'matrix' ? 'active' : ''}
            onClick={() => setViewMode('matrix')}
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

// Withdrawals Section Component
function WithdrawalsSection({ account }) {
  return (
    <div className="withdrawals-section">
      <div className="withdrawal-balance">
        <h3>Available Balance</h3>
        <p className="balance-amount">$1,234.56</p>
        <button className="withdraw-btn">Withdraw Funds</button>
      </div>

      <WithdrawalHistory account={account} />
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
              <p>Reached 100+ team members</p>
            </div>
          </div>
          <div className="achievement-item">
            <FaTrophy className="silver" />
            <div>
              <h4>Consistent Earner</h4>
              <p>30 days of continuous earnings</p>
            </div>
          </div>
          <div className="achievement-item">
            <FaTrophy className="bronze" />
            <div>
              <h4>Quick Starter</h4>
              <p>5 referrals in first week</p>
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
    </div>
  );
}
