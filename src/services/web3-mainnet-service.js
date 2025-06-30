import { ethers } from 'ethers';
import { LEADFIVE_CONFIG, LEADFIVE_ABI, USDT_ABI } from '../config/mainnet-config.js';

class LeadFiveWeb3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.leadfiveContract = null;
    this.usdtContract = null;
    this.isConnected = false;
    this.currentAccount = null;
    this.networkId = null;
  }

  // Initialize Web3 connection
  async initialize() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        console.log('✅ MetaMask detected');
        return true;
      } else {
        console.log('❌ MetaMask not found');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
      return false;
    }
  }

  // Connect wallet
  async connectWallet() {
    try {
      if (!this.provider) {
        await this.initialize();
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.currentAccount = accounts[0];
      this.signer = await this.provider.getSigner();
      
      // Check network
      const network = await this.provider.getNetwork();
      this.networkId = Number(network.chainId);

      if (this.networkId !== LEADFIVE_CONFIG.NETWORK.chainId) {
        await this.switchToCorrectNetwork();
      }

      // Initialize contracts
      this.leadfiveContract = new ethers.Contract(
        LEADFIVE_CONFIG.CONTRACTS.LEADFIVE_PROXY,
        LEADFIVE_ABI,
        this.signer
      );

      this.usdtContract = new ethers.Contract(
        LEADFIVE_CONFIG.CONTRACTS.USDT,
        USDT_ABI,
        this.signer
      );

      this.isConnected = true;
      console.log('✅ Wallet connected:', this.currentAccount);
      
      return {
        success: true,
        account: this.currentAccount,
        network: this.networkId
      };

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Switch to BSC Mainnet
  async switchToCorrectNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${LEADFIVE_CONFIG.NETWORK.chainId.toString(16)}` }]
      });
    } catch (switchError) {
      // Add BSC network if not added
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${LEADFIVE_CONFIG.NETWORK.chainId.toString(16)}`,
            chainName: 'BSC Mainnet',
            nativeCurrency: LEADFIVE_CONFIG.NETWORK.nativeCurrency,
            rpcUrls: [LEADFIVE_CONFIG.NETWORK.rpcUrl],
            blockExplorerUrls: [LEADFIVE_CONFIG.NETWORK.explorerUrl]
          }]
        });
      }
    }
  }

  // Get user info from contract
  async getUserInfo(address = null) {
    try {
      const userAddress = address || this.currentAccount;
      if (!userAddress || !this.leadfiveContract) return null;

      const [basicInfo, earnings, network] = await Promise.all([
        this.leadfiveContract.getUserBasicInfo(userAddress),
        this.leadfiveContract.getUserEarnings(userAddress),
        this.leadfiveContract.getUserNetwork(userAddress)
      ]);

      const withdrawalRate = await this.leadfiveContract.calculateWithdrawalRate(userAddress);

      return {
        address: userAddress,
        isRegistered: basicInfo[0],
        packageLevel: Number(basicInfo[1]),
        balance: ethers.formatUnits(basicInfo[2], 6), // USDT has 6 decimals
        totalEarnings: ethers.formatUnits(earnings[0], 6),
        earningsCap: ethers.formatUnits(earnings[1], 6),
        directReferrals: Number(earnings[2]),
        referrer: network[0],
        teamSize: Number(network[1]),
        withdrawalRate: Number(withdrawalRate)
      };
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  // Get contract statistics
  async getContractStats() {
    try {
      if (!this.leadfiveContract) return null;

      const [totalUsers, poolBalances, packagePrices] = await Promise.all([
        this.leadfiveContract.getTotalUsers(),
        Promise.all([
          this.leadfiveContract.getPoolBalance(1), // Leadership
          this.leadfiveContract.getPoolBalance(2), // Community
          this.leadfiveContract.getPoolBalance(3)  // Club
        ]),
        Promise.all([
          this.leadfiveContract.getPackagePrice(1),
          this.leadfiveContract.getPackagePrice(2),
          this.leadfiveContract.getPackagePrice(3),
          this.leadfiveContract.getPackagePrice(4)
        ])
      ]);

      return {
        totalUsers: Number(totalUsers),
        pools: {
          leadership: ethers.formatUnits(poolBalances[0], 6),
          community: ethers.formatUnits(poolBalances[1], 6),
          club: ethers.formatUnits(poolBalances[2], 6)
        },
        packages: packagePrices.map((price, index) => ({
          level: index + 1,
          price: ethers.formatUnits(price, 6)
        }))
      };
    } catch (error) {
      console.error('Failed to get contract stats:', error);
      return null;
    }
  }

  // Register user
  async register(sponsorAddress, packageLevel, useUSDT = true, bnbAmount = null) {
    try {
      if (!this.leadfiveContract || !this.currentAccount) {
        throw new Error('Contract not initialized or wallet not connected');
      }

      let tx;
      const packagePrice = LEADFIVE_CONFIG.PACKAGES[packageLevel].priceWei;

      if (useUSDT) {
        // Check USDT allowance
        const allowance = await this.usdtContract.allowance(
          this.currentAccount,
          LEADFIVE_CONFIG.CONTRACTS.LEADFIVE_PROXY
        );

        if (allowance < ethers.parseUnits(packagePrice, 6)) {
          // Approve USDT spending
          const approveTx = await this.usdtContract.approve(
            LEADFIVE_CONFIG.CONTRACTS.LEADFIVE_PROXY,
            ethers.parseUnits(packagePrice, 6)
          );
          await approveTx.wait();
        }

        tx = await this.leadfiveContract.register(sponsorAddress, packageLevel, true);
      } else {
        // Pay with BNB
        tx = await this.leadfiveContract.register(sponsorAddress, packageLevel, false, {
          value: bnbAmount
        });
      }

      const receipt = await tx.wait();
      return {
        success: true,
        hash: receipt.hash,
        blockNumber: receipt.blockNumber
      };

    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upgrade package
  async upgradePackage(newLevel, useUSDT = true, bnbAmount = null) {
    try {
      if (!this.leadfiveContract || !this.currentAccount) {
        throw new Error('Contract not initialized or wallet not connected');
      }

      let tx;
      const packagePrice = LEADFIVE_CONFIG.PACKAGES[newLevel].priceWei;

      if (useUSDT) {
        // Check USDT allowance
        const allowance = await this.usdtContract.allowance(
          this.currentAccount,
          LEADFIVE_CONFIG.CONTRACTS.LEADFIVE_PROXY
        );

        if (allowance < ethers.parseUnits(packagePrice, 6)) {
          // Approve USDT spending
          const approveTx = await this.usdtContract.approve(
            LEADFIVE_CONFIG.CONTRACTS.LEADFIVE_PROXY,
            ethers.parseUnits(packagePrice, 6)
          );
          await approveTx.wait();
        }

        tx = await this.leadfiveContract.upgradePackage(newLevel, true);
      } else {
        tx = await this.leadfiveContract.upgradePackage(newLevel, false, {
          value: bnbAmount
        });
      }

      const receipt = await tx.wait();
      return {
        success: true,
        hash: receipt.hash,
        blockNumber: receipt.blockNumber
      };

    } catch (error) {
      console.error('Package upgrade failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Withdraw earnings
  async withdraw(amount) {
    try {
      if (!this.leadfiveContract || !this.currentAccount) {
        throw new Error('Contract not initialized or wallet not connected');
      }

      // Convert amount to contract format (6 decimals)
      const amountWei = ethers.parseUnits(amount.toString(), 6);
      
      const tx = await this.leadfiveContract.withdraw(amountWei);
      const receipt = await tx.wait();
      
      return {
        success: true,
        hash: receipt.hash,
        blockNumber: receipt.blockNumber
      };

    } catch (error) {
      console.error('Withdrawal failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get USDT balance
  async getUSDTBalance(address = null) {
    try {
      const userAddress = address || this.currentAccount;
      if (!userAddress || !this.usdtContract) return '0';

      const balance = await this.usdtContract.balanceOf(userAddress);
      return ethers.formatUnits(balance, 18); // USDT on BSC has 18 decimals
    } catch (error) {
      console.error('Failed to get USDT balance:', error);
      return '0';
    }
  }

  // Get BNB balance
  async getBNBBalance(address = null) {
    try {
      const userAddress = address || this.currentAccount;
      if (!userAddress || !this.provider) return '0';

      const balance = await this.provider.getBalance(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get BNB balance:', error);
      return '0';
    }
  }

  // Event listeners
  setupEventListeners(callbacks = {}) {
    if (!this.leadfiveContract) return;

    // User registered event
    this.leadfiveContract.on('UserRegistered', (user, sponsor, packageLevel, amount, event) => {
      if (callbacks.onUserRegistered) {
        callbacks.onUserRegistered({
          user,
          sponsor,
          packageLevel: Number(packageLevel),
          amount: ethers.formatUnits(amount, 6),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });
      }
    });

    // Reward distributed event
    this.leadfiveContract.on('RewardDistributed', (recipient, amount, rewardType, event) => {
      if (callbacks.onRewardDistributed) {
        callbacks.onRewardDistributed({
          recipient,
          amount: ethers.formatUnits(amount, 6),
          rewardType: Number(rewardType),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });
      }
    });

    // Withdrawal event
    this.leadfiveContract.on('UserWithdrawal', (user, amount, event) => {
      if (callbacks.onUserWithdrawal) {
        callbacks.onUserWithdrawal({
          user,
          amount: ethers.formatUnits(amount, 6),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });
      }
    });
  }

  // Disconnect wallet
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.leadfiveContract = null;
    this.usdtContract = null;
    this.isConnected = false;
    this.currentAccount = null;
    this.networkId = null;
  }
}

// Export singleton instance
export const web3Service = new LeadFiveWeb3Service();
export default web3Service;
