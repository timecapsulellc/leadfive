/**
 * Production Data Service - Real Blockchain Integration
 * Replaces all mock data with live smart contract data
 * Version: 1.0 - Production Ready
 */

import { ethers } from 'ethers';
import { LEAD_FIVE_CONFIG, LEAD_FIVE_ABI, PACKAGE_AMOUNTS } from '../contracts-leadfive.js';

class ProductionDataService {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.signer = null;
    this.eventCache = new Map();
    this.isInitialized = false;
  }

  // Initialize the service with wallet connection
  async initialize(provider, signer) {
    try {
      this.provider = provider;
      this.signer = signer;
      this.contract = new ethers.Contract(
        LEAD_FIVE_CONFIG.address,
        LEAD_FIVE_ABI,
        this.provider
      );
      this.isInitialized = true;
      console.log('✅ Production Data Service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Production Data Service:', error);
      return false;
    }
  }

  // Get real user data from smart contract
  async getRealUserData(userAddress) {
    try {
      if (!this.isInitialized || !userAddress) {
        return this.getFallbackUserData();
      }

      // Get user info from smart contract
      const userInfo = await this.contract.getUserInfo(userAddress);
      
      // Get direct referrals
      const directReferrals = await this.getDirectReferrals(userAddress);
      
      // Get team size and genealogy
      const teamData = await this.getTeamData(userAddress);
      
      // Calculate earnings breakdown
      const earningsBreakdown = this.calculateEarningsBreakdown(userInfo);
      
      // Get withdrawal data
      const withdrawalData = this.calculateWithdrawalRatio(userInfo.directReferrals);

      return {
        // Basic Info
        address: userAddress,
        isRegistered: userInfo.isRegistered,
        referralCode: userInfo.referralCode || this.generateReferralCode(userAddress),
        
        // Financial Data
        totalEarnings: parseFloat(ethers.formatUnits(userInfo.totalEarnings, 18)),
        balance: parseFloat(ethers.formatUnits(userInfo.balance, 18)),
        totalInvestment: parseFloat(ethers.formatUnits(userInfo.totalInvestment, 18)),
        earningsCap: parseFloat(ethers.formatUnits(userInfo.earningsCap, 18)),
        
        // Earnings Breakdown (40%, 10%, 10%, 10%, 30%)
        directReferralEarnings: earningsBreakdown.directReferral,
        levelBonusEarnings: earningsBreakdown.levelBonus,
        uplineBonusEarnings: earningsBreakdown.uplineBonus,
        leaderPoolEarnings: earningsBreakdown.leaderPool,
        helpPoolEarnings: earningsBreakdown.helpPool,
        
        // Team Structure
        directReferrals: parseInt(userInfo.directReferrals),
        teamSize: parseInt(userInfo.teamSize),
        activeReferrals: directReferrals.filter(ref => ref.isActive).length,
        
        // Package Info
        currentPackage: this.getPackageAmount(userInfo.packageLevel),
        packageLevel: parseInt(userInfo.packageLevel),
        maxEarnings: parseFloat(ethers.formatUnits(userInfo.earningsCap, 18)),
        packageProgress: this.calculatePackageProgress(userInfo),
        
        // Ranking
        currentTier: parseInt(userInfo.rank) || 1,
        currentLevel: parseInt(userInfo.matrixLevel),
        leaderRank: this.getLeaderRank(userInfo),
        
        // Performance Metrics
        dailyEarnings: await this.getDailyEarnings(userAddress),
        weeklyEarnings: await this.getWeeklyEarnings(userAddress),
        monthlyEarnings: await this.getMonthlyEarnings(userAddress),
        pendingRewards: parseFloat(ethers.formatUnits(userInfo.balance, 18)),
        
        // Withdrawal System
        withdrawalRatio: withdrawalData,
        referralBasedRatio: true,
        
        // Eligibility
        helpPoolEligible: userInfo.isEligibleForHelpPool,
        leaderPoolEligible: this.checkLeaderPoolEligibility(userInfo),
        matrixEligible: userInfo.isRegistered,
        
        // Additional Data
        registrationTime: parseInt(userInfo.registrationTime),
        lastHelpPoolClaim: parseInt(userInfo.lastHelpPoolClaim),
        matrixPosition: parseInt(userInfo.matrixPosition),
        
        // Team Data
        teamMembers: teamData.members,
        genealogyTree: teamData.tree,
        
        // Real-time flags
        isLiveData: true,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching real user data:', error);
      return this.getFallbackUserData();
    }
  }

  // Get direct referrals with real data
  async getDirectReferrals(userAddress) {
    try {
      const referrals = [];
      const userInfo = await this.contract.getUserInfo(userAddress);
      const referralCount = parseInt(userInfo.directReferrals);
      
      for (let i = 0; i < referralCount; i++) {
        try {
          const referralAddress = await this.contract.directReferrals(userAddress, i);
          const referralInfo = await this.contract.getUserInfo(referralAddress);
          
          referrals.push({
            address: referralAddress,
            package: this.getPackageAmount(referralInfo.packageLevel),
            earnings: parseFloat(ethers.formatUnits(referralInfo.totalEarnings, 18)),
            registrationTime: parseInt(referralInfo.registrationTime),
            isActive: referralInfo.isRegistered && !referralInfo.isBlacklisted,
            teamSize: parseInt(referralInfo.teamSize),
          });
        } catch (error) {
          console.error(`Error fetching referral ${i}:`, error);
        }
      }
      
      return referrals;
    } catch (error) {
      console.error('Error fetching direct referrals:', error);
      return [];
    }
  }

  // Get real genealogy tree
  async getGenealogyTree(userAddress, maxDepth = 5) {
    try {
      const buildTree = async (address, depth = 0) => {
        if (depth >= maxDepth) return null;
        
        const userInfo = await this.contract.getUserInfo(address);
        const directReferrals = await this.getDirectReferrals(address);
        
        const node = {
          address,
          package: this.getPackageAmount(userInfo.packageLevel),
          earnings: parseFloat(ethers.formatUnits(userInfo.totalEarnings, 18)),
          teamSize: parseInt(userInfo.teamSize),
          level: depth,
          children: [],
        };
        
        // Recursively build children
        for (const referral of directReferrals.slice(0, 10)) { // Limit for performance
          const child = await buildTree(referral.address, depth + 1);
          if (child) node.children.push(child);
        }
        
        return node;
      };
      
      return await buildTree(userAddress);
    } catch (error) {
      console.error('Error building genealogy tree:', error);
      return null;
    }
  }

  // Get real earnings history from blockchain events
  async getEarningsHistory(userAddress, days = 30) {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const blocksPerDay = 28800; // Approx BSC blocks per day
      const fromBlock = currentBlock - (days * blocksPerDay);
      
      // Get BonusDistributed events for this user
      const filter = this.contract.filters.BonusDistributed(userAddress);
      const events = await this.contract.queryFilter(filter, fromBlock, currentBlock);
      
      const history = [];
      for (const event of events) {
        const block = await this.provider.getBlock(event.blockNumber);
        history.push({
          amount: parseFloat(ethers.formatUnits(event.args.amount, 18)),
          bonusType: this.getBonusTypeName(event.args.bonusType),
          timestamp: block.timestamp * 1000,
          txHash: event.transactionHash,
        });
      }
      
      return history.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching earnings history:', error);
      return [];
    }
  }

  // Get pool balances
  async getPoolBalances() {
    try {
      const [helpPool, leaderPool, clubPool] = await this.contract.getPoolBalances();
      
      return {
        helpPool: parseFloat(ethers.formatUnits(helpPool, 18)),
        leaderPool: parseFloat(ethers.formatUnits(leaderPool, 18)),
        clubPool: parseFloat(ethers.formatUnits(clubPool, 18)),
        total: parseFloat(ethers.formatUnits(helpPool.add(leaderPool).add(clubPool), 18)),
      };
    } catch (error) {
      console.error('Error fetching pool balances:', error);
      return { helpPool: 0, leaderPool: 0, clubPool: 0, total: 0 };
    }
  }

  // Get total users count
  async getTotalUsers() {
    try {
      const totalUsers = await this.contract.totalUsers();
      return parseInt(totalUsers);
    } catch (error) {
      console.error('Error fetching total users:', error);
      return 0;
    }
  }

  // Helper functions
  calculateEarningsBreakdown(userInfo) {
    const totalEarnings = parseFloat(ethers.formatUnits(userInfo.totalEarnings, 18));
    
    return {
      directReferral: totalEarnings * 0.40, // 40%
      levelBonus: totalEarnings * 0.10,     // 10%
      uplineBonus: totalEarnings * 0.10,    // 10%
      leaderPool: totalEarnings * 0.10,     // 10%
      helpPool: totalEarnings * 0.30,       // 30%
    };
  }

  calculateWithdrawalRatio(directReferrals) {
    const refs = parseInt(directReferrals);
    if (refs >= 3) return { withdraw: 100, reinvest: 0 };
    if (refs >= 1) return { withdraw: 80, reinvest: 20 };
    return { withdraw: 70, reinvest: 30 };
  }

  calculatePackageProgress(userInfo) {
    const totalEarnings = parseFloat(ethers.formatUnits(userInfo.totalEarnings, 18));
    const earningsCap = parseFloat(ethers.formatUnits(userInfo.earningsCap, 18));
    return earningsCap > 0 ? Math.min(100, (totalEarnings / earningsCap) * 100) : 0;
  }

  getPackageAmount(packageLevel) {
    const packages = { 1: 30, 2: 50, 3: 100, 4: 200 };
    return packages[parseInt(packageLevel)] || 0;
  }

  getLeaderRank(userInfo) {
    const directRefs = parseInt(userInfo.directReferrals);
    const teamSize = parseInt(userInfo.teamSize);
    
    if (directRefs >= 5 && teamSize >= 50) return 'shining-star';
    if (directRefs >= 3 && teamSize >= 20) return 'silver-star';
    return 'none';
  }

  checkLeaderPoolEligibility(userInfo) {
    return parseInt(userInfo.directReferrals) >= 2 && 
           this.calculatePackageProgress(userInfo) >= 50;
  }

  getBonusTypeName(bonusType) {
    const types = {
      0: 'Direct Referral',
      1: 'Level Bonus',
      2: 'Upline Bonus',
      3: 'Leader Pool',
      4: 'Help Pool',
      5: 'Club Pool'
    };
    return types[parseInt(bonusType)] || 'Unknown';
  }

  generateReferralCode(address) {
    return address.slice(-8).toUpperCase();
  }

  async getDailyEarnings(userAddress) {
    const history = await this.getEarningsHistory(userAddress, 1);
    return history.reduce((sum, entry) => sum + entry.amount, 0);
  }

  async getWeeklyEarnings(userAddress) {
    const history = await this.getEarningsHistory(userAddress, 7);
    return history.reduce((sum, entry) => sum + entry.amount, 0);
  }

  async getMonthlyEarnings(userAddress) {
    const history = await this.getEarningsHistory(userAddress, 30);
    return history.reduce((sum, entry) => sum + entry.amount, 0);
  }

  async getTeamData(userAddress) {
    try {
      const directReferrals = await this.getDirectReferrals(userAddress);
      const genealogyTree = await this.getGenealogyTree(userAddress, 3);
      
      return {
        members: directReferrals,
        tree: genealogyTree,
        totalSize: genealogyTree ? genealogyTree.teamSize : 0,
      };
    } catch (error) {
      console.error('Error fetching team data:', error);
      return { members: [], tree: null, totalSize: 0 };
    }
  }

  // Fallback data for when blockchain is unavailable
  getFallbackUserData() {
    return {
      // Use zeros/defaults when no real data available
      totalEarnings: 0,
      directReferralEarnings: 0,
      levelBonusEarnings: 0,
      uplineBonusEarnings: 0,
      leaderPoolEarnings: 0,
      helpPoolEarnings: 0,
      teamSize: 0,
      directReferrals: 0,
      activeReferrals: 0,
      currentPackage: 0,
      packageProgress: 0,
      dailyEarnings: 0,
      weeklyEarnings: 0,
      monthlyEarnings: 0,
      pendingRewards: 0,
      withdrawalRatio: { withdraw: 70, reinvest: 30 },
      helpPoolEligible: false,
      leaderPoolEligible: false,
      matrixEligible: false,
      isLiveData: false,
      lastUpdated: new Date().toISOString(),
    };
  }

  // Real-time event listeners
  setupEventListeners(callback) {
    if (!this.contract) return;

    // Listen for new registrations
    this.contract.on('UserRegistered', (user, referrer, packageLevel, amount) => {
      callback('user_registered', {
        user,
        referrer,
        packageLevel: parseInt(packageLevel),
        amount: parseFloat(ethers.formatUnits(amount, 18)),
      });
    });

    // Listen for bonus distributions
    this.contract.on('BonusDistributed', (recipient, amount, bonusType) => {
      callback('bonus_distributed', {
        recipient,
        amount: parseFloat(ethers.formatUnits(amount, 18)),
        bonusType: this.getBonusTypeName(bonusType),
      });
    });

    // Listen for withdrawals
    this.contract.on('Withdrawal', (user, amount) => {
      callback('withdrawal', {
        user,
        amount: parseFloat(ethers.formatUnits(amount, 18)),
      });
    });
  }
}

// Export singleton instance
export const productionDataService = new ProductionDataService();
export default productionDataService;
