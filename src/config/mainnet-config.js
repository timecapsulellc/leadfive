// LeadFive Smart Contract Configuration for BSC Mainnet
export const LEADFIVE_CONFIG = {
  // Network Configuration
  NETWORK: {
    name: 'BSC Mainnet',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  },
  
  // Contract Addresses (Updated for Production)
  CONTRACTS: {
    // LeadFive Main Contract (Proxy)
    LEADFIVE_PROXY: '0x29dcCb502D10C042BcC6a02a7762C49595A9E498',
    // LeadFive Implementation
    LEADFIVE_IMPLEMENTATION: '0xc58620dd8fD9d244453e421E700c2D3FCFB595b4',
    // Real USDT on BSC
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    // Current Oracle (placeholder - can be upgraded)
    ORACLE: '0x1E95943b022dde7Ce7e0F54ced25599e0c6D8b9b'
  },
  
  // Contract Version Info
  VERSION: {
    current: '1.2.0',
    deployed: '2025-06-25',
    features: [
      'Production-ready deployment',
      'Real USDT integration',
      'Professional documentation',
      'Upgradeable proxy pattern',
      'Multi-level rewards system'
    ]
  },
  
  // Package Configuration (Updated to match contract)
  PACKAGES: {
    1: { price: 30, priceWei: '30000000', directBonus: 40, clubBonus: 10 },
    2: { price: 50, priceWei: '50000000', directBonus: 40, clubBonus: 15 },
    3: { price: 100, priceWei: '100000000', directBonus: 40, clubBonus: 20 },
    4: { price: 200, priceWei: '200000000', directBonus: 40, clubBonus: 25 }
  },
  
  // Business Rules
  BUSINESS_RULES: {
    earningsMultiplier: 4, // 4x earnings cap
    withdrawalRates: {
      tier1: 70, // 0-4 direct referrals
      tier2: 75, // 5-19 direct referrals  
      tier3: 80  // 20+ direct referrals
    },
    platformFee: 5, // 5% platform fee on withdrawals
    minimumWithdrawal: 1, // 1 USDT minimum
    maxLevels: 10, // Level bonus distribution
    chainLevels: 30 // Chain incentive levels
  },
  
  // URL References
  URLS: {
    contract: 'https://bscscan.com/address/0x29dcCb502D10C042BcC6a02a7762C49595A9E498',
    implementation: 'https://bscscan.com/address/0xc58620dd8fD9d244453e421E700c2D3FCFB595b4#code',
    usdt: 'https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955',
    documentation: 'https://leadfive.today/docs',
    whitepaper: 'https://leadfive.today/whitepaper.pdf'
  },
  
  // Frontend Configuration
  FRONTEND: {
    defaultGasLimit: '500000',
    gasPrice: '5000000000', // 5 Gwei
    retryAttempts: 3,
    confirmationBlocks: 3,
    refreshInterval: 30000, // 30 seconds
    cacheTimeout: 300000 // 5 minutes
  }
};

// Contract ABI (Essential functions for frontend)
export const LEADFIVE_ABI = [
  // User Management
  "function register(address sponsor, uint8 packageLevel, bool useUSDT) external payable",
  "function upgradePackage(uint8 newLevel, bool useUSDT) external payable",
  "function withdraw(uint96 amount) external",
  
  // View Functions - User Info
  "function getUserBasicInfo(address user) external view returns (bool, uint8, uint96)",
  "function getUserEarnings(address user) external view returns (uint96, uint96, uint32)",
  "function getUserNetwork(address user) external view returns (address, uint32)",
  "function calculateWithdrawalRate(address user) external view returns (uint8)",
  
  // View Functions - Contract Info
  "function getTotalUsers() external view returns (uint32)",
  "function getPackagePrice(uint8 packageLevel) external view returns (uint96)",
  "function getCurrentBNBPrice() external view returns (int256)",
  "function getPoolBalance(uint8 poolType) external view returns (uint96)",
  "function getMatrixPosition(address user) external view returns (address, address)",
  
  // Admin Functions (for admin panel)
  "function isAdmin(address user) external view returns (bool)",
  "function addAdmin(address admin) external",
  "function setPlatformFeeRecipient(address recipient) external",
  "function distributePool(uint8 poolType) external",
  "function emergencyPause() external",
  "function emergencyUnpause() external",
  
  // Events
  "event UserRegistered(address indexed user, address indexed sponsor, uint8 packageLevel, uint96 amount)",
  "event PackageUpgraded(address indexed user, uint8 newLevel, uint96 amount)",
  "event RewardDistributed(address indexed recipient, uint96 amount, uint8 rewardType)",
  "event UserWithdrawal(address indexed user, uint96 amount)",
  "event PoolDistributed(uint8 poolType, uint96 amount)"
];

// USDT Contract ABI
export const USDT_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
];

export default LEADFIVE_CONFIG;
