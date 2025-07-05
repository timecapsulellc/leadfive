/**
 * Mobile Wallet Connection Hook
 * Handles mobile-specific wallet connection issues
 * Supports MetaMask Mobile, Trust Wallet, and other mobile wallets
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Mobile wallet detection
const detectMobileWallet = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  if (!isMobile) return { isMobile: false, wallet: null };

  // Check for MetaMask Mobile
  if (window.ethereum?.isMetaMask) {
    return { isMobile: true, wallet: 'metamask', deepLink: 'https://metamask.app.link/dapp/' };
  }

  // Check for Trust Wallet
  if (window.ethereum?.isTrust) {
    return { isMobile: true, wallet: 'trust', deepLink: 'https://link.trustwallet.com/open_url?coin_id=20000714&url=' };
  }

  // Check for WalletConnect
  if (window.ethereum?.isWalletConnect) {
    return { isMobile: true, wallet: 'walletconnect', deepLink: null };
  }

  // Generic mobile browser (might need deep linking)
  return { isMobile: true, wallet: 'unknown', deepLink: null };
};

// Generate deep link for mobile wallets
const generateDeepLink = (walletType, dappUrl) => {
  const encodedUrl = encodeURIComponent(dappUrl);
  
  switch (walletType) {
    case 'metamask':
      return `https://metamask.app.link/dapp/${window.location.hostname}`;
    case 'trust':
      return `https://link.trustwallet.com/open_url?coin_id=20000714&url=${encodedUrl}`;
    case 'tokenpocket':
      return `tpoutside://open?param=${encodedUrl}`;
    case 'safepal':
      return `https://safepal.com/dapp?url=${encodedUrl}`;
    default:
      return null;
  }
};

// Mobile-optimized provider setup
const createMobileProvider = async () => {
  try {
    // Wait for mobile wallet injection
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!window.ethereum && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.ethereum) {
      throw new Error('No wallet provider found');
    }

    // Create provider with mobile-specific configuration
    const provider = new ethers.BrowserProvider(window.ethereum, {
      name: 'BSC Mainnet',
      chainId: 56,
      pollingInterval: 4000, // Slower polling for mobile
    });

    return provider;
  } catch (error) {
    console.error('Mobile provider creation failed:', error);
    throw error;
  }
};

// Main mobile wallet hook
export const useMobileWallet = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [mobileInfo, setMobileInfo] = useState({ isMobile: false, wallet: null });
  const [error, setError] = useState(null);

  // Initialize mobile detection
  useEffect(() => {
    const info = detectMobileWallet();
    setMobileInfo(info);
    
    // Mobile-specific initialization
    if (info.isMobile) {
      console.log('Mobile wallet environment detected:', info.wallet);
      
      // Extended timeout for mobile wallet injection
      if (!window.ethereum) {
        setTimeout(() => {
          const recheckInfo = detectMobileWallet();
          setMobileInfo(recheckInfo);
        }, 2000);
      }
    }
  }, []);

  // Mobile wallet connection function
  const connectMobileWallet = useCallback(async () => {
    if (!mobileInfo.isMobile) {
      console.log('Not a mobile environment, skipping mobile wallet connection');
      return null;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Check if we're in a mobile wallet browser
      if (!window.ethereum) {
        const deepLink = generateDeepLink(mobileInfo.wallet, window.location.href);
        if (deepLink) {
          // Redirect to mobile wallet
          window.location.href = deepLink;
          return null;
        } else {
          throw new Error('Please open this page in your mobile wallet browser');
        }
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const selectedAccount = accounts[0];

      // Check network
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      // Switch to BSC Mainnet if needed
      if (chainId !== '0x38') {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }],
          });
        } catch (switchError) {
          // Try to add BSC Mainnet
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x38',
                chainName: 'BNB Smart Chain Mainnet',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18,
                },
                rpcUrls: ['https://bsc-dataseed1.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com/'],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Create mobile provider
      const mobileProvider = await createMobileProvider();
      const mobileSigner = await mobileProvider.getSigner();

      // Verify connection
      const signerAddress = await mobileSigner.getAddress();
      if (signerAddress.toLowerCase() !== selectedAccount.toLowerCase()) {
        throw new Error('Address mismatch after connection');
      }

      setAccount(selectedAccount);
      setProvider(mobileProvider);
      setSigner(mobileSigner);

      console.log('Mobile wallet connected successfully:', selectedAccount);
      return { account: selectedAccount, provider: mobileProvider, signer: mobileSigner };

    } catch (error) {
      console.error('Mobile wallet connection failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [mobileInfo]);

  // Disconnect function
  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setError(null);
    console.log('Mobile wallet disconnected');
  }, []);

  // Auto-reconnect on mobile
  useEffect(() => {
    if (mobileInfo.isMobile && window.ethereum) {
      // Check for existing connection
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts && accounts.length > 0) {
            // Auto-reconnect if already connected
            connectMobileWallet().catch(error => {
              console.log('Auto-reconnection failed (expected on desktop):', error);
            });
          }
        })
        .catch(error => {
          console.log('Error checking existing accounts (expected on desktop):', error);
        });
    }
  }, [mobileInfo, connectMobileWallet]);

  // Handle mobile-specific events
  useEffect(() => {
    if (!window.ethereum || !mobileInfo.isMobile) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== account) {
        // Account changed, reconnect
        connectMobileWallet().catch(error => {
          console.error('Failed to handle account change:', error);
        });
      }
    };

    const handleChainChanged = (chainId) => {
      console.log('Chain changed on mobile:', chainId);
      // Reload page on chain change for mobile stability
      if (chainId !== '0x38') {
        window.location.reload();
      }
    };

    const handleDisconnect = () => {
      disconnect();
    };

    // Mobile-specific event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    // Mobile apps often trigger these events differently
    window.addEventListener('focus', () => {
      // Check connection status when app regains focus
      if (account) {
        window.ethereum.request({ method: 'eth_accounts' })
          .then(accounts => {
            if (!accounts || accounts.length === 0 || accounts[0] !== account) {
              disconnect();
            }
          })
          .catch(() => disconnect());
      }
    });

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    };
  }, [account, mobileInfo.isMobile, connectMobileWallet, disconnect]);

  return {
    // State
    isConnecting,
    account,
    provider,
    signer,
    error,
    isMobile: mobileInfo.isMobile,
    walletType: mobileInfo.wallet,
    
    // Actions
    connect: connectMobileWallet,
    disconnect,
    
    // Utilities
    generateDeepLink: (walletType) => generateDeepLink(walletType, window.location.href),
    canConnect: mobileInfo.isMobile && (window.ethereum || mobileInfo.deepLink),
  };
};

export default useMobileWallet;