import React from 'react';

/**
 * Custom hook for managing compensation calculations and data
 * Handles all compensation-related state and calculations
 */
export function useCompensationData(teamData) {
  const [compensationData, setCompensationData] = React.useState({
    sponsorCommissions: 0,
    levelBonuses: {},
    uplineBonuses: 0,
    leaderBonuses: 0,
    globalHelpPool: 0,
    totalEarnings: 0,
    earningsCap: 0,
    isNearCap: false
  });

  // Base investment amount for calculations
  const investment = 100;

  // Get level bonus rate based on LeadFive compensation plan
  const getLevelBonusRate = React.useCallback((level) => {
    if (level === 1) return 3; // 3% for direct referrals
    if (level <= 6) return 1; // 1% for levels 2-6
    if (level <= 10) return 0.5; // 0.5% for levels 7-10
    return 0; // No bonus beyond level 10
  }, []);

  // Calculate compensation data based on team data
  React.useEffect(() => {
    if (!teamData.levels || Object.keys(teamData.levels).length === 0) return;

    // Calculate sponsor commissions (40% from direct referrals)
    const sponsorCommissions = teamData.directReferrals * (investment * 0.4);

    // Calculate level bonuses
    const levelBonuses = {};
    let totalLevelBonuses = 0;
    for (let i = 1; i <= Math.min(10, teamData.maxLevel); i++) {
      const levelData = teamData.levels[i];
      if (levelData) {
        let percentage = 0;
        if (i === 1) percentage = 0.03;
        else if (i <= 6) percentage = 0.01;
        else if (i <= 10) percentage = 0.005;
        
        const bonus = levelData.count * investment * percentage;
        levelBonuses[i] = bonus;
        totalLevelBonuses += bonus;
      }
    }

    // Calculate upline bonuses (10% split among 30 uplines)
    const uplineBonuses = (teamData.totalVolume * 0.1) / 30;

    // Calculate leader bonuses based on rank
    let leaderBonuses = 0;
    if (teamData.leaderRank === 'Silver Star') {
      leaderBonuses = teamData.totalVolume * 0.05; // 5% for Silver Star
    } else if (teamData.leaderRank === 'Shining Star') {
      leaderBonuses = teamData.totalVolume * 0.03; // 3% for Shining Star
    }

    // Calculate Global Help Pool (30% of total volume)
    const globalHelpPool = teamData.totalVolume * 0.3;

    // Calculate total earnings
    const totalEarnings = sponsorCommissions + totalLevelBonuses + uplineBonuses + leaderBonuses;

    // Calculate earnings cap (typically 5x the investment)
    const earningsCap = investment * 5;
    const isNearCap = totalEarnings >= earningsCap * 0.8; // Within 80% of cap

    setCompensationData({
      sponsorCommissions,
      levelBonuses,
      uplineBonuses,
      leaderBonuses,
      globalHelpPool,
      totalEarnings,
      earningsCap,
      isNearCap
    });
  }, [teamData, investment]);

  // Format earnings display
  const formatEarnings = React.useCallback((amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`;
    }
    return `$${amount.toFixed(2)}`;
  }, []);

  // Get level color based on compensation tier
  const getLevelColor = React.useCallback((level) => {
    if (level <= 3) return '#00FF88'; // High commission levels
    if (level <= 6) return '#00D4FF'; // Medium commission levels
    if (level <= 10) return '#7B2CBF'; // Low commission levels
    return '#FF6B35'; // No commission levels
  }, []);

  // Calculate compensation efficiency
  const getCompensationEfficiency = React.useCallback(() => {
    if (teamData.totalVolume === 0) return 0;
    return (compensationData.totalEarnings / teamData.totalVolume) * 100;
  }, [compensationData.totalEarnings, teamData.totalVolume]);

  // Get earnings projection based on team growth
  const getEarningsProjection = React.useCallback((growthRate = 0.1) => {
    const projectedVolume = teamData.totalVolume * (1 + growthRate);
    const projectedEarnings = compensationData.totalEarnings * (1 + growthRate);
    
    return {
      projectedVolume,
      projectedEarnings,
      growthPotential: projectedEarnings - compensationData.totalEarnings,
      timeToCapReach: compensationData.earningsCap > compensationData.totalEarnings 
        ? Math.ceil((compensationData.earningsCap - compensationData.totalEarnings) / (compensationData.totalEarnings * growthRate))
        : 0
    };
  }, [teamData.totalVolume, compensationData]);

  return {
    compensationData,
    getLevelBonusRate,
    formatEarnings,
    getLevelColor,
    getCompensationEfficiency,
    getEarningsProjection
  };
}
