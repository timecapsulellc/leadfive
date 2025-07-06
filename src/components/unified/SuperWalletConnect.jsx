/**
 * Super Wallet Connect - Unified Wallet Connection Component
 * Consolidates all wallet connection functionality into one component
 * Supports desktop, mobile, multiple wallets, and various use cases
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import useMobileWallet from '../../hooks/useMobileWallet';
import './SuperWalletConnect.css';

// Wallet configurations
const WALLET_CONFIGS = {
  metamask: {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Most popular Web3 wallet',
    check: () => window.ethereum?.isMetaMask,
    deepLink: 'https://metamask.app.link/dapp/'
  },
  trust: {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    description: 'Secure mobile wallet',
    check: () => window.ethereum?.isTrust,
    deepLink: 'https://link.trustwallet.com/open_url?coin_id=20000714&url='
  },
  binance: {
    id: 'binance',
    name: 'Binance Wallet',
    icon: '🟡',
    description: 'Official Binance wallet',
    check: () => window.BinanceChain,
    deepLink: null
  },
  walletconnect: {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect via QR code',
    check: () => window.ethereum?.isWalletConnect,
    deepLink: null
  },
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    description: 'Coinbase mobile wallet',
    check: () => window.ethereum?.isCoinbaseWallet,
    deepLink: null
  }
};

// BSC Network configuration
const BSC_CONFIG = {
  chainId: '0x38',
  chainName: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
};

const SuperWalletConnect = ({
  // Connection callbacks
  onConnect,
  onDisconnect,
  
  // Current state
  account: externalAccount,
  provider: externalProvider,
  
  // UI customization
  buttonText = 'Connect Wallet',
  compact = false,
  showWalletList = true,
  mode = 'auto', // 'auto', 'mobile', 'desktop'
  
  // Advanced options
  autoConnect = true,
  showBalance = false,
  showNetworkStatus = true,
  enableRetry = true,
  maxRetries = 3
}) => {
  // State management
  const [isConnecting, setIsConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [networkStatus, setNetworkStatus] = useState('checking');
  const [balance, setBalance] = useState(null);

  // Mobile wallet integration
  const mobileWallet = useMobileWallet();
  
  // Device detection
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  // Determine effective mode
  const effectiveMode = mode === 'auto' ? (isMobile ? 'mobile' : 'desktop') : mode;

  // Available wallets detection
  const availableWallets = useMemo(() => {
    return Object.values(WALLET_CONFIGS).filter(wallet => {
      if (effectiveMode === 'mobile') {
        return wallet.id === 'metamask' || wallet.id === 'trust' || wallet.check();
      }
      return wallet.check();
    });
  }, [effectiveMode]);

  // Format address display
  const formatAddress = useCallback((address) => {
    if (!address || typeof address !== 'string') return 'Connected';
    if (address.length <= 10) return address;
    return `${address.substring(0, 6)}...${address.slice(-4)}`;
  }, []);

  // Generate deep links for mobile wallets
  const generateDeepLink = useCallback((walletId) => {
    const wallet = WALLET_CONFIGS[walletId];
    if (!wallet?.deepLink) return null;
    
    const currentUrl = window.location.href;
    const encodedUrl = encodeURIComponent(currentUrl);
    
    switch (walletId) {
      case 'metamask':
        return `${wallet.deepLink}${window.location.hostname}`;
      case 'trust':
        return `${wallet.deepLink}${encodedUrl}`;
      default:
        return wallet.deepLink;
    }
  }, []);

  // Network verification
  const verifyNetwork = useCallback(async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== BSC_CONFIG.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BSC_CONFIG.chainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [BSC_CONFIG],
            });
          } else {
            throw switchError;
          }
        }
      }
      setNetworkStatus('connected');
      return true;
    } catch (error) {
      setNetworkStatus('wrong-network');
      throw new Error('Failed to connect to BSC network');
    }
  }, []);

  // Get wallet balance
  const fetchBalance = useCallback(async (account, provider) => {
    if (!account || !provider || !showBalance) return;
    
    try {
      const balance = await provider.getBalance(account);
      const formattedBalance = ethers.formatEther(balance);
      setBalance(parseFloat(formattedBalance).toFixed(4));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, [showBalance]);

  // Main connection handler
  const handleConnect = useCallback(async (walletId = null) => {
    setIsConnecting(true);
    setError(null);

    try {
      // Mobile wallet handling
      if (effectiveMode === 'mobile' && !window.ethereum) {
        const deepLink = generateDeepLink(walletId || 'metamask');
        if (deepLink) {
          window.location.href = deepLink;
          return;
        } else {
          throw new Error('Please open this page in your mobile wallet browser');
        }
      }

      // Check if wallet is available
      if (!window.ethereum) {
        throw new Error('No wallet detected. Please install MetaMask or another Web3 wallet.');
      }

      // Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      const account = accounts[0];

      // Verify network
      await verifyNetwork();

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Verify signer address matches account
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== account.toLowerCase()) {
        throw new Error('Address mismatch after connection');
      }

      // Fetch balance if requested
      await fetchBalance(account, provider);

      // Notify parent component
      if (onConnect) {
        onConnect(account, provider, signer);
      }

      setShowModal(false);
      setRetryCount(0);

    } catch (error) {
      console.error('Wallet connection failed:', error);
      setError(error.message);

      // Retry logic
      if (enableRetry && retryCount < maxRetries && !error.message.includes('rejected')) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          handleConnect(walletId);
        }, 2000);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [effectiveMode, generateDeepLink, verifyNetwork, fetchBalance, onConnect, enableRetry, retryCount, maxRetries]);

  // Mobile wallet connection
  const handleMobileConnect = useCallback(async () => {
    if (effectiveMode === 'mobile' && mobileWallet.canConnect) {
      try {
        await mobileWallet.connect();
      } catch (error) {
        setError(error.message);
      }
    } else {
      handleConnect();
    }
  }, [effectiveMode, mobileWallet, handleConnect]);

  // Disconnect handler
  const handleDisconnect = useCallback(() => {
    if (mobileWallet.account) {
      mobileWallet.disconnect();
    }
    
    if (onDisconnect) {
      onDisconnect();
    }
    
    setBalance(null);
    setError(null);
    setNetworkStatus('checking');
  }, [mobileWallet, onDisconnect]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts && accounts.length > 0) {
            handleConnect();
          }
        })
        .catch(() => {
          // Silent fail for auto-connect
        });
    }
  }, [autoConnect, handleConnect]);

  // Sync with mobile wallet
  useEffect(() => {
    if (mobileWallet.account && mobileWallet.provider && mobileWallet.signer && onConnect) {
      onConnect(mobileWallet.account, mobileWallet.provider, mobileWallet.signer);
    }
  }, [mobileWallet.account, mobileWallet.provider, mobileWallet.signer, onConnect]);

  // Current account (external or internal)
  const currentAccount = externalAccount || mobileWallet.account;
  const isConnected = !!currentAccount;

  // Wallet selection modal
  const WalletModal = () => (
    <div className="wallet-modal-overlay" onClick={() => setShowModal(false)}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Connect Wallet</h3>
          <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
        </div>
        
        <div className="wallet-list">
          {availableWallets.map(wallet => (
            <button
              key={wallet.id}
              className={`wallet-option ${selectedWallet === wallet.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedWallet(wallet.id);
                handleConnect(wallet.id);
              }}
              disabled={isConnecting}
            >
              <div className="wallet-icon">{wallet.icon}</div>
              <div className="wallet-info">
                <div className="wallet-name">{wallet.name}</div>
                <div className="wallet-desc">{wallet.description}</div>
              </div>
              {wallet.check() && <div className="status-indicator">✓</div>}
            </button>
          ))}
        </div>

        {effectiveMode === 'mobile' && availableWallets.length === 0 && (
          <div className="mobile-instructions">
            <h4>📱 Mobile Wallet Required</h4>
            <p>Install MetaMask or Trust Wallet to continue:</p>
            <div className="app-links">
              <a href="https://metamask.app.link/" target="_blank" rel="noopener noreferrer">
                🦊 Get MetaMask
              </a>
              <a href="https://trustwallet.com/" target="_blank" rel="noopener noreferrer">
                🛡️ Get Trust Wallet
              </a>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            {enableRetry && retryCount < maxRetries && (
              <button onClick={() => handleConnect(selectedWallet)}>
                Retry ({retryCount}/{maxRetries})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render connected state
  if (isConnected) {
    return (
      <div className={`super-wallet-connect connected ${compact ? 'compact' : ''}`}>
        <div className="wallet-info">
          <div className="account-details">
            <span className="account-address">{formatAddress(currentAccount)}</span>
            {showBalance && balance && (
              <span className="account-balance">{balance} BNB</span>
            )}
          </div>
          {showNetworkStatus && (
            <div className={`network-status ${networkStatus}`}>
              {networkStatus === 'connected' ? '🟢' : '🔴'} BSC
            </div>
          )}
        </div>
        <button className="disconnect-btn" onClick={handleDisconnect}>
          {compact ? '×' : 'Disconnect'}
        </button>
      </div>
    );
  }

  // Render connection state
  return (
    <div className={`super-wallet-connect ${compact ? 'compact' : ''}`}>
      <button
        className={`connect-btn ${isConnecting ? 'connecting' : ''}`}
        onClick={showWalletList ? () => setShowModal(true) : handleMobileConnect}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <span className="spinner">⏳</span>
            {retryCount > 0 ? `Retry ${retryCount}/${maxRetries}` : 'Connecting...'}
          </>
        ) : (
          buttonText
        )}
      </button>

      {error && !showModal && (
        <div className="inline-error">
          ⚠️ {error}
        </div>
      )}

      {showModal && <WalletModal />}
    </div>
  );
};

export default SuperWalletConnect;