const CONTRACT_DATA = {
  "abi": [
    {
      "inputs": [],
      "name": "AccessControlBadConfirmation",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "neededRole",
          "type": "bytes32"
        }
      ],
      "name": "AccessControlUnauthorizedAccount",
      "type": "error"
    },
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
          "internalType": "bool",
          "name": "enabled",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "maxDaily",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "threshold",
          "type": "uint256"
        }
      ],
      "name": "CircuitBreakerConfigUpdated",
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
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
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
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "payer",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "poolType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "poolName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "CommissionDistributed",
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
          "internalType": "uint256",
          "name": "totalEarnings",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "investmentAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "EarningsCapReached",
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
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "EmergencyPauseActivated",
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
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "EmergencyPauseDeactivated",
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
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "EmergencyWithdrawal",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "batchAmount",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "batchEligibleUsers",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "startIndex",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "endIndex",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "GlobalHelpPoolBatchDistributed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "totalAmount",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "eligibleUsers",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "perUserAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "GlobalHelpPoolDistributed",
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
          "name": "oldManager",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newManager",
          "type": "address"
        }
      ],
      "name": "InternalAdminManagerUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "bool",
          "name": "enabled",
          "type": "bool"
        }
      ],
      "name": "InternalAdminStatusChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "batchAmount",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "batchShiningStars",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "batchSilverStars",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "startIndex",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "endIndex",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "LeaderBonusBatchDistributed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "shiningStarAmount",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "silverStarAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "shiningStarCount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "silverStarCount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "LeaderBonusDistributed",
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
          "name": "placedUnder",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "position",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "level",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "MatrixPlacement",
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
          "indexed": true,
          "internalType": "enum OrphiCrowdFund.PackageTier",
          "name": "oldTier",
          "type": "uint8"
        },
        {
          "indexed": true,
          "internalType": "enum OrphiCrowdFund.PackageTier",
          "name": "newTier",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "upgradeCost",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
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
          "indexed": true,
          "internalType": "enum OrphiCrowdFund.LeaderRank",
          "name": "oldRank",
          "type": "uint8"
        },
        {
          "indexed": true,
          "internalType": "enum OrphiCrowdFund.LeaderRank",
          "name": "newRank",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "RankAdvancement",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "previousAdminRole",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "newAdminRole",
          "type": "bytes32"
        }
      ],
      "name": "RoleAdminChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleGranted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleRevoked",
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
          "name": "newImplementation",
          "type": "address"
        }
      ],
      "name": "UpgradeExecuted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "newImplementation",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "unlockTime",
          "type": "uint256"
        }
      ],
      "name": "UpgradeProposed",
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
          "indexed": true,
          "internalType": "enum OrphiCrowdFund.PackageTier",
          "name": "packageTier",
          "type": "uint8"
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
          "name": "timestamp",
          "type": "uint256"
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
          "indexed": true,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "reinvestmentAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "WithdrawalProcessed",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "BASE_WITHDRAWAL_RATE",
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
      "name": "BASIS_POINTS",
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
      "name": "DEFAULT_ADMIN_ROLE",
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
      "inputs": [],
      "name": "DISTRIBUTION_BATCH_SIZE",
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
      "name": "EARNINGS_CAP_MULTIPLIER",
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
      "name": "EMERGENCY_ROLE",
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
      "inputs": [],
      "name": "GLOBAL_HELP_POOL_RATE",
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
      "name": "GLOBAL_UPLINE_RATE",
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
      "name": "LEADER_BONUS_RATE",
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
      "name": "LEADER_DISTRIBUTION_INTERVAL",
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
      "name": "LEVEL_BONUS_RATE",
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
      "name": "MID_WITHDRAWAL_RATE",
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
      "name": "MIN_BLOCK_DELAY",
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
      "name": "ORACLE_MANAGER_ROLE",
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
      "inputs": [],
      "name": "POOL_MANAGER_ROLE",
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
      "inputs": [],
      "name": "PRO_WITHDRAWAL_RATE",
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
      "name": "SHINING_STAR_DIRECT_REQUIREMENT",
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
      "name": "SHINING_STAR_TEAM_REQUIREMENT",
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
      "name": "SILVER_STAR_TEAM_REQUIREMENT",
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
      "name": "SPONSOR_COMMISSION_RATE",
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
      "name": "STORAGE_VERSION",
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
      "name": "TREASURY_ROLE",
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
      "inputs": [],
      "name": "UPGRADER_ROLE",
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
      "inputs": [],
      "name": "UPGRADE_DELAY",
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
      "name": "WEEKLY_DISTRIBUTION_INTERVAL",
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
          "name": "newImplementation",
          "type": "address"
        }
      ],
      "name": "cancelUpgrade",
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
      "name": "checkRankAdvancement",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "circuitBreakerEnabled",
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
      "name": "currentDayWithdrawals",
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
      "inputs": [
        {
          "internalType": "uint256",
          "name": "batchSize",
          "type": "uint256"
        }
      ],
      "name": "distributeGlobalHelpPool",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "distributeGlobalHelpPool",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "batchSize",
          "type": "uint256"
        }
      ],
      "name": "distributeLeaderBonus",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "distributeLeaderBonus",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "emergencyAddress",
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
      "name": "emergencyPause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "emergencyPauseThreshold",
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
      "name": "emergencyUnpause",
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
      "inputs": [],
      "name": "getAllInternalAdmins",
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
      "name": "getCircuitBreakerStatus",
      "outputs": [
        {
          "internalType": "bool",
          "name": "enabled",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "maxDaily",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "currentDaily",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "resetTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "threshold",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCurrentUSDTPrice",
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
      "name": "getDistributionStatus",
      "outputs": [
        {
          "internalType": "bool",
          "name": "ghpInProgress",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "ghpIndex",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "leaderInProgress",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "leaderIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "batchSize",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getInternalAdminConfig",
      "outputs": [
        {
          "internalType": "address",
          "name": "adminManagerAddress",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "enabled",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "adminCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getInternalAdminCount",
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
      "name": "getLevelBonusRates",
      "outputs": [
        {
          "internalType": "uint256[10]",
          "name": "",
          "type": "uint256[10]"
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
      "name": "getMatrixChildren",
      "outputs": [
        {
          "internalType": "address",
          "name": "left",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "right",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getPackageAmounts",
      "outputs": [
        {
          "internalType": "uint256[4]",
          "name": "",
          "type": "uint256[4]"
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
      "name": "getPoolEarnings",
      "outputs": [
        {
          "internalType": "uint128[5]",
          "name": "",
          "type": "uint128[5]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        }
      ],
      "name": "getRoleAdmin",
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
          "internalType": "uint256",
          "name": "totalInvested",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "registrationTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "teamSize",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalEarnings",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "withdrawableAmount",
          "type": "uint256"
        },
        {
          "internalType": "enum OrphiCrowdFund.PackageTier",
          "name": "packageTier",
          "type": "uint8"
        },
        {
          "internalType": "enum OrphiCrowdFund.LeaderRank",
          "name": "leaderRank",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "isCapped",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        },
        {
          "internalType": "address",
          "name": "sponsor",
          "type": "address"
        },
        {
          "internalType": "uint32",
          "name": "directReferralCount",
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
      "name": "getWithdrawalRate",
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
      "name": "ghpDistributionInProgress",
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
      "name": "ghpDistributionIndex",
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
      "name": "globalHelpPoolBalance",
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
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "grantRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "hasRole",
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
          "name": "_usdtToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_treasuryAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_emergencyAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_poolManagerAddress",
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
          "name": "_adminManager",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "_enabled",
          "type": "bool"
        }
      ],
      "name": "initializeInternalAdminManager",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "internalAdminEnabled",
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
      "name": "internalAdminManager",
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
          "name": "_admin",
          "type": "address"
        }
      ],
      "name": "isInternalAdmin",
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
          "name": "user",
          "type": "address"
        }
      ],
      "name": "isUserRegistered",
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
      "name": "lastGlobalHelpPoolDistribution",
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
      "name": "lastLeaderBonusDistribution",
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
          "name": "",
          "type": "address"
        }
      ],
      "name": "lastTransactionBlock",
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
      "name": "lastWithdrawalResetTime",
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
      "name": "leaderBonusPoolBalance",
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
      "name": "leaderDistributionInProgress",
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
      "name": "leaderDistributionIndex",
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
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "levelBonusRates",
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
      "name": "maxDailyWithdrawals",
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
      "name": "maxPriceAge",
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
      "name": "oracleEnabled",
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
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "packageAmounts",
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
      "name": "pause",
      "outputs": [],
      "stateMutability": "nonpayable",
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
      "name": "platformFeeRate",
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
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "poolBalances",
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
      "name": "poolManagerAddress",
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
      "name": "priceDeviationThreshold",
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
      "name": "priceOracle",
      "outputs": [
        {
          "internalType": "contract IPriceOracle",
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
        }
      ],
      "name": "proposeUpgrade",
      "outputs": [],
      "stateMutability": "nonpayable",
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
      "name": "proposedUpgrades",
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
          "internalType": "address",
          "name": "sponsor",
          "type": "address"
        },
        {
          "internalType": "enum OrphiCrowdFund.PackageTier",
          "name": "packageTier",
          "type": "uint8"
        }
      ],
      "name": "registerUser",
      "outputs": [],
      "stateMutability": "nonpayable",
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
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "callerConfirmation",
          "type": "address"
        }
      ],
      "name": "renounceRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "revokeRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "_enabled",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "_maxDailyWithdrawals",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_emergencyPauseThreshold",
          "type": "uint256"
        }
      ],
      "name": "setCircuitBreakerConfig",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "_enabled",
          "type": "bool"
        }
      ],
      "name": "setInternalAdminEnabled",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_adminManager",
          "type": "address"
        }
      ],
      "name": "setInternalAdminManager",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "_enabled",
          "type": "bool"
        }
      ],
      "name": "setOracleEnabled",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_priceOracle",
          "type": "address"
        }
      ],
      "name": "setPriceOracle",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "storageLayoutHash",
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
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
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
      "name": "totalDistributedAmount",
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
      "name": "totalUsers",
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
      "name": "totalVolume",
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
          "internalType": "string",
          "name": "_action",
          "type": "string"
        }
      ],
      "name": "trackAdminActivity",
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
      "inputs": [],
      "name": "treasuryAddress",
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
      "name": "triggerCircuitBreaker",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unpause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_treasuryAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_emergencyAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_poolManagerAddress",
          "type": "address"
        }
      ],
      "name": "updateAdminAddresses",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum OrphiCrowdFund.PackageTier",
          "name": "newTier",
          "type": "uint8"
        }
      ],
      "name": "upgradePackage",
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
      "name": "usdtToken",
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
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userIdToAddress",
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
          "internalType": "uint128",
          "name": "totalInvested",
          "type": "uint128"
        },
        {
          "internalType": "uint64",
          "name": "registrationTime",
          "type": "uint64"
        },
        {
          "internalType": "uint32",
          "name": "teamSize",
          "type": "uint32"
        },
        {
          "internalType": "uint32",
          "name": "lastActivity",
          "type": "uint32"
        },
        {
          "internalType": "uint128",
          "name": "totalEarnings",
          "type": "uint128"
        },
        {
          "internalType": "uint128",
          "name": "withdrawableAmount",
          "type": "uint128"
        },
        {
          "internalType": "uint64",
          "name": "packageTierValue",
          "type": "uint64"
        },
        {
          "internalType": "uint32",
          "name": "leaderRankValue",
          "type": "uint32"
        },
        {
          "internalType": "uint32",
          "name": "directReferrals",
          "type": "uint32"
        },
        {
          "internalType": "bool",
          "name": "isCapped",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        },
        {
          "internalType": "address",
          "name": "sponsor",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "leftChild",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "rightChild",
          "type": "address"
        },
        {
          "internalType": "uint32",
          "name": "currentLevel",
          "type": "uint32"
        },
        {
          "internalType": "uint32",
          "name": "leftLegCount",
          "type": "uint32"
        },
        {
          "internalType": "uint32",
          "name": "rightLegCount",
          "type": "uint32"
        },
        {
          "internalType": "uint32",
          "name": "weeklyHelpPoolShares",
          "type": "uint32"
        },
        {
          "internalType": "uint128",
          "name": "totalWithdrawn",
          "type": "uint128"
        },
        {
          "internalType": "uint64",
          "name": "lastWithdrawal",
          "type": "uint64"
        },
        {
          "internalType": "uint32",
          "name": "withdrawalCount",
          "type": "uint32"
        },
        {
          "internalType": "uint32",
          "name": "reinvestmentPercentage",
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
          "name": "_caller",
          "type": "address"
        }
      ],
      "name": "validateInternalAdminAccess",
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
      "name": "version",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "weeklyDistributionCount",
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
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  "bytecode": "0x60a0806040523461002b5730608052617dd39081620000318239608051818181613e370152613fd40152f35b600080fdfe608080604052600436101561001357600080fd5b600090813560e01c90816301ffc9a7146153da57508063054f7623146153be57806305ad3935146153635780630cac6de7146153455780630f7d8e5514615322578063117559e71461530657806312e2fb3f14614f3057806314c469ce14614f1457806314c515ff14614e565780631584410a14614e3857806315b5a02914614e1a578063163f752214614dab5780631c1e7d381461105a5780631e5a461814614d8557806320df435914614d4a57806320e5a6be14614d2e578063248a9ca314614cf45780632630c12f14614ccd57806327d7a4ea14614b495780632bbfdd5714614b2b5780632e1a7d4d146146545780632f2ff15d1461460957806336568abe146145a957806338276a551461454c5780633f4ba83a146144d45780633f9dc9e01461446057806340205a8c1461441c57806347fe8b1d146143fe57806349257d5e14610f305780634a4e3bd5146143305780634bd8befa146143135780634ced1f0c146142f55780634f1ef28614613f5757806351858e2714613eb157806352d1902d14613e1c578063530e784f14613ddd5780635312ea8e14613be157806353cdd55a14613bc457806354fd4d5014613b2257806356d7356814613ae757806358c23d5914613aca578063599c42211461105a5780635bab9cbb146139fa5780635c975abb146139b85780635f81a57c1461399a5780636154c5b21461368e578063637afb10146136725780636386c1c71461356b57806365b8792e14613173578063677bd524146131555780636d9a8bb814613138578063715018a6146130bd578063756a24e41461309a5780637669fa1d1461307c5780637aff9988146130315780637b865e5f14612f905780637bc00df814612f0b57806380b7248b14612eed57806380ea24a814612ecf5780638443339914612eb15780638456cb5914612e37578063883fb2c714612e1c5780638b19fc1914612d765780638da5cb5b14612d305780638f9c6f161461294c57806391d14854146128f757806396395e61146128da5780639740041e146128805780639a1066d3146128645780639c0f201c1461282f5780639e9fa09714611cab5780639ed6ae2d14611c845780639ef2b38114611c68578063a1b140b614611c1f578063a217fddf14611c03578063a529714814611bd6578063a649cf7614611bb8578063a707603814611b80578063a86c7aa114611b5a578063a87430ba14611a02578063a978c360146119e5578063a98ad46c146119be578063ab9068fa1461199b578063acd201ba1461196e578063ad3cb1cc146118f1578063b1695201146118be578063b18481d8146118a0578063b317d69d146117fa578063b43fdd3e14611762578063ba2300731461172a578063be054543146116fd578063bfc69e1c146116c2578063bff1f9e1146116a4578063c22b1de614611686578063c343998814611558578063c44fb8ec1461151c578063c5f956af146114f5578063c915fc9314611457578063cadc61131461113d578063d11a57ec14611102578063d13531d3146110e4578063d1c4057b1461105f578063d2581b091461105a578063d2c8e0e514610fcb578063d547741f14610f7c578063dbe3b3fa14610f5e578063de4fd30e14610f30578063e07232ad14610eb1578063e1f1c4a714610e94578063e6a13f3014610e6d578063eb67f0ca14610e50578063eb8c8d4114610e0b578063ec7a8bcc14610de8578063eeca08f014610dca578063f2fde38b14610d9d578063f72c0d8b14610d62578063f8c8765e14610585578063fa596d32146105675763fddf3f731461053e57600080fd5b3461056457806003193601126105645760206001600160a01b0360155416604051908152f35b80fd5b50346105645780600319360112610564576020602954604051908152f35b50346105645760803660031901126105645761059f6154bf565b6105a76154d5565b906105b06154eb565b6064916001600160a01b03833581811693848203610d5d577ff0c57e16840df040f15088dc2f81fe391c3923bec73e23a9662efc9c229c6a009687549560ff8760401c16159467ffffffffffffffff9788811697881580610d56575b6001809a149081610d4c575b159081610d43575b50610d195767ffffffffffffffff19821689178c55829188610cfa575b5016908115610c915780841690610655821515615ab8565b851690610663821515615b29565b61066e841515615b9a565b610676617c91565b61067e617c91565b61068733616003565b61068f617c91565b610697617c91565b61069f617c91565b887f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00556106ca617c91565b6106d2617c91565b6001600160a01b0319928360125416176012558260145416176014558160155416176015556016541617601655604051966080880188811088821117610c4b576040526301c9c38088526020976302faf080898201526305f5e1006040820152630bebc2006060820152868b5b60048110610c785750505060405190610140820182811089821117610c4b5760405261012c8252808983015280604083015280606083015280608083015260a0820152603260c0820152603260e082015260326101008201526032610120820152858a5b600a8110610c61575050506107df92916107d36107d9926107c3336168fd565b506107cd3361699d565b506166c3565b50616785565b50616841565b506107e933616a59565b5060fa60265560ff198060275416602755610e106028556103e89081602955602a5416602a55602b5585602c5542602d556101f4602e55604051848101907f557365725f76320000000000000000000000000000000000000000000000000082527f746f74616c496e7665737465643a75696e74313238000000000000000000000060278201527f726567697374726174696f6e54696d653a75696e743634000000000000000000603c8201527f7465616d53697a653a75696e743332000000000000000000000000000000000060538201527f6c61737441637469766974793a75696e7433320000000000000000000000000060628201527f746f74616c4561726e696e67733a75696e74313238000000000000000000000060758201527f776974686472617761626c65416d6f756e743a75696e74313238000000000000608a8201527f7061636b6167655469657256616c75653a75696e74363400000000000000000060a48201527f6c656164657252616e6b56616c75653a75696e7433320000000000000000000060bb8201527f646972656374526566657272616c733a75696e7433320000000000000000000060d18201527f69734361707065643a626f6f6c0000000000000000000000000000000000000060e78201527f69734163746976653a626f6f6c0000000000000000000000000000000000000060f48201527f73706f6e736f723a6164647265737300000000000000000000000000000000006101018201527f6c6566744368696c643a616464726573730000000000000000000000000000006101108201527f72696768744368696c643a6164647265737300000000000000000000000000006101218201527f706f6f6c4561726e696e67733a75696e743132385b355d0000000000000000006101338201527f63757272656e744c6576656c3a75696e7433320000000000000000000000000061014a8201527f6c6566744c6567436f756e743a75696e7433320000000000000000000000000061015d8201527f72696768744c6567436f756e743a75696e7433320000000000000000000000006101708201527f7765656b6c7948656c70506f6f6c5368617265733a75696e74333200000000006101848201527f746f74616c57697468647261776e3a75696e743132380000000000000000000061019f8201527f6c6173745769746864726177616c3a75696e74363400000000000000000000006101b58201527f7769746864726177616c436f756e743a75696e743332000000000000000000006101ca8201527f7265696e766573746d656e7450657263656e746167653a75696e7433320000006101e08201527f53544f524147455f56455253494f4e3a320000000000000000000000000000006101fd8201526101ee815261022081019481861090861117610c4b57846040525190208655610c0e578480f35b7fc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d29368ff00000000000000001981541690558152a1388080808480f35b634e487b7160e01b600052604160045260246000fd5b8961ffff84511693019281601c01550186906107a3565b8a63ffffffff845116930192816018015501879061073f565b60848a7f72657373000000000000000000000000000000000000000000000000000000006040519162461bcd60e51b8352602060048401526024808401527f4f7270686943726f776446756e643a20496e76616c69642055534454206164646044840152820152fd5b68ffffffffffffffffff191668010000000000000001178c553861063d565b60046040517ff92ee8a9000000000000000000000000000000000000000000000000000000008152fd5b90501538610620565b303b159150610618565b508761060c565b600080fd5b503461056457806003193601126105645760206040517f189ab7a9244df0848122154315af71fe140f3db0fe014031783b0946b8c9d2e38152f35b503461056457602036600319011261056457610dc7610dba6154bf565b610dc2616c21565b616003565b80f35b50346105645780600319360112610564576020602654604051908152f35b50346105645780600319360112610564576020610e03615d93565b604051908152f35b503461056457806003193601126105645760a060ff602a5416602b54602c54602d5490602e549260405194151585526020850152604084015260608301526080820152f35b503461056457806003193601126105645760206040516101f48152f35b503461056457806003193601126105645760206001600160a01b0360165416604051908152f35b503461056457806003193601126105645760206040516127108152f35b50346105645780600319360112610564576080604051610ed081615577565b36903760405190601881835b60048210610f1a578385610eef81615577565b6040519190825b60048310610f0357608084f35b600190825181526020809101920192019190610ef6565b6001602081928554815201930191019091610edc565b5034610564576020366003190112610564576020610f54610f4f6154bf565b615ced565b6040519015158152f35b50346105645780600319360112610564576020600c54604051908152f35b503461056457604036600319011261056457610fc7600435610f9c6154d5565b90808452600080516020617d7e833981519152602052610fc26001604086200154616248565b616b9d565b5080f35b503461056457602080600319360112611056576001600160a01b039182610ff06154bf565b168152600360205260408120926040519081936020865493848152019584526020842093915b83831061103d576110398661102d818a03826155e9565b6040519182918261547a565b0390f35b8454811687529581019560019485019490920191611016565b5080fd5b61552f565b50346105645780600319360112610564576040519061107d826155b0565b610140809236903760405190601c81835b600a82106110ce57505050906110a3816155b0565b6040519190825b600a83106110b757505050f35b6001908251815260208091019201920191906110aa565b600160208192855481520193019101909161108e565b50346105645780600319360112610564576020602c54604051908152f35b503461056457806003193601126105645760206040517fe1dcbdb91df27212a29bc27177c840cf2f819ecf2187432e1fac86c2dd5dfca98152f35b50346105645780600319360112610564576111566160a1565b60335460ff9081811615611418575b50603154606481018082116114025780926005548092116113f9575b600091835b8581106113935750826111ff575b505050508060315560055411156111a85780f35b6000600c5542600e556111bc6010546158b8565b60105560ff19603354166033556000603155600080807fd9046852f944e541fee861707f92ef4bbc6fe687925eaacc452ea592e8185e8b6020604051428152a480f35b60009060005b81811061132d57505080156112df5761122090600c54615876565b906000935b85811061126b57505050603154917fce74be02aea5db55e00b80ef7d43dae297ff65326a20d95a572c46e255d9fd5160408051868152426020820152a438808080611194565b80600052600260209080825260016001600160a01b03604060002054169283600052526040600020015483808260881c1691826112d1575b50506112b3575b50600101611225565b83600192966112c5826112ca94617399565b615856565b94906112aa565b60801c1615905083386112a3565b608460405162461bcd60e51b815260206004820152602160248201527f4f7270686943726f776446756e643a204e6f20656c696769626c6520757365726044820152607360f81b6064820152fd5b806000526002600160208281526001600160a01b0360406000205416600052526040600020015484808260881c169182611385575b5050611371575b600101611205565b9161137d6001916158b8565b929050611369565b60801c161590508438611362565b806000526002600160208281526001600160a01b0360406000205416600052526040600020015483808260881c1691826113eb575b50506113d7575b600101611186565b926113e36001916158b8565b9390506113cf565b60801c1615905083386113c8565b92508092611181565b634e487b7160e01b600052601160045260246000fd5b600e549062093a808201809211611402576114376001924210156162eb565b611444600c54151561635c565b60ff191617603355600060315538611165565b5034610564576020366003190112610564576001600160a01b036114796154bf565b611481616190565b1661148d811515615c0b565b61149930821415615c7c565b6202a30042018042116114e15760207fea80d7bcdb5b960a75976c0e94d2d4b2077378cfea983c73b49501b8613da2249183855260308252806040862055604051908152a280f35b602483634e487b7160e01b81526011600452fd5b503461056457806003193601126105645760206001600160a01b0360145416604051908152f35b5034610564576020366003190112610564576001600160a01b0361153e6154bf565b611546616190565b16815260306020526000604082205580f35b50346105645760203660031901126105645760043567ffffffffffffffff808211611661573660238301121561166157828260040135928284116110565736602485830101116110565760175460ff8160a01c1680611674575b80611665575b6115c0578280f35b6001600160a01b0316803b156116615760248360648794604051988996879586937fe77767c900000000000000000000000000000000000000000000000000000000855233600486015260408286015282604486015201848401378181018301849052601f01601f191681010301925af161163d575b8281808280f35b811161164d576040523880611636565b602482634e487b7160e01b81526041600452fd5b8280fd5b5061166f33615ced565b6115b8565b506001600160a01b03811615156115b2565b5034610564578060031936011261056457602060405162093a808152f35b50346105645780600319360112610564576020600554604051908152f35b503461056457806003193601126105645760206040517fced6982f480260bdd8ad5cb18ff2854f0306d78d904ad6cc107e8f3a0f526c188152f35b50346105645760203660031901126105645760043560058110156110565760209060070154604051908152f35b50346105645760203660031901126105645760406020916001600160a01b036117516154bf565b168152603083522054604051908152f35b503461056457606036600319011261056457610fc761177f6154bf565b6107d961178a6154d5565b6107d36117956154eb565b9361179e616c21565b6001600160a01b038082166117b4811515615ab8565b818516916117c3831515615b29565b8716916117d1831515615b9a565b6001600160a01b03199182601454161760145581601554161760155560165416176016556166c3565b5034610564576020906020600319360112610564576118176154bf565b6040519261182484615593565b6103c080943690376001600160a01b038092168352600460205260408320604051908185905b601e82106118885750505061185e81615593565b6040519390845b601e8310611871578686f35b838060019287855116815201920192019190611865565b8254861681526001928301929190910190840161184a565b50346105645780600319360112610564576020600e54604051908152f35b5034610564576020366003190112610564576001600160a01b036040602092600435815260028452205416604051908152f35b50346105645780600319360112610564576040516040810181811067ffffffffffffffff82111761195a576110399250604052600581527f352e302e30000000000000000000000000000000000000000000000000000000602082015260405191829182615627565b602483634e487b7160e01b81526041600452fd5b503461056457602036600319011261056457600435600a81101561105657602090601c0154604051908152f35b5034610564578060031936011261056457602060ff602a54166040519015158152f35b503461056457806003193601126105645760206001600160a01b0360125416604051908152f35b50346105645780600319360112610564576020604051611f408152f35b5034610564576020366003190112610564576102c09060406001600160a01b039182611a2c6154bf565b168152600160205220908154916001600160801b039067ffffffffffffffff9063ffffffff93600182015490600283015460ff8260038601541691836004870154169360058701541694600a6009880154970154986040519b8181168d528c60208b8360801c169101528c60408d8360c01c1691015260e01c60608d0152811660808c015260801c60a08b015286811660c08b0152888160401c1660e08b0152888160601c166101008b0152818160801c1615156101208b015260881c1615156101408901526101608801526101808701526101a08601528381166101c0860152838160201c166101e0860152838160401c16610200860152838160601c1661022086015260801c6102408501528116610260840152818160401c1661028084015260601c166102a0820152f35b5034610564578060031936011261056457602060ff60175460a01c166040519015158152f35b50346105645760203660031901126105645760406020916001600160a01b03611ba76154bf565b168152602f83522054604051908152f35b50346105645780600319360112610564576020601054604051908152f35b50346105645760203660031901126105645760043560048110156110565760209060180154604051908152f35b5034610564578060031936011261056457602090604051908152f35b503461056457806003193601126105645760a06033546031549060ff603254916040519382821615158552602085015260081c1615156040830152606082015260646080820152f35b5034610564578060031936011261056457602060405160028152f35b503461056457806003193601126105645760206001600160a01b0360175416604051908152f35b503461056457604036600319011261056457611cc56154bf565b6005602435101561105657611cd86164ef565b611ce0616549565b3382526001602052611d0267ffffffffffffffff6002604085200154166163cd565b6005811015612674576127c5576024351561275c57336001600160a01b038216146126f2576005546125c3575b611d3a602435615a34565b60048110156125af57601801546012546040516323b872dd60e01b815233600482015230602482015260448101839052919291906020908290606490829088906001600160a01b03165af1801561258557611d9c918591612590575b506158df565b612710611dab60265484615863565b04806124ff575b50611dbc826165c6565b611dc542616644565b611dce42616c84565b611dd9602435616644565b90604051928360a081011067ffffffffffffffff60a0860111176124eb5760a0840160405287845287602085015287604085015287606085015287608085015260405194856102e081011067ffffffffffffffff6102e0880111176124d7579167ffffffffffffffff63ffffffff926001600160801b038296956102e08a016040521688521660208701528860408701521660608501528660808501528660a08501521660c08301528460e0830152846101008301528461012083015260016101408301526001600160a01b03831661016083015284610180830152846101a08301526101c082015260016101e0820152836102008201528361022082015260016102408201528361026082015283610280820152836102a0820152610bb86102c08201523384526001602052604084206001600160801b038251168154907fffffffffffffffff00000000000000000000000000000000000000000000000077ffffffffffffffff00000000000000000000000000000000602086015160801b16921617178155611f9063ffffffff604084015116829063ffffffff60c01b1963ffffffff60c01b83549260c01b169116179055565b60608281015182547fffffffff0000000000000000000000000000000000000000000000000000000060e092831b167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff90911617835560808085015160a08601516001600160801b039091166001600160801b03199190921b811691909117600185015560c0850151600285018054938701516101008801519490931667ffffffffffffffff9092169190911760409290921b63ffffffff60401b16919091179190921b63ffffffff60601b161790556101208201511515600282015461ffff60801b1970ff0000000000000000000000000000000071ff0000000000000000000000000000000000610140870151151560881b169360801b169116171760028201556001600160a01b03610160830151166001600160a01b0319600383015416176003820155600481016001600160a01b03610180840151166001600160a01b0319825416179055600581016001600160a01b036101a0840151166001600160a01b03198254161790556101c0820151855b6002811061248f57508590865b6001811061245357505060088201556101e082015161020083015161022084015161024085015161026086015160801b6001600160801b03191667ffffffff0000000060209490941b9390931663ffffffff9485161763ffffffff60401b60409390931b929092169190911763ffffffff60601b60609290921b919091161717600983015561223492916102c090600a019267ffffffffffffffff6102808201511667ffffffffffffffff1985541617845561220a836102a083015116859063ffffffff60401b82549160401b169063ffffffff60401b1916179055565b015182546fffffffff0000000000000000000000001916911660601b63ffffffff60601b16179055565b6005548352600260205260408320336001600160a01b031982541617905561225d6005546158b8565b60055561226c82600654615856565b6006556001600160a01b03811661238a575b6122888133616fe7565b8083915b601e831080612378575b15612304576001600160a01b039033865260046020526122dc816122bd8660408a20615670565b9091906001600160a01b038084549260031b9316831b921b1916179055565b16845260016020526122fe6001600160a01b03600360408720015416926158b8565b9161228c565b8482856123118133616cff565b6040519081524260208201526001600160a01b036024359216907f181c8a8de8fc65bb4353b7ba5f1a90382fc0e86449d5784b104eeb7ac1d1cadf60403392a460017f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f005580f35b506001600160a01b0381161515612296565b6001600160a01b03811683526003602052604083208054906801000000000000000082101561243f57816123c69160016123e494018155615501565b33906001600160a01b038084549260031b9316831b921b1916179055565b6001600160a01b0381168352600160205261243a6002604085200161241263ffffffff825460601c166158a3565b6fffffffff0000000000000000000000001963ffffffff60601b83549260601b169116179055565b61227e565b602485634e487b7160e01b81526041600452fd5b909160206124866001926001600160801b03865116908560041b60031b916001600160801b03809116831b921b19161790565b9301910161212c565b86875b600281106124aa57508382016006015560010161211f565b83519093916001916020916001600160801b03600788901b81811b199092169216901b1792019301612492565b602489634e487b7160e01b81526041600452fd5b602488634e487b7160e01b81526041600452fd5b60125460145460405163a9059cbb60e01b81526001600160a01b0391821660048201526024810193909352602091839160449183918991165af1801561258557612550918591612556575b50615a47565b38611db2565b612578915060203d60201161257e575b61257081836155e9565b8101906158c7565b3861254a565b503d612566565b6040513d86823e3d90fd5b6125a9915060203d60201161257e5761257081836155e9565b38611d96565b602483634e487b7160e01b81526032600452fd5b6001600160a01b03811615612688576001600160a01b038116825260016020526125fd67ffffffffffffffff6002604085200154166163cd565b600581101561267457611d2f57608460405162461bcd60e51b815260206004820152602660248201527f4f7270686943726f776446756e643a2053706f6e736f72206e6f74207265676960448201527f73746572656400000000000000000000000000000000000000000000000000006064820152fd5b602483634e487b7160e01b81526021600452fd5b608460405162461bcd60e51b815260206004820152602760248201527f4f7270686943726f776446756e643a20496e76616c69642073706f6e736f722060448201527f61646472657373000000000000000000000000000000000000000000000000006064820152fd5b608460405162461bcd60e51b815260206004820152602760248201527f4f7270686943726f776446756e643a2043616e6e6f742073706f6e736f72207960448201527f6f757273656c66000000000000000000000000000000000000000000000000006064820152fd5b608460405162461bcd60e51b8152602060048201526024808201527f4f7270686943726f776446756e643a20496e76616c6964207061636b6167652060448201527f74696572000000000000000000000000000000000000000000000000000000006064820152fd5b608460405162461bcd60e51b815260206004820152602760248201527f4f7270686943726f776446756e643a205573657220616c72656164792072656760448201527f69737465726564000000000000000000000000000000000000000000000000006064820152fd5b50346105645760203660031901126105645761284961554c565b6128516161ec565b60ff801960275416911515161760275580f35b5034610564578060031936011261056457602060405160648152f35b50346105645760403660031901126105645761289a6154bf565b6001600160a01b03908116825260046020526040822060243592601e84101561056457506020926128ca91615670565b9190546040519260031b1c168152f35b50346105645780600319360112610564576020604051610bb88152f35b50346105645760403660031901126105645760ff60406020926129186154d5565b6004358252600080516020617d7e83398151915285526001600160a01b038383209116825284522054166040519015158152f35b50346105645760208060031936011261105657600435906005821015611661576129746164ef565b3383526001815267ffffffffffffffff612996816002604087200154166163cd565b6005811015612d1c576129aa9015156157e5565b6129b2616549565b33845260018252604084209160028301916129cf818454166163cd565b936005851015612d085784861115612c9e578515612c5a576129f085615a34565b6004811015612c465760180154612a0687615a34565b6004811015612c325790612a1d9160180154615896565b6012546040516323b872dd60e01b81523360048201523060248201526044810183905291956001600160a01b0394909290918690829060649082908e908a165af18015612c2757612a74918b91612c1057506158df565b84612710612a8460265489615863565b0480612b90575b5050612b2e9350612a9b88616644565b1667ffffffffffffffff1982541617905580546001600160801b03196001600160801b03612ad3612ace88838616615856565b6165c6565b169116178155612ae242616c84565b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff7fffffffff0000000000000000000000000000000000000000000000000000000083549260e01b169116179055565b612b388233616cff565b60405191825242908201527f9053d58a53ce96060bd16880b15f4c04710f3bb04227c3055ea29f8a44e42df160403392a460017f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f005580f35b60125460145460405163a9059cbb60e01b81529088166001600160a01b0316600482015260248101929092529095869116818c816044810103925af1938415612c0557612b2e94612be7918b91612bee5750615a47565b8438612a8b565b6125789150873d891161257e5761257081836155e9565b6040513d8b823e3d90fd5b6125a99150873d891161257e5761257081836155e9565b6040513d8c823e3d90fd5b602489634e487b7160e01b81526032600452fd5b602488634e487b7160e01b81526032600452fd5b6064836040519062461bcd60e51b82526004820152601c60248201527f4f7270686943726f776446756e643a20496e76616c69642074696572000000006044820152fd5b6084836040519062461bcd60e51b82526004820152602f60248201527f4f7270686943726f776446756e643a2043616e206f6e6c79207570677261646560448201527f20746f20686967686572207469657200000000000000000000000000000000006064820152fd5b602487634e487b7160e01b81526021600452fd5b602485634e487b7160e01b81526021600452fd5b503461056457806003193601126105645760206001600160a01b037f9016d09d72d40fdae2fd8ceac6b6234c7706214fd39c1cd1e609a0528c1993005416604051908152f35b5034610564578060031936011261056457612d8f616134565b612d97616549565b7fcd5ed15c6e187e77e9aee88184c21f4f2182ab5827cb3b7e07fbedcd63f03300600160ff198254161790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586020604051338152a16040514281527f208173a32f19abb9d59872fae2b8fe5ab46c53c8134e838c84315d545030d03a60203392a280f35b50346105645780600319360112610564576020610e0361599b565b5034610564578060031936011261056457612e50616134565b612e58616549565b7fcd5ed15c6e187e77e9aee88184c21f4f2182ab5827cb3b7e07fbedcd63f03300600160ff198254161790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586020604051338152a180f35b50346105645780600319360112610564576020602e54604051908152f35b50346105645780600319360112610564576020600d54604051908152f35b50346105645780600319360112610564576020603154604051908152f35b5034610564576020366003190112610564577f8da4fbf13357847b1597440e6139d850c55f0e6d61a96eaf63ba839bc0b315886020612f4861554c565b612f50616c21565b15156017547fffffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffff60ff60a01b8360a01b16911617601755604051908152a180f35b503461056457806003193601126105645760175460405163883fb2c760e01b8152602081600481305afa908115613026578391612ff0575b6060838360ff604051926001600160a01b038116845260a01c16151560208301526040820152f35b90506020813d60201161301e575b8161300b602093836155e9565b8101031261166157606092505138612fc8565b3d9150612ffe565b6040513d85823e3d90fd5b503461056457602036600319011261056457604090816001600160a01b0391826130596154bf565b168152600160205220906005816004840154169201541682519182526020820152f35b50346105645780600319360112610564576020603254604051908152f35b5034610564578060031936011261056457602060ff602754166040519015158152f35b50346105645780600319360112610564576130d6616c21565b806001600160a01b037f9016d09d72d40fdae2fd8ceac6b6234c7706214fd39c1cd1e609a0528c1993008054906001600160a01b031982169055167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a380f35b50346105645780600319360112610564576020604051611b588152f35b50346105645780600319360112610564576020602b54604051908152f35b503461056457806003193601126105645761318c6160a1565b60335460ff8160081c161561352b575b5060325460648101908181116114e157600554808311613523575b83908492805b85811061348d575082159182158093613484575b61323d575b50505050508060325560055411156131eb5780f35b80600d5542600f5561ff0019603354166033558060325580807f67baec0bbc96a8d8e08f1be775c845db5fd270df283e494d8bf04c7f140d494a6060604051838152836020820152426040820152a380f35b8690879088905b8082106133ec575050600d5492600193841c92899581151590816133e4575b50613357575b50508015158061334e575b6132bf575b5050507f36aa6bc2b68bd4a240368040fea5171fdbc6b3383b7c9fb58678179551d67df26060603254604051908152866020820152426040820152a438808080806131d6565b6132c891615876565b6032545b86811015613279578088526002602090808252846001600160a01b0360408c20541692838c525261330b63ffffffff8260408d20015460401c1661646b565b600381101561333a5714613322575b5082016132cc565b828492956112c58261333394617234565b939061331a565b60248b634e487b7160e01b81526021600452fd5b50851515613274565b6133619084615876565b905b8881101561326957808a52896133a063ffffffff600260406020948286528a6001600160a01b038383205416968783525220015460401c1661646b565b60038110156133d05786146133b8575b508401613363565b828692976112c5826133c994617234565b95906133b0565b60248c634e487b7160e01b81526021600452fd5b905038613263565b9092838a5260028a61342563ffffffff8360406020948286526001600160a01b0382822054168152600180965220015460401c1661646b565b90600382101561347057810361344b5750506134426001916158b8565b935b0190613244565b9491941461345c575b600190613444565b916134686001916158b8565b929050613454565b60248d634e487b7160e01b81526021600452fd5b508415156131d1565b92838752600260208181526001600160a01b0360408a205416895260018091526134c563ffffffff8360408c20015460401c1661646b565b90600382101561350f5781036134ea5750506134e26001916158b8565b935b016131bd565b949194146134fb575b6001906134e4565b936135076001916158b8565b9490506134f3565b60248a634e487b7160e01b81526021600452fd5b9150816131b7565b600f546213c68081018091116114e1579061354b610100924210156162eb565b613558600d54151561635c565b61ff00191617603355806032553861319c565b5034610564576020366003190112610564576001600160a01b038061358e6154bf565b1682526001602052604082209081546001600160801b039067ffffffffffffffff9363ffffffff936001820154600283015494866135cd8988166163cd565b9360036135de838a60401c1661646b565b9601541695604051998382168b528160801c1660208b015260c01c1660408901528116606088015260801c60808701526005811015612d085760a0860152600381101561365e57610160955060c085015260ff8260801c16151560e085015260ff8260881c16151561010085015261012084015260601c16610140820152f35b602486634e487b7160e01b81526021600452fd5b50346105645780600319360112610564576020604051600a8152f35b5034610564576020908160031936011261056457600435916136ae6160a1565b6136bb606484111561627b565b6033549260ff9384811615613948575b506136d96031549182615856565b90600554808311613940575b8490825b8481106138df57508161375f575b50505082935080603155600554111561370d5750f35b817fd9046852f944e541fee861707f92ef4bbc6fe687925eaacc452ea592e8185e8b819282600c5542600e556137446010546158b8565b60105560ff196033541660335582603155604051428152a480f35b8590865b81811061387e57505080156138305761377e90600c54615876565b85925b8481106137c7575050849550603154917fce74be02aea5db55e00b80ef7d43dae297ff65326a20d95a572c46e255d9fd51604080518681524288820152a43880806136f7565b80875260028087526001600160a01b03604089205416908189526001885260408920015489808260881c169182613822575b5050613809575b50600101613781565b82600192956112c58261381b94617399565b9390613800565b60801c1615905089386137f9565b6084856040519062461bcd60e51b82526004820152602160248201527f4f7270686943726f776446756e643a204e6f20656c696769626c6520757365726044820152607360f81b6064820152fd5b80885260028088526001600160a01b0360408a20541689526001885260408920015489808260881c1691826138d1575b50506138bd575b600101613763565b916138c96001916158b8565b9290506138b5565b60801c1615905089386138ae565b80875260028087526001600160a01b0360408920541688526001875260408820015488808260881c169182613932575b505061391e575b6001016136e9565b9161392a6001916158b8565b929050613916565b60801c16159050883861390f565b9150816136e5565b600e5462093a80810180911161398657906139676001924210156162eb565b613974600c54151561635c565b60ff19161760335582603155386136cb565b602485634e487b7160e01b81526011600452fd5b50346105645780600319360112610564576020600654604051908152f35b5034610564578060031936011261056457602060ff7fcd5ed15c6e187e77e9aee88184c21f4f2182ab5827cb3b7e07fbedcd63f0330054166040519015158152f35b503461056457604036600319011261056457613a146154bf565b602435801515809103611661577f8da4fbf13357847b1597440e6139d850c55f0e6d61a96eaf63ba839bc0b3158891602091613a4e616c21565b6001600160a01b03809216613a6481151561592a565b6017549260ff60a01b8360a01b16827fffffffffffffffffffffff0000000000000000000000000000000000000000008616171760175560405193167f4eb1d64d12725f061690deb717f96d537369d6a35541917f3f8ccbb71ceabddf8780a38152a180f35b50346105645780600319360112610564576020604051610fa08152f35b503461056457806003193601126105645760206040517f6077685936c8169d09204a1d97db12e41713588c38e1d29a61867d3dcee98aff8152f35b5034610564578060031936011261056457611039604051613b4281615577565b604481527f4f727068692043726f776446756e6420506c6174666f726d2076322e302e302060208201527f2d20436f6d706c657465205768697465706170657220496d706c656d656e746160408201527f74696f6e00000000000000000000000000000000000000000000000000000000606082015260405191829182615627565b503461056457806003193601126105645760209054604051908152f35b50346105645760208060031936011261105657600435613bff616134565b8015613d99576001600160a01b039081601254166040517f70a082310000000000000000000000000000000000000000000000000000000081523060048201528481602481855afa8015613d8e5783918791613d59575b5010613cef5760155460405163a9059cbb60e01b81529084166001600160a01b0316600482015260248101839052929190849084908188816044810103925af1918215613ce457613cd16040937f56da9a5ae0bcf6e7c3fdd78a10550e7d0458de1c39bfb7f6e96a3e92dd344a68958891612c1057506158df565b601554169382519182524290820152a280f35b6040513d87823e3d90fd5b6084846040519062461bcd60e51b82526004820152602d60248201527f4f7270686943726f776446756e643a20496e73756666696369656e7420636f6e60448201527f74726163742062616c616e6365000000000000000000000000000000000000006064820152fd5b809250868092503d8311613d87575b613d7281836155e9565b81010312613d835782905138613c56565b8580fd5b503d613d68565b6040513d88823e3d90fd5b6064826040519062461bcd60e51b82526004820152601e60248201527f4f7270686943726f776446756e643a20496e76616c696420616d6f756e7400006044820152fd5b5034610564576020366003190112610564576001600160a01b03613dff6154bf565b613e076161ec565b166001600160a01b0319601354161760135580f35b50346105645780600319360112610564576001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000163003613e875760206040517f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc8152f35b60046040517fe07c8dba000000000000000000000000000000000000000000000000000000008152fd5b5034610564578060031936011261056457613eca616134565b613ed2616549565b7fcd5ed15c6e187e77e9aee88184c21f4f2182ab5827cb3b7e07fbedcd63f03300600160ff198254161790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586020604051338152a16040514281527f9506e519f3e4ce17dda1136d3ba3d3465dc873c49a6191e0fd209f33959a00cd60203392a280f35b50604036600319011261056457613f6c6154bf565b602491823567ffffffffffffffff81116110565736602382011215611056578060040135613f998161560b565b93613fa760405195866155e9565b8185526020918286019336888383010111613d8357818692898693018737870101526001600160a01b03807f0000000000000000000000000000000000000000000000000000000000000000168030149081156142c7575b50613e875761400c616190565b81169461401a861515615c0b565b61402630871415615c7c565b858552603083526040852054801561425f5742106141f6576040517f52d1902d00000000000000000000000000000000000000000000000000000000815283816004818a5afa8691816141c3575b5061409057878760405190634c9c8ce360e01b82526004820152fd5b8690887f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc918281036141955750843b1561417f575080546001600160a01b031916821790556040518692917fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b8480a28151156141485750610fc79482915190845af4903d1561413f573d6141238161560b565b9061413160405192836155e9565b81528581943d92013e617cea565b60609250617cea565b94505050505034614157575080f35b807fb398979f0000000000000000000000000000000000000000000000000000000060049252fd5b8260405190634c9c8ce360e01b82526004820152fd5b604051907faa1d49a40000000000000000000000000000000000000000000000000000000082526004820152fd5b9091508481813d83116141ef575b6141db81836155e9565b810103126141eb57519038614074565b8680fd5b503d6141d1565b608483602c896040519262461bcd60e51b845260048401528201527f4f7270686943726f776446756e643a20557067726164652074696d656c6f636b60448201527f206e6f74206578706972656400000000000000000000000000000000000000006064820152fd5b608484896040519162461bcd60e51b83526004830152808201527f4f7270686943726f776446756e643a2055706772616465206e6f742070726f7060448201527f6f736564000000000000000000000000000000000000000000000000000000006064820152fd5b9050817f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc5416141538613fff565b50346105645780600319360112610564576020600f54604051908152f35b50346105645780600319360112610564576020604051611d4c8152f35b5034610564578060031936011261056457614349616c21565b7fcd5ed15c6e187e77e9aee88184c21f4f2182ab5827cb3b7e07fbedcd63f03300805460ff8116156143d45760ff191690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa6020604051338152a16040514281527fdb5c0bc39850eb0ddb99fae67eecd7ee594120d92d1c0db6c3252252a4fc335660203392a280f35b60046040517f8dfc202b000000000000000000000000000000000000000000000000000000008152fd5b503461056457806003193601126105645760206040516202a3008152f35b503461056457602036600319011261056457610e0363ffffffff600260406020946001600160a01b0361444d6154bf565b1681526001865220015460601c1661659e565b50346105645760203660031901126105645761447a6154bf565b614482616c21565b6001600160a01b038091169061449982151561592a565b601754826001600160a01b0319821617601755167f4eb1d64d12725f061690deb717f96d537369d6a35541917f3f8ccbb71ceabddf8380a380f35b50346105645780600319360112610564576144ed616c21565b7fcd5ed15c6e187e77e9aee88184c21f4f2182ab5827cb3b7e07fbedcd63f03300805460ff8116156143d45760ff191690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa6020604051338152a180f35b50346105645760603660031901126105645761456661554c565b61456e616134565b60ff19602a541660ff8215151617602a55602435602b55604435602e558061459f575b6145985780f35b42602d5580f35b50602d5415614591565b5034610564576040366003190112610564576145c36154d5565b336001600160a01b038216036145df57610fc790600435616b9d565b60046040517f6697b232000000000000000000000000000000000000000000000000000000008152fd5b503461056457604036600319011261056457610fc76004356146296154d5565b90808452600080516020617d7e83398151915260205261464f6001604086200154616248565b616b15565b50346105645760208060031936011261105657600435906146736164ef565b33835260019182825267ffffffffffffffff91614698836002604088200154166163cd565b600581101561365e576146ac9015156157e5565b6146b4616549565b338552602f81526040852054848101809111614aad57431115614ac157338552602f815243604086205560ff602a5416614a13575b81156149a957338552838152818460408720015460801c1061494057338552838152604085206147dd612710916147be63ffffffff8461473a61473483600287015460601c1661659e565b89615863565b049761477d6147498a8a615896565b9861475e612ace8d880192835460801c615896565b6001600160801b036001600160801b031983549260801b169116179055565b6147956009850161475e612ace8c835460801c615856565b600a6147a042616644565b9401931667ffffffffffffffff198454161780845560401c166158a3565b63ffffffff60401b82549160401b169063ffffffff60401b1916179055565b60ff602a541661492d575b60125460405163a9059cbb60e01b815233600482015260248101869052908390829060449082908b906001600160a01b03165af180156149225761483291889161490b57506158df565b8215908115614894575b505060405191825242908201527fbe1e8e357f01b865f7bbd4055ed6fbaf1e3029820a3051bc7157277b813022b960403392a37f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f005580f35b610fa09182850292858404148117156148f757610bb890818602918683041417156148f757816148ed93926148cc92049204336174c1565b6148d681336177bf565b6148e281600c54615856565b600c55600b54615856565b600b55388061483c565b602488634e487b7160e01b81526011600452fd5b6125a99150843d861161257e5761257081836155e9565b6040513d89823e3d90fd5b614938602c546158b8565b602c556147e8565b6084906040519062461bcd60e51b825260048201526024808201527f4f7270686943726f776446756e643a20496e73756666696369656e742062616c60448201527f616e6365000000000000000000000000000000000000000000000000000000006064820152fd5b6084906040519062461bcd60e51b82526004820152602d60248201527f4f7270686943726f776446756e643a20416d6f756e74206d757374206265206760448201527f726561746572207468616e2030000000000000000000000000000000000000006064820152fd5b602d54620151808101809111614aad57421015614aa0575b602c54602b54116146e9576084906040519062461bcd60e51b82526004820152602f60248201527f4f7270686943726f776446756e643a204461696c79207769746864726177616c60448201527f206c696d697420657863656564656400000000000000000000000000000000006064820152fd5b84602c5542602d55614a2b565b602486634e487b7160e01b81526011600452fd5b6084906040519062461bcd60e51b82526004820152602560248201527f4f7270686943726f776446756e643a204d45562070726f74656374696f6e206160448201527f63746976650000000000000000000000000000000000000000000000000000006064820152fd5b50346105645780600319360112610564576020602d54604051908152f35b5034610564576020366003190112610564576001600160a01b03614b6b6154bf565b168082526001602052614b8e67ffffffffffffffff6002604085200154166163cd565b600581101561267457614ba29015156157e5565b808252600160205260408220600281019182549263ffffffff92614bca848660401c1661646b565b936003851015612d0857841580614cbc575b80614cac575b15614c33575050600193506801000000000000000063ffffffff60401b198254161790557feaeace1490dbd13daced7dc23bcd1fde3a9846f0914fdffce8c4f6a2318ec73a6020604051428152a480f35b600185149182614c99575b5050614c4c575b5050505080f35b6802000000000000000060029463ffffffff60401b19161790557feaeace1490dbd13daced7dc23bcd1fde3a9846f0914fdffce8c4f6a2318ec73a6020604051428152a438808080614c45565b6101f492505460c01c1610153880614c3e565b50600a818760601c161015614be2565b5060fa81835460c01c161015614bdc565b503461056457806003193601126105645760206001600160a01b0360135416604051908152f35b503461056457602036600319011261056457600160406020926004358152600080516020617d7e8339815191528452200154604051908152f35b5034610564578060031936011261056457602060405160048152f35b503461056457806003193601126105645760206040517fbf233dd2aafeb4d50879c4aa5c81e96d92f6e6945c906a58f9f2d1c1631b4b268152f35b5034610564578060031936011261056457602060ff60335460081c166040519015158152f35b5034610564576020366003190112610564576001600160a01b03614dcd6154bf565b1681526001602052614def67ffffffffffffffff6002604084200154166163cd565b906005821015614e06576020826040519015158152f35b80634e487b7160e01b602492526021600452fd5b50346105645780600319360112610564576020601154604051908152f35b50346105645780600319360112610564576020602854604051908152f35b50346105645760208060031936011261105657906001600160a01b03614e7a6154bf565b60a0604051614e888161555b565b369037168152600180602052600660408320016040519384845b600585820110614eed57506001600160801b03809354169052614ec48561555b565b6040519394845b60058710614ed85760a086f35b81518416815295840195908201908201614ecb565b83546001600160801b038116835260801c8383015292840192604090910190600201614ea2565b5034610564578060031936011261056457602060405160fa8152f35b503461056457602090816003193601126105645760043591614f506160a1565b614f5d606484111561627b565b60335460ff8160081c16156152b2575b50614f7b6032549384615856565b6005548082116152aa575b838491865b84811061522a575081159081158092615221575b61500c575b50505050829350806032556005541115614fbb5750f35b7f67baec0bbc96a8d8e08f1be775c845db5fd270df283e494d8bf04c7f140d494a6060839283600d5542600f5561ff001960335416603355836032558360405191818352820152426040820152a380f35b86879188905b80821061519d575050600d54986001998a1c9189948115159081615195575b50615112575b505081151580615109575b61508d575b50508596507f36aa6bc2b68bd4a240368040fea5171fdbc6b3383b7c9fb58678179551d67df260606032546040519081528688820152426040820152a438808080614fa4565b9061509791615876565b6032545b858110156150475780885260028088526001600160a01b0360408a20541690818a528a89526150d863ffffffff8260408d20015460401c1661646b565b600381101561333a578b939291146150f2575b500161509b565b61510291946112c5858093617234565b92386150eb565b50841515615042565b61511c9083615876565b905b888b8b8a841061513057505050615037565b615163916040828663ffffffff94526002928387526001600160a01b038383205416968783525220015460401c1661646b565b60038110156133d057908c8093921461517e575b500161511e565b61518e91966112c5858093617234565b9438615177565b905038615031565b9091828a526040896151d663ffffffff8d60029485918286526001600160a01b0382822054168152600180965220015460401c1661646b565b9060038210156134705781036151fc5750506151f36001916158b8565b925b0190615012565b9391931461520d575b6001906151f5565b926152196001916158b8565b939050615205565b50831515614f9f565b9182875260028087526001600160a01b036040892054168852600180885261526063ffffffff8360408c20015460401c1661646b565b90600382101561350f57810361528557505061527d6001916158b8565b925b01614f8b565b93919314615296575b60019061527f565b926152a26001916158b8565b93905061528e565b905080614f86565b600f546213c68081018091116152f257906152d2610100924210156162eb565b6152df600d54151561635c565b61ff001916176033558160325538614f6d565b602484634e487b7160e01b81526011600452fd5b5034610564578060031936011261056457602060405160018152f35b5034610564578060031936011261056457602060ff603354166040519015158152f35b503461056457806003193601126105645760206040516213c6808152f35b50346105645760403660031901126105645761537d6154bf565b602435916001600160a01b03809216815260036020526040812090815484101561056457506020926153ae91615501565b90549060031b1c16604051908152f35b503461056457806003193601126105645761103961102d615680565b905034611056576020366003190112611056576004357fffffffff00000000000000000000000000000000000000000000000000000000811680910361166157602092507f7965db0b000000000000000000000000000000000000000000000000000000008114908115615450575b5015158152f35b7f01ffc9a70000000000000000000000000000000000000000000000000000000091501438615449565b602090602060408183019282815285518094520193019160005b8281106154a2575050505090565b83516001600160a01b031685529381019392810192600101615494565b600435906001600160a01b0382168203610d5d57565b602435906001600160a01b0382168203610d5d57565b604435906001600160a01b0382168203610d5d57565b80548210156155195760005260206000200190600090565b634e487b7160e01b600052603260045260246000fd5b34610d5d576000366003190112610d5d5760206040516103e88152f35b600435908115158203610d5d57565b60a0810190811067ffffffffffffffff821117610c4b57604052565b6080810190811067ffffffffffffffff821117610c4b57604052565b6103c0810190811067ffffffffffffffff821117610c4b57604052565b610140810190811067ffffffffffffffff821117610c4b57604052565b6020810190811067ffffffffffffffff821117610c4b57604052565b90601f8019910116810190811067ffffffffffffffff821117610c4b57604052565b67ffffffffffffffff8111610c4b57601f01601f191660200190565b6020808252825181830181905290939260005b82811061565c57505060409293506000838284010152601f8019910116010190565b81810186015184820160400152850161563a565b601e821015615519570190600090565b60175460ff8160a01c161580156157d4575b6157bb576001600160a01b039081604051917f054f7623000000000000000000000000000000000000000000000000000000008352826004816000968794165afa91829184936156ff575b50506156fa5750604051906156f1826155cd565b80825236813790565b905090565b909192503d8085843e61571281846155e9565b82016020918284830312613d8357835167ffffffffffffffff948582116157a357019082601f830112156141eb5781519485116157a7578460051b916040519561575e868501886155e9565b865284808701938201019384116157a3578401915b8383106157875750505050509038806156dd565b8251828116810361579f578152918401918401615773565b8880fd5b8780fd5b602487634e487b7160e01b81526041600452fd5b506040516157c8816155cd565b60008152600036813790565b506001600160a01b03811615615692565b156157ec57565b608460405162461bcd60e51b815260206004820152602360248201527f4f7270686943726f776446756e643a2055736572206e6f74207265676973746560448201527f72656400000000000000000000000000000000000000000000000000000000006064820152fd5b9190820180921161140257565b8181029291811591840414171561140257565b8115615880570490565b634e487b7160e01b600052601260045260246000fd5b9190820391821161140257565b63ffffffff8091169081146114025760010190565b60001981146114025760010190565b90816020910312610d5d57518015158103610d5d5790565b156158e657565b606460405162461bcd60e51b815260206004820152601f60248201527f4f7270686943726f776446756e643a205472616e73666572206661696c6564006044820152fd5b1561593157565b608460405162461bcd60e51b815260206004820152602d60248201527f4f7270686943726f776446756e643a20496e76616c69642061646d696e206d6160448201527f6e616765722061646472657373000000000000000000000000000000000000006064820152fd5b60175460ff8160a01c16158015615a23575b615a1d5760206001600160a01b039160046040518094819363883fb2c760e01b8352165afa600091816159e9575b506159e65750600090565b90565b9091506020813d602011615a15575b81615a05602093836155e9565b81010312610d5d575190386159db565b3d91506159f8565b50600090565b506001600160a01b038116156159ad565b60ff6000199116019060ff821161140257565b15615a4e57565b608460405162461bcd60e51b815260206004820152602360248201527f4f7270686943726f776446756e643a20466565207472616e736665722066616960448201527f6c656400000000000000000000000000000000000000000000000000000000006064820152fd5b15615abf57565b608460405162461bcd60e51b815260206004820152602860248201527f4f7270686943726f776446756e643a20496e76616c696420747265617375727960448201527f20616464726573730000000000000000000000000000000000000000000000006064820152fd5b15615b3057565b608460405162461bcd60e51b815260206004820152602960248201527f4f7270686943726f776446756e643a20496e76616c696420656d657267656e6360448201527f79206164647265737300000000000000000000000000000000000000000000006064820152fd5b15615ba157565b608460405162461bcd60e51b815260206004820152602c60248201527f4f7270686943726f776446756e643a20496e76616c696420706f6f6c206d616e60448201527f61676572206164647265737300000000000000000000000000000000000000006064820152fd5b15615c1257565b608460405162461bcd60e51b815260206004820152602660248201527f4f7270686943726f776446756e643a20496e76616c696420696d706c656d656e60448201527f746174696f6e00000000000000000000000000000000000000000000000000006064820152fd5b15615c8357565b608460405162461bcd60e51b815260206004820152602360248201527f4f7270686943726f776446756e643a2053616d6520696d706c656d656e74617460448201527f696f6e00000000000000000000000000000000000000000000000000000000006064820152fd5b6017549060ff8260a01c16158015615d82575b615d7b5760209060246001600160a01b03918260405195869485937f17f6c656000000000000000000000000000000000000000000000000000000008552166004840152165afa60009181615d5a57506159e65750600090565b615d7491925060203d60201161257e5761257081836155e9565b90386159db565b5050600090565b506001600160a01b03821615615d00565b60ff60275416158015615ff0575b615fe4576001600160a01b0380601354169060125416604091828051938480937feeb9ef620000000000000000000000000000000000000000000000000000000082526004958683015260249485915afa806000958692615fad575b50615e13575050505050670de0b6b3a764000090565b615e1d9042615896565b60285410615f6b578315615f2957670de0b6b3a7640000600081861115615ef25750670de0b6b3a763ffff198501858111615ede5761271090818102918183041490151715615ede57045b60295410615e765750505090565b608492916020602892519362461bcd60e51b85528401528201527f4f7270686943726f776446756e643a20507269636520646576696174696f6e2060448201527f746f6f20686967680000000000000000000000000000000000000000000000006064820152fd5b83601186634e487b7160e01b600052526000fd5b85820390828211615f1757612710808302928304148784141715615f17575004615e68565b80601187634e487b7160e01b88945252fd5b606492916020601d92519362461bcd60e51b85528401528201527f4f7270686943726f776446756e643a20496e76616c69642070726963650000006044820152fd5b606492916020601d92519362461bcd60e51b85528401528201527f4f7270686943726f776446756e643a20507269636520746f6f206f6c640000006044820152fd5b959091508286813d8311615fdd575b615fc681836155e9565b810103126105645750602085519501519038615dfd565b503d615fbc565b670de0b6b3a764000090565b506001600160a01b036013541615615da1565b6001600160a01b03809116908115616070577f9016d09d72d40fdae2fd8ceac6b6234c7706214fd39c1cd1e609a0528c199300805490836001600160a01b03198316179055167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0600080a3565b60246040517f1e4fbdf700000000000000000000000000000000000000000000000000000000815260006004820152fd5b3360009081527f96de563c86f4bd442ebdfae8dc16d0931d1f530af4958de6f27ed10cd52481a460205260409020547f6077685936c8169d09204a1d97db12e41713588c38e1d29a61867d3dcee98aff9060ff16156160fd5750565b604490604051907fe2517d3f0000000000000000000000000000000000000000000000000000000082523360048301526024820152fd5b3360009081527f762c7c328dd70a077c65c77b60e4c38eed3d2f6aa056d4d0fa114aeff8234b5660205260409020547fbf233dd2aafeb4d50879c4aa5c81e96d92f6e6945c906a58f9f2d1c1631b4b269060ff16156160fd5750565b3360009081527fab71e3f32666744d246edff3f96e4bdafee2e9867098cdd118a979a7464786a860205260409020547f189ab7a9244df0848122154315af71fe140f3db0fe014031783b0946b8c9d2e39060ff16156160fd5750565b3360009081527f6a07288dad4cb198070ae9ab0d91c908f3652738923841b35a5b72d3571a1cec60205260409020547fced6982f480260bdd8ad5cb18ff2854f0306d78d904ad6cc107e8f3a0f526c189060ff16156160fd5750565b80600052600080516020617d7e83398151915260205260406000203360005260205260ff60406000205416156160fd5750565b1561628257565b608460405162461bcd60e51b8152602060048201526024808201527f4f7270686943726f776446756e643a2042617463682073697a6520746f6f206c60448201527f61726765000000000000000000000000000000000000000000000000000000006064820152fd5b156162f257565b608460405162461bcd60e51b815260206004820152602a60248201527f4f7270686943726f776446756e643a20546f6f206561726c7920666f7220646960448201527f73747269627574696f6e000000000000000000000000000000000000000000006064820152fd5b1561636357565b608460405162461bcd60e51b815260206004820152602660248201527f4f7270686943726f776446756e643a204e6f2066756e647320746f206469737460448201527f72696275746500000000000000000000000000000000000000000000000000006064820152fd5b67ffffffffffffffff16600481116164015760058110156163eb5790565b634e487b7160e01b600052602160045260246000fd5b608460405162461bcd60e51b815260206004820152602a60248201527f4f7270686943726f776446756e643a20496e76616c6964207061636b6167652060448201527f746965722076616c7565000000000000000000000000000000000000000000006064820152fd5b63ffffffff16600281116164855760038110156163eb5790565b608460405162461bcd60e51b815260206004820152602960248201527f4f7270686943726f776446756e643a20496e76616c6964206c6561646572207260448201527f616e6b2076616c756500000000000000000000000000000000000000000000006064820152fd5b7f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00600281541461651f5760029055565b60046040517f3ee5aeb5000000000000000000000000000000000000000000000000000000008152fd5b60ff7fcd5ed15c6e187e77e9aee88184c21f4f2182ab5827cb3b7e07fbedcd63f03300541661657457565b60046040517fd93c0665000000000000000000000000000000000000000000000000000000008152fd5b63ffffffff16601481106165b35750611f4090565b6005116165c057611d4c90565b611b5890565b6001600160801b03908181116165da571690565b608460405162461bcd60e51b815260206004820152602d60248201527f4f7270686943726f776446756e643a2056616c7565206578636565647320756960448201527f6e74313238206d6178696d756d000000000000000000000000000000000000006064820152fd5b67ffffffffffffffff90818111616659571690565b608460405162461bcd60e51b815260206004820152602c60248201527f4f7270686943726f776446756e643a2056616c7565206578636565647320756960448201527f6e743634206d6178696d756d00000000000000000000000000000000000000006064820152fd5b6001600160a01b031660008181527f1069ffe2b90bfd470f40f3bf820141bb4d4b475d03084db5dcfb8152047badf760205260408120549091907fe1dcbdb91df27212a29bc27177c840cf2f819ecf2187432e1fac86c2dd5dfca990600080516020617d7e8339815191529060ff1661677f578184526020526040832082845260205260408320600160ff198254161790557f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d339380a4600190565b50505090565b6001600160a01b031660008181527f762c7c328dd70a077c65c77b60e4c38eed3d2f6aa056d4d0fa114aeff8234b5660205260408120549091907fbf233dd2aafeb4d50879c4aa5c81e96d92f6e6945c906a58f9f2d1c1631b4b2690600080516020617d7e8339815191529060ff1661677f578184526020526040832082845260205260408320600160ff198254161790557f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d339380a4600190565b6001600160a01b031660008181527f96de563c86f4bd442ebdfae8dc16d0931d1f530af4958de6f27ed10cd52481a460205260408120549091907f6077685936c8169d09204a1d97db12e41713588c38e1d29a61867d3dcee98aff90600080516020617d7e8339815191529060ff1661677f578184526020526040832082845260205260408320600160ff198254161790557f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d339380a4600190565b6001600160a01b031660008181527fb7db2dd08fcb62d0c9e08c51941cae53c267786a0b75803fb7960902fc8ef97d6020526040812054909190600080516020617d7e8339815191529060ff16616998578280526020526040822081835260205260408220600160ff1982541617905533917f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d8180a4600190565b505090565b6001600160a01b031660008181527fab71e3f32666744d246edff3f96e4bdafee2e9867098cdd118a979a7464786a860205260408120549091907f189ab7a9244df0848122154315af71fe140f3db0fe014031783b0946b8c9d2e390600080516020617d7e8339815191529060ff1661677f578184526020526040832082845260205260408320600160ff198254161790557f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d339380a4600190565b6001600160a01b031660008181527f6a07288dad4cb198070ae9ab0d91c908f3652738923841b35a5b72d3571a1cec60205260408120549091907fced6982f480260bdd8ad5cb18ff2854f0306d78d904ad6cc107e8f3a0f526c1890600080516020617d7e8339815191529060ff1661677f578184526020526040832082845260205260408320600160ff198254161790557f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d339380a4600190565b90600091808352600080516020617d7e833981519152806020526001600160a01b036040852093169283855260205260ff6040852054161560001461677f578184526020526040832082845260205260408320600160ff198254161790557f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d339380a4600190565b90600091808352600080516020617d7e833981519152806020526001600160a01b036040852093169283855260205260ff60408520541660001461677f57818452602052604083208284526020526040832060ff1981541690557ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b339380a4600190565b6001600160a01b037f9016d09d72d40fdae2fd8ceac6b6234c7706214fd39c1cd1e609a0528c19930054163303616c5457565b60246040517f118cdaa7000000000000000000000000000000000000000000000000000000008152336004820152fd5b63ffffffff90818111616c95571690565b608460405162461bcd60e51b815260206004820152602c60248201527f4f7270686943726f776446756e643a2056616c7565206578636565647320756960448201527f6e743332206d6178696d756d00000000000000000000000000000000000000006064820152fd5b9190610fa090818102918115908284041481171561140257612710809304946001600160a01b039586821660009781895260016020526040906003828b200154169081151580616fd0575b15616fb957818a526001602052808a2080546001600160801b037003fffffffffffffffffffffffffffffffc8183169260021b169180830460041490151715616fa557828492867f85554fc59c8e021028889acfd6315c85a18677bd1539e11d75ad89e790d052e696616e4294600160a098018c815483811687616dce8483615856565b1115616f595750505090817fbac0ee9e19370829f29a023df4d915861af1fa0e0e3d2a5abc4df8990100c09493925490616e0a83831688615896565b80616f06575b50505060028601600160801b61ffff60801b198254161790558554168151908152426020820152a35b612ae242616c84565b8051908c825260606020830152601260608301527f53706f6e736f7220436f6d6d697373696f6e000000000000000000000000000060808301524290820152a45b6103e88084029084820414831715616ef25790616eb085616ec7930482616eab8280956174c1565b6177bf565b616ebc81600d54615856565b600d55600a54615856565b600a55610bb88083029283041417156152f257616eed929350046148e281600c54615856565b600b55565b602487634e487b7160e01b81526011600452fd5b612ace61475e91616f519460068c0180549088616f28612ace86838616615856565b166001600160801b031980931617905587616f428d6165c6565b1691161780855560801c615856565b388080616e10565b9091929550616fa0965061475e9450612ace93616f42612ace8560068c019485549585616f8b612ace85838b16615856565b166001600160801b0319809816179055615856565b616e39565b60248d634e487b7160e01b81526011600452fd5b505050616fc890600754615856565b600755616e83565b50818a5260ff6002828c20015460801c1615616d4a565b6001600160a01b03918281161561722f578261700282617b5f565b169060009180835260018092602092828452604096878720896004820154161560001461716457508187528385527f9cff9c598ba9f376e64accb2899a4de8bd623a87bd57a251a8a2f3ce6f545fcf60a060098a8a208c60048201951694856001600160a01b0319825416179055016170a963ffffffff916170888382548c1c166158a3565b67ffffffff0000000082549160201b169067ffffffff000000001916179055565b838a5286885260098b8b200154168a519060608252600460608301527f6c65667400000000000000000000000000000000000000000000000000000000608083015288820152428b820152a35b905b617105575b505050505050565b8516801561715f5780845282825261714b85852061712c63ffffffff825460c01c166158a3565b63ffffffff60c01b1963ffffffff60c01b83549260c01b169116179055565b8352818152838320600301548516826170f8565b6170fd565b906005820190898b83549281841615617184575b505050505050506170f6565b6001600160a01b0319957f9cff9c598ba9f376e64accb2899a4de8bd623a87bd57a251a8a2f3ce6f545fcf9560a0956171d7946009941698899116179055016147be63ffffffff80948354901c166158a3565b838a5286885260098b8b200154168a519060608252600560608301527f7269676874000000000000000000000000000000000000000000000000000000608083015288820152428b820152a338808080898b82617178565b505050565b6001600160a01b03168060005260016020526040600020908154906001600160801b037003fffffffffffffffffffffffffffffffc8184169360021b1692808404600414901517156114025761730c9460018501908154838116866172998483615856565b1115617350575050507fbac0ee9e19370829f29a023df4d915861af1fa0e0e3d2a5abc4df8990100c094918160409254906172d683831688615896565b8061730e5750505060028601600160801b61ffff60801b198254161790558554168151908152426020820152a3612ae242616c84565b565b612ace61475e91616f519460078c01805490617330612ace858460801c615856565b91896001600160801b0319809460801b16911617905587616f428d6165c6565b616fa09650612ace93955061475e94616f42612ace8560078c019485549561737e612ace848960801c615856565b96866001600160801b0319809960801b169116179055615856565b6001600160a01b03168060005260016020526040600020908154906001600160801b037003fffffffffffffffffffffffffffffffc8184169360021b1692808404600414901517156114025761730c9460018501908154838116866173fe8483615856565b1115617493575050507fbac0ee9e19370829f29a023df4d915861af1fa0e0e3d2a5abc4df8990100c0949181604092549061743b83831688615896565b806174715750505060028601600160801b61ffff60801b198254161790558554168151908152426020820152a3612ae242616c84565b612ace61475e91616f519460088c0180549088616f28612ace86838616615856565b616fa09650612ace93955061475e94616f42612ace8560088c019485549585616f8b612ace85838b16615856565b6001600160a01b038091169060008281526001926020918483526003926040928686600386862001541684915b61750d575b50505050505050505061750890600854615856565b600855565b600a82109081806177b4575b156177ae5788168086528985528686206002908101548b96959493608091821c60ff1615617563575b505050855283835261755b8888888820015416916158b8565b9192936174ee565b90919293949596501561779a576127106175828d86601c015490615863565b04918388528b8752888820908154906001600160801b03907003fffffffffffffffffffffffffffffffc82841693821b169260049080850482149015171561778757508e7f4c6576656c20426f6e75730000000000000000000000000000000000000000008796600b8f9d8e859f829f9e9d9c9a8f9b8e9b8c6176b4947f85554fc59c8e021028889acfd6315c85a18677bd1539e11d75ad89e790d052e69d60a09d8d8701878d825498858a16998961763b838d615856565b111561772d575050879850829185917fbac0ee9e19370829f29a023df4d915861af1fa0e0e3d2a5abc4df8990100c094989994549061767c84831687615896565b91826176d4575b5050509250505001600160801b61ffff60801b1982541617905585541681519081524289820152a3612ae242616c84565b519460609182918752860152840152820152428d820152a4388080617542565b6177219661475e956177136006612ace9701928354936176f9612ace89878a1c615856565b94846001600160801b031980978a1b1691161790556165c6565b16911617908186551c615856565b853883898f8084617683565b945094916177799193985061475e9750612ace965085616fa09a6006612ace9301805486617760612ace86848c1c615856565b986001600160801b0319998a911b169116179055615856565b169116178085558b1c615856565b8b6011602492634e487b7160e01b835252fd5b602487634e487b7160e01b81526032600452fd5b506174f3565b508881161515617519565b61271080830290838204148315171561140257620493e09004600091826001600160a01b03809216928385526004906020956004875260409586822093825b601e841061792d575050505050506178169085615896565b9081151580617922575b61783a575b5050505061783590600954615856565b600955565b601254601454845163a9059cbb60e01b81529083166001600160a01b0316600482015260248101939093528491839116816000816044810103925af1908115617917576000916178fa575b5015617892578080617825565b60849250519062461bcd60e51b825260048201526024808201527f4f7270686943726f776446756e643a2044757374207472616e7366657220666160448201527f696c6564000000000000000000000000000000000000000000000000000000006064820152fd5b6179119150833d851161257e5761257081836155e9565b38617885565b82513d6000823e3d90fd5b506005541515617820565b876179388588615670565b90549060031b1c1680151580617b2e575b617963575b5061795b85600192615856565b9301926177fe565b806000989298526001808c528a6000208054916001600160801b03808416917003fffffffffffffffffffffffffffffffc600295861b1692808404891490151715617b19578f8f967f85554fc59c8e021028889acfd6315c85a18677bd1539e11d75ad89e790d052e660a08e988a60138f96617a7360019f9a9c61795b9f9c8f9d617ab49f908f9d918e8d93860190815483811687617a028483615856565b1115617ae75750505090817fbac0ee9e19370829f29a023df4d915861af1fa0e0e3d2a5abc4df8990100c09493925490617a3e83831688615896565b80617abd575b5050508a8601600160801b61ffff60801b1982541617905585541681519081524288820152a3612ae242616c84565b825193606091829186528501528301527f476c6f62616c2055706c696e6520426f6e75730000000000000000000000000060808301524290820152a4615856565b9892505061794e565b612ace61475e91617adf9460078c0180549088616f28612ace86838616615856565b388080617a44565b9091929550616fa0965061475e9450612ace93616f42612ace8560078c019485549585616f8b612ace85838b16615856565b601188634e487b7160e01b6000525260246000fd5b508060005260018b5260ff60028b600020015460801c1615617949565b80518210156155195760209160051b010190565b604090604051617d20810181811067ffffffffffffffff821117610c4b576040526103e8815260209060208101617d0036823760009460018094845115615519576001600160a01b039384881690525b858810617bc157505050505050905090565b83617bd5617bce8a6158b8565b9987617b4b565b51168060005282825283600020856004820154169081158781159283617c82575b5050617c745780617c6a575b617c50575b506000528181528360058460002001541680151580617c46575b617c2c575b50617baf565b617c3f617c38886158b8565b9787617b4b565b5238617c26565b5085518710617c21565b617c63617c5c896158b8565b9888617b4b565b5238617c07565b5086518810617c02565b505097505050505050505090565b60050154161590508738617bf6565b60ff7ff0c57e16840df040f15088dc2f81fe391c3923bec73e23a9662efc9c229c6a005460401c1615617cc057565b60046040517fd7e6bcf8000000000000000000000000000000000000000000000000000000008152fd5b90617d295750805115617cff57805190602001fd5b60046040517fd6bda275000000000000000000000000000000000000000000000000000000008152fd5b81511580617d74575b617d3a575090565b6024906001600160a01b03604051917f9996b315000000000000000000000000000000000000000000000000000000008352166004820152fd5b50803b15617d3256fe02dd7bc7dec4dceedda775e58dd541e08a116c6c53815c0bd028192f7b626800a2646970667358221220985ad53895676f9eded90113d78aca27433cfd0cd3cd2e12fe041d31236c706464736f6c63430008160033"
};