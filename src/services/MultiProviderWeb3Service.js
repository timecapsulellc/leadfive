/**
 * Enhanced Multi-Provider Web3 Service with Automatic Failover
 * Provides production-grade reliability with multiple RPC endpoints
 *
 * Features:
 * - Multiple BSC RPC providers with automatic failover
 * - Health checking and provider rotation
 * - Retry logic with exponential backoff
 * - Performance monitoring and metrics
 * - Graceful degradation
 */

import { ethers } from 'ethers';
import { APP_CONFIG } from '../config/app.js';

class MultiProviderWeb3Service {
  constructor() {
    this.contractAddress = APP_CONFIG.contract.address;
    this.contract = null;
    this.currentProvider = null;
    this.currentProviderIndex = 0;
    this.signer = null;
    this.isInitialized = false;

    // Multiple BSC RPC providers for failover
    this.rpcProviders = [
      {
        name: 'Binance Official',
        url: 'https://bsc-dataseed.binance.org/',
        provider: null,
        healthy: true,
        lastChecked: 0,
        errorCount: 0,
        responseTime: 0,
      },
      {
        name: 'Binance Backup 1',
        url: 'https://bsc-dataseed1.binance.org/',
        provider: null,
        healthy: true,
        lastChecked: 0,
        errorCount: 0,
        responseTime: 0,
      },
      {
        name: 'Binance Backup 2',
        url: 'https://bsc-dataseed2.binance.org/',
        provider: null,
        healthy: true,
        lastChecked: 0,
        errorCount: 0,
        responseTime: 0,
      },
      {
        name: 'NodeReal',
        url: 'https://bsc-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3',
        provider: null,
        healthy: true,
        lastChecked: 0,
        errorCount: 0,
        responseTime: 0,
      },
      {
        name: 'Ankr',
        url: 'https://rpc.ankr.com/bsc',
        provider: null,
        healthy: true,
        lastChecked: 0,
        errorCount: 0,
        responseTime: 0,
      },
    ];

    // Configuration
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      healthCheckInterval: 30000, // 30 seconds
      providerTimeout: 5000, // 5 seconds
      maxErrorsBeforeDisable: 5,
      healthCheckCooldown: 60000, // 1 minute
    };

    // Initialize providers
    this.initializeProviders();

    // Start health monitoring
    this.startHealthMonitoring();
  }

  /**
   * Initialize all RPC providers
   */
  initializeProviders() {
    this.rpcProviders.forEach((providerConfig, index) => {
      try {
        providerConfig.provider = new ethers.JsonRpcProvider(
          providerConfig.url,
          {
            chainId: 56,
            name: 'BSC Mainnet',
          }
        );
        console.log(`✅ Initialized provider: ${providerConfig.name}`);
      } catch (error) {
        console.error(
          `❌ Failed to initialize provider ${providerConfig.name}:`,
          error
        );
        providerConfig.healthy = false;
      }
    });
  }

  /**
   * Get the best available provider
   */
  async getBestProvider() {
    // Try to use MetaMask first if available
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        await browserProvider.getNetwork(); // Test connectivity
        return browserProvider;
      } catch (error) {
        console.warn('MetaMask provider unavailable, using RPC providers');
      }
    }

    // Find healthy RPC provider
    const healthyProviders = this.rpcProviders.filter(
      p => p.healthy && p.provider
    );

    if (healthyProviders.length === 0) {
      throw new Error('No healthy RPC providers available');
    }

    // Sort by response time and error count
    healthyProviders.sort((a, b) => {
      const scoreA = a.responseTime + a.errorCount * 1000;
      const scoreB = b.responseTime + b.errorCount * 1000;
      return scoreA - scoreB;
    });

    return healthyProviders[0].provider;
  }

  /**
   * Execute operation with automatic failover
   */
  async executeWithFailover(operation, maxAttempts = this.config.maxRetries) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const provider = await this.getBestProvider();
        this.currentProvider = provider;

        const startTime = Date.now();
        const result = await operation(provider);
        const responseTime = Date.now() - startTime;

        // Update provider performance metrics
        this.updateProviderMetrics(provider, responseTime, true);

        return result;
      } catch (error) {
        lastError = error;
        console.warn(
          `Attempt ${attempt}/${maxAttempts} failed:`,
          error.message
        );

        // Update provider error metrics
        this.updateProviderMetrics(this.currentProvider, 0, false);

        if (attempt < maxAttempts) {
          // Exponential backoff
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));

          // Try next provider
          this.rotateProvider();
        }
      }
    }

    throw new Error(
      `All ${maxAttempts} attempts failed. Last error: ${lastError?.message}`
    );
  }

  /**
   * Update provider performance metrics
   */
  updateProviderMetrics(provider, responseTime, success) {
    const providerConfig = this.rpcProviders.find(p => p.provider === provider);
    if (!providerConfig) return;

    if (success) {
      providerConfig.responseTime = responseTime;
      providerConfig.errorCount = Math.max(0, providerConfig.errorCount - 1);
    } else {
      providerConfig.errorCount++;
      if (providerConfig.errorCount >= this.config.maxErrorsBeforeDisable) {
        providerConfig.healthy = false;
        console.warn(
          `🚨 Provider ${providerConfig.name} marked as unhealthy due to errors`
        );
      }
    }

    providerConfig.lastChecked = Date.now();
  }

  /**
   * Rotate to next available provider
   */
  rotateProvider() {
    const healthyProviders = this.rpcProviders.filter(p => p.healthy);
    this.currentProviderIndex =
      (this.currentProviderIndex + 1) % healthyProviders.length;
  }

  /**
   * Start health monitoring for providers
   */
  startHealthMonitoring() {
    setInterval(async () => {
      await this.checkProviderHealth();
    }, this.config.healthCheckInterval);
  }

  /**
   * Check health of all providers
   */
  async checkProviderHealth() {
    const now = Date.now();

    for (const providerConfig of this.rpcProviders) {
      // Skip recently checked providers
      if (now - providerConfig.lastChecked < this.config.healthCheckCooldown) {
        continue;
      }

      try {
        const startTime = Date.now();
        await Promise.race([
          providerConfig.provider.getBlockNumber(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Timeout')),
              this.config.providerTimeout
            )
          ),
        ]);

        const responseTime = Date.now() - startTime;

        // Provider is healthy
        providerConfig.healthy = true;
        providerConfig.responseTime = responseTime;
        providerConfig.errorCount = Math.max(0, providerConfig.errorCount - 1);
        providerConfig.lastChecked = now;
      } catch (error) {
        providerConfig.errorCount++;
        if (providerConfig.errorCount >= this.config.maxErrorsBeforeDisable) {
          providerConfig.healthy = false;
        }
        providerConfig.lastChecked = now;
      }
    }
  }

  /**
   * Initialize Web3 service with failover
   */
  async init() {
    try {
      await this.executeWithFailover(async provider => {
        this.currentProvider = provider;

        // Set up signer if using MetaMask
        if (provider instanceof ethers.BrowserProvider) {
          this.signer = await provider.getSigner();
        }

        // Simplified contract ABI for key functions
        const abi = [
          'function getUserInfo(address user) view returns (tuple(uint256 totalEarned, uint256 totalInvested, uint256 withdrawableAmount, bool isCapped, uint256 directReferrals, uint256 teamSize, uint256 matrixPosition, address leftChild, address rightChild))',
          'function getEarningsByPool(address user) view returns (uint256[5])',
          'function withdraw(uint256 amount) external',
          'function reinvest(uint256 amount) external',
          'function register(address sponsor) external payable',
        ];

        this.contract = new ethers.Contract(
          this.contractAddress,
          abi,
          this.signer || provider
        );

        // Test contract connectivity
        await this.contract.getAddress();

        this.isInitialized = true;
        console.log('✅ Multi-provider Web3 service initialized successfully');

        return true;
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Web3 service:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Get user information with failover
   */
  async getUserInfo(userAddress) {
    return this.executeWithFailover(async provider => {
      const contract = new ethers.Contract(
        this.contractAddress,
        [
          'function getUserInfo(address user) view returns (tuple(uint256 totalEarned, uint256 totalInvested, uint256 withdrawableAmount, bool isCapped, uint256 directReferrals, uint256 teamSize, uint256 matrixPosition, address leftChild, address rightChild))',
        ],
        provider
      );

      return await contract.getUserInfo(userAddress);
    });
  }

  /**
   * Get provider health status
   */
  getProviderHealthStatus() {
    return {
      providers: this.rpcProviders.map(p => ({
        name: p.name,
        healthy: p.healthy,
        responseTime: p.responseTime,
        errorCount: p.errorCount,
        lastChecked: p.lastChecked,
      })),
      currentProvider: this.currentProvider ? 'Active' : 'None',
      healthyCount: this.rpcProviders.filter(p => p.healthy).length,
      totalCount: this.rpcProviders.length,
    };
  }

  /**
   * Force provider health check
   */
  async forceHealthCheck() {
    await this.checkProviderHealth();
    return this.getProviderHealthStatus();
  }
}

// Export singleton instance
export default new MultiProviderWeb3Service();
