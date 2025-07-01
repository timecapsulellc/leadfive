// LeadFive Contract Configuration - Updated with MAINNET PRODUCTION addresses
export const CONTRACT_ADDRESS = '0x29dcCb502D10C042BcC6a02a7762C49595A9E498'; // MAINNET PROXY
export const IMPLEMENTATION_ADDRESS = '0x2cc37CB4e1F5D3D56E86c8792fD241d46064B2cF'; // MAINNET IMPLEMENTATION v1.10
export const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'; // BSC MAINNET USDT
export const SPONSOR_ADDRESS = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29'; // TREZOR WALLET (NEW OWNER)

// Network configuration
export const SUPPORTED_NETWORKS = {
  BSC_MAINNET: {
    chainId: '0x38',
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    blockExplorer: 'https://bscscan.com/',
    contractAddress: '0x29dcCb502D10C042BcC6a02a7762C49595A9E498',
    usdtAddress: '0x55d398326f99059fF775485246999027B3197955',
    sponsorAddress: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29'
  }
  // Testnet removed for production deployment
};

// Get contract address for current network
export const getContractAddress = (chainId) => {
  const networkConfig = Object.values(SUPPORTED_NETWORKS).find(
    network => network.chainId === chainId
  );
  return networkConfig?.contractAddress || CONTRACT_ADDRESS;
};

// Check if network is supported
export const isSupportedNetwork = (chainId) => {
  return Object.values(SUPPORTED_NETWORKS).some(
    network => network.chainId === chainId
  );
};

export const CONTRACT_ABI = [
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
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getBinaryMatrix",
    "outputs": [
      {
        "internalType": "address[2]",
        "name": "",
        "type": "address[2]"
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
    "name": "getDirectReferrals",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
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
    "name": "getUplineChain",
    "outputs": [
      {
        "internalType": "address[30]",
        "name": "",
        "type": "address[30]"
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
          }
        ],
        "internalType": "struct OrphiCrowdFund.User",
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
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "recoverUSDT",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint8",
        "name": "rank",
        "type": "uint8"
      }
    ],
    "name": "updateUserRank",
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
      },
      {
        "internalType": "uint8",
        "name": "rate",
        "type": "uint8"
      }
    ],
    "name": "updateWithdrawalRate",
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