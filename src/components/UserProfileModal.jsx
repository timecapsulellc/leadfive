import React, { useState, useEffect } from 'react';
import Web3Service from '../services/Web3Service';
import './UserProfileModal.css';

const UserProfileModal = ({ user, isOpen, onClose }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && user) {
      loadUserDetails();
    }
  }, [isOpen, user]);

  const loadUserDetails = async () => {
    if (!user?.address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [earnings, matrixData] = await Promise.all([
        Web3Service.getUserEarnings(user.address),
        Web3Service.getMatrixData(user.address)
      ]);
      
      setUserDetails({
        ...user,
        earnings,
        matrixData,
        performance: calculatePerformance(earnings, matrixData)
      });
    } catch (err) {
      setError('Failed to load user details');
      console.error('Error loading user details:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePerformance = (earnings, matrixData) => {
    const totalEarned = earnings.totalEarned || 0;
    const totalInvested = earnings.totalInvested || 0;
    const roi = totalInvested > 0 ? ((totalEarned / totalInvested) * 100) : 0;
    
    return {
      roi: roi.toFixed(2),
      efficiency: matrixData.teamSize > 0 ? (totalEarned / matrixData.teamSize).toFixed(2) : '0',
      growthRate: matrixData.directReferrals > 0 ? ((matrixData.teamSize / matrixData.directReferrals) * 100).toFixed(1) : '0'
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="user-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="user-avatar-large">
            <div className="avatar-circle-large">
              {user.name === 'YOU' ? 'YOU' : user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="user-status-large">
              <span className={`status-dot-large ${userDetails?.earnings?.isCapped ? 'capped' : 'active'}`}></span>
            </div>
          </div>
          <div className="user-header-info">
            <h2 className="user-name">{user.name}</h2>
            <p className="user-address">{user.address}</p>
            {userDetails?.earnings?.isCapped && (
              <span className="capped-badge">CAPPED</span>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('earnings')}
          >
            Earnings
          </button>
          <button 
            className={`tab-btn ${activeTab === 'network' ? 'active' : ''}`}
            onClick={() => setActiveTab('network')}
          >
            Network
          </button>
          <button 
            className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading user details...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={loadUserDetails}>Retry</button>
            </div>
          ) : userDetails ? (
            <>
              {activeTab === 'overview' && (
                <div className="overview-tab">
                  <div className="stats-grid">
                    <div className="stat-card">
                      <h4>Total Earned</h4>
                      <p className="stat-value earnings">{formatCurrency(userDetails.earnings.totalEarned)}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Withdrawable</h4>
                      <p className="stat-value withdrawable">{formatCurrency(userDetails.earnings.withdrawableAmount)}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Total Invested</h4>
                      <p className="stat-value">{formatCurrency(userDetails.earnings.totalInvested)}</p>
                    </div>
                    <div className="stat-card">
                      <h4>ROI</h4>
                      <p className="stat-value roi">{userDetails.performance.roi}%</p>
                    </div>
                    <div className="stat-card">
                      <h4>Direct Referrals</h4>
                      <p className="stat-value">{userDetails.matrixData.directReferrals}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Team Size</h4>
                      <p className="stat-value">{userDetails.matrixData.teamSize}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'earnings' && (
                <div className="earnings-tab">
                  <div className="earnings-breakdown">
                    <div className="earning-item">
                      <span className="earning-label">Sponsor Commission</span>
                      <span className="earning-value">{formatCurrency(userDetails.earnings.sponsorCommission)}</span>
                    </div>
                    <div className="earning-item">
                      <span className="earning-label">Level Bonus</span>
                      <span className="earning-value">{formatCurrency(userDetails.earnings.levelBonus)}</span>
                    </div>
                    <div className="earning-item">
                      <span className="earning-label">Global Upline Bonus</span>
                      <span className="earning-value">{formatCurrency(userDetails.earnings.globalUplineBonus)}</span>
                    </div>
                    <div className="earning-item">
                      <span className="earning-label">Leader Bonus</span>
                      <span className="earning-value">{formatCurrency(userDetails.earnings.leaderBonus)}</span>
                    </div>
                    <div className="earning-item">
                      <span className="earning-label">Global Help Pool</span>
                      <span className="earning-value">{formatCurrency(userDetails.earnings.globalHelpPool)}</span>
                    </div>
                    <div className="earning-item total">
                      <span className="earning-label">Total Earned</span>
                      <span className="earning-value">{formatCurrency(userDetails.earnings.totalEarned)}</span>
                    </div>
                  </div>
                  
                  {userDetails.earnings.isCapped && (
                    <div className="cap-info">
                      <h4>Cap Information</h4>
                      <p>This user has reached their earning cap of {formatCurrency(userDetails.earnings.capAmount)}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'network' && (
                <div className="network-tab">
                  <div className="network-info">
                    <div className="matrix-position">
                      <h4>Matrix Position</h4>
                      <p>#{userDetails.matrixData.position}</p>
                    </div>
                    
                    <div className="network-structure">
                      <h4>Network Structure</h4>
                      <div className="structure-item">
                        <span>Direct Referrals</span>
                        <span>{userDetails.matrixData.directReferrals}</span>
                      </div>
                      <div className="structure-item">
                        <span>Total Team Size</span>
                        <span>{userDetails.matrixData.teamSize}</span>
                      </div>
                      <div className="structure-item">
                        <span>Growth Multiplier</span>
                        <span>{userDetails.performance.growthRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="performance-tab">
                  <div className="performance-metrics">
                    <div className="metric-card">
                      <h4>Return on Investment</h4>
                      <div className="metric-value">{userDetails.performance.roi}%</div>
                      <div className="metric-description">
                        Earnings vs Investment ratio
                      </div>
                    </div>
                    
                    <div className="metric-card">
                      <h4>Efficiency Score</h4>
                      <div className="metric-value">${userDetails.performance.efficiency}</div>
                      <div className="metric-description">
                        Earnings per team member
                      </div>
                    </div>
                    
                    <div className="metric-card">
                      <h4>Growth Rate</h4>
                      <div className="metric-value">{userDetails.performance.growthRate}%</div>
                      <div className="metric-description">
                        Network expansion efficiency
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
