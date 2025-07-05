/**
 * React Hook for Multi-Provider Web3 Service
 * Provides production-grade Web3 connectivity with automatic failover
 */

import { useState, useEffect, useCallback } from 'react';
import MultiProviderWeb3Service from '../services/MultiProviderWeb3Service';

export const useMultiProviderWeb3 = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [providerHealth, setProviderHealth] = useState(null);
  const [account, setAccount] = useState(null);

  // Initialize Web3 service
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await MultiProviderWeb3Service.init();

      if (success) {
        setIsConnected(true);

        // Get account if using MetaMask
        if (window.ethereum) {
          try {
            const accounts = await window.ethereum.request({
              method: 'eth_accounts',
            });
            if (accounts.length > 0) {
              setAccount(accounts[0]);
            }
          } catch (err) {
            console.warn('Failed to get MetaMask accounts:', err);
          }
        }

        // Get provider health status
        const health = MultiProviderWeb3Service.getProviderHealthStatus();
        setProviderHealth(health);
      } else {
        setError('Failed to initialize Web3 service');
      }
    } catch (err) {
      console.error('Web3 initialization error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connect to MetaMask
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not found. Please install MetaMask.');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);

        // Re-initialize with wallet connection
        await initialize();
        return true;
      }

      return false;
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [initialize]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setError(null);
  }, []);

  // Get user information with failover
  const getUserInfo = useCallback(
    async userAddress => {
      if (!isConnected) {
        throw new Error('Web3 service not connected');
      }

      try {
        return await MultiProviderWeb3Service.getUserInfo(userAddress);
      } catch (err) {
        console.error('getUserInfo error:', err);
        throw err;
      }
    },
    [isConnected]
  );

  // Execute contract function with failover
  const executeContract = useCallback(
    async operation => {
      if (!isConnected) {
        throw new Error('Web3 service not connected');
      }

      try {
        return await MultiProviderWeb3Service.executeWithFailover(operation);
      } catch (err) {
        console.error('Contract execution error:', err);
        throw err;
      }
    },
    [isConnected]
  );

  // Check provider health
  const checkProviderHealth = useCallback(async () => {
    try {
      const health = await MultiProviderWeb3Service.forceHealthCheck();
      setProviderHealth(health);
      return health;
    } catch (err) {
      console.error('Health check error:', err);
      throw err;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = accounts => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = () => {
        // Reload page on chain change for now
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged
        );
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [disconnectWallet]);

  return {
    // Connection state
    isConnected,
    isLoading,
    error,
    account,

    // Provider health
    providerHealth,

    // Actions
    connectWallet,
    disconnectWallet,
    getUserInfo,
    executeContract,
    checkProviderHealth,
    initialize,

    // Service instance for advanced usage
    service: MultiProviderWeb3Service,
  };
};
