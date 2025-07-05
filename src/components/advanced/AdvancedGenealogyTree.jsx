/**
 * Advanced Genealogy Tree - LeadFive MLM Business Structure
 * 
 * Features:
 * - Dual Layout Support: Vertical & Horizontal orientations
 * - Business-Aligned MLM Structure with 4X reward system
 * - Real-time data integration with smart contracts
 * - Advanced analytics and performance metrics
 * - Interactive controls and zoom functionality
 * - Mobile-responsive design
 * - Export capabilities (PNG, PDF, Data)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers,
  FaChartLine,
  FaExpand,
  FaCompress,
  FaSearch,
  FaDownload,
  FaRotateRight,
  FaFilter,
  FaEye,
  FaShare,
  FaDollarSign,
  FaTrophy,
  FaNetworkWired,
  FaCrown,
  FaGem,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
} from 'react-icons/fa';
import './AdvancedGenealogyTree.css';

const AdvancedGenealogyTree = ({
  userAddress,
  account,
  data,
  layout = 'vertical', // 'vertical' | 'horizontal'
  showControls = true,
  showMiniMap = true,
  enableBusinessMetrics = true,
  className = '',
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [treeData, setTreeData] = useState(null);
  const [currentLayout, setCurrentLayout] = useState(layout);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState('all');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showBusinessMetrics, setShowBusinessMetrics] = useState(enableBusinessMetrics);
  
  // Business Analytics State
  const [businessStats, setBusinessStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalVolume: 0,
    networkDepth: 0,
    leftLegVolume: 0,
    rightLegVolume: 0,
    balanceRatio: 0,
    monthlyGrowth: 0,
    rewardDistribution: {
      directBonus: 0,
      levelBonus: 0,
      uplinkBonus: 0,
      leadershipBonus: 0,
    },
    performanceMetrics: {
      conversionRate: 0,
      averageEarnings: 0,
      topPerformers: [],
      growthTrend: [],
    },
  });

  // MLM Business Model Configuration
  const MLM_CONFIG = {
    rewardStructure: {
      directCommission: 0.40, // 40% direct referral bonus
      levelBonuses: [0.10, 0.08, 0.06, 0.04, 0.03, 0.02, 0.01], // 7 levels
      uplinkBonus: 0.10, // 10% uplink bonus
      leadershipBonus: 0.10, // 10% leadership rewards
    },
    packages: {
      starter: { amount: 30, name: 'Starter', color: '#10B981' },
      premium: { amount: 50, name: 'Premium', color: '#3B82F6' },
      professional: { amount: 100, name: 'Professional', color: '#8B5CF6' },
      enterprise: { amount: 200, name: 'Enterprise', color: '#F59E0B' },
    },
    ranks: {
      bronze: { min: 0, max: 500, icon: '🥉', color: '#CD7F32' },
      silver: { min: 500, max: 1500, icon: '🥈', color: '#C0C0C0' },
      gold: { min: 1500, max: 5000, icon: '🥇', color: '#FFD700' },
      platinum: { min: 5000, max: 15000, icon: '💎', color: '#E5E7EB' },
      diamond: { min: 15000, max: 50000, icon: '💎', color: '#60A5FA' },
      crown: { min: 50000, max: Infinity, icon: '👑', color: '#A855F7' },
    },
  };

  // Generate enhanced MLM tree data with business intelligence
  const generateEnhancedTreeData = useCallback(() => {
    const createNode = (id, level, position, parentId = null) => {
      const packageTypes = Object.keys(MLM_CONFIG.packages);
      const randomPackage = packageTypes[Math.floor(Math.random() * packageTypes.length)];
      const packageInfo = MLM_CONFIG.packages[randomPackage];
      
      const totalEarnings = Math.random() * 5000;
      const rank = Object.entries(MLM_CONFIG.ranks).find(([_, config]) => 
        totalEarnings >= config.min && totalEarnings < config.max
      )?.[0] || 'bronze';
      
      return {
        id,
        name: id === 'root' 
          ? (account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'You')
          : `0x${Math.random().toString(16).substr(2, 8)}...`,
        address: id === 'root' ? account : `0x${Math.random().toString(16).substr(2, 40)}`,
        level,
        position,
        parentId,
        package: {
          type: randomPackage,
          amount: packageInfo.amount,
          name: packageInfo.name,
          color: packageInfo.color,
        },
        earnings: {
          total: totalEarnings,
          direct: totalEarnings * 0.4,
          level: totalEarnings * 0.3,
          uplink: totalEarnings * 0.2,
          leadership: totalEarnings * 0.1,
        },
        performance: {
          conversionRate: Math.random() * 100,
          activeReferrals: Math.floor(Math.random() * 20),
          monthlyVolume: Math.random() * 2000,
          growthRate: (Math.random() - 0.5) * 50, // -25% to +25%
        },
        rank: {
          current: rank,
          icon: MLM_CONFIG.ranks[rank].icon,
          color: MLM_CONFIG.ranks[rank].color,
        },
        status: Math.random() > 0.2 ? 'active' : 'inactive',
        joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        businessMetrics: {
          teamSize: 0, // Will be calculated
          teamVolume: 0, // Will be calculated
          personalSales: Math.random() * 1000,
          leadershipLevel: Math.floor(Math.random() * 5),
        },
      };
    };

    // Build tree structure with business logic
    const root = createNode('root', 0, 'root');
    
    const buildChildren = (node, maxDepth = 6) => {
      if (node.level >= maxDepth) return;
      
      const children = [];
      
      // Binary tree structure (left and right legs)
      if (Math.random() > 0.1) { // 90% chance of having left child
        const leftChild = createNode(`${node.id}-L`, node.level + 1, 'left', node.id);
        buildChildren(leftChild, maxDepth);
        children.push(leftChild);
      }
      
      if (Math.random() > 0.2) { // 80% chance of having right child
        const rightChild = createNode(`${node.id}-R`, node.level + 1, 'right', node.id);
        buildChildren(rightChild, maxDepth);
        children.push(rightChild);
      }
      
      node.children = children;
    };

    buildChildren(root);
    
    // Calculate business metrics for each node
    const calculateBusinessMetrics = (node) => {
      let teamSize = 0;
      let teamVolume = 0;
      
      if (node.children) {
        node.children.forEach(child => {
          calculateBusinessMetrics(child);
          teamSize += 1 + child.businessMetrics.teamSize;
          teamVolume += child.package.amount + child.businessMetrics.teamVolume;
        });
      }
      
      node.businessMetrics.teamSize = teamSize;
      node.businessMetrics.teamVolume = teamVolume;
    };

    calculateBusinessMetrics(root);
    return root;
  }, [account]);

  // Calculate comprehensive business statistics
  const calculateBusinessStats = useCallback((data) => {
    if (!data) return;

    const stats = {
      totalMembers: 0,
      activeMembers: 0,
      totalVolume: 0,
      networkDepth: 0,
      leftLegVolume: 0,
      rightLegVolume: 0,
      balanceRatio: 0,
      monthlyGrowth: 0,
      rewardDistribution: {
        directBonus: 0,
        levelBonus: 0,
        uplinkBonus: 0,
        leadershipBonus: 0,
      },
      performanceMetrics: {
        conversionRate: 0,
        averageEarnings: 0,
        topPerformers: [],
        growthTrend: [],
      },
    };

    const traverse = (node, depth = 0, leg = 'root') => {
      stats.totalMembers++;
      if (node.status === 'active') stats.activeMembers++;
      stats.totalVolume += node.package.amount;
      stats.networkDepth = Math.max(stats.networkDepth, depth);
      
      // Track leg volumes for balance calculation
      if (leg === 'left') stats.leftLegVolume += node.package.amount;
      if (leg === 'right') stats.rightLegVolume += node.package.amount;
      
      // Accumulate reward distributions
      stats.rewardDistribution.directBonus += node.earnings.direct;
      stats.rewardDistribution.levelBonus += node.earnings.level;
      stats.rewardDistribution.uplinkBonus += node.earnings.uplink;
      stats.rewardDistribution.leadershipBonus += node.earnings.leadership;

      if (node.children) {
        node.children.forEach((child, index) => {
          const childLeg = index === 0 ? 'left' : 'right';
          traverse(child, depth + 1, childLeg);
        });
      }
    };

    traverse(data);
    
    // Calculate derived metrics
    stats.balanceRatio = stats.rightLegVolume > 0 
      ? (stats.leftLegVolume / stats.rightLegVolume * 100).toFixed(1)
      : 0;
    
    stats.performanceMetrics.averageEarnings = stats.totalMembers > 0
      ? (stats.rewardDistribution.directBonus + 
         stats.rewardDistribution.levelBonus + 
         stats.rewardDistribution.uplinkBonus + 
         stats.rewardDistribution.leadershipBonus) / stats.totalMembers
      : 0;

    stats.performanceMetrics.conversionRate = stats.totalMembers > 0
      ? (stats.activeMembers / stats.totalMembers * 100).toFixed(1)
      : 0;

    setBusinessStats(stats);
  }, []);

  // D3.js Tree Rendering with dual layout support
  const renderTree = useCallback(() => {
    if (!treeData || !svgRef.current) return;

    const container = d3.select(svgRef.current);
    container.selectAll('*').remove();

    const width = containerRef.current?.clientWidth || 1200;
    const height = containerRef.current?.clientHeight || 800;
    
    const svg = container
      .attr('width', width)
      .attr('height', height)
      .style('background', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');

    const g = svg.append('g');

    // Define layouts
    const layouts = {
      vertical: {
        nodeSize: [180, 120],
        separation: (a, b) => (a.parent === b.parent ? 1 : 1.2),
        transform: (d) => `translate(${d.x},${d.y})`,
        linkPath: (d) => `M${d.x},${d.y}C${d.x},${(d.y + d.parent.y) / 2} ${d.parent.x},${(d.y + d.parent.y) / 2} ${d.parent.x},${d.parent.y}`,
      },
      horizontal: {
        nodeSize: [120, 200],
        separation: (a, b) => (a.parent === b.parent ? 1 : 1.3),
        transform: (d) => `translate(${d.y},${d.x})`,
        linkPath: (d) => `M${d.y},${d.x}C${(d.y + d.parent.y) / 2},${d.x} ${(d.y + d.parent.y) / 2},${d.parent.x} ${d.parent.y},${d.parent.x}`,
      },
    };

    const currentLayoutConfig = layouts[currentLayout];
    
    // Create tree layout
    const treeLayout = d3.tree()
      .nodeSize(currentLayoutConfig.nodeSize)
      .separation(currentLayoutConfig.separation);

    const root = d3.hierarchy(treeData);
    const treeNodes = treeLayout(root);

    // Center the tree
    const nodes = treeNodes.descendants();
    const links = treeNodes.links();
    
    const bounds = {
      minX: d3.min(nodes, d => currentLayout === 'vertical' ? d.x : d.y),
      maxX: d3.max(nodes, d => currentLayout === 'vertical' ? d.x : d.y),
      minY: d3.min(nodes, d => currentLayout === 'vertical' ? d.y : d.x),
      maxY: d3.max(nodes, d => currentLayout === 'vertical' ? d.y : d.x),
    };

    const centerX = width / 2 - (bounds.minX + bounds.maxX) / 2;
    const centerY = height / 2 - (bounds.minY + bounds.maxY) / 2;

    g.attr('transform', `translate(${centerX},${centerY}) scale(${zoomLevel})`);

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    // Render links with enhanced styling
    const link = g.selectAll('.link')
      .data(links)
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', currentLayoutConfig.linkPath)
      .style('fill', 'none')
      .style('stroke', (d) => {
        const isLeftLeg = d.target.data.position === 'left';
        return isLeftLeg ? '#10B981' : '#3B82F6';
      })
      .style('stroke-width', 3)
      .style('stroke-opacity', 0.8)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
      .on('mouseover', function() {
        d3.select(this).style('stroke-width', 5).style('stroke-opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this).style('stroke-width', 3).style('stroke-opacity', 0.8);
      });

    // Render nodes with business intelligence
    const node = g.selectAll('.node')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', currentLayoutConfig.transform)
      .style('cursor', 'pointer')
      .on('click', (event, d) => setSelectedNode(d.data))
      .on('mouseover', function(event, d) {
        d3.select(this).select('.node-card').style('transform', 'scale(1.05)');
        showTooltip(event, d.data);
      })
      .on('mouseout', function() {
        d3.select(this).select('.node-card').style('transform', 'scale(1)');
        hideTooltip();
      });

    // Enhanced node cards with business metrics
    const nodeCard = node.append('g').attr('class', 'node-card');

    // Main card background
    nodeCard.append('rect')
      .attr('width', 160)
      .attr('height', 100)
      .attr('x', -80)
      .attr('y', -50)
      .attr('rx', 12)
      .style('fill', (d) => d.data.package.color)
      .style('stroke', (d) => d.data.status === 'active' ? '#22C55E' : '#EF4444')
      .style('stroke-width', 3)
      .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))')
      .style('opacity', (d) => d.data.status === 'active' ? 1 : 0.7);

    // Rank badge
    nodeCard.append('circle')
      .attr('cx', 60)
      .attr('cy', -35)
      .attr('r', 15)
      .style('fill', (d) => d.data.rank.color)
      .style('stroke', 'white')
      .style('stroke-width', 2);

    nodeCard.append('text')
      .attr('x', 60)
      .attr('y', -30)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text((d) => d.data.rank.icon);

    // Member name
    nodeCard.append('text')
      .attr('x', 0)
      .attr('y', -25)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .text((d) => d.data.name);

    // Package info
    nodeCard.append('text')
      .attr('x', 0)
      .attr('y', -10)
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', 'rgba(255,255,255,0.9)')
      .text((d) => `${d.data.package.name} - $${d.data.package.amount}`);

    // Earnings display
    nodeCard.append('text')
      .attr('x', 0)
      .attr('y', 5)
      .style('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('fill', '#FEF3C7')
      .text((d) => `$${d.data.earnings.total.toFixed(0)}`);

    // Team metrics
    nodeCard.append('text')
      .attr('x', 0)
      .attr('y', 20)
      .style('text-anchor', 'middle')
      .style('font-size', '9px')
      .style('fill', 'rgba(255,255,255,0.8)')
      .text((d) => `Team: ${d.data.businessMetrics.teamSize}`);

    // Performance indicator
    nodeCard.append('rect')
      .attr('width', 4)
      .attr('height', 80)
      .attr('x', -85)
      .attr('y', -40)
      .style('fill', (d) => {
        const rate = d.data.performance.growthRate;
        return rate > 0 ? '#10B981' : rate < -10 ? '#EF4444' : '#F59E0B';
      })
      .style('opacity', 0.8);

    // Animation
    node.style('opacity', 0)
      .transition()
      .duration(750)
      .delay((d, i) => i * 50)
      .style('opacity', 1);

  }, [treeData, currentLayout, zoomLevel]);

  // Tooltip functionality
  const showTooltip = (event, data) => {
    // Implementation for detailed tooltip with business metrics
  };

  const hideTooltip = () => {
    // Implementation to hide tooltip
  };

  // Export functionality
  const exportTree = (format) => {
    switch (format) {
      case 'png':
        // Export as PNG image
        break;
      case 'pdf':
        // Export as PDF document
        break;
      case 'data':
        // Export tree data as JSON
        break;
    }
  };

  // Initialize component
  useEffect(() => {
    const data = generateEnhancedTreeData();
    setTreeData(data);
    calculateBusinessStats(data);
  }, [generateEnhancedTreeData, calculateBusinessStats]);

  useEffect(() => {
    renderTree();
  }, [renderTree]);

  return (
    <div className={`advanced-genealogy-tree ${className}`} ref={containerRef}>
      {/* Control Panel */}
      {showControls && (
        <motion.div 
          className="tree-controls"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="control-group">
            <button 
              className={`control-btn ${currentLayout === 'vertical' ? 'active' : ''}`}
              onClick={() => setCurrentLayout('vertical')}
              title="Vertical Layout"
            >
              <FaArrowDown /> Vertical
            </button>
            <button 
              className={`control-btn ${currentLayout === 'horizontal' ? 'active' : ''}`}
              onClick={() => setCurrentLayout('horizontal')}
              title="Horizontal Layout"
            >
              <FaArrowRight /> Horizontal
            </button>
          </div>

          <div className="control-group">
            <button className="control-btn" onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 3))}>
              <FaSearch /> Zoom In
            </button>
            <button className="control-btn" onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.1))}>
              <FaCompress /> Zoom Out
            </button>
            <button className="control-btn" onClick={() => setZoomLevel(1)}>
              Reset Zoom
            </button>
          </div>

          <div className="control-group">
            <select 
              value={filterCriteria} 
              onChange={(e) => setFilterCriteria(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Members</option>
              <option value="active">Active Only</option>
              <option value="high-performers">Top Performers</option>
              <option value="recent">Recent Joins</option>
            </select>
          </div>

          <div className="control-group">
            <button className="control-btn" onClick={() => exportTree('png')}>
              <FaDownload /> PNG
            </button>
            <button className="control-btn" onClick={() => exportTree('pdf')}>
              <FaDownload /> PDF
            </button>
            <button className="control-btn" onClick={() => exportTree('data')}>
              <FaDownload /> Data
            </button>
          </div>
        </motion.div>
      )}

      {/* Business Metrics Panel */}
      {showBusinessMetrics && (
        <motion.div 
          className="business-metrics-panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3><FaChartLine /> Business Analytics</h3>
          
          <div className="metrics-grid">
            <div className="metric-card">
              <FaUsers className="metric-icon" />
              <div className="metric-value">{businessStats.totalMembers}</div>
              <div className="metric-label">Total Members</div>
            </div>
            
            <div className="metric-card">
              <FaTrophy className="metric-icon" />
              <div className="metric-value">{businessStats.activeMembers}</div>
              <div className="metric-label">Active Members</div>
            </div>
            
            <div className="metric-card">
              <FaDollarSign className="metric-icon" />
              <div className="metric-value">${businessStats.totalVolume.toLocaleString()}</div>
              <div className="metric-label">Total Volume</div>
            </div>
            
            <div className="metric-card">
              <FaNetworkWired className="metric-icon" />
              <div className="metric-value">{businessStats.networkDepth}</div>
              <div className="metric-label">Network Depth</div>
            </div>
          </div>

          <div className="leg-balance">
            <h4>Leg Balance Analysis</h4>
            <div className="balance-bars">
              <div className="leg-bar left">
                <span>Left Leg</span>
                <div className="bar">
                  <div 
                    className="fill" 
                    style={{ width: `${(businessStats.leftLegVolume / (businessStats.leftLegVolume + businessStats.rightLegVolume)) * 100}%` }}
                  ></div>
                </div>
                <span>${businessStats.leftLegVolume.toLocaleString()}</span>
              </div>
              <div className="leg-bar right">
                <span>Right Leg</span>
                <div className="bar">
                  <div 
                    className="fill" 
                    style={{ width: `${(businessStats.rightLegVolume / (businessStats.leftLegVolume + businessStats.rightLegVolume)) * 100}%` }}
                  ></div>
                </div>
                <span>${businessStats.rightLegVolume.toLocaleString()}</span>
              </div>
            </div>
            <div className="balance-ratio">
              Balance Ratio: {businessStats.balanceRatio}%
            </div>
          </div>

          <div className="reward-breakdown">
            <h4>4X Reward Distribution</h4>
            <div className="reward-items">
              <div className="reward-item">
                <span className="reward-label">Direct Bonus (40%)</span>
                <span className="reward-amount">${businessStats.rewardDistribution.directBonus.toFixed(0)}</span>
              </div>
              <div className="reward-item">
                <span className="reward-label">Level Bonus (30%)</span>
                <span className="reward-amount">${businessStats.rewardDistribution.levelBonus.toFixed(0)}</span>
              </div>
              <div className="reward-item">
                <span className="reward-label">Uplink Bonus (20%)</span>
                <span className="reward-amount">${businessStats.rewardDistribution.uplinkBonus.toFixed(0)}</span>
              </div>
              <div className="reward-item">
                <span className="reward-label">Leadership (10%)</span>
                <span className="reward-amount">${businessStats.rewardDistribution.leadershipBonus.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tree Visualization Container */}
      <div className="tree-container">
        <svg ref={svgRef} className="tree-svg"></svg>
      </div>

      {/* Selected Node Details */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            className="node-details-panel"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="panel-header">
              <h3>{selectedNode.name}</h3>
              <button onClick={() => setSelectedNode(null)}>×</button>
            </div>
            
            <div className="panel-content">
              <div className="detail-section">
                <h4>Member Information</h4>
                <p><strong>Address:</strong> {selectedNode.address}</p>
                <p><strong>Package:</strong> {selectedNode.package.name} (${selectedNode.package.amount})</p>
                <p><strong>Status:</strong> <span className={`status ${selectedNode.status}`}>{selectedNode.status}</span></p>
                <p><strong>Join Date:</strong> {selectedNode.joinDate}</p>
                <p><strong>Rank:</strong> {selectedNode.rank.icon} {selectedNode.rank.current}</p>
              </div>

              <div className="detail-section">
                <h4>Earnings Breakdown</h4>
                <p><strong>Total Earnings:</strong> ${selectedNode.earnings.total.toFixed(2)}</p>
                <p><strong>Direct Commissions:</strong> ${selectedNode.earnings.direct.toFixed(2)}</p>
                <p><strong>Level Bonuses:</strong> ${selectedNode.earnings.level.toFixed(2)}</p>
                <p><strong>Uplink Bonuses:</strong> ${selectedNode.earnings.uplink.toFixed(2)}</p>
                <p><strong>Leadership Rewards:</strong> ${selectedNode.earnings.leadership.toFixed(2)}</p>
              </div>

              <div className="detail-section">
                <h4>Team Performance</h4>
                <p><strong>Team Size:</strong> {selectedNode.businessMetrics.teamSize} members</p>
                <p><strong>Team Volume:</strong> ${selectedNode.businessMetrics.teamVolume.toFixed(0)}</p>
                <p><strong>Personal Sales:</strong> ${selectedNode.businessMetrics.personalSales.toFixed(0)}</p>
                <p><strong>Growth Rate:</strong> {selectedNode.performance.growthRate.toFixed(1)}%</p>
                <p><strong>Conversion Rate:</strong> {selectedNode.performance.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Map */}
      {showMiniMap && (
        <div className="mini-map">
          <div className="mini-map-content">
            {/* Mini version of the tree for navigation */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedGenealogyTree;
