// Gas optimization utilities and monitoring
import { ethers } from 'ethers';

export class GasOptimizer {
  constructor(provider) {
    this.provider = provider;
    this.gasHistory = [];
    this.optimizationCache = new Map();
  }

  // Estimate gas with optimization suggestions
  async estimateGasOptimized(contract, functionName, args = [], options = {}) {
    try {
      const estimatedGas = await contract[functionName].estimateGas(
        ...args,
        options
      );
      const gasPrice = await this.getOptimalGasPrice();

      const gasData = {
        functionName,
        estimatedGas: estimatedGas.toString(),
        gasPrice: gasPrice.toString(),
        estimatedCost: ethers.utils.formatEther(estimatedGas.mul(gasPrice)),
        timestamp: Date.now(),
      };

      // Store for analytics
      this.gasHistory.push(gasData);

      // Get optimization suggestions
      const suggestions = this.getOptimizationSuggestions(
        functionName,
        estimatedGas
      );

      return {
        ...gasData,
        suggestions,
      };
    } catch (error) {
      console.error(`Gas estimation failed for ${functionName}:`, error);
      throw error;
    }
  }

  // Get optimal gas price based on network conditions
  async getOptimalGasPrice() {
    try {
      const feeData = await this.provider.getFeeData();

      // For BSC, use gasPrice directly
      if (feeData.gasPrice) {
        return feeData.gasPrice;
      }

      // For EIP-1559 networks, calculate optimal price
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        return feeData.maxFeePerGas;
      }

      // Fallback to network gas price
      return await this.provider.getGasPrice();
    } catch (error) {
      console.error('Failed to get optimal gas price:', error);
      return await this.provider.getGasPrice();
    }
  }

  // Execute transaction with gas optimization
  async executeOptimized(contract, functionName, args = [], options = {}) {
    try {
      const gasEstimate = await this.estimateGasOptimized(
        contract,
        functionName,
        args,
        options
      );

      // Add gas buffer (10% extra)
      const gasLimit = Math.floor(parseInt(gasEstimate.estimatedGas) * 1.1);

      const optimizedOptions = {
        ...options,
        gasLimit,
        gasPrice: gasEstimate.gasPrice,
      };

      console.log(`Executing ${functionName} with optimized gas:`, {
        gasLimit,
        gasPrice: gasEstimate.gasPrice,
        estimatedCost: gasEstimate.estimatedCost,
      });

      const tx = await contract[functionName](...args, optimizedOptions);

      // Monitor transaction
      const receipt = await this.monitorTransaction(tx);

      return {
        transaction: tx,
        receipt,
        gasUsed: receipt.gasUsed.toString(),
        gasEfficiency:
          (parseInt(gasEstimate.estimatedGas) /
            parseInt(receipt.gasUsed.toString())) *
          100,
      };
    } catch (error) {
      console.error(`Optimized execution failed for ${functionName}:`, error);
      throw error;
    }
  }

  // Monitor transaction and provide insights
  async monitorTransaction(tx) {
    const startTime = Date.now();

    try {
      const receipt = await tx.wait();
      const endTime = Date.now();

      const monitoringData = {
        hash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice?.toString() || 'N/A',
        confirmationTime: endTime - startTime,
        blockNumber: receipt.blockNumber,
        status: receipt.status,
      };

      console.log('Transaction monitoring:', monitoringData);

      return receipt;
    } catch (error) {
      console.error('Transaction monitoring failed:', error);
      throw error;
    }
  }

  // Get optimization suggestions based on function and gas usage
  getOptimizationSuggestions(functionName, estimatedGas) {
    const suggestions = [];
    const gasAmount = parseInt(estimatedGas.toString());

    // Function-specific suggestions
    const functionSuggestions = {
      register: [
        'Consider batching multiple registrations',
        'Use events instead of return values for data',
      ],
      deposit: [
        'Check if amount is optimally sized',
        'Consider using approve + depositFrom pattern',
      ],
      withdraw: [
        'Batch multiple withdrawals if possible',
        'Consider withdrawal queue for large amounts',
      ],
    };

    if (functionSuggestions[functionName]) {
      suggestions.push(...functionSuggestions[functionName]);
    }

    // Gas-based suggestions
    if (gasAmount > 500000) {
      suggestions.push(
        'High gas usage detected - consider breaking into smaller operations'
      );
    }

    if (gasAmount > 200000) {
      suggestions.push(
        'Consider using events instead of storage for non-critical data'
      );
    }

    if (gasAmount < 50000) {
      suggestions.push(
        'Low gas usage - consider batching with other operations'
      );
    }

    return suggestions;
  }

  // Batch transaction optimization
  async batchTransactions(transactions) {
    try {
      const results = [];
      let totalGasUsed = 0;

      for (const tx of transactions) {
        const result = await this.executeOptimized(
          tx.contract,
          tx.functionName,
          tx.args,
          tx.options
        );

        results.push(result);
        totalGasUsed += parseInt(result.gasUsed);
      }

      return {
        results,
        totalGasUsed,
        averageGasEfficiency:
          results.reduce((sum, r) => sum + r.gasEfficiency, 0) / results.length,
      };
    } catch (error) {
      console.error('Batch transaction failed:', error);
      throw error;
    }
  }

  // Gas analytics and reporting
  getGasAnalytics() {
    const analytics = {
      totalTransactions: this.gasHistory.length,
      averageGasUsed: 0,
      averageCost: 0,
      functionBreakdown: {},
      trends: [],
    };

    if (this.gasHistory.length === 0) {
      return analytics;
    }

    // Calculate averages
    const totalGas = this.gasHistory.reduce(
      (sum, tx) => sum + parseInt(tx.estimatedGas),
      0
    );
    const totalCost = this.gasHistory.reduce(
      (sum, tx) => sum + parseFloat(tx.estimatedCost),
      0
    );

    analytics.averageGasUsed = Math.floor(totalGas / this.gasHistory.length);
    analytics.averageCost = totalCost / this.gasHistory.length;

    // Function breakdown
    this.gasHistory.forEach(tx => {
      if (!analytics.functionBreakdown[tx.functionName]) {
        analytics.functionBreakdown[tx.functionName] = {
          count: 0,
          totalGas: 0,
          averageGas: 0,
        };
      }

      analytics.functionBreakdown[tx.functionName].count++;
      analytics.functionBreakdown[tx.functionName].totalGas += parseInt(
        tx.estimatedGas
      );
    });

    // Calculate function averages
    Object.keys(analytics.functionBreakdown).forEach(fn => {
      const data = analytics.functionBreakdown[fn];
      data.averageGas = Math.floor(data.totalGas / data.count);
    });

    return analytics;
  }

  // Clear old gas history to prevent memory leaks
  clearOldHistory(maxAge = 24 * 60 * 60 * 1000) {
    // 24 hours
    const cutoff = Date.now() - maxAge;
    this.gasHistory = this.gasHistory.filter(tx => tx.timestamp > cutoff);
  }
}

// Smart contract interaction helpers with gas optimization
export class OptimizedContractInteraction {
  constructor(contract, provider) {
    this.contract = contract;
    this.gasOptimizer = new GasOptimizer(provider);
    this.callCache = new Map();
  }

  // Cached contract calls to reduce network requests
  async cachedCall(functionName, args = [], cacheTime = 5000) {
    const cacheKey = `${functionName}-${JSON.stringify(args)}`;
    const cached = this.callCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.result;
    }

    try {
      const result = await this.contract[functionName](...args);

      this.callCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      console.error(`Cached call failed for ${functionName}:`, error);
      throw error;
    }
  }

  // Optimized transaction execution
  async execute(functionName, args = [], options = {}) {
    return await this.gasOptimizer.executeOptimized(
      this.contract,
      functionName,
      args,
      options
    );
  }

  // Estimate gas with suggestions
  async estimateGas(functionName, args = [], options = {}) {
    return await this.gasOptimizer.estimateGasOptimized(
      this.contract,
      functionName,
      args,
      options
    );
  }

  // Get gas analytics
  getAnalytics() {
    return this.gasOptimizer.getGasAnalytics();
  }

  // Clear caches
  clearCaches() {
    this.callCache.clear();
    this.gasOptimizer.clearOldHistory();
  }
}

// BSC-specific gas optimization
export const BSC_GAS_CONFIGS = {
  standard: {
    gasPrice: '5000000000', // 5 gwei
    gasLimit: 300000,
  },
  fast: {
    gasPrice: '6000000000', // 6 gwei
    gasLimit: 300000,
  },
  instant: {
    gasPrice: '10000000000', // 10 gwei
    gasLimit: 300000,
  },
};

// Network-specific optimizations
export const getNetworkOptimizations = chainId => {
  switch (chainId) {
    case 56: // BSC Mainnet
      return {
        gasPrice: BSC_GAS_CONFIGS.standard.gasPrice,
        gasLimit: BSC_GAS_CONFIGS.standard.gasLimit,
        batchSupported: true,
        recommendedBuffer: 0.1, // 10%
      };
    case 97: // BSC Testnet
      return {
        gasPrice: '10000000000', // 10 gwei
        gasLimit: 300000,
        batchSupported: true,
        recommendedBuffer: 0.2, // 20% for testnet
      };
    default:
      return {
        gasPrice: '20000000000', // 20 gwei
        gasLimit: 300000,
        batchSupported: false,
        recommendedBuffer: 0.15, // 15%
      };
  }
};

export default GasOptimizer;
