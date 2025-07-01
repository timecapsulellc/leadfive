/**
 * LeadFive Mainnet Deployment Constants
 * Last Updated: June 29, 2025
 * 
 * This file contains all contract addresses and deployment information
 * for the LeadFive platform on BSC Mainnet.
 */

export const DEPLOYMENT_INFO = {
  // =====================
  // CORE CONTRACT ADDRESSES
  // =====================
  PROXY_ADDRESS: '0x29dcCb502D10C042BcC6a02a7762C49595A9E498',
  IMPLEMENTATION_ADDRESS: '0x2cc37CB4e1F5D3D56E86c8792fD241d46064B2cF',
  CONTRACT_OWNER: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29', // Trezor Hardware Wallet
  
  // =====================
  // TOKEN ADDRESSES
  // =====================
  USDT_ADDRESS: '0x55d398326f99059fF775485246999027B3197955', // BSC Mainnet USDT
  
  // =====================
  // NETWORK CONFIGURATION
  // =====================
  NETWORK: {
    name: 'Binance Smart Chain Mainnet',
    shortName: 'BSC Mainnet',
    chainId: 56,
    chainIdHex: '0x38',
    currency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: [
      'https://bsc-dataseed.binance.org/',
      'https://bsc-dataseed1.defibit.io/',
      'https://bsc-dataseed1.ninicoin.io/'
    ],
    blockExplorer: {
      name: 'BSCScan',
      url: 'https://bscscan.com'
    }
  },
  
  // =====================
  // DEPLOYMENT DETAILS
  // =====================
  DEPLOYMENT: {
    date: 'June 29, 2025',
    version: 'v1.0',
    implementationVersion: 'v1.0',
    proxyPattern: 'UUPS (Universal Upgradeable Proxy Standard)',
    deployer: '0xCeaEfDaDE5a0D574bFd5577665dC58d132995335',
    gasUsed: '~0.015 BNB',
    verified: true
  },
  
  // =====================
  // VERIFICATION LINKS
  // =====================
  VERIFICATION: {
    proxy: 'https://bscscan.com/address/0x29dcCb502D10C042BcC6a02a7762C49595A9E498#code',
    implementation: 'https://bscscan.com/address/0x2cc37CB4e1F5D3D56E86c8792fD241d46064B2cF#code',
    owner: 'https://bscscan.com/address/0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29'
  },
  
  // =====================
  // PACKAGE CONFIGURATION
  // =====================
  PACKAGES: {
    1: { name: 'Starter', price: 49, priceUSDT: '49' },
    2: { name: 'Bronze', price: 99, priceUSDT: '99' },
    3: { name: 'Silver', price: 499, priceUSDT: '499' },
    4: { name: 'Gold', price: 999, priceUSDT: '999' }
  },
  
  // =====================
  // CONTRACT FEATURES
  // =====================
  FEATURES: {
    upgradeable: true,
    pausable: true,
    dailyWithdrawalLimit: '10000', // USDT
    maxEarningsMultiplier: 4,
    referralLevels: 10,
    aiIntegration: true,
    hardwareWalletOwner: true
  }
};

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Get the main contract address (proxy)
 * Users should always interact with this address
 */
export const getContractAddress = () => DEPLOYMENT_INFO.PROXY_ADDRESS;

/**
 * Get the implementation address
 * This is for internal/development use only
 */
export const getImplementationAddress = () => DEPLOYMENT_INFO.IMPLEMENTATION_ADDRESS;

/**
 * Get the contract owner address (Trezor wallet)
 */
export const getOwnerAddress = () => DEPLOYMENT_INFO.CONTRACT_OWNER;

/**
 * Get USDT contract address
 */
export const getUSDTAddress = () => DEPLOYMENT_INFO.USDT_ADDRESS;

/**
 * Get BSCScan URL for an address
 */
export const getBSCScanURL = (address, type = 'address') => {
  return `${DEPLOYMENT_INFO.NETWORK.blockExplorer.url}/${type}/${address}`;
};

/**
 * Get contract verification URL
 */
export const getVerificationURL = (contractType = 'proxy') => {
  return DEPLOYMENT_INFO.VERIFICATION[contractType];
};

/**
 * Check if the current network is supported
 */
export const isSupportedNetwork = (chainId) => {
  return chainId === DEPLOYMENT_INFO.NETWORK.chainId || 
         chainId === DEPLOYMENT_INFO.NETWORK.chainIdHex;
};

/**
 * Get package information by level
 */
export const getPackageInfo = (level) => {
  return DEPLOYMENT_INFO.PACKAGES[level];
};

/**
 * Format address for display (short version)
 */
export const formatAddress = (address, chars = 6) => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-4)}`;
};

// =====================
// DEFAULT EXPORT
// =====================
export default DEPLOYMENT_INFO;
