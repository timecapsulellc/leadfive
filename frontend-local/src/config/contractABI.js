// LeadFive Contract ABI
export const LEADFIVE_ABI = [
  // Read functions
  "function owner() view returns (address)",
  "function getTotalUsers() view returns (uint32)",
  "function getUserBasicInfo(address user) view returns (bool isRegistered, uint8 packageLevel, uint96 balance)",
  "function getUserEarnings(address user) view returns (uint96 totalEarnings, uint96 earningsCap, uint32 directReferrals)",
  "function getUserNetwork(address user) view returns (address referrer, uint32 teamSize)",
  "function getPackagePrice(uint8 packageLevel) view returns (uint96)",
  "function calculateWithdrawalRate(address user) view returns (uint8)",
  "function dailyWithdrawalLimit() view returns (uint256)",
  "function getPoolBalance(uint8 poolType) view returns (uint96)",
  "function getMatrixPosition(address user) view returns (address left, address right)",
  "function getContractBalance() view returns (uint256)",
  "function getUSDTBalance() view returns (uint256)",
  "function paused() view returns (bool)",
  "function isAdmin(address user) view returns (bool)",
  "function usdt() view returns (address)",
  
  // Write functions
  "function register(address sponsor, uint8 packageLevel, bool useUSDT) payable",
  "function upgradePackage(uint8 newLevel, bool useUSDT) payable",
  "function withdraw(uint96 amount)",
  
  // Admin functions
  "function setDailyWithdrawalLimit(uint256 newLimit)",
  "function pause()",
  "function unpause()",
  "function addAdmin(address admin)",
  "function removeAdmin(address admin)",
  
  // Events
  "event UserRegistered(address indexed user, address indexed sponsor, uint8 packageLevel, uint96 amount)",
  "event PackageUpgraded(address indexed user, uint8 newLevel, uint96 amount)",
  "event RewardDistributed(address indexed recipient, uint96 amount, uint8 rewardType)",
  "event UserWithdrawal(address indexed user, uint96 amount)",
  "event PoolDistributed(uint8 poolType, uint96 amount)",
  "event PlatformFeeCollected(uint96 amount, address indexed user)",
  "event AdminAdded(address indexed admin)",
  "event AdminRemoved(address indexed admin)",
  "event CircuitBreakerTriggered(uint256 amount, uint256 threshold)",
  "event EarningsCapReached(address indexed user, uint96 exceededAmount)",
  "event SecurityAlert(string indexed alertType, address indexed user, uint256 value)"
];

// USDT Contract ABI
export const USDT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

export default LEADFIVE_ABI;
