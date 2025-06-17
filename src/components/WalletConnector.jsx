import React, { useState, useEffect } from 'react';
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

  // Enhanced wallet detection
  useEffect(() => {
    const detectWallets = () => {
      const wallets = [];
      
      console.log('🔍 Detecting wallets...', {
        ethereum: !!window.ethereum,
        isMetaMask: window.ethereum?.isMetaMask,
        isTrust: window.ethereum?.isTrust,
        providers: window.ethereum?.providers
      });

      // Check for multiple providers first
      if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
        // Multiple wallet providers detected
        window.ethereum.providers.forEach(provider => {
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
        if (window.ethereum.isMetaMask) {
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
          // Generic ethereum provider
          wallets.push({
            name: 'Injected Wallet',
            id: 'injected',
            icon: '💳',
            installed: true,
            downloadUrl: null,
            provider: window.ethereum
          });
        }
      }

      // Check for other specific wallet providers
      if (window.BinanceChain) {
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

      console.log('✅ Detected wallets:', wallets);
      setAvailableWallets(wallets);
    };

    detectWallets();
    
    // Re-detect when window loads and ethereum object changes
    const handleEthereumChange = () => {
      console.log('🔄 Ethereum object changed, re-detecting wallets...');
      setTimeout(detectWallets, 100);
    };

    if (document.readyState === 'loading') {
      window.addEventListener('load', detectWallets);
    }
    
    // Listen for ethereum object changes
    if (window.ethereum) {
      window.ethereum.on('connect', handleEthereumChange);
      window.ethereum.on('disconnect', handleEthereumChange);
    }

    return () => {
      window.removeEventListener('load', detectWallets);
      if (window.ethereum) {
        window.ethereum.removeListener('connect', handleEthereumChange);
        window.ethereum.removeListener('disconnect', handleEthereumChange);
      }
    };
  }, []);

  const switchToBSC = async (provider) => {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_CONFIG.chainId }],
      });
    } catch (switchError) {
      // If BSC is not added, add it
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_CONFIG],
          });
        } catch (addError) {
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
      let provider = null;
      let accounts = [];

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
      provider = walletInfo.provider;

      if (!provider) {
        throw new Error(`${walletInfo.name} provider not available`);
      }

      console.log(`📱 Using provider for ${walletId}:`, provider);

      // Special handling for MetaMask unlock check
      if (walletId === 'metamask' && provider.isMetaMask) {
        try {
          // Check if MetaMask is unlocked (if method exists)
          if (provider._metamask && provider._metamask.isUnlocked) {
            const isUnlocked = await provider._metamask.isUnlocked();
            if (!isUnlocked) {
              throw new Error('MetaMask is locked. Please unlock your MetaMask wallet first.');
            }
          }
        } catch (unlockError) {
          console.log('Could not check MetaMask unlock status:', unlockError);
          // Continue anyway, as some versions don't support this method
        }
      }

      // Request account access
      console.log(`🔑 Requesting accounts for ${walletId}...`);
      
      // Add timeout for the request
      const requestPromise = provider.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection request timed out. Please try again.')), 30000)
      );
      
      accounts = await Promise.race([requestPromise, timeoutPromise]);

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please make sure your wallet is unlocked and has at least one account.');
      }

      console.log(`✅ Accounts received for ${walletId}:`, accounts);

      // Switch to BSC Mainnet
      console.log(`🌐 Switching to BSC Mainnet for ${walletId}...`);
      await switchToBSC(provider);

      // Create ethers provider
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();

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
        errorMessage = 'Pending connection request';
        userGuidance = 'Please check your wallet - there may be a pending connection request waiting for approval.';
      } else if (error.code === -32603) {
        errorMessage = 'Internal wallet error';
        userGuidance = 'Please try refreshing the page and reconnecting.';
      } else if (error.message.includes('locked')) {
        errorMessage = 'Wallet is locked';
        userGuidance = 'Please unlock your wallet and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Connection timed out';
        userGuidance = 'Please try again. Make sure your wallet is unlocked and responsive.';
      } else if (error.message.includes('not installed')) {
        userGuidance = 'The wallet will open in a new tab for installation.';
      }
      
      setError({ message: errorMessage, guidance: userGuidance });
      
      // Don't show alert for user rejection (code 4001) as it's intentional
      if (error.code !== 4001 && !error.message.includes('not installed')) {
        alert(`Failed to connect ${walletId}: ${errorMessage}${userGuidance ? '\n\n' + userGuidance : ''}`);
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

  // Auto-reconnect on page load
  useEffect(() => {
    const autoReconnect = async () => {
      const savedWallet = localStorage.getItem('orphi_wallet');
      if (savedWallet && !isConnected) {
        try {
          const walletInfo = JSON.parse(savedWallet);
          // Check if connection is less than 24 hours old
          if (Date.now() - walletInfo.timestamp < 24 * 60 * 60 * 1000) {
            console.log('🔄 Auto-reconnecting wallet:', walletInfo.type);
            await connectWallet(walletInfo.type);
          } else {
            localStorage.removeItem('orphi_wallet');
          }
        } catch (error) {
          console.log('Auto-reconnect failed:', error);
          localStorage.removeItem('orphi_wallet');
        }
      }
    };

    // Delay auto-reconnect to ensure wallets are detected first
    const timeoutId = setTimeout(autoReconnect, 1000);
    return () => clearTimeout(timeoutId);
  }, [availableWallets, isConnected]);

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
        Connect Wallet
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

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm font-medium">{error.message}</p>
                {error.guidance && (
                  <p className="text-red-300 text-xs mt-1">{error.guidance}</p>
                )}
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
                        {wallet.installed ? 'Detected' : 'Not installed'}
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

            {/* Troubleshooting Tips */}
            <div className="mt-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
              <p className="text-sm text-yellow-400 font-medium mb-2">Having trouble connecting?</p>
              <ul className="text-xs text-yellow-300 space-y-1">
                <li>• Make sure your wallet is unlocked</li>
                <li>• Check for popup blockers</li>
                <li>• Try refreshing the page</li>
                <li>• Ensure you approve the connection in your wallet</li>
                <li>• Close other DApps that might be using your wallet</li>
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