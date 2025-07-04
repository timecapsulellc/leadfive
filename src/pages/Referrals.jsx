import React, { useState, useEffect } from 'react';
import UnifiedWalletConnect from '../components/unified/UnifiedWalletConnect';
import PageWrapper from '../components/PageWrapper';
import { CONTRACT_ADDRESS } from '../config/contracts';
import { ROOT_USER_CONFIG, generateReferralLink, getReferralTarget } from '../config/rootUser';
import PriceTicker from '../components/PriceTicker';
import PortfolioValue, { EarningsDisplay } from '../components/PortfolioValue';
import { MarketSummaryCard } from '../components/MarketDataWidget';
import './Referrals_Enhanced.css';

export default function Referrals({ account, provider, signer, onConnect, onDisconnect, contractInstance }) {
  const [referralLink, setReferralLink] = useState('');
  const [customReferralCode, setCustomReferralCode] = useState('');
  const [referralType, setReferralType] = useState('wallet'); // 'wallet' or 'custom'
  const [teamStats, setTeamStats] = useState({
    directReferrals: 0,
    totalTeam: 0,
    activeMembers: 0,
    totalEarnings: 0
  });
  const [userReferralCode, setUserReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Load user data and generate referral links
  useEffect(() => {
    if (account && contractInstance) {
      loadUserData();
    } else if (account) {
      // Fallback to wallet address
      updateReferralLink(account);
    }
  }, [account, contractInstance]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get user info from contract
      const userInfo = await contractInstance.getUserInfo(account);
      
      if (userInfo.isRegistered) {
        setUserReferralCode(userInfo.referralCode);
        setTeamStats({
          directReferrals: parseInt(userInfo.directReferrals.toString()),
          totalTeam: parseInt(userInfo.teamSize.toString()),
          activeMembers: parseInt(userInfo.teamSize.toString()), // Assuming all are active
          totalEarnings: parseFloat(userInfo.totalEarnings.toString()) / 1e18
        });
        
        // Generate referral link with user's actual referral code
        updateReferralLink(userInfo.referralCode);
      } else {
        // User not registered, use wallet address
        updateReferralLink(account);
        console.log('User not registered yet');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to wallet address
      updateReferralLink(account);
    } finally {
      setLoading(false);
    }
  };

  const updateReferralLink = (referralCode) => {
    const link = generateReferralLink(referralCode);
    setReferralLink(link);
  };

  const handleReferralTypeChange = (type) => {
    setReferralType(type);
    if (type === 'wallet') {
      updateReferralLink(account);
    } else if (type === 'custom' && userReferralCode) {
      updateReferralLink(userReferralCode);
    }
  };

  const handleCustomCodeChange = (e) => {
    const code = e.target.value;
    setCustomReferralCode(code);
    if (code && referralType === 'custom') {
      updateReferralLink(code);
    }
  };

  return (
    <PageWrapper>
      <div className="referrals-page">
        <div className="page-header">
          <h1>🔗 My Introductions</h1>
          <p>Your referral system and community performance statistics.</p>
        </div>

        {/* Wallet Connection */}
        {!account ? (
          <div className="wallet-connect-section">
            <UnifiedWalletConnect 
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              account={account}
              showBalance={true}
            />
          </div>
        ) : (
          <div className="connected-user-info">
            <div className="user-card">
              <div className="user-address">
                <strong>Connected: </strong>
                {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
              </div>
              <button onClick={onDisconnect} className="disconnect-btn">
                Disconnect
              </button>
            </div>
          </div>
        )}

        {/* Real-Time Market Data */}
        <div className="market-data-section">
          <PriceTicker />
          <MarketSummaryCard compact={true} />
        </div>

        {/* Team Statistics */}
        <div className="team-stats-grid">
          <div className="stat-card direct">
            <div className="stat-value">{teamStats.directReferrals}</div>
            <div className="stat-label">Direct Referrals</div>
          </div>
          <div className="stat-card team">
            <div className="stat-value">{teamStats.totalTeam}</div>
            <div className="stat-label">Total Team</div>
          </div>
          <div className="stat-card active">
            <div className="stat-value">{teamStats.activeMembers}</div>
            <div className="stat-label">Active Members</div>
          </div>
          <div className="stat-card earnings">
            <div className="stat-value">
              <EarningsDisplay 
                usdtBalance={teamStats.totalEarnings} 
                bnbBalance={0} 
                showDetailed={false} 
              />
            </div>
            <div className="stat-label">Total Earnings</div>
          </div>
        </div>

        {/* Portfolio Value Display */}
        {account && (
          <div className="portfolio-section">
            <PortfolioValue 
              account={account} 
              provider={provider} 
              refreshInterval={30000}
            />
          </div>
        )}

        {/* Referral System */}
        {account && (
          <div className="referral-section">
            <h3>🔗 Your Referral System</h3>
            
            {/* Referral Type Selection */}
            <div className="referral-type-selection">
              <h4>Choose Referral Type:</h4>
              <div className="type-buttons">
                <button 
                  className={`type-btn ${referralType === 'wallet' ? 'active' : ''}`}
                  onClick={() => handleReferralTypeChange('wallet')}
                >
                  🔐 Wallet Address
                </button>
                <button 
                  className={`type-btn ${referralType === 'custom' ? 'active' : ''}`}
                  onClick={() => handleReferralTypeChange('custom')}
                  disabled={!userReferralCode}
                >
                  🏷️ Custom Code {!userReferralCode && '(Register First)'}
                </button>
              </div>
            </div>

            {/* Custom Code Input */}
            {referralType === 'custom' && (
              <div className="custom-code-section">
                <h4>Your Referral Code:</h4>
                <div className="code-display">
                  <span className="code-value">{userReferralCode || 'Not Available'}</span>
                  {!userReferralCode && (
                    <small>Register with a package to get your custom referral code</small>
                  )}
                </div>
              </div>
            )}

            {/* Generated Referral Link */}
            <div className="referral-link-container">
              <h4>📎 Your Referral Link:</h4>
              <div className="link-input-group">
                <input 
                  type="text" 
                  value={referralLink} 
                  readOnly 
                  className="referral-input"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(referralLink);
                    alert('Referral link copied to clipboard!');
                  }}
                  className="copy-btn"
                >
                  📋 Copy
                </button>
              </div>
            </div>

            {/* Referral Instructions */}
            <div className="referral-instructions">
              <h4>📋 How it Works:</h4>
              <div className="instruction-list">
                <div className="instruction-item">
                  <span className="step">1.</span>
                  <span>Share your referral link with friends and family</span>
                </div>
                <div className="instruction-item">
                  <span className="step">2.</span>
                  <span>They register using your link</span>
                </div>
                <div className="instruction-item">
                  <span className="step">3.</span>
                  <span>You earn 40% direct commission + level bonuses</span>
                </div>
                <div className="instruction-item">
                  <span className="step">4.</span>
                  <span>Build your team and unlock leadership rewards</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Transaction Verification */}
        <div className="transaction-verification">
          <h4>🔍 Verify Your Registration</h4>
          <div className="verification-info">
            <p><strong>Your Transaction:</strong> 0x90457f0c74c26cbbbcd433d21a97568ca0e10e6b2dae04e90dc2a000a672c1e2</p>
            <p><strong>Amount Paid:</strong> 30 USDT (Level 1 Package)</p>
            <p><strong>Status:</strong> {userReferralCode ? '✅ Registration Successful!' : '🔄 Check wallet connection'}</p>
            <a 
              href="https://bscscan.com/tx/0x90457f0c74c26cbbbcd433d21a97568ca0e10e6b2dae04e90dc2a000a672c1e2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="verify-btn"
            >
              🔗 View on BSCScan
            </a>
          </div>
        </div>

        {/* Real Root User Info */}
        <div className="root-user-info">
          <h4>🌟 System Information</h4>
          <div className="system-stats">
            <div className="stat-item">
              <span className="label">Contract:</span>
              <span className="value">{CONTRACT_ADDRESS}</span>
            </div>
            <div className="stat-item">
              <span className="label">Root User:</span>
              <span className="value">{ROOT_USER_CONFIG.address}</span>
            </div>
            <div className="stat-item">
              <span className="label">Root Referral Code:</span>
              <span className="value">{ROOT_USER_CONFIG.referralCode}</span>
            </div>
            <div className="stat-item">
              <span className="label">Your Status:</span>
              <span className="value">{userReferralCode ? 'Registered ✅' : 'Not Registered ❌'}</span>
            </div>
            <div className="stat-item">
              <span className="label">Default Root Link:</span>
              <span className="value">http://localhost:5174/register?ref=K9NBHT</span>
            </div>
            {account && (
              <div className="stat-item">
                <span className="label">Your Wallet:</span>
                <span className="value">{account}</span>
              </div>
            )}
            {loading && (
              <div className="stat-item">
                <span className="label">Status:</span>
                <span className="value">Loading your data... 🔄</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="business-plan-info-standalone">
            <h5>📊 Commission Distribution (Official Business Plan)</h5>
            <p>✅ <strong>Direct Community Bonus:</strong> 40% of package value</p>
            <p>✅ <strong>Level Rewards:</strong> Level 1: 3% | Levels 2-6: 1% | Levels 7-10: 0.5%</p>
            <p>✅ <strong>Global Rewards:</strong> 10% distributed across community</p>
            <p>✅ <strong>Leadership Rewards Pool:</strong> 10% for qualified leaders</p>
            <p>✅ <strong>Community Growth Pool:</strong> 30% weekly distribution</p>
            <br/>
            <p><strong>Earnings Cap:</strong> Maximum 4x initial investment per package</p>
            <p><strong>Collection Rates:</strong> No Direct: 70% | 5+ Direct: 80% | 20+ Direct: 90%</p>
            <br/>
            <h6>💰 Package Values (Real-Time Pricing)</h6>
            <div className="package-pricing">
              <div className="package-item">
                <span className="package-name">Level 1:</span>
                <span className="package-value">30 USDT</span>
                <EarningsDisplay usdtBalance={30} showDetailed={false} />
              </div>
              <div className="package-item">
                <span className="package-name">Level 2:</span>
                <span className="package-value">150 USDT</span>
                <EarningsDisplay usdtBalance={150} showDetailed={false} />
              </div>
              <div className="package-item">
                <span className="package-name">Level 3:</span>
                <span className="package-value">750 USDT</span>
                <EarningsDisplay usdtBalance={750} showDetailed={false} />
              </div>
              <div className="package-item">
                <span className="package-name">Level 4:</span>
                <span className="package-value">1500 USDT</span>
                <EarningsDisplay usdtBalance={1500} showDetailed={false} />
              </div>
            </div>
        </div>

      </div>
    </PageWrapper>
  );
}
