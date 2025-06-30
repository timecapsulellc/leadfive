// Contract Configuration
export const CONTRACT_CONFIG = {
  // LeadFive Mainnet Contract
  LEADFIVE_ADDRESS: '0x29dcCb502D10C042BcC6a02a7762C49595A9E498',
  LEADFIVE_IMPLEMENTATION: '0xA4AB35Ab2BA415E6CCf9559e8dcAB0661cC29e2b',
  
  // BSC Mainnet USDT
  USDT_ADDRESS: '0x55d398326f99059fF775485246999027B3197955',
  
  // Default sponsor for new registrations
  DEFAULT_SPONSOR: '0xCeaEfDaDE5a0D574bFd5577665dC58d132995335',
  
  // Network config
  CHAIN_ID: 56,
  NETWORK_NAME: 'BSC Mainnet',
  RPC_URL: 'https://bsc-dataseed.binance.org/',
  
  // Explorer
  EXPLORER_URL: 'https://bscscan.com',
};

// Package configuration
export const PACKAGES = {
  1: { name: 'Starter', price: '30', description: 'Entry level package', color: '#4CAF50' },
  2: { name: 'Basic', price: '50', description: 'Standard package', color: '#2196F3' },
  3: { name: 'Premium', price: '100', description: 'Advanced package', color: '#FF9800' },
  4: { name: 'VIP', price: '200', description: 'Premium package', color: '#9C27B0' }
};

export default CONTRACT_CONFIG;
