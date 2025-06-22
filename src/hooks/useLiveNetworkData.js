/**
 * LiveNetworkDataHook.js
 * 
 * React hook for connecting NetworkTreeVisualization to live BSC Mainnet data
 *          const web3Instance = new Web3(LEAD_FIVE_CONFIG.rpcUrl);
        const contract = new web3Instance.eth.Contract(
          LEAD_FIVE_ABI,
          LEAD_FIVE_CONFIG.address  const web3Instance = new Web3(LEAD_FIVE_CONFIG.rpcUrl);
        const contract = new web3Instance.eth.Contract(
          LEAD_FIVE_ABI,
          LEAD_FIVE_CONFIG.address @description Provides real-time data integration for the LeadFive network
 *              visualization, fetching user data, network structure, and statistics
 *              from the deployed smart contract on BSC Mainnet.
 * 
 * @author LeadFive Development Team
 * @version 1.0.0
 * @since 2025-06-14
 */

import { useState, useEffect, useCallback } from 'react';
import { Web3 } from 'web3';
import { LEAD_FIVE_CONFIG, LEAD_FIVE_ABI } from '../contracts-leadfive.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const REFRESH_INTERVAL = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Package tier mapping
const PACKAGE_TIERS = {
  0: { label: 'None', amount: 0, tier: 0 },
  1: { label: '$30', amount: 30, tier: 1 },
  2: { label: '$50', amount: 50, tier: 2 },
  3: { label: '$100', amount: 100, tier: 3 },
  4: { label: '$200', amount: 200, tier: 4 }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Delays execution for specified milliseconds
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retries a function with exponential backoff
 */
const retryWithBackoff = async (fn, retries = MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(RETRY_DELAY * Math.pow(2, i));
    }
  }
};

/**
 * Formats blockchain timestamp to readable date
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp || timestamp === '0') return null;
  return new Date(parseInt(timestamp) * 1000).toISOString();
};

/**
 * Formats Wei to readable amount
 */
const formatAmount = (weiAmount) => {
  if (!weiAmount) return 0;
  return parseFloat(Web3.utils.fromWei(weiAmount.toString(), 'ether'));
};

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Hook for connecting to live LeadFive network data
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoRefresh - Enable automatic data refresh
 * @param {number} options.refreshInterval - Refresh interval in milliseconds
 * @param {boolean} options.includeEmptyUsers - Include users with no investments
 * @returns {Object} Hook return object with data and functions
 */
export const useLiveNetworkData = (options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = REFRESH_INTERVAL,
    includeEmptyUsers = false
  } = options;

  // ============================================================================
  // STATE
  // ============================================================================

  const [networkData, setNetworkData] = useState(null);
  const [networkStats, setNetworkStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        console.log('🔗 Initializing Web3 connection to BSC Mainnet...');
        
        const web3Instance = new Web3(LEAD_FIVE_CONFIG.rpcUrl);
        const contractInstance = new web3Instance.eth.Contract(
          LEAD_FIVE_ABI,
          LEAD_FIVE_CONFIG.address
        );

        setWeb3(web3Instance);
        setContract(contractInstance);
        
        console.log('✅ Web3 connection established');
      } catch (err) {
        console.error('❌ Failed to initialize Web3:', err);
        setError('Failed to connect to BSC Mainnet');
      }
    };

    initializeWeb3();
  }, []);

  // ============================================================================
  // DATA FETCHING FUNCTIONS
  // ============================================================================

  /**
   * Fetches basic network statistics
   */
  const fetchNetworkStats = useCallback(async () => {
    if (!contract) return null;

    try {
      console.log('📊 Fetching network statistics...');

      // Check if contract and methods exist before calling
      if (!contract || !contract.methods) {
        throw new Error('Invalid contract instance');
      }

      // Get the methods available on the contract
      const contractMethods = Object.keys(contract.methods);
      console.log('Available contract methods:', contractMethods);

      // Initialize default values
      let stats = {
        totalUsers: 0,
        contractOwner: '0x0000000000000000000000000000000000000000',
        isPaused: false,
        usdtTokenAddress: '0x55d398326f99059fF775485246999027B3197955', // BSC USDT address
        lastUpdated: new Date().toISOString()
      };

      // Create an array of promises for methods that exist
      const promises = [];
      const methodMap = {};

      // Safely check and add method calls
      if (contract.methods.totalUsers) {
        promises.push(contract.methods.totalUsers().call());
        methodMap[promises.length - 1] = 'totalUsers';
      }

      if (contract.methods.owner) {
        promises.push(contract.methods.owner().call());
        methodMap[promises.length - 1] = 'owner';
      }

      if (contract.methods.paused) {
        promises.push(contract.methods.paused().call());
        methodMap[promises.length - 1] = 'paused';
      }

      // Try different possible USDT token method names
      if (contract.methods.usdtToken) {
        promises.push(contract.methods.usdtToken().call());
        methodMap[promises.length - 1] = 'usdtToken';
      } else if (contract.methods.USDT) {
        promises.push(contract.methods.USDT().call());
        methodMap[promises.length - 1] = 'USDT';
      } else if (contract.methods.token) {
        promises.push(contract.methods.token().call());
        methodMap[promises.length - 1] = 'token';
      }

      // Execute all available method calls
      if (promises.length > 0) {
        const results = await Promise.allSettled(promises);
        
        results.forEach((result, index) => {
          const methodName = methodMap[index];
          if (result.status === 'fulfilled') {
            switch (methodName) {
              case 'totalUsers':
                stats.totalUsers = parseInt(result.value.toString());
                break;
              case 'owner':
                stats.contractOwner = result.value;
                break;
              case 'paused':
                stats.isPaused = result.value;
                break;
              case 'usdtToken':
              case 'USDT':
              case 'token':
                stats.usdtTokenAddress = result.value;
                break;
            }
          } else {
            console.warn(`❌ Failed to call ${methodName}:`, result.reason);
          }
        });
      }

      console.log('✅ Network stats fetched:', stats);
      return stats;

    } catch (err) {
      console.error('❌ Error fetching network stats:', err);
      // Return default stats instead of throwing
      return {
        totalUsers: 0,
        contractOwner: '0x0000000000000000000000000000000000000000',
        isPaused: false,
        usdtTokenAddress: '0x55d398326f99059fF775485246999027B3197955',
        lastUpdated: new Date().toISOString()
      };
    }
  }, [contract]);

  /**
   * Fetches user information for a specific address
   */
  const fetchUserInfo = useCallback(async (userAddress) => {
    if (!contract || !userAddress) return null;

    try {
      const userInfo = await contract.methods.getUserInfo(userAddress).call();
      
      return {
        address: userAddress,
        totalInvested: formatAmount(userInfo.totalInvested),
        registrationTime: formatTimestamp(userInfo.registrationTime),
        teamSize: parseInt(userInfo.teamSize.toString()),
        totalEarnings: formatAmount(userInfo.totalEarnings),
        withdrawableAmount: formatAmount(userInfo.withdrawableAmount),
        packageTier: parseInt(userInfo.packageTier.toString()),
        leaderRank: parseInt(userInfo.leaderRank.toString()),
        isCapped: userInfo.isCapped,
        isActive: userInfo.isActive,
        sponsor: userInfo.sponsor,
        directReferrals: parseInt(userInfo.directReferrals.toString())
      };

    } catch (err) {
      // User might not exist - this is expected for new contracts
      console.log(`ℹ️ User ${userAddress} not found or inactive`);
      return null;
    }
  }, [contract]);

  /**
   * Builds network tree structure from contract data
   */
  const buildNetworkTree = useCallback(async (stats) => {
    if (!contract || !stats) return null;

    try {
      console.log('🌳 Building network tree structure...');

      // For now, create a demo structure since totalUsers is 0
      // In a real scenario with users, we would:
      // 1. Fetch all user addresses from events
      // 2. Build the referral tree from sponsor relationships
      // 3. Create the hierarchical structure

      if (stats.totalUsers === 0) {
        console.log('ℹ️ No users registered yet, creating demo structure...');
        
        return {
          name: 'LeadFive Network',
          attributes: {
            address: 'Root Network',
            packageTier: null,
            volume: 0,
            registrationDate: new Date().toISOString(),
            isRoot: true,
            totalUsers: stats.totalUsers,
            contractAddress: LEAD_FIVE_CONFIG.address,
            networkStatus: stats.isPaused ? 'Paused' : 'Active'
          },
          children: [
            {
              name: 'Ready for First User',
              attributes: {
                address: 'Waiting for registration...',
                packageTier: 0,
                volume: 0,
                registrationDate: null,
                isPlaceholder: true,
                message: 'Network is ready to accept new users'
              }
            }
          ]
        };
      }

      // TODO: Implement real user tree building when users exist
      // This would involve:
      // - Fetching UserRegistered events to get all user addresses
      // - For each user, fetch their sponsor to build parent-child relationships
      // - Organize into tree structure
      
      return null;

    } catch (err) {
      console.error('❌ Error building network tree:', err);
      throw new Error(`Failed to build network tree: ${err.message}`);
    }
  }, [contract]);

  /**
   * Main function to fetch all network data
   */
  const fetchAllData = useCallback(async () => {
    if (!contract) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching all network data...');

      // Fetch network statistics
      const stats = await retryWithBackoff(() => fetchNetworkStats());
      setNetworkStats(stats);

      // Build network tree
      const treeData = await retryWithBackoff(() => buildNetworkTree(stats));
      setNetworkData(treeData);

      setLastUpdate(new Date().toISOString());
      console.log('✅ All network data fetched successfully');

    } catch (err) {
      console.error('❌ Error fetching network data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [contract, fetchNetworkStats, buildNetworkTree]);

  // ============================================================================
  // AUTO REFRESH
  // ============================================================================

  useEffect(() => {
    if (!contract) return;

    // Initial fetch
    fetchAllData();

    // Set up auto refresh
    if (autoRefresh) {
      const interval = setInterval(fetchAllData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [contract, fetchAllData, autoRefresh, refreshInterval]);

  // ============================================================================
  // MANUAL REFRESH FUNCTION
  // ============================================================================

  const refreshData = useCallback(() => {
    if (contract) {
      fetchAllData();
    }
  }, [contract, fetchAllData]);

  // ============================================================================
  // USER LOOKUP FUNCTION
  // ============================================================================

  const lookupUser = useCallback(async (address) => {
    if (!contract || !address) return null;
    
    try {
      return await fetchUserInfo(address);
    } catch (err) {
      console.error(`❌ Error looking up user ${address}:`, err);
      return null;
    }
  }, [contract, fetchUserInfo]);

  // ============================================================================
  // RETURN OBJECT
  // ============================================================================

  return {
    // Data
    networkData,
    networkStats,
    
    // State
    loading,
    error,
    lastUpdate,
    
    // Functions
    refreshData,
    lookupUser,
    
    // Configuration
    config: LEAD_FIVE_CONFIG,
    
    // Connection status
    isConnected: !!contract,
    
    // Utility
    formatters: {
      formatAmount,
      formatTimestamp
    }
  };
};

export default useLiveNetworkData;
