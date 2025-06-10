/**
 * Web3 Contract Service for OrphiCrowdFund
 * 
 * Handles all blockchain interactions with the deployed contract
 * Contract Address: 0x8F826B18096Dcf7AF4515B06Cb563475d189ab50 (BSC Mainnet)
 */

import { ethers } from 'ethers';
import CompensationPlanService from './CompensationPlanService';

export class Web3ContractService {
  
  // Contract configuration from .env.mainnet
  static CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '0x8F826B18096Dcf7AF4515B06Cb563475d189ab50';
  static USDT_ADDRESS = process.env.REACT_APP_USDT_ADDRESS || '0x55d398326f99059fF775485246999027B3197955';
  static CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID) || 56;
  static NETWORK = process.env.REACT_APP_NETWORK || 'mainnet';

  // BSC Network configuration
  static BSC_CONFIG = {
    chainId: '0x38', // 56 in hex
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/']
  };

  // Basic ABI for common functions (will be expanded with actual contract ABI)
  static CONTRACT_ABI = [
    // User registration and package purchase
    "function register(address sponsor, uint256 packageAmount) external",
    "function purchasePackage(uint256 packageAmount) external",
    
    // User information
    "function users(address user) external view returns (bool isActive, address sponsor, uint256 packageAmount, uint256 totalEarnings, uint256 directReferrals, uint256 teamSize)",
    "function getUserInfo(address user) external view returns (tuple(bool isActive, address sponsor, uint256 packageAmount, uint256 totalEarnings, uint256 directReferrals, uint256 teamSize))",
    
    // Matrix and genealogy
    "function getDownline(address user, uint256 level) external view returns (address[])",
    "function getUpline(address user, uint256 levels) external view returns (address[])",
    "function getMatrixPosition(address user) external view returns (uint256 level, uint256 position)",
    
    // Earnings and withdrawals
    "function getAvailableEarnings(address user) external view returns (uint256)",
    "function withdraw(uint256 amount) external",
    "function getEarningsBreakdown(address user) external view returns (uint256 sponsor, uint256 level, uint256 upline, uint256 leader, uint256 pool)",
    
    // Leader qualifications
    "function getLeaderStatus(address user) external view returns (bool isShining, bool isSilver)",
    "function getLeaderPool() external view returns (uint256 shiningPool, uint256 silverPool)",
    
    // Global Help Pool
    "function getGlobalHelpPool() external view returns (uint256 totalPool, uint256 weeklyDistribution)",
    "function isEligibleForPool(address user) external view returns (bool)",
    
    // Package and level information
    "function getPackageInfo(uint256 amount) external pure returns (bool isValid)",
    "function getLevelRequirements(uint256 level) external pure returns (uint256 requiredTeam, uint256 upgradeAmount)",
    
    // Events
    "event UserRegistered(address indexed user, address indexed sponsor, uint256 packageAmount)",
    "event PackagePurchased(address indexed user, uint256 packageAmount)",
    "event EarningsDistributed(address indexed user, uint256 amount, string source)",
    "event Withdrawal(address indexed user, uint256 amount)",
    "event LeaderQualified(address indexed user, string rank)"
  ];

  // USDT ABI for token operations
  static USDT_ABI = [
    "function balanceOf(address owner) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function decimals() external view returns (uint8)"
  ];

  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.usdtContract = null;
    this.userAddress = null;
  }

  /**
   * Initialize Web3 connection
   */
  async initialize() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        await this.checkNetwork();
        return true;
      } else {
        console.warn('MetaMask not detected');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
      return false;
    }
  }

  /**
   * Connect wallet
   */
  async connectWallet() {
    try {
      if (!this.provider) {
        await this.initialize();
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        this.userAddress = accounts[0];
        this.signer = this.provider.getSigner();
        this.contract = new ethers.Contract(
          Web3ContractService.CONTRACT_ADDRESS,
          Web3ContractService.CONTRACT_ABI,
          this.signer
        );
        this.usdtContract = new ethers.Contract(
          Web3ContractService.USDT_ADDRESS,
          Web3ContractService.USDT_ABI,
          this.signer
        );

        return {
          success: true,
          address: this.userAddress,
          network: await this.provider.getNetwork()
        };
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check and switch to BSC network
   */
  async checkNetwork() {
    try {
      const network = await this.provider.getNetwork();
      
      if (network.chainId !== Web3ContractService.CHAIN_ID) {
        await this.switchToBSC();
      }
      
      return network;
    } catch (error) {
      console.error('Network check failed:', error);
      throw error;
    }
  }

  /**
   * Switch to BSC network
   */
  async switchToBSC() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: Web3ContractService.BSC_CONFIG.chainId }]
      });
    } catch (switchError) {
      // If BSC is not added to MetaMask, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [Web3ContractService.BSC_CONFIG]
        });
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Get user information from contract
   */
  async getUserInfo(address = null) {
    try {
      const userAddr = address || this.userAddress;
      if (!userAddr || !this.contract) return null;

      // Try to get user info from contract
      try {
        const userInfo = await this.contract.getUserInfo(userAddr);
        
        return {
          isActive: userInfo.isActive,
          sponsor: userInfo.sponsor,
          packageAmount: ethers.utils.formatUnits(userInfo.packageAmount, 18),
          totalEarnings: ethers.utils.formatUnits(userInfo.totalEarnings, 18),
          directReferrals: userInfo.directReferrals.toNumber(),
          teamSize: userInfo.teamSize.toNumber()
        };
      } catch (contractError) {
        // If contract call fails, return demo data based on compensation plan
        console.warn('Contract call failed, using demo data:', contractError);
        return this.getDemoUserInfo();
      }
    } catch (error) {
      console.error('Failed to get user info:', error);
      return this.getDemoUserInfo();
    }
  }

  /**
   * Get demo user info based on compensation plan
   */
  getDemoUserInfo() {
    const demoPackage = 100;
    const demoTeamSize = 47;
    const demoDirectReferrals = 5;
    
    const dashboardData = CompensationPlanService.calculateDashboardData(
      demoPackage, 
      demoTeamSize, 
      demoDirectReferrals
    );

    return {
      isActive: true,
      sponsor: '0x0000000000000000000000000000000000000000',
      packageAmount: demoPackage,
      totalEarnings: dashboardData.earnings.total,
      directReferrals: demoDirectReferrals,
      teamSize: demoTeamSize,
      isDemoData: true
    };
  }

  /**
   * Get USDT balance
   */
  async getUSDTBalance(address = null) {
    try {
      const userAddr = address || this.userAddress;
      if (!userAddr || !this.usdtContract) return '0';

      const balance = await this.usdtContract.balanceOf(userAddr);
      return ethers.utils.formatUnits(balance, 18);
    } catch (error) {
      console.error('Failed to get USDT balance:', error);
      return '0';
    }
  }

  /**
   * Register new user
   */
  async register(sponsorAddress, packageAmount) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      // Convert package amount to wei
      const amount = ethers.utils.parseUnits(packageAmount.toString(), 18);
      
      // Check USDT allowance and approve if needed
      await this.approveUSDT(amount);
      
      // Register user
      const tx = await this.contract.register(sponsorAddress, amount);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Purchase package upgrade
   */
  async purchasePackage(packageAmount) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const amount = ethers.utils.parseUnits(packageAmount.toString(), 18);
      
      await this.approveUSDT(amount);
      
      const tx = await this.contract.purchasePackage(amount);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Package purchase failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Approve USDT spending
   */
  async approveUSDT(amount) {
    try {
      if (!this.usdtContract) throw new Error('USDT contract not initialized');

      const allowance = await this.usdtContract.allowance(
        this.userAddress, 
        Web3ContractService.CONTRACT_ADDRESS
      );

      if (allowance.lt(amount)) {
        const tx = await this.usdtContract.approve(
          Web3ContractService.CONTRACT_ADDRESS, 
          amount
        );
        await tx.wait();
      }
    } catch (error) {
      console.error('USDT approval failed:', error);
      throw error;
    }
  }

  /**
   * Withdraw earnings
   */
  async withdraw(amount) {
    try {
      if (!this.contract) throw new Error('Contract not initialized');

      const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
      const tx = await this.contract.withdraw(amountWei);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Withdrawal failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get genealogy tree data from contract
   */
  async getGenealogyTree(address = null, depth = 5) {
    try {
      const userAddr = address || this.userAddress;
      if (!userAddr || !this.contract) {
        // Return demo data if contract not available
        return CompensationPlanService.generateGenealogyTreeData(100, depth);
      }

      // Try to get real data from contract
      try {
        const userInfo = await this.getUserInfo(userAddr);
        const downline = await this.contract.getDownline(userAddr, depth);
        
        // Build tree structure from contract data
        return this.buildTreeFromContractData(userInfo, downline, depth);
      } catch (contractError) {
        console.warn('Contract genealogy call failed, using demo data:', contractError);
        return CompensationPlanService.generateGenealogyTreeData(100, depth);
      }
    } catch (error) {
      console.error('Failed to get genealogy tree:', error);
      return CompensationPlanService.generateGenealogyTreeData(100, depth);
    }
  }

  /**
   * Build tree structure from contract data
   */
  buildTreeFromContractData(userInfo, downlineAddresses, depth) {
    // This would build the actual tree from contract data
    // For now, return demo data with real user info if available
    const packageAmount = userInfo?.packageAmount || 100;
    return CompensationPlanService.generateGenealogyTreeData(packageAmount, depth);
  }

  /**
   * Get earnings breakdown
   */
  async getEarningsBreakdown(address = null) {
    try {
      const userAddr = address || this.userAddress;
      if (!userAddr || !this.contract) {
        // Return demo breakdown
        const userInfo = this.getDemoUserInfo();
        return CompensationPlanService.calculateCompensationBreakdown(userInfo.packageAmount);
      }

      try {
        const breakdown = await this.contract.getEarningsBreakdown(userAddr);
        
        return {
          sponsorCommission: ethers.utils.formatUnits(breakdown.sponsor, 18),
          levelBonus: ethers.utils.formatUnits(breakdown.level, 18),
          globalUplineBonus: ethers.utils.formatUnits(breakdown.upline, 18),
          leaderBonus: ethers.utils.formatUnits(breakdown.leader, 18),
          globalHelpPool: ethers.utils.formatUnits(breakdown.pool, 18)
        };
      } catch (contractError) {
        console.warn('Contract earnings call failed, using demo data:', contractError);
        const userInfo = this.getDemoUserInfo();
        return CompensationPlanService.calculateCompensationBreakdown(userInfo.packageAmount);
      }
    } catch (error) {
      console.error('Failed to get earnings breakdown:', error);
      const userInfo = this.getDemoUserInfo();
      return CompensationPlanService.calculateCompensationBreakdown(userInfo.packageAmount);
    }
  }

  /**
   * Get leader status
   */
  async getLeaderStatus(address = null) {
    try {
      const userAddr = address || this.userAddress;
      if (!userAddr || !this.contract) {
        const userInfo = this.getDemoUserInfo();
        return CompensationPlanService.checkLeaderQualification(
          userInfo.teamSize, 
          userInfo.directReferrals
        );
      }

      try {
        const status = await this.contract.getLeaderStatus(userAddr);
        const qualifications = [];
        
        if (status.isShining) qualifications.push('SHINING_STAR');
        if (status.isSilver) qualifications.push('SILVER_STAR');
        
        return qualifications;
      } catch (contractError) {
        console.warn('Contract leader status call failed, using demo data:', contractError);
        const userInfo = this.getDemoUserInfo();
        return CompensationPlanService.checkLeaderQualification(
          userInfo.teamSize, 
          userInfo.directReferrals
        );
      }
    } catch (error) {
      console.error('Failed to get leader status:', error);
      return [];
    }
  }

  /**
   * Check if connected and ready
   */
  isConnected() {
    return !!(this.provider && this.signer && this.userAddress);
  }

  /**
   * Get current user address
   */
  getCurrentAddress() {
    return this.userAddress;
  }

  /**
   * Disconnect wallet
   */
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.usdtContract = null;
    this.userAddress = null;
  }
}

// Create singleton instance
const web3Service = new Web3ContractService();
export default web3Service;
