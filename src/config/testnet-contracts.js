// LeadFive Testnet Contract Configuration for Enhanced Withdrawal Testing
export const TESTNET_CONTRACT_ADDRESS = '0x3e0de8CBc717311dbe1E0333B65c2fAb1e277736';
export const TESTNET_USDT_ADDRESS = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';

// Testnet Network Configuration
export const TESTNET_NETWORK = {
  chainId: '0x61', // BSC Testnet
  name: 'BSC Testnet',
  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  blockExplorer: 'https://testnet.bscscan.com/',
  contractAddress: TESTNET_CONTRACT_ADDRESS
};

// Enhanced ABI with new withdrawal functions
export const TESTNET_CONTRACT_ABI = [
  // Enhanced Withdrawal Functions
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "withdrawEnhanced",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bool", "name": "enabled", "type": "bool"}],
    "name": "toggleAutoCompound",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getWithdrawalSplit",
    "outputs": [
      {"internalType": "uint256", "name": "withdrawPercent", "type": "uint256"},
      {"internalType": "uint256", "name": "reinvestPercent", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserReferralCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "isAutoCompoundEnabled",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTreasuryWallet",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Basic Contract Functions
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserInfo",
    "outputs": [
      {
        "components": [
          {"internalType": "bool", "name": "isRegistered", "type": "bool"},
          {"internalType": "bool", "name": "isBlacklisted", "type": "bool"},
          {"internalType": "address", "name": "referrer", "type": "address"},
          {"internalType": "uint96", "name": "balance", "type": "uint96"},
          {"internalType": "uint96", "name": "totalInvestment", "type": "uint96"},
          {"internalType": "uint96", "name": "totalEarnings", "type": "uint96"},
          {"internalType": "uint96", "name": "earningsCap", "type": "uint96"},
          {"internalType": "uint32", "name": "directReferrals", "type": "uint32"},
          {"internalType": "uint32", "name": "teamSize", "type": "uint32"},
          {"internalType": "uint8", "name": "packageLevel", "type": "uint8"},
          {"internalType": "uint8", "name": "rank", "type": "uint8"},
          {"internalType": "uint8", "name": "withdrawalRate", "type": "uint8"},
          {"internalType": "uint32", "name": "lastHelpPoolClaim", "type": "uint32"},
          {"internalType": "bool", "name": "isEligibleForHelpPool", "type": "bool"},
          {"internalType": "uint32", "name": "registrationTime", "type": "uint32"},
          {"internalType": "string", "name": "referralCode", "type": "string"},
          {"internalType": "uint96", "name": "pendingRewards", "type": "uint96"},
          {"internalType": "uint32", "name": "lastWithdrawal", "type": "uint32"},
          {"internalType": "bool", "name": "isActive", "type": "bool"}
        ],
        "internalType": "struct LeadFiveTestnet.User",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPoolBalances",
    "outputs": [
      {"internalType": "uint96", "name": "", "type": "uint96"},
      {"internalType": "uint96", "name": "", "type": "uint96"},
      {"internalType": "uint96", "name": "", "type": "uint96"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "referrer", "type": "address"},
      {"internalType": "uint8", "name": "packageLevel", "type": "uint8"}
    ],
    "name": "register",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  // Events for enhanced withdrawal
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "adminFee", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "userReceives", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "reinvestAmount", "type": "uint256"}
    ],
    "name": "EnhancedWithdrawal",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "bool", "name": "enabled", "type": "bool"}
    ],
    "name": "AutoCompoundToggled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "poolType", "type": "string"}
    ],
    "name": "PoolReinvestment",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "reinvestAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "bonus", "type": "uint256"}
    ],
    "name": "AutoCompoundBonus",
    "type": "event"
  }
];

export default {
  contractAddress: TESTNET_CONTRACT_ADDRESS,
  usdtAddress: TESTNET_USDT_ADDRESS,
  network: TESTNET_NETWORK,
  abi: TESTNET_CONTRACT_ABI
};