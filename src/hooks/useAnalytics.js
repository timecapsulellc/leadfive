import React from 'react';

/**
 * Custom hook for analytics data management and processing
 * Handles analytics state, chart data generation, and export functionality
 */
export function useAnalytics(teamData, compensationData) {
  const [analyticsData, setAnalyticsData] = React.useState({
    teamGrowth: [],
    performanceTrends: [],
    levelAnalytics: {},
    exportData: null,
    filters: {
      dateRange: 'all',
      levelRange: { min: 1, max: 10 },
      performanceThreshold: 0.5,
      showInactiveMembers: true
    }
  });

  const [chartData, setChartData] = React.useState({
    teamGrowthChart: { labels: [], datasets: [] },
    performanceChart: { labels: [], datasets: [] },
    earningsChart: { labels: [], datasets: [] }
  });

  // Generate team growth analytics
  const generateTeamGrowthData = React.useCallback(() => {
    const days = 30;
    const labels = [];
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString());
      
      // Simulate team growth with some randomness
      const baseGrowth = teamData.totalMembers * (1 - i / days);
      const variance = Math.random() * 0.1 * baseGrowth;
      data.push(Math.floor(baseGrowth + variance));
    }

    return { labels, data };
  }, [teamData.totalMembers]);

  // Generate performance trends
  const generatePerformanceTrends = React.useCallback(() => {
    const trends = [];
    
    Object.keys(teamData.levels).forEach(level => {
      const levelData = teamData.levels[level];
      const performance = {
        level: parseInt(level),
        efficiency: Math.round((levelData.activeCount / levelData.count) * 100),
        growth: levelData.weeklyGrowth || 0,
        volume: levelData.volume,
        earnings: levelData.earnings || 0
      };
      trends.push(performance);
    });

    return trends.sort((a, b) => a.level - b.level);
  }, [teamData.levels]);

  // Generate chart data
  React.useEffect(() => {
    const teamGrowth = generateTeamGrowthData();
    const performanceTrends = generatePerformanceTrends();

    // Team Growth Chart
    const teamGrowthChart = {
      labels: teamGrowth.labels,
      datasets: [{
        label: 'Team Members',
        data: teamGrowth.data,
        borderColor: '#00FF88',
        backgroundColor: 'rgba(0, 255, 136, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };

    // Performance Chart
    const performanceChart = {
      labels: performanceTrends.map(p => `Level ${p.level}`),
      datasets: [
        {
          label: 'Efficiency %',
          data: performanceTrends.map(p => p.efficiency),
          borderColor: '#00D4FF',
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          yAxisID: 'y'
        },
        {
          label: 'Growth %',
          data: performanceTrends.map(p => p.growth),
          borderColor: '#7B2CBF',
          backgroundColor: 'rgba(123, 44, 191, 0.1)',
          yAxisID: 'y1'
        }
      ]
    };

    // Earnings Chart
    const earningsChart = {
      labels: performanceTrends.map(p => `Level ${p.level}`),
      datasets: [{
        label: 'Earnings',
        data: performanceTrends.map(p => p.earnings),
        backgroundColor: performanceTrends.map(p => {
          if (p.level <= 3) return 'rgba(0, 255, 136, 0.8)';
          if (p.level <= 6) return 'rgba(0, 212, 255, 0.8)';
          if (p.level <= 10) return 'rgba(123, 44, 191, 0.8)';
          return 'rgba(255, 107, 53, 0.8)';
        }),
        borderColor: performanceTrends.map(p => {
          if (p.level <= 3) return '#00FF88';
          if (p.level <= 6) return '#00D4FF';
          if (p.level <= 10) return '#7B2CBF';
          return '#FF6B35';
        }),
        borderWidth: 2
      }]
    };

    setChartData({
      teamGrowthChart,
      performanceChart,
      earningsChart
    });

    setAnalyticsData(prev => ({
      ...prev,
      teamGrowth: teamGrowth.data,
      performanceTrends
    }));
  }, [generateTeamGrowthData, generatePerformanceTrends]);

  // Apply filters to data
  const applyFilters = React.useCallback((data, filters) => {
    let filteredData = { ...data };
    
    // Filter by level range
    const filteredLevels = {};
    Object.keys(data.levels).forEach(level => {
      const levelNum = parseInt(level);
      if (levelNum >= filters.levelRange.min && levelNum <= filters.levelRange.max) {
        filteredLevels[level] = data.levels[level];
      }
    });
    
    // Filter by performance threshold
    if (!filters.showInactiveMembers) {
      Object.keys(filteredLevels).forEach(level => {
        const levelData = filteredLevels[level];
        const performance = (levelData.activeCount / levelData.count) || 0;
        if (performance < filters.performanceThreshold) {
          delete filteredLevels[level];
        }
      });
    }
    
    filteredData.levels = filteredLevels;
    
    // Recalculate totals
    filteredData.totalMembers = Object.values(filteredLevels).reduce((sum, level) => sum + level.count, 0);
    filteredData.activeMembers = Object.values(filteredLevels).reduce((sum, level) => sum + level.activeCount, 0);
    filteredData.totalVolume = Object.values(filteredLevels).reduce((sum, level) => sum + level.volume, 0);
    
    return filteredData;
  }, []);

  // Export functionality
  const exportTeamData = React.useCallback((format = 'json') => {
    const exportData = {
      timestamp: new Date().toISOString(),
      teamStructure: Object.keys(teamData.levels).map(level => ({
        level: parseInt(level),
        members: teamData.levels[level].count,
        activeMembers: teamData.levels[level].activeCount,
        volume: teamData.levels[level].volume,
        earnings: teamData.levels[level].earnings || 0,
        performance: Math.round((teamData.levels[level].activeCount / teamData.levels[level].count) * 100)
      })),
      compensation: {
        totalEarnings: compensationData.totalEarnings,
        breakdown: {
          sponsorCommissions: compensationData.sponsorCommissions,
          levelBonuses: compensationData.levelBonuses,
          uplineBonuses: compensationData.uplineBonuses,
          leaderBonuses: compensationData.leaderBonuses,
          globalHelpPool: compensationData.globalHelpPool
        }
      },
      analytics: {
        teamGrowth: analyticsData.teamGrowth,
        performanceTrends: analyticsData.performanceTrends,
        totalMembers: teamData.totalMembers,
        activeMembers: teamData.activeMembers,
        maxLevel: teamData.maxLevel,
        leaderRank: teamData.leaderRank
      },
      metadata: {
        exportFormat: format,
        dashboardVersion: '2.1.0',
        exportedBy: 'LeadFive Dashboard',
        generatedAt: new Date().toISOString()
      }
    };

    if (format === 'csv') {
      const csvData = convertToCSV(exportData);
      downloadFile(csvData, 'team-data.csv', 'text/csv');
    } else {
      const jsonData = JSON.stringify(exportData, null, 2);
      downloadFile(jsonData, 'team-data.json', 'application/json');
    }

    setAnalyticsData(prev => ({ ...prev, exportData }));
  }, [teamData, compensationData, analyticsData]);

  // Convert data to CSV format
  const convertToCSV = React.useCallback((data) => {
    const headers = ['Level', 'Members', 'Active Members', 'Volume', 'Earnings', 'Performance'];
    const rows = data.teamStructure.map(level => [
      level.level,
      level.members,
      level.activeMembers,
      level.volume,
      level.earnings,
      level.performance
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    return csvContent;
  }, []);

  // Download file helper
  const downloadFile = React.useCallback((content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Update filters
  const updateFilters = React.useCallback((newFilters) => {
    setAnalyticsData(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  }, []);

  return {
    analyticsData,
    chartData,
    exportTeamData,
    applyFilters,
    updateFilters
  };
}
