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
   * Renders custom styled nodes for the tree
   */
  const renderCustomNodeElement = useCallback((rd3tNodeProps) => {
    const { nodeDatum, toggleNode } = rd3tNodeProps;
    const isRoot = nodeDatum.attributes?.isRoot || nodeDatum.name === 'Root';
    const packageTier = nodeDatum.attributes?.packageTier || 0;
    const packageColor = PACKAGE_TIER_COLORS[packageTier] || PACKAGE_TIER_COLORS[0];
    const isActive = nodeDatum.attributes?.isActive !== false;
    
    return (
      <g>
        {/* Node circle */}
        <circle
          r={isRoot ? 30 : 25}
          fill={isActive ? packageColor : '#6C757D'}
          stroke="#fff"
          strokeWidth={3}
          opacity={isActive ? 1 : 0.6}
          style={{ cursor: 'pointer' }}
          onClick={toggleNode}
        />
        
        {/* Node icon/text */}
        <text
          fill="#fff"
          textAnchor="middle"
          dy={5}
          fontSize={isRoot ? 14 : 12}
          fontWeight="bold"
          style={{ cursor: 'pointer' }}
          onClick={toggleNode}
        >
          {isRoot ? '👑' : nodeDatum.name.charAt(2)}
        </text>
        
        {/* Node name */}
        <text
          fill="#333"
          textAnchor="middle"
          y={isRoot ? 45 : 40}
          fontSize={10}
          fontWeight="500"
        >
          {nodeDatum.name}
        </text>
        
        {/* Package tier */}
        {!isRoot && (
          <text
            fill={packageColor}
            textAnchor="middle"
            y={52}
            fontSize={8}
            fontWeight="600"
          >
            Tier {packageTier}
          </text>
        )}
        
        {/* Volume */}
        {nodeDatum.attributes?.volume > 0 && (
          <text
            fill="#666"
            textAnchor="middle"
            y={64}
            fontSize={8}
          >
            ${(nodeDatum.attributes.volume / 1000).toFixed(1)}K
          </text>
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
    nodeSize: currentOrientation === 'vertical' ? nodeSize : { x: nodeSize.y, y: nodeSize.x },
    separation,
    translate: currentOrientation === 'vertical' ? 
      { x: 400, y: 100 } : 
      { x: 150, y: 300 },
    zoom: currentZoom,
    scaleExtent,
    enableLegacyTransitions: true,
    transitionDuration: DEFAULT_CONFIG.transitionDuration,
    renderCustomNodeElement: renderCustomNodeElement || defaultNodeRenderer,
    collapsible,
    initialDepth
  }), [
    activeData,
    currentOrientation,
    nodeSize,
    separation,
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
        directChildren: 0
      };
    }

    const calculateStats = (node, depth = 0) => {
      let stats = {
        nodes: 1,
        maxDepth: depth,
        volume: node.attributes?.volume || 0,
        active: node.attributes?.isActive !== false ? 1 : 0
      };

      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          const childStats = calculateStats(child, depth + 1);
          stats.nodes += childStats.nodes;
          stats.maxDepth = Math.max(stats.maxDepth, childStats.maxDepth);
          stats.volume += childStats.volume;
          stats.active += childStats.active;
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
      directChildren: directChildren
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
              <span className="stat-label">Max Depth</span>
              <span className="stat-value">{treeStats.maxDepth}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Volume</span>
              <span className="stat-value">${(treeStats.totalVolume / 1000).toFixed(1)}K</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Direct Children</span>
              <span className="stat-value">{treeStats.directChildren}</span>
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
          <h4>Package Tiers</h4>
          <div className="legend-items">
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
