import React, { useState, useEffect } from 'react';
import UnifiedWalletConnect from '../components/UnifiedWalletConnect';
import ReferralTree from '../components/ReferralTree';
import PageWrapper from '../components/PageWrapper';

export default function Referrals({ account, provider, signer, onConnect, onDisconnect }) {
  const [referralLink, setReferralLink] = useState('');
  const [teamStats, setTeamStats] = useState({
    directReferrals: 0,
    totalTeam: 0,
    activeMembers: 0,
    totalEarnings: 0
  });
  const [treeData, setTreeData] = useState(null);

  useEffect(() => {
    if (account) {
      // Generate referral link
      setReferralLink(`https://leadfive.today/register?ref=${String(account).slice(2, 8)}`);
      
      // Mock team stats - replace with actual contract calls
      setTeamStats({
        directReferrals: 12,
        totalTeam: 156,
        activeMembers: 89,
        totalEarnings: 4567.89
      });

      // Set referral tree data
      setTreeData({ name: 'You', children: [] });
    }
  }, [account]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied to clipboard!');
  };

  return (
    <PageWrapper className="referrals-page">
      <div className="page-header">
        <h1 className="page-title">Referral Network</h1>
        <p className="page-subtitle">Build your team and earn commissions</p>
      </div>

        {!account ? (
          <div className="page-wallet-connect">
            <UnifiedWalletConnect
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              buttonText="Connect Wallet to View Network"
            />
          </div>
        ) : (
          <>
            <div className="referral-stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-value">{teamStats.directReferrals}</div>
                <div className="stat-label">Direct Referrals</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🌐</div>
                <div className="stat-value">{teamStats.totalTeam}</div>
                <div className="stat-label">Total Team Size</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{teamStats.activeMembers}</div>
                <div className="stat-label">Active Members</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-value">${teamStats.totalEarnings.toFixed(2)}</div>
                <div className="stat-label">Total Earnings</div>
              </div>
            </div>

            <div className="referral-link-section">
              <h2>Your Referral Link</h2>
              <div className="referral-link-box">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="referral-link-input"
                />
                <button onClick={copyReferralLink} className="copy-btn">
                  Copy Link
                </button>
              </div>
              <p className="referral-note">
                Share this link to earn 10% direct referral bonus on every registration!
              </p>
            </div>

            <div className="team-visualization">
              <h2>Network Structure</h2>
              {treeData ? <ReferralTree data={treeData} /> : (
                <div className="tree-placeholder">
                  <div className="tree-node root">
                    <div className="node-content">You</div>
                    <div className="node-children">
                      <div className="tree-node">
                        <div className="node-content">Level 1</div>
                      </div>
                      <div className="tree-node">
                        <div className="node-content">Level 1</div>
                      </div>
                      <div className="tree-node">
                        <div className="node-content">Level 1</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
    </PageWrapper>
  );
}
