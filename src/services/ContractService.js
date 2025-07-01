import { ethers } from 'ethers';

/**
 * 🔗 LEAD FIVE CONTRACT SERVICE
 * Handles all smart contract interactions with proper error handling,
 * retry logic, and data formatting for the Lead Five platform
 */
class LeadFiveContractService {
  constructor() {
    this.contract = null;
    this.readOnlyContract = null;
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.isInitialized = false;
    this.eventListeners = new Map();
    this.retryCount = 3;
    this.retryDelay = 1000;
  }

  /**
   * Initialize the contract service with provider and account
   */
  async initialize(provider, account) {
    try {
      this.provider = provider;
      this.account = account;
      this.signer = provider.getSigner();

      // Create contract instance with fallback configuration
      let contractAddress = window.LEADFIVE_CONTRACT_CONFIG?.address;
      let contractABI = window.CONTRACT_ABI;
      
      // Fallback configuration if scripts didn't load
      if (!contractAddress) {
        console.warn('⚠️ Contract config not loaded from window, using fallback...');
        contractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498"; // BSC Mainnet
        contractABI = [
          "function registerUser(address sponsor, uint8 packageTier) external",
          "function withdraw(uint256 amount) external",
          "function upgradePackage(uint8 newTier) external",
          "function getUserInfo(address user) external view returns (uint256 totalInvested, uint256 registrationTime, uint256 teamSize, uint256 totalEarnings, uint256 withdrawableAmount, uint8 packageTier, uint8 leaderRank, bool isCapped, bool isActive, address sponsor, uint32 directReferrals)",
          "function getPoolEarnings(address user) external view returns (uint128[5] memory)",
          "function getDirectReferrals(address user) external view returns (address[] memory)",
          "function getWithdrawalRate(address user) external view returns (uint256)",
          "function isUserRegistered(address user) external view returns (bool)",
          "function totalUsers() external view returns (uint256)",
          "function totalVolume() external view returns (uint256)"
        ];
      }

      this.contract = new ethers.Contract(
        contractAddress,
        contractABI,
        this.signer
      );

      // Create read-only contract for view functions (ethers v6 compatibility)
      this.readOnlyContract = new ethers.Contract(
        contractAddress,
        contractABI,
        this.provider
      );

      this.isInitialized = true;
      console.log('✅ LeadFive Contract Service initialized with address:', contractAddress);
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize contract service:', error);
      throw error;
    }
  }

  /**
   * Check if user is registered in the system
   */
  async isUserRegistered(userAddress = null) {
    const address = userAddress || this.account;
    
    // Validate address format
    if (!address || typeof address !== 'string' || !address.startsWith('0x')) {
      console.warn('⚠️ Invalid address provided to isUserRegistered:', address);
      return false;
    }
    
    return this.executeWithRetry(async () => {
      return await this.readOnlyContract.isUserRegistered(address);
    });
  }

  /**
   * Get complete user information from contract
   */
  async getUserInfo(userAddress = null) {
    const address = userAddress || this.account;
    
    // Validate address format
    if (!address || typeof address !== 'string' || !address.startsWith('0x')) {
      console.warn('⚠️ Invalid address provided to getUserInfo:', address);
      throw new Error('Invalid wallet address');
    }
    
    return this.executeWithRetry(async () => {
      const result = await this.readOnlyContract.getUserInfo(address);
      
      return {
        totalInvested: ethers.formatUnits(result[0], 6), // USDT has 6 decimals
        registrationTime: Number(result[1]) * 1000, // Convert to milliseconds
        teamSize: Number(result[2]),
        totalEarnings: ethers.formatUnits(result[3], 6),
        withdrawableAmount: ethers.formatUnits(result[4], 6),
        packageTier: Number(result[5]),
        leaderRank: Number(result[6]),
        isCapped: result[7],
        isActive: result[8],
        sponsor: result[9],
        directReferrals: Number(result[10])
      };
    });
  }

  /**
   * Get earnings from all 5 pools
   */
  async getPoolEarnings(userAddress = null) {
    const address = userAddress || this.account;
    return this.executeWithRetry(async () => {
      const result = await this.readOnlyContract.getPoolEarnings(address);
      
      return {
        directReferral: ethers.formatUnits(result[0], 6),
        levelCommission: ethers.formatUnits(result[1], 6),
        globalHelp: ethers.formatUnits(result[2], 6),
        leaderBonus: ethers.formatUnits(result[3], 6),
        royaltyBonus: ethers.formatUnits(result[4], 6),
        total: result.reduce((sum, amount) => {
          return sum + parseFloat(ethers.formatUnits(amount, 6));
        }, 0).toFixed(6)
      };
    });
  }

  /**
   * Get direct referrals list
   */
  async getDirectReferrals(userAddress = null) {
    const address = userAddress || this.account;
    return this.executeWithRetry(async () => {
      const referrals = await this.readOnlyContract.getDirectReferrals(address);
      
      // Get detailed info for each referral
      const referralDetails = await Promise.all(
        referrals.map(async (referralAddress) => {
          try {
            const info = await this.getUserInfo(referralAddress);
            return {
              address: referralAddress,
              ...info
            };
          } catch (error) {
            console.warn(`Failed to get info for referral ${referralAddress}:`, error);
            return {
              address: referralAddress,
              packageTier: 0,
              totalInvested: '0',
              registrationTime: 0
            };
          }
        })
      );
      
      return referralDetails;
    });
  }

  /**
   * Get withdrawal rate for user
   */
  async getWithdrawalRate(userAddress = null) {
    const address = userAddress || this.account;
    return this.executeWithRetry(async () => {
      const rate = await this.readOnlyContract.getWithdrawalRate(address);
      return Number(rate);
    });
  }

  /**
   * Get global platform statistics
   */
  async getPlatformStats() {
    return this.executeWithRetry(async () => {
      const [totalUsers, totalVolume, globalHelpBalance, leaderBonusBalance] = await Promise.all([
        this.readOnlyContract.totalUsers(),
        this.readOnlyContract.totalVolume(),
        this.readOnlyContract.globalHelpPoolBalance(),
        this.readOnlyContract.leaderBonusPoolBalance()
      ]);

      return {
        totalUsers: Number(totalUsers),
        totalVolume: ethers.formatUnits(totalVolume, 6),
        globalHelpPoolBalance: ethers.formatUnits(globalHelpBalance, 6),
        leaderBonusPoolBalance: ethers.formatUnits(leaderBonusBalance, 6)
      };
    });
  }

  /**
   * Register new user with sponsor and package tier
   */
  async registerUser(sponsorAddress, packageTier) {
    if (!this.isInitialized) {
      throw new Error('Contract service not initialized');
    }

    try {
      // Get package amount
      const packageAmount = window.PACKAGE_AMOUNTS[packageTier];
      if (!packageAmount) {
        throw new Error('Invalid package tier');
      }

      // Estimate gas
      const gasEstimate = await this.contract.registerUser.estimateGas(
        sponsorAddress,
        packageTier
      );

      // Add 20% buffer to gas estimate
      const gasLimit = Math.ceil(Number(gasEstimate) * 1.2);

      // Execute transaction
      const tx = await this.contract.registerUser(sponsorAddress, packageTier, {
        gasLimit
      });

      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error) {
      console.error('Registration failed:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Process withdrawal with amount
   */
  async withdraw(amount) {
    if (!this.isInitialized) {
      throw new Error('Contract service not initialized');
    }

    try {
      const amountWei = ethers.parseUnits(amount.toString(), 6);
      
      const gasEstimate = await this.contract.withdraw.estimateGas(amountWei);
      const gasLimit = Math.ceil(Number(gasEstimate) * 1.2);

      const tx = await this.contract.withdraw(amountWei, {
        gasLimit
      });

      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error) {
      console.error('Withdrawal failed:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Upgrade user package to new tier
   */
  async upgradePackage(newTier) {
    if (!this.isInitialized) {
      throw new Error('Contract service not initialized');
    }

    try {
      const gasEstimate = await this.contract.upgradePackage.estimateGas(newTier);
      const gasLimit = Math.ceil(Number(gasEstimate) * 1.2);

      const tx = await this.contract.upgradePackage(newTier, {
        gasLimit
      });

      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error) {
      console.error('Package upgrade failed:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Set up event listeners for real-time updates
   */
  setupEventListeners(callbacks = {}) {
    if (!this.contract) return;

    // Listen for user's earnings
    if (callbacks.onEarning) {
      const earningFilter = this.contract.filters.CommissionDistributed(this.account);
      this.contract.on(earningFilter, callbacks.onEarning);
      this.eventListeners.set('earning', earningFilter);
    }

    // Listen for new referrals
    if (callbacks.onNewReferral) {
      const registrationFilter = this.contract.filters.UserRegistered(null, this.account);
      this.contract.on(registrationFilter, callbacks.onNewReferral);
      this.eventListeners.set('referral', registrationFilter);
    }

    // Listen for withdrawals
    if (callbacks.onWithdrawal) {
      const withdrawalFilter = this.contract.filters.WithdrawalProcessed(this.account);
      this.contract.on(withdrawalFilter, callbacks.onWithdrawal);
      this.eventListeners.set('withdrawal', withdrawalFilter);
    }
  }

  /**
   * Clean up event listeners
   */
  cleanup() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
    this.eventListeners.clear();
  }

  /**
   * Execute function with retry logic
   */
  async executeWithRetry(fn, retries = this.retryCount) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        // Don't retry certain types of errors
        if (error.message?.includes('invalid address') || 
            error.message?.includes('network changed') ||
            error.reason === 'invalid address') {
          console.error('❌ Non-retryable error:', error.message);
          throw this.formatError(error);
        }
        
        if (i === retries - 1) {
          console.error('❌ Max retries reached for contract call:', error.message);
          throw this.formatError(error);
        }
        
        console.warn(`Retry ${i + 1}/${retries} after error:`, error.message);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
      }
    }
  }

  /**
   * Format error messages for user display
   */
  formatError(error) {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return new Error('Insufficient funds for transaction');
    }
    if (error.code === 'USER_REJECTED') {
      return new Error('Transaction was rejected by user');
    }
    if (error.code === 'UNSUPPORTED_OPERATION') {
      return new Error('Contract operation not supported by current provider');
    }
    if (error.message?.includes('could not decode result data')) {
      return new Error('Contract data could not be decoded. Please check contract address and ABI.');
    }
    if (error.message?.includes('already registered')) {
      return new Error('User is already registered');
    }
    if (error.message?.includes('invalid sponsor')) {
      return new Error('Invalid sponsor address');
    }
    if (error.message?.includes('invalid address')) {
      return new Error('Invalid wallet address provided');
    }
    if (error.message?.includes('insufficient withdrawal amount')) {
      return new Error('Insufficient withdrawal amount');
    }
    
    return new Error(error.message || 'Transaction failed');
  }

  /**
   * Get current network gas price
   */
  async getGasPrice() {
    try {
      const gasPrice = await this.provider.getGasPrice();
      return ethers.formatUnits(gasPrice, 'gwei');
    } catch (error) {
      console.error('Failed to get gas price:', error);
      return '5'; // Default fallback
    }
  }

  /**
   * Get current block number
   */
  async getBlockNumber() {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      console.error('Failed to get block number:', error);
      return 0;
    }
  }
}

// Create singleton instance
export const contractService = new LeadFiveContractService();
export default contractService;
