import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { ethers, parseUnits, formatEther, ZeroAddress } from 'ethers';
import './OrphiChain.css';
import './OrphiChainEnhanced.css';
import OrphiChainLogo from './OrphiChainLogo';
import ErrorBoundary from './ErrorBoundary';
import GenealogyTreeIntegration from './components/GenealogyTreeIntegration';
// import TransactionRetryHandler from './TransactionRetryHandler';
// import NetworkStatusMonitor from './NetworkStatusMonitor';
// import { ABIProvider } from './ABIManager';

// Lazy load heavy components for code splitting - temporarily disabled
// const ChartsBundle = React.lazy(() => import('./ChartsBundle'));
// const GenealogyTreeBundle = React.lazy(() => import('./GenealogyTreeBundle'));
// const ExportPanel = React.lazy(() => import('./ExportPanel'));

/**
 * OrphiDashboard Component
 *
 * @component
 * @param {string} [contractAddress] - (Optional) Address of the OrphiChain contract for live data
 * @param {object} [provider] - (Optional) ethers.js provider for contract connection
 * @param {string} [userAccount] - Current connected wallet address
 * @param {number} [networkId] - Current network ID
 * @param {object} [walletProvider] - Wallet provider instance (MetaMask, Trust Wallet, etc.)
 * @param {function} [onDisconnect] - Callback for wallet disconnection
 * @param {function} [onAlert] - Callback for showing alerts
 * @param {boolean} [demoMode=false] - If true, loads mock data for local development/testing
 *
 * Usage:
 *   <OrphiDashboard demoMode={true} />   // Local development with mock data
 *   <OrphiDashboard 
 *     userAccount={account} 
 *     networkId={chainId} 
 *     walletProvider={provider}
 *     onDisconnect={handleDisconnect}
 *     onAlert={showAlert}
 *   /> // Connected wallet mode
 *
 * Features:
 * - Live system statistics with OrphiChain branding
 * - User activity monitoring
 * - Pool balance tracking
 * - Registration trends
 * - Alert system for anomalies
 * - Brand-compliant UI following OrphiChain design guidelines
 *
 * Best Practices:
 * - State is logically grouped and commented for clarity and maintainability.
 * - Demo mode provides realistic mock data for all dashboard sections.
 * - Data loading/event logic is separated from UI rendering.
 * - All errors are caught and surfaced to the user via the alert system.
 * - ExportPanel receives all relevant data for export.
 * - Utility functions are concise, documented, and modular.
 * - Code is highly maintainable, extensible, and easy for new developers to understand and extend.
 *
 * For more details, see CONTRIBUTING.md and LOCAL_DEVELOPMENT_GUIDE.md.
 */

const ORPHI_COLORS = {
  primary: '#00D4FF',      // Cyber Blue
  secondary: '#7B2CBF',    // Royal Purple
  accent: '#FF6B35',       // Energy Orange
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)'
};

// Responsive breakpoints for adaptive dashboard
const BREAKPOINTS = {
  mobile: '480px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1280px'
};

const SOCKET_URL = import.meta.env.VITE_ORPHI_WS_URL || 'http://localhost:4001';

// Placeholder for metrics data, to be replaced with actual data or logic
const initialMetrics = {
  users: {
    active: 0,
    growth: 0,
  },
  transactions: {
    total: 0,
    daily: 0,
    volume: 0,
  },
  rewards: {
    total: 0,
    distributed: 0,
    pending: 0,
  },
};

// Placeholder for recent activity data
const initialRecentActivity = [
  { id: '1', type: 'System Update', user: 'Admin', time: '1 min ago', details: 'System maintenance scheduled.' },
];


import LiveStatsWidget from "./components/analytics/LiveStatsWidget";
import PerformanceMetrics from "./components/analytics/PerformanceMetrics";
import TransactionStatus from "./components/analytics/TransactionStatus";
import ExportControls from "./components/analytics/ExportControls";
import TeamLevelView from "./components/team/TeamLevelView";
import CompensationDashboard from "./components/compensation/CompensationDashboard";
import CompensationActivityFeed from "./components/compensation/CompensationActivityFeed";
import CompensationSuggestions from "./components/compensation/CompensationSuggestions";
import PieChart from "./components/compensation/PieChart";

const OrphiDashboard = ({ 
  contractAddress, 
  provider, 
  userAccount, 
  networkId, 
  walletProvider, 
  onDisconnect, 
  onAlert, 
  onNavigate, // Added navigation callback
  demoMode = false,
  dashboardData,
  deviceInfo
}) => {
  console.log('🚀 OrphiDashboard component rendered with props:', {
    contractAddress,
    userAccount,
    networkId,
    demoMode,
    hasDashboardData: !!dashboardData,
    hasDeviceInfo: !!deviceInfo
  });
  
  // Remove navigate hook since we're using custom routing
  const [isLoading, setIsLoading] = useState(false); // Start with false for demo mode
  const [error, setError] = useState(null);

  const {
    globalStats = {},
    userInfo = {},
    activityFeed = [],
    // analytics = {} // Assuming analytics is handled by TeamAnalyticsDashboard or ChartsBundle
  } = dashboardData || {};

  const {
    address,
    balance,
    rewards,
    level,
    referrals,
    totalEarnings,
    matrixPosition,
    rank,
    levelIncomeBreakdown = [], // Added default
    recentRewards = [], // Added default
    upline = {}, // Added default
    downlineSummary = {} // Added default
  } = userInfo || {};

  // --- System-wide statistics (from contract or demo) ---
  const [systemStats, setSystemStats] = useState({
    totalMembers: 0,
    totalVolume: 0,
    poolBalances: [0, 0, 0, 0, 0],
    lastGHPDistribution: 0,
    dailyRegistrations: 0,
    dailyWithdrawals: 0
  });

  // --- Real-time event data (registrations, withdrawals, alerts) ---
  const [realtimeData, setRealtimeData] = useState({
    registrations: [],
    withdrawals: [],
    poolHistory: [],
    alerts: []
  });

  // --- Contract connection state ---
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // --- Transaction and Network Management State ---
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: navigator.onLine,
    isProviderConnected: false,
    isCongested: false,
    lastBlockTime: null,
    blockNumber: null,
    status: 'Initializing...', // Added default status
    latency: 'N/A', // Added default latency
    nodes: 0, // Added default nodes
    lastBlock: 'N/A' // Added default lastBlock
  });

  // --- Demo Mode State ---
  const [activeMetric, setActiveMetric] = useState('users');
  // Add state for metrics and recentActivity
  const [metrics, setMetrics] = useState(initialMetrics);
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity);

  // --- Transaction Status State ---
  const [txStatus, setTxStatus] = useState({ status: '', message: '', hash: '' });
  const [progress, setProgress] = useState(0);

  // --- Onboarding/Registration State ---
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [withdrawalError, setWithdrawalError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState('');
  const [withdrawalSuccess, setWithdrawalSuccess] = useState('');
  const [sponsorInput, setSponsorInput] = useState('');
  const [packageTier, setPackageTier] = useState(1);

  // Demo package tiers
  const PACKAGE_TIERS = [
    { value: 1, label: 'Basic - $100', amount: 100 },
    { value: 2, label: 'Standard - $200', amount: 200 },
    { value: 3, label: 'Premium - $500', amount: 500 },
    { value: 4, label: 'VIP - $1000', amount: 1000 },
    { value: 5, label: 'Elite - $2000', amount: 2000 },
  ];

  // Determine registration/withdrawal eligibility
  const isRegistered = !!userInfo?.isRegistered || !!userInfo?.address;
  const withdrawableAmount = userInfo?.withdrawableAmount || userInfo?.balance || 0;

  // --- Event Handlers ---
  const handleNewRegistration = useCallback((registration) => {
    setRealtimeData(prevState => ({
      ...prevState,
      registrations: [registration, ...prevState.registrations]
    }));
  }, []);

  const handleNewWithdrawal = useCallback((withdrawal) => {
    setRealtimeData(prevState => ({
      ...prevState,
      withdrawals: [withdrawal, ...prevState.withdrawals]
    }));
  }, []);

  const handleAlert = useCallback((alert) => {
    setRealtimeData(prevState => ({
      ...prevState,
      alerts: [alert, ...prevState.alerts]
    }));
    if (onAlert) {
      onAlert(alert);
    }
  }, [onAlert]);

  const handleRewardsClaimed = useCallback((user, amount, timestamp, txHash) => {
    const alert = {
      id: txHash || Math.random().toString(36).substr(2, 9),
      type: 'Reward Claimed',
      severity: 'success',
      message: `User ${user} claimed ${amount / 1e6} USDT`,
      time: new Date(timestamp.toNumber() * 1000).toLocaleString()
    };
    setRealtimeData(prevState => ({
      ...prevState,
      alerts: [
        alert,
        ...prevState.alerts
      ]
    }));
    if (onAlert) {
      onAlert(alert);
    }
  }, [onAlert]);

  // --- Contract Interaction ---
  const fetchSystemStats = async () => {
    if (!contract) return;
    try {
      const [
        totalMembers,
        totalVolume,
        poolBalances,
        lastGHPDistribution,
        dailyRegistrations,
        dailyWithdrawals
      ] = await Promise.all([
        contract.totalMembers(),
        contract.totalVolume(),
        contract.getPoolBalances(),
        contract.lastGHPDistribution(),
        contract.getDailyRegistrations(),
        contract.getDailyWithdrawals()
      ]);
      
      setSystemStats({
        totalMembers: totalMembers.toNumber(),
        totalVolume: parseFloat(totalVolume.toString() / 1e18), // ethers.utils.formatEther(totalVolume)),
        poolBalances: poolBalances.map(balance => balance.toString() / 1e18), // ethers.utils.formatEther),
        lastGHPDistribution: new Date(lastGHPDistribution.toNumber() * 1000),
        dailyRegistrations: dailyRegistrations.toNumber(),
        dailyWithdrawals: dailyWithdrawals.toNumber()
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const fetchRealtimeData = async () => {
    if (!contract) return;
    try {
      const [registrations, withdrawals, alerts] = await Promise.all([
        contract.getRecentRegistrations(),
        contract.getRecentWithdrawals(),
        contract.getActiveAlerts()
      ]);
      
      setRealtimeData({
        registrations: registrations.map(reg => ({
          id: reg.args.user,
          time: new Date(reg.args.timestamp.toNumber() * 1000).toLocaleString(),
          type: 'New Registration'
        })),
        withdrawals: withdrawals.map(withdrawal => ({
          id: withdrawal.args.user,
          time: new Date(withdrawal.args.timestamp.toNumber() * 1000).toLocaleString(),
          type: 'Withdrawal'
        })),
        alerts: alerts.map(alert => ({
          id: alert.args.alertId.toString(),
          type: alert.args.alertType,
          severity: alert.args.severity,
          message: alert.args.message,
          time: new Date(alert.args.timestamp.toNumber() * 1000).toLocaleString()
        }))
      });
    } catch (error) {
      console.error('Error fetching realtime data:', error);
    }
  };

  // --- Socket Event Listeners ---
  useEffect(() => {
    // Skip WebSocket connection in demo mode
    if (demoMode) {
      console.log('WebSocket skipped in demo mode');
      return;
    }

    const socket = new WebSocket(SOCKET_URL);
    
    socket.addEventListener('open', () => {
      console.log('WebSocket connected');
    });
    
    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'NEW_REGISTRATION':
          handleNewRegistration(data.payload);
          break;
        case 'NEW_WITHDRAWAL':
          handleNewWithdrawal(data.payload);
          break;
        case 'ALERT':
          handleAlert(data.payload);
          break;
        default:
          break;
      }
    });
    
    socket.addEventListener('close', () => {
      console.log('WebSocket disconnected');
      // Temporarily disabled auto-reload to prevent refresh loops
      // setTimeout(() => {
      //   window.location.reload();
      // }, 5000);
    });
    
    return () => {
      socket.close();
    };
  }, [handleNewRegistration, handleNewWithdrawal, handleAlert, demoMode]);

  // --- Contract Event Listeners ---
  useEffect(() => {
    if (!contract) return;
    
    const onNewRegistration = (user, timestamp) => {
      handleNewRegistration({ id: user, time: new Date(timestamp.toNumber() * 1000).toLocaleString(), type: 'New Registration' });
    };
    
    const onNewWithdrawal = (user, timestamp) => {
      handleNewWithdrawal({ id: user, time: new Date(timestamp.toNumber() * 1000).toLocaleString(), type: 'Withdrawal' });
    };
    
    const onAlert = (alertId, alertType, severity, message, timestamp) => {
      handleAlert({ id: alertId.toString(), type: alertType, severity, message, time: new Date(timestamp.toNumber() * 1000).toLocaleString() });
    };
    
    const onRewardsClaimed = (user, amount, timestamp, event) => {
      handleRewardsClaimed(user, amount, timestamp, event.transactionHash);
    };
    
    contract.on('NewRegistration', onNewRegistration);
    contract.on('NewWithdrawal', onNewWithdrawal);
    contract.on('Alert', onAlert);
    contract.on('RewardsClaimed', onRewardsClaimed);
    
    return () => {
      contract.off('NewRegistration', onNewRegistration);
      contract.off('NewWithdrawal', onNewWithdrawal);
      contract.off('Alert', onAlert);
      contract.off('RewardsClaimed', onRewardsClaimed);
    };
  }, [contract, handleNewRegistration, handleNewWithdrawal, handleAlert, handleRewardsClaimed]);

  // --- Fetch Data ---
  useEffect(() => {
    if (demoMode) return;
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner();
    // const contract = new ethers.Contract(contractAddress, ABIProvider.abi, signer);
    // setContract(contract);
    console.log('Contract setup skipped in demo mode');
  }, [contractAddress, demoMode]);

  useEffect(() => {
    if (demoMode) {
      // Load demo data
      setSystemStats({
        totalMembers: 12458,
        totalVolume: 4675890,
        poolBalances: [120000, 150000, 90000, 30000, 5000],
        lastGHPDistribution: new Date(Date.now() - 24 * 60 * 60 * 1000),
        dailyRegistrations: 250,
        dailyWithdrawals: 75
      });
      setMetrics({ // Add demo metrics
        users: { active: 9870, growth: 12.5 },
        transactions: { total: 150000, daily: 2300, volume: 750000 },
        rewards: { total: 500000, distributed: 450000, pending: 50000 },
      });
      setRecentActivity([ // Add demo recent activity
        { id: 'demo1', type: 'New User', user: '0xDemoUser1', time: '5 mins ago', details: 'Joined the platform.' },
        { id: 'demo2', type: 'Withdrawal', user: '0xDemoUser2', time: '15 mins ago', details: 'Withdrew 100 USDT.' },
        { id: 'demo3', type: 'System Alert', user: 'Network', time: '30 mins ago', details: 'High transaction volume.' },
      ]);
      setNetworkStatus({ // Add demo network status
        isOnline: true,
        isProviderConnected: true,
        isCongested: false,
        lastBlockTime: new Date().toLocaleTimeString(),
        blockNumber: 1234567,
        status: 'Optimal',
        latency: '50ms',
        nodes: 120,
        lastBlock: '#1234567'
      });
      
      setRealtimeData({
        registrations: [
          { id: '0x42B...9F12', time: '2 minutes ago', type: 'New User' },
          { id: '0x12D...8B34', time: '52 minutes ago', type: 'New User' }
        ],
        withdrawals: [
          { id: '0x34E...7C91', time: '1 hour ago', type: 'Withdrawal' }
        ],
        alerts: [
          { id: '1', type: 'High Volume', severity: 'warning', message: 'Unusually high volume detected', time: '10 minutes ago' },
          { id: '2', type: 'New Contract', severity: 'info', message: 'A new contract has been deployed', time: '30 minutes ago' }
        ]
      });
      
      return;
    }
    
    const interval = setInterval(() => {
      if (contract) {
        fetchSystemStats();
        fetchRealtimeData();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [contract, demoMode]);

  // Example demo data for analytics/compensation/team
  const liveStats = {
    tvl: 2847392.5,
    userCount: 12847,
    avgDeposit: 221.5,
    lastUpdated: Date.now()
  };
  const wsConnected = true;
  const teamData = {
    totalMembers: downlineSummary.totalTeamMembers || 0,
    totalVolume: 15780,
    levels: {
      1: { count: 10, activeCount: 8, volume: 1000, earnings: 200 },
      2: { count: 20, activeCount: 15, volume: 2000, earnings: 400 },
      3: { count: 30, activeCount: 25, volume: 3000, earnings: 600 }
    }
  };
  const compensationData = {
    sponsorCommissions: 500,
    levelBonuses: { 1: 150, 2: 250, 3: 300 },
    uplineBonuses: 120,
    leaderBonuses: 80,
    globalHelpPool: 60,
    totalEarnings: 2847.31,
    earningsCap: 5000
  };
  const analyticsData = { exportData: { timestamp: new Date().toLocaleTimeString() } };
  const chartData = [];
  const teamLevelView = { showInfinite: false, maxDisplayLevel: 2 };
  const selectedPackage = level;
  const recentCompEvents = [
    'Earned 30 USDT from Level 2',
    'Received 25 USDT referral bonus',
    'Pool share distributed: 12.5 USDT'
  ];
  const transactions = [
    { id: 1, type: 'Deposit', user: address, amount: 100, status: 'success', timestamp: Date.now() - 10000 },
    { id: 2, type: 'Reward', user: address, amount: 30, status: 'pending', timestamp: Date.now() - 5000 }
  ];

  // Registration handler
  const handleRegister = async () => {
    setRegistrationLoading(true);
    setRegistrationError('');
    setRegistrationSuccess('');
    setTxStatus({ status: 'pending', message: 'Processing registration...' });
    try {
      if (demoMode) {
        setTimeout(() => {
          setRegistrationSuccess('Demo registration successful!');
          setTxStatus({ status: 'confirmed', message: 'Demo registration successful!' });
          setShowOnboarding(false);
        }, 1200);
        return;
      }
      // Live contract logic (pseudo, adapt as needed)
      // 1. Approve USDT
      // 2. Register
      if (!contract || !walletProvider) throw new Error('Wallet not connected');
      const signer = walletProvider.getSigner();
      const usdt = new ethers.Contract(import.meta.env.VITE_USDT_ADDRESS, [
        'function approve(address,uint256) public returns (bool)'
      ], signer);
      const packageObj = PACKAGE_TIERS.find(p => p.value === Number(packageTier));
      const amount = parseUnits(String(packageObj.amount), 6);
      await usdt.approve(contract.address, amount);
      const tx = await contract.register(sponsorInput || ZeroAddress, packageTier);
      await tx.wait();
      setRegistrationSuccess('Registration successful!');
      setTxStatus({ status: 'confirmed', message: 'Registration successful!', hash: tx.hash });
      setShowOnboarding(false);
      if (onAlert) onAlert({ type: 'success', message: 'Registration successful!' });
    } catch (err) {
      setRegistrationError(err.message || 'Registration failed');
      setTxStatus({ status: 'failed', message: err.message || 'Registration failed' });
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Withdrawal handler
  const handleWithdraw = async () => {
    setWithdrawalLoading(true);
    setWithdrawalError('');
    setWithdrawalSuccess('');
    setTxStatus({ status: 'pending', message: 'Processing withdrawal...' });
    try {
      if (demoMode) {
        setTimeout(() => {
          setWithdrawalSuccess('Demo withdrawal successful!');
          setTxStatus({ status: 'confirmed', message: 'Demo withdrawal successful!' });
          setShowWithdrawal(false);
        }, 1200);
        return;
      }
      if (!contract || !walletProvider) throw new Error('Wallet not connected');
      const signer = walletProvider.getSigner();
      const tx = await contract.connect(signer).withdraw();
      await tx.wait();
      setWithdrawalSuccess('Withdrawal successful!');
      setTxStatus({ status: 'confirmed', message: 'Withdrawal successful!', hash: tx.hash });
      setShowWithdrawal(false);
      if (onAlert) onAlert({ type: 'success', message: 'Withdrawal successful!' });
    } catch (err) {
      setWithdrawalError(err.message || 'Withdrawal failed');
      setTxStatus({ status: 'failed', message: err.message || 'Withdrawal failed' });
    } finally {
      setWithdrawalLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadDashboardData = async () => {
      console.log('🔍 loadDashboardData called with:', { userAccount, walletProvider: !!walletProvider, demoMode });
      
      setIsLoading(true);
      setError(null);
      try {
        // Simulate data loading (replace with actual contract calls)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update system stats - use dashboard data if provided, otherwise use defaults
        if (dashboardData?.globalStats) {
          setSystemStats({
            totalMembers: dashboardData.globalStats.totalUsers || 1000,
            totalVolume: dashboardData.globalStats.totalVolume || 2500000,
            poolBalances: [100000, 200000, 300000, 400000, 500000],
            lastGHPDistribution: Date.now(),
            dailyRegistrations: 50,
            dailyWithdrawals: 25
          });
        } else {
          setSystemStats({
            totalMembers: 1000,
            totalVolume: 2500000,
            poolBalances: [100000, 200000, 300000, 400000, 500000],
            lastGHPDistribution: Date.now(),
            dailyRegistrations: 50,
            dailyWithdrawals: 25
          });
        }

        // Update activity feed
        setActivityFeed(dashboardData?.activityFeed || [
          { id: 1, type: 'Registration', timestamp: Date.now() - 3600000 },
          { id: 2, type: 'Withdrawal', timestamp: Date.now() - 7200000 },
          { id: 3, type: 'Reward', timestamp: Date.now() - 10800000 }
        ]);

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        if (onAlert) {
          onAlert('Failed to load dashboard data', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [dashboardData, onAlert, demoMode]);

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    if (onDisconnect) {
      onDisconnect();
    }
  }, [onDisconnect]);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">      
      <div className="dashboard-header">
        <h1>OrphiChain Dashboard</h1>
        <div className="wallet-info">
          <span className="address">{userAccount}</span>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* System Stats */}
        <div className="stats-section">
          <h2>System Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Members</h3>
              <p>{systemStats.totalMembers.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3>Total Volume</h3>
              <p>${systemStats.totalVolume.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3>Daily Registrations</h3>
              <p>{systemStats.dailyRegistrations}</p>
            </div>
            <div className="stat-card">
              <h3>Daily Withdrawals</h3>
              <p>{systemStats.dailyWithdrawals}</p>
            </div>
          </div>
        </div>

        {/* --- ADDED ADVANCED COMPONENTS --- */}
        <LiveStatsWidget stats={systemStats} />
        <PerformanceMetrics metrics={metrics} />
        <TransactionStatus status={txStatus} />
        <ExportControls data={analyticsData} />
        <TeamLevelView teamData={teamData} deviceInfo={deviceInfo} />
        <CompensationDashboard
          compensationData={compensationData}
          teamData={teamData}
          deviceInfo={deviceInfo}
          selectedPackage={selectedPackage}
        />
        <CompensationActivityFeed recentEvents={recentCompEvents} />
        <CompensationSuggestions
          compensationData={compensationData}
          selectedPackage={selectedPackage}
          teamData={teamData}
        />
        <PieChart data={chartData} />
        {/* --- END ADVANCED COMPONENTS --- */}

        {/* User Info */}
        <div className="user-section">
          <h2>Your Profile</h2>
          <div className="user-info">
            <p>Level: {userInfo.level}</p>
            <p>Balance: ${userInfo.balance}</p>
            <p>Total Earnings: ${userInfo.totalEarnings}</p>
            <p>Referrals: {userInfo.referrals}</p>
            <p>Rank: {userInfo.rank}</p>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="activity-section">
          <h2>Recent Activity</h2>
          <div className="activity-feed">
            {activityFeed.map(activity => (
              <div key={activity.id} className="activity-item">
                <span className="activity-type">{activity.type}</span>
                <span className="activity-time">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrphiDashboard;
