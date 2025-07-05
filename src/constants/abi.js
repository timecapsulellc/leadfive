// LeadFive v1.10 Smart Contract ABI
// Generated from BSCScan verified contract implementation
// Contract Address: 0x1F8D54E7bCE7d5fd0fB6F0c3fb9a76de7e84e17c (Proxy)
// Implementation: 0x2cc37CB4e1F5D3D56E86c8792fD241d46064B2cF

export const LEAD_FIVE_ABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
    ],
    name: 'AddressEmptyCode',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'ERC1967InvalidImplementation',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ERC1967NonPayable',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EnforcedPause',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ExpectedPause',
    type: 'error',
  },
  {
    inputs: [],
    name: 'FailedCall',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidInitialization',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotInitializing',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'OwnableInvalidOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ReentrancyGuardReentrantCall',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UUPSUnauthorizedCallContext',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'slot',
        type: 'bytes32',
      },
    ],
    name: 'UUPSUnsupportedProxiableUUID',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'functionName',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'executor',
        type: 'address',
      },
    ],
    name: 'AdminFunctionExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'trigger',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'CircuitBreakerTriggered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'commissionType',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint96',
        name: 'amount',
        type: 'uint96',
      },
    ],
    name: 'CommissionPaid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'deployer',
        type: 'address',
      },
    ],
    name: 'DeployerCleared',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'action',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'admin',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'EmergencyAction',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint64',
        name: 'version',
        type: 'uint64',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sponsor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'level',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'position',
        type: 'uint8',
      },
    ],
    name: 'MatrixPlacement',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'level',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isPaid',
        type: 'bool',
      },
    ],
    name: 'PackageActivated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'newLevel',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint96',
        name: 'amount',
        type: 'uint96',
      },
    ],
    name: 'PackageUpgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'poolType',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint96',
        name: 'amount',
        type: 'uint96',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'recipients',
        type: 'uint32',
      },
    ],
    name: 'PoolDistribution',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'rootUser',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'maxLevel',
        type: 'uint8',
      },
    ],
    name: 'RootPackagesActivated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'newRoot',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'totalUsersAfter',
        type: 'uint32',
      },
    ],
    name: 'RootUserFixed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'alertType',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'SecurityAlert',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Unpaused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'Upgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sponsor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'packageLevel',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint96',
        name: 'amount',
        type: 'uint96',
      },
    ],
    name: 'UserRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'WithdrawalSecurityCheck',
    type: 'event',
  },
  {
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'activateAllLevelsForRoot',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'addToBlacklist',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'algorithmicPool',
    outputs: [
      {
        internalType: 'uint96',
        name: 'balance',
        type: 'uint96',
      },
      {
        internalType: 'uint32',
        name: 'lastDistribution',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'interval',
        type: 'uint32',
      },
      {
        internalType: 'uint96',
        name: 'totalDistributed',
        type: 'uint96',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'circuitBreakerThreshold',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'circuitBreakerTriggered',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'clubPool',
    outputs: [
      {
        internalType: 'uint96',
        name: 'balance',
        type: 'uint96',
      },
      {
        internalType: 'uint32',
        name: 'lastDistribution',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'interval',
        type: 'uint32',
      },
      {
        internalType: 'uint96',
        name: 'totalDistributed',
        type: 'uint96',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'communityPool',
    outputs: [
      {
        internalType: 'uint96',
        name: 'balance',
        type: 'uint96',
      },
      {
        internalType: 'uint32',
        name: 'lastDistribution',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'interval',
        type: 'uint32',
      },
      {
        internalType: 'uint96',
        name: 'totalDistributed',
        type: 'uint96',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'dailyWithdrawalLimit',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'dailyWithdrawals',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'directNetwork',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'poolType',
        type: 'uint8',
      },
    ],
    name: 'distributePoolRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'emergencyWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'emergencyWithdrawalEnabled',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'fixRootUserIssue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getContractStats',
    outputs: [
      {
        internalType: 'uint32',
        name: 'totalUsersCount',
        type: 'uint32',
      },
      {
        internalType: 'uint96',
        name: 'totalFeesCollected',
        type: 'uint96',
      },
      {
        internalType: 'bool',
        name: 'isPaused',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'circuitBreakerStatus',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCurrentBNBPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getDirectReferrals',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    name: 'getMatrixPosition',
    outputs: [
      {
        internalType: 'address',
        name: 'sponsor',
        type: 'address',
      },
      {
        internalType: 'uint8',
        name: 'position',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getNetworkStats',
    outputs: [
      {
        internalType: 'uint32',
        name: 'directCount',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'teamSize',
        type: 'uint32',
      },
      {
        internalType: 'uint256',
        name: 'leftVolume',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'rightVolume',
        type: 'uint256',
      },
      {
        internalType: 'uint96',
        name: 'totalEarnings',
        type: 'uint96',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'packageLevel',
        type: 'uint8',
      },
    ],
    name: 'getPackageInfo',
    outputs: [
      {
        internalType: 'uint96',
        name: 'price',
        type: 'uint96',
      },
      {
        internalType: 'uint16',
        name: 'directBonus',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'levelBonus',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'uplineBonus',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'leaderBonus',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'helpBonus',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'clubBonus',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'poolType',
        type: 'uint8',
      },
    ],
    name: 'getPoolInfo',
    outputs: [
      {
        internalType: 'uint96',
        name: 'balance',
        type: 'uint96',
      },
      {
        internalType: 'uint32',
        name: 'lastDistribution',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'interval',
        type: 'uint32',
      },
      {
        internalType: 'uint96',
        name: 'totalDistributed',
        type: 'uint96',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getReferralCode',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getTeamSize',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'code',
        type: 'string',
      },
    ],
    name: 'getUserByReferralCode',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getUserInfo',
    outputs: [
      {
        internalType: 'bool',
        name: 'isRegistered',
        type: 'bool',
      },
      {
        internalType: 'uint8',
        name: 'packageLevel',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'referrer',
        type: 'address',
      },
      {
        internalType: 'uint96',
        name: 'balance',
        type: 'uint96',
      },
      {
        internalType: 'uint96',
        name: 'totalInvestment',
        type: 'uint96',
      },
      {
        internalType: 'uint96',
        name: 'earningsCap',
        type: 'uint96',
      },
      {
        internalType: 'bool',
        name: 'isBlacklisted',
        type: 'bool',
      },
      {
        internalType: 'string',
        name: 'referralCode',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_usdt',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'initializeV1_1',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'isAdminAddress',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'isUserBlacklisted',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'lastNetworkUpdate',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'lastTeamUpdate',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastTxBlock',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'lastWithdrawalDay',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'lastWithdrawalTime',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'leadershipPool',
    outputs: [
      {
        internalType: 'uint96',
        name: 'balance',
        type: 'uint96',
      },
      {
        internalType: 'uint32',
        name: 'lastDistribution',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'interval',
        type: 'uint32',
      },
      {
        internalType: 'uint96',
        name: 'totalDistributed',
        type: 'uint96',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'leftLegVolume',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxDailyWithdrawal',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'networkSizeCache',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    name: 'packages',
    outputs: [
      {
        internalType: 'uint96',
        name: 'price',
        type: 'uint96',
      },
      {
        internalType: 'uint16',
        name: 'directBonus',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'levelBonus',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'uplineBonus',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'leaderBonus',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'helpBonus',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'clubBonus',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'platformFeeRecipient',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'priceConfig',
    outputs: [
      {
        internalType: 'int256',
        name: 'minPrice',
        type: 'int256',
      },
      {
        internalType: 'int256',
        name: 'maxPrice',
        type: 'int256',
      },
      {
        internalType: 'uint32',
        name: 'maxStaleTime',
        type: 'uint32',
      },
      {
        internalType: 'uint8',
        name: 'minOracles',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proxiableUUID',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    name: 'referralCodes',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sponsor',
        type: 'address',
      },
      {
        internalType: 'uint8',
        name: 'packageLevel',
        type: 'uint8',
      },
      {
        internalType: 'bool',
        name: 'useUSDT',
        type: 'bool',
      },
      {
        internalType: 'string',
        name: 'referralCode',
        type: 'string',
      },
    ],
    name: 'register',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'packageLevel',
        type: 'uint8',
      },
    ],
    name: 'registerAsRoot',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'removeFromBlacklist',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'resetCircuitBreaker',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'rightLegVolume',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rootPackagesActivated',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'admin',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'status',
        type: 'bool',
      },
    ],
    name: 'setAdminAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'smartTreeMatrix',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'teamSizeCache',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: 'enabled',
        type: 'bool',
      },
    ],
    name: 'toggleEmergencyWithdrawal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalPlatformFeesCollected',
    outputs: [
      {
        internalType: 'uint96',
        name: '',
        type: 'uint96',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'totalUserWithdrawals',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalUsers',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'threshold',
        type: 'uint256',
      },
    ],
    name: 'updateCircuitBreaker',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int256',
        name: 'minPrice',
        type: 'int256',
      },
      {
        internalType: 'int256',
        name: 'maxPrice',
        type: 'int256',
      },
    ],
    name: 'updatePriceOracle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'cooldown',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxDaily',
        type: 'uint256',
      },
    ],
    name: 'updateWithdrawalLimits',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'newLevel',
        type: 'uint8',
      },
      {
        internalType: 'bool',
        name: 'useUSDT',
        type: 'bool',
      },
    ],
    name: 'upgradePackage',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'usdt',
    outputs: [
      {
        internalType: 'contract IERC20',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    name: 'userIds',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'userLastTx',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'userMaxLevel',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'userReferralCode',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'userTotalEarnings',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'users',
    outputs: [
      {
        internalType: 'uint8',
        name: 'flags',
        type: 'uint8',
      },
      {
        internalType: 'uint8',
        name: 'packageLevel',
        type: 'uint8',
      },
      {
        internalType: 'uint8',
        name: 'rank',
        type: 'uint8',
      },
      {
        internalType: 'uint8',
        name: 'withdrawalRate',
        type: 'uint8',
      },
      {
        internalType: 'uint32',
        name: 'directReferrals',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'teamSize',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'registrationTime',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'lastWithdrawal',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'matrixLevel',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'matrixCycles',
        type: 'uint32',
      },
      {
        internalType: 'address',
        name: 'referrer',
        type: 'address',
      },
      {
        internalType: 'uint96',
        name: 'balance',
        type: 'uint96',
      },
      {
        internalType: 'uint96',
        name: 'totalInvestment',
        type: 'uint96',
      },
      {
        internalType: 'uint96',
        name: 'totalEarnings',
        type: 'uint96',
      },
      {
        internalType: 'uint96',
        name: 'totalWithdrawn',
        type: 'uint96',
      },
      {
        internalType: 'uint96',
        name: 'earningsCap',
        type: 'uint96',
      },
      {
        internalType: 'uint96',
        name: 'leftLegVolume',
        type: 'uint96',
      },
      {
        internalType: 'uint96',
        name: 'rightLegVolume',
        type: 'uint96',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint96',
        name: 'amount',
        type: 'uint96',
      },
      {
        internalType: 'bool',
        name: 'useUSDT',
        type: 'bool',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawalCooldown',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
];

// USDT Token ABI (for approvals and transfers)
export const USDT_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// Package level configurations for frontend display
export const PACKAGE_LEVELS = {
  1: { name: 'Basic', price: '31 USDT' },
  2: { name: 'Bronze', price: '51 USDT' },
  3: { name: 'Silver', price: '101 USDT' },
  4: { name: 'Gold', price: '251 USDT' },
  5: { name: 'Platinum', price: '501 USDT' },
  6: { name: 'Diamond', price: '1001 USDT' },
  7: { name: 'Ruby', price: '2001 USDT' },
  8: { name: 'Emerald', price: '5001 USDT' },
};

// Event signatures for listening to contract events
export const CONTRACT_EVENTS = {
  USER_REGISTERED: 'UserRegistered',
  COMMISSION_PAID: 'CommissionPaid',
  PACKAGE_ACTIVATED: 'PackageActivated',
  MATRIX_PLACEMENT: 'MatrixPlacement',
  WITHDRAWAL_SECURITY_CHECK: 'WithdrawalSecurityCheck',
};
