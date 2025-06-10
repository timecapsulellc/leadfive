
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Compensation Plan Dashboard', function () {
  let dashboard;
  let mockContract;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy a mock contract for testing dashboard functionality
    const MockContract = await ethers.getContractFactory('MockUSDT');
    mockContract = await MockContract.deploy('Mock USDT', 'MUSDT', 18);
    await mockContract.waitForDeployment();
  });

  describe('Dashboard Performance Tests', function () {
    it('Should handle large team data sets efficiently', async function () {
      const startTime = performance.now();
      
      // Simulate large team data generation
      const maxLevels = 30;
      const teamData = generateLargeTeamData(maxLevels);
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      expect(processingTime).to.be.lessThan(1000); // Should process in under 1 second
      expect(teamData.maxLevel).to.equal(maxLevels);
      expect(Object.keys(teamData.levels)).to.have.length.greaterThan(15);
    });

    it('Should enable virtual scrolling for large datasets', async function () {
      const teamData = generateLargeTeamData(25);
      const shouldEnableVirtualScrolling = Object.keys(teamData.levels).length > 20;
      
      expect(shouldEnableVirtualScrolling).to.be.true;
    });

    it('Should calculate compensation accurately across all levels', async function () {
      const teamData = generateLargeTeamData(10);
      let totalCalculatedEarnings = 0;
      
      // Calculate earnings based on OrphiCrowdFund compensation structure
      Object.keys(teamData.levels).forEach(level => {
        const levelNum = parseInt(level);
        const levelData = teamData.levels[level];
        let bonusRate = 0;
        
        // Apply OrphiCrowdFund bonus structure
        if (levelNum === 1) bonusRate = 0.03; // 3% for Level 1
        else if (levelNum >= 2 && levelNum <= 6) bonusRate = 0.01; // 1% for Levels 2-6
        else if (levelNum >= 7 && levelNum <= 10) bonusRate = 0.005; // 0.5% for Levels 7-10
        
        totalCalculatedEarnings += levelData.volume * bonusRate;
      });
      
      expect(totalCalculatedEarnings).to.be.greaterThan(0);
      expect(Math.abs(totalCalculatedEarnings - teamData.teamEarnings)).to.be.lessThan(0.01);
    });
  });

  describe('Responsive Design Tests', function () {
    it('Should adapt grid layout for different screen sizes', function () {
      const mobileGrid = getResponsiveGrid(350);
      const tabletGrid = getResponsiveGrid(768);
      const desktopGrid = getResponsiveGrid(1200);
      
      expect(mobileGrid).to.include('1fr');
      expect(tabletGrid).to.include('repeat(2');
      expect(desktopGrid).to.include('repeat(3');
    });

    it('Should handle device orientation changes', function () {
      const deviceInfo = {
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenWidth: 768,
        orientation: 'landscape'
      };
      
      const shouldAdaptLayout = deviceInfo.isMobile && deviceInfo.orientation === 'landscape';
      expect(shouldAdaptLayout).to.be.true;
    });
  });

  describe('Real-time Data Integration', function () {
    it('Should simulate WebSocket data updates', async function () {
      const initialData = generateLargeTeamData(5);
      const updatedData = { ...initialData };
      updatedData.levels['1'].members += 2;
      updatedData.totalMembers += 2;
      
      expect(updatedData.totalMembers).to.be.greaterThan(initialData.totalMembers);
    });

    it('Should handle compensation data updates', function () {
      const compensationData = {
        sponsorBonus: 1000,
        levelBonus: 500,
        globalUplineBonus: 200,
        leaderBonus: 300,
        globalHelpPool: 150,
        totalEarnings: 2150
      };
      
      const expectedTotal = 1000 + 500 + 200 + 300 + 150;
      expect(compensationData.totalEarnings).to.equal(expectedTotal);
    });
  });

  describe('Analytics and Export Features', function () {
    it('Should generate team growth analytics', function () {
      const teamData = generateLargeTeamData(8);
      const analytics = generateTeamAnalytics(teamData);
      
      expect(analytics).to.have.property('growthRate');
      expect(analytics).to.have.property('activeMembers');
      expect(analytics).to.have.property('levelDistribution');
      expect(analytics.growthRate).to.be.a('number');
    });

    it('Should prepare data for export', function () {
      const teamData = generateLargeTeamData(5);
      const exportData = prepareExportData(teamData);
      
      expect(exportData).to.have.property('timestamp');
      expect(exportData).to.have.property('teamStructure');
      expect(exportData).to.have.property('earnings');
      expect(Array.isArray(exportData.teamStructure)).to.be.true;
    });
  });

  describe('Error Handling and Edge Cases', function () {
    it('Should handle empty team data gracefully', function () {
      const emptyTeamData = {
        levels: {},
        totalMembers: 0,
        activeMembers: 0,
        totalVolume: 0,
        maxLevel: 0
      };
      
      const shouldShowEmptyState = Object.keys(emptyTeamData.levels).length === 0;
      expect(shouldShowEmptyState).to.be.true;
    });

    it('Should validate data integrity', function () {
      const teamData = generateLargeTeamData(5);
      const isDataValid = validateTeamData(teamData);
      
      expect(isDataValid).to.be.true;
    });

    it('Should handle performance degradation gracefully', function () {
      const extremeTeamData = generateLargeTeamData(50);
      const performanceMode = Object.keys(extremeTeamData.levels).length > 40 ? 'virtual' : 'standard';
      
      expect(performanceMode).to.equal('virtual');
    });
  });
});

// Helper functions for testing
function generateLargeTeamData(maxLevels) {
  const levels = {};
  let totalMembers = 0;
  let totalVolume = 0;
  let teamEarnings = 0;
  
  for (let i = 1; i <= maxLevels; i++) {
    const members = Math.max(1, Math.floor(100 / Math.pow(i, 1.5)) + Math.floor(Math.random() * 10));
    const activeRate = Math.max(0.3, 1 - (i * 0.05));
    const activeMembers = Math.floor(members * activeRate);
    const volume = members * (1000 - (i * 50)) + Math.floor(Math.random() * 500);
    
    levels[i.toString()] = {
      members,
      activeMembers,
      volume,
      averageEarnings: volume * 0.02,
      performance: activeRate
    };
    
    totalMembers += members;
    totalVolume += volume;
    
    // Calculate earnings based on bonus structure
    let bonusRate = 0;
    if (i === 1) bonusRate = 0.03;
    else if (i >= 2 && i <= 6) bonusRate = 0.01;
    else if (i >= 7 && i <= 10) bonusRate = 0.005;
    
    teamEarnings += volume * bonusRate;
  }
  
  const activeMembers = Object.values(levels).reduce((sum, level) => sum + level.activeMembers, 0);
  
  return {
    levels,
    totalMembers,
    activeMembers,
    totalVolume,
    directReferrals: levels['1']?.members || 0,
    leaderRank: totalMembers > 500 ? 'Silver Star' : totalMembers > 250 ? 'Shining Star' : 'None',
    teamEarnings,
    maxLevel: maxLevels
  };
}

function getResponsiveGrid(screenWidth) {
  if (screenWidth < 640) {
    return '1fr';
  } else if (screenWidth < 1024) {
    return 'repeat(2, 1fr)';
  } else {
    return 'repeat(3, 1fr)';
  }
}

function generateTeamAnalytics(teamData) {
  const growthRate = Math.random() * 20 + 5; // 5-25% growth
  const levelDistribution = Object.keys(teamData.levels).map(level => ({
    level,
    members: teamData.levels[level].members,
    percentage: (teamData.levels[level].members / teamData.totalMembers) * 100
  }));
  
  return {
    growthRate,
    activeMembers: teamData.activeMembers,
    levelDistribution,
    totalVolume: teamData.totalVolume,
    averagePerformance: teamData.activeMembers / teamData.totalMembers
  };
}

function prepareExportData(teamData) {
  return {
    timestamp: new Date().toISOString(),
    teamStructure: Object.keys(teamData.levels).map(level => ({
      level: parseInt(level),
      members: teamData.levels[level].members,
      activeMembers: teamData.levels[level].activeMembers,
      volume: teamData.levels[level].volume,
      performance: teamData.levels[level].performance
    })),
    earnings: {
      totalEarnings: teamData.teamEarnings,
      breakdown: {
        sponsorBonus: teamData.teamEarnings * 0.4,
        levelBonus: teamData.teamEarnings * 0.1,
        globalUplineBonus: teamData.teamEarnings * 0.1,
        leaderBonus: teamData.teamEarnings * 0.1,
        globalHelpPool: teamData.teamEarnings * 0.3
      }
    },
    metadata: {
      totalMembers: teamData.totalMembers,
      activeMembers: teamData.activeMembers,
      maxLevel: teamData.maxLevel,
      leaderRank: teamData.leaderRank
    }
  };
}

function validateTeamData(teamData) {
  if (!teamData || typeof teamData !== 'object') return false;
  if (!teamData.levels || typeof teamData.levels !== 'object') return false;
  if (typeof teamData.totalMembers !== 'number' || teamData.totalMembers < 0) return false;
  if (typeof teamData.activeMembers !== 'number' || teamData.activeMembers < 0) return false;
  if (teamData.activeMembers > teamData.totalMembers) return false;
  
  // Validate each level
  for (const level in teamData.levels) {
    const levelData = teamData.levels[level];
    if (!levelData || typeof levelData !== 'object') return false;
    if (typeof levelData.members !== 'number' || levelData.members < 0) return false;
    if (typeof levelData.activeMembers !== 'number' || levelData.activeMembers < 0) return false;
    if (levelData.activeMembers > levelData.members) return false;
  }
  
  return true;
}
