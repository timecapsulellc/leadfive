/**
 * Unified Genealogy Tree Service
 * 
 * Provides consistent tree data and logic across all pages:
 * - Dashboard
 * - Genealogy Page
 * - Referrals Page
 * 
 * This ensures no conflicts or confusion between different implementations.
 */

import { validateAccount } from '../utils/contractErrorHandler';

/**
 * Get unified tree data for all components
 * @param {string} account - User account address
 * @param {Object} provider - Web3 provider
 * @param {Object} contractInstance - Smart contract instance (optional)
 * @param {Object} teamStats - Team statistics (optional)
 * @param {Object} userInfo - User information from contract (optional)
 * @returns {Object} Unified tree data
 */
export const getUnifiedTreeData = async (account, provider, contractInstance = null, teamStats = {}, userInfo = {}) => {
  const validAccount = validateAccount(account);
  
  if (!validAccount) {
    return getDemoTreeData();
  }

  try {
    // If contract instance is available, try to get real data
    if (contractInstance) {
      return await getRealTreeData({ account: validAccount, contractInstance, teamStats, userInfo });
    } else {
      // Fallback to demo data with user's address
      return getPersonalizedDemoData(validAccount, teamStats);
    }
  } catch (error) {
    console.warn('Failed to get tree data, using demo data:', error);
    return getPersonalizedDemoData(validAccount, teamStats);
  }
};

/**
 * Get real tree data from smart contract
 * @param {Object} params - Parameters
 * @returns {Object} Real tree data
 */
const getRealTreeData = async ({ account, contractInstance, teamStats, userInfo }) => {
  try {
    // This would normally call smart contract functions to get the actual tree structure
    // For now, we'll use the demo structure with real user data
    const baseTreeData = {
      id: "root",
      name: `${account.slice(0, 6)}...${account.slice(-4)}`,
      address: account,
      level: 0,
      position: "root",
      package: userInfo.packageLevel || teamStats.currentPackage || 100,
      earnings: userInfo.totalEarnings || teamStats.totalEarnings || 0,
      status: userInfo.isRegistered ? "active" : "inactive",
      joinDate: new Date().toISOString().split('T')[0],
      directReferrals: userInfo.directReferrals || teamStats.directReferrals || 0,
      teamSize: userInfo.teamSize || teamStats.totalTeam || 0,
      referralCode: userInfo.referralCode || account.slice(-8),
      children: []
    };

    // TODO: Implement actual contract calls to get referral tree
    // const leftLeg = await contractInstance.getLeftLeg(account);
    // const rightLeg = await contractInstance.getRightLeg(account);
    
    // For now, generate demo children based on team stats
    if (teamStats.directReferrals > 0) {
      baseTreeData.children = generateDemoChildren(baseTreeData, teamStats);
    }

    return baseTreeData;
  } catch (error) {
    console.error('Error getting real tree data:', error);
    return getPersonalizedDemoData(account, teamStats);
  }
};

/**
 * Generate demo children for tree
 * @param {Object} parentNode - Parent node data
 * @param {Object} teamStats - Team statistics
 * @returns {Array} Array of child nodes
 */
const generateDemoChildren = (parentNode, teamStats) => {
  const children = [];
  const directReferrals = Math.min(teamStats.directReferrals || 0, 10); // Limit for demo
  
  for (let i = 0; i < Math.min(directReferrals, 2); i++) {
    const position = i === 0 ? 'left' : 'right';
    const childNode = {
      id: `${parentNode.id}-${position}`,
      name: `Referral ${i + 1}`,
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      level: parentNode.level + 1,
      position: position,
      package: [25, 50, 100, 250][Math.floor(Math.random() * 4)],
      earnings: Math.random() * 1000,
      status: Math.random() > 0.2 ? "active" : "inactive",
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      children: []
    };
    
    // Add some second-level referrals randomly
    if (Math.random() > 0.5 && parentNode.level < 2) {
      childNode.children = generateDemoChildren(childNode, { directReferrals: Math.floor(Math.random() * 3) });
    }
    
    children.push(childNode);
  }
  
  return children;
};

/**
 * Get personalized demo data with user's actual address
 * @param {string} account - User account address
 * @param {Object} teamStats - Team statistics
 * @returns {Object} Personalized demo tree data
 */
const getPersonalizedDemoData = (account, teamStats = {}) => {
  const baseData = {
    id: "root",
    name: `${account.slice(0, 6)}...${account.slice(-4)}`,
    address: account,
    level: 0,
    position: "root",
    package: teamStats.currentPackage || 100,
    earnings: teamStats.totalEarnings || 1250.75,
    status: "active",
    joinDate: new Date().toISOString().split('T')[0],
    directReferrals: teamStats.directReferrals || 8,
    teamSize: teamStats.totalTeam || 24,
    referralCode: account.slice(-8),
    children: [
      {
        id: "left-1",
        name: "Active Referral 1",
        address: "0x7890abcdef123456789012345678901234567890",
        level: 1,
        position: "left",
        package: 250,
        earnings: 650.25,
        status: "active",
        joinDate: "2024-12-15",
        children: [
          {
            id: "left-1-left",
            name: "Sub-Ref 1.1",
            address: "0x1111111111111111111111111111111111111111",
            level: 2,
            position: "left",
            package: 100,
            earnings: 180.50,
            status: "active",
            joinDate: "2024-12-20",
            children: []
          },
          {
            id: "left-1-right",
            name: "Sub-Ref 1.2",
            address: "0x2222222222222222222222222222222222222222",
            level: 2,
            position: "right",
            package: 50,
            earnings: 95.25,
            status: "inactive",
            joinDate: "2024-12-22",
            children: []
          }
        ]
      },
      {
        id: "right-1",
        name: "Active Referral 2",
        address: "0xabcdef1234567890abcdef1234567890abcdef12",
        level: 1,
        position: "right",
        package: 100,
        earnings: 420.75,
        status: "active",
        joinDate: "2024-12-18",
        children: [
          {
            id: "right-1-left",
            name: "Sub-Ref 2.1",
            address: "0x3333333333333333333333333333333333333333",
            level: 2,
            position: "left",
            package: 25,
            earnings: 45.20,
            status: "active",
            joinDate: "2024-12-25",
            children: []
          }
        ]
      }
    ]
  };

  return baseData;
};

/**
 * Get demo tree data (fallback when no account)
 * @returns {Object} Demo tree data
 */
const getDemoTreeData = () => {
  return {
    id: "root",
    name: "Demo User",
    address: "0x29dcCb502D10C042BcC6a02a7762C49595A9E498",
    level: 0,
    position: "root",
    package: 100,
    earnings: 1250.75,
    status: "active",
    joinDate: "2024-12-01",
    directReferrals: 8,
    teamSize: 24,
    referralCode: "DEMO123",
    children: [
      {
        id: "demo-left",
        name: "Demo Referral 1",
        address: "0x1234567890123456789012345678901234567890",
        level: 1,
        position: "left",
        package: 250,
        earnings: 650.25,
        status: "active",
        joinDate: "2024-12-15",
        children: [
          {
            id: "demo-left-left",
            name: "Sub Referral 1.1",
            address: "0x2234567890123456789012345678901234567890",
            level: 2,
            position: "left",
            package: 50,
            earnings: 125.50,
            status: "active",
            joinDate: "2024-12-20",
            children: []
          },
          {
            id: "demo-left-right",
            name: "Sub Referral 1.2",
            address: "0x3234567890123456789012345678901234567890",
            level: 2,
            position: "right",
            package: 100,
            earnings: 275.25,
            status: "active",
            joinDate: "2024-12-22",
            children: []
          }
        ]
      },
      {
        id: "demo-right",
        name: "Demo Referral 2",
        address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        level: 1,
        position: "right",
        package: 100,
        earnings: 420.75,
        status: "active",
        joinDate: "2024-12-18",
        children: [
          {
            id: "demo-right-left",
            name: "Sub Referral 2.1",
            address: "0xbcdefabcdefabcdefabcdefabcdefabcdefabcde",
            level: 2,
            position: "left",
            package: 30,
            earnings: 85.75,
            status: "active",
            joinDate: "2024-12-25",
            children: []
          },
          {
            id: "demo-right-right",
            name: "Sub Referral 2.2",
            address: "0xcdefabcdefabcdefabcdefabcdefabcdefabcdef",
            level: 2,
            position: "right",
            package: 200,
            earnings: 505.50,
            status: "active",
            joinDate: "2024-12-28",
            children: []
          }
        ]
      }
    ]
  };
};

/**
 * Calculate tree statistics
 * @param {Object} treeData - Tree data
 * @returns {Object} Tree statistics
 */
export const calculateTreeStats = (treeData) => {
  if (!treeData) return { totalNodes: 0, activeNodes: 0, leftLegCount: 0, rightLegCount: 0, maxDepth: 0 };

  let totalNodes = 0;
  let activeNodes = 0;
  let leftLegCount = 0;
  let rightLegCount = 0;
  let maxDepth = 0;

  const traverse = (node, depth = 0) => {
    if (!node) return;

    totalNodes++;
    if (node.status === 'active') activeNodes++;
    if (node.position === 'left') leftLegCount++;
    if (node.position === 'right') rightLegCount++;
    maxDepth = Math.max(maxDepth, depth);

    if (node.children) {
      node.children.forEach(child => traverse(child, depth + 1));
    }
  };

  traverse(treeData);

  return {
    totalNodes,
    activeNodes,
    leftLegCount,
    rightLegCount,
    maxDepth
  };
};

/**
 * Shared tree configuration for all components
 */
export const UNIFIED_TREE_CONFIG = {
  nodeRadius: 30,
  levelHeight: 120,
  siblingDistance: 200,
  colors: {
    active: '#10b981',
    inactive: '#ef4444',
    root: '#3b82f6',
    border: '#374151'
  },
  animation: {
    duration: 750,
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

export default {
  getUnifiedTreeData,
  calculateTreeStats,
  UNIFIED_TREE_CONFIG
};
