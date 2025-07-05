/**
 * Clean D3 Genealogy Tree Visualization Component
 * Features: Interactive tree, zoom/pan, member details, earnings flow
 * Production version with no dummy data
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const GenealogyTree = ({ treeData, onNodeClick }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Default empty tree structure if no data provided
  const defaultTreeData = {
    name: 'You (Root)',
    id: 'user',
    level: 0,
    package: 'Not Active',
    packageValue: 0,
    totalEarnings: 0,
    directCommission: 0,
    levelBonus: 0,
    leaderPool: 0,
    helpPool: 0,
    uplineBonus: 0,
    status: 'inactive',
    rank: 'Member',
    avatar: '👤',
    joinDate: null,
    directReferrals: 0,
    teamSize: 0,
    children: [],
  };

  const data = treeData || defaultTreeData;

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: Math.max(rect.height || 600, 600),
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!data) {
      console.warn('GenealogyTree: No data provided');
      return;
    }

    if (!d3 || !svgRef.current) {
      console.error('GenealogyTree: D3 library or SVG ref not available');
      return;
    }

    const { width, height } = dimensions;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };

    try {
      // Clear previous render
      d3.select(svgRef.current).selectAll('*').remove();
    } catch (error) {
      console.error('GenealogyTree: Error clearing SVG:', error);
      return;
    }

    try {
      // Setup SVG
      const svg = d3
        .select(svgRef.current)
        .attr('width', width)
        .attr('height', height);

    // Create zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 3])
      .on('zoom', event => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create main group
    const g = svg.append('g');

    // Create tree layout
    const treeLayout = d3
      .tree()
      .size([
        height - margin.top - margin.bottom,
        width - margin.left - margin.right,
      ]);

    // Generate tree structure
    const root = d3.hierarchy(data);
    const treeData = treeLayout(root);

    // Create links
    const links = g
      .selectAll('.link')
      .data(treeData.descendants().slice(1))
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d => {
        return `M ${d.y + margin.left} ${d.x + margin.top}
                C ${(d.y + d.parent.y) / 2 + margin.left} ${d.x + margin.top},
                  ${(d.y + d.parent.y) / 2 + margin.left} ${d.parent.x + margin.top},
                  ${d.parent.y + margin.left} ${d.parent.x + margin.top}`;
      })
      .style('fill', 'none')
      .style('stroke', '#ddd')
      .style('stroke-width', '2px');

    // Create earnings flow animation (if enabled)
    const createEarningsFlow = link => {
      const path = link.node();
      const totalLength = path.getTotalLength();

      const flowDot = g
        .append('circle')
        .attr('r', 3)
        .attr('fill', '#fdcb6e')
        .attr('opacity', 0);

      flowDot
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('opacity', 1)
        .attrTween('transform', () => {
          return t => {
            const point = path.getPointAtLength(t * totalLength);
            return `translate(${point.x}, ${point.y})`;
          };
        })
        .transition()
        .duration(500)
        .attr('opacity', 0)
        .remove();
    };

    // Create node groups
    const nodes = g
      .selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr(
        'transform',
        d => `translate(${d.y + margin.left}, ${d.x + margin.top})`
      )
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (onNodeClick) onNodeClick(d.data);
      });

    // Add node circles with package-based styling
    nodes
      .append('circle')
      .attr('r', d => (d.data.level === 0 ? 25 : 20))
      .style('fill', d => {
        if (d.data.status === 'inactive') return '#e74c3c';
        const packageColors = {
          Starter: '#3498db',
          Growth: '#2ecc71',
          Professional: '#9b59b6',
          Elite: '#f39c12',
        };
        return packageColors[d.data.package] || '#95a5a6';
      })
      .style('stroke', '#fff')
      .style('stroke-width', '3px')
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');

    // Add avatar/emoji
    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 5)
      .style('font-size', d => (d.data.level === 0 ? '20px' : '16px'))
      .style('pointer-events', 'none')
      .text(d => d.data.avatar || '👤');

    // Add member name
    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', d => (d.data.level === 0 ? 45 : 40))
      .style('font-size', '10px')
      .style('font-weight', '600')
      .style('fill', '#2c3e50')
      .style('pointer-events', 'none')
      .text(d => d.data.name || 'Unknown');

    // Add package info
    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', d => (d.data.level === 0 ? 56 : 51))
      .style('font-size', '8px')
      .style('fill', '#7f8c8d')
      .style('pointer-events', 'none')
      .text(d => d.data.package || 'No Package');

    // Add total earnings
    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', d => (d.data.level === 0 ? 67 : 62))
      .style('font-size', '9px')
      .style('font-weight', '600')
      .style('fill', '#27ae60')
      .style('pointer-events', 'none')
      .text(d => `$${(d.data.totalEarnings || 0).toFixed(0)}`);

    // Add rank badges for leaders
    nodes
      .filter(d => d.data.rank && d.data.rank !== 'Member')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -35)
      .style('font-size', '8px')
      .style('font-weight', '600')
      .style('fill', '#fff')
      .style('background', '#4facfe')
      .style('padding', '2px 4px')
      .style('border-radius', '8px')
      .style('pointer-events', 'none')
      .text(d => d.data.rank);

    // Add level indicators
    nodes
      .filter(d => d.data.level > 0)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -30)
      .style('font-size', '8px')
      .style('font-weight', '600')
      .style('fill', '#55a3ff')
      .text(d => `L${d.data.level}`);

    // Initial zoom to fit content - with safe bounds checking
    try {
      const bounds = g.node()?.getBBox();
      if (bounds && bounds.width > 0 && bounds.height > 0) {
        const fullWidth = width;
        const fullHeight = height;
        const widthScale = fullWidth / bounds.width;
        const heightScale = fullHeight / bounds.height;
        const scale = Math.min(widthScale, heightScale) * 0.7; // Reduced scale for better fit

        const translate = [
          (fullWidth - bounds.width * scale) / 2 - bounds.x * scale,
          (fullHeight - bounds.height * scale) / 2 - bounds.y * scale,
        ];

        svg.call(
          zoom.transform,
          d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
      }
    } catch (error) {
      console.warn('GenealogyTree: Could not calculate initial zoom:', error);
      // Set a default center position
      svg.call(
        zoom.transform,
        d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8)
      );
    }

      // Cleanup function
      return () => {
        try {
          svg.selectAll('*').remove();
        } catch (error) {
          console.warn('GenealogyTree: Error during cleanup:', error);
        }
      };
    } catch (error) {
      console.error('GenealogyTree: Error rendering tree:', error);
      
      // Fallback: show error message in SVG
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .style('fill', '#ff6b6b')
        .style('font-size', '16px')
        .style('font-weight', '600')
        .text('Error rendering genealogy tree');
      
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2 + 25)
        .attr('text-anchor', 'middle')
        .style('fill', '#fff')
        .style('font-size', '12px')
        .text('Please refresh the page or contact support');
    }
  }, [data, dimensions, onNodeClick]);

  return (
    <div
      ref={containerRef}
      className="genealogy-tree-container"
      style={{ 
        width: '100%', 
        height: '600px',
        position: 'relative',
        background: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        zIndex: 1,
        isolation: 'isolate',
        contain: 'layout style'
      }}
    >
      <svg ref={svgRef} style={{ 
        width: '100%', 
        height: '100%', 
        display: 'block',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Tree will be rendered here by D3 */}
      </svg>

      {/* Legend */}
      <div
        className="tree-legend"
        style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'rgba(26, 26, 46, 0.95)',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          color: 'white',
          backdropFilter: 'blur(10px)',
          zIndex: 100,
          pointerEvents: 'none',
          maxWidth: '150px'
        }}
      >
        <div style={{ marginBottom: '6px', fontWeight: '600', color: '#00d4ff' }}>
          Package Types
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: '#3498db' }}>●</span> Starter ($30)
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: '#2ecc71' }}>●</span> Growth ($50)
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: '#9b59b6' }}>●</span> Professional ($100)
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: '#f39c12' }}>●</span> Elite ($200)
        </div>
        <div>
          <span style={{ color: '#e74c3c' }}>●</span> Inactive
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '15px',
          left: '15px',
          background: 'rgba(26, 26, 46, 0.95)',
          padding: '8px',
          borderRadius: '8px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          zIndex: 100,
          pointerEvents: 'none',
          maxWidth: '180px'
        }}
      >
        <div>🖱️ Click & drag to pan</div>
        <div>🔍 Scroll to zoom</div>
        <div>👆 Click nodes for details</div>
      </div>
    </div>
  );
};

export default GenealogyTree;
