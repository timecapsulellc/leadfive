<<<<<<< HEAD
// LeadFive Contract Configuration - Updated with MAINNET PRODUCTION addresses
export const CONTRACT_ADDRESS = '0x29dcCb502D10C042BcC6a02a7762C49595A9E498'; // MAINNET PROXY
export const IMPLEMENTATION_ADDRESS = '0x2cc37CB4e1F5D3D56E86c8792fD241d46064B2cF'; // MAINNET IMPLEMENTATION v1.10
export const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'; // BSC MAINNET USDT
export const SPONSOR_ADDRESS = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29'; // TREZOR WALLET (NEW OWNER)
=======
// LeadFive Contract Configuration - Updated with complete mainnet ABI
export const CONTRACT_ADDRESS = '0x29dcCb502D10C042BcC6a02a7762C49595A9E498';
export const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
export const CONTRACT_OWNER = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29'; // Trezor Wallet
export const TREASURY_WALLET = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29'; // Trezor Wallet
>>>>>>> 4e21071 (🔐 Complete dashboard implementation with Trezor security integration)

// Network configuration
export const SUPPORTED_NETWORKS = {
  BSC_MAINNET: {
    chainId: '0x38',
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    blockExplorer: 'https://bscscan.com/',
<<<<<<< HEAD
    contractAddress: '0x29dcCb502D10C042BcC6a02a7762C49595A9E498',
    usdtAddress: '0x55d398326f99059fF775485246999027B3197955',
    sponsorAddress: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29'
=======
    contractAddress: '0x29dcCb502D10C042BcC6a02a7762C49595A9E498'
>>>>>>> 4e21071 (🔐 Complete dashboard implementation with Trezor security integration)
  }
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

// Complete ABI with all enhanced functions
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
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "reinvestAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "bonus",
        "type": "uint256"
      }
    ],
    "name": "AutoCompoundBonus",
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
        "internalType": "bool",
        "name": "enabled",
        "type": "bool"
      }
    ],
    "name": "AutoCompoundToggled",
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
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "adminFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "userReceives",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "reinvestAmount",
        "type": "uint256"
      }
    ],
    "name": "EnhancedWithdrawal",
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
    "name": "OwnershipTransferCompleted",
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
    "name": "OwnershipTransferInitiated",
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
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "poolType",
        "type": "string"
      }
    ],
    "name": "PoolReinvestment",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "treasury",
        "type": "address"
      }
    ],
    "name": "TreasuryWalletSet",
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
    "name": "ADMIN_FEE_PERCENT",
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
    "name": "acceptOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "autoCompoundEnabled",
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
    "name": "getPendingTransfers",
    "outputs": [
      {
        "internalType": "address",
        "name": "pendingOwnerAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "pendingTreasuryAddress",
        "type": "address"
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
    "inputs": [],
    "name": "getTreasuryWallet",
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
            "name": "registrationTime",
            "type": "uint32"
          },
          {
            "internalType": "string",
            "name": "referralCode",
            "type": "string"
          },
          {
            "internalType": "uint96",
            "name": "pendingRewards",
            "type": "uint96"
          },
          {
            "internalType": "uint32",
            "name": "lastWithdrawal",
            "type": "uint32"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
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
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserReferralCount",
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
    "name": "getWithdrawalSplit",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "withdrawPercent",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "reinvestPercent",
        "type": "uint256"
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
      }
    ],
    "name": "initialize",
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
    "name": "initiateOwnershipTransfer",
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
    "name": "isAutoCompoundEnabled",
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
    "name": "pendingOwner",
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
    "name": "pendingTreasuryWallet",
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
    "inputs": [],
    "name": "rootUser",
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
    "name": "rootUserSet",
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
        "internalType": "address",
        "name": "_treasuryWallet",
        "type": "address"
      }
    ],
    "name": "setTreasuryWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "enabled",
        "type": "bool"
      }
    ],
    "name": "toggleAutoCompound",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "name": "clientOwner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "clientTreasury",
        "type": "address"
      }
    ],
    "name": "transferToClient",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "treasuryWallet",
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
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "userReferrals",
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
        "name": "registrationTime",
        "type": "uint32"
      },
      {
        "internalType": "string",
        "name": "referralCode",
        "type": "string"
      },
      {
        "internalType": "uint96",
        "name": "pendingRewards",
        "type": "uint96"
      },
      {
        "internalType": "uint32",
        "name": "lastWithdrawal",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
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
    "name": "withdrawEnhanced",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "xpContract",
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
    "stateMutability": "payable",
    "type": "receive"
  }
];

// Enhanced function selectors for easy reference
export const ENHANCED_FUNCTIONS = {
  withdrawEnhanced: 'withdrawEnhanced(uint256)',
  toggleAutoCompound: 'toggleAutoCompound(bool)',
  getWithdrawalSplit: 'getWithdrawalSplit(address)',
  getUserReferralCount: 'getUserReferralCount(address)',
  isAutoCompoundEnabled: 'isAutoCompoundEnabled(address)',
  getTreasuryWallet: 'getTreasuryWallet()',
  setTreasuryWallet: 'setTreasuryWallet(address)'
};

// Enhanced events for frontend listening
export const ENHANCED_EVENTS = [
  'TreasuryWalletSet',
  'AutoCompoundToggled', 
  'EnhancedWithdrawal',
  'PoolReinvestment',
  'AutoCompoundBonus'
];
