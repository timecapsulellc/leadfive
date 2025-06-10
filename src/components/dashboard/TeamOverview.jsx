import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import { LEADER_RANKS } from '../../contracts';

const TeamOverview = ({ wallet, contract }) => {
  const [teamSize, setTeamSize] = useState(null);
  const [leaderRank, setLeaderRank] = useState('');
  const [teamVolume, setTeamVolume] = useState(null);
  const [generations, setGenerations] = useState(null);
  const [activeMembers, setActiveMembers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!wallet?.account || !contract) return;
      setLoading(true);
      setError(null);
      try {
        const info = await contract.getUserInfo(wallet.account);
        setTeamSize(Number(info.teamSize));
        setLeaderRank(Object.keys(LEADER_RANKS).find(key => LEADER_RANKS[key] === Number(info.leaderRank)) || 'NONE');
        // TODO: Replace with actual contract call for teamVolume, generations, activeMembers if available
      } catch (err) {
        setError('Failed to fetch team data');
      }
      setLoading(false);
    };
    fetchTeamData();
  }, [wallet?.account, contract]);

  return (
    <div className="team-overview card">
      <h2>Team Overview</h2>
      {loading ? (
        <LoadingSpinner size={32} />
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <>
          <div><b>Team Size:</b> {teamSize ?? '--'}</div>
          <div><b>Leader Rank:</b> {leaderRank || '--'}</div>
          <div><b>Team Volume:</b> {/* TODO: Fetch from contract */} --</div>
          <div><b>Generations:</b> {/* TODO: Fetch from contract */} --</div>
          <div><b>Active Members:</b> {/* TODO: Fetch from contract */} -- / {teamSize ?? '--'}</div>
          <div style={{ marginTop: 8, color: '#aaa', fontSize: 14 }}>
            <b>Activity:</b> --% active
          </div>
        </>
      )}
    </div>
  );
};

export default TeamOverview;
