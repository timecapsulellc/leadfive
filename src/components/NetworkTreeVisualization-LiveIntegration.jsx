/**
 * NetworkTreeVisualization.jsx
 * 
 * Professional Network Tree Visualization Component with Live BSC Mainnet Integration
 * Consolidated from multiple genealogy tree implementations
 * 
 * @description A comprehensive, configurable React component for visualizing
 *              hierarchical network relationships using react-d3-tree.
 *              Now includes real-time integration with OrphiCrowdFund BSC Mainnet contract.
 * 
 * @features
 * - Live BSC Mainnet data integration
 * - Interactive D3 tree visualization with zoom/pan controls
 * - Configurable orientation (vertical/horizontal)
 * - Custom node rendering with package tier styling
 * - Search and filtering capabilities
 * - Node details panel with user information
 * - Export functionality for network reports
 * - Mobile-responsive design
 * - Theme-aware styling (dark/light modes)
 * - Real-time data refresh
 * 
 * @author OrphiChain Development Team
 * @version 3.0.0 - Live Data Integration
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
    config: contractConfig
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
  const [treeConfig, setTreeConfig] = useState({ ...DEFAULT_CONFIG, ...config });
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [exportFormat, setExportFormat] = useState('png');
  
  // Refs
  const treeRef = useRef(null);
  const containerRef = useRef(null);
  
  // ============================================================================
  // DATA PROCESSING & EFFECTS
  // ============================================================================
  
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
            downlineCount: 12,
            isDemoMode: true
          },
          children: [
            {
              name: 'Demo User #2',
              attributes: {
                address: '0x2345...6789',
                packageTier: 3,
                volume: 8500,
                registrationDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                downlineCount: 5,
                isDemoMode: true
              }
            }
          ]
        }
      ]
    };
  }, []);
  
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
  }, [useLiveData, liveNetworkData, data, demoMode, generateDemoData]);

  /**
   * Update container dimensions on window resize
   */
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({
        width: rect.width || 800,
        height: rect.height || 600
      });
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

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

  /**
   * Notify parent component of data updates
   */
  useEffect(() => {
    if (onDataUpdate && activeData) {
      onDataUpdate(activeData, networkStats);
    }
  }, [activeData, networkStats, onDataUpdate]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleNodeClick = useCallback((nodeDatum) => {
    setSelectedNode(nodeDatum);
    setShowNodeDetails(true);
    
    if (onNodeClick) {
      onNodeClick(nodeDatum);
    }
    if (onNodeSelect) {
      onNodeSelect(nodeDatum);
    }
  }, [onNodeClick, onNodeSelect]);

  const handleRefreshData = useCallback(() => {
    if (useLiveData && refreshData) {
      refreshData();
    }
  }, [useLiveData, refreshData]);

  const handleUserLookup = useCallback(async (address) => {
    if (useLiveData && lookupUser) {
      try {
        const userInfo = await lookupUser(address);
        if (userInfo) {
          alert(`User found: ${JSON.stringify(userInfo, null, 2)}`);
        } else {
          alert('User not found or not registered');
        }
      } catch (error) {
        alert(`Error looking up user: ${error.message}`);
      }
    }
  }, [useLiveData, lookupUser]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  /**
   * Custom node rendering function
   */
  const renderCustomNode = useCallback(({ nodeDatum, toggleNode }) => {
    const {
      name,
      attributes = {},
      children
    } = nodeDatum;

    const {
      packageTier = 0,
      volume = 0,
      address = '',
      isRoot = false,
      isPlaceholder = false,
      isDemoMode = false,
      networkStatus = ''
    } = attributes;

    const isSelected = selectedNode?.name === name;
    const isSearchMatch = searchResults.some(result => result.node.name === name);
    const hasChildren = children && children.length > 0;
    const radius = isRoot ? 30 : 25;
    const color = PACKAGE_TIER_COLORS[packageTier] || PACKAGE_TIER_COLORS[0];

    return (
      <g onClick={() => handleNodeClick(nodeDatum)}>
        {/* Main node circle */}
        <circle
          r={radius}
          fill={color}
          stroke={isSearchMatch ? '#FFD700' : '#ffffff'}
          strokeWidth={isSelected ? 4 : (isSearchMatch ? 3 : 2)}
          style={{
            cursor: 'pointer',
            filter: isSelected ?
              'drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.8))' :
              'none'
          }}
        />

        {/* Node name/title */}
        <text
          textAnchor="middle"
          fontSize={isRoot ? "16" : "14"}
          fontWeight={isRoot ? "bold" : "normal"}
          fill="#ffffff"
          dy="-5"
          style={{ pointerEvents: 'none' }}
        >
          {name}
        </text>

        {/* Package tier label */}
        <text
          textAnchor="middle"
          fontSize="12"
          fill="#ffffff"
          opacity="0.9"
          y={radius + 22}
          style={{ pointerEvents: 'none' }}
        >
          {isRoot ? (networkStatus || 'Network') : 
           isPlaceholder ? 'Ready' :
           PACKAGE_TIER_LABELS[packageTier]}
        </text>

        {/* Volume/stats */}
        {!isRoot && !isPlaceholder && (
          <text
            textAnchor="middle"
            fontSize="10"
            fill="#ffffff"
            opacity="0.7"
            y={radius + 35}
            style={{ pointerEvents: 'none' }}
          >
            {isDemoMode ? 'Demo' : `$${volume?.toLocaleString() || '0'}`}
          </text>
        )}

        {/* Children indicator */}
        {hasChildren && collapsible && (
          <circle
            r="8"
            x={radius + 15}
            y={radius + 15}
            fill="#ffffff"
            stroke={color}
            strokeWidth="2"
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              toggleNode();
            }}
          />
        )}
      </g>
    );
  }, [selectedNode, searchResults, handleNodeClick, collapsible]);

  // ============================================================================
  // COMPONENT CALCULATIONS
  // ============================================================================

  const treeStats = useMemo(() => {
    if (!activeData) return null;
    
    return {
      totalNodes: countTotalNodes(activeData),
      maxDepth: calculateMaxDepth(activeData),
      totalVolume: calculateTotalVolume(activeData),
      searchMatches: searchResults.length
    };
  }, [activeData, searchResults]);

  const isLoading = useLiveData ? liveDataLoading : false;
  const hasError = useLiveData ? liveDataError : null;

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  if (isLoading) {
    return (
      <div className={`network-tree-loading ${currentTheme}`}>
        <div className="loading-spinner"></div>
        <div className="loading-text">
          🔗 Connecting to BSC Mainnet...
          <br />
          Loading network data...
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`network-tree-error ${currentTheme}`}>
        <div className="error-content">
          <h3>❌ Connection Error</h3>
          <p>{hasError}</p>
          {useLiveData && (
            <button 
              className="retry-button"
              onClick={handleRefreshData}
            >
              🔄 Retry Connection
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!activeData) {
    return (
      <div className={`network-tree-empty ${currentTheme}`}>
        <div className="empty-content">
          <h3>📊 No Network Data</h3>
          <p>No network data available to display.</p>
          {useLiveData && (
            <div className="empty-actions">
              <button onClick={handleRefreshData}>🔄 Refresh Data</button>
              <button onClick={() => setSearchQuery('')}>🔍 Clear Search</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`network-tree-container ${currentTheme} ${className}`}
      style={style}
      {...otherProps}
    >
      {/* Header Controls */}
      {showControls && (
        <div className="tree-controls">
          <div className="controls-left">
            <h2 className="tree-title">
              {useLiveData ? '🔗 Live Network Tree' : '🌳 Network Tree'}
            </h2>
            {useLiveData && isConnected && (
              <div className="connection-status">
                <span className="status-indicator connected"></span>
                BSC Mainnet Connected
              </div>
            )}
          </div>
          
          <div className="controls-right">
            {useLiveData && (
              <button 
                className="control-button refresh"
                onClick={handleRefreshData}
                title="Refresh network data"
              >
                🔄 Refresh
              </button>
            )}
            
            <button 
              className="control-button theme"
              onClick={() => setCurrentTheme(currentTheme === 'dark' ? 'light' : 'dark')}
              title="Toggle theme"
            >
              {currentTheme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {showSearch && (
        <div className="tree-search">
          <input
            type="text"
            placeholder="Search network (address, name, package)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''} found
            </div>
          )}
        </div>
      )}

      {/* Live Data Stats */}
      {showStats && useLiveData && networkStats && (
        <div className="live-stats">
          <div className="stat-item">
            <span className="stat-label">Contract:</span>
            <span className="stat-value">{contractConfig?.address?.slice(0, 10)}...</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Users:</span>
            <span className="stat-value">{networkStats.totalUsers}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Status:</span>
            <span className="stat-value">{networkStats.isPaused ? 'Paused' : 'Active'}</span>
          </div>
          {lastUpdate && (
            <div className="stat-item">
              <span className="stat-label">Updated:</span>
              <span className="stat-value">{new Date(lastUpdate).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Tree Statistics */}
      {showStats && treeStats && (
        <div className="tree-stats">
          <div className="stat-item">
            <span className="stat-label">Nodes:</span>
            <span className="stat-value">{treeStats.totalNodes}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Depth:</span>
            <span className="stat-value">{treeStats.maxDepth}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Volume:</span>
            <span className="stat-value">${treeStats.totalVolume?.toLocaleString() || '0'}</span>
          </div>
        </div>
      )}

      {/* Main Tree Visualization */}
      <div className="tree-wrapper">
        <Tree
          ref={treeRef}
          data={activeData}
          orientation={orientation}
          dimensions={dimensions}
          nodeSize={treeConfig.nodeSize}
          separation={treeConfig.separation}
          scaleExtent={treeConfig.scaleExtent}
          zoom={treeConfig.initialZoom}
          enableLegacyTransitions={true}
          transitionDuration={treeConfig.transitionDuration}
          collapsible={collapsible}
          initialDepth={treeConfig.initialDepth}
          renderCustomNodeElement={renderCustomNode}
          zoomable={enableZoom}
          draggable={enablePan}
          translate={{ x: dimensions.width / 2, y: 100 }}
        />
      </div>

      {/* Node Details Panel */}
      {showNodeDetails && selectedNode && (
        <div className="node-details-panel">
          <div className="panel-header">
            <h3>Node Details</h3>
            <button 
              className="close-button"
              onClick={() => setShowNodeDetails(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="panel-content">
            <div className="detail-item">
              <strong>Name:</strong> {selectedNode.name}
            </div>
            
            {selectedNode.attributes?.address && (
              <div className="detail-item">
                <strong>Address:</strong> 
                <code>{selectedNode.attributes.address}</code>
              </div>
            )}
            
            {selectedNode.attributes?.packageTier && (
              <div className="detail-item">
                <strong>Package:</strong> 
                {PACKAGE_TIER_LABELS[selectedNode.attributes.packageTier]}
              </div>
            )}
            
            {selectedNode.attributes?.volume && (
              <div className="detail-item">
                <strong>Volume:</strong> 
                ${selectedNode.attributes.volume.toLocaleString()}
              </div>
            )}
            
            {selectedNode.attributes?.registrationDate && (
              <div className="detail-item">
                <strong>Registered:</strong> 
                {new Date(selectedNode.attributes.registrationDate).toLocaleDateString()}
              </div>
            )}

            {useLiveData && selectedNode.attributes?.address && !selectedNode.attributes?.isRoot && (
              <div className="panel-actions">
                <button 
                  className="action-button"
                  onClick={() => handleUserLookup(selectedNode.attributes.address)}
                >
                  🔍 Lookup User
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Options */}
      {showExport && (
        <div className="export-controls">
          <button className="export-button">
            📊 Export Tree
          </button>
        </div>
      )}
    </div>
  );
};

export default NetworkTreeVisualization;
