import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import { LEADER_RANKS } from '../../contracts';

const TeamOverview = ({ wallet, contract }) => {
  const [teamSize, setTeamSize] = useState(0);
  const [leaderRank, setLeaderRank] = useState('NONE');
  const [teamVolume, setTeamVolume] = useState(0);
  const [generations, setGenerations] = useState(0);
  const [activeMembers, setActiveMembers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!wallet?.account || !contract) {
        // Set demo data when wallet is not connected
        setTeamSize(0);
        setLeaderRank('NONE');
        setTeamVolume(0);
        setGenerations(0);
        setActiveMembers(0);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const info = await contract.getUserInfo(wallet.account);
        setTeamSize(Number(info.teamSize));
        setLeaderRank(Object.keys(LEADER_RANKS).find(key => LEADER_RANKS[key] === Number(info.leaderRank)) || 'NONE');
        
        // Demo values - replace with actual contract calls when available
        setTeamVolume(0);
        setGenerations(0);
        setActiveMembers(0);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to fetch team data');
        // Set demo data on error
        setTeamSize(0);
        setLeaderRank('NONE');
        setTeamVolume(0);
        setGenerations(0);
        setActiveMembers(0);
      }
      setLoading(false);
    };
    fetchTeamData();
  }, [wallet?.account, contract]);

  const activityPercentage = teamSize > 0 ? ((activeMembers / teamSize) * 100) : 0;

  return (
    <div className="team-overview card">
      <h2>👥 Team Overview</h2>
      {loading && <LoadingSpinner size={32} />}
      
      {error && (
        <div className="error-message" style={{ color: 'var(--error-color)', padding: '12px', background: 'var(--accent-bg)', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      
      <div className="team-section">
        <div className="team-stats">
          <div className="stat-item">
            <div className="label">Team Size</div>
            <div className="value">{teamSize}</div>
          </div>
          <div className="stat-item">
            <div className="label">Leader Rank</div>
            <div className="value">{leaderRank}</div>
          </div>
          <div className="stat-item">
            <div className="label">Team Volume</div>
            <div className="value">${teamVolume.toLocaleString()}</div>
          </div>
          <div className="stat-item">
            <div className="label">Generations</div>
            <div className="value">{generations}</div>
          </div>
        </div>

        <div className="activity-section">
          <div className="activity-header">
            <h3>Team Activity</h3>
            <div className="activity-indicator-container">
              <span className={`activity-indicator ${activityPercentage > 50 ? 'active' : 'inactive'}`}></span>
              <span>Activity: {activityPercentage.toFixed(1)}% active</span>
            </div>
          </div>
          
          <div className="activity-stats">
            <div className="activity-item">
              <span className="activity-label">Active Members:</span>
              <span className="activity-value">{activeMembers} / {teamSize}</span>
            </div>
            <div className="activity-item">
              <span className="activity-label">This Month:</span>
              <span className="activity-value">--</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamOverview;
