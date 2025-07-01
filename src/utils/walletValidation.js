/**
 * Wallet Validation Utility
 * 
 * Provides robust validation and error handling for wallet connections
 */

/**
 * Validate Ethereum address format
 */
export const isValidEthereumAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Safely format address for display
 */
export const safeFormatAddress = (address) => {
  if (!isValidEthereumAddress(address)) {
    return 'Invalid Address';
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Validate wallet connection data
 */
export const validateWalletConnection = (connectionData) => {
  const errors = [];
  
  if (!connectionData) {
    errors.push('No connection data provided');
    return { isValid: false, errors };
  }
  
  // Check address
  if (!connectionData.address || !isValidEthereumAddress(connectionData.address)) {
    errors.push('Invalid or missing wallet address');
  }
  
  // Check provider
  if (!connectionData.provider || typeof connectionData.provider !== 'object') {
    errors.push('Invalid or missing wallet provider');
  }
  
  // Check signer
  if (!connectionData.signer || typeof connectionData.signer !== 'object') {
    errors.push('Invalid or missing wallet signer');
  }
  
  // Check wallet type
  if (!connectionData.walletType || typeof connectionData.walletType !== 'string') {
    errors.push('Invalid or missing wallet type');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get user-friendly error message from wallet error
 */
export const getWalletErrorMessage = (error) => {
  if (!error) return 'Unknown error occurred';
  
  // Error codes from wallet interactions
  switch (error.code) {
    case 4001:
      return 'Connection rejected by user';
    case 4100:
      return 'Unauthorized request. Please unlock your wallet.';
    case 4200:
      return 'Unsupported method. Please update your wallet.';
    case 4900:
      return 'Wallet disconnected. Please reconnect.';
    case 4901:
      return 'Wallet not connected to requested chain.';
    case 4902:
      return 'Unrecognized chain ID. Please add the network to your wallet.';
    case -32002:
      return 'Request already pending. Please check your wallet.';
    case -32603:
      return 'Internal error. Please try again.';
    default:
      break;
  }
  
  // Message-based error detection
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('user rejected') || message.includes('user denied')) {
    return 'Connection rejected by user';
  }
  
  if (message.includes('network') || message.includes('chain')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (message.includes('no accounts') || message.includes('unauthorized')) {
    return 'No accounts found. Please unlock your wallet and try again.';
  }
  
  if (message.includes('timeout')) {
    return 'Connection timeout. Please try again.';
  }
  
  if (message.includes('not installed') || message.includes('not available')) {
    return 'Wallet not available. Please install a compatible wallet.';
  }
  
  if (message.includes('already pending')) {
    return 'Connection request already pending. Please check your wallet.';
  }
  
  // Return original message if no specific handling
  return error.message || 'Unknown wallet error occurred';
};

/**
 * Check if wallet provider is available
 */
export const isWalletAvailable = (walletType = 'metamask') => {
  if (typeof window === 'undefined') return false;
  
  switch (walletType.toLowerCase()) {
    case 'metamask':
      return !!(window.ethereum?.isMetaMask);
    case 'trustwallet':
    case 'trust':
      return !!(window.ethereum?.isTrust);
    case 'binancewallet':
    case 'binance':
      return !!(window.BinanceChain);
    case 'coinbase':
      return !!(window.ethereum?.isCoinbaseWallet);
    default:
      return !!(window.ethereum);
  }
};

/**
 * Get available wallet providers
 */
export const getAvailableWallets = () => {
  const wallets = [];
  
  if (isWalletAvailable('metamask')) {
    wallets.push({ id: 'metamask', name: 'MetaMask', icon: '🦊' });
  }
  
  if (isWalletAvailable('trustwallet')) {
    wallets.push({ id: 'trustwallet', name: 'Trust Wallet', icon: '🛡️' });
  }
  
  if (isWalletAvailable('binancewallet')) {
    wallets.push({ id: 'binancewallet', name: 'Binance Wallet', icon: '🟨' });
  }
  
  if (isWalletAvailable('coinbase')) {
    wallets.push({ id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵' });
  }
  
  // Generic injected wallet
  if (window.ethereum && wallets.length === 0) {
    wallets.push({ id: 'injected', name: 'Injected Wallet', icon: '💼' });
  }
  
  return wallets;
};

/**
 * Validate network chain ID
 */
export const isValidBSCNetwork = (chainId) => {
  const bscChainIds = ['0x38', '56', 56]; // Hex, string decimal, number decimal
  return bscChainIds.includes(chainId);
};

/**
 * Get network name from chain ID
 */
export const getNetworkName = (chainId) => {
  switch (chainId) {
    case '0x38':
    case '56':
    case 56:
      return 'BSC Mainnet';
    case '0x61':
    case '97':
    case 97:
      return 'BSC Testnet';
    case '0x1':
    case '1':
    case 1:
      return 'Ethereum Mainnet';
    case '0x89':
    case '137':
    case 137:
      return 'Polygon Mainnet';
    default:
      return `Chain ${chainId}`;
  }
};

export default {
  isValidEthereumAddress,
  safeFormatAddress,
  validateWalletConnection,
  getWalletErrorMessage,
  isWalletAvailable,
  getAvailableWallets,
  isValidBSCNetwork,
  getNetworkName
};
