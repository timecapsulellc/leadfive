import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Tree from 'react-d3-tree';
import './GenealogyTree.css';

const GenealogyTree = ({ account, contract }) => {
  const [treeData, setTreeData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [treeTranslate, setTreeTranslate] = useState({ x: 0, y: 0 });
  const [containerRef, setContainerRef] = useState(null);

  useEffect(() => {
    if (account && contract) {
      fetchTreeData();
    }
  }, [account, contract]);

  useEffect(() => {
    if (containerRef) {
      const { width, height } = containerRef.getBoundingClientRect();
      setTreeTranslate({ x: width / 2, y: 50 });
    }
  }, [containerRef]);

  const fetchTreeData = async () => {
    try {
      setLoading(true);
      
      // Enhanced mock data for react-d3-tree format
      const mockTreeData = {
        name: `${account.slice(0, 6)}...${account.slice(-4)}`,
        attributes: {
          id: account,
          package: 'Premium',
          earnings: '1,250.00',
          isActive: true,
          level: 1,
          directReferrals: 3,
          teamSize: 12,
          joinDate: '2024-01-15'
        },
        children: [
          {
            name: '0x1234...5678',
            attributes: {
              id: '0x1234...5678',
              package: 'Advanced',
              earnings: '875.50',
              isActive: true,
              level: 2,
              directReferrals: 2,
              teamSize: 5,
              joinDate: '2024-02-10'
            },
            children: [
              {
                name: '0x2345...6789',
                attributes: {
                  id: '0x2345...6789',
                  package: 'Standard',
                  earnings: '450.25',
                  isActive: true,
                  level: 3,
                  directReferrals: 1,
                  teamSize: 2,
                  joinDate: '2024-03-05'
                },
                children: [
                  {
                    name: '0x789A...BCDE',
                    attributes: {
                      id: '0x789A...BCDE',
                      package: 'Entry',
                      earnings: '125.00',
                      isActive: true,
                      level: 4,
                      directReferrals: 0,
                      teamSize: 1,
                      joinDate: '2024-04-20'
                    }
                  }
                ]
              },
              {
                name: '0x3456...7890',
                attributes: {
                  id: '0x3456...7890',
                  package: 'Premium',
                  earnings: '680.75',
                  isActive: true,
                  level: 3,
                  directReferrals: 1,
                  teamSize: 2,
                  joinDate: '2024-03-15'
                },
                children: [
                  {
                    name: '0x8901...2345',
                    attributes: {
                      id: '0x8901...2345',
                      package: 'Advanced',
                      earnings: '320.50',
                      isActive: false,
                      level: 4,
                      directReferrals: 0,
                      teamSize: 1,
                      joinDate: '2024-05-10'
                    }
                  }
                ]
              }
            ]
          },
          {
            name: '0x4567...8901',
            attributes: {
              id: '0x4567...8901',
              package: 'Premium',
              earnings: '1,100.75',
              isActive: true,
              level: 2,
              directReferrals: 1,
              teamSize: 3,
              joinDate: '2024-02-20'
            },
            children: [
              {
                name: '0x5678...9012',
                attributes: {
                  id: '0x5678...9012',
                  package: 'Advanced',
                  earnings: '675.50',
                  isActive: true,
                  level: 3,
                  directReferrals: 1,
                  teamSize: 2,
                  joinDate: '2024-03-25'
                },
                children: [
                  {
                    name: '0x9012...3456',
                    attributes: {
                      id: '0x9012...3456',
                      package: 'Standard',
                      earnings: '280.25',
                      isActive: true,
                      level: 4,
                      directReferrals: 0,
                      teamSize: 1,
                      joinDate: '2024-04-30'
                    }
                  }
                ]
              }
            ]
          },
          {
            name: '0x6789...0123',
            attributes: {
              id: '0x6789...0123',
              package: 'Standard',
              earnings: '320.25',
              isActive: true,
              level: 2,
              directReferrals: 0,
              teamSize: 1,
              joinDate: '2024-03-01'
            }
          }
        ]
      };
      
      setTreeData(mockTreeData);
      
    } catch (error) {
      console.error('Error fetching tree data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPackageColor = (packageType) => {
    switch (packageType) {
      case 'Premium': return '#FFD700';
      case 'Advanced': return '#FF6B35';
      case 'Standard': return '#7B2CBF';
      case 'Entry': return '#00D4FF';
      default: return '#B8C5D1';
    }
  };

  const renderCustomNode = useCallback(({ nodeDatum, toggleNode }) => {
    const isActive = nodeDatum.attributes?.isActive;
    const packageType = nodeDatum.attributes?.package;
    const earnings = nodeDatum.attributes?.earnings;
    const packageColor = getPackageColor(packageType);

    return (
      <g>
        {/* Node background circle */}
        <circle
          r={25}
          fill={isActive ? packageColor : '#gray'}
          stroke={isActive ? '#fff' : '#ccc'}
          strokeWidth={3}
          opacity={isActive ? 1 : 0.6}
          style={{ cursor: 'pointer' }}
          onClick={() => setSelectedNode(nodeDatum)}
        />
        
        {/* Node avatar/initial */}
        <text
          fill="#fff"
          textAnchor="middle"
          dy={5}
          fontSize={12}
          fontWeight="bold"
          style={{ cursor: 'pointer' }}
          onClick={() => setSelectedNode(nodeDatum)}
        >
          {nodeDatum.name.charAt(2)}
        </text>
        
        {/* Name label */}
        <text
          fill="#333"
          textAnchor="middle"
          y={40}
          fontSize={10}
          fontWeight="500"
        >
          {nodeDatum.name}
        </text>
        
        {/* Package label */}
        <text
          fill={packageColor}
          textAnchor="middle"
          y={52}
          fontSize={8}
          fontWeight="600"
        >
          {packageType}
        </text>
        
        {/* Earnings label */}
        <text
          fill="#666"
          textAnchor="middle"
          y={64}
          fontSize={8}
        >
          ${earnings}
        </text>
        
        {/* Expand/collapse button for nodes with children */}
        {nodeDatum.children && nodeDatum.children.length > 0 && (
          <g>
            <circle
              r={8}
              fill="#007bff"
              stroke="#fff"
              strokeWidth={2}
              cx={20}
              cy={-20}
              style={{ cursor: 'pointer' }}
              onClick={toggleNode}
            />
            <text
              fill="#fff"
              textAnchor="middle"
              dy={3}
              x={20}
              y={-20}
              fontSize={10}
              fontWeight="bold"
              style={{ cursor: 'pointer' }}
              onClick={toggleNode}
            >
              {nodeDatum.__rd3t.collapsed ? '+' : '−'}
            </text>
          </g>
        )}
        
        {/* Status indicator */}
        <circle
          r={4}
          fill={isActive ? '#10B981' : '#EF4444'}
          cx={-20}
          cy={-20}
        />
      </g>
    );
  }, []);

  const nodeSize = useMemo(() => ({ x: 200, y: 150 }), []);

  const treeConfig = useMemo(() => ({
    orientation: 'vertical',
    pathFunc: 'step',
    separation: { siblings: 1.2, nonSiblings: 1.5 },
    nodeSize,
    zoom: 0.8,
    enableLegacyTransitions: true,
    transitionDuration: 300,
    depthFactor: 150,
    scaleExtent: { min: 0.3, max: 2 },
    translate: treeTranslate
  }), [nodeSize, treeTranslate]);

  if (loading) {
    return (
      <div className="genealogy-tree-loading">
        <div className="loading-spinner"></div>
        <p>Loading network genealogy...</p>
      </div>
    );
  }

  const calculateTreeStats = (node) => {
    let totalMembers = 1;
    let activeMembers = node.attributes?.isActive ? 1 : 0;
    let totalEarnings = parseFloat(node.attributes?.earnings?.replace(',', '') || '0');

    if (node.children) {
      node.children.forEach(child => {
        const childStats = calculateTreeStats(child);
        totalMembers += childStats.total;
        activeMembers += childStats.active;
        totalEarnings += childStats.earnings;
      });
    }

    return { total: totalMembers, active: activeMembers, earnings: totalEarnings };
  };

  const stats = treeData ? calculateTreeStats(treeData) : { total: 0, active: 0, earnings: 0 };

  return (
    <div className="genealogy-tree-container">
      <div className="tree-header">
        <h2>Network Genealogy Tree</h2>
        <div className="tree-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <span className="stat-label">Total Members</span>
              <span className="stat-value">{stats.total}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-label">Active Members</span>
              <span className="stat-value">{stats.active}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <span className="stat-label">Network Volume</span>
              <span className="stat-value">${stats.earnings.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="tree-controls">
        <div className="legend">
          <div className="legend-item">
            <div className="legend-dot premium"></div>
            <span>Premium</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot advanced"></div>
            <span>Advanced</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot standard"></div>
            <span>Standard</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot entry"></div>
            <span>Entry</span>
          </div>
        </div>
        <div className="tree-instructions">
          <p>💡 Click nodes for details • Drag to pan • Scroll to zoom • Click +/- to expand/collapse</p>
        </div>
      </div>

      <div 
        className="tree-visualization"
        ref={setContainerRef}
        style={{ width: '100%', height: '600px' }}
      >
        {treeData && containerRef && (
          <Tree
            data={treeData}
            renderCustomNodeElement={renderCustomNode}
            {...treeConfig}
          />
        )}
      </div>

      {selectedNode && (
        <div className="member-details-panel">
          <div className="panel-header">
            <h3>Member Details</h3>
            <button 
              className="close-btn"
              onClick={() => setSelectedNode(null)}
            >
              ×
            </button>
          </div>
          <div className="panel-content">
            <div className="member-avatar" style={{ 
              background: getPackageColor(selectedNode.attributes?.package) 
            }}>
              {selectedNode.name.charAt(2)}
            </div>
            <div className="member-info">
              <div className="info-row">
                <span className="label">Address:</span>
                <span className="value">{selectedNode.attributes?.id}</span>
              </div>
              <div className="info-row">
                <span className="label">Package:</span>
                <span className="value package" style={{ 
                  color: getPackageColor(selectedNode.attributes?.package) 
                }}>
                  {selectedNode.attributes?.package}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Status:</span>
                <span className={`value status ${selectedNode.attributes?.isActive ? 'active' : 'inactive'}`}>
                  {selectedNode.attributes?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Earnings:</span>
                <span className="value earnings">${selectedNode.attributes?.earnings}</span>
              </div>
              <div className="info-row">
                <span className="label">Level:</span>
                <span className="value">{selectedNode.attributes?.level}</span>
              </div>
              <div className="info-row">
                <span className="label">Direct Referrals:</span>
                <span className="value">{selectedNode.attributes?.directReferrals}</span>
              </div>
              <div className="info-row">
                <span className="label">Team Size:</span>
                <span className="value">{selectedNode.attributes?.teamSize}</span>
              </div>
              <div className="info-row">
                <span className="label">Join Date:</span>
                <span className="value">{selectedNode.attributes?.joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenealogyTree;
