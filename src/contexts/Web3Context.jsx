import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserProvider, JsonRpcProvider } from 'ethers';
import { toast } from 'react-toastify';
import { ORPHI_CROWDFUND_CONFIG } from '../contracts';

const Web3Context = createContext(undefined);

// BSC Mainnet Configuration
const BSC_MAINNET = {
  chainId: 56,
  chainName: 'BSC Mainnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: [
    'https://bsc-dataseed.binance.org/',
    'https://bsc-dataseed1.defibit.io/',
    'https://bsc-dataseed1.ninicoin.io/',
  ],
  blockExplorerUrls: ['https://bscscan.com/'],
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('disconnected');
  const [fallbackProvider, setFallbackProvider] = useState(null);

  // Initialize fallback provider for read-only operations
  useEffect(() => {
    const initializeFallbackProvider = () => {
      try {
        const provider = new JsonRpcProvider(BSC_MAINNET.rpcUrls[0]);
        setFallbackProvider(provider);
        console.log('✅ Fallback provider initialized');
      } catch (error) {
        console.error('❌ Failed to initialize fallback provider:', error);
      }
    };

    initializeFallbackProvider();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask to use this application');
      return;
    }

    try {
      setIsConnecting(true);
      setNetworkStatus('connecting');

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);

      setProvider(provider);
      setAccount(accounts[0]);
      setChainId(currentChainId);
      setNetworkStatus('connected');

      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setNetworkStatus('error');
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setChainId(null);
    setNetworkStatus('disconnected');
    toast.info('Wallet disconnected');
  };

  const getProvider = () => {
    return provider || fallbackProvider;
  };

  const isCorrectNetwork = () => {
    return chainId === BSC_MAINNET.chainId;
  };

  const getNetworkName = () => {
    switch (chainId) {
      case 56: return 'BSC Mainnet';
      case 97: return 'BSC Testnet';
      case 1: return 'Ethereum Mainnet';
      default: return `Unknown Network (${chainId})`;
    }
  };

  // Handle wallet events
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          toast.info('Account changed');
        }
      };

      const handleChainChanged = (chainId) => {
        const newChainId = Number(chainId);
        setChainId(newChainId);
        
        if (newChainId === BSC_MAINNET.chainId) {
          toast.success('Switched to BSC Mainnet');
          setNetworkStatus('connected');
        } else {
          toast.warning('Please switch to BSC Mainnet for full functionality');
          setNetworkStatus('wrong-network');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check if already connected
      const checkConnection = async () => {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const provider = new BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            
            setAccount(accounts[0]);
            setProvider(provider);
            setChainId(Number(network.chainId));
            setNetworkStatus(Number(network.chainId) === BSC_MAINNET.chainId ? 'connected' : 'wrong-network');
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      };

      checkConnection();

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const value = {
    account,
    provider,
    chainId,
    isConnecting,
    isConnected: !!account,
    networkStatus,
    fallbackProvider,
    connectWallet,
    disconnectWallet,
    getProvider,
    isCorrectNetwork,
    getNetworkName,
    BSC_MAINNET,
  };

  return React.createElement(Web3Context.Provider, { value }, children);
};
