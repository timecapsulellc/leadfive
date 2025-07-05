/**
 * D3 Genealogy Tree Visualization Component
 * Features: Interactive tree, zoom/pan, member details, earnings flow
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
    children: [
      {
        name: 'Alice Chen',
        id: 'alice',
        level: 1,
        package: 'Elite',
        packageValue: 200,
        totalEarnings: 820.0,
        directCommission: 240.0, // 40% of her 3 direct referrals
        levelBonus: 125.0, // 10% from levels 2-8
        leaderPool: 15.0, // Bronze leader pool share
        helpPool: 85.0, // 30% help pool share
        uplineBonus: 20.0, // 10% from your upline structure
        status: 'active',
        rank: 'Bronze Leader',
        avatar: '👩',
        joinDate: '2024-02-15',
        directReferrals: 3,
        teamSize: 12,
        children: [
          {
            name: 'Bob Wilson',
            id: 'bob',
            level: 2,
            package: 'Professional',
            packageValue: 100,
            totalEarnings: 340.0,
            directCommission: 120.0, // 40% of 2 direct referrals
            levelBonus: 45.0, // 10% from levels 3-8
            leaderPool: 0, // Not qualified yet
            helpPool: 35.0, // 30% help pool share
            uplineBonus: 10.0, // 10% upline bonus
            status: 'active',
            rank: 'Member',
            avatar: '👨',
            joinDate: '2024-03-10',
            directReferrals: 2,
            teamSize: 6,
            children: [
              {
                name: 'Emma Davis',
                id: 'emma',
                level: 3,
                package: 'Growth',
                packageValue: 50,
                totalEarnings: 125.0,
                directCommission: 60.0,
                levelBonus: 15.0,
                leaderPool: 0,
                helpPool: 20.0,
                uplineBonus: 5.0,
                status: 'active',
                rank: 'Member',
                avatar: '👩',
                joinDate: '2024-04-05',
                directReferrals: 1,
                teamSize: 3,
              },
              {
                name: 'James Rodriguez',
                id: 'james',
                level: 3,
                package: 'Starter',
                packageValue: 30,
                totalEarnings: 85.0,
                directCommission: 36.0,
                levelBonus: 8.0,
                leaderPool: 0,
                helpPool: 12.0,
                uplineBonus: 3.0,
                status: 'active',
                rank: 'Member',
                avatar: '👨',
                joinDate: '2024-04-20',
                directReferrals: 1,
                teamSize: 2,
              },
            ],
          },
          {
            name: 'Carol Thompson',
            id: 'carol',
            level: 2,
            package: 'Growth',
            packageValue: 50,
            totalEarnings: 280.0,
            directCommission: 100.0,
            levelBonus: 25.0,
            leaderPool: 0,
            helpPool: 25.0,
            uplineBonus: 8.0,
            status: 'active',
            rank: 'Member',
            avatar: '👩',
            joinDate: '2024-03-25',
            directReferrals: 2,
            teamSize: 4,
          },
        ],
      },
      {
        name: 'David Kim',
        id: 'david',
        level: 1,
        package: 'Professional',
        packageValue: 100,
        totalEarnings: 620.0,
        directCommission: 200.0,
        levelBonus: 85.0,
        leaderPool: 12.0,
        helpPool: 55.0,
        uplineBonus: 15.0,
        status: 'active',
        rank: 'Bronze Leader',
        avatar: '👨',
        joinDate: '2024-02-28',
        directReferrals: 2,
        teamSize: 8,
        children: [
          {
            name: 'Maria Santos',
            id: 'maria',
            level: 2,
            package: 'Elite',
            packageValue: 200,
            totalEarnings: 450.0,
            directCommission: 160.0,
            levelBonus: 35.0,
            leaderPool: 0,
            helpPool: 40.0,
            uplineBonus: 12.0,
            status: 'active',
            rank: 'Member',
            avatar: '👩',
            joinDate: '2024-04-10',
            directReferrals: 1,
            teamSize: 3,
          },
          {
            name: 'Ahmed Hassan',
            id: 'ahmed',
            level: 2,
            package: 'Growth',
            packageValue: 50,
            totalEarnings: 195.0,
            directCommission: 80.0,
            levelBonus: 18.0,
            leaderPool: 0,
            helpPool: 22.0,
            uplineBonus: 6.0,
            status: 'active',
            rank: 'Member',
            avatar: '👨',
            joinDate: '2024-05-01',
            directReferrals: 1,
            teamSize: 2,
          },
        ],
      },
      {
        name: 'Sarah Johnson',
        id: 'sarah',
        level: 1,
        package: 'Growth',
        packageValue: 50,
        totalEarnings: 320.0,
        directCommission: 120.0,
        levelBonus: 35.0,
        leaderPool: 0,
        helpPool: 28.0,
        uplineBonus: 8.0,
        status: 'active',
        rank: 'Member',
        avatar: '👩',
        joinDate: '2024-03-15',
        directReferrals: 1,
        teamSize: 3,
        children: [
          {
            name: 'Chen Wei',
            id: 'chen',
            level: 2,
            package: 'Professional',
            packageValue: 100,
            totalEarnings: 235.0,
            directCommission: 80.0,
            levelBonus: 22.0,
            leaderPool: 0,
            helpPool: 18.0,
            uplineBonus: 6.0,
            status: 'active',
            rank: 'Member',
            avatar: '👨',
            joinDate: '2024-05-20',
            directReferrals: 0,
            teamSize: 1,
          },
        ],
      },
    ],
  };

  const data = treeData || sampleTreeData;

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
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group with zoom behavior
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', event => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create tree layout
    const treeLayout = d3
      .tree()
      .size([innerHeight, innerWidth])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2));

    // Convert data to hierarchy
    const root = d3.hierarchy(data);
    const treeData = treeLayout(root);

    // Create links (lines between nodes)
    const links = g
      .selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr(
        'd',
        d3
          .linkHorizontal()
          .x(d => d.y + margin.left)
          .y(d => d.x + margin.top)
      )
      .style('fill', 'none')
      .style('stroke', '#55a3ff')
      .style('stroke-width', 2)
      .style('stroke-opacity', 0.6);

    // Create earnings flow animation
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

    // Animate earnings flow periodically
    const animateFlow = () => {
      links.each(function () {
        createEarningsFlow(d3.select(this));
      });
    };

    const flowInterval = setInterval(animateFlow, 3000);

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
      .attr('r', d => (d.data.level === 0 ? 30 : 25))
      .attr('fill', d => {
        if (d.data.level === 0) return '#4facfe';
        // Color based on package type
        switch (d.data.package) {
          case 'Elite':
            return '#ff6b6b';
          case 'Professional':
            return '#4ecdc4';
          case 'Growth':
            return '#45b7d1';
          case 'Starter':
            return '#96ceb4';
          default:
            return d.data.status === 'active' ? '#00b894' : '#e74c3c';
        }
      })
      .attr('stroke', d => {
        // Rank-based stroke
        switch (d.data.rank) {
          case 'Diamond Legend':
            return '#b9f2ff';
          case 'Platinum Elite':
            return '#e5e4e2';
          case 'Gold Crown':
            return '#ffd700';
          case 'Silver Star':
            return '#c0c0c0';
          case 'Bronze Leader':
            return '#cd7f32';
          default:
            return '#fff';
        }
      })
      .attr('stroke-width', d =>
        d.data.rank && d.data.rank !== 'Member' ? 4 : 2
      )
      .style('filter', 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.data.level === 0 ? 35 : 30);

        // Show tooltip with detailed earnings breakdown
        showTooltip(event, d.data);
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.data.level === 0 ? 30 : 25);

        hideTooltip();
      });

    // Add avatar emojis
    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', d => (d.data.level === 0 ? '18px' : '16px'))
      .style('pointer-events', 'none')
      .text(d => d.data.avatar || '👤');

    // Add name labels
    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', d => (d.data.level === 0 ? 40 : 35))
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('fill', '#333')
      .style('pointer-events', 'none')
      .text(d => d.data.name.split(' ')[0]); // First name only

    // Add package info
    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', d => (d.data.level === 0 ? 52 : 47))
      .style('font-size', '9px')
      .style('fill', '#666')
      .style('pointer-events', 'none')
      .text(d => `${d.data.package} ($${d.data.packageValue})`);

    // Add total earnings
    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', d => (d.data.level === 0 ? 64 : 59))
      .style('font-size', '9px')
      .style('font-weight', '600')
      .style('fill', '#27ae60')
      .style('pointer-events', 'none')
      .text(d => `$${d.data.totalEarnings?.toFixed(0) || 0}`);

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

    // Initial zoom to fit content
    const bounds = g.node().getBBox();
    const fullWidth = width;
    const fullHeight = height;
    const widthScale = fullWidth / bounds.width;
    const heightScale = fullHeight / bounds.height;
    const scale = Math.min(widthScale, heightScale) * 0.8;

    const translate = [
      (fullWidth - bounds.width * scale) / 2 - bounds.x * scale,
      (fullHeight - bounds.height * scale) / 2 - bounds.y * scale,
    ];

    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
    );

    // Tooltip functions
    const showTooltip = (event, nodeData) => {
      const tooltip = d3
        .select(containerRef.current)
        .select('.tooltip')
        .style('display', 'block');

      if (tooltip.empty()) {
        d3.select(containerRef.current)
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.9)')
          .style('color', 'white')
          .style('padding', '12px')
          .style('border-radius', '8px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .style('max-width', '250px')
          .html(
            `
            <div style="font-weight: bold; margin-bottom: 8px;">${nodeData.name}</div>
            <div style="margin-bottom: 4px;"><strong>Package:</strong> ${nodeData.package} ($${nodeData.packageValue})</div>
            <div style="margin-bottom: 4px;"><strong>Rank:</strong> ${nodeData.rank || 'Member'}</div>
            <div style="margin-bottom: 4px;"><strong>Level:</strong> ${nodeData.level}</div>
            <div style="margin-bottom: 4px;"><strong>Team Size:</strong> ${nodeData.teamSize || 0}</div>
            <div style="margin-bottom: 8px;"><strong>Direct Referrals:</strong> ${nodeData.directReferrals || 0}</div>
            <div style="border-top: 1px solid #333; padding-top: 8px; margin-bottom: 4px;"><strong>Earnings Breakdown:</strong></div>
            <div style="margin-bottom: 2px;">• Direct Commission: $${nodeData.directCommission?.toFixed(2) || '0.00'}</div>
            <div style="margin-bottom: 2px;">• Level Bonus: $${nodeData.levelBonus?.toFixed(2) || '0.00'}</div>
            <div style="margin-bottom: 2px;">• Help Pool: $${nodeData.helpPool?.toFixed(2) || '0.00'}</div>
            <div style="margin-bottom: 2px;">• Leader Pool: $${nodeData.leaderPool?.toFixed(2) || '0.00'}</div>
            <div style="margin-bottom: 2px;">• Upline Bonus: $${nodeData.uplineBonus?.toFixed(2) || '0.00'}</div>
            <div style="border-top: 1px solid #333; padding-top: 4px; font-weight: bold;">Total: $${nodeData.totalEarnings?.toFixed(2) || '0.00'}</div>
          `
          )
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      } else {
        tooltip
          .html(
            `
            <div style="font-weight: bold; margin-bottom: 8px;">${nodeData.name}</div>
            <div style="margin-bottom: 4px;"><strong>Package:</strong> ${nodeData.package} ($${nodeData.packageValue})</div>
            <div style="margin-bottom: 4px;"><strong>Rank:</strong> ${nodeData.rank || 'Member'}</div>
            <div style="margin-bottom: 4px;"><strong>Level:</strong> ${nodeData.level}</div>
            <div style="margin-bottom: 4px;"><strong>Team Size:</strong> ${nodeData.teamSize || 0}</div>
            <div style="margin-bottom: 8px;"><strong>Direct Referrals:</strong> ${nodeData.directReferrals || 0}</div>
            <div style="border-top: 1px solid #333; padding-top: 8px; margin-bottom: 4px;"><strong>Earnings Breakdown:</strong></div>
            <div style="margin-bottom: 2px;">• Direct Commission: $${nodeData.directCommission?.toFixed(2) || '0.00'}</div>
            <div style="margin-bottom: 2px;">• Level Bonus: $${nodeData.levelBonus?.toFixed(2) || '0.00'}</div>
            <div style="margin-bottom: 2px;">• Help Pool: $${nodeData.helpPool?.toFixed(2) || '0.00'}</div>
            <div style="margin-bottom: 2px;">• Leader Pool: $${nodeData.leaderPool?.toFixed(2) || '0.00'}</div>
            <div style="margin-bottom: 2px;">• Upline Bonus: $${nodeData.uplineBonus?.toFixed(2) || '0.00'}</div>
            <div style="border-top: 1px solid #333; padding-top: 4px; font-weight: bold;">Total: $${nodeData.totalEarnings?.toFixed(2) || '0.00'}</div>
          `
          )
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
          .style('display', 'block');
      }
    };

    const hideTooltip = () => {
      d3.select(containerRef.current)
        .select('.tooltip')
        .style('display', 'none');
    };

    // Cleanup interval on unmount
    return () => {
      clearInterval(flowInterval);
    };
  }, [data, dimensions, onNodeClick]);

  return (
    <div
      ref={containerRef}
      className="genealogy-tree-container"
      style={{ width: '100%', height: '600px', position: 'relative' }}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          border: '2px solid #f0f2f5',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f8f9fb 0%, #ffffff 100%)',
        }}
      />

      {/* LeadFive Business Model Legend */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '11px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '200px',
        }}
      >
        <div
          style={{ fontWeight: '600', marginBottom: '8px', color: '#4facfe' }}
        >
          LeadFive Package Types
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '3px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#ff6b6b',
            }}
          ></div>
          <span>Elite ($200)</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '3px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#4ecdc4',
            }}
          ></div>
          <span>Professional ($100)</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '3px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#45b7d1',
            }}
          ></div>
          <span>Growth ($50)</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#96ceb4',
            }}
          ></div>
          <span>Starter ($30)</span>
        </div>

        <div
          style={{
            fontWeight: '600',
            marginBottom: '6px',
            color: '#4facfe',
            borderTop: '1px solid #ddd',
            paddingTop: '6px',
          }}
        >
          Leadership Ranks
        </div>
        <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>
          🥇 Diamond Legend
        </div>
        <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>
          ⭐ Platinum Elite
        </div>
        <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>
          👑 Gold Crown
        </div>
        <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>
          ⚡ Silver Star
        </div>
        <div style={{ fontSize: '10px', color: '#666', marginBottom: '6px' }}>
          🏆 Bronze Leader
        </div>

        <div
          style={{
            fontSize: '9px',
            color: '#666',
            marginTop: '6px',
            borderTop: '1px solid #ddd',
            paddingTop: '4px',
          }}
        >
          💡 Hover for earnings breakdown
          <br />
          🖱️ Scroll to zoom, drag to pan
          <br />
          📊 4x multiplier max earnings
        </div>
      </div>

      {/* LeadFive Network Stats */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '11px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          minWidth: '140px',
        }}
      >
        <div
          style={{ fontWeight: '600', marginBottom: '8px', color: '#4facfe' }}
        >
          Network Overview
        </div>
        <div style={{ marginBottom: '3px' }}>
          👥 Total Members: {countMembers(data)}
        </div>
        <div style={{ marginBottom: '3px' }}>
          📊 Network Levels: {getMaxLevel(data)}
        </div>
        <div style={{ marginBottom: '3px' }}>
          🎯 Direct Referrals: {data.directReferrals}
        </div>
        <div style={{ marginBottom: '6px' }}>💼 Your Rank: {data.rank}</div>

        <div
          style={{
            borderTop: '1px solid #ddd',
            paddingTop: '6px',
            marginBottom: '6px',
          }}
        >
          <div
            style={{ fontWeight: '600', marginBottom: '4px', color: '#4facfe' }}
          >
            Earnings Summary
          </div>
          <div style={{ fontSize: '10px', marginBottom: '2px' }}>
            💰 Direct: ${getTotalDirectCommissions(data).toFixed(0)}
          </div>
          <div style={{ fontSize: '10px', marginBottom: '2px' }}>
            📈 Level Bonus: ${getTotalLevelBonus(data).toFixed(0)}
          </div>
          <div style={{ fontSize: '10px', marginBottom: '2px' }}>
            🎁 Help Pool: ${getTotalHelpPool(data).toFixed(0)}
          </div>
          <div style={{ fontSize: '10px', marginBottom: '4px' }}>
            👑 Leader Pool: ${getTotalLeaderPool(data).toFixed(0)}
          </div>
        </div>

        <div
          style={{
            color: '#27ae60',
            fontWeight: '600',
            borderTop: '1px solid #ddd',
            paddingTop: '4px',
          }}
        >
          🏆 Network Total: ${getTotalEarnings(data).toFixed(0)}
        </div>
      </div>
    </div>
  );
};

// LeadFive Business Model Helper Functions
const countMembers = node => {
  let count = 1;
  if (node.children) {
    count += node.children.reduce((sum, child) => sum + countMembers(child), 0);
  }
  return count;
};

const getMaxLevel = (node, currentLevel = 0) => {
  let maxLevel = currentLevel;
  if (node.children) {
    maxLevel = Math.max(
      maxLevel,
      ...node.children.map(child => getMaxLevel(child, currentLevel + 1))
    );
  }
  return maxLevel + 1;
};

const getTotalEarnings = node => {
  let total = node.totalEarnings || 0;
  if (node.children) {
    total += node.children.reduce(
      (sum, child) => sum + getTotalEarnings(child),
      0
    );
  }
  return total;
};

const getTotalDirectCommissions = node => {
  let total = node.directCommission || 0;
  if (node.children) {
    total += node.children.reduce(
      (sum, child) => sum + getTotalDirectCommissions(child),
      0
    );
  }
  return total;
};

const getTotalLevelBonus = node => {
  let total = node.levelBonus || 0;
  if (node.children) {
    total += node.children.reduce(
      (sum, child) => sum + getTotalLevelBonus(child),
      0
    );
  }
  return total;
};

const getTotalHelpPool = node => {
  let total = node.helpPool || 0;
  if (node.children) {
    total += node.children.reduce(
      (sum, child) => sum + getTotalHelpPool(child),
      0
    );
  }
  return total;
};

const getTotalLeaderPool = node => {
  let total = node.leaderPool || 0;
  if (node.children) {
    total += node.children.reduce(
      (sum, child) => sum + getTotalLeaderPool(child),
      0
    );
  }
  return total;
};

const getPackageDistribution = node => {
  const distribution = { Elite: 0, Professional: 0, Growth: 0, Starter: 0 };

  const countPackages = n => {
    if (n.package && distribution[n.package] !== undefined) {
      distribution[n.package]++;
    }
    if (n.children) {
      n.children.forEach(countPackages);
    }
  };

  countPackages(node);
  return distribution;
};

export default GenealogyTree;
