/**
 * LEADFIVE COMPENSATION SERVICE
 * Core functionality restoration and smart contract integration
 */

import { ethers } from 'ethers';
import { APP_CONFIG } from '../config/app.js';

class CompensationService {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.provider = null;
    this.init();
  }

  async init() {
    try {
      this.provider = new ethers.JsonRpcProvider(
        APP_CONFIG.contract.network.rpcUrl
      );
      this.contract = new ethers.Contract(
        APP_CONFIG.contract.address,
        this.getABI(),
        this.provider
      );
      console.log('✅ Compensation service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize compensation service:', error);
    }
  }

  getABI() {
    return [
      'function getUserInfo(address) view returns (tuple(bool isRegistered, bool isBlacklisted, address referrer, uint96 balance, uint96 totalInvestment, uint96 totalEarnings, uint96 earningsCap, uint32 directReferrals, uint32 teamSize, uint8 packageLevel, uint8 rank, uint8 withdrawalRate, uint32 lastHelpPoolClaim, bool isEligibleForHelpPool, uint32 matrixPosition, uint8 matrixLevel, uint32 registrationTime, string referralCode, uint96 pendingRewards, uint32 lastWithdrawal, uint32 matrixCycles, uint8 leaderRank, uint96 leftLegVolume, uint96 rightLegVolume, uint32 fastStartExpiry, bool isActive))',
      'function getPackageInfo(uint8 packageLevel) view returns (tuple(uint256 price, uint256 directBonus, uint256 levelBonus, bool isActive))',
      'function getPendingRewards(address user) view returns (tuple(uint96 pendingUserRewards, uint96 pendingCommissionRewards, uint96 totalPending))',
      'function getPoolBalances() view returns (uint256[] memory)',
      'function register(address referrer, uint8 packageLevel, bool useUSDT) external payable',
      'function withdraw() external',
      'function claimRewards() external',
    ];
  }

  /**
   * Validate compensation against smart contract rules
   */
  async validateCompensation(userAddress, transactionAmount, level = 1) {
    try {
      const userInfo = await this.contract.getUserInfo(userAddress);
      const packageInfo = await this.contract.getPackageInfo(
        userInfo.packageLevel
      );

      const directBonusRate = Number(packageInfo.directBonus) / 10000; // Convert from basis points
      const expectedDirectBonus = transactionAmount * directBonusRate;

      const levelBonusRate = Number(packageInfo.levelBonus) / 10000;
      const expectedLevelBonus = transactionAmount * levelBonusRate;

      return {
        eligible: userInfo.isRegistered && !userInfo.isBlacklisted,
        directBonus: expectedDirectBonus,
        levelBonus: expectedLevelBonus,
        packageLevel: Number(userInfo.packageLevel),
        maxEarnings: Number(userInfo.earningsCap),
        currentEarnings: Number(userInfo.totalEarnings),
        remainingCap:
          Number(userInfo.earningsCap) - Number(userInfo.totalEarnings),
        timestamp: new Date().toISOString(),
        isValid:
          userInfo.isRegistered && !userInfo.isBlacklisted && userInfo.isActive,
      };
    } catch (error) {
      console.error('❌ Compensation validation failed:', error);
      return {
        eligible: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Calculate matrix spillover logic
   */
  async handleMatrixSpillover(
    sponsorAddress,
    newMemberAddress,
    matrixPosition
  ) {
    try {
      const sponsorInfo = await this.contract.getUserInfo(sponsorAddress);
      const matrixLevel = Number(sponsorInfo.matrixLevel);

      // Matrix positions: 3 direct spots, then spillover
      const spilloverLogic = {
        level: matrixLevel,
        position: matrixPosition,
        spilloverRequired: matrixPosition > 3,
        uplineAddress: sponsorInfo.referrer,
      };

      if (
        spilloverLogic.spilloverRequired &&
        spilloverLogic.uplineAddress !== ethers.ZeroAddress
      ) {
        // Find next available position in upline
        const uplineInfo = await this.contract.getUserInfo(
          spilloverLogic.uplineAddress
        );
        spilloverLogic.spilloverRecipient = spilloverLogic.uplineAddress;
        spilloverLogic.newPosition = ((matrixPosition - 3) % 3) + 1; // Cycle through positions
      }

      return {
        spillover_recipient: spilloverLogic.spilloverRecipient || null,
        position_valid: true,
        matrix_level: matrixLevel,
        new_position: spilloverLogic.newPosition || matrixPosition,
        upline_address: spilloverLogic.uplineAddress,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Matrix spillover calculation failed:', error);
      return {
        spillover_recipient: null,
        position_valid: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get compensation rates by level
   */
  async getCompensationRate(level) {
    const rates = {
      1: 0.2, // 20% direct referral
      2: 0.1, // 10% second level
      3: 0.05, // 5% third level
      4: 0.03, // 3% fourth level
      5: 0.02, // 2% fifth level
    };

    return rates[level] || 0;
  }

  /**
   * Calculate total earnings for a user
   */
  async calculateTotalEarnings(userAddress) {
    try {
      const userInfo = await this.contract.getUserInfo(userAddress);
      const pendingRewards = await this.contract.getPendingRewards(userAddress);

      return {
        totalEarnings: ethers.formatEther(userInfo.totalEarnings),
        pendingRewards: ethers.formatEther(pendingRewards.totalPending),
        availableBalance: ethers.formatEther(userInfo.balance),
        earningsCap: ethers.formatEther(userInfo.earningsCap),
        withdrawalRate: Number(userInfo.withdrawalRate),
        packageLevel: Number(userInfo.packageLevel),
        rank: Number(userInfo.rank),
        directReferrals: Number(userInfo.directReferrals),
        teamSize: Number(userInfo.teamSize),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Failed to calculate total earnings:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get pool distribution information
   */
  async getPoolDistribution() {
    try {
      const poolBalances = await this.contract.getPoolBalances();

      return {
        leaderPool: ethers.formatEther(poolBalances[0]),
        helpPool: ethers.formatEther(poolBalances[1]),
        clubPool: ethers.formatEther(poolBalances[2]),
        totalPools: ethers.formatEther(
          poolBalances.reduce((a, b) => a + b, 0n)
        ),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Failed to get pool distribution:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Validate package eligibility and pricing
   */
  async validatePackageRegistration(packageLevel, paymentMethod = 'BNB') {
    try {
      if (packageLevel < 1 || packageLevel > 4) {
        throw new Error('Invalid package level. Must be 1-4.');
      }

      const packageInfo = await this.contract.getPackageInfo(packageLevel);

      if (!packageInfo.isActive) {
        throw new Error(`Package level ${packageLevel} is not active`);
      }

      const priceInUSDT = ethers.formatEther(packageInfo.price);

      return {
        valid: true,
        packageLevel: packageLevel,
        priceUSDT: priceInUSDT,
        directBonusRate: Number(packageInfo.directBonus) / 100, // Convert to percentage
        levelBonusRate: Number(packageInfo.levelBonus) / 100,
        paymentMethod: paymentMethod,
        isActive: packageInfo.isActive,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Package validation failed:', error);
      return {
        valid: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get referral tree data for genealogy visualization
   */
  async getReferralTreeData(rootAddress, depth = 3) {
    try {
      const treeData = await this.buildReferralTree(rootAddress, depth, 0);
      return {
        success: true,
        treeData: treeData,
        rootAddress: rootAddress,
        depth: depth,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Failed to get referral tree:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async buildReferralTree(address, maxDepth, currentDepth) {
    if (currentDepth >= maxDepth) return null;

    try {
      const userInfo = await this.contract.getUserInfo(address);

      const node = {
        address: address,
        packageLevel: Number(userInfo.packageLevel),
        totalEarnings: ethers.formatEther(userInfo.totalEarnings),
        directReferrals: Number(userInfo.directReferrals),
        teamSize: Number(userInfo.teamSize),
        rank: Number(userInfo.rank),
        isActive: userInfo.isActive,
        children: [],
      };

      // Note: Getting actual referrals would require events or additional contract methods
      // This is a simplified version for demonstration

      return node;
    } catch (error) {
      console.error(`❌ Error building tree for ${address}:`, error);
      return null;
    }
  }
}

export default CompensationService;
