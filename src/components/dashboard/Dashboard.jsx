import React, { useState, useEffect } from 'react';
import EarningsOverview from './EarningsOverview';
import MatrixVisualization from './MatrixVisualization';
import TeamGenealogy from './TeamGenealogy';
import WithdrawalPanel from './WithdrawalPanel';
import ReferralManager from './ReferralManager';
import TeamOverview from './TeamOverview';
import AdminDashboard from '../admin/AdminDashboard';
import WalletConnection from '../web3/WalletConnection';
import WelcomeAnimation from '../common/WelcomeAnimation';
import useWallet from '../../hooks/useWallet';
import useContract from '../../hooks/useContract';
import OrphiChainLogo from '../OrphiChainLogo';
import Web3Service from '../../services/Web3Service';
import '../../styles/dashboard.css';
import '../../styles/dashboard-components.css';
import '../../styles/animations.css';
import '../../styles/global.css';

const Dashboard = () => {
  // Web3 wallet and contract hooks
  const wallet = useWallet();
  const contract = useContract();
  
  // State for welcome animation and admin access
  const [showWelcome, setShowWelcome] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check if user has seen welcome animation before
    const hasSeenWelcome = localStorage.getItem('orphi_welcome_seen');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (wallet?.account) {
        try {
          const adminStatus = await Web3Service.isAdmin(wallet.account);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };

    checkAdminStatus();
  }, [wallet?.account]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    localStorage.setItem('orphi_welcome_seen', 'true');
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'matrix', label: '🌳 Matrix', icon: '🌳' },
    { id: 'genealogy', label: '👥 Genealogy', icon: '👥' },
    { id: 'team', label: '🏆 Team Stats', icon: '🏆' },
    { id: 'referrals', label: '🔗 Referrals', icon: '🔗' },
    { id: 'withdraw', label: '💸 Withdraw', icon: '💸' },
    ...(isAdmin ? [{ id: 'admin', label: '🔧 Admin', icon: '🔧' }] : [])
  ];

  if (showWelcome) {
    return <WelcomeAnimation onComplete={handleWelcomeComplete} duration={3000} />;
  }

  return (
    <div className="unified-dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <OrphiChainLogo size="medium" autoRotate backgroundColor="transparent" />
        </div>
        <h1 className="dashboard-title">LeadFive Network</h1>
        {isAdmin && (
          <div className="admin-badge">
            👑 Administrator Access
          </div>
        )}
      </header>

      {/* Wallet Connection Section */}
      <section className="wallet-section">
        <WalletConnection wallet={wallet} />
      </section>

      {/* Tab Navigation */}
      <nav className="dashboard-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Dashboard Content */}
      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="dashboard-grid">
            <EarningsOverview wallet={wallet} contract={contract} />
            <TeamOverview wallet={wallet} contract={contract} />
          </div>
        )}

        {activeTab === 'matrix' && (
          <div className="dashboard-single">
            <MatrixVisualization wallet={wallet} contract={contract} />
          </div>
        )}

        {activeTab === 'genealogy' && (
          <div className="dashboard-single">
            <TeamGenealogy wallet={wallet} contract={contract} />
          </div>
        )}

        {activeTab === 'team' && (
          <div className="dashboard-single">
            <TeamOverview wallet={wallet} contract={contract} />
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="dashboard-single">
            <ReferralManager wallet={wallet} contract={contract} />
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="dashboard-single">
            <WithdrawalPanel wallet={wallet} contract={contract} />
          </div>
        )}

        {activeTab === 'admin' && isAdmin && (
          <div className="dashboard-single">
            <AdminDashboard wallet={wallet} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
