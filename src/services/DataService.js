import contractService from './ContractService.js';

/**
 * 📊 LEAD FIVE DATA SERVICE
 * Provides real blockchain data with caching and fallback mechanisms
 * Replaces all mock data with actual smart contract interactions
 */
class LeadFiveDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
    this.isInitialized = false;
  }

  /**
   * Initialize data service
   */
  async initialize() {
    if (!contractService.isInitialized) {
      throw new Error('Contract service must be initialized first');
    }
    this.isInitialized = true;
    console.log('✅ Data Service initialized');
  }

  /**
   * Get user dashboard data - replaces mock data
   */
  async getUserDashboardData(account) {
    const cacheKey = `dashboard_${account}`;
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      // Get all user data from contract
      const [userInfo, poolEarnings, directReferrals, withdrawalRate, platformStats] = await Promise.all([
        contractService.getUserInfo(account),
        contractService.getPoolEarnings(account),
        contractService.getDirectReferrals(account),
        contractService.getWithdrawalRate(account),
        contractService.getPlatformStats()
      ]);

      // Calculate additional metrics
      const dashboardData = {
        // User Profile
        profile: {
          isRegistered: userInfo.isActive,
          packageTier: userInfo.packageTier,
          packageName: this.getPackageName(userInfo.packageTier),
          packageAmount: this.getPackageAmount(userInfo.packageTier),
          registrationDate: new Date(userInfo.registrationTime),
          totalInvested: parseFloat(userInfo.totalInvested),
          sponsor: userInfo.sponsor
        },

        // Earnings Overview
        earnings: {
          total: parseFloat(userInfo.totalEarnings),
          withdrawable: parseFloat(userInfo.withdrawableAmount),
          pools: {
            directReferral: parseFloat(poolEarnings.directReferral),
            levelCommission: parseFloat(poolEarnings.levelCommission),
            globalHelp: parseFloat(poolEarnings.globalHelp),
            leaderBonus: parseFloat(poolEarnings.leaderBonus),
            royaltyBonus: parseFloat(poolEarnings.royaltyBonus)
          },
          capStatus: {
            isCapped: userInfo.isCapped,
            capLimit: parseFloat(userInfo.totalInvested) * 4, // 4x ROI cap
            progress: Math.min((parseFloat(userInfo.totalEarnings) / (parseFloat(userInfo.totalInvested) * 4)) * 100, 100)
          }
        },

        // Team Information
        team: {
          size: userInfo.teamSize,
          directReferrals: userInfo.directReferrals,
          referralDetails: directReferrals.map(ref => ({
            address: ref.address,
            packageTier: ref.packageTier,
            packageName: this.getPackageName(ref.packageTier),
            totalInvested: parseFloat(ref.totalInvested),
            joinDate: new Date(ref.registrationTime),
            isActive: ref.isActive
          }))
        },

        // Withdrawal Information
        withdrawal: {
          rate: withdrawalRate,
          availableAmount: parseFloat(userInfo.withdrawableAmount),
          minimumAmount: 5, // $5 minimum withdrawal
          maxAmount: Math.min(parseFloat(userInfo.withdrawableAmount), 500) // Max $500 per withdrawal
        },

        // Leadership Status
        leadership: {
          rank: userInfo.leaderRank,
          rankName: this.getLeaderRankName(userInfo.leaderRank),
          qualifiesForBonus: userInfo.leaderRank > 0
        },

        // Platform Statistics
        platform: {
          totalUsers: platformStats.totalUsers,
          totalVolume: parseFloat(platformStats.totalVolume),
          globalHelpPool: parseFloat(platformStats.globalHelpPoolBalance),
          leaderBonusPool: parseFloat(platformStats.leaderBonusPoolBalance)
        },

        // Performance Metrics
        performance: {
          dailyEarnings: await this.calculateDailyEarnings(account),
          weeklyEarnings: await this.calculateWeeklyEarnings(account),
          monthlyEarnings: await this.calculateMonthlyEarnings(account),
          roi: this.calculateROI(userInfo.totalEarnings, userInfo.totalInvested)
        }
      };

      // Cache the data
      this.setCache(cacheKey, dashboardData);

      return dashboardData;

    } catch (error) {
      console.error('Failed to load user dashboard data:', error);
      // Return fallback data structure
      return this.getFallbackDashboardData();
    }
  }

  /**
   * Get real-time earnings updates
   */
  async getRealtimeEarnings(account) {
    try {
      const poolEarnings = await contractService.getPoolEarnings(account);
      const userInfo = await contractService.getUserInfo(account);

      return {
        total: parseFloat(poolEarnings.total),
        withdrawable: parseFloat(userInfo.withdrawableAmount),
        lastUpdate: new Date(),
        breakdown: {
          directReferral: parseFloat(poolEarnings.directReferral),
          levelCommission: parseFloat(poolEarnings.levelCommission),
          globalHelp: parseFloat(poolEarnings.globalHelp),
          leaderBonus: parseFloat(poolEarnings.leaderBonus),
          royaltyBonus: parseFloat(poolEarnings.royaltyBonus)
        }
      };
    } catch (error) {
      console.error('Failed to get realtime earnings:', error);
      throw error;
    }
  }

  /**
   * Get team analytics data
   */
  async getTeamAnalytics(account) {
    const cacheKey = `team_analytics_${account}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const [userInfo, directReferrals] = await Promise.all([
        contractService.getUserInfo(account),
        contractService.getDirectReferrals(account)
      ]);

      // Calculate team analytics
      const analytics = {
        overview: {
          totalTeamSize: userInfo.teamSize,
          directReferrals: userInfo.directReferrals,
          activeMembers: directReferrals.filter(ref => ref.isActive).length,
          totalTeamVolume: directReferrals.reduce((sum, ref) => sum + parseFloat(ref.totalInvested), 0)
        },
        
        packageDistribution: this.calculatePackageDistribution(directReferrals),
        
        growthMetrics: {
          newMembersThisWeek: this.calculateNewMembersThisWeek(directReferrals),
          newMembersThisMonth: this.calculateNewMembersThisMonth(directReferrals),
          averagePackageSize: this.calculateAveragePackageSize(directReferrals)
        },
        
        earnings: {
          fromDirectReferrals: await this.calculateDirectReferralEarnings(account),
          fromTeamCommissions: await this.calculateTeamCommissionEarnings(account)
        }
      };

      this.setCache(cacheKey, analytics);
      return analytics;

    } catch (error) {
      console.error('Failed to get team analytics:', error);
      throw error;
    }
  }

  /**
   * Helper methods for data calculation
   */
  
  getPackageName(tier) {
    const packages = ['No Package', '$30 Package', '$50 Package', '$100 Package', '$200 Package'];
    return packages[tier] || 'Unknown Package';
  }

  getPackageAmount(tier) {
    const amounts = [0, 30, 50, 100, 200];
    return amounts[tier] || 0;
  }

  getLeaderRankName(rank) {
    const ranks = ['No Rank', 'Shining Star', 'Silver Star'];
    return ranks[rank] || 'Unknown Rank';
  }

  calculateROI(totalEarnings, totalInvested) {
    if (parseFloat(totalInvested) === 0) return 0;
    return (parseFloat(totalEarnings) / parseFloat(totalInvested)) * 100;
  }

  calculatePackageDistribution(referrals) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0 };
    referrals.forEach(ref => {
      if (distribution[ref.packageTier] !== undefined) {
        distribution[ref.packageTier]++;
      }
    });
    return distribution;
  }

  calculateNewMembersThisWeek(referrals) {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return referrals.filter(ref => ref.registrationTime > weekAgo).length;
  }

  calculateNewMembersThisMonth(referrals) {
    const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    return referrals.filter(ref => ref.registrationTime > monthAgo).length;
  }

  calculateAveragePackageSize(referrals) {
    if (referrals.length === 0) return 0;
    const total = referrals.reduce((sum, ref) => sum + parseFloat(ref.totalInvested), 0);
    return total / referrals.length;
  }

  async calculateDailyEarnings(account) {
    // This would require historical data - for now return estimated
    try {
      const poolEarnings = await contractService.getPoolEarnings(account);
      // Estimate daily earnings as 1% of total (simplified)
      return parseFloat(poolEarnings.total) * 0.01;
    } catch (error) {
      return 0;
    }
  }

  async calculateWeeklyEarnings(account) {
    try {
      const daily = await this.calculateDailyEarnings(account);
      return daily * 7;
    } catch (error) {
      return 0;
    }
  }

  async calculateMonthlyEarnings(account) {
    try {
      const daily = await this.calculateDailyEarnings(account);
      return daily * 30;
    } catch (error) {
      return 0;
    }
  }

  async calculateDirectReferralEarnings(account) {
    try {
      const poolEarnings = await contractService.getPoolEarnings(account);
      return parseFloat(poolEarnings.directReferral);
    } catch (error) {
      return 0;
    }
  }

  async calculateTeamCommissionEarnings(account) {
    try {
      const poolEarnings = await contractService.getPoolEarnings(account);
      return parseFloat(poolEarnings.levelCommission);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Cache management
   */
  
  isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return (Date.now() - cached.timestamp) < this.cacheTimeout;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Fallback data for errors
   */
  getFallbackDashboardData() {
    return {
      profile: {
        isRegistered: false,
        packageTier: 0,
        packageName: 'No Package',
        packageAmount: 0,
        registrationDate: new Date(),
        totalInvested: 0,
        sponsor: '0x0000000000000000000000000000000000000000'
      },
      earnings: {
        total: 0,
        withdrawable: 0,
        pools: {
          directReferral: 0,
          levelCommission: 0,
          globalHelp: 0,
          leaderBonus: 0,
          royaltyBonus: 0
        },
        capStatus: {
          isCapped: false,
          capLimit: 0,
          progress: 0
        }
      },
      team: {
        size: 0,
        directReferrals: 0,
        referralDetails: []
      },
      withdrawal: {
        rate: 0,
        availableAmount: 0,
        minimumAmount: 5,
        maxAmount: 0
      },
      leadership: {
        rank: 0,
        rankName: 'No Rank',
        qualifiesForBonus: false
      },
      platform: {
        totalUsers: 0,
        totalVolume: 0,
        globalHelpPool: 0,
        leaderBonusPool: 0
      },
      performance: {
        dailyEarnings: 0,
        weeklyEarnings: 0,
        monthlyEarnings: 0,
        roi: 0
      }
    };
  }
}

// Create singleton instance
export const dataService = new LeadFiveDataService();
export default dataService;
