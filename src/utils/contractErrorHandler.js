/**
 * Contract Error Handler Utility
 *
 * Provides comprehensive error handling for smart contract calls
 * to prevent app crashes and provide better user experience.
 */

/**
 * Handle contract call errors with fallback data
 * @param {Function} contractCall - The contract call function
 * @param {Object} fallbackData - Fallback data to use if contract call fails
 * @param {string} errorContext - Context for logging errors
 * @returns {Object} Either the contract data or fallback data
 */
export const handleContractCall = async (
  contractCall,
  fallbackData = null,
  errorContext = 'Contract call'
) => {
  try {
    const result = await contractCall();
    return { success: true, data: result, error: null };
  } catch (error) {
    console.warn(`${errorContext} failed:`, error);

    // Determine error type for better handling
    const errorType = getContractErrorType(error);

    return {
      success: false,
      data: fallbackData,
      error: {
        type: errorType,
        message: error.message,
        original: error,
      },
    };
  }
};

/**
 * Determine the type of contract error
 * @param {Error} error - The error object
 * @returns {string} Error type
 */
export const getContractErrorType = error => {
  const message = error.message?.toLowerCase() || '';

  if (message.includes('revert')) {
    return 'REVERT';
  } else if (message.includes('network')) {
    return 'NETWORK';
  } else if (message.includes('user rejected')) {
    return 'USER_REJECTED';
  } else if (message.includes('insufficient funds')) {
    return 'INSUFFICIENT_FUNDS';
  } else if (message.includes('nonce')) {
    return 'NONCE_ERROR';
  } else if (message.includes('timeout')) {
    return 'TIMEOUT';
  } else if (
    message.includes('not registered') ||
    message.includes('not found')
  ) {
    return 'USER_NOT_REGISTERED';
  } else {
    return 'UNKNOWN';
  }
};

/**
 * Check if user is registered before making contract calls
 * @param {Object} contractInstance - The contract instance
 * @param {string} userAddress - User's wallet address
 * @returns {boolean} True if user is registered
 */
export const checkUserRegistration = async (contractInstance, userAddress) => {
  try {
    if (!contractInstance || !userAddress) {
      return false;
    }

    const userInfo = await contractInstance.getUserInfo(userAddress);
    return userInfo.isRegistered;
  } catch (error) {
    console.warn('User registration check failed:', error);
    return false;
  }
};

/**
 * Validate network connection before contract calls
 * @param {Object} provider - Web3 provider
 * @returns {boolean} True if on correct network
 */
export const validateNetwork = async provider => {
  try {
    if (!provider) {
      return false;
    }

    const network = await provider.getNetwork();
    // BSC Mainnet chainId is 56
    return network.chainId === 56;
  } catch (error) {
    console.warn('Network validation failed:', error);
    return false;
  }
};

/**
 * Validate account format and type
 * @param {any} account - The account value to validate
 * @returns {string|null} Valid account address or null
 */
export const validateAccount = account => {
  if (!account) return null;

  // Handle different account formats
  if (typeof account === 'string') {
    // Check if it's a valid Ethereum address format
    if (account.match(/^0x[a-fA-F0-9]{40}$/)) {
      return account;
    }
  } else if (typeof account === 'object') {
    // Handle wallet object with address property
    if (account.address && typeof account.address === 'string') {
      return account.address;
    }
    // Handle array format (some wallets return array)
    if (Array.isArray(account) && account.length > 0) {
      return account[0];
    }
  }

  return null;
};

/**
 * Safe account formatter for display
 * @param {any} account - The account to format
 * @returns {string} Formatted account string
 */
export const formatAccountForDisplay = account => {
  const validAccount = validateAccount(account);
  if (!validAccount) return 'Not Connected';

  return `${validAccount.substring(0, 6)}...${validAccount.substring(validAccount.length - 4)}`;
};

/**
 * Safe account code generator
 * @param {any} account - The account to generate code from
 * @returns {string} Generated code or fallback
 */
export const generateAccountCode = account => {
  const validAccount = validateAccount(account);
  if (!validAccount) return 'DEMO123';

  return validAccount.slice(-8);
};

/**
 * Create safe contract call wrapper with comprehensive error handling
 * @param {Object} contractInstance - Contract instance
 * @param {Object} provider - Web3 provider
 * @param {string} userAddress - User's wallet address
 * @returns {Object} Safe contract call functions
 */
export const createSafeContractCalls = (
  contractInstance,
  provider,
  userAddress
) => {
  return {
    async getUserInfo(
      fallbackData = {
        isRegistered: false,
        directReferrals: 0,
        teamSize: 0,
        totalEarnings: 0,
        referralCode: '',
      }
    ) {
      return handleContractCall(
        () => contractInstance.getUserInfo(userAddress),
        fallbackData,
        'getUserInfo'
      );
    },

    async getTeamData(
      fallbackData = { directReferrals: 0, totalTeam: 0, activeMembers: 0 }
    ) {
      return handleContractCall(
        () => contractInstance.getTeamData(userAddress),
        fallbackData,
        'getTeamData'
      );
    },

    async getUserEarnings(
      fallbackData = { totalEarnings: 0, pendingRewards: 0 }
    ) {
      return handleContractCall(
        () => contractInstance.getUserEarnings(userAddress),
        fallbackData,
        'getUserEarnings'
      );
    },

    async getMatrixData(fallbackData = { level: 1, position: 1, cycles: 0 }) {
      return handleContractCall(
        () => contractInstance.getMatrixData(userAddress),
        fallbackData,
        'getMatrixData'
      );
    },
  };
};

/**
 * Demo data for fallback scenarios
 */
export const DEMO_DATA = {
  userInfo: {
    isRegistered: false,
    directReferrals: 0,
    teamSize: 0,
    totalEarnings: 0,
    referralCode: 'DEMO123',
    packageLevel: 1,
    rank: 'Bronze',
    balance: 0,
    pendingRewards: 0,
  },

  teamStats: {
    directReferrals: 8,
    totalTeam: 24,
    activeMembers: 18,
    totalEarnings: 1250.75,
  },

  referralTree: {
    name: 'You',
    children: [
      {
        name: 'User 1',
        children: [{ name: 'User 1.1' }, { name: 'User 1.2' }],
      },
      {
        name: 'User 2',
        children: [{ name: 'User 2.1' }, { name: 'User 2.2' }],
      },
    ],
  },
};

export default {
  handleContractCall,
  getContractErrorType,
  checkUserRegistration,
  validateNetwork,
  createSafeContractCalls,
  DEMO_DATA,
};
