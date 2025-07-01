/**
 * NetworkTreeVisualization.jsx
 * 
 * Professional Network Tree Visualization Component
 * Consolidated from multiple genealogy tree implementations
 * 
 * @description A comprehensive, configurable React component for visualizing
 *              hierarchical network relationships using react-d3-tree.
 *              Designed for blockchain network structures with LeadFive branding.
 * 
 * @features
 * - Interactive D3 tree visualization with zoom/pan controls
 * - Configurable orientation (vertical/horizontal)
 * - Custom node rendering with package tier styling
 * - Search and filtering capabilities
 * - Node details panel with user information
 * - Export functionality for network reports
 * - Mobile-responsive design
 * - Theme-aware styling (dark/light modes)
 * - Real-time data integration ready
 * 
 * @author OrphiChain Development Team
 * @version 2.0.0
 * @since 2025-06-14
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Tree from 'react-d3-tree';
import { useLiveNetworkData } from '../hooks/useLiveNetworkData.js';
import './NetworkTreeVisualization.css';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG = {
  orientation: 'vertical',
  initialZoom: 0.8,
  nodeSize: { x: 200, y: 150 },
  separation: { siblings: 1.5, nonSiblings: 2 },
  scaleExtent: { min: 0.1, max: 3 },
  transitionDuration: 500,
  collapsible: true,
  initialDepth: 3
};

const PACKAGE_TIER_COLORS = {
  0: '#6C757D', // No Package - Gray
  1: '#FF6B35', // $30 Package - Energy Orange
  2: '#00D4FF', // $50 Package - Cyber Blue  
  3: '#7B2CBF', // $100 Package - Royal Purple
  4: '#00FF88'  // $200 Package - Success Green
};

const PACKAGE_TIER_LABELS = {
  0: 'None',
  1: '$30',
  2: '$50',
  3: '$100', 
  4: '$200'
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculates total volume recursively through tree structure
 */
const calculateTotalVolume = (node) => {
  let total = node.attributes?.volume || 0;
  if (node.children) {
    node.children.forEach(child => {
      total += calculateTotalVolume(child);
    });
  }
  return total;
};

/**
 * Calculates maximum depth of tree structure
 */
const calculateMaxDepth = (node, depth = 0) => {
  if (!node.children || node.children.length === 0) {
    return depth;
  }
  return Math.max(...node.children.map(child => calculateMaxDepth(child, depth + 1)));
};

/**
 * Counts total nodes in tree structure
 */
const countTotalNodes = (node) => {
  if (!node) return 0;
  let count = 1;
  if (node.children) {
    node.children.forEach(child => {
      count += countTotalNodes(child);
    });
  }
  return count;
};

/**
 * Searches tree for nodes matching query
 */
const searchTree = (node, query) => {
  const results = [];
  const searchQuery = query.toLowerCase().trim();
  
  const searchNode = (current, path = []) => {
    const currentPath = [...path, current.name];
    
    // Check if current node matches
    const nodeText = [
      current.name,
      current.attributes?.address,
      current.attributes?.packageTier ? PACKAGE_TIER_LABELS[current.attributes.packageTier] : ''
    ].join(' ').toLowerCase();
    
    if (nodeText.includes(searchQuery)) {
      results.push({
        node: current,
        path: currentPath,
        matchText: nodeText
      });
    }
    
    // Search children
    if (current.children) {
      current.children.forEach(child => searchNode(child, currentPath));
    }
  };
  
  if (node) searchNode(node);
  return results;
};

/**
 * Gets color for package tier
 */
const getPackageTierColor = (tier) => {
  return PACKAGE_TIER_COLORS[tier] || PACKAGE_TIER_COLORS[0];
};

/**
 * Gets label for package tier
 */
const getPackageTierLabel = (tier) => {
  return PACKAGE_TIER_LABELS[tier] || PACKAGE_TIER_LABELS[0];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * NetworkTreeVisualization Component
 * 
 * Professional network tree visualization with live BSC Mainnet integration
 */
const NetworkTreeVisualization = ({
  // Data props (for backward compatibility)
  data = null,
  demoMode = false,
  
  // Live data props
  useLiveData = true,
  autoRefresh = true,
  refreshInterval = 30000,
  
  // Configuration props
  config = {},
  orientation = 'vertical',
  theme = 'dark',
  showControls = true,
  showStats = true,
  showSearch = true,
  showExport = true,
  collapsible = true,
  initialDepth = 3,
  
  // Event handlers
  onNodeClick = null,
  onNodeSelect = null,
  onDataUpdate = null,
  
  // Styling
  className = '',
  style = {},
  
  // Advanced features
  enableZoom = true,
  enablePan = true,
  enableTooltips = true,
  
  ...otherProps
}) => {
  
  // ============================================================================
  // LIVE DATA INTEGRATION
  // ============================================================================
  
  const {
    networkData: liveNetworkData,
    networkStats,
    loading: liveDataLoading,
    error: liveDataError,
    lastUpdate,
    refreshData,
    lookupUser,
    isConnected,
    config: liveConfig // Renamed to avoid duplicate declaration
  } = useLiveNetworkData({
    autoRefresh: useLiveData && autoRefresh,
    refreshInterval,
    includeEmptyUsers: false
  });

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showNodeDetails, setShowNodeDetails] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [treeConfig, setTreeConfig] = useState({ ...DEFAULT_CONFIG, ...config });
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [exportFormat, setExportFormat] = useState('png');
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_CONFIG.initialZoom || 0.8);
  const [currentOrientation, setCurrentOrientation] = useState(orientation);
  
  // Node size configuration
  const nodeSize = useMemo(() => ({ x: 200, y: 150 }), []);
  
  // Separation configuration
  const separation = useMemo(() => ({ siblings: 2, nonSiblings: 2 }), []);
  
  // Scale extent configuration
  const scaleExtent = useMemo(() => ({ min: 0.1, max: 3 }), []);
  
  // Refs
  const treeRef = useRef(null);
  const containerRef = useRef(null);
  
  // ============================================================================
  // DATA PROCESSING & EFFECTS
  // ============================================================================
  
  /**
   * Determine which data to use (live or provided)
   */
  const activeData = useMemo(() => {
    if (useLiveData && liveNetworkData) {
      return liveNetworkData;
    }
    if (data) {
      return data;
    }
    if (demoMode) {
      return generateDemoData();
    }
    return null;
  }, [useLiveData, liveNetworkData, data, demoMode]);

  /**
   * Generate demo data if no real data provided
   */
  const generateDemoData = useCallback(() => {
    return {
      name: 'OrphiChain Network Demo',
      attributes: {
        address: 'Demo Root',
        packageTier: null,
        volume: 0,
        registrationDate: new Date().toISOString(),
        isRoot: true,
        isDemoMode: true
      },
      children: [
        {
          name: 'Demo User #1',
          attributes: {
            address: '0x1234...5678',
            packageTier: 4,
            volume: 15000,
            registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            downlineCount: 12
          },
          children: [
            {
              name: 'Demo User #2',
              attributes: {
                address: '0x2345...6789',
                packageTier: 3,
                volume: 8500,
                registrationDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                downlineCount: 5
              },
              children: [
                {
                  name: 'Demo User #5',
                  attributes: {
                    address: '0x5678...9012',
                    packageTier: 2,
                    volume: 3200,
                    registrationDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                    downlineCount: 2
                  }
                },
                {
                  name: 'Demo User #6',
                  attributes: {
                    address: '0x6789...0123',
                    packageTier: 1,
                    volume: 1500,
                    registrationDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
                    downlineCount: 0
                  }
                }
              ]
            },
            {
              name: 'Demo User #3',
              attributes: {
                address: '0x3456...7890',
                packageTier: 2,
                volume: 4200,
                registrationDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
                downlineCount: 3
              },
              children: [
                {
                  name: 'Demo User #7',
                  attributes: {
                    address: '0x7890...1234',
                    packageTier: 1,
                    volume: 1200,
                    registrationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                    downlineCount: 1
                  }
                }
              ]
            }
          ]
        },
        {
          name: 'Demo User #4',
          attributes: {
            address: '0x4567...8901',
            packageTier: 3,
            volume: 12000,
            registrationDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
            downlineCount: 8
          },
          children: [
            {
              name: 'Demo User #8',
              attributes: {
                address: '0x8901...2345',
                packageTier: 2,
                volume: 5500,
                registrationDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                downlineCount: 4
              }
            },
            {
              name: 'Demo User #9',
              attributes: {
                address: '0x9012...3456',
                packageTier: 4,
                volume: 18000,
                registrationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                downlineCount: 7
              }
            }
          ]
        }
      ]
    };
  }, []);
  
  /**
   * Initialize tree data
   */
  useEffect(() => {
    if (activeData) {
      // Calculate stats
      const stats = {
        totalNodes: countTotalNodes(activeData),
        maxDepth: calculateMaxDepth(activeData),
        totalVolume: calculateTotalVolume(activeData),
        directChildren: activeData.children?.length || 0
      };
      
      if (onDataUpdate) {
        onDataUpdate(activeData, stats);
      }
    }
  }, [activeData, onDataUpdate]);
  
  /**
   * Handle search functionality
   */
  useEffect(() => {
    if (searchQuery && activeData) {
      const results = searchTree(activeData, searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, activeData]);
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleNodeClick = useCallback((nodeDatum) => {
    setSelectedNode(nodeDatum);
    if (onNodeClick) {
      onNodeClick(nodeDatum);
    }
  }, [onNodeClick]);
  
  // ============================================================================
  // CUSTOM NODE RENDERER
  // ============================================================================
  
  /**
   * Renders custom styled nodes for the tree with production-grade RootID integration
   */
  const renderCustomNodeElement = useCallback((rd3tNodeProps) => {
    const { nodeDatum, toggleNode } = rd3tNodeProps;
    const isRoot = nodeDatum.attributes?.isRoot || nodeDatum.name === 'Root';
    const position = nodeDatum.attributes?.position; // left, right, or root
    const packageTier = nodeDatum.attributes?.packageTier || 0;
    const packageColor = PACKAGE_TIER_COLORS[packageTier] || PACKAGE_TIER_COLORS[0];
    const isActive = nodeDatum.attributes?.isActive !== false;
    const isEmpty = nodeDatum.attributes?.isEmpty;
    const volume = nodeDatum.attributes?.volume || 0;
    const earnings = nodeDatum.attributes?.totalEarnings || 0;
    const rootId = nodeDatum.attributes?.rootId || nodeDatum.attributes?.id;
    
    // Enhanced positioning for perfect alignment
    const xOffset = position === 'left' ? -5 : position === 'right' ? 5 : 0;
    const yOffset = 0;
    
    if (isEmpty) {
      return (
        <g transform={`translate(${xOffset}, ${yOffset})`}>
          <circle
            r={22}
            fill="transparent"
            stroke="#4A5568"
            strokeWidth={2}
            strokeDasharray="8,4"
            opacity={0.4}
          />
          <text
            fill="#6B7280"
            textAnchor="middle"
            dy={5}
            fontSize={12}
            opacity={0.6}
          >
            ➕
          </text>
          <text
            fill="#6B7280"
            textAnchor="middle"
            y={35}
            fontSize={8}
            opacity={0.5}
          >
            Empty Slot
          </text>
        </g>
      );
    }
    
    return (
      <g transform={`translate(${xOffset}, ${yOffset})`}>
        {/* Root ID indicator for contract sync */}
        {rootId && !isRoot && (
          <text
            fill="#00D4FF"
            textAnchor="middle"
            y={-55}
            fontSize={7}
            opacity={0.8}
          >
            ID: {rootId.slice(0, 8)}
          </text>
        )}
        
        {/* Position indicator with production styling */}
        {!isRoot && position && (
          <text
            fill={position === 'left' ? '#FF6B35' : '#00D4FF'}
            textAnchor="middle"
            y={-45}
            fontSize={10}
            fontWeight="bold"
            style={{
              filter: `drop-shadow(0 0 4px ${position === 'left' ? '#FF6B35' : '#00D4FF'}40)`
            }}
          >
            {position.toUpperCase()} LEG
          </text>
        )}
        
        {/* Volume indicators for binary legs */}
        {!isRoot && !isEmpty && (nodeDatum.attributes?.leftVolume || nodeDatum.attributes?.rightVolume) && (
          <g>
            <text
              fill="#9CA3AF"
              textAnchor="middle"
              y={-32}
              fontSize={7}
            >
              L: ${(nodeDatum.attributes.leftVolume || 0).toLocaleString()}
            </text>
            <text
              fill="#9CA3AF"
              textAnchor="middle"
              y={-24}
              fontSize={7}
            >
              R: ${(nodeDatum.attributes.rightVolume || 0).toLocaleString()}
            </text>
          </g>
        )}
        
        {/* Main node circle with enhanced styling */}
        <circle
          r={isRoot ? 38 : 32}
          fill={isActive ? packageColor : '#4A5568'}
          stroke={
            isRoot ? '#FFD700' : 
            position === 'left' ? '#FF6B35' : 
            position === 'right' ? '#00D4FF' : '#9CA3AF'
          }
          strokeWidth={isRoot ? 4 : 3}
          opacity={isActive ? 1 : 0.7}
          style={{ 
            cursor: 'pointer',
            filter: isActive ? `drop-shadow(0 0 8px ${packageColor}40)` : 'none'
          }}
          onClick={toggleNode}
        />
        
        {/* Node icon with position-aware styling */}
        <text
          fill="#FFFFFF"
          textAnchor="middle"
          dy={6}
          fontSize={isRoot ? 18 : 16}
          fontWeight="bold"
          style={{ cursor: 'pointer' }}
          onClick={toggleNode}
        >
          {isRoot ? '👑' : 
           position === 'left' ? 'L' : 
           position === 'right' ? 'R' : 
           nodeDatum.name.charAt(0)}
        </text>
        
        {/* User identifier */}
        <text
          fill="#E5E7EB"
          textAnchor="middle"
          y={isRoot ? 55 : 50}
          fontSize={11}
          fontWeight="500"
        >
          {nodeDatum.name}
        </text>
        
        {/* Package tier with enhanced visibility */}
        {!isRoot && packageTier > 0 && (
          <text
            fill={packageColor}
            textAnchor="middle"
            y={65}
            fontSize={9}
            fontWeight="700"
            style={{
              filter: `drop-shadow(0 0 4px ${packageColor}60)`
            }}
          >
            ${packageTier === 1 ? '30' : packageTier === 2 ? '50' : packageTier === 3 ? '100' : '200'}
          </text>
        )}
        
        {/* Volume display */}
        {volume > 0 && (
          <text
            fill="#6B7280"
            textAnchor="middle"
            y={isRoot ? 75 : 78}
            fontSize={8}
            fontWeight="500"
          >
            Vol: ${volume.toLocaleString()}
          </text>
        )}
        
        {/* Earnings indicator */}
        {earnings > 0 && (
          <text
            fill="#10B981"
            textAnchor="middle"
            y={isRoot ? 90 : 90}
            fontSize={8}
            fontWeight="600"
          >
            💰 ${earnings.toLocaleString()}
          </text>
        )}
        
        {/* Binary position visual indicator */}
        {!isRoot && position && (
          <circle
            cx={position === 'left' ? -20 : 20}
            cy={-35}
            r={6}
            fill={position === 'left' ? '#FF6B35' : '#00D4FF'}
            opacity={0.9}
            style={{
              filter: `drop-shadow(0 0 4px ${position === 'left' ? '#FF6B35' : '#00D4FF'}80)`
            }}
          />
        )}
        
        {/* Active status indicator */}
        {isActive && !isRoot && (
          <circle
            cx={25}
            cy={25}
            r={4}
            fill="#10B981"
            stroke="#FFFFFF"
            strokeWidth={1}
          />
        )}
      </g>
    );
  }, []);

  /**
   * Default fallback node renderer
   */
  const defaultNodeRenderer = useCallback((props) => (
    <g>
      <circle r={20} fill="#00D4FF" />
      <text fill="#fff" textAnchor="middle" dy={5}>
        {props.nodeDatum.name}
      </text>
    </g>
  ), []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  
  const handleZoomChange = useCallback((newZoom) => {
    setCurrentZoom(newZoom);
  }, []);
  
  const handleOrientationChange = useCallback((newOrientation) => {
    setCurrentOrientation(newOrientation);
  }, []);
  
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);
  
  const resetView = useCallback(() => {
    setCurrentZoom(DEFAULT_CONFIG.initialZoom || 0.8);
    setSelectedNode(null);
    setSearchQuery('');
  }, []);
  
  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================
  
  const treeConfigProps = useMemo(() => ({
    data: activeData,
    orientation: currentOrientation,
    pathFunc: "diagonal",
    nodeSize: currentOrientation === 'vertical' ? 
      { x: 280, y: 200 } : // Optimal spacing for production binary tree
      { x: 200, y: 280 },
    separation: currentOrientation === 'vertical' ?
      { siblings: 1.8, nonSiblings: 2.2 } : // Perfect separation for node alignment
      { siblings: 1.6, nonSiblings: 2.0 },
    translate: currentOrientation === 'vertical' ? 
      { x: Math.max(dimensions.width / 2, 150), y: 80 } : // Better centering with minimum offset
      { x: 120, y: Math.max(dimensions.height / 2, 150) },
    zoom: currentZoom,
    scaleExtent,
    enableLegacyTransitions: true,
    transitionDuration: 350, // Faster transitions for better UX
    renderCustomNodeElement: renderCustomNodeElement || defaultNodeRenderer,
    collapsible,
    initialDepth,
    // Enhanced path styling for production
    pathClassFunc: (datum) => {
      const position = datum.target?.data?.attributes?.position;
      return position ? `binary-tree-link ${position}-leg` : 'binary-tree-link default-link';
    },
    // Production-grade tree configuration
    depthFactor: currentOrientation === 'vertical' ? 200 : 280,
    branchNodeColor: '#00D4FF',
    leafNodeColor: '#BD00FF'
  }), [
    activeData,
    currentOrientation,
    dimensions,
    currentZoom,
    scaleExtent,
    renderCustomNodeElement,
    defaultNodeRenderer,
    collapsible,
    initialDepth
  ]);
  
  // ============================================================================
  // TREE STATISTICS CALCULATION
  // ============================================================================
  
  /**
   * Calculate comprehensive tree statistics from the active data
   */
  const treeStats = useMemo(() => {
    if (!activeData) {
      return {
        totalNodes: 0,
        maxDepth: 0,
        totalVolume: 0,
        activeNodes: 0,
        directChildren: 0,
        leftLegVolume: 0,
        rightLegVolume: 0,
        leftLegNodes: 0,
        rightLegNodes: 0
      };
    }

    const calculateStats = (node, depth = 0, legSide = null) => {
      let stats = {
        nodes: 1,
        maxDepth: depth,
        volume: node.attributes?.volume || 0,
        active: node.attributes?.isActive !== false ? 1 : 0,
        leftNodes: 0,
        rightNodes: 0,
        leftVolume: 0,
        rightVolume: 0
      };

      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          const childPosition = child.attributes?.position;
          const childStats = calculateStats(child, depth + 1, childPosition);
          
          stats.nodes += childStats.nodes;
          stats.maxDepth = Math.max(stats.maxDepth, childStats.maxDepth);
          stats.volume += childStats.volume;
          stats.active += childStats.active;
          
          // Track left and right leg statistics
          if (childPosition === 'left' || legSide === 'left') {
            stats.leftNodes += childStats.nodes;
            stats.leftVolume += childStats.volume;
          } else if (childPosition === 'right' || legSide === 'right') {
            stats.rightNodes += childStats.nodes;
            stats.rightVolume += childStats.volume;
          }
        });
      }

      return stats;
    };

    const stats = calculateStats(activeData);
    const directChildren = activeData.children ? activeData.children.length : 0;
    
    return {
      totalNodes: stats.nodes,
      maxDepth: stats.maxDepth,
      totalVolume: stats.volume,
      activeNodes: stats.active,
      directChildren: directChildren,
      leftLegVolume: stats.leftVolume,
      rightLegVolume: stats.rightVolume,
      leftLegNodes: stats.leftNodes,
      rightLegNodes: stats.rightNodes
    };
  }, [activeData]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  
  if (liveDataLoading || !activeData) {
    return (
      <div className={`network-tree-loading theme-${theme}`}>
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
        </div>
        <p>Loading network tree...</p>
      </div>
    );
  }
  
  // ============================================================================
  // RENDER MAIN COMPONENT
  // ============================================================================
  
  return (
    <div className={`network-tree-visualization theme-${theme}`} ref={containerRef}>
      
      {/* Header with Stats */}
      {showStats && (
        <div className="tree-header">
          <div className="tree-stats">
            <div className="stat-item">
              <span className="stat-label">Total Nodes</span>
              <span className="stat-value">{treeStats.totalNodes}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tree Depth</span>
              <span className="stat-value">{treeStats.maxDepth}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Volume</span>
              <span className="stat-value">${(treeStats.totalVolume || 0).toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Left Leg</span>
              <span className="stat-value" style={{color: '#FF6B35'}}>
                {treeStats.leftLegNodes} nodes | ${(treeStats.leftLegVolume || 0).toLocaleString()}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Right Leg</span>
              <span className="stat-value" style={{color: '#00D4FF'}}>
                {treeStats.rightLegNodes} nodes | ${(treeStats.rightLegVolume || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Controls */}
      {showControls && (
        <div className="tree-controls">
          {/* Orientation Control */}
          <div className="control-group">
            <label>Orientation:</label>
            <select 
              value={currentOrientation} 
              onChange={(e) => handleOrientationChange(e.target.value)}
              className="control-select"
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
            </select>
          </div>
          
          {/* Zoom Control */}
          <div className="control-group">
            <label>Zoom:</label>
            <input
              type="range"
              min={scaleExtent.min}
              max={scaleExtent.max}
              step="0.1"
              value={currentZoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="zoom-slider"
            />
            <span className="zoom-value">{(currentZoom * 100).toFixed(0)}%</span>
          </div>
          
          {/* Search Control */}
          {showSearch && (
            <div className="control-group">
              <label>Search:</label>
              <input
                type="text"
                placeholder="Search users or addresses..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="search-input"
              />
              {searchResults.length > 0 && (
                <span className="search-results">{searchResults.length} found</span>
              )}
            </div>
          )}
          
          {/* Reset Button */}
          <button className="reset-btn" onClick={resetView}>
            Reset View
          </button>
        </div>
      )}
      
      {/* Tree Container */}
      <div className="tree-container" style={{ height: '600px', width: '100%' }}>
        <Tree
          ref={treeRef}
          {...treeConfigProps}
        />
      </div>
      
      {/* Node Details Panel */}
      {showNodeDetails && selectedNode && (
        <div className="node-details-panel">
          <div className="panel-header">
            <h3>Node Details</h3>
            <button 
              className="close-btn"
              onClick={() => setSelectedNode(null)}
            >
              ✕
            </button>
          </div>
          <div className="panel-content">
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{selectedNode.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{selectedNode.attributes?.address}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Package:</span>
              <span className="detail-value">
                {getPackageTierLabel(selectedNode.attributes?.packageTier)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Volume:</span>
              <span className="detail-value">
                ${selectedNode.attributes?.volume?.toLocaleString()}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Downline:</span>
              <span className="detail-value">{selectedNode.attributes?.downlineCount || 0}</span>
            </div>
            {selectedNode.attributes?.registrationDate && (
              <div className="detail-row">
                <span className="detail-label">Registered:</span>
                <span className="detail-value">
                  {new Date(selectedNode.attributes.registrationDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Legend */}
      {showLegend && (
        <div className="tree-legend">
          <h4>Binary Tree Structure</h4>
          <div className="legend-items">
            {/* Binary Leg Indicators */}
            <div className="legend-item binary-leg left-leg">
              <div 
                className="legend-color" 
                style={{ backgroundColor: '#FF6B35' }}
              ></div>
              <span>Left Leg ({treeStats.leftLegNodes} nodes)</span>
            </div>
            <div className="legend-item binary-leg right-leg">
              <div 
                className="legend-color" 
                style={{ backgroundColor: '#00D4FF' }}
              ></div>
              <span>Right Leg ({treeStats.rightLegNodes} nodes)</span>
            </div>
            
            {/* Package Tiers */}
            <hr style={{border: '1px solid rgba(255,255,255,0.2)', margin: '8px 0'}} />
            <div style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginBottom: '4px'}}>Package Tiers:</div>
            {Object.entries(PACKAGE_TIER_LABELS).map(([tier, label]) => (
              <div key={tier} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: getPackageTierColor(parseInt(tier)) }}
                ></div>
                <span>{label} Package</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default NetworkTreeVisualization;
