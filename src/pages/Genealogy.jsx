import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import GenealogyTree from '../components/enhanced/GenealogyTree';
import '../styles/brandColors.css';
import './Genealogy.css';

export default function Genealogy({ account, provider }) {
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!account) {
      navigate('/');
      return;
    }
    loadGenealogyData();
  }, [account, navigate]);

  const loadGenealogyData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading genealogy data for account:', account);

      // Validate account is a string
      const accountStr = typeof account === 'string' ? account : account?.address || '';
      
      // Use the enhanced LeadFive business model tree structure
      const enhancedTreeData = {
        name: accountStr
          ? `You (${accountStr.slice(0, 6)}...${accountStr.slice(-4)})`
          : 'You (Root)',
        id: 'user',
        level: 0,
        package: 'Professional',
        packageValue: 100,
        totalEarnings: 1240.5,
        directCommission: 0,
        levelBonus: 185.3,
        leaderPool: 45.3,
        helpPool: 155.9,
        uplineBonus: 0,
        status: 'active',
        rank: 'Silver Star',
        avatar: '👤',
        joinDate: new Date().toISOString().split('T')[0],
        directReferrals: 2,
        teamSize: 25,
        children: [
          {
            name: 'Alice Chen',
            id: 'alice',
            level: 1,
            position: 'left',
            package: 'Elite',
            packageValue: 200,
            totalEarnings: 820.0,
            directCommission: 240.0,
            levelBonus: 125.0,
            leaderPool: 15.0,
            helpPool: 85.0,
            uplineBonus: 20.0,
            status: 'active',
            rank: 'Bronze Leader',
            avatar: '👩',
            joinDate: '2024-02-15',
            directReferrals: 2,
            teamSize: 12,
            children: [
              {
                name: 'Bob Wilson',
                id: 'bob',
                level: 2,
                position: 'left',
                package: 'Professional',
                packageValue: 100,
                totalEarnings: 340.0,
                directCommission: 120.0,
                levelBonus: 45.0,
                leaderPool: 0,
                helpPool: 35.0,
                uplineBonus: 10.0,
                status: 'active',
                rank: 'Member',
                avatar: '👨',
                joinDate: '2024-03-10',
                directReferrals: 2,
                teamSize: 6,
              },
              {
                name: 'Sarah Johnson',
                id: 'sarah',
                level: 2,
                position: 'right',
                package: 'Growth',
                packageValue: 50,
                totalEarnings: 320.0,
                directCommission: 120.0,
                levelBonus: 35.0,
                leaderPool: 0,
                helpPool: 28.0,
                uplineBonus: 8.0,
                status: 'active',
                rank: 'Member',
                avatar: '👩',
                joinDate: '2024-03-15',
                directReferrals: 1,
                teamSize: 3,
              },
            ],
          },
          {
            name: 'David Kim',
            id: 'david',
            level: 1,
            position: 'right',
            package: 'Professional',
            packageValue: 100,
            totalEarnings: 620.0,
            directCommission: 200.0,
            levelBonus: 85.0,
            leaderPool: 12.0,
            helpPool: 55.0,
            uplineBonus: 15.0,
            status: 'active',
            rank: 'Bronze Leader',
            avatar: '👨',
            joinDate: '2024-02-28',
            directReferrals: 2,
            teamSize: 8,
            children: [
              {
                name: 'Maria Santos',
                id: 'maria',
                level: 2,
                position: 'left',
                package: 'Elite',
                packageValue: 200,
                totalEarnings: 450.0,
                directCommission: 160.0,
                levelBonus: 35.0,
                leaderPool: 0,
                helpPool: 40.0,
                uplineBonus: 12.0,
                status: 'active',
                rank: 'Member',
                avatar: '👩',
                joinDate: '2024-04-10',
                directReferrals: 1,
                teamSize: 3,
              },
              {
                name: 'Ahmed Hassan',
                id: 'ahmed',
                level: 2,
                position: 'right',
                package: 'Growth',
                packageValue: 50,
                totalEarnings: 195.0,
                directCommission: 80.0,
                levelBonus: 18.0,
                leaderPool: 0,
                helpPool: 22.0,
                uplineBonus: 6.0,
                status: 'active',
                rank: 'Member',
                avatar: '👨',
                joinDate: '2024-05-01',
                directReferrals: 1,
                teamSize: 2,
              },
            ],
          },
        ],
      };

      setTreeData(enhancedTreeData);
    } catch (error) {
      console.error('Error loading genealogy data:', error);
      setError(`Failed to load genealogy data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="genealogy-loading">
        <div className="loading-spinner"></div>
        <p>Loading your genealogy tree...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="genealogy-error">
        <p>{error}</p>
        <button onClick={loadGenealogyData}>Retry</button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="genealogy-page">
        <div className="page-header">
          <h1>🌳 LeadFive Genealogy Tree</h1>
          <p>
            Interactive network visualization with complete earnings breakdown
          </p>
        </div>

        {/* Connected User Info */}
        {account && (
          <div className="connected-user-info">
            <div className="user-card">
              <div className="user-details">
                <div className="user-address">
                  <strong>Connected Wallet:</strong>
                  <div className="address-display">
                    {account.slice(0, 8)}...{account.slice(-6)}
                  </div>
                </div>
              </div>
              <div className="quick-actions">
                <button className="action-btn primary" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </button>
                <button className="action-btn secondary" onClick={loadGenealogyData}>
                  Refresh Tree
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Community Visualization Section */}
        <div className="community-visualization-section">
          <ErrorBoundary
            fallback={
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  background: 'rgba(26, 26, 46, 0.8)',
                  borderRadius: '16px',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  margin: '20px',
                  color: 'white'
                }}
              >
                <h3>⚠️ Tree Visualization Error</h3>
                <p>
                  Unable to display the genealogy tree. This might be due to
                  browser compatibility or data issues.
                </p>
                <button
                  onClick={loadGenealogyData}
                  className="action-btn primary"
                  style={{ marginTop: '20px' }}
                >
                  Retry Loading
                </button>
              </div>
            }
          >
            <GenealogyTree
              treeData={treeData}
              onNodeClick={nodeData => {
                console.log('Node clicked:', nodeData);
                // Add any additional click handler logic here
              }}
            />
          </ErrorBoundary>
        </div>

        {/* Business Info Section */}
        <div className="business-info-section">
          <div className="info-grid">
            {/* Reward Structure */}
            <div className="info-card">
              <h4>💰 Reward Structure</h4>
              <p>LeadFive's comprehensive reward system ensures fair distribution across all levels.</p>
              <div className="reward-breakdown">
                <div className="reward-item">
                  <span className="reward-percentage">40%</span>
                  <span className="reward-name">Direct Referral Bonus</span>
                </div>
                <div className="reward-item">
                  <span className="reward-percentage">10%</span>
                  <span className="reward-name">Level Bonus</span>
                </div>
                <div className="reward-item">
                  <span className="reward-percentage">10%</span>
                  <span className="reward-name">Upline Bonus</span>
                </div>
                <div className="reward-item">
                  <span className="reward-percentage">10%</span>
                  <span className="reward-name">Leader Pool</span>
                </div>
                <div className="reward-item">
                  <span className="reward-percentage">30%</span>
                  <span className="reward-name">Help Pool</span>
                </div>
              </div>
            </div>

            {/* Package Tiers */}
            <div className="info-card">
              <h4>📦 Package Tiers</h4>
              <p>Choose the package that best fits your investment goals.</p>
              <div className="tier-list">
                <div className="tier-item bronze">
                  <div className="tier-name">Starter</div>
                  <div className="tier-price">$30</div>
                  <div className="tier-max">Max: $120</div>
                </div>
                <div className="tier-item silver">
                  <div className="tier-name">Growth</div>
                  <div className="tier-price">$50</div>
                  <div className="tier-max">Max: $200</div>
                </div>
                <div className="tier-item gold">
                  <div className="tier-name">Professional</div>
                  <div className="tier-price">$100</div>
                  <div className="tier-max">Max: $400</div>
                </div>
                <div className="tier-item diamond">
                  <div className="tier-name">Elite</div>
                  <div className="tier-price">$200</div>
                  <div className="tier-max">Max: $800</div>
                </div>
              </div>
            </div>

            {/* Collection Rates */}
            <div className="info-card">
              <h4>💳 Collection Rates</h4>
              <p>Withdrawal/reinvestment rates based on direct referrals.</p>
              <div className="collection-rates">
                <div className="rate-item">
                  <span className="rate-condition">0 Direct Referrals</span>
                  <span className="rate-split">70% / 30%</span>
                </div>
                <div className="rate-item">
                  <span className="rate-condition">1 Direct Referral</span>
                  <span className="rate-split">80% / 20%</span>
                </div>
                <div className="rate-item highlighted">
                  <span className="rate-condition">2+ Direct Referrals</span>
                  <span className="rate-split">100% / 0%</span>
                </div>
              </div>
            </div>

            {/* Leadership Requirements */}
            <div className="info-card">
              <h4>🏆 Leadership Requirements</h4>
              <p>Become a leader and unlock exclusive pool rewards.</p>
              <div className="leadership-requirements">
                <div className="requirement-item">
                  <span className="requirement-icon">⭐</span>
                  <span>Shining Star: 25 active referrals</span>
                </div>
                <div className="requirement-item">
                  <span className="requirement-icon">🥈</span>
                  <span>Silver Star: 125 active referrals</span>
                </div>
                <div className="requirement-item">
                  <span className="requirement-icon">🥇</span>
                  <span>Gold Star: 625 active referrals</span>
                </div>
                <div className="requirement-item">
                  <span className="requirement-icon">💎</span>
                  <span>Diamond Star: 3,125 active referrals</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
