import React, { useState, useEffect, Suspense } from 'react';
import { ethers } from 'ethers';
import ErrorBoundary from './ErrorBoundary';

// Import all dashboard components
import CompensationDashboard from './compensation/CompensationDashboard';
import OrphiDashboard from '../OrphiDashboard';
import MatrixDashboard from '../MatrixDashboard';
import TeamAnalyticsDashboard from '../TeamAnalyticsDashboard';

/**
 * DashboardController - Unified Dashboard Management System
 * 
 * This component integrates all dashboard components into a cohesive
 * modular system with:
 * - Tabbed navigation between different dashboard views
 * - Consistent data flow and state management
 * - Responsive design that adapts to different screen sizes
 * - Error boundaries for resilient component loading
 * - Demo mode with realistic sample data
 */

const DashboardController = ({ 
  contractAddress,
  provider,
  userAddress,
  demoMode = false,
  theme = 'dark',
  initialTab = 'compensation',
  deviceInfo
}) => {
  // Use props instead of Web3Context
  const isConnected = !!userAddress || demoMode;
  const account = userAddress || '0x0000000000000000000000000000000000000000';

  // Dashboard state management
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    user: account,
    contractAddress: contractAddress || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    mockUsdtAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    adminAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    provider: provider,
    orphiContract: null,
    theme: theme,
    demoMode: demoMode,
    lastUpdate: new Date().toISOString(),
    globalStats: { 
      totalUsers: '12458', 
      totalValueLockedUSDT: '4675890', 
      totalRewardsDistributedUSDT: '2847392', 
      activePools: '6' 
    },
    userInfo: { 
      id: '1', 
      referrer: '0x0000000000000000000000000000000000000000', 
      totalDepositsUSDT: '500', 
      totalRewardsEarnedUSDT: '150', 
      teamSize: '25', 
      lastActivityTimestamp: new Date().toISOString(), 
      isActive: true 
    },
    poolBalances: ['120000', '150000', '90000', '30000', '5000', '2000']
  });
  const [notifications, setNotifications] = useState([]);

  // Screen size detection for responsive behavior
  const [screenSize, setScreenSize] = useState('desktop');

  // Dashboard configuration
  const dashboardTabs = [
    {
      id: 'compensation',
      label: 'Compensation',
      icon: '💰',
      component: CompensationDashboard,
      description: 'Earnings, bonuses, and compensation plan overview'
    },
    {
      id: 'system',
      label: 'System Overview',
      icon: '📊',
      component: OrphiDashboard,
      description: 'Platform metrics, network status, and real-time data'
    },
    {
      id: 'matrix',
      label: 'Matrix Network',
      icon: '🌐',
      component: MatrixDashboard,
      description: 'Network visualization and matrix structure'
    },
    {
      id: 'analytics',
      label: 'Team Analytics',
      icon: '📈',
      component: TeamAnalyticsDashboard,
      description: 'Team performance, growth metrics, and insights'
    }
  ];

  // Responsive design handling
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize with demo data on mount
  useEffect(() => {
    if (demoMode) {
      addNotification("Running in Demo Mode with sample data", "info");
    }
  }, [demoMode]);

  // Notification system
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
    }, 5000);
  };

  // Handle tab switching with smooth transitions
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    addNotification(`Switched to ${dashboardTabs.find(t => t.id === tabId)?.label}`, 'info');
  };

  // Get current active component
  const getCurrentComponent = () => {
    const tab = dashboardTabs.find(t => t.id === activeTab);
    return tab ? tab.component : CompensationDashboard;
  };

  const ActiveComponent = getCurrentComponent();
  const activeTabDetails = dashboardTabs.find(t => t.id === activeTab);

  // Derive deviceInfo from screenSize if not provided
  const finalDeviceInfo = deviceInfo || {
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
    screenSizeType: screenSize
  };

  // Define default props that might be missing for some components
  const defaultTeamData = {
    totalMembers: 25,
    totalVolume: 15780,
    levels: {
      1: { count: 10, activeCount: 8, volume: 1000, earnings: 200 },
      2: { count: 20, activeCount: 15, volume: 2000, earnings: 400 },
      3: { count: 30, activeCount: 25, volume: 3000, earnings: 600 }
    }
  };
  const defaultSelectedPackage = 'Premium';

  return (
    <div className={`dashboard-controller dashboard-theme-${dashboardData.theme}`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="dashboard-loading-overlay">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <p>Loading Dashboard...</p>
          </div>
        </div>
      )}

      {/* Dashboard header with navigation */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">🚀</span>
            OrphiChain Dashboard Suite
          </h1>
          {demoMode && (
            <span className="demo-badge">Demo Mode</span>
          )}
        </div>

        {/* Tab navigation */}
        <div 
          className={`tab-navigation ${screenSize}`}
          role="tablist"
          aria-label="Dashboard sections"
        >
          {dashboardTabs.map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
              title={tab.description}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              {screenSize !== 'mobile' && (
                <span className="tab-label">{tab.label}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div 
          className="notifications-container"
          aria-live="polite"
          aria-atomic="true"
        >
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification notification-${notification.type}`}
            >
              <span className="notification-icon">
                {notification.type === 'error' && '❌'}
                {notification.type === 'success' && '✅'}
                {notification.type === 'info' && 'ℹ️'}
                {notification.type === 'warning' && '⚠️'}
              </span>
              <span className="notification-message">{notification.message}</span>
              <span className="notification-time">{notification.timestamp}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main dashboard content */}
      <div 
        className="dashboard-content"
        role="tabpanel"
        id={`tabpanel-${activeTabDetails?.id}`}
        aria-labelledby={`tab-${activeTabDetails?.id}`}
      >
        <ErrorBoundary 
          fallback={<DashboardErrorFallback />}
        >
          <Suspense fallback={<DashboardLoadingFallback />}>
            <ActiveComponent
              contractAddress={dashboardData.contractAddress}
              provider={provider}
              userAddress={account}
              demoMode={demoMode}
              theme={dashboardData.theme}
              sharedData={dashboardData}
              onNotification={addNotification}
              onAlert={addNotification}
              screenSize={screenSize}
              deviceInfo={finalDeviceInfo}
              teamData={defaultTeamData}
              selectedPackage={defaultSelectedPackage}
              compensationData={{
                sponsorCommissions: 500,
                levelBonuses: { 1: 150, 2: 250, 3: 300 },
                uplineBonuses: 120,
                leaderBonuses: 80,
                globalHelpPool: 60,
                totalEarnings: 2847.31,
                earningsCap: 5000,
                isNearCap: false
              }}
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Dashboard footer */}
      <div className="dashboard-footer">
        <div className="footer-info">
          <span>OrphiChain Dashboard v2.0</span>
          <span>•</span>
          <span>
            {dashboardData?.lastUpdate 
              ? `Data updated: ${new Date(dashboardData.lastUpdate).toLocaleTimeString()}` 
              : `Last view refresh: ${new Date().toLocaleTimeString()}`}
          </span>
          {demoMode && (
            <>
              <span>•</span>
              <span className="demo-indicator">Demo Data</span>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        :root {
          --orphi-deep-space: #0a0f1e;
          --orphi-midnight-blue: #10182c;
          --orphi-royal-purple: #2a1a5e;
          --orphi-cyber-blue: #00d4ff;
          --orphi-energy-orange: #ff6b35;
          --orphi-text-primary: #e0e0e0;
          --orphi-text-secondary: #a0a0a0;
          --orphi-error: #ff4d4d;
          --orphi-success: #00ff88;
          --orphi-warning: #ffd700;
        }

        .dashboard-controller {
          min-height: 100vh;
          background: linear-gradient(135deg, 
            var(--orphi-deep-space) 0%, 
            var(--orphi-midnight-blue) 50%, 
            var(--orphi-royal-purple) 100%
          );
          color: var(--orphi-text-primary);
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .dashboard-theme-light {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
          color: #1a202c;
        }

        .dashboard-loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .loading-spinner {
          text-align: center;
          color: white;
        }

        .spinner-ring {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(0, 212, 255, 0.3);
          border-top: 4px solid #00D4FF;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .dashboard-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .dashboard-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .title-icon {
          font-size: 2rem;
        }

        .demo-badge {
          background: linear-gradient(135deg, var(--orphi-energy-orange), #FF8C42);
          color: white;
          padding: 0.4rem 1rem;
          border-radius: 2rem;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tab-navigation {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .tab-navigation.mobile {
          justify-content: flex-start;
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.8rem;
          color: var(--orphi-text-secondary);
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          min-width: 44px;
        }

        .tab-navigation.mobile .tab-button {
          flex-direction: row;
          padding: 0.6rem 0.8rem;
          min-width: 50px;
        }

        .tab-button:hover,
        .tab-button:focus-visible {
          background: rgba(0, 212, 255, 0.1);
          border-color: rgba(0, 212, 255, 0.3);
          transform: translateY(-2px);
          outline: none;
        }

        .tab-button:focus-visible {
          box-shadow: 0 0 0 2px var(--orphi-deep-space), 0 0 0 4px var(--orphi-cyber-blue);
        }

        .tab-button.active {
          background: linear-gradient(135deg, var(--orphi-cyber-blue), var(--orphi-royal-purple));
          border-color: var(--orphi-cyber-blue);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
        }

        .tab-button.active:focus-visible {
          box-shadow: 0 0 0 2px var(--orphi-deep-space), 0 0 0 4px var(--orphi-energy-orange);
        }

        .tab-icon {
          font-size: 1.2rem;
        }

        .tab-label {
          font-weight: 500;
        }

        .notifications-container {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-width: 400px;
        }

        .notification {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 0.8rem;
          border-left: 4px solid var(--orphi-cyber-blue);
          color: white;
          animation: slideIn 0.3s ease;
        }

        .notification-error {
          border-left-color: var(--orphi-error);
        }

        .notification-success {
          border-left-color: var(--orphi-success);
        }

        .notification-warning {
          border-left-color: var(--orphi-warning);
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .notification-icon {
          font-size: 1.2rem;
        }

        .notification-message {
          flex: 1;
          font-weight: 500;
        }

        .notification-time {
          font-size: 0.8rem;
          opacity: 0.7;
          font-family: 'Roboto Mono', monospace;
        }

        .dashboard-content {
          min-height: calc(100vh - 160px);
          position: relative;
        }

        .dashboard-footer {
          background: rgba(0, 0, 0, 0.3);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem 2rem;
          text-align: center;
        }

        .footer-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.9rem;
          color: var(--orphi-text-secondary);
        }

        .demo-indicator {
          color: var(--orphi-energy-orange);
          font-weight: 600;
        }

        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .dashboard-header {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            gap: 1rem;
          }

          .dashboard-title {
            font-size: 1.4rem;
          }

          .tab-navigation {
            width: 100%;
            justify-content: space-around;
          }

          .tab-button {
            flex-direction: column;
            padding: 0.6rem;
            min-width: 60px;
          }

          .notifications-container {
            left: 1rem;
            right: 1rem;
            max-width: none;
          }

          .footer-info {
            font-size: 0.8rem;
          }
        }

        /* Tablet responsive adjustments */
        @media (max-width: 1024px) and (min-width: 769px) {
          .dashboard-header {
            padding: 1.2rem 1.5rem;
          }

          .tab-button {
            padding: 0.7rem 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};

// Error fallback component
const DashboardErrorFallback = () => (
  <div className="dashboard-error-fallback">
    <div className="error-content">
      <h3>⚠️ Dashboard Error</h3>
      <p>Something went wrong loading this dashboard section.</p>
      <button onClick={() => window.location.reload()}>
        🔄 Reload Page
      </button>
    </div>
    <style jsx>{`
      .dashboard-error-fallback {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        background: rgba(244, 67, 54, 0.1);
        border: 1px solid rgba(244, 67, 54, 0.3);
        border-radius: 1rem;
        margin: 2rem;
      }
      .error-content {
        text-align: center;
        color: #ff4d4d;
      }
      .error-content h3 {
        margin-bottom: 1rem;
        font-size: 1.5rem;
      }
      .error-content button {
        margin-top: 1rem;
        padding: 0.8rem 1.5rem;
        background: #ff4d4d;
        color: white;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        font-weight: 500;
      }
    `}</style>
  </div>
);

// Loading fallback component
const DashboardLoadingFallback = () => (
  <div className="dashboard-loading-fallback">
    <div className="loading-content">
      <div className="loading-spinner">
        <div className="spinner-dots">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <p>Loading dashboard component...</p>
    </div>
    <style jsx>{`
      .dashboard-loading-fallback {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        margin: 2rem;
      }
      .loading-content {
        text-align: center;
        color: #a0a0a0;
      }
      .spinner-dots {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        margin-bottom: 1rem;
      }
      .spinner-dots div {
        width: 12px;
        height: 12px;
        background: #00d4ff;
        border-radius: 50%;
        animation: bounce 1.4s ease-in-out infinite both;
      }
      .spinner-dots div:nth-child(1) { animation-delay: -0.32s; }
      .spinner-dots div:nth-child(2) { animation-delay: -0.16s; }
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
    `}</style>
  </div>
);

export default DashboardController;
