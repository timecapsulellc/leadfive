import React from 'react';
import { useGlobalStats } from '../../hooks/useGlobalStats';

export default function GlobalStatsPanel({ contract }) {
  const { totalUsers, totalVolume, ghpBalance, leaderBonus, clubPool, freeRegs, flexRegs, loading, error } = useGlobalStats(contract);

  if (loading) return <div>Loading global stats...</div>;
  if (error) return <div>Error loading stats: {error.message}</div>;

  return (
    <div className="global-stats-panel">
      <h3>Global Contract Stats</h3>
      <div><strong>Total Users:</strong> {totalUsers}</div>
      <div><strong>Total Volume:</strong> {totalVolume}</div>
      <div><strong>GHP Balance:</strong> {ghpBalance}</div>
      <div><strong>Leader Bonus Pool:</strong> {leaderBonus}</div>
      <div><strong>Club Pool:</strong> {clubPool}</div>
      <div><strong>Free Registrations:</strong> {freeRegs}</div>
      <div><strong>Flexible Registrations:</strong> {flexRegs}</div>
    </div>
  );
}
