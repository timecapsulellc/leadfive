// Lead Five Contract Configuration for Production Deployment
// Auto-generated on 2025-07-01T00:00:00.000Z

window.LEADFIVE_CONTRACT_CONFIG = {
    address: "0x29dcCb502D10C042BcC6a02a7762C49595A9E498",
    implementationAddress: "0xA4AB35Ab2BA415E6CCf9559e8dcAB0661cC29e2b",
    network: "BSC Mainnet",
    chainId: 56,
    usdtAddress: "0x55d398326f99059fF775485246999027B3197955",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    blockExplorer: "https://bscscan.com",
    contractUrl: "https://bscscan.com/address/0x8F826B18096Dcf7AF4515B06Cb563475d189ab50",
    writeContractUrl: "https://bscscan.com/address/0x8F826B18096Dcf7AF4515B06Cb563475d189ab50#writeContract"
};

// Package Configuration
window.PACKAGE_TIERS = {
    NONE: 0,
    PACKAGE_30: 1,
    PACKAGE_50: 2,
    PACKAGE_100: 3,
    PACKAGE_200: 4
};

window.PACKAGE_AMOUNTS = {
    [window.PACKAGE_TIERS.PACKAGE_30]: "30000000",   // 30 USDT (6 decimals)
    [window.PACKAGE_TIERS.PACKAGE_50]: "50000000",   // 50 USDT
    [window.PACKAGE_TIERS.PACKAGE_100]: "100000000", // 100 USDT
    [window.PACKAGE_TIERS.PACKAGE_200]: "200000000"  // 200 USDT
};

// Leader Ranks
window.LEADER_RANKS = {
    NONE: 0,
    SHINING_STAR: 1,
    SILVER_STAR: 2
};

// Simplified ABI for key functions
window.CONTRACT_ABI = [
    "function registerUser(address sponsor, uint8 packageTier) external",
    "function withdraw(uint256 amount) external",
    "function upgradePackage(uint8 newTier) external",
    "function getUserInfo(address user) external view returns (uint256 totalInvested, uint256 registrationTime, uint256 teamSize, uint256 totalEarnings, uint256 withdrawableAmount, uint8 packageTier, uint8 leaderRank, bool isCapped, bool isActive, address sponsor, uint32 directReferrals)",
    "function getPoolEarnings(address user) external view returns (uint128[5] memory)",
    "function getDirectReferrals(address user) external view returns (address[] memory)",
    "function getWithdrawalRate(address user) external view returns (uint256)",
    "function isUserRegistered(address user) external view returns (bool)",
    "function totalUsers() external view returns (uint256)",
    "function totalVolume() external view returns (uint256)",
    "function globalHelpPoolBalance() external view returns (uint256)",
    "function leaderBonusPoolBalance() external view returns (uint256)",
    "function getPackageAmounts() external view returns (uint256[4] memory)",
    "event UserRegistered(address indexed user, address indexed sponsor, uint8 indexed packageTier, uint256 amount, uint256 timestamp)",
    "event WithdrawalProcessed(address indexed user, uint256 indexed amount, uint256 reinvestmentAmount, uint256 timestamp)",
    "event CommissionDistributed(address indexed recipient, address indexed payer, uint256 indexed amount, uint8 poolType, string poolName, uint256 timestamp)"
];

console.log('✅ Lead Five Contract Configuration Loaded');
