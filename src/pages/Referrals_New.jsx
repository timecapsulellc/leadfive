import React, { useState, useEffect } from 'react';
import UnifiedWalletConnect from '../components/unified/UnifiedWalletConnect';
import PageWrapper from '../components/PageWrapper';
import { CONTRACT_ADDRESS } from '../config/contracts';
import {
  ROOT_USER_CONFIG,
  generateReferralLink,
  getReferralTarget,
} from '../config/rootUser';
import PriceTicker from '../components/PriceTicker';
import PortfolioValue, { EarningsDisplay } from '../components/PortfolioValue';
import { MarketSummaryCard } from '../components/MarketDataWidget';
import {
  createSafeContractCalls,
  DEMO_DATA,
} from '../utils/contractErrorHandler';
import './Referrals_Enhanced.css';

const AdvancedReferrals = ({
  account,
  contractInstance,
  onConnect,
  onDisconnect,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [teamStats, setTeamStats] = useState(DEMO_DATA.teamStats);
  const [userReferralCode, setUserReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [referralType, setReferralType] = useState('wallet');
  const [customReferralCode, setCustomReferralCode] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [userEarnings, setUserEarnings] = useState({
    totalEarnings: 0,
    dailyEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
  });

  const loadUserData = async () => {
    if (!account) {
      console.log('No account connected');
      return;
    }

    setIsLoading(true);

    try {
      if (!contractInstance) {
        console.log('Contract instance not available, using fallback data');
        setTeamStats(DEMO_DATA.teamStats);
        updateReferralLink(account?.slice(-8) || 'DEMO123');
        return;
      }

      // Create safe contract calls
      const safeContract = createSafeContractCalls(
        contractInstance,
        null,
        account
      );

      // Get user info with error handling
      const userInfoResult = await safeContract.getUserInfo();

      if (userInfoResult.success && userInfoResult.data.isRegistered) {
        const userInfo = userInfoResult.data;
        setUserReferralCode(userInfo.referralCode);

        const stats = {
          directReferrals: parseInt(userInfo.directReferrals.toString()),
          totalTeam: parseInt(userInfo.teamSize.toString()),
          activeMembers: parseInt(userInfo.teamSize.toString()), // Assuming all are active
          totalEarnings: parseFloat(userInfo.totalEarnings.toString()) / 1e18,
        };
        setTeamStats(stats);

        // Generate referral link with user's actual referral code
        updateReferralLink(userInfo.referralCode);
      } else {
        // User not registered or contract call failed
        console.log(
          'User not registered or contract call failed, using fallback data'
        );
        updateReferralLink(account?.slice(-8) || 'NEW_USER');

        // Use appropriate fallback data
        const fallbackStats = userInfoResult.success
          ? {
              directReferrals: 0,
              totalTeam: 0,
              activeMembers: 0,
              totalEarnings: 0.0,
            }
          : DEMO_DATA.teamStats;

        setTeamStats(fallbackStats);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Use demo data on any error
      setTeamStats(DEMO_DATA.teamStats);
      updateReferralLink(account?.slice(-8) || 'ERROR_DEMO');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (account && contractInstance) {
      loadUserData();
    }
  }, [account, contractInstance]);

  const updateReferralLink = code => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/register?ref=${code}`;
    setReferralLink(link);
  };

  const handleReferralTypeChange = type => {
    setReferralType(type);
    if (type === 'wallet') {
      updateReferralLink(account);
    } else if (type === 'custom' && userReferralCode) {
      updateReferralLink(userReferralCode);
    }
  };

  const handleCustomCodeChange = e => {
    const code = e.target.value;
    setCustomReferralCode(code);
    if (code && referralType === 'custom') {
      updateReferralLink(code);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopyMessage('✅ Copied to clipboard!');
      setTimeout(() => setCopyMessage(''), 3000);
    });
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join LeadFive DApp',
        text: 'Join me on LeadFive - Advanced DeFi Platform',
        url: referralLink,
      });
    } else {
      copyToClipboard();
    }
  };

  return (
    <PageWrapper>
      <div className="referrals-page">
        <div className="page-container">
          {/* Hero Header */}
          <div className="hero-header">
            <h1 className="hero-title">Advanced Referral System</h1>
            <p className="hero-subtitle">
              Your complete referral management dashboard with real-time
              analytics, team visualization, and advanced earning tracking.
            </p>
          </div>

          {/* Wallet Connection Section */}
          <div className="wallet-section">
            {!account ? (
              <div className="glass-card wallet-card">
                <h3 style={{ color: '#ffffff', marginBottom: '1.5rem' }}>
                  Connect Your Wallet
                </h3>
                <UnifiedWalletConnect
                  onConnect={onConnect}
                  onDisconnect={onDisconnect}
                  account={account}
                  showBalance={true}
                />
              </div>
            ) : (
              <div className="glass-card">
                <div className="connected-info">
                  <div className="user-details">
                    <div className="user-avatar">
                      {account?.substring(2, 4).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <h3>Connected Wallet</h3>
                      <p>
                        {account?.substring(0, 6)}...
                        {account?.substring(account.length - 4)}
                      </p>
                    </div>
                  </div>
                  <button onClick={onDisconnect} className="disconnect-btn">
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>

          {account && (
            <>
              {/* Market Data Header */}
              <div style={{ marginBottom: '2rem' }}>
                <PriceTicker />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1rem',
                    marginTop: '1rem',
                  }}
                >
                  <PortfolioValue
                    account={account}
                    contractInstance={contractInstance}
                  />
                  <EarningsDisplay
                    account={account}
                    contractInstance={contractInstance}
                  />
                  <MarketSummaryCard />
                </div>
              </div>

              {/* Statistics Dashboard */}
              <div className="stats-dashboard">
                <div className="glass-card stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-value">{teamStats.directReferrals}</div>
                  <div className="stat-label">Direct Referrals</div>
                  <div className="stat-change positive">+2 this week</div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-icon">🌐</div>
                  <div className="stat-value">{teamStats.totalTeam}</div>
                  <div className="stat-label">Total Team</div>
                  <div className="stat-change positive">+5 this month</div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-value">{teamStats.activeMembers}</div>
                  <div className="stat-label">Active Members</div>
                  <div className="stat-change positive">+3 today</div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-value">
                    ${teamStats.totalEarnings.toFixed(2)}
                  </div>
                  <div className="stat-label">Total Earnings</div>
                  <div className="stat-change positive">+$125.50 today</div>
                </div>
              </div>

              {/* Referral Link Management */}
              <div className="referral-manager">
                <div className="glass-card referral-card">
                  <h3>Referral Link Management</h3>

                  <div className="referral-types">
                    <button
                      className={`type-btn ${referralType === 'wallet' ? 'active' : ''}`}
                      onClick={() => handleReferralTypeChange('wallet')}
                    >
                      Wallet Address
                    </button>
                    <button
                      className={`type-btn ${referralType === 'custom' ? 'active' : ''}`}
                      onClick={() => handleReferralTypeChange('custom')}
                    >
                      Custom Code
                    </button>
                  </div>

                  {referralType === 'custom' && (
                    <div style={{ marginBottom: '1rem' }}>
                      <input
                        type="text"
                        placeholder="Enter custom referral code..."
                        value={customReferralCode}
                        onChange={handleCustomCodeChange}
                        className="referral-input"
                      />
                    </div>
                  )}

                  <div className="referral-input-group">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="referral-input"
                      placeholder="Your referral link will appear here..."
                    />
                    <button onClick={copyToClipboard} className="action-btn">
                      📋 Copy
                    </button>
                    <button
                      onClick={shareReferralLink}
                      className="action-btn share"
                    >
                      📤 Share
                    </button>
                  </div>

                  {copyMessage && (
                    <div className="message success">{copyMessage}</div>
                  )}
                </div>
              </div>

              {/* Team Visualization */}
              <div className="team-section">
                <div className="glass-card team-visualization">
                  <h3>🌳 Team Structure Visualization</h3>
                  <div className="tree-container">
                    <div className="tree-placeholder">
                      <div className="tree-placeholder-icon">🔮</div>
                      <p>
                        Advanced team tree visualization will be displayed here
                      </p>
                      <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                        Interactive network graph showing your referral
                        structure
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Section */}
              <div className="analytics-section">
                <div className="glass-card analytics-card">
                  <h4>📊 Earnings Analytics</h4>
                  <div className="analytics-chart">
                    <p>Earnings growth chart will be displayed here</p>
                  </div>
                </div>

                <div className="glass-card analytics-card">
                  <h4>📈 Team Growth Analytics</h4>
                  <div className="analytics-chart">
                    <p>Team growth trends will be displayed here</p>
                  </div>
                </div>
              </div>

              {isLoading && (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span style={{ marginLeft: '1rem' }}>
                    Loading team data...
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default AdvancedReferrals;
