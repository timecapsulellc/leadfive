// LeadFive Contract Configuration for Frontend Integration
// Updated with MAINNET PRODUCTION deployment

export const LEADFIVE_CONFIG = {
  // MAINNET CONTRACT ADDRESSES
  PROXY_ADDRESS: '0x29dcCb502D10C042BcC6a02a7762C49595A9E498',
  IMPLEMENTATION_ADDRESS: '0xA4AB35Ab2BA415E6CCf9559e8dcAB0661cC29e2b',
  USDT_ADDRESS: '0x55d398326f99059fF775485246999027B3197955',
  SPONSOR_ADDRESS: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29', // TREZOR WALLET (new owner)
  
  // NETWORK CONFIGURATION
  NETWORK: {
    chainId: '0x38', // BSC Mainnet
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    blockExplorer: 'https://bscscan.com/',
    currency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  },
  
  // PACKAGE CONFIGURATION
  PACKAGES: {
    1: { price: '30', name: 'Starter', level: 1 },
    2: { price: '50', name: 'Bronze', level: 2 },
    3: { price: '100', name: 'Silver', level: 3 },
    4: { price: '200', name: 'Gold', level: 4 }
  },
  
  // CONTRACT LIMITS
  LIMITS: {
    DAILY_WITHDRAWAL: '10000', // USDT
    MAX_EARNINGS_MULTIPLIER: 4, // 4x earnings cap
    MIN_WITHDRAWAL: '1' // 1 USDT minimum
  }
};

// Export individual values for backward compatibility
export const CONTRACT_ADDRESS = LEADFIVE_CONFIG.PROXY_ADDRESS;
export const USDT_ADDRESS = LEADFIVE_CONFIG.USDT_ADDRESS;
export const SPONSOR_ADDRESS = LEADFIVE_CONFIG.SPONSOR_ADDRESS;

export default LEADFIVE_CONFIG;
