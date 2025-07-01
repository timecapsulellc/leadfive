/**
 * Wallet Connection Test Utility
 * 
 * Debug and test wallet connections
 */

import { isValidEthereumAddress, getAvailableWallets, isWalletAvailable } from './walletValidation';

/**
 * Test wallet connection capabilities
 */
export const testWalletEnvironment = () => {
  console.group('🧪 Wallet Environment Test');
  
  // Check basic environment
  console.log('Window object available:', typeof window !== 'undefined');
  console.log('Ethereum provider available:', !!window.ethereum);
  
  if (window.ethereum) {
    console.log('Provider properties:', {
      isMetaMask: !!window.ethereum.isMetaMask,
      isTrust: !!window.ethereum.isTrust,
      isCoinbaseWallet: !!window.ethereum.isCoinbaseWallet,
      selectedAddress: window.ethereum.selectedAddress,
      chainId: window.ethereum.chainId
    });
  }
  
  // Check available wallets
  const availableWallets = getAvailableWallets();
  console.log('Available wallets:', availableWallets);
  
  // Check specific wallet availability
  console.log('Wallet availability:', {
    MetaMask: isWalletAvailable('metamask'),
    TrustWallet: isWalletAvailable('trustwallet'),
    BinanceWallet: isWalletAvailable('binancewallet'),
    CoinbaseWallet: isWalletAvailable('coinbase')
  });
  
  console.groupEnd();
  
  return {
    hasProvider: !!window.ethereum,
    availableWallets,
    walletCount: availableWallets.length
  };
};

/**
 * Test a specific wallet connection
 */
export const testWalletConnection = async (walletType = 'metamask') => {
  console.group(`🔗 Testing ${walletType} Connection`);
  
  try {
    if (!isWalletAvailable(walletType)) {
      throw new Error(`${walletType} not available`);
    }
    
    // Request accounts
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });
    
    console.log('Connected accounts:', accounts);
    
    if (accounts.length > 0) {
      const account = accounts[0];
      console.log('Primary account:', account);
      console.log('Valid address:', isValidEthereumAddress(account));
      
      // Get network info
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      console.log('Current chain ID:', chainId);
      
      // Test provider creation
      try {
        const { BrowserProvider } = await import('ethers');
        const provider = new BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        console.log('Network info:', {
          chainId: network.chainId.toString(),
          name: network.name
        });
        
        // Test signer creation
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        console.log('Signer address:', signerAddress);
        console.log('Address match:', signerAddress.toLowerCase() === account.toLowerCase());
        
        console.log('✅ Connection test successful');
        return {
          success: true,
          account,
          chainId,
          network: network.name,
          provider: !!provider,
          signer: !!signer
        };
      } catch (providerError) {
        console.error('Provider/Signer creation failed:', providerError);
        return {
          success: false,
          error: providerError.message,
          account,
          chainId
        };
      }
    } else {
      console.log('⚠️ No accounts connected');
      return {
        success: false,
        error: 'No accounts connected'
      };
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    console.groupEnd();
  }
};

/**
 * Comprehensive wallet diagnostics
 */
export const runWalletDiagnostics = async () => {
  console.group('🔍 Comprehensive Wallet Diagnostics');
  
  const results = {
    timestamp: new Date().toISOString(),
    environment: null,
    connectionTests: {},
    summary: {
      totalWallets: 0,
      connectedWallets: 0,
      failedWallets: 0
    }
  };
  
  // Test environment
  results.environment = testWalletEnvironment();
  results.summary.totalWallets = results.environment.walletCount;
  
  // Test each available wallet
  for (const wallet of results.environment.availableWallets) {
    console.log(`Testing ${wallet.name}...`);
    const testResult = await testWalletConnection(wallet.id);
    results.connectionTests[wallet.id] = testResult;
    
    if (testResult.success) {
      results.summary.connectedWallets++;
    } else {
      results.summary.failedWallets++;
    }
  }
  
  // Summary
  console.log('📊 Diagnostic Summary:', results.summary);
  
  if (results.summary.connectedWallets === 0) {
    console.warn('⚠️ No wallets successfully connected');
    console.log('💡 Troubleshooting tips:');
    console.log('1. Make sure a Web3 wallet is installed');
    console.log('2. Unlock your wallet');
    console.log('3. Connect to the dApp from within the wallet browser');
    console.log('4. Check if the wallet is on the correct network');
  }
  
  console.groupEnd();
  
  return results;
};

/**
 * Quick connection test for debugging
 */
export const quickConnectionTest = async () => {
  try {
    if (!window.ethereum) {
      return { success: false, error: 'No Ethereum provider found' };
    }
    
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    
    if (accounts.length === 0) {
      return { success: false, error: 'No accounts connected' };
    }
    
    return { 
      success: true, 
      account: accounts[0],
      chainId: window.ethereum.chainId 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Add to global scope for browser console testing
if (typeof window !== 'undefined') {
  window.walletDebug = {
    testEnvironment: testWalletEnvironment,
    testConnection: testWalletConnection,
    runDiagnostics: runWalletDiagnostics,
    quickTest: quickConnectionTest
  };
}
