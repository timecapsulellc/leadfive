import React from 'react';

/**
 * NetworkActivity - Shows recent network activity (team events, upgrades, etc)
 * Props: teamData, deviceInfo
 */
function NetworkActivity({ teamData, deviceInfo }) {
  // For demo, just show total members and active members
  return (
    <div className="network-activity">
      <h3>Network Activity</h3>
      <div className="activity-summary">
        <span>
          Total Members: <b>{teamData.totalMembers}</b>
        </span>
        <span>
          Active Members: <b>{teamData.activeMembers}</b>
        </span>
        <span>
          Direct Referrals: <b>{teamData.directReferrals}</b>
        </span>
        <span>
          Leader Rank: <b>{teamData.leaderRank}</b>
        </span>
      </div>
    </div>
  );
}

export default NetworkActivity;
