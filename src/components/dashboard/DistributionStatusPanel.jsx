import React from 'react';
import { useDistributionStatus } from '../../hooks/useDistributionStatus';

export default function DistributionStatusPanel({ contract }) {
  const { lastGHP, lastLeader, nextGHP, nextLeader, ghpReady, leaderReady, loading, error } = useDistributionStatus(contract);

  if (loading) return <div>Loading distribution status...</div>;
  if (error) return <div>Error loading status: {error.message}</div>;

  return (
    <div className="distribution-status-panel">
      <h3>Distribution Status</h3>
      <div className="status-item">
        <strong>GHP Last:</strong> {new Date(lastGHP * 1000).toLocaleString()}
      </div>
      <div className="status-item">
        <strong>GHP Next:</strong> {new Date(nextGHP * 1000).toLocaleString()}
      </div>
      <div className="status-item">
        <strong>GHP Ready:</strong> {ghpReady ? 'Yes' : 'No'}
      </div>
      <div className="status-item">
        <strong>Leader Last:</strong> {new Date(lastLeader * 1000).toLocaleString()}
      </div>
      <div className="status-item">
        <strong>Leader Next:</strong> {new Date(nextLeader * 1000).toLocaleString()}
      </div>
      <div className="status-item">
        <strong>Leader Ready:</strong> {leaderReady ? 'Yes' : 'No'}
      </div>
    </div>
  );
}
