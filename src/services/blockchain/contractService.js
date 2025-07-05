/**
 * Blockchain Contract Service
 * Enhanced service for interacting with LeadFive smart contracts
 */

import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contracts';

class ContractService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.eventListeners = new Map();
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds

    // Enhanced error handling and retry configuration
    this.retryAttempts = 3;
    this.retryDelay = 1000; // Base delay in milliseconds
    this.maxRetryDelay = 5000; // Maximum delay
    this.isConnected = false;
    this.lastConnectionAttempt = 0;
    this.connectionCooldown = 10000; // 10 seconds between connection attempts
  }

  /**
   * Execute an operation with retry logic and exponential backoff
   */
  async executeWithRetry(operation, maxAttempts = this.retryAttempts) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        if (attempt === maxAttempts) {
          console.error(
            `Operation failed after ${maxAttempts} attempts:`,
            error
          );
          throw error;
        }

        const delay = Math.min(
          this.retryDelay * Math.pow(2, attempt - 1),
          this.maxRetryDelay
        );
        console.warn(
          `Attempt ${attempt} failed, retrying in ${delay}ms...`,
          error.message
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Initialize the contract service
   */
  async initialize(provider, account) {
    try {
      this.provider = provider;
      this.account = account;

      if (provider) {
        this.signer = await provider.getSigner();
        this.contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          this.signer
        );

        // Set up event listeners
        this.setupEventListeners();

        console.log('Contract service initialized successfully');
        return true;
      }
    } catch (error) {
      console.error('Error initializing contract service:', error);
      throw new ContractError('Failed to initialize contract service', error);
    }
  }

  /**
   * Set up event listeners for real-time updates
   */
  setupEventListeners() {
    if (!this.contract) return;

    try {
      // Listen for earnings updates
      this.contract.on(
        'EarningsUpdated',
        (user, amount, earningsType, event) => {
          console.log('Earnings updated:', { user, amount, earningsType });
          this.notifySubscribers('earnings', {
            user,
            amount: ethers.formatEther(amount),
            type: earningsType,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
          });
        }
      );

      // Listen for new referrals
      this.contract.on(
        'NewReferral',
        (sponsor, referral, packageValue, event) => {
          console.log('New referral:', { sponsor, referral, packageValue });
          this.notifySubscribers('referral', {
            sponsor,
            referral,
            packageValue: ethers.formatEther(packageValue),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
          });
        }
      );

      // Listen for withdrawals
      this.contract.on('WithdrawalProcessed', (user, amount, fee, event) => {
        console.log('Withdrawal processed:', { user, amount, fee });
        this.notifySubscribers('withdrawal', {
          user,
          amount: ethers.formatEther(amount),
          fee: ethers.formatEther(fee),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        });
      });

      // Listen for package upgrades
      this.contract.on(
        'PackageUpgraded',
        (user, oldPackage, newPackage, event) => {
          console.log('Package upgraded:', { user, oldPackage, newPackage });
          this.notifySubscribers('upgrade', {
            user,
            oldPackage: ethers.formatEther(oldPackage),
            newPackage: ethers.formatEther(newPackage),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
          });
        }
      );
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  }

  /**
   * Subscribe to contract events
   */
  subscribe(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Notify event subscribers
   */
  notifySubscribers(eventType, data) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  /**
   * Get user earnings with caching
   */
  /**
   * Get user earnings with retry logic and enhanced error handling
   */
  async getUserEarnings(userAddress) {
    const cacheKey = `earnings_${userAddress}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    return this.executeWithRetry(async () => {
      if (!this.contract) throw new Error('Contract not initialized');

      const [
        totalEarnings,
        directReferralEarnings,
        levelBonusEarnings,
        uplineBonusEarnings,
        leaderPoolEarnings,
        helpPoolEarnings,
      ] = await Promise.all([
        this.contract
          .getTotalEarnings(userAddress)
          .catch(() => ethers.BigNumber.from(0)),
        this.contract
          .getDirectReferralEarnings(userAddress)
          .catch(() => ethers.BigNumber.from(0)),
        this.contract
          .getLevelBonusEarnings(userAddress)
          .catch(() => ethers.BigNumber.from(0)),
        this.contract
          .getUplineBonusEarnings(userAddress)
          .catch(() => ethers.BigNumber.from(0)),
        this.contract
          .getLeaderPoolEarnings(userAddress)
          .catch(() => ethers.BigNumber.from(0)),
        this.contract
          .getHelpPoolEarnings(userAddress)
          .catch(() => ethers.BigNumber.from(0)),
      ]);

      const earnings = {
        total: this.formatEarnings(totalEarnings),
        directReferral: this.formatEarnings(directReferralEarnings),
        levelBonus: this.formatEarnings(levelBonusEarnings),
        uplineBonus: this.formatEarnings(uplineBonusEarnings),
        leaderPool: this.formatEarnings(leaderPoolEarnings),
        helpPool: this.formatEarnings(helpPoolEarnings),
        lastUpdated: new Date(),
      };

      this.setCache(cacheKey, earnings);
      return earnings;
    });
  }

  /**
   * Get user referral information with retry logic
   */
  async getUserReferrals(userAddress) {
    const cacheKey = `referrals_${userAddress}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    return this.executeWithRetry(async () => {
      if (!this.contract) throw new Error('Contract not initialized');

      const [directReferrals, teamSize, activeReferrals, referralList] =
        await Promise.all([
          this.contract
            .getDirectReferralCount(userAddress)
            .catch(() => ethers.BigNumber.from(0)),
          this.contract
            .getTeamSize(userAddress)
            .catch(() => ethers.BigNumber.from(0)),
          this.contract
            .getActiveReferrals(userAddress)
            .catch(() => ethers.BigNumber.from(0)),
          this.getDirectReferralsList(userAddress).catch(() => []),
        ]);

      const referrals = {
        directCount: Number(directReferrals),
        teamSize: Number(teamSize),
        activeCount: Number(activeReferrals),
        list: referralList,
        lastUpdated: new Date(),
      };

      this.setCache(cacheKey, referrals);
      return referrals;
    });
  }

  /**
   * Get direct referrals list with details
   */
  async getDirectReferralsList(userAddress, limit = 50) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const referralCount =
        await this.contract.getDirectReferralCount(userAddress);
      const count = Math.min(Number(referralCount), limit);
      const referrals = [];

      for (let i = 0; i < count; i++) {
        try {
          const referralAddress = await this.contract.getDirectReferralAt(
            userAddress,
            i
          );
          const details = await this.getUserDetails(referralAddress);
          referrals.push({
            address: referralAddress,
            ...details,
            index: i,
          });
        } catch (error) {
          console.error(`Error fetching referral ${i}:`, error);
        }
      }

      return referrals;
    } catch (error) {
      console.error('Error fetching referrals list:', error);
      return [];
    }
  }

  /**
   * Get user details for referral list
   */
  async getUserDetails(userAddress) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const [isActive, registrationTime, currentPackage, totalEarnings] =
        await Promise.all([
          this.contract.isUserActive(userAddress),
          this.contract.getUserRegistrationTime(userAddress),
          this.contract.getCurrentPackage(userAddress),
          this.contract.getTotalEarnings(userAddress),
        ]);

      return {
        isActive,
        registrationDate: new Date(Number(registrationTime) * 1000),
        packageValue: this.formatEarnings(currentPackage),
        totalEarnings: this.formatEarnings(totalEarnings),
      };
    } catch (error) {
      console.error('Error fetching user details:', error);
      return {
        isActive: false,
        registrationDate: new Date(),
        packageValue: 0,
        totalEarnings: 0,
      };
    }
  }

  /**
   * Get user package information
   */
  async getUserPackage(userAddress) {
    const cacheKey = `package_${userAddress}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const [
        currentPackage,
        maxEarnings,
        withdrawalRatio,
        isEligibleForUpgrade,
      ] = await Promise.all([
        this.contract.getCurrentPackage(userAddress),
        this.contract.getMaxEarnings(userAddress),
        this.contract.getWithdrawalRatio(userAddress),
        this.contract.isEligibleForUpgrade(userAddress),
      ]);

      const packageInfo = {
        value: this.formatEarnings(currentPackage),
        maxEarnings: this.formatEarnings(maxEarnings),
        tier: this.calculateTier(Number(currentPackage)),
        withdrawalRatio: {
          withdraw: Number(withdrawalRatio[0]),
          reinvest: Number(withdrawalRatio[1]),
        },
        canUpgrade: isEligibleForUpgrade,
        lastUpdated: new Date(),
      };

      this.setCache(cacheKey, packageInfo);
      return packageInfo;
    } catch (error) {
      console.error('Error fetching user package:', error);
      throw new ContractError('Failed to fetch user package', error);
    }
  }

  /**
   * Process withdrawal
   */
  async processWithdrawal(amount, percentage = 70) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const amountWei = ethers.parseEther(amount.toString());

      // Estimate gas
      const gasEstimate = await this.contract.withdraw.estimateGas(
        amountWei,
        percentage
      );
      const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100); // 20% buffer

      // Execute withdrawal
      const transaction = await this.contract.withdraw(amountWei, percentage, {
        gasLimit,
      });

      console.log('Withdrawal transaction submitted:', transaction.hash);

      // Wait for confirmation
      const receipt = await transaction.wait();

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        amount,
        percentage,
      };
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      throw new ContractError('Failed to process withdrawal', error);
    }
  }

  /**
   * Upgrade package
   */
  async upgradePackage(newPackageValue) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const valueWei = ethers.parseEther(newPackageValue.toString());

      // Estimate gas
      const gasEstimate =
        await this.contract.upgradePackage.estimateGas(valueWei);
      const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);

      // Execute upgrade
      const transaction = await this.contract.upgradePackage(valueWei, {
        gasLimit,
        value: valueWei, // Payment for upgrade
      });

      console.log('Package upgrade transaction submitted:', transaction.hash);

      const receipt = await transaction.wait();

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        newPackageValue,
      };
    } catch (error) {
      console.error('Error upgrading package:', error);
      throw new ContractError('Failed to upgrade package', error);
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    userAddress,
    eventTypes = ['all'],
    fromBlock = -10000
  ) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const events = [];

      // Fetch different event types
      if (eventTypes.includes('all') || eventTypes.includes('earnings')) {
        const earningsEvents = await this.contract.queryFilter(
          this.contract.filters.EarningsUpdated(userAddress),
          fromBlock
        );
        events.push(...earningsEvents.map(e => this.parseEvent(e, 'earnings')));
      }

      if (eventTypes.includes('all') || eventTypes.includes('referrals')) {
        const referralEvents = await this.contract.queryFilter(
          this.contract.filters.NewReferral(userAddress),
          fromBlock
        );
        events.push(...referralEvents.map(e => this.parseEvent(e, 'referral')));
      }

      if (eventTypes.includes('all') || eventTypes.includes('withdrawals')) {
        const withdrawalEvents = await this.contract.queryFilter(
          this.contract.filters.WithdrawalProcessed(userAddress),
          fromBlock
        );
        events.push(
          ...withdrawalEvents.map(e => this.parseEvent(e, 'withdrawal'))
        );
      }

      // Sort by block number (newest first)
      return events.sort((a, b) => b.blockNumber - a.blockNumber);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  /**
   * Parse contract event
   */
  parseEvent(event, type) {
    const base = {
      type,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      timestamp: new Date(event.blockNumber * 12 * 1000), // Approximate
      args: {},
    };

    // Parse specific event types
    switch (type) {
      case 'earnings':
        base.args = {
          amount: this.formatEarnings(event.args.amount),
          earningsType: event.args.earningsType,
        };
        break;
      case 'referral':
        base.args = {
          referral: event.args.referral,
          packageValue: this.formatEarnings(event.args.packageValue),
        };
        break;
      case 'withdrawal':
        base.args = {
          amount: this.formatEarnings(event.args.amount),
          fee: this.formatEarnings(event.args.fee),
        };
        break;
    }

    return base;
  }

  /**
   * Utility methods
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

  calculateTier(packageValue) {
    if (packageValue >= 200) return 4;
    if (packageValue >= 100) return 3;
    if (packageValue >= 50) return 2;
    return 1;
  }

  // Cache management
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
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.contract) return { status: 'not_initialized' };

      // Try a simple read operation
      const contractBalance = await this.provider.getBalance(CONTRACT_ADDRESS);

      return {
        status: 'healthy',
        contractAddress: CONTRACT_ADDRESS,
        contractBalance: this.formatEarnings(contractBalance),
        blockNumber: await this.provider.getBlockNumber(),
        network: await this.provider.getNetwork(),
      };
    } catch (error) {
      console.error('Contract health check failed:', error);
      return {
        status: 'error',
        error: error.message,
      };
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
    this.eventListeners.clear();
    this.clearCache();
  }
}

// Custom error class
class ContractError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'ContractError';
    this.originalError = originalError;
  }
}

// Export singleton instance
export const contractService = new ContractService();
export { ContractError };
export default contractService;
