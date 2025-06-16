/**
 * NetworkTreeVisualization.jsx
 * 
 * Professional Network Tree Visualization Component
 * Consolidated from multiple genealogy tree implementations
 * 
 * @description A comprehensive, configurable React component for visualizing
 *              hierarchical network relationships using react-d3-tree.
 *              Designed for blockchain/MLM network structures with OrphiChain branding.
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
  // CUSTOM NODE RENDERER
  // ============================================================================
  
  const defaultNodeRenderer = useCallback((rd3tProps) => {
    const { nodeDatum } = rd3tProps;
    const isRoot = nodeDatum.attributes?.isRoot;
    const radius = isRoot ? 30 : 25;
    const color = isRoot ? '#00D4FF' : getPackageTierColor(nodeDatum.attributes?.packageTier);
    const isSelected = selectedNode?.name === nodeDatum.name;
    const isSearchMatch = searchResults.some(result => result.node.name === nodeDatum.name);
    
    return (
      &lt;g onClick={() => handleNodeClick(nodeDatum)}&gt;
        {/* Node Circle */}
        &lt;circle
          r={radius}
          fill={color}
          stroke={isSearchMatch ? '#FFD700' : '#ffffff'}
          strokeWidth={isSelected ? 4 : (isSearchMatch ? 3 : 2)}
          style={{
            cursor: 'pointer',
            filter: isSelected ? 
              'brightness(1.3) drop-shadow(0 0 8px rgba(255,255,255,0.6))' : 
              'brightness(1) drop-shadow(0 0 8px rgba(255,255,255,0.4))'
          }}
        /&gt;
        
        {/* Center Icon */}
        &lt;text
          fill="#ffffff"
          fontSize={isRoot ? "16" : "14"}
          textAnchor="middle"
          y="5"
          fontWeight="bold"
        &gt;
          {isRoot ? '🏢' : '👤'}
        &lt;/text&gt;
        
        {/* User Name */}
        &lt;text
          fill="#fff"
          fontSize="18"
          fontWeight="bold"
          textAnchor="middle"
          y={radius + 22}
          dominantBaseline="middle"
          alignmentBaseline="middle"
          stroke="#000"
          strokeWidth="4"
          paintOrder="stroke fill"
          style={{
            filter: 'drop-shadow(0 2px 2px #000)',
            textShadow: '0 2px 8px #000, 0 0 4px #fff',
            letterSpacing: '1px',
            wordSpacing: '2px',
          }}
        &gt;
          {nodeDatum.name}
        &lt;/text&gt;
        
        {/* Package Tier Label */}
        {!isRoot && (
          &lt;text
            fill="#fff"
            fontSize="14"
            fontWeight="600"
            textAnchor="middle"
            y={radius + 42}
            dominantBaseline="middle"
            alignmentBaseline="middle"
            stroke="#000"
            strokeWidth="3"
            paintOrder="stroke fill"
            style={{
              filter: 'drop-shadow(0 1px 1px #000)',
              textShadow: '0 1px 4px #000, 0 0 3px #fff',
              letterSpacing: '1px',
              wordSpacing: '2px',
            }}
          &gt;
            {getPackageTierLabel(nodeDatum.attributes?.packageTier)}
          &lt;/text&gt;
        )}
        
        {/* Address */}
        {nodeDatum.attributes?.address && nodeDatum.attributes.address !== 'Root' && (
          &lt;text
            fill="#fff"
            fontSize="14"
            fontWeight="600"
            textAnchor="middle"
            y={-radius - 12}
            dominantBaseline="middle"
            alignmentBaseline="middle"
            stroke="#000"
            strokeWidth="3"
            paintOrder="stroke fill"
            style={{
              filter: 'drop-shadow(0 1px 1px #000)',
              textShadow: '0 1px 4px #000, 0 0 3px #fff',
              letterSpacing: '1px',
              wordSpacing: '1px',
            }}
          &gt;
            {nodeDatum.attributes.address.slice(0, 8)}...
          &lt;/text&gt;
        )}
        
        {/* Volume Badge */}
        {!isRoot && nodeDatum.attributes?.volume > 0 && (
          &lt;&gt;
            &lt;rect
              x="-25"
              y={-radius - 5}
              width="50"
              height="12"
              rx="6"
              fill="rgba(0, 212, 255, 0.8)"
            /&gt;
            &lt;text
              fill="#ffffff"
              fontSize="8"
              fontWeight="600"
              textAnchor="middle"
              y={-radius + 3}
            &gt;
              ${(nodeDatum.attributes.volume / 1000).toFixed(1)}K
            &lt;/text&gt;
          &lt;/&gt;
        )}
      &lt;/g&gt;
    );
  }, [selectedNode, searchResults]);
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleNodeClick = useCallback((nodeDatum) => {
    setSelectedNode(nodeDatum);
    if (onNodeClick) {
      onNodeClick(nodeDatum);
    }
  }, [onNodeClick]);
  
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
    setCurrentZoom(initialZoom);
    setSelectedNode(null);
    setSearchQuery('');
  }, [initialZoom]);
  
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
  // LOADING STATE
  // ============================================================================
  
  if (liveDataLoading || !activeData) {
    return (
      &lt;div className={`network-tree-loading theme-${theme}`}&gt;
        &lt;div className="loading-spinner"&gt;
          &lt;div className="spinner-ring">&lt;/div&gt;
        &lt;/div&gt;
        &lt;p&gt;Loading network tree...&lt;/p&gt;
      &lt;/div&gt;
    );
  }
  
  // ============================================================================
  // RENDER MAIN COMPONENT
  // ============================================================================
  
  return (
    &lt;div className={`network-tree-visualization theme-${theme}`} ref={containerRef}&gt;
      
      {/* Header with Stats */}
      {showStats && (
        &lt;div className="tree-header"&gt;
          &lt;div className="tree-stats"&gt;
            &lt;div className="stat-item"&gt;
              &lt;span className="stat-label"&gt;Total Nodes&lt;/span&gt;
              &lt;span className="stat-value"&gt;{treeStats.totalNodes}&lt;/span&gt;
            &lt;/div&gt;
            &lt;div className="stat-item"&gt;
              &lt;span className="stat-label"&gt;Max Depth&lt;/span&gt;
              &lt;span className="stat-value"&gt;{treeStats.maxDepth}&lt;/span&gt;
            &lt;/div&gt;
            &lt;div className="stat-item"&gt;
              &lt;span className="stat-label"&gt;Total Volume&lt;/span&gt;
              &lt;span className="stat-value"&gt;${(treeStats.totalVolume / 1000).toFixed(1)}K&lt;/span&gt;
            &lt;/div&gt;
            &lt;div className="stat-item"&gt;
              &lt;span className="stat-label"&gt;Direct Children&lt;/span&gt;
              &lt;span className="stat-value"&gt;{treeStats.directChildren}&lt;/span&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      )}
      
      {/* Controls */}
      {showControls && (
        &lt;div className="tree-controls"&gt;
          {/* Orientation Control */}
          &lt;div className="control-group"&gt;
            &lt;label&gt;Orientation:&lt;/label&gt;
            &lt;select 
              value={currentOrientation} 
              onChange={(e) =&gt; handleOrientationChange(e.target.value)}
              className="control-select"
            &gt;
              &lt;option value="vertical"&gt;Vertical&lt;/option&gt;
              &lt;option value="horizontal"&gt;Horizontal&lt;/option&gt;
            &lt;/select&gt;
          &lt;/div&gt;
          
          {/* Zoom Control */}
          &lt;div className="control-group"&gt;
            &lt;label&gt;Zoom:&lt;/label&gt;
            &lt;input
              type="range"
              min={scaleExtent.min}
              max={scaleExtent.max}
              step="0.1"
              value={currentZoom}
              onChange={(e) =&gt; handleZoomChange(parseFloat(e.target.value))}
              className="zoom-slider"
            /&gt;
            &lt;span className="zoom-value"&gt;{(currentZoom * 100).toFixed(0)}%&lt;/span&gt;
          &lt;/div&gt;
          
          {/* Search Control */}
          {showSearch && (
            &lt;div className="control-group"&gt;
              &lt;label&gt;Search:&lt;/label&gt;
              &lt;input
                type="text"
                placeholder="Search users or addresses..."
                value={searchQuery}
                onChange={(e) =&gt; handleSearchChange(e.target.value)}
                className="search-input"
              /&gt;
              {searchResults.length > 0 && (
                &lt;span className="search-results"&gt;{searchResults.length} found&lt;/span&gt;
              )}
            &lt;/div&gt;
          )}
          
          {/* Reset Button */}
          &lt;button className="reset-btn" onClick={resetView}&gt;
            Reset View
          &lt;/button&gt;
        &lt;/div&gt;
      )}
      
      {/* Tree Container */}
      &lt;div className="tree-container" style={{ height: '600px', width: '100%' }}&gt;
        &lt;Tree
          ref={treeRef}
          {...treeConfigProps}
        /&gt;
      &lt;/div&gt;
      
      {/* Node Details Panel */}
      {showNodeDetails && selectedNode && (
        &lt;div className="node-details-panel"&gt;
          &lt;div className="panel-header"&gt;
            &lt;h3&gt;Node Details&lt;/h3&gt;
            &lt;button 
              className="close-btn"
              onClick={() =&gt; setSelectedNode(null)}
            &gt;
              ✕
            &lt;/button&gt;
          &lt;/div&gt;
          &lt;div className="panel-content"&gt;
            &lt;div className="detail-row"&gt;
              &lt;span className="detail-label"&gt;Name:&lt;/span&gt;
              &lt;span className="detail-value"&gt;{selectedNode.name}&lt;/span&gt;
            &lt;/div&gt;
            &lt;div className="detail-row"&gt;
              &lt;span className="detail-label"&gt;Address:&lt;/span&gt;
              &lt;span className="detail-value"&gt;{selectedNode.attributes?.address}&lt;/span&gt;
            &lt;/div&gt;
            &lt;div className="detail-row"&gt;
              &lt;span className="detail-label"&gt;Package:&lt;/span&gt;
              &lt;span className="detail-value"&gt;
                {getPackageTierLabel(selectedNode.attributes?.packageTier)}
              &lt;/span&gt;
            &lt;/div&gt;
            &lt;div className="detail-row"&gt;
              &lt;span className="detail-label"&gt;Volume:&lt;/span&gt;
              &lt;span className="detail-value"&gt;
                ${selectedNode.attributes?.volume?.toLocaleString()}
              &lt;/span&gt;
            &lt;/div&gt;
            &lt;div className="detail-row"&gt;
              &lt;span className="detail-label"&gt;Downline:&lt;/span&gt;
              &lt;span className="detail-value"&gt;{selectedNode.attributes?.downlineCount || 0}&lt;/span&gt;
            &lt;/div&gt;
            {selectedNode.attributes?.registrationDate && (
              &lt;div className="detail-row"&gt;
                &lt;span className="detail-label"&gt;Registered:&lt;/span&gt;
                &lt;span className="detail-value"&gt;
                  {new Date(selectedNode.attributes.registrationDate).toLocaleDateString()}
                &lt;/span&gt;
              &lt;/div&gt;
            )}
          &lt;/div&gt;
        &lt;/div&gt;
      )}
      
      {/* Legend */}
      {showLegend && (
        &lt;div className="tree-legend"&gt;
          &lt;h4&gt;Package Tiers&lt;/h4&gt;
          &lt;div className="legend-items"&gt;
            {Object.entries(PACKAGE_TIER_LABELS).map(([tier, label]) =&gt; (
              &lt;div key={tier} className="legend-item"&gt;
                &lt;div 
                  className="legend-color" 
                  style={{ backgroundColor: getPackageTierColor(parseInt(tier)) }}
                &gt;&lt;/div&gt;
                &lt;span&gt;{label} Package&lt;/span&gt;
              &lt;/div&gt;
            ))}
          &lt;/div&gt;
        &lt;/div&gt;
      )}
      
    &lt;/div&gt;
  );
};

export default NetworkTreeVisualization;
