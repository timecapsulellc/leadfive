import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import IncomeDashboard from '../components/IncomeDashboard';
import GenealogyTree from '../components/GenealogyTree';
import MatrixView from '../components/MatrixView';
import './Dashboard.css';

export default function Dashboard({ account, provider, signer }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [contract, setContract] = useState(null);
  const [userStats, setUserStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    teamVolume: '0',
    rank: 'Starter'
  });

  useEffect(() => {
    if (signer && account) {
      initContract();
    }
  }, [signer, account]);

  const initContract = async () => {
    try {
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      // Mock contract for demonstration
      const mockContract = {
        getUserStats: async () => ({
          totalReferrals: 12,
          activeReferrals: 10,
          teamVolume: '45230',
          rank: 'Premium Leader'
        })
      };
      setContract(mockContract);
      fetchUserStats(mockContract);
    } catch (error) {
      console.error('Error initializing contract:', error);
    }
  };

  const fetchUserStats = async (contractInstance) => {
    try {
      const stats = await contractInstance.getUserStats(account);
      setUserStats({
        totalReferrals: stats.totalReferrals,
        activeReferrals: stats.activeReferrals,
        teamVolume: stats.teamVolume,
        rank: stats.rank
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'income', label: 'Income & Earnings', icon: '💰' },
    { id: 'genealogy', label: 'Genealogy Tree', icon: '🌳' },
    { id: 'matrix', label: '5x5 Matrix', icon: '⬜' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' }
  ];

  return (
    <div className="dashboard-page">
      <div className="page-background">
        <div className="animated-bg"></div>
        <div className="gradient-overlay"></div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Member Dashboard</h1>
          <div className="user-info">
            <div className="wallet-address">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </div>
            <div className="user-rank">{userStats.rank}</div>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Total Referrals</h3>
              <p>{userStats.totalReferrals}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Active Members</h3>
              <p>{userStats.activeReferrals}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💎</div>
            <div className="stat-info">
              <h3>Team Volume</h3>
              <p>${userStats.teamVolume}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <div className="tab-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-section">
                <h2>Dashboard Overview</h2>
                <p>Welcome to your LeadFive dashboard. Navigate through the tabs to view your earnings, network, and rewards.</p>
                <div className="quick-stats">
                  <div className="quick-stat">
                    <span className="quick-stat-label">Current Package</span>
                    <span className="quick-stat-value">Premium</span>
                  </div>
                  <div className="quick-stat">
                    <span className="quick-stat-label">Member Since</span>
                    <span className="quick-stat-value">Dec 2024</span>
                  </div>
                  <div className="quick-stat">
                    <span className="quick-stat-label">Next Rank</span>
                    <span className="quick-stat-value">Diamond</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'income' && contract && (
              <IncomeDashboard 
                account={account} 
                contract={contract} 
                signer={signer} 
              />
            )}

            {activeTab === 'genealogy' && contract && (
              <GenealogyTree 
                account={account} 
                contract={contract} 
              />
            )}

            {activeTab === 'matrix' && contract && (
              <MatrixView 
                account={account} 
                contract={contract} 
              />
            )}

            {activeTab === 'rewards' && (
              <div className="rewards-section">
                <h2>Rewards & Achievements</h2>
                <div className="rewards-grid">
                  <div className="reward-card">
                    <div className="reward-icon">🏆</div>
                    <h3>Top Recruiter</h3>
                    <p>Achieved 10+ direct referrals</p>
                    <span className="reward-status earned">Earned</span>
                  </div>
                  <div className="reward-card">
                    <div className="reward-icon">💎</div>
                    <h3>Diamond Level</h3>
                    <p>Reach $50,000 team volume</p>
                    <span className="reward-status progress">90% Complete</span>
                  </div>
                  <div className="reward-card">
                    <div className="reward-icon">🚀</div>
                    <h3>Matrix Master</h3>
                    <p>Complete 5 matrix cycles</p>
                    <span className="reward-status locked">Locked</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
