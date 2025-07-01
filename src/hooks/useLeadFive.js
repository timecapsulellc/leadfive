import { useState, useEffect, useCallback } from 'react';
import walletService from '../services/WalletService.js';
import contractService from '../services/ContractService.js';
import dataService from '../services/DataService.js';

/**
 * 🔗 USE LEAD FIVE HOOK
 * Custom React hook that manages wallet connection, contract interactions,
 * and real-time data updates for the Lead Five platform
 */
export function useLeadFive() {
  // Wallet state
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [walletType, setWalletType] = useState(null);
  
  // Application state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  
  // Real-time state
  const [realtimeEarnings, setRealtimeEarnings] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);

  /**
   * Initialize services and check for existing connection
   */
  useEffect(() => {
    const initializeServices = async () => {
      try {
        await walletService.initialize();
        
        // Set up wallet event listeners
        const removeListener = walletService.addEventListener(handleWalletEvent);
        
        return () => {
          removeListener();
        };
      } catch (error) {
        console.error('Failed to initialize services:', error);
        setError('Failed to initialize wallet services');
      }
    };

    initializeServices();
  }, []);

  /**
   * Handle wallet events (connect, disconnect, account change, etc.)
   */
  const handleWalletEvent = useCallback(async (event, data) => {
    switch (event) {
      case 'connected':
        setIsConnected(true);
        setAccount(data.account);
        setChainId(data.chainId);
        setWalletType(data.walletType);
        setProvider(walletService.provider);
        await loadUserData(data.account);
        break;
        
      case 'disconnected':
        setIsConnected(false);
        setAccount(null);
        setProvider(null);
        setChainId(null);
        setWalletType(null);
        setDashboardData(null);
        setIsRegistered(false);
        setRealtimeEarnings(null);
        setLiveEvents([]);
        setAchievements([]);
        break;
        
      case 'accountChanged':
        setAccount(data.account);
        await loadUserData(data.account);
        break;
        
      case 'wrongNetwork':
        setError('Please switch to BSC Mainnet (Chain ID: 56)');
        break;
        
      case 'networkChanged':
        setError(null);
        break;
        
      default:
        console.log('Unknown wallet event:', event);
    }
  }, []);

  /**
   * Connect wallet with specified type
   */
  const connectWallet = useCallback(async (walletType = 'metamask') => {
    setIsLoading(true);
    setError(null);
    
    try {
      await walletService.connectWallet(walletType);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(async () => {
    try {
      await walletService.disconnect();
    } catch (error) {
      console.error('Wallet disconnect failed:', error);
      setError(error.message);
    }
  }, []);

  /**
   * Load user data from blockchain
   */
  const loadUserData = useCallback(async (userAccount) => {
    if (!userAccount) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is registered
      const registered = await contractService.isUserRegistered(userAccount);
      setIsRegistered(registered);
      
      if (registered) {
        // Initialize data service
        await dataService.initialize();
        
        // Load complete dashboard data
        const data = await dataService.getUserDashboardData(userAccount);
        setDashboardData(data);
        
        // Load real-time earnings
        const earnings = await dataService.getRealtimeEarnings(userAccount);
        setRealtimeEarnings(earnings);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      setError('Failed to load user data from blockchain');
      
      // Temporary fallback: Allow dashboard access even if contract calls fail
      // This ensures users can see the interface while contract integration is being fixed
      if (error.message.includes('contract runner does not support calling') || 
          error.message.includes('could not decode result data')) {
        console.log('⚠️ Contract call failed, allowing dashboard access with fallback data');
        setIsRegistered(true); // Allow dashboard access
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register user with sponsor and package
   */
  const registerUser = useCallback(async (sponsorAddress, packageTier) => {
    if (!isConnected || !account) {
      throw new Error('Wallet not connected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const transaction = await contractService.registerUser(sponsorAddress, packageTier);
      
      // Wait for transaction confirmation
      const receipt = await transaction.wait();
      
      // Reload user data after successful registration
      await loadUserData(account);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, loadUserData]);

  /**
   * Process withdrawal
   */
  const withdraw = useCallback(async (amount) => {
    if (!isConnected || !account) {
      throw new Error('Wallet not connected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const transaction = await contractService.withdraw(amount);
      
      // Wait for transaction confirmation
      const receipt = await transaction.wait();
      
      // Reload user data after successful withdrawal
      await loadUserData(account);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        amount: amount
      };
    } catch (error) {
      console.error('Withdrawal failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, loadUserData]);

  /**
   * Upgrade package
   */
  const upgradePackage = useCallback(async (newTier) => {
    if (!isConnected || !account) {
      throw new Error('Wallet not connected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const transaction = await contractService.upgradePackage(newTier);
      
      // Wait for transaction confirmation
      const receipt = await transaction.wait();
      
      // Reload user data after successful upgrade
      await loadUserData(account);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        newTier: newTier
      };
    } catch (error) {
      console.error('Package upgrade failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, loadUserData]);

  /**
   * Refresh data manually
   */
  const refreshData = useCallback(async () => {
    if (account && isRegistered) {
      await loadUserData(account);
    }
  }, [account, isRegistered, loadUserData]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Get connection status
   */
  const getConnectionStatus = useCallback(() => {
    return walletService.getConnectionStatus();
  }, []);

  /**
   * Add real-time event to live feed
   */
  const addLiveEvent = useCallback((event) => {
    setLiveEvents(prev => [event, ...prev.slice(0, 49)]);
  }, []);

  /**
   * Add achievement
   */
  const addAchievement = useCallback((achievement) => {
    setAchievements(prev => [achievement, ...prev.slice(0, 9)]);
  }, []);

  // Return hook interface
  return {
    // Wallet state
    isConnected,
    account,
    provider,
    chainId,
    walletType,
    
    // Application state
    isLoading,
    error,
    dashboardData,
    isRegistered,
    
    // Real-time state
    realtimeEarnings,
    liveEvents,
    achievements,
    
    // Actions
    connectWallet,
    disconnectWallet,
    registerUser,
    withdraw,
    upgradePackage,
    refreshData,
    clearError,
    addLiveEvent,
    addAchievement,
    
    // Utilities
    getConnectionStatus
  };
}

export default useLeadFive;
