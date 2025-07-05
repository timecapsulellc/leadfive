import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaNetworkWired, FaUsers, FaChartLine, FaExpand, FaSearch, FaDownload } from 'react-icons/fa';
import GenealogyTree from '../enhanced/GenealogyTree';
import { contractService } from '../../services/ContractService';
import './sections.css';

export default function BinaryTreeSection({ account, provider, contractInstance }) {
  const [treeData, setTreeData] = useState({
    rootNode: null,
    totalNodes: 0,
    maxDepth: 0,
    leftCount: 0,
    rightCount: 0,
    activeNodes: 0,
    treeBalance: 0,
    lastUpdated: new Date().toISOString()
  });
  const [viewOptions, setViewOptions] = useState({
    maxDepth: 5,
    showInactive: true,
    showEarnings: true,
    layout: 'tree' // 'tree', 'radial', 'force'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (account) {
      loadTreeData();
    }
  }, [account, contractInstance]);

  const loadTreeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch real blockchain data first
      if (contractInstance && account) {
        try {
          const rootNode = await contractService?.getNetworkTree?.(account) || generateMockTreeData();
          
          setTreeData(prev => ({
            ...prev,
            rootNode: rootNode || generateMockTreeData(),
            totalNodes: calculateTotalNodes(rootNode),
            maxDepth: calculateMaxDepth(rootNode),
            leftCount: calculateSideCount(rootNode, 'left'),
            rightCount: calculateSideCount(rootNode, 'right'),
            activeNodes: calculateActiveNodes(rootNode),
            treeBalance: calculateTreeBalance(rootNode),
            lastUpdated: new Date().toISOString()
          }));
        } catch (contractError) {
          console.warn('Contract call failed, using mock data:', contractError);
          // Fall back to mock data
          const mockRoot = generateMockTreeData();
          setTreeData({
            rootNode: mockRoot,
            totalNodes: calculateTotalNodes(mockRoot),
            maxDepth: calculateMaxDepth(mockRoot),
            leftCount: calculateSideCount(mockRoot, 'left'),
            rightCount: calculateSideCount(mockRoot, 'right'),
            activeNodes: calculateActiveNodes(mockRoot),
            treeBalance: calculateTreeBalance(mockRoot),
            lastUpdated: new Date().toISOString()
          });
        }
      } else {
        // Mock data for demo
        const mockRoot = generateMockTreeData();
        setTreeData({
          rootNode: mockRoot,
          totalNodes: calculateTotalNodes(mockRoot),
          maxDepth: calculateMaxDepth(mockRoot),
          leftCount: calculateSideCount(mockRoot, 'left'),
          rightCount: calculateSideCount(mockRoot, 'right'),
          activeNodes: calculateActiveNodes(mockRoot),
          treeBalance: calculateTreeBalance(mockRoot),
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading tree data:', error);
      setError('Failed to load network tree data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockTreeData = () => {
    return {
      id: account || '0x1234...5678',
      address: account || '0x1234...5678',
      level: 0,
      position: 'root',
      active: true,
      earnings: 456.78,
      package: 100,
      children: [
        {
          id: '0x2345...6789',
          address: '0x2345...6789',
          level: 1,
          position: 'left',
          active: true,
          earnings: 250.00,
          package: 100,
          children: [
            {
              id: '0x3456...7890',
              address: '0x3456...7890',
              level: 2,
              position: 'left',
              active: true,
              earnings: 100.00,
              package: 50,
              children: []
            },
            {
              id: '0x4567...8901',
              address: '0x4567...8901',
              level: 2,
              position: 'right',
              active: false,
              earnings: 0,
              package: 30,
              children: []
            }
          ]
        },
        {
          id: '0x5678...9012',
          address: '0x5678...9012',
          level: 1,
          position: 'right',
          active: true,
          earnings: 180.50,
          package: 100,
          children: [
            {
              id: '0x6789...0123',
              address: '0x6789...0123',
              level: 2,
              position: 'left',
              active: true,
              earnings: 75.25,
              package: 50,
              children: []
            }
          ]
        }
      ]
    };
  };

  const calculateTotalNodes = (node) => {
    if (!node) return 0;
    return 1 + (node.children || []).reduce((sum, child) => sum + calculateTotalNodes(child), 0);
  };

  const calculateMaxDepth = (node, depth = 0) => {
    if (!node || !node.children || node.children.length === 0) return depth;
    return Math.max(...node.children.map(child => calculateMaxDepth(child, depth + 1)));
  };

  const calculateSideCount = (node, side) => {
    if (!node || !node.children) return 0;
    const sideChild = node.children.find(child => child.position === side);
    return sideChild ? calculateTotalNodes(sideChild) : 0;
  };

  const calculateActiveNodes = (node) => {
    if (!node) return 0;
    const isActive = node.active ? 1 : 0;
    return isActive + (node.children || []).reduce((sum, child) => sum + calculateActiveNodes(child), 0);
  };

  const calculateTreeBalance = (node) => {
    if (!node) return 0;
    const leftCount = calculateSideCount(node, 'left');
    const rightCount = calculateSideCount(node, 'right');
    return Math.abs(leftCount - rightCount);
  };

  const exportTreeData = () => {
    const dataStr = JSON.stringify(treeData.rootNode, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `network-tree-${account?.slice(-8)}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="section-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading network tree...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-container">
        <div className="error-state">
          <h3>Error Loading Network Tree</h3>
          <p>{error}</p>
          <button onClick={loadTreeData} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={`section-container binary-tree-section ${isFullscreen ? 'fullscreen' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="section-header">
        <h1 className="section-title">
          <FaNetworkWired className="section-icon" />
          Network Tree
        </h1>
        <p className="section-subtitle">
          Visualize your binary tree structure and network growth
        </p>
        <div className="last-updated">
          Last updated: {new Date(treeData.lastUpdated).toLocaleString()}
        </div>
      </div>

      {/* Tree Overview Cards */}
      <div className="tree-overview">
        <div className="tree-card total-nodes">
          <div className="card-header">
            <h3>Total Nodes</h3>
            <FaUsers className="card-icon" />
          </div>
          <div className="card-value">{treeData.totalNodes}</div>
          <div className="card-label">Network members</div>
        </div>

        <div className="tree-card active-nodes">
          <div className="card-header">
            <h3>Active Nodes</h3>
            <FaChartLine className="card-icon" />
          </div>
          <div className="card-value">{treeData.activeNodes}</div>
          <div className="card-label">Contributing members</div>
        </div>

        <div className="tree-card max-depth">
          <div className="card-header">
            <h3>Max Depth</h3>
            <FaNetworkWired className="card-icon" />
          </div>
          <div className="card-value">{treeData.maxDepth}</div>
          <div className="card-label">Tree levels</div>
        </div>

        <div className="tree-card tree-balance">
          <div className="card-header">
            <h3>Tree Balance</h3>
            <FaChartLine className="card-icon" />
          </div>
          <div className="card-value">{treeData.treeBalance}</div>
          <div className="card-label">Node difference</div>
        </div>
      </div>

      {/* Tree Controls */}
      <div className="tree-controls">
        <div className="control-group">
          <label>Search Network</label>
          <div className="search-input">
            <FaSearch className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by address..."
            />
          </div>
        </div>

        <div className="control-group">
          <label>Max Depth</label>
          <select 
            value={viewOptions.maxDepth}
            onChange={(e) => setViewOptions({...viewOptions, maxDepth: parseInt(e.target.value)})}
          >
            <option value={3}>3 Levels</option>
            <option value={5}>5 Levels</option>
            <option value={7}>7 Levels</option>
            <option value={10}>10 Levels</option>
          </select>
        </div>

        <div className="control-group">
          <label>Layout</label>
          <select 
            value={viewOptions.layout}
            onChange={(e) => setViewOptions({...viewOptions, layout: e.target.value})}
          >
            <option value="tree">Binary Tree</option>
            <option value="radial">Radial</option>
            <option value="force">Force Directed</option>
          </select>
        </div>

        <div className="control-checkboxes">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={viewOptions.showInactive}
              onChange={(e) => setViewOptions({...viewOptions, showInactive: e.target.checked})}
            />
            Show Inactive
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={viewOptions.showEarnings}
              onChange={(e) => setViewOptions({...viewOptions, showEarnings: e.target.checked})}
            />
            Show Earnings
          </label>
        </div>
      </div>

      {/* Tree Statistics */}
      <div className="tree-statistics">
        <div className="stat-group">
          <h3>Left Side</h3>
          <div className="stat-value">{treeData.leftCount} nodes</div>
          <div className="stat-percentage">
            {treeData.totalNodes > 1 ? ((treeData.leftCount / (treeData.totalNodes - 1)) * 100).toFixed(1) : 0}%
          </div>
        </div>
        
        <div className="stat-group balance-indicator">
          <h3>Balance Score</h3>
          <div className={`balance-score ${treeData.treeBalance <= 2 ? 'good' : treeData.treeBalance <= 5 ? 'fair' : 'poor'}`}>
            {treeData.treeBalance <= 2 ? 'Balanced' : treeData.treeBalance <= 5 ? 'Fair' : 'Unbalanced'}
          </div>
          <div className="balance-bar">
            <div 
              className="balance-fill" 
              style={{ 
                width: `${Math.max(10, 100 - (treeData.treeBalance * 10))}%`,
                backgroundColor: treeData.treeBalance <= 2 ? '#4CAF50' : treeData.treeBalance <= 5 ? '#FF9800' : '#F44336'
              }}
            />
          </div>
        </div>

        <div className="stat-group">
          <h3>Right Side</h3>
          <div className="stat-value">{treeData.rightCount} nodes</div>
          <div className="stat-percentage">
            {treeData.totalNodes > 1 ? ((treeData.rightCount / (treeData.totalNodes - 1)) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="tree-visualization-container">
        <div className="visualization-header">
          <h2>Network Visualization</h2>
          <div className="visualization-actions">
            <button className="action-btn" onClick={exportTreeData}>
              <FaDownload />
              Export
            </button>
            <button 
              className="action-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <FaExpand />
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </button>
          </div>
        </div>
        
        <div className="tree-visualization">
          <GenealogyTree
            treeData={treeData.rootNode}
            onNodeClick={(node) => console.log('Node clicked:', node)}
          />
        </div>
      </div>

      {/* Tree legend is included in the GenealogyTree component */}

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-btn primary">
          <FaUsers />
          Add Member
        </button>
        <button className="action-btn secondary" onClick={loadTreeData}>
          <FaNetworkWired />
          Refresh Tree
        </button>
        <button className="action-btn secondary">
          <FaChartLine />
          View Analytics
        </button>
      </div>
    </motion.div>
  );
}