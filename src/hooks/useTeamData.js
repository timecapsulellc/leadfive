import React from 'react';

/**
 * Custom hook for managing team data and infinite level functionality
 * Extracted from the main component for better separation of concerns
 */
export function useTeamData() {
  const [teamData, setTeamData] = React.useState({
    levels: {},
    totalMembers: 0,
    activeMembers: 0,
    totalVolume: 0,
    directReferrals: 0,
    leaderRank: 'None',
    teamEarnings: 0,
    maxLevel: 0,
  });

  const [teamLevelView, setTeamLevelView] = React.useState({
    currentLevel: 1,
    maxDisplayLevel: 10,
    showInfinite: false,
    levelData: {},
    expandedLevels: [],
  });

  // Virtual scrolling state for large datasets
  const [virtualScrolling, setVirtualScrolling] = React.useState({
    enabled: false,
    itemHeight: 180,
    containerHeight: 600,
    scrollTop: 0,
    visibleRange: { start: 0, end: 10 },
  });

  // Cache for performance calculations
  const levelPerformanceCache = React.useRef(new Map());

  // Toggle infinite view functionality
  const toggleInfiniteView = React.useCallback(() => {
    setTeamLevelView(prev => ({
      ...prev,
      showInfinite: !prev.showInfinite,
      maxDisplayLevel: !prev.showInfinite ? teamData.maxLevel : 10,
    }));
  }, [teamData.maxLevel]);

  // Expand to specific level
  const expandToLevel = React.useCallback(level => {
    setTeamLevelView(prev => ({
      ...prev,
      maxDisplayLevel: Math.max(prev.maxDisplayLevel, level),
      expandedLevels: [...new Set([...prev.expandedLevels, level])],
    }));
  }, []);

  // Get level performance with caching
  const getLevelPerformance = React.useCallback(
    level => {
      const levelData = teamData.levels[level];
      if (!levelData) return { efficiency: 0, growth: 0, activity: 0 };

      const cacheKey = `${level}-${levelData.count}-${levelData.volume}`;

      if (levelPerformanceCache.current.has(cacheKey)) {
        return levelPerformanceCache.current.get(cacheKey);
      }

      // Calculate performance metrics
      const efficiency = Math.min(
        100,
        (levelData.activeCount / levelData.count) * 100
      );
      const growth = Math.min(100, levelData.weeklyGrowth * 10);
      const activity = Math.min(
        100,
        (levelData.volume / (levelData.count * 100)) * 100
      );

      const performance = { efficiency, growth, activity };
      levelPerformanceCache.current.set(cacheKey, performance);

      // Clear cache if it gets too large
      if (levelPerformanceCache.current.size > 100) {
        levelPerformanceCache.current.clear();
      }

      return performance;
    },
    [teamData.levels]
  );

  // Enable virtual scrolling for large datasets
  const enableVirtualScrolling = React.useCallback(levelCount => {
    if (levelCount > 20) {
      setVirtualScrolling(prev => ({
        ...prev,
        enabled: true,
      }));
    }
  }, []);

  // Update virtual scrolling parameters
  const updateVirtualScrolling = React.useCallback(
    scrollTop => {
      const { itemHeight, containerHeight } = virtualScrolling;
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(
        start + Math.ceil(containerHeight / itemHeight) + 2,
        teamLevelView.maxDisplayLevel
      );

      setVirtualScrolling(prev => ({
        ...prev,
        scrollTop,
        visibleRange: { start, end },
      }));
    },
    [virtualScrolling, teamLevelView.maxDisplayLevel]
  );

  // Debounced team data updates
  const debouncedUpdateTeamData = React.useCallback(
    debounce(newTeamData => {
      setTeamData(newTeamData);
    }, 300),
    []
  );

  // Simple debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Simulate comprehensive team data fetching
  React.useEffect(() => {
    const fetchTeamData = () => {
      const levels = {};
      let totalMembers = 0;
      const maxLevel = Math.floor(Math.random() * 25) + 15; // Random between 15-40 levels
      let totalVolume = 0;
      let activeMembers = 0;
      let teamEarnings = 0;

      // Generate team data for each level with realistic decreasing population
      for (let level = 1; level <= maxLevel; level++) {
        // Population decreases exponentially with level depth
        const baseCount = Math.max(1, Math.floor(500 / Math.pow(level, 1.5)));
        const variance = Math.floor(Math.random() * baseCount * 0.3);
        const count = baseCount + variance;

        // Active percentage decreases slightly at deeper levels
        const activeRate = Math.max(0.6, 0.95 - level * 0.02);
        const active = Math.floor(count * activeRate);

        // Volume per member varies by level
        const avgVolumePerMember = Math.floor(50 + Math.random() * 200);
        const volume = count * avgVolumePerMember;

        // Weekly growth simulation
        const weeklyGrowth = Math.max(0, (Math.random() - 0.5) * 20);

        // Earnings based on level bonus rates
        let bonusRate = 0;
        if (level === 1) bonusRate = 0.03;
        else if (level <= 6) bonusRate = 0.01;
        else if (level <= 10) bonusRate = 0.005;

        const earnings = volume * bonusRate;

        levels[level] = {
          count,
          active,
          activeCount: active,
          volume,
          weeklyGrowth,
          earnings,
          efficiency: Math.round(activeRate * 100),
          avgVolume: avgVolumePerMember,
        };

        totalMembers += count;
        activeMembers += active;
        totalVolume += volume;
        teamEarnings += earnings;
      }

      // Calculate direct referrals (Level 1)
      const directReferrals = levels[1]?.count || 0;

      // Determine leader rank based on team size
      let leaderRank = 'None';
      if (totalMembers >= 500 && directReferrals >= 15) {
        leaderRank = 'Silver Star';
      } else if (totalMembers >= 250 && directReferrals >= 10) {
        leaderRank = 'Shining Star';
      }

      const newTeamData = {
        levels,
        totalMembers,
        activeMembers,
        totalVolume,
        directReferrals,
        leaderRank,
        teamEarnings,
        maxLevel,
      };

      setTeamData(newTeamData);

      // Enable virtual scrolling for large datasets
      if (maxLevel > 20) {
        enableVirtualScrolling(maxLevel);
      }

      // Update team level view
      setTeamLevelView(prev => ({
        ...prev,
        maxDisplayLevel: Math.min(15, maxLevel),
        levelData: levels,
      }));
    };

    // Initial fetch
    fetchTeamData();

    // Simulate real-time updates every 30 seconds
    const interval = setInterval(fetchTeamData, 30000);

    return () => clearInterval(interval);
  }, [enableVirtualScrolling]);

  return {
    teamData,
    teamLevelView,
    virtualScrolling,
    toggleInfiniteView,
    expandToLevel,
    getLevelPerformance,
    updateVirtualScrolling,
    debouncedUpdateTeamData,
  };
}
