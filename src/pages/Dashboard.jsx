import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { 
  FaWallet, FaUsers, FaChartLine, FaGift, 
  FaNetworkWired, FaHistory, FaRobot, FaComments 
} from 'react-icons/fa';
import MatrixVisualization from '../components/MatrixVisualization';
import NetworkTreeVisualization from '../components/NetworkTreeVisualization';
import UnifiedChatbot from '../components/UnifiedChatbot';
import './Dashboard.css';

const CONTRACT_ADDRESS = '0x18f7550B5B3e8b6101712D26083B6d1181Ee550a';

const Dashboard = ({ account, provider, signer }) => {
  const [userData, setUserData] = useState({
    isRegistered: false,
    activePackages: [],
    directReferrals: 0,
    totalEarnings: '0',
    availableBalance: '0',
    teamSize: 0,
    userId: 0,
    referralLink: ''
  });
  
  const [networkData, setNetworkData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    if (account && provider) {
      loadUserData();
    }
  }, [account, provider]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // For now, use mock data until contract is properly integrated
      const mockUserData = {
        isRegistered: true,
        userId: 12345,
        activePackages: [1, 3],
        directReferrals: 8,
        teamSize: 24,
        totalEarnings: '1,250.50',
        availableBalance: '425.75',
        referralLink: `${window.location.origin}/register?ref=${account}`
      };

      const mockNetworkData = {
        address: account,
        children: [
          { address: '0x1234...5678', id: 1, isActive: true },
          { address: '0x2345...6789', id: 2, isActive: true },
          { address: '0x3456...7890', id: 3, isActive: false }
        ]
      };

      setUserData(mockUserData);
      setNetworkData(mockNetworkData);

      // TODO: Replace with actual contract calls when ready
      // const contract = new ethers.Contract(CONTRACT_ADDRESS, LeadFiveABI.abi, provider);
      // const userInfo = await contract.users(account);
      // ... actual contract integration
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      icon: <FaUsers />,
      title: 'Direct Referrals',
      value: userData.directReferrals,
      color: '#00D4FF'
    },
    {
      icon: <FaNetworkWired />,
      title: 'Team Size',
      value: userData.teamSize,
      color: '#7B2CBF'
    },
    {
      icon: <FaChartLine />,
      title: 'Total Earnings',
      value: `${userData.totalEarnings} USDT`,
      color: '#FF6B35'
    },
    {
      icon: <FaGift />,
      title: 'Active Packages',
      value: userData.activePackages.length,
      color: '#00D4FF'
    }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'network':
        return (
          <div className="visualization-container">
            <h2>Your Network Structure</h2>
            <div className="visualization-grid">
              <div className="viz-card">
                <h3>5x5 Structure View</h3>
                <MatrixVisualization 
                  userAddress={account}
                  networkData={networkData}
                />
              </div>
              <div className="viz-card">
                <h3>Tree View</h3>
                <NetworkTreeVisualization 
                  userAddress={account}
                  networkData={networkData}
                />
              </div>
            </div>
          </div>
        );
      
      case 'earnings':
        return (
          <div className="earnings-container">
            <h2>Earnings History</h2>
            <div className="earnings-summary">
              <div className="earning-card">
                <h3>Total Earned</h3>
                <p className="amount">{userData.totalEarnings} USDT</p>
              </div>
              <div className="earning-card">
                <h3>Available Balance</h3>
                <p className="amount">{userData.availableBalance} USDT</p>
              </div>
            </div>
            <Link to="/withdrawals" className="withdraw-btn">
              Withdraw Funds
            </Link>
          </div>
        );
      
      default:
        return (
          <div className="overview-container">
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card" style={{ borderColor: stat.color }}>
                  <div className="stat-icon" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="stat-info">
                    <h3>{stat.title}</h3>
                    <p>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-grid">
                <Link to="/packages" className="action-card">
                  <FaGift />
                  <span>Buy Package</span>
                </Link>
                <Link to="/referrals" className="action-card">
                  <FaUsers />
                  <span>My Referrals</span>
                </Link>
                <button 
                  className="action-card"
                  onClick={() => setActiveView('network')}
                >
                  <FaNetworkWired />
                  <span>View Network</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => setIsChatbotOpen(true)}
                >
                  <FaComments />
                  <span>Get Help</span>
                </button>
              </div>
            </div>

            <div className="referral-section">
              <h2>Your Referral Link</h2>
              <div className="referral-box">
                <input 
                  type="text" 
                  value={userData.referralLink} 
                  readOnly 
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(userData.referralLink);
                    alert('Referral link copied!');
                  }}
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  if (!account) {
    return (
      <div className="dashboard-page">
        <div className="connect-prompt">
          <FaWallet className="wallet-icon" />
          <h2>Connect Your Wallet</h2>
          <p>Please connect your BSC wallet to access your dashboard</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData.isRegistered) {
    return (
      <div className="dashboard-page">
        <div className="not-registered">
          <h2>You're Not Registered Yet</h2>
          <p>Join LeadFive to start earning rewards</p>
          <Link to="/register" className="register-btn">
            Register Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome Back, User #{userData.userId}</h1>
        <div className="view-tabs">
          <button 
            className={activeView === 'overview' ? 'active' : ''}
            onClick={() => setActiveView('overview')}
          >
            Overview
          </button>
          <button 
            className={activeView === 'network' ? 'active' : ''}
            onClick={() => setActiveView('network')}
          >
            Network
          </button>
          <button 
            className={activeView === 'earnings' ? 'active' : ''}
            onClick={() => setActiveView('earnings')}
          >
            Earnings
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {renderContent()}
      </div>

      {/* Chatbot Toggle Button */}
      <button 
        className={`chatbot-toggle ${isChatbotOpen ? 'active' : ''}`}
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
      >
        <FaRobot />
      </button>

      {/* Unified Chatbot */}
      <UnifiedChatbot 
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
