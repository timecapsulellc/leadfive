// LEADFIVE MAINNET DEPLOYMENT CONFIGURATION
require('dotenv').config();

const networkConfig = {
  // BSC Mainnet Configuration
  bscMainnet: {
    name: "BSC Mainnet",
    chainId: 56,
    rpc: "https://bsc-dataseed.binance.org/",
    explorer: "https://bscscan.com/",
    currency: "BNB",
    
    // Production Contract Addresses
    contracts: {
      usdt: "0x55d398326f99059fF775485246999027B3197955", // BSC Mainnet USDT
      chainlinkBNBUSD: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE", // Chainlink BNB/USD
      pancakeRouter: "0x10ED43C718714eb63d5aA57B78B54704E256024E", // PancakeSwap V2
    },
    
    // Deployment Parameters
    deployment: {
      gasPrice: "5000000000", // 5 gwei
      gasLimit: "10000000",   // 10M gas limit
      confirmations: 3,       // 3 block confirmations
      timeout: 300000,        // 5 minute timeout
    },
    
    // Security Settings
    security: {
      dailyWithdrawalLimit: "10000000000000000000000", // 10,000 USDT (18 decimals)
      circuitBreakerThreshold: "100000000000000000000", // 100 BNB
      platformFeeRate: 500, // 5% (in basis points)
      maxSingleWithdrawal: "50000000000000000000000", // 50,000 USDT
      emergencyPauseEnabled: true,
    },
    
    // Business Logic Parameters
    business: {
      packages: [
        { level: 1, price: "30000000000000000000", description: "$30 USDT" },
        { level: 2, price: "50000000000000000000", description: "$50 USDT" },
        { level: 3, price: "100000000000000000000", description: "$100 USDT" },
        { level: 4, price: "200000000000000000000", description: "$200 USDT" }
      ],
      bonusStructure: {
        directBonus: 4000,    // 40%
        levelBonus: 1000,     // 10%
        uplineBonus: 1000,    // 10%
        leaderBonus: 1000,    // 10%
        helpBonus: 3000,      // 30%
        clubBonus: 0          // Reserved
      },
      withdrawalRates: {
        tier1: 70, // 0-4 direct referrals
        tier2: 75, // 5-19 direct referrals
        tier3: 80  // 20+ direct referrals
      }
    }
  },
  
  // BSC Testnet Configuration (for comparison)
  bscTestnet: {
    name: "BSC Testnet",
    chainId: 97,
    rpc: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    explorer: "https://testnet.bscscan.com/",
    currency: "tBNB",
    
    contracts: {
      usdt: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // Testnet USDT
    }
  }
};

const deploymentConfig = {
  // Environment-specific settings
  production: {
    network: networkConfig.bscMainnet,
    verification: true,
    testing: true,
    monitoring: true,
    emergencyContacts: [
      // Add emergency contact addresses
    ]
  },
  
  staging: {
    network: networkConfig.bscTestnet,
    verification: true,
    testing: true,
    monitoring: false
  }
};

module.exports = {
  networkConfig,
  deploymentConfig,
  
  // Helper functions
  getMainnetConfig: () => networkConfig.bscMainnet,
  getTestnetConfig: () => networkConfig.bscTestnet,
  getProductionConfig: () => deploymentConfig.production,
  
  // Validation functions
  validateMainnetConfig: (config) => {
    const required = ['usdt', 'chainlinkBNBUSD'];
    return required.every(key => config.contracts[key]);
  },
  
  // Gas estimation helpers
  estimateDeploymentCost: (gasPrice = "5000000000") => {
    const deploymentGas = 8000000; // Estimated gas for full deployment
    const costWei = BigInt(deploymentGas) * BigInt(gasPrice);
    const costBNB = Number(costWei) / 1e18;
    return {
      gasUsed: deploymentGas,
      gasPriceGwei: Number(gasPrice) / 1e9,
      costWei: costWei.toString(),
      costBNB: costBNB.toFixed(4),
      costUSD: (costBNB * 600).toFixed(2) // Assuming 600 USD/BNB
    };
  }
};
