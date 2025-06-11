import React, { useState, useEffect, useCallback } from 'react';
import useWallet from '../../hooks/useWallet';
import LoadingSpinner from '../common/LoadingSpinner';
import Web3Service from '../../services/Web3Service';

const TeamGenealogy = () => {
  const { account, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState('earnings');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTeamData = useCallback(async () => {
    if (!account) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Fetch team hierarchy from smart contract
      const teamData = await Web3Service.getTeamHierarchy(account);
      setTeamMembers(teamData);
    } catch (err) {
      console.error('Error fetching team data:', err);
      setError('Failed to fetch team data. Using demo data.');
      
      // Demo team data
      setTeamMembers([
        {
          address: '0x1234567890123456789012345678901234567890',
          displayName: '0x12...34',
          level: 1,
          position: 2,
          totalEarnings: 145.25,
          withdrawableAmount: 45.50,
          directReferrals: 3,
          teamSize: 8,
          isCapped: false,
          joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          sponsor: account,
          children: ['0x5678901234567890123456789012345678901234', '0x9ABCDEF0123456789012345678901234567890']
        },
        {
          address: '0xDEF0123456789012345678901234567890123456',
          displayName: '0xDE...F0',
          level: 1,
          position: 3,
          totalEarnings: 267.30,
          withdrawableAmount: 89.10,
          directReferrals: 2,
          teamSize: 5,
          isCapped: false,
          joinDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          sponsor: account,
          children: ['0x3344556677889900112233445566778899001122']
        },
        {
          address: '0x5678901234567890123456789012345678901234',
          displayName: '0x56...78',
          level: 2,
          position: 4,
          totalEarnings: 98.75,
          withdrawableAmount: 32.25,
          directReferrals: 1,
          teamSize: 2,
          isCapped: false,
          joinDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          sponsor: '0x1234567890123456789012345678901234567890',
          children: []
        },
        {
          address: '0x9ABCDEF0123456789012345678901234567890',
          displayName: '0x9A...BC',
          level: 2,
          position: 5,
          totalEarnings: 156.80,
          withdrawableAmount: 52.40,
          directReferrals: 0,
          teamSize: 1,
          isCapped: true,
          joinDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
          sponsor: '0x1234567890123456789012345678901234567890',
          children: []
        },
        {
          address: '0x3344556677889900112233445566778899001122',
          displayName: '0x33...44',
          level: 2,
          position: 6,
          totalEarnings: 78.90,
          withdrawableAmount: 26.30,
          directReferrals: 0,
          teamSize: 1,
          isCapped: false,
          joinDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          sponsor: '0xDEF0123456789012345678901234567890123456',
          children: []
        }
      ]);
    }
    setLoading(false);
  }, [account]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const filteredAndSortedMembers = teamMembers
    .filter(member => {
      if (filterLevel !== 'all' && member.level !== parseInt(filterLevel)) return false;
      if (searchTerm && !member.displayName.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !member.address.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'earnings':
          return b.totalEarnings - a.totalEarnings;
        case 'teamSize':
          return b.teamSize - a.teamSize;
        case 'joinDate':
          return b.joinDate - a.joinDate;
        case 'level':
          return a.level - b.level;
        default:
          return 0;
      }
    });

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getTotalTeamStats = () => {
    return {
      totalMembers: teamMembers.length,
      totalEarnings: teamMembers.reduce((sum, member) => sum + member.totalEarnings, 0),
      totalWithdrawable: teamMembers.reduce((sum, member) => sum + member.withdrawableAmount, 0),
      activeMembersCount: teamMembers.filter(member => !member.isCapped).length,
      cappedMembersCount: teamMembers.filter(member => member.isCapped).length,
      averageEarnings: teamMembers.length > 0 ? 
        teamMembers.reduce((sum, member) => sum + member.totalEarnings, 0) / teamMembers.length : 0
    };
  };

  const stats = getTotalTeamStats();

  return (
    <div className="team-genealogy card">
      <div className="team-header">
        <h2>👥 Team Genealogy</h2>
        <button 
          className="refresh-btn"
          onClick={fetchTeamData}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {loading && <LoadingSpinner size={32} />}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading && (
        <>
          {/* Team Statistics */}
          <div className="team-stats-overview">
            <div className="stats-grid-4">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalMembers}</div>
                  <div className="stat-label">Total Members</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <div className="stat-value">${Web3Service.formatCurrency(stats.totalEarnings)}</div>
                  <div className="stat-label">Team Earnings</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🟢</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.activeMembersCount}</div>
                  <div className="stat-label">Active Members</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <div className="stat-value">${Web3Service.formatCurrency(stats.averageEarnings)}</div>
                  <div className="stat-label">Avg Earnings</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="team-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by address or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-controls">
              <select 
                value={filterLevel} 
                onChange={(e) => setFilterLevel(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Levels</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
                <option value="5">Level 5</option>
              </select>
              
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="earnings">Sort by Earnings</option>
                <option value="teamSize">Sort by Team Size</option>
                <option value="joinDate">Sort by Join Date</option>
                <option value="level">Sort by Level</option>
              </select>
            </div>
          </div>

          {/* Team Members List */}
          <div className="team-members-list">
            {filteredAndSortedMembers.length === 0 ? (
              <div className="no-members-message">
                <p>No team members found matching your criteria.</p>
                {teamMembers.length === 0 && (
                  <p>Start building your team by sharing your referral link!</p>
                )}
              </div>
            ) : (
              filteredAndSortedMembers.map((member, index) => (
                <div 
                  key={member.address}
                  className={`team-member-card ${member.isCapped ? 'capped' : 'active'} ${selectedMember?.address === member.address ? 'selected' : ''}`}
                  onClick={() => setSelectedMember(selectedMember?.address === member.address ? null : member)}
                >
                  <div className="member-header">
                    <div className="member-info">
                      <div className="member-name">
                        <span className="level-badge">L{member.level}</span>
                        {member.displayName}
                      </div>
                      <div className="member-address">{member.address}</div>
                    </div>
                    <div className="member-status">
                      <span className={`status-badge ${member.isCapped ? 'capped' : 'active'}`}>
                        {member.isCapped ? '🔴 Capped' : '🟢 Active'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="member-stats">
                    <div className="stat-row">
                      <div className="stat-item">
                        <span className="stat-label">Earnings:</span>
                        <span className="stat-value earnings">${Web3Service.formatCurrency(member.totalEarnings)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Withdrawable:</span>
                        <span className="stat-value withdrawable">${Web3Service.formatCurrency(member.withdrawableAmount)}</span>
                      </div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-item">
                        <span className="stat-label">Team Size:</span>
                        <span className="stat-value">{member.teamSize}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Referrals:</span>
                        <span className="stat-value">{member.directReferrals}</span>
                      </div>
                    </div>
                    <div className="stat-row">
                      <div className="stat-item">
                        <span className="stat-label">Joined:</span>
                        <span className="stat-value">{formatTimeAgo(member.joinDate)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Position:</span>
                        <span className="stat-value">#{member.position}</span>
                      </div>
                    </div>
                  </div>

                  {selectedMember?.address === member.address && (
                    <div className="member-details-expanded">
                      <div className="details-section">
                        <h4>📋 Detailed Information</h4>
                        <div className="details-grid">
                          <div className="detail-row">
                            <span className="detail-label">Sponsor Address:</span>
                            <span className="detail-value">{Web3Service.formatAddress(member.sponsor)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Matrix Position:</span>
                            <span className="detail-value">{member.position}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Children Count:</span>
                            <span className="detail-value">{member.children.length}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Status:</span>
                            <span className={`detail-value ${member.isCapped ? 'capped' : 'active'}`}>
                              {member.isCapped ? 'Capped (Max earnings reached)' : 'Active (Earning)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TeamGenealogy;
