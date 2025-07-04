/**
 * Root User Configuration - Real Contract Data
 * Contains the actual root user information from deployed contract
 */

// REAL root user information from contract
export const ROOT_USER_CONFIG = {
  // Actual root user address from contract
  address: '0xCeaEfDaDE5a0D574bFd5577665dC58d132995335',
  
  // Actual referral code from contract
  referralCode: 'K9NBHT',
  
  // Contract information
  contractAddress: '0x29dcCb502D10C042BcC6a02a7762C49595A9E498',
  
  // Real referral links
  referralLinks: {
    local: 'http://localhost:5174/register?ref=K9NBHT',
    production: 'https://leadfive.today/register?ref=K9NBHT'
  },
  
  // System options
  fallbackOptions: {
    // If no referral code provided, use root user
    useRootAsDefault: true,
    
    // Allow direct wallet addresses as referral codes
    allowWalletReferrals: true,
    
    // Allow custom referral codes
    allowCustomCodes: true
  }
};

/**
 * Generate referral link for any code
 * @param {string} referralCode - The referral code to use
 * @returns {string} - The complete referral link
 */
export const generateReferralLink = (referralCode = ROOT_USER_CONFIG.referralCode) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/register?ref=${referralCode}`;
};

/**
 * Validate referral code format
 * @param {string} code - The referral code to validate
 * @returns {boolean} - Whether the code format is valid
 */
export const isValidReferralCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  
  // Check if it's a wallet address (0x followed by 40 hex characters)
  const walletRegex = /^0x[a-fA-F0-9]{40}$/;
  if (walletRegex.test(code)) return true;
  
  // Check if it's a custom code (alphanumeric, 3-20 characters)
  const customCodeRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (customCodeRegex.test(code)) return true;
  
  return false;
};

/**
 * Get referral target address from code
 * @param {string} code - The referral code
 * @param {object} contractInstance - The contract instance for lookups
 * @returns {Promise<string>} - The target address
 */
export const getReferralTarget = async (code, contractInstance) => {
  if (!code) return ROOT_USER_CONFIG.address;
  
  // Check if it's already a wallet address
  const walletRegex = /^0x[a-fA-F0-9]{40}$/;
  if (walletRegex.test(code)) {
    return code;
  }
  
  // If it's a custom code, look it up in the contract
  if (contractInstance) {
    try {
      const address = await contractInstance.referralCodeToUser(code);
      if (address && address !== '0x0000000000000000000000000000000000000000') {
        return address;
      }
    } catch (error) {
      console.warn('Error looking up referral code:', code, error);
    }
  }
  
  // Fallback to root user
  return ROOT_USER_CONFIG.address;
};

export default ROOT_USER_CONFIG;