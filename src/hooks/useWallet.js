import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';

// BSC Mainnet configuration
const BSC_MAINNET_CONFIG = {
  chainId: '0x38', // 56 in decimal
  chainName: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
};

const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [network, setNetwork] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [error, setError] = useState(null);

  // Check if already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        try {
          const web3Provider = new BrowserProvider(window.ethereum);
          const web3Signer = await web3Provider.getSigner();
          const address = await web3Signer.getAddress();
          const chainId = await window.ethereum.request({
            method: 'eth_chainId',
          });

          setAccount(address);
          setProvider(web3Provider);
          setSigner(web3Signer);
          setNetwork(chainId);
          setIsConnected(true);
        } catch (err) {
          console.error('Failed to restore connection:', err);
        }
      }
    };

    checkConnection();

    // Set up event listeners
    if (window.ethereum) {
      const handleAccountsChanged = accounts => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = chainId => {
        setNetwork(chainId);
        // Optionally reload to avoid state issues
        // window.location.reload();
      };

      const handleDisconnect = () => {
        disconnectWallet();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

      return () => {
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged
        );
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      };
    }
  }, [account]);

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError(
        'No Web3 wallet detected. Please install MetaMask or another Web3 wallet.'
      );
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts returned');
      }

      // Check and switch to BSC network if needed
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== BSC_MAINNET_CONFIG.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BSC_MAINNET_CONFIG.chainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [BSC_MAINNET_CONFIG],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Create provider and signer
      const web3Provider = new BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const address = await web3Signer.getAddress();

      setAccount(address);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setNetwork(BSC_MAINNET_CONFIG.chainId);
      setIsConnected(true);
    } catch (err) {
      console.error('Wallet connection failed:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet function
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setNetwork(null);
    setIsConnected(false);
    setError(null);
  }, []);

  // Handle connection from external component
  const handleConnect = useCallback(
    (walletAccount, walletProvider, walletSigner) => {
      setAccount(walletAccount);
      setProvider(walletProvider);
      setSigner(walletSigner);
      setIsConnected(true);
      setError(null);
    },
    []
  );

  // Handle disconnection from external component
  const handleDisconnect = useCallback(() => {
    disconnectWallet();
  }, [disconnectWallet]);

  // Handle errors from external component
  const handleError = useCallback(errorMessage => {
    setError(errorMessage);
  }, []);

  // Get network name
  const getNetworkName = useCallback(() => {
    if (!network) return null;

    switch (network) {
      case '0x38':
        return 'BSC Mainnet';
      case '0x61':
        return 'BSC Testnet';
      case '0x1':
        return 'Ethereum Mainnet';
      default:
        return `Chain ${parseInt(network, 16)}`;
    }
  }, [network]);

  // Check if on correct network
  const isCorrectNetwork = useCallback(() => {
    return network === BSC_MAINNET_CONFIG.chainId;
  }, [network]);

  return {
    // State
    account,
    isConnecting,
    isConnected,
    network,
    provider,
    signer,
    error,

    // Functions
    connectWallet,
    disconnectWallet,
    handleConnect,
    handleDisconnect,
    handleError,

    // Utilities
    getNetworkName,
    isCorrectNetwork,
  };
};

export default useWallet;
