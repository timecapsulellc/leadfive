/**
 * Community Levels Visualization - PhD-Level Implementation
 *
 * Unified genealogy tree component that aligns with LeadFive Business Plan 2025
 * - Uses approved terminology (Community Levels, Community Structure, Introductions)
 * - Integrates with smart contract data
 * - High-performance D3 visualization
 * - Real-time analytics and insights
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import Tree from 'react-d3-tree';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers,
  FaChartLine,
  FaSearch,
  FaExpand,
  FaCompress,
  FaDownload,
  FaEye,
  FaEyeSlash,
  FaBullseye,
  FaCrown,
  FaGem,
  FaCoins,
  FaNetworkWired,
  FaRocket,
  FaAward,
} from 'react-icons/fa';
import './CommunityLevelsVisualization.css';

const CommunityLevelsVisualization = ({
  userAddress,
  contractInstance,
  mode = 'standard', // standard, enhanced, analytics
  showControls = true,
  initialDepth = 3,
}) => {
  // State management
  const [communityData, setCommunityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('tree'); // tree, list, analytics
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [treeDepth, setTreeDepth] = useState(initialDepth);
  const [analytics, setAnalytics] = useState({});
  const [filters, setFilters] = useState({
    activeOnly: false,
    minLevel: 1,
    maxLevel: 6,
    packageType: 'all',
  });

  const treeRef = useRef(null);
  const containerRef = useRef(null);

  // Load community data from smart contract
  useEffect(() => {
    if (userAddress && contractInstance) {
      loadCommunityData();
    } else {
      // Load demo data for development
      loadDemoData();
    }
  }, [userAddress, contractInstance, filters]);

  const loadCommunityData = async () => {
    try {
      setLoading(true);

      // Fetch user's community structure from smart contract
      const userInfo = await contractInstance.getUserInfo(userAddress);
      const introductions =
        await contractInstance.getUserReferrals(userAddress);
      const levels = await contractInstance.getNetworkLevels(userAddress, 6);

      // Build community tree structure
      const tree = await buildCommunityTree(
        userAddress,
        userInfo,
        introductions,
        levels
      );
      setCommunityData(tree);

      // Calculate analytics
      const analyticsData = calculateAnalytics(tree);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading community data:', error);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    const demoData = generateDemoCommunityData(userAddress);
    setCommunityData(demoData);
    setAnalytics(calculateAnalytics(demoData));
    setLoading(false);
  };

  // Generate demo community data aligned with business plan
  const generateDemoCommunityData = address => {
    const packages = [
      { id: 1, name: 'Bronze', price: 30, color: '#CD7F32', earnings: 120 },
      { id: 2, name: 'Silver', price: 50, color: '#C0C0C0', earnings: 200 },
      { id: 3, name: 'Gold', price: 100, color: '#FFD700', earnings: 400 },
      { id: 4, name: 'Diamond', price: 200, color: '#7B2CBF', earnings: 800 },
    ];

    const getRandomPackage = () =>
      packages[Math.floor(Math.random() * packages.length)];
    const generateAddress = () =>
      `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`;

    const generateNode = (level, position, parentPackage = null) => {
      const pkg = getRandomPackage();
      const isActive = Math.random() > 0.2; // 80% active rate
      const directIntroductions = Math.floor(Math.random() * 20);
      const teamSize = Math.floor(Math.random() * 100) + directIntroductions;
      const volume = teamSize * pkg.price * (0.8 + Math.random() * 0.4);
      const currentEarnings = Math.min(volume * 0.4, pkg.earnings); // 4x cap

      return {
        name: level === 1 ? 'YOU' : `Level ${level}`,
        attributes: {
          address:
            level === 1 ? address || generateAddress() : generateAddress(),
          level: level,
          position: position,
          package: pkg,
          isActive: isActive,
          directIntroductions: directIntroductions,
          teamSize: teamSize,
          volume: volume,
          earnings: currentEarnings,
          earningsPercentage: (currentEarnings / pkg.earnings) * 100,
          joinDate: new Date(
            Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split('T')[0],
          lastActivity: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split('T')[0],
          // Business plan reward structure
          directCommunityBonus: volume * 0.4, // 40%
          levelRewards: volume * 0.1, // 10%
          globalRewards: volume * 0.1, // 10%
          leadershipRewards: directIntroductions >= 5 ? volume * 0.1 : 0, // 10% if qualified
          communityGrowthPool: volume * 0.3, // 30%
          // Collection rates based on introductions
          collectionRate:
            directIntroductions >= 20 ? 90 : directIntroductions >= 5 ? 80 : 70,
          reinvestmentRate:
            directIntroductions >= 20 ? 10 : directIntroductions >= 5 ? 20 : 30,
        },
      };
    };

    const generateChildren = (level, maxLevel, count) => {
      if (level >= maxLevel) return [];
      const children = [];
      for (let i = 0; i < count && i < 5; i++) {
        const child = generateNode(level + 1, `${level}-${i}`);
        child.children = generateChildren(
          level + 1,
          maxLevel,
          Math.floor(Math.random() * 3)
        );
        children.push(child);
      }
      return children;
    };

    const root = generateNode(1, 'root');
    root.children = generateChildren(1, 7, 8); // Up to 6 levels deep

    return root;
  };

  // Calculate comprehensive analytics
  const calculateAnalytics = data => {
    if (!data) return {};

    const analytics = {
      totalMembers: 0,
      activemembers: 0,
      totalVolume: 0,
      totalEarnings: 0,
      levelBreakdown: {},
      packageBreakdown: {},
      performanceMetrics: {},
      growthProjections: {},
    };

    const traverse = (node, level = 1) => {
      analytics.totalMembers++;
      if (node.attributes?.isActive) analytics.activemembers++;
      analytics.totalVolume += node.attributes?.volume || 0;
      analytics.totalEarnings += node.attributes?.earnings || 0;

      // Level breakdown
      if (!analytics.levelBreakdown[level]) {
        analytics.levelBreakdown[level] = { count: 0, volume: 0, earnings: 0 };
      }
      analytics.levelBreakdown[level].count++;
      analytics.levelBreakdown[level].volume += node.attributes?.volume || 0;
      analytics.levelBreakdown[level].earnings +=
        node.attributes?.earnings || 0;

      // Package breakdown
      const packageName = node.attributes?.package?.name || 'Unknown';
      if (!analytics.packageBreakdown[packageName]) {
        analytics.packageBreakdown[packageName] = { count: 0, volume: 0 };
      }
      analytics.packageBreakdown[packageName].count++;
      analytics.packageBreakdown[packageName].volume +=
        node.attributes?.volume || 0;

      if (node.children) {
        node.children.forEach(child => traverse(child, level + 1));
      }
    };

    traverse(data);

    // Calculate performance metrics
    analytics.performanceMetrics = {
      averageVolume: analytics.totalVolume / analytics.totalMembers,
      activenessRate: (analytics.activemembers / analytics.totalMembers) * 100,
      earningsEfficiency:
        (analytics.totalEarnings / analytics.totalVolume) * 100,
      communityDepth: Math.max(
        ...Object.keys(analytics.levelBreakdown).map(Number)
      ),
      communityWidth: analytics.levelBreakdown[2]?.count || 0,
    };

    return analytics;
  };

  // Custom node renderer with business plan styling
  const renderCommunityNode = useCallback(
    ({ nodeDatum, toggleNode }) => {
      const { name, attributes } = nodeDatum;
      const isRoot = attributes?.level === 1;
      const isSelected =
        selectedNode?.attributes?.address === attributes?.address;
      const isHighlighted =
        searchTerm &&
        (name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          attributes?.address
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const nodeRadius = isRoot ? 60 : 45;
      const packageInfo = attributes?.package || {
        name: 'Unknown',
        color: '#6B7280',
      };

      return (
        <g
          onClick={e => {
            e.stopPropagation();
            setSelectedNode(nodeDatum);
            toggleNode();
          }}
          style={{ cursor: 'pointer' }}
        >
          {/* Node glow effect */}
          <defs>
            <filter
              id={`glow-${attributes?.address?.replace(/[^a-zA-Z0-9]/g, '')}`}
            >
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="4"
                floodColor={packageInfo.color}
                floodOpacity={isSelected ? '0.8' : '0.4'}
              />
            </filter>

            <radialGradient
              id={`gradient-${attributes?.address?.replace(/[^a-zA-Z0-9]/g, '')}`}
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop
                offset="50%"
                stopColor={packageInfo.color}
                stopOpacity="0.7"
              />
              <stop
                offset="100%"
                stopColor={packageInfo.color}
                stopOpacity="1"
              />
            </radialGradient>
          </defs>

          {/* Selection ring */}
          {(isSelected || isHighlighted) && (
            <circle
              r={nodeRadius + 8}
              fill="none"
              stroke={isSelected ? '#00D4FF' : '#FFD700'}
              strokeWidth="3"
              strokeDasharray="5,5"
              opacity="0.8"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0;360"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          )}

          {/* Main node circle */}
          <circle
            r={nodeRadius}
            fill={`url(#gradient-${attributes?.address?.replace(/[^a-zA-Z0-9]/g, '')})`}
            stroke={isRoot ? '#7B2CBF' : packageInfo.color}
            strokeWidth={isRoot ? '4' : '2'}
            filter={`url(#glow-${attributes?.address?.replace(/[^a-zA-Z0-9]/g, '')})`}
            opacity={attributes?.isActive ? '1' : '0.6'}
          />

          {/* Inner decorative ring */}
          <circle
            r={nodeRadius - 8}
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1"
          />

          {/* Activity indicator */}
          {attributes?.isActive && (
            <circle
              r="6"
              cx={nodeRadius - 15}
              cy={-nodeRadius + 15}
              fill="#10B981"
              stroke="#ffffff"
              strokeWidth="2"
            />
          )}

          {/* Package indicator */}
          <circle
            r="12"
            cx={-nodeRadius + 15}
            cy={-nodeRadius + 15}
            fill={packageInfo.color}
            stroke="#ffffff"
            strokeWidth="2"
          />
          <text
            x={-nodeRadius + 15}
            y={-nodeRadius + 20}
            textAnchor="middle"
            fill="white"
            fontSize="10"
            fontWeight="bold"
          >
            {packageInfo.name.charAt(0)}
          </text>

          {/* Node text */}
          <text
            textAnchor="middle"
            fill="white"
            fontSize={isRoot ? '14' : '12'}
            fontWeight="bold"
            dy="-8"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
          >
            {name.length > 12 ? `${name.substring(0, 12)}...` : name}
          </text>

          {/* Level indicator */}
          <text
            textAnchor="middle"
            fill="rgba(255,255,255,0.9)"
            fontSize="10"
            dy="6"
          >
            Level {attributes?.level}
          </text>

          {/* Package and earnings */}
          <text
            textAnchor="middle"
            fill="#FFD700"
            fontSize="9"
            fontWeight="bold"
            dy="20"
          >
            ${packageInfo.price} {packageInfo.name}
          </text>

          {/* Team size indicator */}
          {attributes?.teamSize && (
            <g>
              <circle
                r="10"
                cy={nodeRadius + 20}
                fill="rgba(0,0,0,0.7)"
                stroke={packageInfo.color}
                strokeWidth="1"
              />
              <text
                y={nodeRadius + 25}
                textAnchor="middle"
                fill="white"
                fontSize="8"
                fontWeight="bold"
              >
                {attributes.teamSize > 99 ? '99+' : attributes.teamSize}
              </text>
            </g>
          )}

          {/* Earnings progress indicator */}
          {attributes?.earningsPercentage && (
            <g>
              <circle
                r="15"
                cy={-nodeRadius - 25}
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
              />
              <circle
                r="15"
                cy={-nodeRadius - 25}
                fill="none"
                stroke="#00FF88"
                strokeWidth="2"
                strokeDasharray={`${(attributes.earningsPercentage / 100) * 94} 94`}
                transform={`rotate(-90)`}
              />
              <text
                y={-nodeRadius - 20}
                textAnchor="middle"
                fill="white"
                fontSize="7"
                fontWeight="bold"
              >
                {Math.round(attributes.earningsPercentage)}%
              </text>
            </g>
          )}
        </g>
      );
    },
    [selectedNode, searchTerm]
  );

  // Tree configuration
  const treeConfig = useMemo(
    () => ({
      nodeSize: { x: 200, y: 180 },
      separation: { siblings: 1.5, nonSiblings: 2 },
      translate: { x: 400, y: 100 },
      orientation: 'vertical',
      pathFunc: 'step',
      enableLegacyTransitions: true,
      transitionDuration: 500,
      collapsible: true,
      initialDepth: treeDepth,
      zoom: 0.8,
      scaleExtent: { min: 0.1, max: 2 },
      shouldCollapseNeighborNodes: false,
      pathClassFunc: () => 'community-link',
      svgClassName: 'community-levels-svg',
    }),
    [treeDepth]
  );

  // Filter community data based on current filters
  const filteredData = useMemo(() => {
    if (!communityData) return null;

    const filterNode = node => {
      const attrs = node.attributes;
      if (!attrs) return node;

      // Apply filters
      if (filters.activeOnly && !attrs.isActive) return null;
      if (attrs.level < filters.minLevel || attrs.level > filters.maxLevel)
        return null;
      if (
        filters.packageType !== 'all' &&
        attrs.package?.name !== filters.packageType
      )
        return null;

      // Filter children recursively
      const filteredChildren =
        node.children?.map(filterNode).filter(Boolean) || [];

      return {
        ...node,
        children: filteredChildren,
      };
    };

    return filterNode(communityData);
  }, [communityData, filters]);

  if (loading) {
    return (
      <div className="community-levels-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <FaUsers size={40} color="#7B2CBF" />
        </motion.div>
        <p>Loading Community Levels...</p>
      </div>
    );
  }

  return (
    <div
      className={`community-levels-container ${isFullscreen ? 'fullscreen' : ''}`}
      ref={containerRef}
    >
      {/* Header and Controls */}
      {showControls && (
        <motion.div
          className="community-controls"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="controls-header">
            <h3>
              <FaUsers className="header-icon" />
              Community Levels Visualization
            </h3>
            <div className="view-mode-buttons">
              {['tree', 'analytics'].map(mode => (
                <button
                  key={mode}
                  className={`mode-btn ${viewMode === mode ? 'active' : ''}`}
                  onClick={() => setViewMode(mode)}
                >
                  {mode === 'tree' ? <FaUsers /> : <FaChartLine />}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="controls-panel">
            {/* Search */}
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search community members..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Filters */}
            <div className="filters-container">
              <select
                value={filters.packageType}
                onChange={e =>
                  setFilters({ ...filters, packageType: e.target.value })
                }
                className="filter-select"
              >
                <option value="all">All Packages</option>
                <option value="Bronze">Bronze ($30)</option>
                <option value="Silver">Silver ($50)</option>
                <option value="Gold">Gold ($100)</option>
                <option value="Diamond">Diamond ($200)</option>
              </select>

              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.activeOnly}
                  onChange={e =>
                    setFilters({ ...filters, activeOnly: e.target.checked })
                  }
                />
                Active Only
              </label>

              <div className="depth-control">
                <label>Depth: {treeDepth}</label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={treeDepth}
                  onChange={e => setTreeDepth(parseInt(e.target.value))}
                  className="depth-slider"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="action-buttons">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="action-btn"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>

              <button className="action-btn" title="Export Data">
                <FaDownload />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="community-content">
        {viewMode === 'tree' && (
          <div className="tree-visualization">
            {filteredData && (
              <Tree
                data={filteredData}
                renderCustomNodeElement={renderCommunityNode}
                {...treeConfig}
                ref={treeRef}
              />
            )}
          </div>
        )}

        {viewMode === 'analytics' && (
          <CommunityAnalytics
            analytics={analytics}
            communityData={communityData}
          />
        )}
      </div>

      {/* Node Details Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            className="node-details-panel"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <NodeDetailsPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Node Details Panel Component
const NodeDetailsPanel = ({ node, onClose }) => {
  const { attributes } = node;
  const packageInfo = attributes?.package || {};

  return (
    <div className="node-details">
      <div className="details-header">
        <h4>Community Member Details</h4>
        <button onClick={onClose} className="close-btn">
          ×
        </button>
      </div>

      <div className="details-content">
        <div className="member-info">
          <div
            className="member-avatar"
            style={{ backgroundColor: packageInfo.color }}
          >
            {packageInfo.name?.charAt(0) || 'U'}
          </div>
          <div className="member-basic">
            <h5>{node.name}</h5>
            <p className="member-address">{attributes?.address}</p>
            <div
              className={`status-badge ${attributes?.isActive ? 'active' : 'inactive'}`}
            >
              {attributes?.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <FaGem className="detail-icon" />
            <span className="detail-label">Package</span>
            <span className="detail-value">
              ${packageInfo.price} {packageInfo.name}
            </span>
          </div>

          <div className="detail-item">
            <FaUsers className="detail-icon" />
            <span className="detail-label">Team Size</span>
            <span className="detail-value">{attributes?.teamSize || 0}</span>
          </div>

          <div className="detail-item">
            <FaCoins className="detail-icon" />
            <span className="detail-label">Volume</span>
            <span className="detail-value">
              ${attributes?.volume?.toFixed(2) || '0.00'}
            </span>
          </div>

          <div className="detail-item">
            <FaRocket className="detail-icon" />
            <span className="detail-label">Earnings</span>
            <span className="detail-value">
              ${attributes?.earnings?.toFixed(2) || '0.00'}
            </span>
          </div>

          <div className="detail-item">
            <FaUsers className="detail-icon" />
            <span className="detail-label">Direct Introductions</span>
            <span className="detail-value">
              {attributes?.directIntroductions || 0}
            </span>
          </div>

          <div className="detail-item">
            <FaChartLine className="detail-icon" />
            <span className="detail-label">Collection Rate</span>
            <span className="detail-value">
              {attributes?.collectionRate || 70}%
            </span>
          </div>
        </div>

        <div className="earnings-breakdown">
          <h6>Earnings Breakdown (Business Plan)</h6>
          <div className="breakdown-item">
            <span>Direct Community Bonus (40%)</span>
            <span>${(attributes?.directCommunityBonus || 0).toFixed(2)}</span>
          </div>
          <div className="breakdown-item">
            <span>Level Rewards (10%)</span>
            <span>${(attributes?.levelRewards || 0).toFixed(2)}</span>
          </div>
          <div className="breakdown-item">
            <span>Global Rewards (10%)</span>
            <span>${(attributes?.globalRewards || 0).toFixed(2)}</span>
          </div>
          <div className="breakdown-item">
            <span>Leadership Rewards (10%)</span>
            <span>${(attributes?.leadershipRewards || 0).toFixed(2)}</span>
          </div>
          <div className="breakdown-item">
            <span>Community Growth Pool (30%)</span>
            <span>${(attributes?.communityGrowthPool || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Community Analytics Component
const CommunityAnalytics = ({ analytics, communityData }) => {
  return (
    <div className="community-analytics">
      <div className="analytics-header">
        <h4>
          <FaChartLine className="analytics-icon" />
          Community Performance Analytics
        </h4>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="card-header">
            <FaUsers className="card-icon" />
            <h5>Community Overview</h5>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{analytics.totalMembers}</span>
              <span className="stat-label">Total Members</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{analytics.activemembers}</span>
              <span className="stat-label">Active Members</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {Math.round(analytics.performanceMetrics?.activenessRate || 0)}%
              </span>
              <span className="stat-label">Activity Rate</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {analytics.performanceMetrics?.communityDepth || 0}
              </span>
              <span className="stat-label">Community Depth</span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <FaCoins className="card-icon" />
            <h5>Financial Metrics</h5>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">
                ${analytics.totalVolume?.toFixed(0) || 0}
              </span>
              <span className="stat-label">Total Volume</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                ${analytics.totalEarnings?.toFixed(0) || 0}
              </span>
              <span className="stat-label">Total Earnings</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                ${Math.round(analytics.performanceMetrics?.averageVolume || 0)}
              </span>
              <span className="stat-label">Avg Volume</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {Math.round(
                  analytics.performanceMetrics?.earningsEfficiency || 0
                )}
                %
              </span>
              <span className="stat-label">Efficiency</span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <FaGem className="card-icon" />
            <h5>Package Distribution</h5>
          </div>
          <div className="package-breakdown">
            {Object.entries(analytics.packageBreakdown || {}).map(
              ([pkg, data]) => (
                <div key={pkg} className="package-item">
                  <span className="package-name">{pkg}</span>
                  <span className="package-count">{data.count} members</span>
                  <span className="package-volume">
                    ${data.volume?.toFixed(0) || 0}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <FaChartLine className="card-icon" />
            <h5>Level Breakdown</h5>
          </div>
          <div className="level-breakdown">
            {Object.entries(analytics.levelBreakdown || {}).map(
              ([level, data]) => (
                <div key={level} className="level-item">
                  <span className="level-number">Level {level}</span>
                  <span className="level-count">{data.count} members</span>
                  <span className="level-volume">
                    ${data.volume?.toFixed(0) || 0}
                  </span>
                  <span className="level-earnings">
                    ${data.earnings?.toFixed(0) || 0}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityLevelsVisualization;
