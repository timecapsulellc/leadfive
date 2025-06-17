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

  // Detect available wallets
  useEffect(() => {
    const detectWallets = () => {
      const wallets = [];

      // MetaMask
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
        wallets.push({
          name: 'MetaMask',
          id: 'metamask',
          icon: WalletIcons.MetaMask,
          installed: true,
          downloadUrl: 'https://metamask.io/download/'
        });
      }

      // Trust Wallet
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isTrust) {
        wallets.push({
          name: 'Trust Wallet',
          id: 'trust',
          icon: WalletIcons.TrustWallet,
          installed: true,
          downloadUrl: 'https://trustwallet.com/download'
        });
      }

      // Binance Chain Wallet
      if (typeof window.BinanceChain !== 'undefined') {
        wallets.push({
          name: 'Binance Wallet',
          id: 'binance',
          icon: WalletIcons.BinanceWallet,
          installed: true,
          downloadUrl: 'https://www.binance.org/en'
        });
      }

      // SafePal
      if (typeof window.safepal !== 'undefined') {
        wallets.push({
          name: 'SafePal',
          id: 'safepal',
          icon: WalletIcons.SafePal,
          installed: true,
          downloadUrl: 'https://safepal.io/download'
        });
      }

      // TokenPocket
      if (typeof window.tokenpocket !== 'undefined') {
        wallets.push({
          name: 'TokenPocket',
          id: 'tokenpocket',
          icon: WalletIcons.TokenPocket,
          installed: true,
          downloadUrl: 'https://tokenpocket.pro/en/download/app'
        });
      }

      // MathWallet
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isMathWallet) {
        wallets.push({
          name: 'MathWallet',
          id: 'mathwallet',
          icon: WalletIcons.MathWallet,
          installed: true,
          downloadUrl: 'https://mathwallet.org/'
        });
      }

      // Generic Ethereum provider (for other wallets)
      if (typeof window.ethereum !== 'undefined' && wallets.length === 0) {
        wallets.push({
          name: 'Injected Wallet',
          id: 'injected',
          icon: '💳',
          installed: true,
          downloadUrl: null
        });
      }

      // WalletConnect (always available)
      wallets.push({
        name: 'WalletConnect',
        id: 'walletconnect',
        icon: WalletIcons.WalletConnect,
        installed: true,
        downloadUrl: 'https://walletconnect.com/'
      });

      // Add popular wallets even if not installed (for download links)
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

      setAvailableWallets(wallets);
    };

    detectWallets();
    
    // Re-detect when window loads
    if (document.readyState === 'loading') {
      window.addEventListener('load', detectWallets);
      return () => window.removeEventListener('load', detectWallets);
    }
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
    setConnecting(true);
    setSelectedWallet(walletId);

    try {
      let provider = null;
      let accounts = [];

      switch (walletId) {
        case 'metamask':
          if (!window.ethereum?.isMetaMask) {
            throw new Error('MetaMask not installed');
          }
          provider = window.ethereum;
          accounts = await provider.request({ method: 'eth_requestAccounts' });
          break;

        case 'trust':
          if (!window.ethereum?.isTrust) {
            throw new Error('Trust Wallet not installed');
          }
          provider = window.ethereum;
          accounts = await provider.request({ method: 'eth_requestAccounts' });
          break;

        case 'binance':
          if (!window.BinanceChain) {
            throw new Error('Binance Chain Wallet not installed');
          }
          provider = window.BinanceChain;
          accounts = await provider.request({ method: 'eth_requestAccounts' });
          break;

        case 'safepal':
          if (!window.safepal) {
            throw new Error('SafePal Wallet not installed');
          }
          provider = window.safepal.ethereum;
          accounts = await provider.request({ method: 'eth_requestAccounts' });
          break;

        case 'tokenpocket':
          if (!window.tokenpocket) {
            throw new Error('TokenPocket not installed');
          }
          provider = window.tokenpocket.ethereum;
          accounts = await provider.request({ method: 'eth_requestAccounts' });
          break;

        case 'mathwallet':
          if (!window.ethereum?.isMathWallet) {
            throw new Error('MathWallet not installed');
          }
          provider = window.ethereum;
          accounts = await provider.request({ method: 'eth_requestAccounts' });
          break;

        case 'walletconnect':
          // For now, redirect WalletConnect users to install a mobile wallet
          // This provides better UX than failing with project ID error
          const walletOptions = [
            { name: 'Trust Wallet', url: 'https://trustwallet.com/download' },
            { name: 'MetaMask Mobile', url: 'https://metamask.io/download/' },
            { name: 'SafePal', url: 'https://safepal.io/download' },
            { name: 'Binance Wallet', url: 'https://www.binance.org/en' }
          ];
          
          const message = `WalletConnect requires additional setup. For now, please install one of these mobile wallets:\n\n${walletOptions.map(w => `• ${w.name}`).join('\n')}\n\nThen connect directly using the wallet's browser or scan QR codes from their apps.`;
          
          if (confirm(message + '\n\nWould you like to visit Trust Wallet download page?')) {
            window.open('https://trustwallet.com/download', '_blank');
          }
          
          // Try to detect if any wallet is available as fallback
          if (window.ethereum) {
            provider = window.ethereum;
            accounts = await provider.request({ method: 'eth_requestAccounts' });
          } else {
            throw new Error('Please install a wallet app first');
          }
          break;

        case 'injected':
        default:
          if (!window.ethereum) {
            throw new Error('No wallet detected');
          }
          provider = window.ethereum;
          accounts = await provider.request({ method: 'eth_requestAccounts' });
          break;
      }

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Switch to BSC Mainnet
      await switchToBSC(provider);

      // Create ethers provider
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();

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
      console.log(`✅ ${walletId} connected:`, address);

    } catch (error) {
      console.error(`❌ Error connecting ${walletId}:`, error);
      
      let errorMessage = error.message;
      if (error.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (error.code === -32002) {
        errorMessage = 'Please check your wallet - there may be a pending connection request';
      }
      
      alert(`Failed to connect ${walletId}: ${errorMessage}`);
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
      if (savedWallet) {
        try {
          const walletInfo = JSON.parse(savedWallet);
          // Check if connection is less than 24 hours old
          if (Date.now() - walletInfo.timestamp < 24 * 60 * 60 * 1000) {
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

    if (!isConnected) {
      autoReconnect();
    }
  }, []);

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