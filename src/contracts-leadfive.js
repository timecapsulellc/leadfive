// LEAD FIVE Contract Configuration
// Updated for NEW MAINNET DEPLOYMENT: 2025-06-21
// Contract Address: 0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569
// Network: BSC Mainnet (Chain ID: 56)
// Status: PRODUCTION READY ✅

export const LEAD_FIVE_CONFIG = {
    address: "0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569", // ✅ NEW MAINNET DEPLOYED
    implementationAddress: "0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569",
    network: "BSC Mainnet",
    chainId: 56,
    usdtAddress: "0x55d398326f99059fF775485246999027B3197955",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    blockExplorer: "https://bscscan.com",
    contractUrl: "https://bscscan.com/address/0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569", // ✅ NEW MAINNET DEPLOYED
    writeContractUrl: "https://bscscan.com/address/0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569#writeContract", // ✅ NEW MAINNET DEPLOYED
    owner: "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29", // ✅ TREZOR WALLET
    feeRecipient: "0xeB652c4523f3Cf615D3F3694b14E551145953aD0" // ✅ REVENUE COLLECTION ACTIVE
};

export const LEAD_FIVE_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "target",
        "type": "address"
      }
    ],
    "name": "AddressEmptyCode",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "implementation",
        "type": "address"
      }
    ],
    "name": "ERC1967InvalidImplementation",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ERC1967NonPayable",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EnforcedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpectedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FailedCall",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidInitialization",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotInitializing",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UUPSUnauthorizedCallContext",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "slot",
        "type": "bytes32"
      }
    ],
    "name": "UUPSUnsupportedProxiableUUID",
    "type": "error"
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
    "name": "AdminFeeCollected",
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
        "name": "bonusType",
        "type": "uint8"
      }
    ],
    "name": "BonusDistributed",
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
        "name": "level",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "bonusType",
        "type": "string"
      }
    ],
    "name": "GasLimitReached",
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
        "indexed": true,
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
        "name": "referrer",
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
    "name": "Withdrawal",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "UPGRADE_INTERFACE_VERSION",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "adminFeeRecipient",
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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "adminIds",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "binaryMatrix",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "status",
        "type": "bool"
      }
    ],
    "name": "blacklistUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "clubPool",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "balance",
        "type": "uint96"
      },
      {
        "internalType": "uint32",
        "name": "lastDistribution",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "interval",
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
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "directReferrals",
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
    "name": "distributePools",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "eligibleHelpPoolUsers",
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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAdminFeeInfo",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint96",
        "name": "",
        "type": "uint96"
      },
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
    "name": "getPoolBalances",
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
    "name": "getUserInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bool",
            "name": "isRegistered",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isBlacklisted",
            "type": "bool"
          },
          {
            "internalType": "address",
            "name": "referrer",
            "type": "address"
          },
          {
            "internalType": "uint96",
            "name": "balance",
            "type": "uint96"
          },
          {
            "internalType": "uint96",
            "name": "totalInvestment",
            "type": "uint96"
          },
          {
            "internalType": "uint96",
            "name": "totalEarnings",
            "type": "uint96"
          },
          {
            "internalType": "uint96",
            "name": "earningsCap",
            "type": "uint96"
          },
          {
            "internalType": "uint32",
            "name": "directReferrals",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "teamSize",
            "type": "uint32"
          },
          {
            "internalType": "uint8",
            "name": "packageLevel",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "rank",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "withdrawalRate",
            "type": "uint8"
          },
          {
            "internalType": "uint32",
            "name": "lastHelpPoolClaim",
            "type": "uint32"
          },
          {
            "internalType": "bool",
            "name": "isEligibleForHelpPool",
            "type": "bool"
          },
          {
            "internalType": "uint32",
            "name": "matrixPosition",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "matrixLevel",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "registrationTime",
            "type": "uint32"
          },
          {
            "internalType": "string",
            "name": "referralCode",
            "type": "string"
          }
        ],
        "internalType": "struct CommissionLib.User",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "helpPool",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "balance",
        "type": "uint96"
      },
      {
        "internalType": "uint32",
        "name": "lastDistribution",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "interval",
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
        "name": "_usdt",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_priceFeed",
        "type": "address"
      },
      {
        "internalType": "address[16]",
        "name": "_adminIds",
        "type": "address[16]"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "leaderPool",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "balance",
        "type": "uint96"
      },
      {
        "internalType": "uint32",
        "name": "lastDistribution",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "interval",
        "type": "uint32"
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
    "inputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "name": "packages",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "price",
        "type": "uint96"
      },
      {
        "components": [
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
            "name": "clubBonus",
            "type": "uint16"
          }
        ],
        "internalType": "struct CommissionLib.CommissionRates",
        "name": "rates",
        "type": "tuple"
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
    "inputs": [],
    "name": "priceFeed",
    "outputs": [
      {
        "internalType": "contract IPriceFeed",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proxiableUUID",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "referralCodeToUser",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "referrer",
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
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_recipient",
        "type": "address"
      }
    ],
    "name": "setAdminFeeRecipient",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "shiningStarLeaders",
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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "silverStarLeaders",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "spilloverCounter",
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
    "name": "totalAdminFeesCollected",
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
    "name": "totalUsers",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newImplementation",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "upgradeToAndCall",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "uplineChain",
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
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "users",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isRegistered",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isBlacklisted",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      },
      {
        "internalType": "uint96",
        "name": "balance",
        "type": "uint96"
      },
      {
        "internalType": "uint96",
        "name": "totalInvestment",
        "type": "uint96"
      },
      {
        "internalType": "uint96",
        "name": "totalEarnings",
        "type": "uint96"
      },
      {
        "internalType": "uint96",
        "name": "earningsCap",
        "type": "uint96"
      },
      {
        "internalType": "uint32",
        "name": "directReferrals",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "teamSize",
        "type": "uint32"
      },
      {
        "internalType": "uint8",
        "name": "packageLevel",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "rank",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "withdrawalRate",
        "type": "uint8"
      },
      {
        "internalType": "uint32",
        "name": "lastHelpPoolClaim",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "isEligibleForHelpPool",
        "type": "bool"
      },
      {
        "internalType": "uint32",
        "name": "matrixPosition",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "matrixLevel",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "registrationTime",
        "type": "uint32"
      },
      {
        "internalType": "string",
        "name": "referralCode",
        "type": "string"
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
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

// Package Tiers - PDF Specification: Only 4 packages
export const PACKAGE_TIERS = {
    NONE: 0,
    PACKAGE_30: 1,   // Entry Level - Web3 Starter
    PACKAGE_50: 2,   // Standard - Community Builder  
    PACKAGE_100: 3,  // Advanced - DAO Contributor
    PACKAGE_200: 4   // Premium - Ecosystem Pioneer
};

// Package Amounts (USDT with 18 decimals for LeadFive contract) - PDF Specification
export const PACKAGE_AMOUNTS = {
    [PACKAGE_TIERS.PACKAGE_30]: "30000000000000000000",     // 30 USDT - Entry Level
    [PACKAGE_TIERS.PACKAGE_50]: "50000000000000000000",     // 50 USDT - Standard
    [PACKAGE_TIERS.PACKAGE_100]: "100000000000000000000",   // 100 USDT - Advanced
    [PACKAGE_TIERS.PACKAGE_200]: "200000000000000000000"    // 200 USDT - Premium
};

// Package Display Information - PDF Specification
export const PACKAGES = [
    { 
        id: 1, 
        price: 30, 
        name: "Entry Level", 
        subtitle: "Web3 Starter",
        description: "BSC Powered blockchain participation"
    },
    { 
        id: 2, 
        price: 50, 
        name: "Standard", 
        subtitle: "Community Builder",
        description: "BSC Powered community engagement"
    },
    { 
        id: 3, 
        price: 100, 
        name: "Advanced", 
        subtitle: "DAO Contributor",
        description: "BSC Powered DAO governance"
    },
    { 
        id: 4, 
        price: 200, 
        name: "Premium", 
        subtitle: "Ecosystem Pioneer",
        description: "BSC Powered ecosystem leadership"
    }
];

export default {
    LEAD_FIVE_CONFIG,
    LEAD_FIVE_ABI,
    PACKAGE_TIERS,
    PACKAGE_AMOUNTS,
    PACKAGES
};
