// LeadFive Team Overview Component
import React, { useState, useEffect } from 'react';
import './TeamOverview.css';

const TeamOverview = ({
  contract,
  account,
  userInfo,
  dashboardData,
  onRefresh,
}) => {
  const [teamData, setTeamData] = useState({
    directReferrals: [],
    teamStats: {
      totalTeamSize: 0,
      activeMembers: 0,
      totalVolume: '0',
      teamEarnings: '0',
      levels: {},
    },
    recentActivity: [],
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (contract && account && userInfo) {
      fetchTeamData();
    }
  }, [contract, account, userInfo]);

  const fetchTeamData = async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);

      // Get user's team information
      const user = await contract.users(account);
      const teamSize = parseInt(user.teamSize?.toString() || '0');

      // Get direct referrals
      let directReferrals = [];
      try {
        const referralCount = await contract.getUserReferralCount(account);
        const count = Math.min(parseInt(referralCount.toString()), 50); // Limit for performance

        for (let i = 0; i < count; i++) {
          try {
            const referralAddress = await contract.getUserReferral(account, i);
            const referralUser = await contract.users(referralAddress);

            directReferrals.push({
              address: referralAddress,
              id: referralUser.id?.toString() || '0',
              totalDeposits: referralUser.totalDeposits || '0',
              totalRewards: referralUser.totalRewards || '0',
              isActive: referralUser.isActive || false,
              joinDate: new Date(
                parseInt(referralUser.registrationTime || '0') * 1000
              ),
            });
          } catch (err) {
            console.log(`Error fetching referral ${i}:`, err);
            break;
          }
        }
      } catch (err) {
        console.log('Error fetching referrals:', err);
      }

      // Calculate team statistics
      const activeMembers = directReferrals.filter(ref => ref.isActive).length;
      const totalVolume = directReferrals.reduce((sum, ref) => {
        return sum + parseFloat(ethers.formatEther(ref.totalDeposits || '0'));
      }, 0);

      setTeamData({
        directReferrals: directReferrals,
        teamStats: {
          totalTeamSize: teamSize,
          activeMembers: activeMembers,
          totalVolume: totalVolume.toString(),
          teamEarnings: userInfo?.totalRewards || '0',
          levels: {
            1: directReferrals.length,
            2: Math.max(0, teamSize - directReferrals.length),
          },
        },
        recentActivity: directReferrals
          .sort((a, b) => b.joinDate.getTime() - a.joinDate.getTime())
          .slice(0, 10),
      });
    } catch (err) {
      console.error('Failed to fetch team data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = address => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = date => {
    if (!date || date.getTime() === 0) return 'Unknown';
    return date.toLocaleDateString();
  };

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const renderOverview = () => (
    <div className="team-overview-content">
      <div className="team-stats-grid">
        <div className="team-stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Team</h3>
            <div className="stat-value">{teamData.teamStats.totalTeamSize}</div>
            <div className="stat-label">Members</div>
          </div>
        </div>

        <div className="team-stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Active Members</h3>
            <div className="stat-value">{teamData.teamStats.activeMembers}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>

        <div className="team-stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Team Volume</h3>
            <div className="stat-value">
              ${parseFloat(teamData.teamStats.totalVolume).toFixed(2)}
            </div>
            <div className="stat-label">Total Deposits</div>
          </div>
        </div>

        <div className="team-stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <h3>Team Earnings</h3>
            <div className="stat-value">
              ${parseFloat(teamData.teamStats.teamEarnings).toFixed(2)}
            </div>
            <div className="stat-label">Total Rewards</div>
          </div>
        </div>
      </div>

      <div className="team-levels">
        <h3>Team Structure</h3>
        <div className="levels-grid">
          <div className="level-card">
            <div className="level-number">Level 1</div>
            <div className="level-count">
              {teamData.teamStats.levels[1] || 0}
            </div>
            <div className="level-label">Direct Referrals</div>
          </div>
          <div className="level-card">
            <div className="level-number">Level 2+</div>
            <div className="level-count">
              {teamData.teamStats.levels[2] || 0}
            </div>
            <div className="level-label">Indirect Team</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDirectReferrals = () => (
    <div className="direct-referrals">
      <div className="referrals-header">
        <h3>Direct Referrals ({teamData.directReferrals.length})</h3>
        <div className="referral-link">
          <label>Your Referral Link:</label>
          <div className="link-container">
            <input
              type="text"
              value={`${window.location.origin}?ref=${account}`}
              readOnly
            />
            <button
              onClick={() =>
                copyToClipboard(`${window.location.origin}?ref=${account}`)
              }
              className="copy-btn"
            >
              📋 Copy
            </button>
          </div>
        </div>
      </div>

      <div className="referrals-list">
        {teamData.directReferrals.length === 0 ? (
          <div className="no-referrals">
            <p>No direct referrals yet</p>
            <p>Share your referral link to start building your team!</p>
          </div>
        ) : (
          teamData.directReferrals.map((referral, index) => (
            <div key={referral.address} className="referral-card">
              <div className="referral-info">
                <div className="referral-address">
                  <span className="address-text">
                    {formatAddress(referral.address)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(referral.address)}
                    className="copy-address"
                  >
                    📋
                  </button>
                </div>
                <div className="referral-stats">
                  <span>ID: {referral.id}</span>
                  <span
                    className={`status ${referral.isActive ? 'active' : 'inactive'}`}
                  >
                    {referral.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="referral-metrics">
                <div className="metric">
                  <label>Deposits</label>
                  <span>
                    $
                    {parseFloat(
                      ethers.formatEther(referral.totalDeposits)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="metric">
                  <label>Rewards</label>
                  <span>
                    $
                    {parseFloat(
                      ethers.formatEther(referral.totalRewards)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="metric">
                  <label>Joined</label>
                  <span>{formatDate(referral.joinDate)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className="team-activity">
      <h3>Recent Team Activity</h3>
      <div className="activity-list">
        {teamData.recentActivity.length === 0 ? (
          <div className="no-activity">
            <p>No recent team activity</p>
          </div>
        ) : (
          teamData.recentActivity.map((member, index) => (
            <div key={member.address} className="activity-item">
              <div className="activity-icon">👤</div>
              <div className="activity-details">
                <div className="activity-text">
                  <span className="member-address">
                    {formatAddress(member.address)}
                  </span>
                  <span> joined your team</span>
                </div>
                <div className="activity-date">
                  {formatDate(member.joinDate)}
                </div>
              </div>
              <div className="activity-value">
                $
                {parseFloat(ethers.formatEther(member.totalDeposits)).toFixed(
                  2
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="team-overview">
      <div className="team-header">
        <h2>👥 Team Overview</h2>
        <button
          onClick={fetchTeamData}
          disabled={loading}
          className="refresh-btn"
        >
          {loading ? '🔄 Loading...' : '🔄 Refresh'}
        </button>
      </div>

      <div className="team-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'referrals' ? 'active' : ''}`}
          onClick={() => setActiveTab('referrals')}
        >
          🤝 Direct Referrals
        </button>
        <button
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          📈 Activity
        </button>
      </div>

      <div className="team-content">
        {loading ? (
          <div className="loading-team">
            <p>Loading team data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'referrals' && renderDirectReferrals()}
            {activeTab === 'activity' && renderActivity()}
          </>
        )}
      </div>
    </div>
  );
};

export default TeamOverview;
