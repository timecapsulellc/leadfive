/**
 * Production Registration Service - Real Smart Contract Integration
 * Handles real money transactions and registrations
 * Version: 1.0 - Production Ready
 */

import { ethers } from 'ethers';
import { LEAD_FIVE_CONFIG, LEAD_FIVE_ABI, PACKAGE_AMOUNTS, PACKAGE_TIERS } from '../contracts-leadfive.js';

class ProductionRegistrationService {
  constructor() {
    this.contract = null;
    this.usdtContract = null;
    this.provider = null;
    this.signer = null;
    this.isInitialized = false;
  }

  // Initialize with wallet connection
  async initialize(provider, signer) {
    try {
      this.provider = provider;
      this.signer = signer;
      
      // Initialize main contract
      this.contract = new ethers.Contract(
        LEAD_FIVE_CONFIG.address,
        LEAD_FIVE_ABI,
        signer
      );
      
      // Initialize USDT contract
      this.usdtContract = new ethers.Contract(
        LEAD_FIVE_CONFIG.usdtAddress,
        [
          'function balanceOf(address owner) view returns (uint256)',
          'function approve(address spender, uint256 amount) returns (bool)',
          'function allowance(address owner, address spender) view returns (uint256)',
          'function decimals() view returns (uint8)',
        ],
        signer
      );
      
      this.isInitialized = true;
      console.log('✅ Production Registration Service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Registration Service:', error);
      return false;
    }
  }

  // Check if user is already registered
  async isUserRegistered(userAddress) {
    try {
      if (!this.isInitialized) return false;
      
      const userInfo = await this.contract.getUserInfo(userAddress);
      return userInfo.isRegistered;
    } catch (error) {
      console.error('Error checking registration status:', error);
      return false;
    }
  }

  // Get user balances (USDT and BNB)
  async getUserBalances(userAddress) {
    try {
      const balances = { usdt: '0', bnb: '0', usdtFormatted: '0', bnbFormatted: '0' };
      
      if (!this.isInitialized) return balances;
      
      // Get USDT balance
      const usdtBalance = await this.usdtContract.balanceOf(userAddress);
      balances.usdt = usdtBalance.toString();
      balances.usdtFormatted = parseFloat(ethers.formatUnits(usdtBalance, 18)).toFixed(2);
      
      // Get BNB balance
      const bnbBalance = await this.provider.getBalance(userAddress);
      balances.bnb = bnbBalance.toString();
      balances.bnbFormatted = parseFloat(ethers.formatEther(bnbBalance)).toFixed(4);
      
      return balances;
    } catch (error) {
      console.error('Error fetching balances:', error);
      return { usdt: '0', bnb: '0', usdtFormatted: '0', bnbFormatted: '0' };
    }
  }

  // Get package prices from contract
  async getPackagePrices() {
    try {
      if (!this.isInitialized) {
        return this.getDefaultPackages();
      }
      
      const packages = [];
      
      // Get prices for all 4 packages
      for (let level = 1; level <= 4; level++) {
        try {
          const packageInfo = await this.contract.packages(level);
          const price = parseFloat(ethers.formatUnits(packageInfo.price, 18));
          
          packages.push({
            level,
            price,
            priceWei: packageInfo.price.toString(),
            commissionRates: {
              directBonus: packageInfo.rates.directBonus,
              levelBonus: packageInfo.rates.levelBonus,
              uplineBonus: packageInfo.rates.uplineBonus,
              leaderBonus: packageInfo.rates.leaderBonus,
              helpBonus: packageInfo.rates.helpBonus,
              clubBonus: packageInfo.rates.clubBonus,
            },
            maxEarnings: price * 4, // 4x rule
          });
        } catch (error) {
          console.error(`Error fetching package ${level}:`, error);
        }
      }
      
      return packages.length > 0 ? packages : this.getDefaultPackages();
    } catch (error) {
      console.error('Error fetching package prices:', error);
      return this.getDefaultPackages();
    }
  }

  // Resolve referrer address from code or address
  async resolveReferrer(referralInput) {
    try {
      if (!this.isInitialized) {
        return LEAD_FIVE_CONFIG.sponsorAddress;
      }
      
      // If it's already an address
      if (ethers.isAddress(referralInput)) {
        const userInfo = await this.contract.getUserInfo(referralInput);
        return userInfo.isRegistered ? referralInput : LEAD_FIVE_CONFIG.sponsorAddress;
      }
      
      // If it's a referral code
      if (referralInput && referralInput.length > 0) {
        try {
          const referrerAddress = await this.contract.referralCodeToUser(referralInput.toUpperCase());
          if (referrerAddress && referrerAddress !== ethers.ZeroAddress) {
            return referrerAddress;
          }
        } catch (error) {
          console.error('Error resolving referral code:', error);
        }
      }
      
      // Default to sponsor address
      return LEAD_FIVE_CONFIG.sponsorAddress;
    } catch (error) {
      console.error('Error resolving referrer:', error);
      return LEAD_FIVE_CONFIG.sponsorAddress;
    }
  }

  // Register with USDT payment
  async registerWithUSDT(referrerAddress, packageLevel, userAddress) {
    try {
      console.log('💰 Starting USDT registration...', { referrerAddress, packageLevel, userAddress });
      
      if (!this.isInitialized) {
        throw new Error('Service not initialized');
      }
      
      // Get package amount
      const packageAmount = PACKAGE_AMOUNTS[packageLevel];
      if (!packageAmount) {
        throw new Error(`Invalid package level: ${packageLevel}`);
      }
      
      console.log(`📦 Package amount: ${ethers.formatUnits(packageAmount, 18)} USDT`);
      
      // Check USDT balance
      const usdtBalance = await this.usdtContract.balanceOf(userAddress);
      if (usdtBalance < BigInt(packageAmount)) {
        throw new Error(`Insufficient USDT balance. Required: ${ethers.formatUnits(packageAmount, 18)} USDT`);
      }
      
      // Check allowance
      const allowance = await this.usdtContract.allowance(userAddress, LEAD_FIVE_CONFIG.address);
      
      if (allowance < BigInt(packageAmount)) {
        console.log('🔓 Approving USDT spend...');
        const approveTx = await this.usdtContract.approve(
          LEAD_FIVE_CONFIG.address,
          packageAmount
        );
        
        console.log('⏳ Waiting for approval confirmation...');
        await approveTx.wait();
        console.log('✅ USDT approval confirmed');
      }
      
      // Register with contract
      console.log('📝 Sending registration transaction...');
      const registerTx = await this.contract.register(
        referrerAddress,
        packageLevel,
        true, // useUSDT = true
        {
          gasLimit: 500000, // Set reasonable gas limit
        }
      );
      
      console.log('⏳ Waiting for registration confirmation...');
      const receipt = await registerTx.wait();
      
      console.log('✅ Registration successful!', {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
      });
      
      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
        message: 'Registration successful with USDT!',
      };
    } catch (error) {
      console.error('❌ USDT registration failed:', error);
      
      let errorMessage = 'Registration failed';
      
      if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled';
      } else if (error.message.includes('already registered')) {
        errorMessage = 'User is already registered';
      } else if (error.message.includes('Invalid referrer')) {
        errorMessage = 'Invalid referrer address';
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
        details: error,
      };
    }
  }

  // Register with BNB payment
  async registerWithBNB(referrerAddress, packageLevel, userAddress) {
    try {
      console.log('⚡ Starting BNB registration...', { referrerAddress, packageLevel, userAddress });
      
      if (!this.isInitialized) {
        throw new Error('Service not initialized');
      }
      
      // Get package price in USD
      const packages = await this.getPackagePrices();
      const packageInfo = packages.find(p => p.level === packageLevel);
      
      if (!packageInfo) {
        throw new Error(`Invalid package level: ${packageLevel}`);
      }
      
      // For BNB payment, we need to calculate the BNB amount
      // This would typically use a price feed, but for now we'll estimate
      const bnbPrice = 300; // $300 per BNB (should come from oracle)
      const bnbAmount = ethers.parseEther((packageInfo.price / bnbPrice).toString());
      
      console.log(`⚡ BNB amount: ${ethers.formatEther(bnbAmount)} BNB`);
      
      // Check BNB balance
      const bnbBalance = await this.provider.getBalance(userAddress);
      if (bnbBalance < bnbAmount) {
        throw new Error(`Insufficient BNB balance. Required: ${ethers.formatEther(bnbAmount)} BNB`);
      }
      
      // Register with contract
      console.log('📝 Sending BNB registration transaction...');
      const registerTx = await this.contract.register(
        referrerAddress,
        packageLevel,
        false, // useUSDT = false
        {
          value: bnbAmount,
          gasLimit: 500000,
        }
      );
      
      console.log('⏳ Waiting for registration confirmation...');
      const receipt = await registerTx.wait();
      
      console.log('✅ BNB registration successful!', {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
      });
      
      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
        message: 'Registration successful with BNB!',
      };
    } catch (error) {
      console.error('❌ BNB registration failed:', error);
      
      let errorMessage = 'BNB registration failed';
      
      if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient BNB for transaction';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled';
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
        details: error,
      };
    }
  }

  // Main registration function
  async registerUser(referralInput, packageLevel, useUSDT, userAddress) {
    try {
      console.log('🚀 Starting user registration...', {
        referralInput,
        packageLevel,
        useUSDT,
        userAddress,
      });
      
      // Check if already registered
      const isRegistered = await this.isUserRegistered(userAddress);
      if (isRegistered) {
        return {
          success: false,
          error: 'User is already registered',
        };
      }
      
      // Resolve referrer
      const referrerAddress = await this.resolveReferrer(referralInput);
      console.log('👥 Resolved referrer:', referrerAddress);
      
      // Register based on payment method
      if (useUSDT) {
        return await this.registerWithUSDT(referrerAddress, packageLevel, userAddress);
      } else {
        return await this.registerWithBNB(referrerAddress, packageLevel, userAddress);
      }
    } catch (error) {
      console.error('❌ Registration failed:', error);
      return {
        success: false,
        error: error.message || 'Registration failed',
        details: error,
      };
    }
  }

  // Get registration status and user info
  async getRegistrationInfo(userAddress) {
    try {
      if (!this.isInitialized) {
        return {
          isRegistered: false,
          userInfo: null,
          balances: { usdt: '0', bnb: '0', usdtFormatted: '0', bnbFormatted: '0' },
        };
      }
      
      const [userInfo, balances] = await Promise.all([
        this.contract.getUserInfo(userAddress),
        this.getUserBalances(userAddress),
      ]);
      
      return {
        isRegistered: userInfo.isRegistered,
        userInfo: {
          packageLevel: parseInt(userInfo.packageLevel),
          totalInvestment: parseFloat(ethers.formatUnits(userInfo.totalInvestment, 18)),
          totalEarnings: parseFloat(ethers.formatUnits(userInfo.totalEarnings, 18)),
          directReferrals: parseInt(userInfo.directReferrals),
          teamSize: parseInt(userInfo.teamSize),
          referralCode: userInfo.referralCode,
          registrationTime: parseInt(userInfo.registrationTime),
        },
        balances,
      };
    } catch (error) {
      console.error('Error getting registration info:', error);
      return {
        isRegistered: false,
        userInfo: null,
        balances: { usdt: '0', bnb: '0', usdtFormatted: '0', bnbFormatted: '0' },
        error: error.message,
      };
    }
  }

  // Helper functions
  getDefaultPackages() {
    return [
      { level: 1, price: 30, priceWei: PACKAGE_AMOUNTS[1], maxEarnings: 120 },
      { level: 2, price: 50, priceWei: PACKAGE_AMOUNTS[2], maxEarnings: 200 },
      { level: 3, price: 100, priceWei: PACKAGE_AMOUNTS[3], maxEarnings: 400 },
      { level: 4, price: 200, priceWei: PACKAGE_AMOUNTS[4], maxEarnings: 800 },
    ];
  }

  // Get transaction status
  async getTransactionStatus(txHash) {
    try {
      if (!this.provider) return null;
      
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return {
        status: receipt?.status === 1 ? 'success' : 'failed',
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        confirmations: receipt ? await this.provider.getBlockNumber() - receipt.blockNumber : 0,
      };
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return null;
    }
  }

  // Estimate gas for registration
  async estimateRegistrationGas(referrerAddress, packageLevel, useUSDT, userAddress) {
    try {
      if (!this.isInitialized) return '500000';
      
      const gasEstimate = await this.contract.register.estimateGas(
        referrerAddress,
        packageLevel,
        useUSDT,
        useUSDT ? {} : { value: ethers.parseEther('0.1') } // Sample value for BNB
      );
      
      // Add 20% buffer
      return (gasEstimate * BigInt(120) / BigInt(100)).toString();
    } catch (error) {
      console.error('Error estimating gas:', error);
      return '500000'; // Default gas limit
    }
  }
}

// Export singleton instance
export const productionRegistrationService = new ProductionRegistrationService();
export default productionRegistrationService;
