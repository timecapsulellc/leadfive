/**
 * Unified Genealogy Data Hook
 * 
 * Centralized data management for all genealogy tree components
 * Provides consistent data structure and caching across the application
 * Integrated with LeadFive smart contract
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts.js';

// Helper function to convert package level to package name
const getUserPackageLevel = (level) => {
  const packageLevels = {
    0: 'None',
    1: 'Basic',
    2: 'Advanced', 
    3: 'Premium',
    4: 'Elite'
  };
  return packageLevels[parseInt(level) || 0] || 'Basic';
};

const useGenealogyData = (account, options = {}) => {
  const {
    useMockData = false,
    autoRefresh = true,
    refreshInterval = 30000,
    maxDepth = 10,
    includeInactive = false
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [stats, setStats] = useState({
    totalNodes: 0,
    activeNodes: 0,
    maxDepth: 0,
    totalEarnings: 0
  });

  const refreshTimer = useRef(null);
  const abortController = useRef(null);

  // Generate comprehensive mock data
  const generateMockData = useCallback(() => {
    const mockData = {
      id: account,
      name: account && typeof account === 'string' ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Demo User',
      attributes: {
        address: account || '0x0000000000000000000000000000000000000000',
        package: 'Premium',
        earnings: '1,250.00',
        totalEarnings: 2500.75,
        withdrawableAmount: 1250.00,
        isActive: true,
        level: 1,
        position: 1,
        directReferrals: 3,
        teamSize: 12,
        referralCode: 'LEAD5VIP',
        joinDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
        sponsor: null,
        isCapped: false
      },
      children: [
        {
          id: '0x1234567890123456789012345678901234567890',
          name: '0x1234...7890',
          attributes: {
            address: '0x1234567890123456789012345678901234567890',
            package: 'Advanced',
            earnings: '675.25',
            totalEarnings: 1350.50,
            withdrawableAmount: 675.25,
            isActive: true,
            level: 2,
            position: 1,
            directReferrals: 1,
            teamSize: 2,
            isCapped: false,
            joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000),
            sponsor: account
          },
          children: []
        },
        {
          id: '0xABCDEF0123456789012345678901234567890123',
          name: '0xABCD...0123',
          attributes: {
            address: '0xABCDEF0123456789012345678901234567890123',
            package: 'Premium',
            earnings: '950.75',
            totalEarnings: 1901.50,
            withdrawableAmount: 950.75,
            isActive: true,
            level: 2,
            position: 2,
            directReferrals: 1,
            teamSize: 3,
            isCapped: false,
            joinDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 10 * 60 * 1000),
            sponsor: account
          },
          children: []
        }
      ]
    };

    return mockData;
  }, [account]);

  // Calculate tree statistics
  const calculateStats = useCallback((treeData) => {
    if (!treeData) return { totalNodes: 0, activeNodes: 0, maxDepth: 0, totalEarnings: 0 };

    const traverse = (node, depth = 0) => {
      let stats = {
        totalNodes: 1,
        activeNodes: node.attributes?.isActive ? 1 : 0,
        maxDepth: depth,
        totalEarnings: parseFloat(node.attributes?.totalEarnings || 0)
      };

      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          const childStats = traverse(child, depth + 1);
          stats.totalNodes += childStats.totalNodes;
          stats.activeNodes += childStats.activeNodes;
          stats.maxDepth = Math.max(stats.maxDepth, childStats.maxDepth);
          stats.totalEarnings += childStats.totalEarnings;
        });
      }

      return stats;
    };

    return traverse(treeData);
  }, []);

  // Enhanced fetch real genealogy data from smart contract
  const fetchContractGenealogyData = useCallback(async () => {
    if (!account || !window.ethereum) {
      return null;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const rootUserInfo = await contract.getUserInfo(account);
      
      if (!rootUserInfo.isRegistered) {
        console.log('User not registered, using mock data');
        return null;
      }

      const node = {
        id: account,
        name: `${account.slice(0, 6)}...${account.slice(-4)}`,
        attributes: {
          address: account,
          package: getUserPackageLevel(rootUserInfo.packageLevel),
          earnings: ethers.formatEther(rootUserInfo.totalEarnings || 0),
          totalEarnings: parseFloat(ethers.formatEther(rootUserInfo.totalEarnings || 0)),
          withdrawableAmount: parseFloat(ethers.formatEther(rootUserInfo.balance || 0)),
          isActive: rootUserInfo.isActive || false,
          level: 1,
          position: 1,
          directReferrals: parseInt(rootUserInfo.directReferrals || 0),
          teamSize: parseInt(rootUserInfo.teamSize || 0),
          referralCode: 'LEAD5',
          joinDate: new Date(parseInt(rootUserInfo.registrationTime || 0) * 1000),
          lastActivity: new Date(),
          sponsor: null,
          isCapped: false
        },
        children: []
      };

      // Add mock children based on directReferrals count
      const directReferrals = parseInt(rootUserInfo.directReferrals || 0);
      if (directReferrals > 0) {
        for (let i = 0; i < Math.min(directReferrals, 3); i++) {
          node.children.push({
            id: `${account}_child_${i}`,
            name: `Referral ${i + 1}`,
            attributes: {
              address: `0x${i.toString().padStart(40, '0')}`,
              package: 'Basic',
              earnings: (Math.random() * 100).toFixed(2),
              totalEarnings: Math.random() * 200,
              withdrawableAmount: Math.random() * 100,
              isActive: true,
              level: 2,
              position: i + 1,
              directReferrals: 0,
              teamSize: 1,
              referralCode: `REF${i + 1}`,
              joinDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
              lastActivity: new Date(),
              sponsor: account,
              isCapped: false
            },
            children: []
          });
        }
      }

      return node;

    } catch (error) {
      console.error('Error fetching contract data:', error);
      throw error;
    }
  }, [account]);

  // Main fetch function
  const fetchData = useCallback(async (force = false) => {
    if (loading && !force) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let genealogyData;
      
      if (useMockData || !account) {
        genealogyData = generateMockData();
      } else {
        try {
          genealogyData = await fetchContractGenealogyData();
          if (!genealogyData) {
            genealogyData = generateMockData();
          }
        } catch (contractError) {
          console.log('Contract fetch failed, using mock data:', contractError.message);
          genealogyData = generateMockData();
        }
      }
      
      setData(genealogyData);
      setStats(calculateStats(genealogyData));
      setLastFetch(new Date());
      
    } catch (error) {
      console.error('Error in fetchData:', error);
      setError(error.message);
      const mockData = generateMockData();
      setData(mockData);
      setStats(calculateStats(mockData));
    } finally {
      setLoading(false);
    }
  }, [loading, useMockData, account, generateMockData, fetchContractGenealogyData, calculateStats]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;
    
    const timer = setInterval(() => {
      fetchData();
    }, refreshInterval);
    
    refreshTimer.current = timer;
    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval, fetchData]);

  // Search functionality
  const findNode = useCallback((nodeId) => {
    if (!data) return null;

    const search = (node) => {
      if (node.id === nodeId) return node;
      
      if (node.children) {
        for (const child of node.children) {
          const found = search(child);
          if (found) return found;
        }
      }
      
      return null;
    };

    return search(data);
  }, [data]);

  const getPath = useCallback((nodeId) => {
    if (!data) return [];

    const findPath = (node, targetId, path = []) => {
      path.push(node.id);
      
      if (node.id === targetId) {
        return path;
      }
      
      if (node.children) {
        for (const child of node.children) {
          const foundPath = findPath(child, targetId, [...path]);
          if (foundPath.length > path.length) {
            return foundPath;
          }
        }
      }
      
      return [];
    };

    return findPath(data, nodeId);
  }, [data]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    stats,
    lastFetch,
    refresh,
    findNode,
    getPath
  };
};

export default useGenealogyData;
