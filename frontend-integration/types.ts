// LeadFive Contract TypeScript Interfaces
// Generated automatically - do not edit manually

export interface LeadFiveConfig {
  contractAddress: string;
  implementationAddress: string;
  network: {
    name: string;
    chainId: number;
    rpcUrl: string;
    explorer: string;
  };
  tokens: {
    usdt: {
      address: string;
      decimals: number;
      symbol: string;
    };
  };
  sponsorAddress: string;
  dailyWithdrawalLimit: string;
}

export interface UserInfo {
  isRegistered: boolean;
  packageLevel: number;
  balance: string;
  totalEarnings: string;
  earningsCap: string;
  directReferrals: number;
  referrer: string;
  teamSize: number;
}

export interface PackageInfo {
  level: number;
  name: string;
  price: string;
  priceWei: string;
}

export interface SystemHealth {
  isOperational: boolean;
  userCount: number;
  totalFeesCollected: string;
  contractUSDTBalance: string;
  contractBNBBalance: string;
  circuitBreakerStatus: boolean;
}

// Contract Events
export interface ContractEvents {
  AdminAdded: {
    admin: string;
  };
  AdminRemoved: {
    admin: string;
  };
  AlgorithmicBonusDistributed: {
    user: string;
    amount: string;
  };
  CircuitBreakerReset: {
  };
  CircuitBreakerTriggered: {
    amount: string;
    threshold: string;
  };
  EarningsCapReached: {
    user: string;
    exceededAmount: string;
  };
  Initialized: {
    version: string;
  };
  MatrixCycleCompleted: {
    user: string;
    cycle: string;
  };
  NetworkPositionAssigned: {
    user: string;
    position: string;
  };
  OracleAdded: {
    oracle: string;
  };
  OracleRemoved: {
    oracle: string;
  };
  OwnershipTransferred: {
    previousOwner: string;
    newOwner: string;
  };
  PackageUpgraded: {
    user: string;
    newLevel: string;
    amount: string;
  };
  Paused: {
    account: string;
  };
  PlatformFeeCollected: {
    amount: string;
    user: string;
  };
  PoolDistributed: {
    poolType: string;
    amount: string;
  };
  ReinvestmentProcessed: {
    user: string;
    amount: string;
  };
  RewardDistributed: {
    recipient: string;
    amount: string;
    rewardType: string;
  };
  SecurityAlert: {
    alertType: string;
    user: string;
    value: string;
  };
  Unpaused: {
    account: string;
  };
  Upgraded: {
    implementation: string;
  };
  UserRegistered: {
    user: string;
    sponsor: string;
    packageLevel: string;
    amount: string;
  };
  UserWithdrawal: {
    user: string;
    amount: string;
  };
}

// Contract Functions Return Types
export interface ContractReturns {
  calculateWithdrawalRate: string;
  dailyWithdrawalLimit: string;
  getContractBalance: string;
  getPackagePrice: string;
  getPoolBalance: string;
  getSystemHealth: {
    isOperational: boolean;
    userCount: string;
    totalFeesCollected: string;
    contractUSDTBalance: string;
    contractBNBBalance: string;
    circuitBreakerStatus: boolean;
  };
  getTotalPlatformFees: string;
  getTotalUsers: string;
  getUSDTBalance: string;
  getUserBasicInfo: {
    value0: boolean;
    value1: string;
    value2: string;
  };
  getUserEarnings: {
    value0: string;
    value1: string;
    value2: string;
  };
  getUserNetwork: {
    value0: string;
    value1: string;
  };
  isAdmin: boolean;
  owner: string;
  paused: boolean;
  usdt: string;
  verifyPackageAllocations: {
    price: string;
    directBonus: string;
    levelBonus: string;
    uplineBonus: string;
    leaderBonus: string;
    helpBonus: string;
    totalAllocation: string;
  };
}

export const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "admin",
        "type": "address"
      }
    ],
    "name": "AdminAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "admin",
        "type": "address"
      }
    ],
    "name": "AdminRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint96",
        "name": "amount",
        "type": "uint96"
      }
    ],
    "name": "AlgorithmicBonusDistributed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "CircuitBreakerReset",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "threshold",
        "type": "uint256"
      }
    ],
    "name": "CircuitBreakerTriggered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint96",
        "name": "exceededAmount",
        "type": "uint96"
      }
    ],
    "name": "EarningsCapReached",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "version",
        "type": "uint64"
      }
    ],
    "name": "Initialized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "cycle",
        "type": "uint256"
      }
    ],
    "name": "MatrixCycleCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "position",
        "type": "uint32"
      }
    ],
    "name": "NetworkPositionAssigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oracle",
        "type": "address"
      }
    ],
    "name": "OracleAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oracle",
        "type": "address"
      }
    ],
    "name": "OracleRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "newLevel",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint96",
        "name": "amount",
        "type": "uint96"
      }
    ],
    "name": "PackageUpgraded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint96",
        "name": "amount",
        "type": "uint96"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "PlatformFeeCollected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "poolType",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint96",
        "name": "amount",
        "type": "uint96"
      }
    ],
    "name": "PoolDistributed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint96",
        "name": "amount",
        "type": "uint96"
      }
    ],
    "name": "ReinvestmentProcessed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint96",
        "name": "amount",
        "type": "uint96"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "rewardType",
        "type": "uint8"
      }
    ],
    "name": "RewardDistributed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "alertType",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "SecurityAlert",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "implementation",
        "type": "address"
      }
    ],
    "name": "Upgraded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sponsor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "packageLevel",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint96",
        "name": "amount",
        "type": "uint96"
      }
    ],
    "name": "UserRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint96",
        "name": "amount",
        "type": "uint96"
      }
    ],
    "name": "UserWithdrawal",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "admin",
        "type": "address"
      }
    ],
    "name": "addAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "calculateWithdrawalRate",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "dailyWithdrawalLimit",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyPause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyUnpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "packageLevel",
        "type": "uint8"
      }
    ],
    "name": "getPackagePrice",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "",
        "type": "uint96"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "poolType",
        "type": "uint8"
      }
    ],
    "name": "getPoolBalance",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "",
        "type": "uint96"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSystemHealth",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isOperational",
        "type": "bool"
      },
      {
        "internalType": "uint32",
        "name": "userCount",
        "type": "uint32"
      },
      {
        "internalType": "uint96",
        "name": "totalFeesCollected",
        "type": "uint96"
      },
      {
        "internalType": "uint256",
        "name": "contractUSDTBalance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "contractBNBBalance",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "circuitBreakerStatus",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalPlatformFees",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "",
        "type": "uint96"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalUsers",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getUSDTBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserBasicInfo",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      },
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      },
      {
        "internalType": "uint96",
        "name": "",
        "type": "uint96"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserEarnings",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "",
        "type": "uint96"
      },
      {
        "internalType": "uint96",
        "name": "",
        "type": "uint96"
      },
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserNetwork",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "isAdmin",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sponsor",
        "type": "address"
      },
      {
        "internalType": "uint8",
        "name": "packageLevel",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "useUSDT",
        "type": "bool"
      }
    ],
    "name": "register",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "admin",
        "type": "address"
      }
    ],
    "name": "removeAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newLimit",
        "type": "uint256"
      }
    ],
    "name": "setDailyWithdrawalLimit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "newLevel",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "useUSDT",
        "type": "bool"
      }
    ],
    "name": "upgradePackage",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "usdt",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "packageLevel",
        "type": "uint8"
      }
    ],
    "name": "verifyPackageAllocations",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "price",
        "type": "uint96"
      },
      {
        "internalType": "uint16",
        "name": "directBonus",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "levelBonus",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "uplineBonus",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "leaderBonus",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "helpBonus",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "totalAllocation",
        "type": "uint16"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint96",
        "name": "amount",
        "type": "uint96"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
