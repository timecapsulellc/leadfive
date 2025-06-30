// Utility functions for LeadFive frontend integration
import { ethers } from 'ethers';
import { CONTRACT_CONFIG, PACKAGES } from './contractConfig';

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
  return PACKAGES[level] || { name: 'Unknown', price: '0', description: '' };
};

// Validate package level
export const isValidPackageLevel = (level) => {
  return level >= 1 && level <= 4;
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

// Calculate withdrawal amount after rate
export const calculateWithdrawalAmount = (balance, withdrawalRate, amount) => {
  const balanceNum = parseFloat(balance);
  const amountNum = parseFloat(amount);
  const rate = parseFloat(withdrawalRate) / 100;
  
  if (amountNum > balanceNum) {
    return { 
      error: 'Amount exceeds balance',
      withdrawable: 0,
      reinvestment: 0,
      platformFee: 0,
      userReceives: 0
    };
  }
  
  const withdrawable = amountNum * rate;
  const reinvestment = amountNum - withdrawable;
  const platformFee = withdrawable * 0.05; // 5% platform fee
  const userReceives = withdrawable - platformFee;
  
  return {
    error: null,
    withdrawable: withdrawable.toFixed(6),
    reinvestment: reinvestment.toFixed(6),
    platformFee: platformFee.toFixed(6),
    userReceives: userReceives.toFixed(6)
  };
};

// Validate withdrawal amount
export const validateWithdrawalAmount = (amount, balance, dailyLimit, dailyWithdrawn = 0) => {
  const amountNum = parseFloat(amount);
  const balanceNum = parseFloat(balance);
  const dailyLimitNum = parseFloat(dailyLimit);
  const dailyWithdrawnNum = parseFloat(dailyWithdrawn);
  
  if (isNaN(amountNum) || amountNum <= 0) {
    return { valid: false, error: 'Invalid amount' };
  }
  
  if (amountNum > balanceNum) {
    return { valid: false, error: 'Amount exceeds balance' };
  }
  
  if (amountNum < 1) {
    return { valid: false, error: 'Minimum withdrawal is 1 USDT' };
  }
  
  if (amountNum > 50000) {
    return { valid: false, error: 'Maximum single withdrawal is 50,000 USDT' };
  }
  
  if (dailyWithdrawnNum + amountNum > dailyLimitNum) {
    return { valid: false, error: 'Daily limit exceeded' };
  }
  
  return { valid: true, error: null };
};

// Format time ago
export const timeAgo = (timestamp) => {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp * 1000) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
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

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
};

// Add BSC network to MetaMask
export const addBSCNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${CONTRACT_CONFIG.CHAIN_ID.toString(16)}`,
        chainName: 'Binance Smart Chain Mainnet',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18,
        },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com/'],
      }],
    });
    return true;
  } catch (error) {
    console.error('Failed to add BSC network:', error);
    return false;
  }
};

// Generate referral link
export const generateReferralLink = (userAddress, baseUrl = window.location.origin) => {
  return `${baseUrl}?ref=${userAddress}`;
};

// Get referral from URL
export const getReferralFromUrl = () => {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');
  
  if (ref && ethers.isAddress(ref)) {
    return ref;
  }
  
  return null;
};

// Local storage helpers
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to get from localStorage:', error);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }
};

// Event listener helpers for contract events
export const setupEventListeners = (contract, eventHandlers) => {
  if (!contract) return () => {};
  
  const listeners = [];
  
  Object.entries(eventHandlers).forEach(([eventName, handler]) => {
    contract.on(eventName, handler);
    listeners.push([eventName, handler]);
  });
  
  // Return cleanup function
  return () => {
    listeners.forEach(([eventName, handler]) => {
      contract.off(eventName, handler);
    });
  };
};

export default {
  formatAmount,
  formatAddress,
  getPackageInfo,
  isValidPackageLevel,
  getExplorerUrl,
  calculateWithdrawalAmount,
  validateWithdrawalAmount,
  timeAgo,
  parseContractError,
  isMetaMaskInstalled,
  addBSCNetwork,
  generateReferralLink,
  getReferralFromUrl,
  storage,
  setupEventListeners
};
