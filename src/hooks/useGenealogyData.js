/**
 * Unified Genealogy Data Hook
 * 
 * Centralized data management for all genealogy tree components
 * Provides consistent data structure and caching across the application
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import Web3Service from '../services/Web3Service';

const useGenealogyData = (account, options = {}) => {
  const {
    useMockData = false,
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
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
        isCapped: false,
        joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
        packageHistory: ['Basic', 'Advanced', 'Premium'],
        achievements: ['First Sale', 'Team Builder', 'Top Performer']
      },
      children: [
        {
          id: '0x1234567890123456789012345678901234567890',
          name: '0x1234...7890',
          attributes: {
            address: '0x1234567890123456789012345678901234567890',
            package: 'Advanced',
            earnings: '875.50',
            totalEarnings: 1750.25,
            withdrawableAmount: 875.50,
            isActive: true,
            level: 2,
            position: 2,
            directReferrals: 2,
            teamSize: 6,
            isCapped: false,
            joinDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000),
            sponsor: account
          },
          children: [
            {
              id: '0x5678901234567890123456789012345678901234',
              name: '0x5678...1234',
              attributes: {
                address: '0x5678901234567890123456789012345678901234',
                package: 'Basic',
                earnings: '320.25',
                totalEarnings: 640.50,
                withdrawableAmount: 320.25,
                isActive: true,
                level: 3,
                position: 4,
                directReferrals: 1,
                teamSize: 2,
                isCapped: false,
                joinDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
                lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
                sponsor: '0x1234567890123456789012345678901234567890'
              },
              children: [
                {
                  id: '0x9ABCDEF0123456789012345678901234567890AB',
                  name: '0x9ABC...90AB',
                  attributes: {
                    address: '0x9ABCDEF0123456789012345678901234567890AB',
                    package: 'Basic',
                    earnings: '150.00',
                    totalEarnings: 300.00,
                    withdrawableAmount: 150.00,
                    isActive: true,
                    level: 4,
                    position: 8,
                    directReferrals: 0,
                    teamSize: 1,
                    isCapped: false,
                    joinDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                    lastActivity: new Date(Date.now() - 30 * 60 * 1000),
                    sponsor: '0x5678901234567890123456789012345678901234'
                  },
                  children: []
                }
              ]
            },
            {
              id: 'inactive_user_1',
              name: '0xDEAD...BEEF',
              attributes: {
                address: '0xDEADBEEF123456789012345678901234567890',
                package: 'Basic',
                earnings: '0.00',
                totalEarnings: 0,
                withdrawableAmount: 0,
                isActive: false,
                level: 3,
                position: 5,
                directReferrals: 0,
                teamSize: 1,
                isCapped: true,
                joinDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
                lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                sponsor: '0x1234567890123456789012345678901234567890'
              },
              children: []
            }
          ]
        },
        {
          id: '0xABCDEF0123456789012345678901234567890123',
          name: '0xABCD...0123',
          attributes: {
            address: '0xABCDEF0123456789012345678901234567890123',
            package: 'Premium',
            earnings: '1,340.75',
            totalEarnings: 2681.50,
            withdrawableAmount: 1340.75,
            isActive: true,
            level: 2,
            position: 3,
            directReferrals: 3,
            teamSize: 5,
            isCapped: false,
            joinDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
            sponsor: account
          },
          children: [
            {
              id: '0xFEDCBA0987654321098765432109876543210987',
              name: '0xFEDC...0987',
              attributes: {
                address: '0xFEDCBA0987654321098765432109876543210987',
                package: 'Advanced',
                earnings: '520.00',
                totalEarnings: 1040.00,
                withdrawableAmount: 520.00,
                isActive: true,
                level: 3,
                position: 6,
                directReferrals: 2,
                teamSize: 3,
                isCapped: false,
                joinDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
                lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
                sponsor: '0xABCDEF0123456789012345678901234567890123'
              },
              children: [
                {
                  id: '0x1111111111111111111111111111111111111111',
                  name: '0x1111...1111',
                  attributes: {
                    address: '0x1111111111111111111111111111111111111111',
                    package: 'Basic',
                    earnings: '180.50',
                    totalEarnings: 361.00,
                    withdrawableAmount: 180.50,
                    isActive: true,
                    level: 4,
                    position: 12,
                    directReferrals: 0,
                    teamSize: 1,
                    isCapped: false,
                    joinDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
                    lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
                    sponsor: '0xFEDCBA0987654321098765432109876543210987'
                  },
                  children: []
                },
                {
                  id: '0x2222222222222222222222222222222222222222',
                  name: '0x2222...2222',
                  attributes: {
                    address: '0x2222222222222222222222222222222222222222',
                    package: 'Advanced',
                    earnings: '425.75',
                    totalEarnings: 851.50,
                    withdrawableAmount: 425.75,
                    isActive: true,
                    level: 4,
                    position: 13,
                    directReferrals: 1,
                    teamSize: 1,
                    isCapped: false,
                    joinDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                    lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000),
                    sponsor: '0xFEDCBA0987654321098765432109876543210987'
                  },
                  children: []
                }
              ]
            }
          ]
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

  // Fetch data from smart contract
  const fetchContractData = useCallback(async () => {
    if (!account) return null;

    try {
      // Cancel any previous request
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      const teamData = await Web3Service.getTeamHierarchy(account, {
        signal: abortController.current.signal,
        maxDepth,
        includeInactive
      });

      return teamData;
    } catch (error) {
      if (error.name === 'AbortError') {
        return null;
      }
      throw error;
    }
  }, [account, maxDepth, includeInactive]);

  // Main fetch function
  const fetchData = useCallback(async (force = false) => {
    if (loading && !force) return;

    setLoading(true);
    setError(null);

    try {
      let treeData;

      if (useMockData) {
        // Use mock data
        treeData = generateMockData();
      } else {
        // Try to fetch from contract, fallback to mock if fails
        try {
          treeData = await fetchContractData();
          if (!treeData) {
            console.warn('No data from contract, using mock data');
            treeData = generateMockData();
          }
        } catch (contractError) {
          console.error('Contract fetch failed:', contractError);
          setError('Failed to fetch live data, using demo data');
          treeData = generateMockData();
        }
      }

      setData(treeData);
      setStats(calculateStats(treeData));
      setLastFetch(new Date());
    } catch (error) {
      console.error('Error fetching genealogy data:', error);
      setError(error.message);
      // Still provide mock data on error
      const mockData = generateMockData();
      setData(mockData);
      setStats(calculateStats(mockData));
    } finally {
      setLoading(false);
    }
  }, [loading, useMockData, generateMockData, fetchContractData, calculateStats]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshTimer.current = setInterval(() => {
        fetchData();
      }, refreshInterval);

      return () => {
        if (refreshTimer.current) {
          clearInterval(refreshTimer.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchData]);

  // Initial fetch
  useEffect(() => {
    if (account) {
      fetchData();
    }
  }, [account, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // Utility functions
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

  return {
    data,
    loading,
    error,
    stats,
    lastFetch,
    fetchData,
    findNode,
    getPath,
    refresh: () => fetchData(true)
  };
};

export default useGenealogyData;
