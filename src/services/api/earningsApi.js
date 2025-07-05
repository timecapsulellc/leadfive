/**
 * Earnings API Service
 * Handles earnings-specific data fetching and calculations
 */

import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contracts';

class EarningsApiService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  async initialize(provider, account) {
    this.provider = provider;
    this.account = account;
    this.contract = null;

    if (provider && account) {
      try {
        const signer = await provider.getSigner();
        this.contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );
      } catch (error) {
        console.error('Failed to initialize earnings contract:', error);
      }
    }
  }

  /**
   * Get detailed earnings breakdown
   */
  async getEarningsBreakdown(account) {
    const cacheKey = `earnings_breakdown_${account}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      if (!this.contract) {
        return this.getFallbackEarningsBreakdown();
      }

      // Fetch detailed earnings data
      const [
        totalEarnings,
        directReferralData,
        levelBonusData,
        uplineBonusData,
        leaderPoolData,
        helpPoolData,
        earningsHistory,
      ] = await Promise.allSettled([
        this.contract.getTotalEarnings(account),
        this.getDirectReferralBreakdown(account),
        this.getLevelBonusBreakdown(account),
        this.getUplineBonusBreakdown(account),
        this.getLeaderPoolBreakdown(account),
        this.getHelpPoolBreakdown(account),
        this.getEarningsHistory(account),
      ]);

      const breakdown = {
        total: this.formatEarnings(
          totalEarnings.status === 'fulfilled' ? totalEarnings.value : 0
        ),
        directReferral:
          directReferralData.status === 'fulfilled'
            ? directReferralData.value
            : {},
        levelBonus:
          levelBonusData.status === 'fulfilled' ? levelBonusData.value : {},
        uplineBonus:
          uplineBonusData.status === 'fulfilled' ? uplineBonusData.value : {},
        leaderPool:
          leaderPoolData.status === 'fulfilled' ? leaderPoolData.value : {},
        helpPool: helpPoolData.status === 'fulfilled' ? helpPoolData.value : {},
        history:
          earningsHistory.status === 'fulfilled' ? earningsHistory.value : [],
        lastUpdated: new Date(),
      };

      this.setCache(cacheKey, breakdown);
      return breakdown;
    } catch (error) {
      console.error('Error fetching earnings breakdown:', error);
      return this.getFallbackEarningsBreakdown();
    }
  }

  /**
   * Get direct referral earnings breakdown (40% commission)
   */
  async getDirectReferralBreakdown(account) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const directReferrals = await this.contract.getDirectReferrals(account);
      const totalEarnings =
        await this.contract.getDirectReferralEarnings(account);
      const recentReferrals = await this.getRecentReferrals(account, 30); // Last 30 days

      return {
        total: this.formatEarnings(totalEarnings),
        count: Number(directReferrals),
        rate: 40, // 40% commission
        recent: recentReferrals,
        averagePerReferral:
          Number(directReferrals) > 0
            ? this.formatEarnings(totalEarnings) / Number(directReferrals)
            : 0,
      };
    } catch (error) {
      console.error('Error fetching direct referral breakdown:', error);
      return {
        total: 0,
        count: 0,
        rate: 40,
        recent: [],
        averagePerReferral: 0,
      };
    }
  }

  /**
   * Get level bonus earnings breakdown (10% commission)
   */
  async getLevelBonusBreakdown(account) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const levelEarnings = await this.contract.getLevelBonusEarnings(account);
      const currentLevel = await this.contract.getUserLevel(account);

      return {
        total: this.formatEarnings(levelEarnings),
        currentLevel: Number(currentLevel),
        rate: 10, // 10% commission
        maxLevel: 10, // Configurable
        levelBreakdown: await this.getLevelEarningsBreakdown(account),
      };
    } catch (error) {
      console.error('Error fetching level bonus breakdown:', error);
      return {
        total: 0,
        currentLevel: 0,
        rate: 10,
        maxLevel: 10,
        levelBreakdown: [],
      };
    }
  }

  /**
   * Get upline bonus earnings breakdown (10% commission)
   */
  async getUplineBonusBreakdown(account) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const uplineEarnings =
        await this.contract.getUplineBonusEarnings(account);
      const uplineAddress = await this.contract.getUpline(account);
      const position = await this.contract.getUserPosition(account);

      return {
        total: this.formatEarnings(uplineEarnings),
        upline: uplineAddress,
        position: Number(position),
        rate: 10, // 10% commission
        side: Number(position) % 2 === 0 ? 'left' : 'right',
      };
    } catch (error) {
      console.error('Error fetching upline bonus breakdown:', error);
      return {
        total: 0,
        upline: '0x0000000000000000000000000000000000000000',
        position: 0,
        rate: 10,
        side: null,
      };
    }
  }

  /**
   * Get leader pool earnings breakdown (10% commission)
   */
  async getLeaderPoolBreakdown(account) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const leaderEarnings = await this.contract.getLeaderPoolEarnings(account);
      const isLeader = await this.contract.isLeader(account);
      const leaderRank = await this.contract.getLeaderRank(account);

      return {
        total: this.formatEarnings(leaderEarnings),
        isQualified: isLeader,
        rank: leaderRank,
        rate: 10, // 10% commission
        requirements: await this.getLeaderRequirements(),
      };
    } catch (error) {
      console.error('Error fetching leader pool breakdown:', error);
      return {
        total: 0.0,
        isQualified: false,
        rank: 'none',
        rate: 10,
        requirements: {
          minDirectReferrals: 5,
          minTeamSize: 50,
          minEarnings: 1000,
        },
      };
    }
  }

  /**
   * Get help pool earnings breakdown (30% commission)
   */
  async getHelpPoolBreakdown(account) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const helpPoolEarnings = await this.contract.getHelpPoolEarnings(account);
      const isEligible = await this.contract.isHelpPoolEligible(account);
      const nextDistribution =
        await this.contract.getNextHelpPoolDistribution();

      return {
        total: this.formatEarnings(helpPoolEarnings),
        isEligible,
        rate: 30, // 30% commission
        nextDistribution: new Date(Number(nextDistribution) * 1000),
        weeklyAverage: this.formatEarnings(helpPoolEarnings) / 12, // Assuming 12 weeks of data
      };
    } catch (error) {
      console.error('Error fetching help pool breakdown:', error);
      return {
        total: 0,
        isEligible: false,
        rate: 30,
        nextDistribution: null,
        weeklyAverage: 0,
      };
    }
  }

  /**
   * Get earnings history for charts and analytics
   */
  async getEarningsHistory(account, days = 30) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      // This would require event filtering or a separate tracking contract
      const events = await this.contract.queryFilter(
        this.contract.filters.EarningsUpdated(account),
        -(days * 24 * 60 * 4) // Approximate blocks for the period
      );

      return events.map(event => ({
        date: new Date(event.blockNumber * 12 * 1000), // Approximate timestamp
        amount: this.formatEarnings(event.args.amount),
        type: event.args.earningsType || 'general',
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
      }));
    } catch (error) {
      console.error('Error fetching earnings history:', error);
      return this.generateFallbackHistory(days);
    }
  }

  /**
   * Get recent referrals for analysis
   */
  async getRecentReferrals(account, days = 30) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      // Filter referral events
      const events = await this.contract.queryFilter(
        this.contract.filters.NewReferral(account),
        -(days * 24 * 60 * 4)
      );

      return events.map(event => ({
        referralAddress: event.args.referral,
        date: new Date(event.blockNumber * 12 * 1000),
        packageValue: this.formatEarnings(event.args.packageValue || 0),
        commission: this.formatEarnings(event.args.commission || 0),
        transactionHash: event.transactionHash,
      }));
    } catch (error) {
      console.error('Error fetching recent referrals:', error);
      return [];
    }
  }

  /**
   * Calculate daily earnings average
   */
  async getDailyEarningsAverage(account, days = 30) {
    try {
      const history = await this.getEarningsHistory(account, days);

      if (history.length === 0) return 0;

      const totalEarnings = history.reduce(
        (sum, entry) => sum + entry.amount,
        0
      );
      return totalEarnings / days;
    } catch (error) {
      console.error('Error calculating daily average:', error);
      return 0; // Fallback
    }
  }

  /**
   * Get level earnings breakdown for visualization
   */
  async getLevelEarningsBreakdown(account) {
    // This would require detailed level tracking
    return Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      earnings: Math.random() * 10, // Placeholder
      referrals: Math.floor(Math.random() * 5),
      isActive: i < 3, // First 3 levels are active
    }));
  }

  /**
   * Get leader qualification requirements
   */
  async getLeaderRequirements() {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      // These would be stored in the contract
      return {
        minDirectReferrals: 5,
        minTeamSize: 50,
        minEarnings: 1000,
        minActiveReferrals: 3,
      };
    } catch (error) {
      return {
        minDirectReferrals: 5,
        minTeamSize: 50,
        minEarnings: 1000,
        minActiveReferrals: 3,
      };
    }
  }

  /**
   * Generate fallback earnings history
   */
  generateFallbackHistory(days) {
    // Return empty history for production
    return [];
  }

  /**
   * Utility methods
   */
  formatEarnings(weiAmount) {
    try {
      if (!weiAmount) return 0;
      return parseFloat(ethers.formatEther(weiAmount));
    } catch (error) {
      return 0;
    }
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearCache() {
    this.cache.clear();
  }

  getFallbackEarningsBreakdown() {
    return {
      total: 0,
      directReferral: {
        total: 0,
        count: 0,
        rate: 40,
        recent: [],
        averagePerReferral: 0,
      },
      levelBonus: {
        total: 0,
        currentLevel: 0,
        rate: 10,
        maxLevel: 10,
        levelBreakdown: [],
      },
      uplineBonus: {
        total: 0,
        upline: '0x0000000000000000000000000000000000000000',
        position: 0,
        rate: 10,
        side: null,
      },
      leaderPool: {
        total: 0,
        isQualified: false,
        rank: 'none',
        rate: 10,
        requirements: {
          minDirectReferrals: 5,
          minTeamSize: 50,
          minEarnings: 1000,
        },
      },
      helpPool: {
        total: 0,
        isEligible: false,
        rate: 30,
        nextDistribution: null,
        weeklyAverage: 0,
      },
      history: this.generateFallbackHistory(30),
      lastUpdated: new Date(),
    };
  }
}

// Export singleton instance
export const earningsApi = new EarningsApiService();
export default earningsApi;
