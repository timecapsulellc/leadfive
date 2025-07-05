/**
 * Compact Genealogy Tree Widget
 * 
 * Lightweight version of the genealogy tree for dashboard overview
 * Features:
 * - Compact size optimized for dashboard cards
 * - Essential business metrics only
 * - Quick navigation to full tree view
 * - Both vertical and horizontal layouts
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import {
  FaNetworkWired,
  FaUsers,
  FaDollarSign,
  FaExpand,
  FaArrowUp,
  FaArrowDown,
  FaEye
} from 'react-icons/fa';
import './CompactGenealogyTree.css';

const CompactGenealogyTree = ({
  userData,
  layout = 'vertical',
  showControls = true,
  className = ''
}) => {
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const [treeData, setTreeData] = useState(null);
  const [currentLayout, setCurrentLayout] = useState(layout);

  // Generate compact tree data (max 3 levels for dashboard view)
  const generateCompactTreeData = () => {
    return {
      id: 'root',
      name: userData?.account ? `${userData.account.slice(0, 6)}...${userData.account.slice(-4)}` : 'You',
      level: 0,
      position: 'root',
      package: { amount: userData?.currentPackage || 100, color: '#8B5CF6' },
      earnings: userData?.earnings?.total || 2847,
      status: 'active',
      children: [
        {
          id: 'left-1',
          name: '0x7890...abcd',
          level: 1,
          position: 'left',
          package: { amount: 50, color: '#10B981' },
          earnings: 1245,
          status: 'active',
          children: [
            {
              id: 'left-2-1',
              name: '0x2345...6789',
              level: 2,
              position: 'left',
              package: { amount: 30, color: '#3B82F6' },
              earnings: 567,
              status: 'active',
            },
            {
              id: 'left-2-2',
              name: '0x9012...3456',
              level: 2,
              position: 'right',
              package: { amount: 50, color: '#F59E0B' },
              earnings: 423,
              status: 'inactive',
            }
          ]
        },
        {
          id: 'right-1',
          name: '0xabcd...7890',
          level: 1,
          position: 'right',
          package: { amount: 100, color: '#8B5CF6' },
          earnings: 1856,
          status: 'active',
          children: [
            {
              id: 'right-2-1',
              name: '0x5678...9012',
              level: 2,
              position: 'left',
              package: { amount: 30, color: '#10B981' },
              earnings: 234,
              status: 'active',
            }
          ]
        }
      ]
    };
  };

  // Render compact D3 tree
  const renderCompactTree = () => {
    if (!treeData || !svgRef.current) return;

    const container = d3.select(svgRef.current);
    container.selectAll('*').remove();

    const width = 300;
    const height = 200;
    
    const svg = container
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('background', 'transparent');

    const g = svg.append('g');

    // Layout configuration
    const layouts = {
      vertical: {
        nodeSize: [60, 40],
        separation: (a, b) => (a.parent === b.parent ? 1 : 1.2),
        transform: (d) => `translate(${d.x + width/2},${d.y + 20})`,
        linkPath: (d) => {
          const sx = d.source.x + width/2;
          const sy = d.source.y + 20;
          const tx = d.target.x + width/2;
          const ty = d.target.y + 20;
          return `M${sx},${sy}C${sx},${(sy + ty) / 2} ${tx},${(sy + ty) / 2} ${tx},${ty}`;
        }
      },
      horizontal: {
        nodeSize: [40, 80],
        separation: (a, b) => (a.parent === b.parent ? 1 : 1.2),
        transform: (d) => `translate(${d.y + 20},${d.x + height/2})`,
        linkPath: (d) => {
          const sx = d.source.y + 20;
          const sy = d.source.x + height/2;
          const tx = d.target.y + 20;
          const ty = d.target.x + height/2;
          return `M${sx},${sy}C${(sx + tx) / 2},${sy} ${(sx + tx) / 2},${ty} ${tx},${ty}`;
        }
      }
    };

    const layoutConfig = layouts[currentLayout];
    
    // Create tree layout
    const treeLayout = d3.tree()
      .nodeSize(layoutConfig.nodeSize)
      .separation(layoutConfig.separation);

    const root = d3.hierarchy(treeData);
    const treeNodes = treeLayout(root);

    const nodes = treeNodes.descendants();
    const links = treeNodes.links();

    // Render links
    g.selectAll('.link')
      .data(links)
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', (d) => layoutConfig.linkPath(d))
      .style('fill', 'none')
      .style('stroke', (d) => {
        const isLeftLeg = d.target.data.position === 'left';
        return isLeftLeg ? '#10B981' : '#3B82F6';
      })
      .style('stroke-width', 2)
      .style('stroke-opacity', 0.8);

    // Render nodes
    const node = g.selectAll('.node')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', layoutConfig.transform)
      .style('cursor', 'pointer')
      .on('click', () => navigate('/dashboard/tree'));

    // Node circles
    node.append('circle')
      .attr('r', 12)
      .style('fill', (d) => d.data.package.color)
      .style('stroke', (d) => d.data.status === 'active' ? '#22C55E' : '#EF4444')
      .style('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');

    // Earnings text
    node.append('text')
      .attr('dy', 25)
      .style('text-anchor', 'middle')
      .style('font-size', '8px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .text((d) => `$${d.data.earnings}`);

    // Animation
    node.style('opacity', 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 100)
      .style('opacity', 1);
  };

  // Calculate quick stats
  const calculateStats = (data) => {
    let totalMembers = 0;
    let totalEarnings = 0;
    let activeMembers = 0;

    const traverse = (node) => {
      totalMembers++;
      totalEarnings += node.earnings;
      if (node.status === 'active') activeMembers++;
      
      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(data);
    return { totalMembers, totalEarnings, activeMembers };
  };

  useEffect(() => {
    const data = generateCompactTreeData();
    setTreeData(data);
  }, [userData]);

  useEffect(() => {
    if (treeData) {
      renderCompactTree();
    }
  }, [treeData, currentLayout]);

  const stats = treeData ? calculateStats(treeData) : { totalMembers: 0, totalEarnings: 0, activeMembers: 0 };

  return (
    <div className={`compact-genealogy-tree ${className}`}>
      {/* Header */}
      <div className="compact-header">
        <div className="header-info">
          <h4><FaNetworkWired /> Network Tree</h4>
          <p>Your binary structure overview</p>
        </div>
        
        {showControls && (
          <div className="compact-controls">
            <button 
              className={`layout-toggle ${currentLayout === 'vertical' ? 'active' : ''}`}
              onClick={() => setCurrentLayout('vertical')}
              title="Vertical Layout"
            >
              <FaArrowDown />
            </button>
            <button 
              className={`layout-toggle ${currentLayout === 'horizontal' ? 'active' : ''}`}
              onClick={() => setCurrentLayout('horizontal')}
              title="Horizontal Layout"
            >
              <FaArrowUp style={{ transform: 'rotate(90deg)' }} />
            </button>
            <button 
              className="expand-btn"
              onClick={() => navigate('/dashboard/tree')}
              title="View Full Tree"
            >
              <FaExpand />
            </button>
          </div>
        )}
      </div>

      {/* Tree Visualization */}
      <div className="tree-container">
        <svg ref={svgRef} className="compact-tree-svg"></svg>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-item">
          <FaUsers className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{stats.totalMembers}</div>
            <div className="stat-label">Members</div>
          </div>
        </div>
        
        <div className="stat-item">
          <FaDollarSign className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">${stats.totalEarnings.toLocaleString()}</div>
            <div className="stat-label">Volume</div>
          </div>
        </div>
        
        <div className="stat-item success">
          <div className="activity-indicator"></div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeMembers}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="tree-footer">
        <button 
          className="view-full-btn"
          onClick={() => navigate('/dashboard/tree')}
        >
          <FaEye /> View Full Tree
        </button>
      </div>
    </div>
  );
};

export default CompactGenealogyTree;
