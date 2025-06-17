import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Wallet connector icons (you can replace with actual SVGs)
const WalletIcons = {
  MetaMask: '🦊',
  TrustWallet: '🛡️',
  WalletConnect: '🔗',
  CoinbaseWallet: '🔵',
  BinanceWallet: '🟡',
  SafePal: '🔐',
  TokenPocket: '💼',
  MathWallet: '🧮'
};

const WalletConnector = ({ onConnect, onDisconnect, currentAccount, isConnected }) => {
  const [showModal, setShowModal] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [error, setError] = useState(null);
  const [isDetecting, setIsDetecting] = useState(true);

  // BSC Mainnet configuration
  const BSC_CONFIG = {
    chainId: '0x38', // 56 in hex
    chainName: 'BNB Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/'],
  };

  // Enhanced wallet detection with better timing
  const detectWallets = useCallback(() => {
    console.log('🔍 Starting wallet detection...');
    const wallets = [];
    
    // Log current state
    console.log('Current window state:', {
      ethereum: !!window.ethereum,
      isMetaMask: window.ethereum?.isMetaMask,
      isTrust: window.ethereum?.isTrust,
      providers: window.ethereum?.providers,
      readyState: document.readyState
    });

    // Check for multiple providers first (most common scenario)
    if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
      console.log('📱 Multiple providers detected:', window.ethereum.providers.length);
      
      window.ethereum.providers.forEach((provider, index) => {
        console.log(`Provider ${index}:`, {
          isMetaMask: provider.isMetaMask,
          isTrust: provider.isTrust,
          isCoinbaseWallet: provider.isCoinbaseWallet,
          constructor: provider.constructor.name
        });

        if (provider.isMetaMask) {
          wallets.push({
            name: 'MetaMask',
            id: 'metamask',
            icon: WalletIcons.MetaMask,
            installed: true,
            downloadUrl: 'https://metamask.io/download/',
            provider: provider
          });
        }
        if (provider.isTrust) {
          wallets.push({
            name: 'Trust Wallet',
            id: 'trust',
            icon: WalletIcons.TrustWallet,
            installed: true,
            downloadUrl: 'https://trustwallet.com/download',
            provider: provider
          });
        }
        if (provider.isCoinbaseWallet) {
          wallets.push({
            name: 'Coinbase Wallet',
            id: 'coinbase',
            icon: WalletIcons.CoinbaseWallet,
            installed: true,
            downloadUrl: 'https://wallet.coinbase.com/',
            provider: provider
          });
        }
      });
    } else if (window.ethereum) {
      // Single provider detected
      console.log('📱 Single provider detected');
      
      if (window.ethereum.isMetaMask) {
        console.log('✅ MetaMask detected as single provider');
        wallets.push({
          name: 'MetaMask',
          id: 'metamask',
          icon: WalletIcons.MetaMask,
          installed: true,
          downloadUrl: 'https://metamask.io/download/',
          provider: window.ethereum
        });
      } else if (window.ethereum.isTrust) {
        wallets.push({
          name: 'Trust Wallet',
          id: 'trust',
          icon: WalletIcons.TrustWallet,
          installed: true,
          downloadUrl: 'https://trustwallet.com/download',
          provider: window.ethereum
        });
      } else if (window.ethereum.isCoinbaseWallet) {
        wallets.push({
          name: 'Coinbase Wallet',
          id: 'coinbase',
          icon: WalletIcons.CoinbaseWallet,
          installed: true,
          downloadUrl: 'https://wallet.coinbase.com/',
          provider: window.ethereum
        });
      } else {
        // Generic ethereum provider - could be MetaMask or other wallet
        console.log('🔍 Generic ethereum provider detected, assuming MetaMask compatibility');
        wallets.push({
          name: 'Ethereum Wallet',
          id: 'ethereum',
          icon: '💳',
          installed: true,
          downloadUrl: null,
          provider: window.ethereum
        });
      }
    } else {
      console.log('❌ No ethereum provider detected');
    }

    // Check for other specific wallet providers
    if (window.BinanceChain) {
      console.log('✅ Binance Chain Wallet detected');
      wallets.push({
        name: 'Binance Wallet',
        id: 'binance',
        icon: WalletIcons.BinanceWallet,
        installed: true,
        downloadUrl: 'https://www.binance.org/en',
        provider: window.BinanceChain
      });
    }

    if (window.safepal) {
      console.log('✅ SafePal detected');
      wallets.push({
        name: 'SafePal',
        id: 'safepal',
        icon: WalletIcons.SafePal,
        installed: true,
        downloadUrl: 'https://safepal.io/download',
        provider: window.safepal.ethereum
      });
    }

    if (window.tokenpocket) {
      console.log('✅ TokenPocket detected');
      wallets.push({
        name: 'TokenPocket',
        id: 'tokenpocket',
        icon: WalletIcons.TokenPocket,
        installed: true,
        downloadUrl: 'https://tokenpocket.pro/en/download/app',
        provider: window.tokenpocket.ethereum
      });
    }

    if (window.ethereum?.isMathWallet) {
      console.log('✅ MathWallet detected');
      wallets.push({
        name: 'MathWallet',
        id: 'mathwallet',
        icon: WalletIcons.MathWallet,
        installed: true,
        downloadUrl: 'https://mathwallet.org/',
        provider: window.ethereum
      });
    }

    // Always add popular wallets for download if not installed
    const popularWallets = [
      { name: 'MetaMask', id: 'metamask', icon: WalletIcons.MetaMask, downloadUrl: 'https://metamask.io/download/' },
      { name: 'Trust Wallet', id: 'trust', icon: WalletIcons.TrustWallet, downloadUrl: 'https://trustwallet.com/download' },
      { name: 'Coinbase Wallet', id: 'coinbase', icon: WalletIcons.CoinbaseWallet, downloadUrl: 'https://wallet.coinbase.com/' }
    ];

    popularWallets.forEach(wallet => {
      if (!wallets.find(w => w.id === wallet.id)) {
        wallets.push({ ...wallet, installed: false });
      }
    });

    console.log('✅ Final detected wallets:', wallets);
    setAvailableWallets(wallets);
    setIsDetecting(false);
  }, []);

  // Enhanced detection with multiple attempts and timing
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 5;
    const detectInterval = 500; // ms

    const attemptDetection = () => {
      attempts++;
      console.log(`🔄 Wallet detection attempt ${attempts}/${maxAttempts}`);
      
      detectWallets();
      
      // If no wallets detected and we haven't reached max attempts, try again
      if (attempts < maxAttempts && (!window.ethereum || availableWallets.length === 0)) {
        setTimeout(attemptDetection, detectInterval);
      } else {
        setIsDetecting(false);
      }
    };

    // Start detection immediately
    attemptDetection();

    // Also listen for ethereum object injection
    const handleEthereumAvailable = () => {
      console.log('🔔 Ethereum became available, re-detecting...');
      setTimeout(detectWallets, 100);
    };

    // Listen for various events that might indicate wallet availability
    window.addEventListener('ethereum#initialized', handleEthereumAvailable);
    window.addEventListener('eip6963:announceProvider', handleEthereumAvailable);
    
    // For MetaMask specifically
    if (typeof window !== 'undefined') {
      const handleLoad = () => {
        console.log('🔄 Window loaded, final detection attempt...');
        setTimeout(detectWallets, 1000);
      };
      
      if (document.readyState === 'loading') {
        window.addEventListener('load', handleLoad);
      } else {
        // Document already loaded, do a delayed detection
        setTimeout(detectWallets, 1000);
      }
    }

    return () => {
      window.removeEventListener('ethereum#initialized', handleEthereumAvailable);
      window.removeEventListener('eip6963:announceProvider', handleEthereumAvailable);
      window.removeEventListener('load', detectWallets);
    };
  }, [detectWallets]);

  const switchToBSC = async (provider) => {
    try {
      console.log('🌐 Switching to BSC Mainnet...');
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_CONFIG.chainId }],
      });
      console.log('✅ Successfully switched to BSC');
    } catch (switchError) {
      console.log('⚠️ Switch failed, attempting to add BSC:', switchError);
      // If BSC is not added, add it
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_CONFIG],
          });
          console.log('✅ Successfully added and switched to BSC');
        } catch (addError) {
          console.error('❌ Failed to add BSC:', addError);
          throw new Error('Please add BSC Mainnet to your wallet manually');
        }
      } else {
        throw switchError;
      }
    }
  };

  const connectWallet = async (walletId) => {
    console.log(`🔗 Attempting to connect ${walletId}...`);
    setConnecting(true);
    setSelectedWallet(walletId);
    setError(null);

    try {
      // Find the wallet from our detected wallets
      const walletInfo = availableWallets.find(w => w.id === walletId);
      
      if (!walletInfo) {
        throw new Error(`Wallet ${walletId} not found`);
      }

      if (!walletInfo.installed) {
        // Wallet not installed, open download page
        window.open(walletInfo.downloadUrl, '_blank');
        throw new Error(`${walletInfo.name} is not installed. Please install it first.`);
      }

      // Use the specific provider for this wallet
      let provider = walletInfo.provider;

      if (!provider) {
        throw new Error(`${walletInfo.name} provider not available`);
      }

      console.log(`📱 Using provider for ${walletId}:`, {
        isMetaMask: provider.isMetaMask,
        isTrust: provider.isTrust,
        constructor: provider.constructor.name
      });

      // Enhanced MetaMask unlock check
      if ((walletId === 'metamask' || walletId === 'ethereum') && provider.isMetaMask) {
        try {
          // Multiple ways to check if MetaMask is unlocked
          if (provider._metamask && provider._metamask.isUnlocked) {
            const isUnlocked = await provider._metamask.isUnlocked();
            console.log('🔓 MetaMask unlock status:', isUnlocked);
            if (!isUnlocked) {
              throw new Error('MetaMask is locked. Please unlock your MetaMask wallet first.');
            }
          }

          // Alternative check: try to get accounts without requesting
          try {
            const existingAccounts = await provider.request({ method: 'eth_accounts' });
            if (existingAccounts.length === 0) {
              console.log('🔐 No existing accounts found, will need to request permission');
            } else {
              console.log('✅ Existing accounts found:', existingAccounts.length);
            }
          } catch (accountsError) {
            console.log('Could not check existing accounts:', accountsError);
          }
        } catch (unlockError) {
          console.log('Could not check MetaMask unlock status:', unlockError);
          // Continue anyway, as some versions don't support this method
        }
      }

      // Request account access with enhanced error handling
      console.log(`🔑 Requesting accounts for ${walletId}...`);
      
      let accounts;
      try {
        // Create a promise that will timeout
        const requestPromise = provider.request({ 
          method: 'eth_requestAccounts' 
        });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection request timed out after 60 seconds. Please check your wallet.')), 60000)
        );
        
        accounts = await Promise.race([requestPromise, timeoutPromise]);
      } catch (requestError) {
        console.error('❌ Account request failed:', requestError);
        
        // Enhanced error handling
        if (requestError.code === 4001) {
          throw new Error('Connection rejected. Please approve the connection in your wallet.');
        } else if (requestError.code === -32002) {
          throw new Error('Connection request already pending. Please check your wallet for a pending approval.');
        } else if (requestError.code === -32603) {
          throw new Error('Wallet internal error. Please try refreshing the page.');
        } else if (requestError.message.includes('timeout')) {
          throw new Error('Connection timed out. Please make sure your wallet is responsive and try again.');
        } else {
          throw requestError;
        }
      }

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please make sure your wallet is unlocked and has at least one account.');
      }

      console.log(`✅ Accounts received for ${walletId}:`, accounts.length, 'accounts');

      // Switch to BSC Mainnet
      console.log(`🌐 Switching to BSC Mainnet for ${walletId}...`);
      await switchToBSC(provider);

      // Create ethers provider with error handling
      let ethersProvider, signer, address;
      try {
        ethersProvider = new ethers.BrowserProvider(provider);
        signer = await ethersProvider.getSigner();
        address = await signer.getAddress();
      } catch (ethersError) {
        console.error('❌ Ethers provider creation failed:', ethersError);
        throw new Error('Failed to create wallet connection. Please try again.');
      }

      console.log(`🎉 Successfully connected ${walletId}:`, address);

      // Store wallet info in localStorage
      localStorage.setItem('orphi_wallet', JSON.stringify({
        type: walletId,
        address: address,
        connected: true,
        timestamp: Date.now()
      }));

      // Call parent callback
      if (onConnect) {
        onConnect({
          address,
          provider: ethersProvider,
          signer,
          walletType: walletId
        });
      }

      setShowModal(false);

    } catch (error) {
      console.error(`❌ Error connecting ${walletId}:`, error);
      
      let errorMessage = error.message;
      let userGuidance = '';
      
      if (error.code === 4001) {
        errorMessage = 'Connection rejected by user';
        userGuidance = 'Please click "Connect" in your wallet popup to continue.';
      } else if (error.code === -32002) {
        errorMessage = 'Connection request already pending';
        userGuidance = 'Please check your wallet - there may be a pending connection request waiting for approval.';
      } else if (error.code === -32603) {
        errorMessage = 'Wallet internal error';
        userGuidance = 'Please try refreshing the page and reconnecting.';
      } else if (error.message.includes('locked')) {
        errorMessage = 'Wallet is locked';
        userGuidance = 'Please unlock your wallet and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Connection timed out';
        userGuidance = 'Please try again. Make sure your wallet is unlocked and responsive.';
      } else if (error.message.includes('not installed')) {
        userGuidance = 'The wallet will open in a new tab for installation.';
      } else if (error.message.includes('rejected')) {
        errorMessage = 'Connection rejected';
        userGuidance = 'Please approve the connection request in your wallet.';
      }
      
      setError({ message: errorMessage, guidance: userGuidance });
      
      // Don't show alert for user rejection (code 4001) as it's intentional
      if (error.code !== 4001 && !error.message.includes('not installed')) {
        console.log(`Connection failed: ${errorMessage}${userGuidance ? ' - ' + userGuidance : ''}`);
      }
    } finally {
      setConnecting(false);
      setSelectedWallet(null);
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem('orphi_wallet');
    if (onDisconnect) {
      onDisconnect();
    }
    console.log('🔌 Wallet disconnected');
  };

  // Auto-reconnect on page load with better error handling
  useEffect(() => {
    const autoReconnect = async () => {
      const savedWallet = localStorage.getItem('orphi_wallet');
      if (savedWallet && !isConnected && !isDetecting) {
        try {
          const walletInfo = JSON.parse(savedWallet);
          // Check if connection is less than 24 hours old
          if (Date.now() - walletInfo.timestamp < 24 * 60 * 60 * 1000) {
            console.log('🔄 Auto-reconnecting wallet:', walletInfo.type);
            // Wait a bit more to ensure wallet detection is complete
            setTimeout(() => {
              if (availableWallets.some(w => w.id === walletInfo.type && w.installed)) {
                connectWallet(walletInfo.type);
              }
            }, 2000);
          } else {
            console.log('🗑️ Removing expired wallet connection');
            localStorage.removeItem('orphi_wallet');
          }
        } catch (error) {
          console.log('Auto-reconnect failed:', error);
          localStorage.removeItem('orphi_wallet');
        }
      }
    };

    // Only attempt auto-reconnect after wallet detection is complete
    if (!isDetecting) {
      autoReconnect();
    }
  }, [availableWallets, isConnected, isDetecting]);

  if (isConnected && currentAccount) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm text-silver-mist">Connected</p>
          <p className="text-xs font-mono text-cyber-blue">
            {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
          </p>
          <p className="text-xs text-success-green">BSC Mainnet ✅</p>
        </div>
        <div className="w-3 h-3 rounded-full bg-success-green animate-pulse"></div>
        <button 
          onClick={disconnectWallet}
          className="text-xs text-silver-mist hover:text-white transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="btn btn-primary"
        style={{
          background: 'linear-gradient(135deg, #00D4FF 0%, #7B2CBF 100%)',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '12px',
          color: 'white',
          fontWeight: '600',
          fontSize: '16px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.3)';
        }}
      >
        {isDetecting ? 'Detecting Wallets...' : 'Connect Wallet'}
      </button>

      {/* Wallet Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-deep-space border border-white/20 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Connect Wallet</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-silver-mist hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <p className="text-silver-mist text-sm mb-6">
              Connect your wallet to start using ORPHI CrowdFund platform
            </p>

            {/* Detection Status */}
            {isDetecting && (
              <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <p className="text-blue-400 text-sm">Detecting installed wallets...</p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm font-medium">{error.message}</p>
                {error.guidance && (
                  <p className="text-red-300 text-xs mt-1">{error.guidance}</p>
                )}
              </div>
            )}

            {/* No Wallets Detected Warning */}
            {!isDetecting && availableWallets.filter(w => w.installed).length === 0 && (
              <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <p className="text-orange-400 text-sm font-medium">No wallets detected!</p>
                <p className="text-orange-300 text-xs mt-1">
                  Please install a wallet like MetaMask first, then refresh this page.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {availableWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => wallet.installed ? connectWallet(wallet.id) : window.open(wallet.downloadUrl, '_blank')}
                  disabled={connecting && selectedWallet === wallet.id}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    wallet.installed 
                      ? 'border-white/20 hover:border-cyber-blue hover:bg-cyber-blue/10' 
                      : 'border-orange-500/50 hover:border-orange-500'
                  } ${connecting && selectedWallet === wallet.id ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div className="text-left">
                      <p className="text-white font-medium">{wallet.name}</p>
                      <p className="text-xs text-silver-mist">
                        {wallet.installed ? 'Detected ✅' : 'Not installed'}
                      </p>
                    </div>
                  </div>
                  
                  {connecting && selectedWallet === wallet.id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyber-blue"></div>
                  ) : wallet.installed ? (
                    <span className="text-cyber-blue">Connect</span>
                  ) : (
                    <span className="text-orange-500">Install</span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-royal-purple/10 rounded-xl border border-royal-purple/30">
              <p className="text-sm text-silver-mist">
                <span className="text-royal-purple">💡 Tip:</span> Make sure you're on BSC Mainnet. 
                The app will automatically switch networks if needed.
              </p>
            </div>

            {/* Enhanced Troubleshooting Tips */}
            <div className="mt-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
              <p className="text-sm text-yellow-400 font-medium mb-2">Having trouble connecting?</p>
              <ul className="text-xs text-yellow-300 space-y-1">
                <li>• Make sure MetaMask is unlocked and has accounts</li>
                <li>• Check for popup blockers in your browser</li>
                <li>• Try refreshing the page and reconnecting</li>
                <li>• Ensure you approve the connection in your wallet</li>
                <li>• Close other DApps that might be using your wallet</li>
                <li>• Switch to BSC Mainnet manually if auto-switch fails</li>
                <li>• Try disconnecting and reconnecting your wallet</li>
              </ul>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-silver-mist">
                New to crypto wallets?{' '}
                <a 
                  href="https://academy.binance.com/en/articles/how-to-use-metamask" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyber-blue hover:underline"
                >
                  Learn how to get started
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletConnector; 