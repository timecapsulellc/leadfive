/**
 * Community Structure Visualization - Business Plan 2025 Aligned
 *
 * Advanced tree component that aligns with LeadFive Business Plan 2025
 * - Uses approved terminology (Community Structure, Direct Introductions, Levels)
 * - Integrates with smart contract data
 * - Multiple layout options: Vertical Tree, Horizontal Tree, Analytics View
 * - High-performance D3 visualization with real-time insights
 * - Follows business plan reward structure and terminology
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
  FaHandsHelping,
  FaBullseye,
  FaCrown,
  FaGem,
  FaCoins,
  FaRocket,
  FaAward,
  FaTrophy,
  FaLayerGroup,
} from 'react-icons/fa';
import './CommunityStructureVisualization.css';

const CommunityStructureVisualization = ({
  userAddress,
  contractInstance,
  mode = 'standard',
  showControls = true,
  initialDepth = 3,
}) => {
  // State management with business plan terminology
  const [communityData, setCommunityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('vertical'); // vertical, horizontal, analytics
  const [layoutOrientation, setLayoutOrientation] = useState('vertical');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [treeDepth, setTreeDepth] = useState(initialDepth);
  const [analytics, setAnalytics] = useState({});
  const [filters, setFilters] = useState({
    activeOnly: false,
    minLevel: 1,
    maxLevel: 6,
    tierType: 'all',
  });

  const treeRef = useRef(null);
  const containerRef = useRef(null);

  // Load community data from smart contract
  useEffect(() => {
    if (userAddress && contractInstance) {
      loadCommunityData();
    } else {
      loadDemoData();
    }
  }, [userAddress, contractInstance, filters]);

  const loadCommunityData = async () => {
    try {
      setLoading(true);

      // Fetch user's community structure from smart contract
      const userInfo = await contractInstance.getUserInfo(userAddress);
      const tree = await buildCommunityTree(userAddress, userInfo);
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

  // Generate demo community data aligned with Business Plan 2025
  const generateDemoCommunityData = address => {
    // Business Plan 2025 Membership Tiers
    const membershipTiers = [
      { id: 1, name: 'Bronze', price: 30, color: '#CD7F32', earnings: 120 },
      { id: 2, name: 'Silver', price: 50, color: '#C0C0C0', earnings: 200 },
      { id: 3, name: 'Gold', price: 100, color: '#FFD700', earnings: 400 },
      { id: 4, name: 'Diamond', price: 200, color: '#7B2CBF', earnings: 800 },
    ];

    const getRandomTier = () =>
      membershipTiers[Math.floor(Math.random() * membershipTiers.length)];
    const generateAddress = () =>
      `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`;

    const generateMember = (level, position) => {
      const tier = getRandomTier();
      const isActive = Math.random() > 0.2; // 80% activity rate
      const directIntroductions = Math.floor(Math.random() * 15);
      const communitySize =
        Math.floor(Math.random() * 50) + directIntroductions;
      const volume = communitySize * tier.price * (0.8 + Math.random() * 0.4);
      const currentEarnings = Math.min(volume * 0.4, tier.earnings); // 4x cap from business plan

      return {
        name: level === 1 ? 'YOU' : `Member L${level}`,
        attributes: {
          address:
            level === 1 ? address || generateAddress() : generateAddress(),
          level: level,
          position: position,
          membershipTier: tier,
          isActive: isActive,
          directIntroductions: directIntroductions,
          communitySize: communitySize,
          volume: volume,
          earnings: currentEarnings,
          earningsPercentage: (currentEarnings / tier.earnings) * 100,
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

          // Business Plan 2025 Reward Structure (exact percentages)
          directCommunityBonus: volume * 0.4, // 40% - Direct Community Bonus
          levelRewards: volume * 0.1, // 10% - Level Rewards (Levels 1-4: 4%, 3%, 2%, 1%)
          globalRewards: volume * 0.1, // 10% - Global Rewards
          leadershipRewards:
            directIntroductions >= 5 && communitySize >= 20 ? volume * 0.1 : 0, // 10% if qualified
          communityGrowthPool: volume * 0.3, // 30% - Community Growth Pool

          // Collection rates based on direct introductions (Business Plan 2025)
          collectionRate:
            directIntroductions >= 3 ? 90 : directIntroductions >= 1 ? 80 : 70,
          reinvestmentRate:
            directIntroductions >= 3 ? 10 : directIntroductions >= 1 ? 20 : 30,

          // Leadership qualification
          isLeaderQualified: directIntroductions >= 5 && communitySize >= 20,
        },
      };
    };

    const generateChildren = (level, maxLevel, count) => {
      if (level >= maxLevel) return [];
      const children = [];
      for (let i = 0; i < count && i < 6; i++) {
        const child = generateMember(level + 1, `${level}-${i}`);
        child.children = generateChildren(
          level + 1,
          maxLevel,
          Math.floor(Math.random() * 4)
        );
        children.push(child);
      }
      return children;
    };

    const root = generateMember(1, 'root');
    root.children = generateChildren(1, 7, 8); // Up to 6 levels as per business plan

    return root;
  };

  // Calculate comprehensive analytics
  const calculateAnalytics = data => {
    if (!data) return {};

    const analytics = {
      totalMembers: 0,
      activeMembers: 0,
      totalVolume: 0,
      totalEarnings: 0,
      levelBreakdown: {},
      tierBreakdown: {},
      performanceMetrics: {},
      rewardDistribution: {
        directCommunityBonus: 0,
        levelRewards: 0,
        globalRewards: 0,
        leadershipRewards: 0,
        communityGrowthPool: 0,
      },
    };

    const traverse = (member, level = 1) => {
      analytics.totalMembers++;
      if (member.attributes?.isActive) analytics.activeMembers++;
      analytics.totalVolume += member.attributes?.volume || 0;
      analytics.totalEarnings += member.attributes?.earnings || 0;

      // Reward distribution tracking
      const attrs = member.attributes;
      if (attrs) {
        analytics.rewardDistribution.directCommunityBonus +=
          attrs.directCommunityBonus || 0;
        analytics.rewardDistribution.levelRewards += attrs.levelRewards || 0;
        analytics.rewardDistribution.globalRewards += attrs.globalRewards || 0;
        analytics.rewardDistribution.leadershipRewards +=
          attrs.leadershipRewards || 0;
        analytics.rewardDistribution.communityGrowthPool +=
          attrs.communityGrowthPool || 0;
      }

      // Level breakdown
      if (!analytics.levelBreakdown[level]) {
        analytics.levelBreakdown[level] = { count: 0, volume: 0, earnings: 0 };
      }
      analytics.levelBreakdown[level].count++;
      analytics.levelBreakdown[level].volume += member.attributes?.volume || 0;
      analytics.levelBreakdown[level].earnings +=
        member.attributes?.earnings || 0;

      // Tier breakdown
      const tierName = member.attributes?.membershipTier?.name || 'Unknown';
      if (!analytics.tierBreakdown[tierName]) {
        analytics.tierBreakdown[tierName] = { count: 0, volume: 0 };
      }
      analytics.tierBreakdown[tierName].count++;
      analytics.tierBreakdown[tierName].volume +=
        member.attributes?.volume || 0;

      if (member.children) {
        member.children.forEach(child => traverse(child, level + 1));
      }
    };

    traverse(data);

    // Calculate performance metrics
    analytics.performanceMetrics = {
      averageVolume: analytics.totalVolume / analytics.totalMembers,
      activityRate: (analytics.activeMembers / analytics.totalMembers) * 100,
      earningsEfficiency:
        (analytics.totalEarnings / analytics.totalVolume) * 100,
      communityDepth: Math.max(
        ...Object.keys(analytics.levelBreakdown).map(Number)
      ),
      communityWidth: analytics.levelBreakdown[2]?.count || 0,
      leadershipQualified: Object.values(analytics.levelBreakdown).reduce(
        (sum, level) =>
          sum +
          (level.directIntroductions >= 5 && level.communitySize >= 20 ? 1 : 0),
        0
      ),
    };

    return analytics;
  };

  // Custom member renderer with business plan styling
  const renderCommunityMember = useCallback(
    ({ nodeDatum, toggleNode }) => {
      const { name, attributes } = nodeDatum;
      const isRoot = attributes?.level === 1;
      const isSelected =
        selectedMember?.attributes?.address === attributes?.address;
      const isHighlighted =
        searchTerm &&
        (name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          attributes?.address
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const nodeRadius = isRoot ? 70 : 50;
      const tierInfo = attributes?.membershipTier || {
        name: 'Unknown',
        color: '#6B7280',
      };
      const isLeader = attributes?.isLeaderQualified;

      return (
        <g
          onClick={e => {
            e.stopPropagation();
            setSelectedMember(nodeDatum);
            toggleNode();
          }}
          style={{ cursor: 'pointer' }}
        >
          {/* Node effects */}
          <defs>
            <filter
              id={`glow-${attributes?.address?.replace(/[^a-zA-Z0-9]/g, '')}`}
            >
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="5"
                floodColor={tierInfo.color}
                floodOpacity={isSelected ? '0.9' : '0.5'}
              />
            </filter>

            <radialGradient
              id={`gradient-${attributes?.address?.replace(/[^a-zA-Z0-9]/g, '')}`}
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="40%" stopColor={tierInfo.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={tierInfo.color} stopOpacity="1" />
            </radialGradient>

            {isLeader && (
              <radialGradient
                id={`leader-gradient-${attributes?.address?.replace(/[^a-zA-Z0-9]/g, '')}`}
              >
                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
                <stop
                  offset="100%"
                  stopColor={tierInfo.color}
                  stopOpacity="0.8"
                />
              </radialGradient>
            )}
          </defs>

          {/* Selection/highlight ring */}
          {(isSelected || isHighlighted) && (
            <circle
              r={nodeRadius + 10}
              fill="none"
              stroke={isSelected ? '#00D4FF' : '#FFD700'}
              strokeWidth="4"
              strokeDasharray="8,4"
              opacity="0.9"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0;360"
                dur="4s"
                repeatCount="indefinite"
              />
            </circle>
          )}

          {/* Leadership crown for qualified leaders */}
          {isLeader && (
            <g transform={`translate(0, ${-nodeRadius - 20})`}>
              <circle
                r="15"
                fill="url(#leader-gradient-${attributes?.address?.replace(/[^a-zA-Z0-9]/g, '')})"
              />
              <text
                textAnchor="middle"
                fill="#FFD700"
                fontSize="14"
                fontWeight="bold"
                dy="5"
              >
                👑
              </text>
            </g>
          )}

          {/* Main member circle */}
          <circle
            r={nodeRadius}
            fill={
              isLeader
                ? `url(#leader-gradient-${attributes?.address?.replace(/[^a-zA-Z0-9]/g, '')})`
                : `url(#gradient-${attributes?.address?.replace(/[^a-zA-Z0-9]/g, '')})`
            }
            stroke={isRoot ? '#7B2CBF' : tierInfo.color}
            strokeWidth={isRoot ? '5' : '3'}
            filter={`url(#glow-${attributes?.address?.replace(/[^a-zA-Z0-9]/g, '')})`}
            opacity={attributes?.isActive ? '1' : '0.7'}
          />

          {/* Inner decorative elements */}
          <circle
            r={nodeRadius - 10}
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="2"
            strokeDasharray="2,2"
          />

          {/* Activity status indicator */}
          {attributes?.isActive && (
            <circle
              r="8"
              cx={nodeRadius - 18}
              cy={-nodeRadius + 18}
              fill="#10B981"
              stroke="#ffffff"
              strokeWidth="3"
            >
              <animate
                attributeName="opacity"
                values="0.5;1;0.5"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          )}

          {/* Tier indicator badge */}
          <g transform={`translate(${-nodeRadius + 18}, ${-nodeRadius + 18})`}>
            <circle
              r="14"
              fill={tierInfo.color}
              stroke="#ffffff"
              strokeWidth="3"
            />
            <text
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="bold"
              dy="4"
            >
              {tierInfo.name.charAt(0)}
            </text>
          </g>

          {/* Member name and level */}
          <text
            textAnchor="middle"
            fill="white"
            fontSize={isRoot ? '16' : '14'}
            fontWeight="bold"
            dy="-5"
            style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.9)' }}
          >
            {name.length > 15 ? `${name.substring(0, 15)}...` : name}
          </text>

          <text
            textAnchor="middle"
            fill="rgba(255,255,255,0.9)"
            fontSize="11"
            dy="10"
            fontWeight="500"
          >
            Level {attributes?.level}
          </text>

          {/* Tier and price display */}
          <text
            textAnchor="middle"
            fill="#FFD700"
            fontSize="10"
            fontWeight="bold"
            dy="25"
          >
            ${tierInfo.price} {tierInfo.name}
          </text>

          {/* Community size indicator */}
          {attributes?.communitySize && (
            <g transform={`translate(0, ${nodeRadius + 25})`}>
              <circle
                r="12"
                fill="rgba(0,0,0,0.8)"
                stroke={tierInfo.color}
                strokeWidth="2"
              />
              <text
                textAnchor="middle"
                fill="white"
                fontSize="9"
                fontWeight="bold"
                dy="3"
              >
                {attributes.communitySize > 99
                  ? '99+'
                  : attributes.communitySize}
              </text>
            </g>
          )}

          {/* Earnings progress ring */}
          {attributes?.earningsPercentage && (
            <g transform={`translate(0, ${-nodeRadius - 35})`}>
              <circle
                r="18"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="3"
              />
              <circle
                r="18"
                fill="none"
                stroke="#00FF88"
                strokeWidth="3"
                strokeDasharray={`${(attributes.earningsPercentage / 100) * 113} 113`}
                transform="rotate(-90)"
                strokeLinecap="round"
              >
                <animate
                  attributeName="stroke-dasharray"
                  values={`0 113;${(attributes.earningsPercentage / 100) * 113} 113`}
                  dur="2s"
                  begin="0s"
                />
              </circle>
              <text
                textAnchor="middle"
                fill="white"
                fontSize="8"
                fontWeight="bold"
                dy="3"
              >
                {Math.round(attributes.earningsPercentage)}%
              </text>
            </g>
          )}

          {/* Direct introductions counter */}
          {attributes?.directIntroductions > 0 && (
            <g transform={`translate(${nodeRadius - 15}, ${nodeRadius - 15})`}>
              <circle r="10" fill="#7B2CBF" stroke="#ffffff" strokeWidth="2" />
              <text
                textAnchor="middle"
                fill="white"
                fontSize="8"
                fontWeight="bold"
                dy="3"
              >
                {attributes.directIntroductions}
              </text>
            </g>
          )}
        </g>
      );
    },
    [selectedMember, searchTerm]
  );

  // Tree configuration with enhanced layout options
  const treeConfig = useMemo(() => {
    const isHorizontal = layoutOrientation === 'horizontal';
    return {
      nodeSize: isHorizontal ? { x: 200, y: 280 } : { x: 260, y: 200 },
      separation: {
        siblings: isHorizontal ? 1.3 : 1.6,
        nonSiblings: isHorizontal ? 2.0 : 2.2,
      },
      translate: isHorizontal ? { x: 150, y: 400 } : { x: 500, y: 120 },
      orientation: layoutOrientation,
      pathFunc: 'step',
      enableLegacyTransitions: true,
      transitionDuration: 600,
      collapsible: true,
      initialDepth: treeDepth,
      zoom: isHorizontal ? 0.6 : 0.7,
      scaleExtent: { min: 0.1, max: 3 },
      shouldCollapseNeighborNodes: false,
      pathClassFunc: () => 'community-link',
      svgClassName: 'community-structure-svg',
    };
  }, [treeDepth, layoutOrientation]);

  // Filter community data
  const filteredData = useMemo(() => {
    if (!communityData) return null;

    const filterMember = member => {
      const attrs = member.attributes;
      if (!attrs) return member;

      if (filters.activeOnly && !attrs.isActive) return null;
      if (attrs.level < filters.minLevel || attrs.level > filters.maxLevel)
        return null;
      if (
        filters.tierType !== 'all' &&
        attrs.membershipTier?.name !== filters.tierType
      )
        return null;

      const filteredChildren =
        member.children?.map(filterMember).filter(Boolean) || [];

      return {
        ...member,
        children: filteredChildren,
      };
    };

    return filterMember(communityData);
  }, [communityData, filters]);

  if (loading) {
    return (
      <div className="community-structure-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <FaUsers size={45} color="#7B2CBF" />
        </motion.div>
        <p>Loading Community Structure...</p>
        <div className="loading-subtitle">
          Analyzing member relationships and earnings distribution
        </div>
      </div>
    );
  }

  return (
    <div
      className={`community-structure-container ${isFullscreen ? 'fullscreen' : ''}`}
      ref={containerRef}
    >
      {/* Enhanced Header and Controls */}
      {showControls && (
        <motion.div
          className="community-controls"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="controls-header">
            <h3>
              <FaUsers className="header-icon" />
              Community Structure Visualization
              <span className="business-plan-badge">Business Plan 2025</span>
            </h3>
            <div className="view-mode-buttons">
              {[
                { id: 'vertical', icon: FaLayerGroup, label: 'Vertical Tree' },
                { id: 'horizontal', icon: FaUsers, label: 'Horizontal Tree' },
                { id: 'analytics', icon: FaChartLine, label: 'Analytics View' },
              ].map(mode => (
                <button
                  key={mode.id}
                  className={`mode-btn ${viewMode === mode.id ? 'active' : ''}`}
                  onClick={() => {
                    setViewMode(mode.id);
                    if (mode.id !== 'analytics') {
                      setLayoutOrientation(mode.id);
                    }
                  }}
                >
                  <mode.icon />
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="controls-panel">
            {/* Enhanced Search */}
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search community members by name or address..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Business Plan Filters */}
            <div className="filters-container">
              <select
                value={filters.tierType}
                onChange={e =>
                  setFilters({ ...filters, tierType: e.target.value })
                }
                className="filter-select"
              >
                <option value="all">All Membership Tiers</option>
                <option value="Bronze">Bronze Tier ($30)</option>
                <option value="Silver">Silver Tier ($50)</option>
                <option value="Gold">Gold Tier ($100)</option>
                <option value="Diamond">Diamond Tier ($200)</option>
              </select>

              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.activeOnly}
                  onChange={e =>
                    setFilters({ ...filters, activeOnly: e.target.checked })
                  }
                />
                Active Members Only
              </label>

              <div className="depth-control">
                <label>Community Depth: {treeDepth}</label>
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

              <button className="action-btn" title="Export Community Data">
                <FaDownload />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className="community-content">
        {(viewMode === 'vertical' || viewMode === 'horizontal') && (
          <div className="tree-visualization">
            {filteredData && (
              <Tree
                data={filteredData}
                renderCustomNodeElement={renderCommunityMember}
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

      {/* Member Details Panel */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            className="member-details-panel"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <MemberDetailsPanel
              member={selectedMember}
              onClose={() => setSelectedMember(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced Member Details Panel
const MemberDetailsPanel = ({ member, onClose }) => {
  const { attributes } = member;
  const tierInfo = attributes?.membershipTier || {};

  return (
    <div className="member-details">
      <div className="details-header">
        <h4>
          <FaUsers className="details-icon" />
          Community Member Details
        </h4>
        <button onClick={onClose} className="close-btn">
          ×
        </button>
      </div>

      <div className="details-content">
        <div className="member-info">
          <div
            className="member-avatar"
            style={{ backgroundColor: tierInfo.color }}
          >
            {attributes?.isLeaderQualified && (
              <span className="leader-crown">👑</span>
            )}
            {tierInfo.name?.charAt(0) || 'U'}
          </div>
          <div className="member-basic">
            <h5>{member.name}</h5>
            <p className="member-address">{attributes?.address}</p>
            <div
              className={`status-badge ${attributes?.isActive ? 'active' : 'inactive'}`}
            >
              {attributes?.isActive ? 'Active Member' : 'Inactive'}
            </div>
            {attributes?.isLeaderQualified && (
              <div className="leadership-badge">
                <FaCrown /> Leadership Qualified
              </div>
            )}
          </div>
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <FaGem className="detail-icon" />
            <span className="detail-label">Membership Tier</span>
            <span className="detail-value">
              ${tierInfo.price} {tierInfo.name}
            </span>
          </div>

          <div className="detail-item">
            <FaUsers className="detail-icon" />
            <span className="detail-label">Community Size</span>
            <span className="detail-value">
              {attributes?.communitySize || 0}
            </span>
          </div>

          <div className="detail-item">
            <FaCoins className="detail-icon" />
            <span className="detail-label">Total Volume</span>
            <span className="detail-value">
              ${attributes?.volume?.toFixed(2) || '0.00'}
            </span>
          </div>

          <div className="detail-item">
            <FaRocket className="detail-icon" />
            <span className="detail-label">Current Earnings</span>
            <span className="detail-value">
              ${attributes?.earnings?.toFixed(2) || '0.00'}
            </span>
          </div>

          <div className="detail-item">
            <FaHandsHelping className="detail-icon" />
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
          <h6>
            <FaTrophy className="breakdown-icon" />
            Earnings Breakdown (Business Plan 2025)
          </h6>
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
            <span>Leadership Rewards Pool (10%)</span>
            <span>${(attributes?.leadershipRewards || 0).toFixed(2)}</span>
          </div>
          <div className="breakdown-item total">
            <span>Community Growth Pool (30%)</span>
            <span>${(attributes?.communityGrowthPool || 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="collection-info">
          <h6>Collection & Reinvestment</h6>
          <div className="collection-rates">
            <div className="rate-item">
              <span>Collection Rate:</span>
              <span>{attributes?.collectionRate}%</span>
            </div>
            <div className="rate-item">
              <span>Reinvestment Rate:</span>
              <span>{attributes?.reinvestmentRate}%</span>
            </div>
          </div>
          <p className="rate-note">
            Collection rates improve with direct introductions: 70/30 (0
            intros), 80/20 (1-2 intros), 90/10 (3+ intros)
          </p>
        </div>
      </div>
    </div>
  );
};

// Enhanced Community Analytics Component
const CommunityAnalytics = ({ analytics, communityData }) => {
  return (
    <div className="community-analytics">
      <div className="analytics-header">
        <h4>
          <FaChartLine className="analytics-icon" />
          Community Performance Analytics
          <span className="business-plan-badge">Business Plan 2025</span>
        </h4>
      </div>

      <div className="analytics-grid">
        {/* Community Overview */}
        <div className="analytics-card overview">
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
              <span className="stat-value">{analytics.activeMembers}</span>
              <span className="stat-label">Active Members</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {Math.round(analytics.performanceMetrics?.activityRate || 0)}%
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

        {/* Financial Metrics */}
        <div className="analytics-card financial">
          <div className="card-header">
            <FaCoins className="card-icon" />
            <h5>Financial Performance</h5>
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
              <span className="stat-label">Avg Volume/Member</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {Math.round(
                  analytics.performanceMetrics?.earningsEfficiency || 0
                )}
                %
              </span>
              <span className="stat-label">Earnings Efficiency</span>
            </div>
          </div>
        </div>

        {/* Membership Tier Distribution */}
        <div className="analytics-card tiers">
          <div className="card-header">
            <FaGem className="card-icon" />
            <h5>Membership Tier Distribution</h5>
          </div>
          <div className="tier-breakdown">
            {Object.entries(analytics.tierBreakdown || {}).map(
              ([tier, data]) => (
                <div key={tier} className="tier-item">
                  <span className="tier-name">{tier} Tier</span>
                  <span className="tier-count">{data.count} members</span>
                  <span className="tier-volume">
                    ${data.volume?.toFixed(0) || 0}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Business Plan Reward Distribution */}
        <div className="analytics-card rewards">
          <div className="card-header">
            <FaTrophy className="card-icon" />
            <h5>Reward Distribution (Business Plan)</h5>
          </div>
          <div className="reward-breakdown">
            <div className="reward-item">
              <span>Direct Community Bonus (40%)</span>
              <span>
                $
                {(
                  analytics.rewardDistribution?.directCommunityBonus || 0
                ).toFixed(0)}
              </span>
            </div>
            <div className="reward-item">
              <span>Level Rewards (10%)</span>
              <span>
                ${(analytics.rewardDistribution?.levelRewards || 0).toFixed(0)}
              </span>
            </div>
            <div className="reward-item">
              <span>Global Rewards (10%)</span>
              <span>
                ${(analytics.rewardDistribution?.globalRewards || 0).toFixed(0)}
              </span>
            </div>
            <div className="reward-item">
              <span>Leadership Rewards (10%)</span>
              <span>
                $
                {(analytics.rewardDistribution?.leadershipRewards || 0).toFixed(
                  0
                )}
              </span>
            </div>
            <div className="reward-item total">
              <span>Community Growth Pool (30%)</span>
              <span>
                $
                {(
                  analytics.rewardDistribution?.communityGrowthPool || 0
                ).toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Level Structure Analysis */}
        <div className="analytics-card levels">
          <div className="card-header">
            <FaLayerGroup className="card-icon" />
            <h5>Level Structure Analysis</h5>
          </div>
          <div className="level-breakdown">
            {Object.entries(analytics.levelBreakdown || {}).map(
              ([level, data]) => (
                <div key={level} className="level-item">
                  <span className="level-number">Level {level}</span>
                  <div className="level-stats">
                    <span className="level-count">{data.count} members</span>
                    <span className="level-volume">
                      ${data.volume?.toFixed(0) || 0}
                    </span>
                    <span className="level-earnings">
                      ${data.earnings?.toFixed(0) || 0}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Leadership Qualification Status */}
        <div className="analytics-card leadership">
          <div className="card-header">
            <FaCrown className="card-icon" />
            <h5>Leadership Status</h5>
          </div>
          <div className="leadership-stats">
            <div className="leadership-requirement">
              <h6>Leadership Requirements:</h6>
              <p>• Minimum 5 direct introductions</p>
              <p>• Minimum 20 community members</p>
              <p>• Qualifies for 10% Leadership Rewards Pool</p>
            </div>
            <div className="leadership-count">
              <span className="qualified-count">
                {analytics.performanceMetrics?.leadershipQualified || 0}
              </span>
              <span className="qualified-label">Qualified Leaders</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityStructureVisualization;
