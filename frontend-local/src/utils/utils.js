// Utility functions
import { ethers } from 'ethers';
import { CONTRACT_CONFIG, PACKAGES } from '../config/contractConfig.js';

// Format amounts for display
export const formatAmount = (amount, decimals = 18, displayDecimals = 6) => {
  try {
    const formatted = ethers.formatUnits(amount, decimals);
    return parseFloat(formatted).toFixed(displayDecimals);
  } catch (error) {
    return '0.000000';
  }
};

// Format address for display
export const formatAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return '';
  if (address.length < startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

// Get package info
export const getPackageInfo = (level) => {
  return PACKAGES[level] || { name: 'Unknown', price: '0', description: '', color: '#666' };
};

// Parse contract error
export const parseContractError = (error) => {
  if (!error) return 'Unknown error';
  
  const errorString = error.toString();
  
  // Common error patterns
  if (errorString.includes('user rejected')) {
    return 'Transaction was rejected by user';
  }
  
  if (errorString.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  
  if (errorString.includes('Already registered')) {
    return 'User is already registered';
  }
  
  if (errorString.includes('Invalid sponsor')) {
    return 'Invalid sponsor address';
  }
  
  if (errorString.includes('Daily limit exceeded')) {
    return 'Daily withdrawal limit exceeded';
  }
  
  if (errorString.includes('Insufficient balance')) {
    return 'Insufficient contract balance';
  }
  
  if (errorString.includes('USDT transfer failed')) {
    return 'USDT transfer failed - check allowance';
  }
  
  // Extract revert reason if available
  const revertMatch = errorString.match(/reverted with reason string '([^']+)'/);
  if (revertMatch) {
    return revertMatch[1];
  }
  
  return error.message || errorString;
};

// Get explorer URL for transaction
export const getExplorerUrl = (hash, type = 'tx') => {
  const baseUrl = CONTRACT_CONFIG.EXPLORER_URL;
  if (type === 'tx') {
    return `${baseUrl}/tx/${hash}`;
  } else if (type === 'address') {
    return `${baseUrl}/address/${hash}`;
  }
  return baseUrl;
};

export default {
  formatAmount,
  formatAddress,
  getPackageInfo,
  parseContractError,
  getExplorerUrl
};
