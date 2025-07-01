import { ethers } from 'ethers';
import contractService from './ContractService.js';

/**
 * 🔐 LEAD FIVE WALLET SERVICE
 * Handles wallet connection, authentication, and provider management
 * with support for multiple wallet types and persistent sessions
 */
class WalletService {
  constructor() {
    this.provider = null;
    this.account = null;
    this.chainId = null;
    this.isConnected = false;
    this.walletType = null;
    this.listeners = new Set();
    this.connectionAttempts = 0;
    this.maxRetries = 3;
  }

  /**
   * Initialize wallet service and attempt auto-connection
   */
  async initialize() {
    try {
      // Check for existing connection
      const savedWallet = localStorage.getItem('leadfive_wallet_type');
      const savedAccount = localStorage.getItem('leadfive_wallet_account');
      
      if (savedWallet && savedAccount) {
        console.log('🔄 Attempting to restore wallet connection...');
        await this.connectWallet(savedWallet, true);
      }
      
      // Set up global event listeners
      this.setupGlobalListeners();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize wallet service:', error);
      return false;
    }
  }

  /**
   * Connect to wallet (MetaMask, WalletConnect, etc.)
   */
  async connectWallet(walletType = 'metamask', isReconnection = false) {
    try {
      let provider;
      let accounts;

      switch (walletType) {
        case 'metamask':
          provider = await this.connectMetaMask(isReconnection);
          break;
        case 'walletconnect':
          provider = await this.connectWalletConnect();
          break;
        default:
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }

      // Get accounts
      accounts = await provider.listAccounts();
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Set up provider and account
      this.provider = provider;
      this.account = accounts[0];
      this.walletType = walletType;
      this.isConnected = true;

      // Get and verify chain ID
      const network = await provider.getNetwork();
      this.chainId = Number(network.chainId);

      // Verify we're on BSC Mainnet
      if (this.chainId !== 56) {
        console.warn('⚠️ Not connected to BSC Mainnet, attempting to switch...');
        await this.switchToBSC();
      }

      // Initialize contract service
      await contractService.initialize(provider, this.account);

      // Save connection state
      localStorage.setItem('leadfive_wallet_type', walletType);
      localStorage.setItem('leadfive_wallet_account', this.account);

      // Notify listeners
      this.notifyListeners('connected', {
        account: this.account,
        chainId: this.chainId,
        walletType: this.walletType
      });

      console.log('✅ Wallet connected successfully:', {
        account: this.account,
        chainId: this.chainId,
        walletType: this.walletType
      });

      return {
        account: this.account,
        provider: this.provider,
        chainId: this.chainId
      };

    } catch (error) {
      this.connectionAttempts++;
      console.error(`❌ Wallet connection failed (attempt ${this.connectionAttempts}):`, error);
      
      if (this.connectionAttempts < this.maxRetries && !isReconnection) {
        console.log('🔄 Retrying wallet connection...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.connectWallet(walletType, false);
      }
      
      throw error;
    }
  }

  /**
   * Connect to MetaMask
   */
  async connectMetaMask(isReconnection = false) {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      if (!isReconnection) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      }

      // Create provider
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Set up MetaMask event listeners
      window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
      window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));
      window.ethereum.on('disconnect', this.handleDisconnect.bind(this));

      return provider;
    } catch (error) {
      if (error.code === 4001) {
        throw new Error('User rejected wallet connection');
      }
      throw error;
    }
  }

  /**
   * Connect to WalletConnect (placeholder for future implementation)
   */
  async connectWalletConnect() {
    throw new Error('WalletConnect integration coming soon');
  }

  /**
   * Switch to BSC Mainnet
   */
  async switchToBSC() {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // BSC Mainnet chain ID in hex
      });
    } catch (switchError) {
      // If BSC is not added to wallet, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x38',
            chainName: 'BNB Smart Chain',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'BNB',
              decimals: 18,
            },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ['https://bscscan.com/'],
          }],
        });
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect() {
    try {
      // Clean up contract service
      contractService.cleanup();

      // Clear state
      this.provider = null;
      this.account = null;
      this.chainId = null;
      this.isConnected = false;
      this.walletType = null;

      // Clear localStorage
      localStorage.removeItem('leadfive_wallet_type');
      localStorage.removeItem('leadfive_wallet_account');

      // Notify listeners
      this.notifyListeners('disconnected');

      console.log('🔌 Wallet disconnected');
    } catch (error) {
      console.error('Error during wallet disconnect:', error);
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      account: this.account,
      chainId: this.chainId,
      walletType: this.walletType,
      isCorrectNetwork: this.chainId === 56
    };
  }

  /**
   * Add event listener for wallet events
   */
  addEventListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of wallet events
   */
  notifyListeners(event, data = null) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in wallet event listener:', error);
      }
    });
  }

  /**
   * Handle MetaMask account changes
   */
  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      this.disconnect();
    } else if (accounts[0] !== this.account) {
      this.account = accounts[0];
      localStorage.setItem('leadfive_wallet_account', this.account);
      
      // Reinitialize contract service with new account
      if (this.provider) {
        contractService.initialize(this.provider, this.account);
      }
      
      this.notifyListeners('accountChanged', { account: this.account });
    }
  }

  /**
   * Handle MetaMask chain changes
   */
  handleChainChanged(chainId) {
    this.chainId = parseInt(chainId, 16);
    
    if (this.chainId !== 56) {
      this.notifyListeners('wrongNetwork', { chainId: this.chainId });
    } else {
      this.notifyListeners('networkChanged', { chainId: this.chainId });
    }
  }

  /**
   * Handle MetaMask disconnect
   */
  handleDisconnect() {
    this.disconnect();
  }

  /**
   * Set up global wallet event listeners
   */
  setupGlobalListeners() {
    // Listen for page visibility changes to handle reconnection
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isConnected) {
        this.validateConnection();
      }
    });

    // Listen for network connectivity
    window.addEventListener('online', () => {
      if (this.isConnected) {
        this.validateConnection();
      }
    });
  }

  /**
   * Validate current connection is still active
   */
  async validateConnection() {
    if (!this.provider || !this.account) return false;

    try {
      const accounts = await this.provider.listAccounts();
      return accounts.includes(this.account);
    } catch (error) {
      console.warn('Connection validation failed:', error);
      return false;
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance() {
    if (!this.provider || !this.account) {
      throw new Error('Wallet not connected');
    }

    try {
      const balance = await this.provider.getBalance(this.account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      throw error;
    }
  }

  /**
   * Sign message for authentication
   */
  async signMessage(message) {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    try {
      const signer = await this.provider.getSigner();
      return await signer.signMessage(message);
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const walletService = new WalletService();
export default walletService;
