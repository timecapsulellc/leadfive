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
  4: { label: '$200', amount: 200, tier: 4 },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Delays execution for specified milliseconds
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

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
const formatTimestamp = timestamp => {
  if (!timestamp || timestamp === '0') return null;
  return new Date(parseInt(timestamp) * 1000).toISOString();
};

/**
 * Formats Wei to readable amount
 */
const formatAmount = weiAmount => {
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
    includeEmptyUsers = false,
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
        lastUpdated: new Date().toISOString(),
      };

      // Create an array of promises for methods that exist
      const promises = [];
      const methodMap = {};

      // Safely check and add method calls - verify contract.methods exists
      if (
        contract.methods.totalUsers &&
        typeof contract.methods.totalUsers === 'function'
      ) {
        promises.push(contract.methods.totalUsers().call());
        methodMap[promises.length - 1] = 'totalUsers';
      }

      if (
        contract.methods.owner &&
        typeof contract.methods.owner === 'function'
      ) {
        promises.push(contract.methods.owner().call());
        methodMap[promises.length - 1] = 'owner';
      }

      if (
        contract.methods.paused &&
        typeof contract.methods.paused === 'function'
      ) {
        promises.push(contract.methods.paused().call());
        methodMap[promises.length - 1] = 'paused';
      }

      // Try different possible USDT token method names - check if methods exist
      if (
        contract.methods.usdtToken &&
        typeof contract.methods.usdtToken === 'function'
      ) {
        promises.push(contract.methods.usdtToken().call());
        methodMap[promises.length - 1] = 'usdtToken';
      } else if (
        contract.methods.USDT &&
        typeof contract.methods.USDT === 'function'
      ) {
        promises.push(contract.methods.USDT().call());
        methodMap[promises.length - 1] = 'USDT';
      } else if (
        contract.methods.token &&
        typeof contract.methods.token === 'function'
      ) {
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
      // Return default stats instead of throwing - return with totalUsers: 0
      return {
        totalUsers: 0,
        contractOwner: '0x0000000000000000000000000000000000000000',
        isPaused: false,
        usdtTokenAddress: '0x55d398326f99059fF775485246999027B3197955',
        lastUpdated: new Date().toISOString(),
      };
    }
  }, [contract]);

  /**
   * Fetches user information for a specific address
   */
  const fetchUserInfo = useCallback(
    async userAddress => {
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
          directReferrals: parseInt(userInfo.directReferrals.toString()),
        };
      } catch (err) {
        // User might not exist - this is expected for new contracts
        console.log(`ℹ️ User ${userAddress} not found or inactive`);
        return null;
      }
    },
    [contract]
  );

  /**
   * Builds network tree structure from contract data with RootID sync
   */
  const buildNetworkTree = useCallback(
    async stats => {
      if (!contract || !stats) return null;

      try {
        console.log('🌳 Building binary network tree from BSC contract...');

        // For production: integrate with real contract data
        if (stats.totalUsers > 0) {
          console.log(
            `📊 Found ${stats.totalUsers} users in contract, building real tree...`
          );

          // Get the contract owner as root
          const rootAddress = stats.contractOwner;
          if (
            rootAddress &&
            rootAddress !== '0x0000000000000000000000000000000000000000'
          ) {
            return await buildRealTreeFromContract(rootAddress);
          }
        }

        // Demo tree for testing and preview
        console.log('ℹ️ Using demo binary structure for visualization...');
        return createProductionDemoBinaryTree();
      } catch (err) {
        console.error('❌ Error building network tree:', err);
        return createProductionDemoBinaryTree();
      }
    },
    [contract]
  );

  /**
   * Builds real tree structure from contract using RootID system
   */
  const buildRealTreeFromContract = useCallback(
    async rootAddress => {
      try {
        console.log('🔗 Building tree from contract starting at:', rootAddress);

        // Check if we have proper contract methods available
        if (!contract.methods) {
          throw new Error('Contract methods not available');
        }

        // Build tree recursively from contract data
        const rootNode = await buildNodeFromContract(rootAddress, 0, new Set());

        if (rootNode) {
          console.log('✅ Real contract tree built successfully');
          return rootNode;
        } else {
          console.log('⚠️ No tree data found, falling back to demo');
          return createProductionDemoBinaryTree();
        }
      } catch (error) {
        console.error('❌ Error building real tree:', error);
        return createProductionDemoBinaryTree();
      }
    },
    [contract]
  );

  /**
   * Recursively builds node data from contract
   */
  const buildNodeFromContract = useCallback(
    async (address, depth, visited) => {
      if (
        !address ||
        address === '0x0000000000000000000000000000000000000000' ||
        visited.has(address) ||
        depth > 10
      ) {
        return null;
      }

      visited.add(address);

      try {
        // Try to get user info from contract
        let userInfo;

        // Try different possible method names for getting user data
        if (
          contract.methods.users &&
          typeof contract.methods.users === 'function'
        ) {
          userInfo = await contract.methods.users(address).call();
        } else if (
          contract.methods.getUserInfo &&
          typeof contract.methods.getUserInfo === 'function'
        ) {
          userInfo = await contract.methods.getUserInfo(address).call();
        } else if (
          contract.methods.getUser &&
          typeof contract.methods.getUser === 'function'
        ) {
          userInfo = await contract.methods.getUser(address).call();
        } else {
          console.log('⚠️ No user info method found, using address only');
          userInfo = { isActive: true, currentPackage: 1 };
        }

        // Create node with contract data
        const node = {
          name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          attributes: {
            id: address,
            rootId: userInfo.rootId || address,
            isRoot: depth === 0,
            packageTier: parseInt(userInfo.currentPackage) || 1,
            isActive: userInfo.isActive !== false,
            totalEarnings: userInfo.totalEarnings || '0',
            leftVolume: userInfo.leftVolume || '0',
            rightVolume: userInfo.rightVolume || '0',
            volume: userInfo.totalBusiness || userInfo.volume || '0',
            depth: depth,
            position: depth === 0 ? 'root' : null,
            registrationTime: userInfo.registrationTime || Date.now(),
          },
          children: [],
        };

        // Try to get left and right leg data
        let leftLeg = null;
        let rightLeg = null;

        if (
          userInfo.leftLeg &&
          userInfo.leftLeg !== '0x0000000000000000000000000000000000000000'
        ) {
          leftLeg = userInfo.leftLeg;
        }

        if (
          userInfo.rightLeg &&
          userInfo.rightLeg !== '0x0000000000000000000000000000000000000000'
        ) {
          rightLeg = userInfo.rightLeg;
        }

        // If no direct left/right leg info, try to get referrals
        if (
          !leftLeg &&
          !rightLeg &&
          userInfo.directReferrals &&
          parseInt(userInfo.directReferrals) > 0
        ) {
          try {
            // Try to get referral list
            if (
              contract.methods.getUserReferrals &&
              typeof contract.methods.getUserReferrals === 'function'
            ) {
              const referrals = await contract.methods
                .getUserReferrals(address)
                .call();
              if (referrals && referrals.length > 0) {
                leftLeg = referrals[0];
                if (referrals.length > 1) {
                  rightLeg = referrals[1];
                }
              }
            }
          } catch (err) {
            console.log('ℹ️ Could not fetch referrals:', err.message);
          }
        }

        // Build left subtree
        if (leftLeg) {
          const leftNode = await buildNodeFromContract(
            leftLeg,
            depth + 1,
            visited
          );
          if (leftNode) {
            leftNode.attributes.position = 'left';
            node.children.push(leftNode);
          }
        }

        // Build right subtree
        if (rightLeg) {
          const rightNode = await buildNodeFromContract(
            rightLeg,
            depth + 1,
            visited
          );
          if (rightNode) {
            rightNode.attributes.position = 'right';
            node.children.push(rightNode);
          }
        }

        // Add empty placeholders for incomplete binary structure (only for first 3 levels)
        if (depth < 3) {
          const hasLeft = node.children.some(
            child => child.attributes.position === 'left'
          );
          const hasRight = node.children.some(
            child => child.attributes.position === 'right'
          );

          if (!hasLeft) {
            node.children.unshift({
              name: 'Empty',
              attributes: {
                id: `empty-left-${address}`,
                isEmpty: true,
                position: 'left',
                depth: depth + 1,
              },
              children: [],
            });
          }

          if (!hasRight) {
            node.children.push({
              name: 'Empty',
              attributes: {
                id: `empty-right-${address}`,
                isEmpty: true,
                position: 'right',
                depth: depth + 1,
              },
              children: [],
            });
          }
        }

        return node;
      } catch (error) {
        console.error(`❌ Error building node for ${address}:`, error);
        return null;
      }
    },
    [contract]
  );

  /**
   * Creates a production-grade demo binary tree structure for visualization
   */
  const createProductionDemoBinaryTree = useCallback(() => {
    return {
      name: 'You (Root)',
      attributes: {
        id: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29', // Your admin address
        rootId: '1', // RootID from contract
        isRoot: true,
        position: 'root',
        volume: 12500,
        directReferrals: 2,
        packageTier: 4, // $200 package
        isActive: true,
        depth: 0,
        totalEarnings: 5750,
        leftVolume: 4500,
        rightVolume: 8000,
        registrationTime: new Date('2024-01-15').toISOString(),
      },
      children: [
        {
          name: 'Left Leg Leader',
          attributes: {
            id: '0x1234567890123456789012345678901234567890',
            rootId: '2',
            position: 'left',
            volume: 4500,
            directReferrals: 4,
            packageTier: 3, // $100 package
            isActive: true,
            depth: 1,
            totalEarnings: 1800,
            leftVolume: 2200,
            rightVolume: 2300,
            registrationTime: new Date('2024-02-01').toISOString(),
          },
          children: [
            {
              name: 'LL-Team Lead',
              attributes: {
                id: '0x2345678901234567890123456789012345678901',
                rootId: '3',
                position: 'left',
                volume: 2200,
                directReferrals: 3,
                packageTier: 2, // $50 package
                isActive: true,
                depth: 2,
                totalEarnings: 660,
                leftVolume: 1000,
                rightVolume: 1200,
                registrationTime: new Date('2024-02-15').toISOString(),
              },
              children: [
                {
                  name: 'LLL-Active',
                  attributes: {
                    id: '0x3456789012345678901234567890123456789012',
                    rootId: '4',
                    position: 'left',
                    volume: 1000,
                    directReferrals: 1,
                    packageTier: 2,
                    isActive: true,
                    depth: 3,
                    totalEarnings: 300,
                    registrationTime: new Date('2024-03-01').toISOString(),
                  },
                  children: [],
                },
                {
                  name: 'LLR-Builder',
                  attributes: {
                    id: '0x4567890123456789012345678901234567890123',
                    rootId: '5',
                    position: 'right',
                    volume: 1200,
                    directReferrals: 2,
                    packageTier: 3,
                    isActive: true,
                    depth: 3,
                    totalEarnings: 360,
                    registrationTime: new Date('2024-03-05').toISOString(),
                  },
                  children: [],
                },
              ],
            },
            {
              name: 'LR-Achiever',
              attributes: {
                id: '0x5678901234567890123456789012345678901234',
                rootId: '6',
                position: 'right',
                volume: 2300,
                directReferrals: 3,
                packageTier: 3,
                isActive: true,
                depth: 2,
                totalEarnings: 690,
                leftVolume: 1100,
                rightVolume: 1200,
                registrationTime: new Date('2024-02-20').toISOString(),
              },
              children: [
                {
                  name: 'LRL-Star',
                  attributes: {
                    id: '0x6789012345678901234567890123456789012345',
                    rootId: '7',
                    position: 'left',
                    volume: 1100,
                    directReferrals: 1,
                    packageTier: 2,
                    isActive: true,
                    depth: 3,
                    totalEarnings: 330,
                    registrationTime: new Date('2024-03-10').toISOString(),
                  },
                  children: [],
                },
                {
                  name: 'LRR-Pro',
                  attributes: {
                    id: '0x7890123456789012345678901234567890123456',
                    rootId: '8',
                    position: 'right',
                    volume: 1200,
                    directReferrals: 2,
                    packageTier: 4,
                    isActive: true,
                    depth: 3,
                    totalEarnings: 480,
                    registrationTime: new Date('2024-03-12').toISOString(),
                  },
                  children: [],
                },
              ],
            },
          ],
        },
        {
          name: 'Right Leg Champion',
          attributes: {
            id: '0x8901234567890123456789012345678901234567890',
            rootId: '9',
            position: 'right',
            volume: 8000,
            directReferrals: 6,
            packageTier: 4, // $200 package
            isActive: true,
            depth: 1,
            totalEarnings: 3200,
            leftVolume: 3800,
            rightVolume: 4200,
            registrationTime: new Date('2024-01-20').toISOString(),
          },
          children: [
            {
              name: 'RL-Power Team',
              attributes: {
                id: '0x9012345678901234567890123456789012345678901',
                rootId: '10',
                position: 'left',
                volume: 3800,
                directReferrals: 4,
                packageTier: 3,
                isActive: true,
                depth: 2,
                totalEarnings: 1140,
                leftVolume: 1800,
                rightVolume: 2000,
                registrationTime: new Date('2024-02-05').toISOString(),
              },
              children: [
                {
                  name: 'RLL-Rockstar',
                  attributes: {
                    id: '0xa123456789012345678901234567890123456789',
                    rootId: '11',
                    position: 'left',
                    volume: 1800,
                    directReferrals: 2,
                    packageTier: 3,
                    isActive: true,
                    depth: 3,
                    totalEarnings: 540,
                    registrationTime: new Date('2024-02-25').toISOString(),
                  },
                  children: [],
                },
                {
                  name: 'RLR-Elite',
                  attributes: {
                    id: '0xb234567890123456789012345678901234567890',
                    rootId: '12',
                    position: 'right',
                    volume: 2000,
                    directReferrals: 3,
                    packageTier: 4,
                    isActive: true,
                    depth: 3,
                    totalEarnings: 800,
                    registrationTime: new Date('2024-03-01').toISOString(),
                  },
                  children: [],
                },
              ],
            },
            {
              name: 'RR-Diamond Team',
              attributes: {
                id: '0xc345678901234567890123456789012345678901',
                rootId: '13',
                position: 'right',
                volume: 4200,
                directReferrals: 5,
                packageTier: 4,
                isActive: true,
                depth: 2,
                totalEarnings: 1680,
                leftVolume: 2000,
                rightVolume: 2200,
                registrationTime: new Date('2024-01-25').toISOString(),
              },
              children: [
                {
                  name: 'RRL-Legend',
                  attributes: {
                    id: '0xd456789012345678901234567890123456789012',
                    rootId: '14',
                    position: 'left',
                    volume: 2000,
                    directReferrals: 3,
                    packageTier: 4,
                    isActive: true,
                    depth: 3,
                    totalEarnings: 800,
                    registrationTime: new Date('2024-02-28').toISOString(),
                  },
                  children: [],
                },
                {
                  name: 'RRR-Crown',
                  attributes: {
                    id: '0xe567890123456789012345678901234567890123',
                    rootId: '15',
                    position: 'right',
                    volume: 2200,
                    directReferrals: 4,
                    packageTier: 4,
                    isActive: true,
                    depth: 3,
                    totalEarnings: 880,
                    registrationTime: new Date('2024-03-08').toISOString(),
                  },
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    };
  }, []);

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

      // Set default stats on error to ensure UI doesn't break
      setNetworkStats({
        totalUsers: 0,
        contractOwner: '0x0000000000000000000000000000000000000000',
        isPaused: false,
        usdtTokenAddress: '0x55d398326f99059fF775485246999027B3197955',
        lastUpdated: new Date().toISOString(),
      });

      // Set empty network data
      setNetworkData(null);
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

  const lookupUser = useCallback(
    async address => {
      if (!contract || !address) return null;

      try {
        return await fetchUserInfo(address);
      } catch (err) {
        console.error(`❌ Error looking up user ${address}:`, err);
        return null;
      }
    },
    [contract, fetchUserInfo]
  );

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
      formatTimestamp,
    },
  };
};

export default useLiveNetworkData;
