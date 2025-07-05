import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedWalletConnect from '../components/unified/UnifiedWalletConnect';
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
  validateAccount,
  formatAccountForDisplay,
  generateAccountCode,
} from '../utils/contractErrorHandler';
import QRCode from 'qrcode';
import './Referrals_Enhanced.css';

const AdvancedReferrals = ({
  account,
  contractInstance,
  onConnect,
  onDisconnect,
}) => {
  const navigate = useNavigate();
  const qrCodeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [teamStats, setTeamStats] = useState(DEMO_DATA.teamStats);
  const [userReferralCode, setUserReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [referralType, setReferralType] = useState('wallet');
  const [customReferralCode, setCustomReferralCode] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [userEarnings, setUserEarnings] = useState({
    totalEarnings: 0,
    dailyEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
  });

  const loadUserData = async () => {
    const validAccount = validateAccount(account);
    if (!validAccount) {
      console.log('No valid account connected');
      return;
    }

    setIsLoading(true);

    try {
      // Always generate a basic referral link using account
      const accountCode = generateAccountCode(account);

      if (!contractInstance) {
        console.log('Contract instance not available, using fallback data');
        setTeamStats(DEMO_DATA.teamStats);
        updateReferralLink(accountCode);
        return;
      }

      // Create safe contract calls
      const safeContract = createSafeContractCalls(
        contractInstance,
        null,
        validAccount
      );

      // Get user info with error handling
      const userInfoResult = await safeContract.getUserInfo();

      if (userInfoResult.success && userInfoResult.data.isRegistered) {
        const userInfo = userInfoResult.data;

        // Use the user's registered referral code if available
        const referralCode = userInfo.referralCode || accountCode;
        setUserReferralCode(referralCode);

        const stats = {
          directReferrals: parseInt(userInfo.directReferrals.toString()),
          totalTeam: parseInt(userInfo.teamSize.toString()),
          activeMembers: parseInt(userInfo.teamSize.toString()), // Assuming all are active
          totalEarnings: parseFloat(userInfo.totalEarnings.toString()) / 1e18,
        };
        setTeamStats(stats);

        // Generate referral link with user's actual referral code
        updateReferralLink(referralCode);
      } else {
        // User not registered or contract call failed - use account-based code
        console.log(
          'User not registered or contract call failed, using account-based referral code'
        );
        updateReferralLink(accountCode);

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
      // Always fall back to account-based referral code
      const accountCode = generateAccountCode(account);
      setTeamStats(DEMO_DATA.teamStats);
      updateReferralLink(accountCode);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const validAccount = validateAccount(account);
    if (validAccount) {
      loadUserData();
    } else {
      // Generate a basic referral link even without account for demo
      const demoCode = account ? generateAccountCode(account) : 'DEMO123';
      const demoLink = `${window.location.origin}/register?ref=${demoCode}`;
      setReferralLink(demoLink);
      generateQRCode(demoLink);
      console.log('Generated demo referral link:', demoLink);
    }
    
    // Ensure we always have a referral link, even if above fails
    if (!referralLink && window.location.origin) {
      const fallbackCode = account ? generateAccountCode(account) : 'LEADFIVE2024';
      const fallbackLink = `${window.location.origin}/register?ref=${fallbackCode}`;
      setReferralLink(fallbackLink);
      generateQRCode(fallbackLink);
      console.log('Generated fallback referral link:', fallbackLink);
    }
  }, [account, contractInstance]);

  const updateReferralLink = code => {
    const baseUrl = window.location.origin;
    const fullReferralCode = code || (account ? generateAccountCode(account) : 'LEADFIVE2024');
    const link = `${baseUrl}/register?ref=${fullReferralCode}`;
    setReferralLink(link);
    setUserReferralCode(fullReferralCode);
    generateQRCode(link);
    console.log('Updated referral link:', link);
  };

  const generateQRCode = async link => {
    try {
      if (!link) {
        console.log('No link provided for QR code generation');
        return;
      }

      const qrDataUrl = await QRCode.toDataURL(link, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 2,
        color: {
          dark: '#1A1A2E', // Dark space color to match brand
          light: '#FFFFFF', // White background for QR readability
        },
        width: 200,
      });

      setQrCodeDataUrl(qrDataUrl);
      console.log('QR Code generated successfully');
    } catch (error) {
      console.error('Error generating QR code:', error);
      setQrCodeDataUrl('');
    }
  };

  const handleReferralTypeChange = type => {
    setReferralType(type);
    if (type === 'wallet') {
      updateReferralLink(validateAccount(account) || 'DEFAULT');
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
    const linkToCopy = referralLink || `${window.location.origin}/register?ref=${userReferralCode || 'LEADFIVE2024'}`;
    navigator.clipboard.writeText(linkToCopy).then(() => {
      setCopyMessage('✅ Copied to clipboard!');
      console.log('Copied to clipboard:', linkToCopy);
      setTimeout(() => setCopyMessage(''), 3000);
    }).catch((err) => {
      console.error('Failed to copy:', err);
      setCopyMessage('❌ Copy failed - try again');
      setTimeout(() => setCopyMessage(''), 3000);
    });
  };

  const shareReferralLink = () => {
    const linkToShare = referralLink || `${window.location.origin}/register?ref=${userReferralCode || 'LEADFIVE2024'}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join LeadFive DApp',
        text: 'Join me on LeadFive - Advanced DeFi Platform. Use my referral link to get started!',
        url: linkToShare,
      }).catch((err) => {
        console.error('Share failed:', err);
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  return (
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
                    {generateAccountCode(account).substring(0, 2).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <h3>Connected Wallet</h3>
                    <p>{formatAccountForDisplay(account)}</p>
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

                <div className="referral-content">
                  <div className="referral-link-section">
                    <div className="referral-input-group">
                      <input
                        type="text"
                        value={referralLink || `${window.location.origin}/register?ref=${userReferralCode || 'Loading...'}`}
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

                  {/* QR Code Section */}
                  <div className="qr-code-section">
                    <h4>📱 QR Code</h4>
                    <div className="qr-code-container">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="Referral QR Code"
                          className="qr-code-image"
                          onError={() => {
                            console.log('QR code image failed to load');
                            setQrCodeDataUrl('');
                          }}
                        />
                      ) : (
                        <div className="qr-code-placeholder">
                          <div className="qr-placeholder-icon">📱</div>
                          <p>
                            {referralLink
                              ? 'Generating QR Code...'
                              : 'QR Code will appear here'}
                          </p>
                          {referralLink && (
                            <button
                              onClick={() => generateQRCode(referralLink)}
                              className="retry-qr-btn"
                              style={{
                                marginTop: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(0, 212, 255, 0.2)',
                                border: '1px solid rgba(0, 212, 255, 0.5)',
                                borderRadius: '8px',
                                color: '#00d4ff',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                              }}
                            >
                              🔄 Retry
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="qr-code-description">
                      Share this QR code for easy mobile access to your referral
                      link
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Visualization - REMOVED: Using dedicated pages (Dashboard & Genealogy) */}
            {/* Focus on referral-specific analytics instead */}

            {/* Enhanced Referral Performance Section */}
            <div className="referral-performance-section">
              <div className="glass-card performance-card">
                <h3>🎯 Referral Performance</h3>
                <div className="performance-grid">
                  <div className="performance-stat">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                      <span className="stat-value">
                        {teamStats.directReferrals || 0}
                      </span>
                      <span className="stat-label">Direct Referrals</span>
                    </div>
                  </div>
                  <div className="performance-stat">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                      <span className="stat-value">
                        ${(userEarnings.totalEarnings || 0).toFixed(2)}
                      </span>
                      <span className="stat-label">Total Earnings</span>
                    </div>
                  </div>
                  <div className="performance-stat">
                    <div className="stat-icon">📈</div>
                    <div className="stat-info">
                      <span className="stat-value">
                        {((teamStats.directReferrals || 0) * 40).toFixed(0)}%
                      </span>
                      <span className="stat-label">Commission Rate</span>
                    </div>
                  </div>
                  <div className="performance-stat">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-info">
                      <span className="stat-value">
                        {teamStats.activeMembers || 0}
                      </span>
                      <span className="stat-label">Active Team</span>
                    </div>
                  </div>
                </div>
                <div className="performance-actions">
                  <button
                    className="action-btn primary"
                    onClick={() => navigate('/genealogy')}
                  >
                    🌳 View Full Tree Structure
                  </button>
                  <button
                    className="action-btn secondary"
                    onClick={() => navigate('/dashboard')}
                  >
                    📊 View Dashboard Analytics
                  </button>
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
                <span style={{ marginLeft: '1rem' }}>Loading team data...</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdvancedReferrals;
