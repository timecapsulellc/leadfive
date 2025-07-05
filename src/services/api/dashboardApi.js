/**
 * Dashboard API Service
 * Handles all dashboard-related API calls and data fetching
 */

import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contracts';
import { contractService } from '../ContractService';

class DashboardApiService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds cache
  }

  /**
   * Initialize the service with provider and account
   */
  async initialize(provider, account) {
    this.provider = provider;
    this.account = account;

    if (provider && account) {
      try {
        // Use the enhanced contract service
        await contractService.initialize(provider, account);
        console.log(
          'Dashboard API service initialized successfully with enhanced contract service'
        );
      } catch (error) {
        console.error('Failed to initialize contract service:', error);
        console.warn('Will use fallback data for dashboard');
      }
    }
  }

  /**
   * Fetch comprehensive dashboard data
   */
  async getDashboardData(account) {
    if (!contractService.isAvailable()) {
      console.warn('Contract service not available, using fallback data');
      return this.getFallbackDashboardData();
    }

    const cacheKey = `dashboard_${account}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Fetch data from smart contract
      const [userInfo, earnings, referrals, teamInfo, packageInfo] =
        await Promise.allSettled([
          contractService.getUserInfo(account),
          this.getUserEarnings(account),
          this.getUserReferrals(account),
          contractService.getTeamStructure(account),
          this.getPackageInfo(account),
        ]);

      const dashboardData = {
        user: userInfo.status === 'fulfilled' ? userInfo.value : {},
        earnings: earnings.status === 'fulfilled' ? earnings.value : {},
        referrals: referrals.status === 'fulfilled' ? referrals.value : {},
        team: teamInfo.status === 'fulfilled' ? teamInfo.value : {},
        package: packageInfo.status === 'fulfilled' ? packageInfo.value : {},
        lastUpdated: new Date(),
        source: 'blockchain',
      };

      this.setCache(cacheKey, dashboardData);
      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return this.getFallbackDashboardData();
    }
  }

  /**
   * Get user basic information from contract
   */
  async getUserInfo(account) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      // Verify contract method exists before calling
      if (typeof this.contract.users !== 'function') {
        console.warn('Contract method "users" not available, using fallback');
        return this.getFallbackUserInfo(account);
      }

      // Try to get user info from contract with error handling
      try {
        const userInfo = await this.contract.users(account);

        return {
          account,
          isActive: userInfo.isRegistered || true,
          registrationTime: new Date(),
          currentLevel: Number(userInfo.packageLevel) || 1,
          memberSince: new Date(),
          isRegistered: userInfo.isRegistered || true,
          isBlacklisted: userInfo.isBlacklisted || false,
          referrer:
            userInfo.referrer || '0x0000000000000000000000000000000000000000',
          balance: userInfo.balance || 0,
          totalInvestment: userInfo.totalInvestment || 0,
          totalEarnings: userInfo.totalEarnings || 0,
          directReferrals: userInfo.directReferrals || 0,
          teamSize: userInfo.teamSize || 0,
          packageLevel: userInfo.packageLevel || 1,
        };
      } catch (contractError) {
        console.warn(
          'Contract users() call failed, using fallback data:',
          contractError.message.slice(0, 100)
        );
        return this.getFallbackUserInfo(account);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      return this.getFallbackUserInfo(account);
    }
  }

  /**
   * Get fallback user info when contract calls fail
   */
  getFallbackUserInfo(account) {
    return {
      account,
      isActive: false,
      registrationTime: null,
      currentLevel: 0,
      memberSince: null,
      isRegistered: false,
      isBlacklisted: false,
      referrer: '0x0000000000000000000000000000000000000000',
      balance: 0,
      totalInvestment: 0,
      totalEarnings: 0,
      directReferrals: 0,
      teamSize: 0,
      packageLevel: 0,
    };
  }

  /**
   * Get user earnings breakdown from contract
   */
  async getUserEarnings(account) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      // Try to get user info which contains total earnings
      try {
        const userInfo = await this.contract.users(account);
        return {
          totalEarnings: this.formatEarnings(userInfo.totalEarnings || 0),
          directReferralEarnings: 0, // Not directly available in contract
          levelBonusEarnings: 0, // Not directly available in contract
          uplineBonusEarnings: 0, // Not directly available in contract
          leaderPoolEarnings: 0, // Not directly available in contract
          helpPoolEarnings: 0, // Not directly available in contract
          dailyEarnings: 0, // Calculate from recent transactions
          pendingRewards: this.formatEarnings(userInfo.balance || 0),
        };
      } catch (contractError) {
        console.warn(
          'Contract earnings call failed, using fallback:',
          contractError.message
        );
        return this.getFallbackEarnings();
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      return this.getFallbackEarnings();
    }
  }

  /**
   * Get user referrals and team data
   */
  async getUserReferrals(account) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      // Try to get referral data with fallback
      try {
        const userInfo = await this.contract.users(account);
        return {
          directReferrals: Number(userInfo.directReferrals) || 0,
          teamSize: Number(userInfo.teamSize) || 0,
          activeReferrals: Number(userInfo.directReferrals) || 0,
          referralList: [], // Not available in current contract
        };
      } catch (contractError) {
        console.warn(
          'Contract referrals call failed, using fallback:',
          contractError.message
        );
        return {
          directReferrals: 0,
          teamSize: 0,
          activeReferrals: 0,
          referralList: [],
        };
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
      return {
        directReferrals: 0,
        teamSize: 0,
        activeReferrals: 0,
        referralList: [],
      };
    }
  }

  /**
   * Get team structure and genealogy data
   */
  async getTeamInfo(account) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      // Try to get team data with fallback
      try {
        const userInfo = await this.contract.users(account);
        return {
          upline:
            userInfo.referrer || '0x0000000000000000000000000000000000000000',
          position: 1,
          level: 1,
          side: 'left',
          teamSize: Number(userInfo.teamSize) || 0,
        };
      } catch (contractError) {
        console.warn(
          'Contract team call failed, using fallback:',
          contractError.message
        );
        return {
          upline: '0x0000000000000000000000000000000000000000',
          position: 1,
          level: 1,
          side: 'left',
          teamSize: 0,
        };
      }
    } catch (error) {
      console.error('Error fetching team info:', error);
      return {
        upline: '0x0000000000000000000000000000000000000000',
        position: 1,
        level: 1,
        side: 'left',
      };
    }
  }

  /**
   * Get user package and investment information
   */
  async getPackageInfo(account) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      // Try to get package data with fallback
      try {
        const userInfo = await this.contract.users(account);
        const packageLevel = Number(userInfo.packageLevel) || 1;
        const packageValue = packageLevel * 50; // Estimate based on level

        return {
          currentPackage: packageValue,
          maxEarnings: packageValue * 4, // 4X return policy
          currentTier: packageLevel,
          upgradeAvailable: packageLevel < 4,
          totalInvestment: this.formatEarnings(userInfo.totalInvestment || 0),
          earningsCap: this.formatEarnings(userInfo.earningsCap || 0),
        };
      } catch (contractError) {
        console.warn(
          'Contract package call failed, using fallback:',
          contractError.message
        );
        return {
          currentPackage: 100,
          maxEarnings: 400,
          currentTier: 1,
          upgradeAvailable: true,
          totalInvestment: 0,
          earningsCap: 0,
        };
      }
    } catch (error) {
      console.error('Error fetching package info:', error);
      return {
        currentPackage: 100,
        maxEarnings: 400,
        currentTier: 1,
        upgradeAvailable: true,
      };
    }
  }

  /**
   * Format earnings from wei to USD
   */
  formatEarnings(weiAmount) {
    try {
      if (!weiAmount) return 0;
      return parseFloat(ethers.formatEther(weiAmount));
    } catch (error) {
      console.error('Error formatting earnings:', error);
      return 0;
    }
  }

  /**
   * Calculate tier based on package value
   */
  calculateTier(packageValue) {
    if (packageValue >= 200) return 4;
    if (packageValue >= 100) return 3;
    if (packageValue >= 50) return 2;
    return 1;
  }

  /**
   * Cache management
   */
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

  /**
   * Fallback data when contract is unavailable
   */
  getFallbackDashboardData() {
    return {
      user: {
        account: this.account || '0x0000000000000000000000000000000000000000',
        isActive: false,
        registrationTime: null,
        currentLevel: 0,
        memberSince: null,
      },
      earnings: this.getFallbackEarnings(),
      referrals: {
        directReferrals: 0,
        teamSize: 0,
        activeReferrals: 0,
        referralList: [],
      },
      team: {
        upline: '0x0000000000000000000000000000000000000000',
        position: 0,
        level: 0,
        side: null,
      },
      package: {
        currentPackage: 0,
        maxEarnings: 0,
        currentTier: 0,
        upgradeAvailable: false,
      },
      lastUpdated: new Date(),
      source: 'fallback',
    };
  }

  getFallbackEarnings() {
    return {
      totalEarnings: 0,
      directReferralEarnings: 0,
      levelBonusEarnings: 0,
      uplineBonusEarnings: 0,
      leaderPoolEarnings: 0,
      helpPoolEarnings: 0,
      dailyEarnings: 0,
      pendingRewards: 0,
    };
  }

  /**
   * Refresh data (force cache clear and refetch)
   */
  async refreshData(account) {
    this.clearCache();
    return await this.getDashboardData(account);
  }
}

// Export singleton instance
export const dashboardApi = new DashboardApiService();
export default dashboardApi;
