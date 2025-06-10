import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './UltimateDashboard.css';
import './OrphiChain.css';
import UserProfileSection from './UserProfileSection';
import QuickActionsPanel from './QuickActionsPanel';
import AdminControlPanel from './AdminControlPanel';
import OnboardingWizard from './OnboardingWizard';
import OrphiChainLogo from './OrphiChainLogo';
import SimpleGenealogyTree from './SimpleGenealogyTree';
// import GenealogyTreeIntegration from './GenealogyTreeIntegration';
// import { CompensationPlanService } from '../services/CompensationPlanService';
// import { Web3ContractService } from '../services/Web3ContractService';

/**
 * UltimateDashboard - Complete merged dashboard with all features
 * 
 * This component combines all previously developed dashboard features:
 * - 4-card layout (Earnings, Team, Rank, Package)
 * - Action buttons (Withdraw, Upgrade, View Team) 
 * - Contract information
 * - Tabbed sub-dashboards
 * - Real-time updates
 * - Demo mode
 * - Responsive design
 */

const UltimateDashboard = ({ 
  contractAddress = "0x5ab22F4d339B66C1859029d2c2540d8BefCbdED4",
  userAddress = null,
  provider = null,
  demoMode = true,
  theme = 'dark' 
}) => {
  
  // Main dashboard state
  const [dashboardData, setDashboardData] = useState({
    totalEarnings: demoMode ? 1847.32 : 0.00,
    teamSize: demoMode ? 47 : 0,
    rank: demoMode ? "Silver Star" : "None",
    package: demoMode ? "$100 Package" : "None",
    isConnected: !!userAddress || demoMode,
    userAddress: userAddress || (demoMode ? "0xd954...2ac6" : null),
    contractInfo: {
      address: contractAddress,
      network: "BSC Mainnet",
      status: "Live"
    }
  });

  const [activeSubTab, setActiveSubTab] = useState('compensation');
  const [notifications, setNotifications] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfile, setShowProfile] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    level: 'Diamond',
    packageTier: 1,
    avatar: 'JD',
    id: '12345'
  });

  // Add notification helper
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 4000);
  };

  // Initialize Web3 and load real data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Initialize Web3 service
        const web3Initialized = await web3Service.initialize();
        setWeb3Connected(web3Initialized);

        // Load compensation plan data
        const realData = CompensationPlanService.calculateDashboardData(100, 47, 5);
        setDashboardData({
          totalEarnings: realData.earnings.total,
          teamSize: realData.team.size,
          rank: realData.rank.current,
          package: `$${realData.package.amount} ${realData.package.name}`,
          isConnected: web3Initialized || demoMode,
          userAddress: userAddress || (demoMode ? "0xd954...2ac6" : null),
          contractInfo: {
            address: contractAddress,
            network: "BSC Mainnet",
            status: "Live"
          }
        });

        // Load compensation breakdown
        const breakdown = CompensationPlanService.calculateCompensationBreakdown(realData.package.amount);
        setCompensationBreakdown(breakdown);

        // Load genealogy tree data
        const treeData = CompensationPlanService.generateGenealogyTreeData(realData.package.amount, 5);
        setGenealogyData(treeData);

        // Set real-time data
        setRealTimeData(realData);

        if (web3Initialized) {
          addNotification("Web3 initialized successfully", "success");
        }
      } catch (error) {
        console.error('Failed to initialize dashboard data:', error);
        // Fallback to demo data
        const fallbackData = CompensationPlanService.calculateDashboardData(100, 47, 5);
        setDashboardData({
          totalEarnings: fallbackData.earnings.total,
          teamSize: fallbackData.team.size,
          rank: fallbackData.rank.current,
          package: `$${fallbackData.package.amount} ${fallbackData.package.name}`,
          isConnected: demoMode,
          userAddress: demoMode ? "0xd954...2ac6" : null,
          contractInfo: {
            address: contractAddress,
            network: "BSC Mainnet",
            status: "Live"
          }
        });
        addNotification("Using demo data", "info");
      }
    };

    initializeData();
  }, [contractAddress, userAddress, demoMode]);

  // Real-time data updates
  useEffect(() => {
    if (!realTimeData) return;
    
    const interval = setInterval(() => {
      // Simulate small earnings increases
      setDashboardData(prev => ({
        ...prev,
        totalEarnings: prev.totalEarnings + (Math.random() * 0.05),
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [realTimeData]);

  // Connect wallet handler
  const connectWallet = async () => {
    try {
      const result = await web3Service.connectWallet();
      if (result.success) {
        setWeb3Connected(true);
        
        // Load user data from contract
        const userInfo = await web3Service.getUserInfo();
        if (userInfo) {
          const realData = CompensationPlanService.calculateDashboardData(
            userInfo.packageAmount, 
            userInfo.teamSize, 
            userInfo.directReferrals
          );
          
          setDashboardData(prev => ({
            ...prev,
            totalEarnings: realData.earnings.total,
            teamSize: realData.team.size,
            rank: realData.rank.current,
            package: `$${realData.package.amount} ${realData.package.name}`,
            isConnected: true,
            userAddress: result.address
          }));
          
          addNotification("Wallet connected successfully!", "success");
        }
      } else {
        addNotification(`Failed to connect wallet: ${result.error}`, "error");
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      addNotification("Wallet connection failed", "error");
    }
  };

  // Action handlers
  const handleWithdraw = () => {
    if (demoMode) {
      addNotification("Demo: Withdrawal request submitted", "success");
    } else {
      addNotification("Connect wallet to withdraw", "warning");
    }
  };

  const handleUpgrade = () => {
    if (demoMode) {
      addNotification("Demo: Package upgrade initiated", "info");
    } else {
      addNotification("Connect wallet to upgrade", "warning");
    }
  };

  const handleViewTeam = () => {
    setActiveSubTab('team');
    addNotification("Switched to Team Analytics", "info");
  };

  const handleDisconnect = () => {
    if (demoMode) {
      addNotification("Demo mode - cannot disconnect", "info");
    } else {
      // Handle actual disconnect
      addNotification("Wallet disconnected", "info");
    }
  };

  // New handlers for integrated components
  const handleQuickAction = (actionType, data) => {
    switch (actionType) {
      case 'claim':
        addNotification(`Claimed $${data.amount} successfully!`, 'success');
        break;
      case 'invite':
        addNotification('Referral link shared!', 'success');
        break;
      case 'upgrade':
        addNotification('Upgrade requirements displayed', 'info');
        break;
      case 'genealogy':
        setActiveSubTab('matrix');
        addNotification('Switched to Matrix View', 'info');
        break;
      case 'analytics':
        setActiveSubTab('team');
        addNotification('Switched to Team Analytics', 'info');
        break;
      case 'history':
        setActiveSubTab('history');
        addNotification('Transaction history downloaded', 'success');
        break;
      default:
        addNotification(`Action ${actionType} completed`, 'info');
    }
  };

  const handleProfileUpdate = (newProfileData) => {
    setUserProfile(newProfileData);
    addNotification('Profile updated successfully!', 'success');
  };

  const handleSystemAction = (controlId, action) => {
    addNotification(`Admin: ${action} executed for ${controlId}`, 'success');
  };

  const handleOnboardingComplete = (data) => {
    setUserProfile({
      ...userProfile,
      name: data.userInfo.name,
      packageTier: data.package.tier
    });
    setDashboardData({
      ...dashboardData,
      package: `$${data.package.price} Package`,
      isConnected: true
    });
    setShowOnboarding(false);
    addNotification(`Welcome ${data.userInfo.name}! Registration completed.`, 'success');
  };

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
    addNotification(`Admin mode ${!isAdminMode ? 'enabled' : 'disabled'}`, 'info');
  };

  return (
    <div className={`ultimate-dashboard theme-${theme}`}>
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="header-logo">
            <OrphiChainLogo size="small" variant="orbital" autoRotate={true} />
          </div>
          <h1 className="dashboard-title">
            OrphiChain Dashboard
          </h1>
          {demoMode && <span className="demo-badge">Demo</span>}
        </div>
        <div className="header-right">
          <button 
            className={`admin-toggle ${isAdminMode ? 'active' : ''}`}
            onClick={toggleAdminMode}
            title="Toggle Admin Mode"
          >
            ⚙️ Admin
          </button>
          <button 
            className="new-user-btn"
            onClick={() => setShowOnboarding(true)}
            title="New User Registration"
          >
            👤 Register
          </button>
          <span className="wallet-address">
            {dashboardData?.userAddress || "Not Connected"}
          </span>
          <button 
            className="disconnect-btn"
            onClick={handleDisconnect}
            disabled={!dashboardData.isConnected}
          >
            Disconnect
          </button>
        </div>
      </header>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification ${notification.type}`}
            >
              {notification.message}
              <span className="notification-time">{notification.timestamp}</span>
            </div>
          ))}
        </div>
      )}

      {/* User Profile Section */}
      {showProfile && (
        <UserProfileSection 
          userInfo={userProfile}
          onProfileUpdate={handleProfileUpdate}
        />
      )}

      {/* Admin Control Panel */}
      {isAdminMode && (
        <AdminControlPanel 
          onSystemAction={handleSystemAction}
          userInfo={userProfile}
        />
      )}

      {/* Quick Actions Panel */}
      <QuickActionsPanel 
        userInfo={userProfile}
        onAction={handleQuickAction}
      />

      {/* Main Cards Grid */}
      <div className="dashboard-cards">
        {/* Total Earnings Card */}
        <div className="dashboard-card earnings-card">
          <div className="card-header">
            <span className="card-icon">💰</span>
            <h3>Total Earnings</h3>
          </div>
          <div className="card-content">
            <div className="card-value">
              ${dashboardData?.totalEarnings?.toFixed(2) || '0.00'}
            </div>
            <div className="card-subtitle">
              {dashboardData?.isConnected ? "Real-time earnings" : "Start building your team"}
            </div>
          </div>
        </div>

        {/* Team Size Card */}
        <div className="dashboard-card team-card">
          <div className="card-header">
            <span className="card-icon">👥</span>
            <h3>Team Size</h3>
          </div>
          <div className="card-content">
            <div className="card-value">
              {dashboardData.teamSize}
            </div>
            <div className="card-subtitle">
              {dashboardData.teamSize > 0 ? "Active team members" : "Start building your team"}
            </div>
          </div>
        </div>

        {/* Rank Card */}
        <div className="dashboard-card rank-card">
          <div className="card-header">
            <span className="card-icon">🏆</span>
            <h3>Rank</h3>
          </div>
          <div className="card-content">
            <div className="card-value rank-value">
              {dashboardData.rank}
            </div>
            <div className="card-subtitle">
              {dashboardData.rank !== "None" ? "Current achievement" : "Register to start earning"}
            </div>
          </div>
        </div>

        {/* Package Card */}
        <div className="dashboard-card package-card">
          <div className="card-header">
            <span className="card-icon">📦</span>
            <h3>Package</h3>
          </div>
          <div className="card-content">
            <div className="card-value package-value">
              {dashboardData.package}
            </div>
            <div className="card-subtitle">
              {dashboardData.package !== "None" ? "Active investment" : "Choose your package"}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="action-btn withdraw-btn"
          onClick={handleWithdraw}
          disabled={!dashboardData.isConnected}
        >
          💸 Withdraw Earnings
        </button>
        <button 
          className="action-btn upgrade-btn"
          onClick={handleUpgrade}
          disabled={!dashboardData.isConnected}
        >
          ⬆️ Upgrade Package
        </button>
        <button 
          className="action-btn team-btn"
          onClick={handleViewTeam}
        >
          👥 View Team
        </button>
      </div>

      {/* Contract Information */}
      <div className="contract-info">
        <h4>📋 Contract Information</h4>
        <div className="contract-details">
          <div className="contract-item">
            <span className="label">Contract:</span>
            <span className="value">{dashboardData.contractInfo.address}</span>
          </div>
          <div className="contract-item">
            <span className="label">Network:</span>
            <span className="value">{dashboardData.contractInfo.network}</span>
          </div>
          <div className="contract-item">
            <span className="label">Status:</span>
            <span className="value status-live">{dashboardData.contractInfo.status}</span>
          </div>
        </div>
      </div>

      {/* Sub-Dashboard Tabs */}
      <div className="sub-dashboard">
        <div className="sub-tabs">
          {[
            { id: 'compensation', label: 'Compensation', icon: '💰' },
            { id: 'team', label: 'Team Analytics', icon: '📊' },
            { id: 'matrix', label: 'Matrix View', icon: '🌐' },
            { id: 'history', label: 'History', icon: '📋' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`sub-tab ${activeSubTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveSubTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="sub-content">
          {activeSubTab === 'compensation' && (
            <div className="compensation-view">
              <h4>💰 Compensation Breakdown</h4>
              <div className="compensation-grid">
                <div className="comp-item">
                  <span className="comp-label">Direct Commissions:</span>
                  <span className="comp-value">$847.32</span>
                </div>
                <div className="comp-item">
                  <span className="comp-label">Level Bonuses:</span>
                  <span className="comp-value">$650.00</span>
                </div>
                <div className="comp-item">
                  <span className="comp-label">Matrix Bonuses:</span>
                  <span className="comp-value">$250.00</span>
                </div>
                <div className="comp-item">
                  <span className="comp-label">Leadership Pool:</span>
                  <span className="comp-value">$100.00</span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'team' && (
            <div className="team-view">
              <h4>📊 Team Analytics</h4>
              <div className="team-stats">
                <div className="team-stat">
                  <span className="stat-label">Total Volume:</span>
                  <span className="stat-value">$15,780</span>
                </div>
                <div className="team-stat">
                  <span className="stat-label">Active Members:</span>
                  <span className="stat-value">32/47</span>
                </div>
                <div className="team-stat">
                  <span className="stat-label">This Week:</span>
                  <span className="stat-value">+3 new</span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'matrix' && (
            <div className="matrix-view">
              <SimpleGenealogyTree />
            </div>
          )}

          {activeSubTab === 'history' && (
            <div className="history-view">
              <h4>📋 Transaction History</h4>
              <div className="history-list">
                <div className="history-item">
                  <span className="history-type">Commission</span>
                  <span className="history-amount">+$47.32</span>
                  <span className="history-date">2 hours ago</span>
                </div>
                <div className="history-item">
                  <span className="history-type">Level Bonus</span>
                  <span className="history-amount">+$25.00</span>
                  <span className="history-date">1 day ago</span>
                </div>
                <div className="history-item">
                  <span className="history-type">Matrix Bonus</span>
                  <span className="history-amount">+$12.50</span>
                  <span className="history-date">3 days ago</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard 
          onComplete={handleOnboardingComplete}
          onCancel={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
};

export default UltimateDashboard;
