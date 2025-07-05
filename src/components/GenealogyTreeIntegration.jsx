import React, { useState, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';

/**
 * GenealogyTreeIntegration - Enhanced Network Tree Visualization
 * 
 * This component provides the genealogy tree functionality that was in the original
 * OrphiDashboard, enhanced with better integration and responsiveness.
 */

const GenealogyTreeIntegration = ({ 
  networkData = null,
  userAddress = null,
  onNodeClick = null,
  searchQuery = '',
  theme = 'dark'
}) => {
  const [treeData, setTreeData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [treeStats, setTreeStats] = useState({
    totalNodes: 0,
    maxDepth: 0,
    activeBranches: 0
  });
  const treeRef = useRef(null);

  // Generate demo tree data if no real data provided
  useEffect(() => {
    if (networkData) {
      setTreeData(networkData);
    } else {
      // Generate demo tree structure
      const demoTree = generateDemoTreeData();
      setTreeData(demoTree);
      setTreeStats({
        totalNodes: countNodes(demoTree),
        maxDepth: getMaxDepth(demoTree),
        activeBranches: getActiveBranches(demoTree)
      });
    }
  }, [networkData]);

  // Generate demonstration tree data
  const generateDemoTreeData = () => {
    return {
      name: 'Root User',
      attributes: {
        address: '0x1234...5678',
        level: 1,
        package: '$200',
        earnings: '$15,420',
        team: 156,
        active: true
      },
      children: [
        {
          name: 'Alpha Leader',
          attributes: {
            address: '0x2345...6789',
            level: 2,
            package: '$100',
            earnings: '$8,750',
            team: 89,
            active: true
          },
          children: [
            {
              name: 'Beta Member',
              attributes: {
                address: '0x3456...7890',
                level: 3,
                package: '$50',
                earnings: '$2,340',
                team: 23,
                active: true
              },
              children: [
                {
                  name: 'Gamma Member',
                  attributes: {
                    address: '0x4567...8901',
                    level: 4,
                    package: '$30',
                    earnings: '$890',
                    team: 8,
                    active: false
                  }
                }
              ]
            },
            {
              name: 'Delta Member',
              attributes: {
                address: '0x5678...9012',
                level: 3,
                package: '$100',
                earnings: '$4,125',
                team: 31,
                active: true
              }
            }
          ]
        },
        {
          name: 'Epsilon Leader',
          attributes: {
            address: '0x6789...0123',
            level: 2,
            package: '$200',
            earnings: '$12,680',
            team: 67,
            active: true
          },
          children: [
            {
              name: 'Zeta Member',
              attributes: {
                address: '0x7890...1234',
                level: 3,
                package: '$50',
                earnings: '$1,950',
                team: 15,
                active: true
              }
            }
          ]
        }
      ]
    };
  };

  // Helper functions for tree analysis
  const countNodes = (node) => {
    if (!node) return 0;
    let count = 1;
    if (node.children) {
      node.children.forEach(child => {
        count += countNodes(child);
      });
    }
    return count;
  };

  const getMaxDepth = (node, depth = 1) => {
    if (!node || !node.children) return depth;
    let maxDepth = depth;
    node.children.forEach(child => {
      const childDepth = getMaxDepth(child, depth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    });
    return maxDepth;
  };

  const getActiveBranches = (node) => {
    if (!node) return 0;
    let activeBranches = node.attributes?.active ? 1 : 0;
    if (node.children) {
      node.children.forEach(child => {
        activeBranches += getActiveBranches(child);
      });
    }
    return activeBranches;
  };

  // Custom node renderer with OrphiChain styling
  const renderCustomNode = ({ nodeDatum, toggleNode }) => {
    const isActive = nodeDatum.attributes?.active;
    const isSearchMatch = searchQuery && 
      (nodeDatum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       nodeDatum.attributes?.address?.includes(searchQuery));

    return (
      <g>
        {/* Node circle */}
        <circle
          r={20}
          fill={isActive ? '#00D4FF' : '#7B2CBF'}
          stroke={isSearchMatch ? '#FF6B35' : '#00FF88'}
          strokeWidth={isSearchMatch ? 4 : 2}
          opacity={isActive ? 1 : 0.6}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setSelectedNode(nodeDatum);
            if (onNodeClick) onNodeClick(nodeDatum);
          }}
        />
        
        {/* User icon */}
        <text
          x={0}
          y={6}
          textAnchor="middle"
          fontSize="12"
          fill="white"
        >
          👤
        </text>
        
        {/* Node label */}
        <text
          x={0}
          y={40}
          textAnchor="middle"
          fontSize="10"
          fill={theme === 'dark' ? '#ffffff' : '#000000'}
        >
          {nodeDatum.name}
        </text>
        
        {/* Package info */}
        <text
          x={0}
          y={52}
          textAnchor="middle"
          fontSize="8"
          fill={theme === 'dark' ? '#B8C5D1' : '#666666'}
        >
          {nodeDatum.attributes?.package}
        </text>
        
        {/* Team size indicator */}
        {nodeDatum.attributes?.team && (
          <text
            x={25}
            y={-15}
            textAnchor="middle"
            fontSize="8"
            fill="#00FF88"
          >
            {nodeDatum.attributes.team}
          </text>
        )}
      </g>
    );
  };

  // Handle node selection and details
  const handleNodeClick = (nodeDatum) => {
    setSelectedNode(nodeDatum);
    if (onNodeClick) {
      onNodeClick(nodeDatum);
    }
  };

  if (!treeData) {
    return (
      <div className="genealogy-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
        </div>
        <p>Loading network tree...</p>
      </div>
    );
  }

  return (
    <div className={`genealogy-tree-integration theme-${theme}`}>
      {/* Tree stats header */}
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
            <span className="stat-label">Active Members</span>
            <span className="stat-value">{treeStats.activeBranches}</span>
          </div>
        </div>
      </div>

      {/* Tree visualization container */}
      <div className="tree-container" ref={treeRef}>
        <Tree
          data={treeData}
          orientation="vertical"
          pathFunc="elbow"
          renderCustomNodeElement={renderCustomNode}
          translate={{ x: 400, y: 100 }}
          zoom={0.8}
          separation={{ siblings: 1.5, nonSiblings: 2 }}
          nodeSize={{ x: 120, y: 100 }}
          enableLegacyTransitions={true}
          transitionDuration={500}
        />
      </div>

      {/* Selected node details panel */}
      {selectedNode && (
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
              <span className="detail-label">Level:</span>
              <span className="detail-value">{selectedNode.attributes?.level}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Package:</span>
              <span className="detail-value">{selectedNode.attributes?.package}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Earnings:</span>
              <span className="detail-value">{selectedNode.attributes?.earnings}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Team Size:</span>
              <span className="detail-value">{selectedNode.attributes?.team}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`detail-value status-${selectedNode.attributes?.active ? 'active' : 'inactive'}`}>
                {selectedNode.attributes?.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .genealogy-tree-integration {
          position: relative;
          height: 600px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .theme-light {
          background: rgba(0, 0, 0, 0.05);
          border-color: rgba(0, 0, 0, 0.1);
        }

        .genealogy-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: var(--orphi-text-secondary);
        }

        .loading-spinner {
          margin-bottom: 1rem;
        }

        .spinner-ring {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(0, 212, 255, 0.3);
          border-top: 3px solid #00D4FF;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .tree-header {
          padding: 1rem;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tree-stats {
          display: flex;
          justify-content: space-around;
          gap: 1rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 0.8rem;
          color: var(--orphi-text-secondary);
          margin-bottom: 0.25rem;
        }

        .stat-value {
          display: block;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--orphi-cyber-blue);
        }

        .tree-container {
          height: calc(100% - 80px);
          width: 100%;
          position: relative;
        }

        .node-details-panel {
          position: absolute;
          top: 100px;
          right: 20px;
          width: 300px;
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.8rem;
          backdrop-filter: blur(10px);
          z-index: 10;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .panel-header h3 {
          margin: 0;
          color: var(--orphi-cyber-blue);
          font-size: 1.1rem;
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--orphi-text-secondary);
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0.25rem;
        }

        .close-btn:hover {
          color: var(--orphi-cyber-blue);
        }

        .panel-content {
          padding: 1rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.8rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .detail-label {
          font-size: 0.9rem;
          color: var(--orphi-text-secondary);
          font-weight: 500;
        }

        .detail-value {
          font-size: 0.9rem;
          color: var(--orphi-text-primary);
          font-family: 'Roboto Mono', monospace;
        }

        .status-active {
          color: var(--orphi-success) !important;
        }

        .status-inactive {
          color: var(--orphi-error) !important;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .genealogy-tree-integration {
            height: 500px;
          }

          .tree-stats {
            flex-direction: column;
            gap: 0.5rem;
          }

          .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .stat-label,
          .stat-value {
            display: inline;
          }

          .node-details-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90vw;
            max-width: 400px;
          }
        }
      `}</style>
    </div>
  );
};

export default GenealogyTreeIntegration;
